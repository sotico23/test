<?php

namespace App\Http\Controllers\Backend;

use App\Events\PaymentSuccessful;
use App\Http\Controllers\Controller;
use App\Models\WebpayTransaction;
use App\Services\WebpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WebpayController extends Controller
{
    protected $webpayService;

    public function __construct(WebpayService $webpayService)
    {
        $this->webpayService = $webpayService;
    }

    public function pay(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required',
            'amount' => 'required|numeric|min:1',
            'owner_id' => 'required',
        ]);

        $ownerId = $request->input('owner_id');
        $amount = (float) $request->input('amount');
        $buyOrder = 'ORD-'.time().'-'.rand(100, 999);
        $sessionId = session()->getId();
        $returnUrl = route('webpay.callback');

        try {
            // Initiate Webpay Transaction
            $response = $this->webpayService->createTransaction(
                $buyOrder,
                $sessionId,
                $amount,
                $returnUrl,
                $ownerId
            );

            // Register Transaction in Database
            WebpayTransaction::create([
                'owner_id' => $ownerId,
                'token' => $response->getToken(),
                'amount' => $amount,
                'status' => 'pending',
                'buy_order' => $buyOrder,
            ]);

            // Save essential data to session
            session(['webpay_pending' => [
                'owner_id' => $ownerId,
                'amount' => $amount,
                'buy_order' => $buyOrder,
                'invoice_id' => $request->invoice_id,
            ]]);

            // Return a view instructing the browser to execute a POST redirect
            return view('webpay.redirect', [
                'url' => $response->getUrl(),
                'token' => $response->getToken(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error starting Webpay translation: '.$e->getMessage());

            return Inertia::render('Backend/Pagos/WebpayResult', [
                'success' => false,
                'error' => 'No fue posible conectar con Transbank. Revise sus credenciales.',
            ]);
        }
    }

    public function callback(Request $request)
    {
        $tokenWs = $request->input('token_ws'); // When returning normally
        $tokenTb = $request->input('TBK_TOKEN'); // When the user aborted

        $sessionData = session('webpay_pending');
        session()->forget('webpay_pending');

        if (! $sessionData) {
            Log::error('Session data missing in Webpay callback.');

            return Inertia::render('Backend/Pagos/WebpayResult', [
                'success' => false,
                'error' => 'Transacción interrumpida o sesión expirada.',
            ]);
        }

        $ownerId = $sessionData['owner_id'];
        $originalAmount = $sessionData['amount'];

        if ($tokenTb) {
            $transaction = WebpayTransaction::where('token', $tokenTb)->first();
            if ($transaction) {
                $transaction->update(['status' => 'failed', 'transbank_response' => ['aborted' => true]]);
            }

            return Inertia::render('Backend/Pagos/WebpayResult', [
                'success' => false,
                'error' => 'Has anulado el pago de manera voluntaria.',
            ]);
        }

        if (! $tokenWs) {
            return Inertia::render('Backend/Pagos/WebpayResult', [
                'success' => false,
                'error' => 'Transacción sin Token válido.',
            ]);
        }

        try {
            $response = $this->webpayService->confirmTransaction($tokenWs, $ownerId);
            $transaction = WebpayTransaction::where('token', $tokenWs)->first();

            if (! $transaction) {
                throw new \Exception('Transacción tokenizada no registrada localmente.');
            }

            $responseAmount = $response->getAmount();
            $status = $response->getStatus();
            $vci = $response->getVci(); // TSY is standard Authentication success

            // Security Validation
            if ((float) $responseAmount !== (float) $originalAmount) {
                Log::warning("Webpay: Posible manipulación de montos. Req: {$originalAmount}, Res: {$responseAmount}");
                $transaction->update(['status' => 'failed', 'transbank_response' => ['error' => 'Monto discrepante']]);

                return Inertia::render('Backend/Pagos/WebpayResult', [
                    'success' => false,
                    'error' => 'El monto cancelado fue modificado y no coincide con la tarifa original.',
                ]);
            }

            if ($status === 'AUTHORIZED' && in_array($vci, ['TSY', 'TSN'])) {
                $transaction->update([
                    'status' => 'approved',
                    'transbank_response' => [
                        'authorization_code' => $response->getAuthorizationCode(),
                        'payment_type' => $response->getPaymentTypeCode(),
                        'installments' => $response->getInstallmentsNumber(),
                    ],
                ]);

                // Fire success event (for listening workers to mark invoices as Paid)
                event(new PaymentSuccessful($transaction));

                return Inertia::render('Backend/Pagos/WebpayResult', [
                    'success' => true,
                    'details' => [
                        'buy_order' => $transaction->buy_order,
                        'amount' => $transaction->amount,
                        'auth_code' => $response->getAuthorizationCode(),
                    ],
                ]);

            } else {
                $transaction->update([
                    'status' => 'failed',
                    'transbank_response' => [
                        'status' => $status,
                        'vci' => $vci,
                    ],
                ]);

                return Inertia::render('Backend/Pagos/WebpayResult', [
                    'success' => false,
                    'error' => 'Transacción Rechazada por Transbank u operador de tarjeta.',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Webpay Validation Exception: '.$e->getMessage());

            return Inertia::render('Backend/Pagos/WebpayResult', [
                'success' => false,
                'error' => 'Error validando u homologando el pago.',
            ]);
        }
    }
}
