<?php

namespace App\Http\Controllers;

use App\Models\PaymentConfig;
use App\Models\Pedido;
use App\Scopes\OwnerScope;
use App\Traits\ErpSyncTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PayPalController extends Controller
{
    use ErpSyncTrait;

    /**
     * Get PayPal credentials for the store owner.
     *
     * @return array{client_id: string, client_secret: string, mode: string}
     */
    private function getCredentials(int $ownerId): array
    {
        $config = PaymentConfig::withoutGlobalScope(OwnerScope::class)
            ->where('owner_id', $ownerId)
            ->where('paypal_active', true)
            ->firstOrFail();

        return [
            'client_id' => $config->paypal_client_id,
            'client_secret' => $config->paypal_client_secret,
            'mode' => $config->paypal_mode,
        ];
    }

    /**
     * Get the PayPal API base URL based on mode.
     */
    private function getBaseUrl(string $mode): string
    {
        return $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    /**
     * Obtain an access token from PayPal.
     */
    private function getAccessToken(array $credentials): string
    {
        $baseUrl = $this->getBaseUrl($credentials['mode']);

        $response = Http::timeout(15)
            ->connectTimeout(5)
            ->asForm()
            ->withBasicAuth($credentials['client_id'], $credentials['client_secret'])
            ->post("{$baseUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->failed()) {
            Log::error('PayPal: Failed to obtain access token', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new \RuntimeException('No se pudo obtener el token de acceso de PayPal.');
        }

        return $response->json('access_token');
    }

    /**
     * Create a PayPal order and redirect the user for approval.
     */
    public function pay(int $pedidoId)
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        // Ensure the pedido belongs to the current authenticated user
        if ($pedido->cliente_id !== auth()->id()) {
            abort(403, 'No autorizado.');
        }

        // Prevent double-pay on already completed orders
        if ($pedido->payment_status === 'completed') {
            $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

            return redirect()->route('tienda.confirmacion', [
                'slug' => $slug,
                'pedidoId' => $pedido->id,
            ])->with('info', 'Este pedido ya fue pagado.');
        }

        try {
            $credentials = $this->getCredentials($pedido->owner_id ?? $pedido->user_id);
            $accessToken = $this->getAccessToken($credentials);
            $baseUrl = $this->getBaseUrl($credentials['mode']);

            // Build the PayPal order
            $response = Http::timeout(15)
                ->connectTimeout(5)
                ->withToken($accessToken)
                ->post("{$baseUrl}/v2/checkout/orders", [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'amount' => [
                                'currency_code' => 'USD',
                                'value' => number_format((float) $pedido->total, 2, '.', ''),
                            ],
                            'reference_id' => $pedido->numero_pedido,
                            'description' => "Pedido #{$pedido->numero_pedido}",
                        ],
                    ],
                    'application_context' => [
                        'brand_name' => config('app.name', 'Marketplace'),
                        'return_url' => route('paypal.success', ['pedidoId' => $pedido->id]),
                        'cancel_url' => route('paypal.cancel', ['pedidoId' => $pedido->id]),
                        'user_action' => 'PAY_NOW',
                    ],
                ]);

            if ($response->failed()) {
                Log::error('PayPal: Failed to create order', [
                    'pedido_id' => $pedido->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->redirectWithError($pedido, 'Error al crear la orden en PayPal. Intenta de nuevo.');
            }

            $order = $response->json();

            $pedido->update([
                'payment_id' => $order['id'],
                'payment_status' => 'created',
            ]);

            // Find the approval URL
            $approveUrl = collect($order['links'] ?? [])
                ->firstWhere('rel', 'approve');

            if ($approveUrl) {
                return Inertia::location($approveUrl['href']);
            }

            Log::error('PayPal: No approval link found in order response', [
                'pedido_id' => $pedido->id,
                'order' => $order,
            ]);

            return $this->redirectWithError($pedido, 'No se encontró el enlace de aprobación de PayPal.');

        } catch (\Exception $e) {
            Log::error('PayPal: Exception during pay', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);

            return $this->redirectWithError($pedido, 'Error al procesar el pago con PayPal: '.$e->getMessage());
        }
    }

    /**
     * Handle the return from PayPal after user approval. Captures the payment.
     */
    public function success(Request $request, int $pedidoId): RedirectResponse
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        $paypalOrderId = $request->query('token');

        if (! $paypalOrderId) {
            return $this->redirectWithError($pedido, 'Token de PayPal no recibido.');
        }

        try {
            $credentials = $this->getCredentials($pedido->owner_id ?? $pedido->user_id);
            $accessToken = $this->getAccessToken($credentials);
            $baseUrl = $this->getBaseUrl($credentials['mode']);

            // Capture the payment
            $response = Http::timeout(30)
                ->connectTimeout(5)
                ->withToken($accessToken)
                ->withBody('{}', 'application/json')
                ->post("{$baseUrl}/v2/checkout/orders/{$paypalOrderId}/capture");

            if ($response->failed()) {
                Log::error('PayPal: Failed to capture payment', [
                    'pedido_id' => $pedido->id,
                    'paypal_order_id' => $paypalOrderId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->redirectWithError($pedido, 'No se pudo capturar el pago de PayPal.');
            }

            $capture = $response->json();
            $captureStatus = $capture['status'] ?? 'UNKNOWN';

            if ($captureStatus !== 'COMPLETED') {
                Log::warning('PayPal: Capture status not COMPLETED', [
                    'pedido_id' => $pedido->id,
                    'status' => $captureStatus,
                    'capture' => $capture,
                ]);

                $pedido->update([
                    'payment_status' => strtolower($captureStatus),
                    'payment_data' => $capture,
                ]);

                return $this->redirectWithError($pedido, "El pago no fue completado. Estado: {$captureStatus}");
            }

            // Payment successful
            $pedido->update([
                'payment_status' => 'completed',
                'estado' => 'confirmado',
                'payment_data' => $capture,
                'fecha_confirmacion' => now(),
            ]);

            // Sync with ERP
            $this->syncPedidoToErp($pedido);

            $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

            return redirect()->route('tienda.confirmacion', [
                'slug' => $slug,
                'pedidoId' => $pedido->id,
            ])->with('success', '¡Pago realizado exitosamente con PayPal!');

        } catch (\Exception $e) {
            Log::error('PayPal: Exception during capture', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);

            return $this->redirectWithError($pedido, 'Error al capturar el pago: '.$e->getMessage());
        }
    }

    /**
     * Handle cancellation from PayPal.
     */
    public function cancel(int $pedidoId): RedirectResponse
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        $pedido->update(['payment_status' => 'cancelled']);

        $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

        return redirect()->route('marketplace.show', $slug)
            ->with('error', 'El pago con PayPal ha sido cancelado. Puedes intentarlo de nuevo.');
    }

    /**
     * Helper to redirect back to the store with an error message.
     */
    private function redirectWithError(Pedido $pedido, string $message): RedirectResponse
    {
        $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug ?? 'marketplace';

        return redirect()->route('marketplace.show', $slug)
            ->with('error', $message);
    }
}
