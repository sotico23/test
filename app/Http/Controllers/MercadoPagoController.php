<?php

namespace App\Http\Controllers;

use App\Models\PaymentConfig;
use App\Models\Pedido;
use App\Scopes\OwnerScope;
use App\Traits\ErpSyncTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MercadoPagoController extends Controller
{
    use ErpSyncTrait;

    protected function getCredentials(int $ownerId)
    {
        $config = PaymentConfig::where('owner_id', $ownerId)->first();

        if (! $config || ! $config->mercadopago_active || ! $config->mercadopago_access_token) {
            throw new \Exception('La configuración de MercadoPago no está completa o activa.');
        }

        return [
            'access_token' => $config->mercadopago_access_token,
            'mode' => $config->mercadopago_mode, // live | sandbox
        ];
    }

    protected function redirectWithError(Pedido $pedido, string $error)
    {
        $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

        return redirect()->route('tienda.confirmacion', [
            'slug' => $slug,
            'pedidoId' => $pedido->id,
        ])->with('error', $error);
    }

    public function pay(int $pedidoId)
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        if ($pedido->payment_status === 'completed') {
            $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

            return redirect()->route('tienda.confirmacion', [
                'slug' => $slug,
                'pedidoId' => $pedido->id,
            ])->with('info', 'Este pedido ya fue pagado.');
        }

        try {
            $credentials = $this->getCredentials($pedido->owner_id ?? $pedido->user_id);
            $accessToken = $credentials['access_token'];

            $url = 'https://api.mercadopago.com/checkout/preferences';

            $response = Http::timeout(15)
                ->connectTimeout(5)
                ->withToken($accessToken)
                ->post($url, [
                    'items' => [
                        [
                            'title' => "Pedido #{$pedido->numero_pedido}",
                            'quantity' => 1,
                            'unit_price' => (float) $pedido->total,
                            'currency_id' => 'CLP',
                        ],
                    ],
                    'payer' => [
                        'name' => $pedido->nombre_cliente,
                        'email' => $pedido->cliente->email ?? 'correo@cliente.cl',
                    ],
                    'back_urls' => [
                        'success' => route('mercadopago.success', ['pedidoId' => $pedido->id]),
                        'failure' => route('mercadopago.failure', ['pedidoId' => $pedido->id]),
                        'pending' => route('mercadopago.pending', ['pedidoId' => $pedido->id]),
                    ],
                    'auto_return' => 'approved',
                    'external_reference' => (string) $pedido->numero_pedido,
                ]);

            if ($response->failed()) {
                Log::error('MercadoPago: Failed to create preference', [
                    'pedido_id' => $pedido->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->redirectWithError($pedido, 'Error al crear el pago en MercadoPago.');
            }

            $preference = $response->json();

            $pedido->update([
                'payment_id' => $preference['id'],
                'payment_status' => 'created',
            ]);

            $initPoint = $credentials['mode'] === 'sandbox'
                ? $preference['sandbox_init_point']
                : $preference['init_point'];

            return Inertia::location($initPoint);

        } catch (\Exception $e) {
            Log::error('MercadoPago: Exception during pay', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);

            return $this->redirectWithError($pedido, 'Error al procesar el pago con MercadoPago: '.$e->getMessage());
        }
    }

    public function success(Request $request, int $pedidoId)
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        $paymentStatus = $request->query('status');

        if ($paymentStatus !== 'approved') {
            return $this->redirectWithError($pedido, 'El pago no fue aprobado por MercadoPago.');
        }

        try {
            $pedido->update([
                'payment_status' => 'completed',
                'estado' => 'confirmado',
                'payment_data' => $request->all(),
                'fecha_confirmacion' => now(),
            ]);

            $this->syncPedidoToErp($pedido);

            $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

            return redirect()->route('tienda.confirmacion', [
                'slug' => $slug,
                'pedidoId' => $pedido->id,
            ])->with('success', '¡Pago realizado exitosamente con MercadoPago!');

        } catch (\Exception $e) {
            Log::error('MercadoPago: Exception during success sync', [
                'pedido_id' => $pedido->id,
                'error' => $e->getMessage(),
            ]);

            return $this->redirectWithError($pedido, 'Error al procesar la confirmación: '.$e->getMessage());
        }
    }

    public function failure(Request $request, int $pedidoId)
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        $pedido->update([
            'payment_status' => 'failed',
            'estado' => 'cancelado',
            'payment_data' => $request->all(),
        ]);

        return $this->redirectWithError($pedido, 'El pago fue rechazado por MercadoPago o cancelado.');
    }

    public function pending(Request $request, int $pedidoId)
    {
        $pedido = Pedido::withoutGlobalScope(OwnerScope::class)->findOrFail($pedidoId);

        $pedido->update([
            'payment_status' => 'pending',
            'payment_data' => $request->all(),
        ]);

        $slug = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first()?->slug;

        return redirect()->route('tienda.confirmacion', [
            'slug' => $slug,
            'pedidoId' => $pedido->id,
        ])->with('info', 'El pago ha quedado pendiente de confirmación en MercadoPago.');
    }
}
