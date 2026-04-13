<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Asiento;
use App\Models\DetalleVenta;
use App\Models\Pedido;
use App\Models\Tesoreria;
use App\Models\Venta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PedidoRecibidoController extends Controller
{
    public function index(): Response
    {
        // Obtener pedidos dirigidos al usuario actual (el dueño del perfil público)
        $userId = Auth::id();

        $pedidos = Pedido::query()
            ->with(['cliente', 'items'])
            ->where(function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Backend/PedidosRecibidos/Index', [
            'pedidos' => $pedidos,
        ]);
    }

    public function show(Pedido $pedido): Response
    {
        // Solo puede verlo el dueño del perfil o el cliente
        if ($pedido->user_id !== Auth::id()) {
            abort(403);
        }

        $pedido->load('items', 'cliente', 'conversacion.mensajes.sender');

        return Inertia::render('Backend/PedidosRecibidos/Show', [
            'pedido' => $pedido,
        ]);
    }

    public function actualizarEstado(Request $request, Pedido $pedido): RedirectResponse
    {
        if ($pedido->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,confirmado,preparando,enviado,entregado,cancelado',
        ]);

        $pedido->update(['estado' => $validated['estado']]);

        return redirect()->back();
    }

    public function generarVenta(Pedido $pedido): RedirectResponse
    {
        if ($pedido->user_id !== Auth::id()) {
            abort(403);
        }

        if ($pedido->estado === 'cancelado') {
            return redirect()->back()->withErrors(['error' => 'No se puede generar venta de un pedido cancelado.']);
        }

        DB::beginTransaction();

        try {
            $venta = Venta::create([
                'numero_factura' => 'V-'.$pedido->numero_pedido,
                'cliente_id' => $pedido->cliente_id,
                'fecha' => now(),
                'subtotal' => $pedido->subtotal,
                'iva' => $pedido->impuesto,
                'total' => $pedido->total,
                'estado' => 'pagada',
                'notas' => 'Generado automáticamente desde Pedido #'.$pedido->numero_pedido,
            ]);

            foreach ($pedido->items as $item) {
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $item->producto_id,
                    'cantidad' => $item->cantidad,
                    'precio_unitario' => $item->precio_unitario,
                    'subtotal' => $item->subtotal,
                ]);
            }

            // --- FINANZAS SYNC: Tesorería y Contabilidad ---

            // 1. Registro en Tesorería (Flujo de Caja)
            Tesoreria::create([
                'tipo' => 'ingreso',
                'monto' => $pedido->total,
                'descripcion' => "Venta Marketplace - Pedido #{$pedido->numero_pedido}",
                'fecha' => now(),
                'referencia' => $venta->numero_factura,
                'categoria' => 'Ventas Marketplace',
                'estado' => 'completado',
            ]);

            // 2. Registro Contable (Asiento Diario)
            $asiento = Asiento::create([
                'fecha' => now(),
                'numero' => 'AS-VMT-'.time(),
                'descripcion' => "Registro de venta marketplace #{$pedido->numero_pedido}",
                'tipo' => 'venta',
                'total_debe' => $pedido->total,
                'total_haber' => $pedido->total,
                'estado' => true,
            ]);

            // Detalle 1: Ingreso a Caja/Banco (Debe)
            $asiento->detalles()->create([
                'cuenta' => 'Caja/Banco',
                'cuenta_codigo' => '1.1.01',
                'descripcion' => 'Ingreso por venta marketplace',
                'debe' => $pedido->total,
                'haber' => 0,
            ]);

            // Detalle 2: Ingreso por Ventas (Haber - Subtotal)
            $asiento->detalles()->create([
                'cuenta' => 'Ventas Marketplace',
                'cuenta_codigo' => '4.1.01',
                'descripcion' => 'Venta de productos',
                'debe' => 0,
                'haber' => $pedido->subtotal,
            ]);

            // Detalle 3: IVA por Pagar (Haber - Impuesto)
            if ($pedido->impuesto > 0) {
                $asiento->detalles()->create([
                    'cuenta' => 'IVA Débito Fiscal',
                    'cuenta_codigo' => '2.1.03',
                    'descripcion' => 'Impuesto sobre ventas',
                    'debe' => 0,
                    'haber' => $pedido->impuesto,
                ]);
            }
            // --- FIN FINANZAS SYNC ---

            DB::commit();

            return redirect()->route('ventas.index');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['error' => 'Error al generar la venta: '.$e->getMessage()]);
        }
    }
}
