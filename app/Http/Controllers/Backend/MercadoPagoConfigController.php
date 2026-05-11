<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\PaymentConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class MercadoPagoConfigController extends Controller
{
    public function index()
    {
        $config = PaymentConfig::where('owner_id', Auth::id())->first();

        return Inertia::render('Backend/Pagos/MercadoPagoConfig', [
            'config' => $config,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mercadopago_public_key' => 'required|string',
            'mercadopago_access_token' => 'nullable|string',
            'mercadopago_mode' => 'required|in:sandbox,live',
            'mercadopago_active' => 'boolean',
        ]);

        $config = PaymentConfig::firstOrNew(['owner_id' => Auth::id()]);

        // Mantener campos existentes de Webpay si ya existen
        if (! $config->exists) {
            $config->commerce_code = 'PRESET';
            $config->api_key = 'PRESET';
        }

        $config->mercadopago_public_key = $validated['mercadopago_public_key'];
        $config->mercadopago_mode = $validated['mercadopago_mode'];
        $config->mercadopago_active = $validated['mercadopago_active'] ?? false;

        if (! empty($validated['mercadopago_access_token'])) {
            $config->mercadopago_access_token = $validated['mercadopago_access_token'];
        } elseif (! $config->exists || empty($config->mercadopago_access_token)) {
            return back()->withErrors(['mercadopago_access_token' => 'El Access Token es requerido al configurar MercadoPago.']);
        }

        $config->save();

        return back()->with('success', 'Configuración de MercadoPago guardada exitosamente.');
    }

    public function testConnection(Request $request)
    {
        $accessToken = $request->input('mercadopago_access_token');

        if (empty($accessToken)) {
            $config = PaymentConfig::where('owner_id', Auth::id())->first();
            $accessToken = $config?->mercadopago_access_token;
        }

        if (empty($accessToken)) {
            return response()->json(['success' => false, 'message' => 'Faltan credenciales (Access Token).']);
        }

        try {
            $response = Http::withToken($accessToken)
                ->get('https://api.mercadopago.com/users/me');

            if ($response->successful()) {
                $user = $response->json();

                return response()->json([
                    'success' => true,
                    'message' => '¡Conexión exitosa! Cuenta conectada: '.($user['email'] ?? 'Aprobada').'.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No se pudo conectar a MercadoPago. Verifica tu Access Token.',
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Excepción durante la prueba: '.$e->getMessage(),
            ], 500);
        }
    }
}
