<?php

namespace App\Http\Controllers;

use App\Models\Asiento;
use App\Models\Cliente;
use App\Models\Conversacion;
use App\Models\DetalleVenta;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Producto;
use App\Models\PublicProfile;
use App\Models\Tesoreria;
use App\Models\Venta;
use App\Scopes\OwnerScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PedidoController extends Controller
{
    public function crear(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'public_profile_id' => 'required|exists:public_profiles,id',
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'nombre_cliente' => 'required|string|max:255',
            'telefono_cliente' => 'nullable|string|max:50',
            'direccion_cliente' => 'nullable|string',
            'metodo_pago' => 'nullable|string|max:100',
            'notas' => 'nullable|string',
        ]);

        $publicProfile = PublicProfile::withoutGlobalScope(OwnerScope::class)->findOrFail($validated['public_profile_id']);

        $pedido = Pedido::create([
            'user_id' => $publicProfile->user_id,
            'public_profile_id' => $validated['public_profile_id'],
            'cliente_id' => Auth::id(),
            'numero_pedido' => Pedido::generarNumeroPedido(),
            'estado' => 'pendiente',
            'nombre_cliente' => $validated['nombre_cliente'],
            'telefono_cliente' => $validated['telefono_cliente'] ?? null,
            'direccion_cliente' => $validated['direccion_cliente'] ?? null,
            'metodo_pago' => $validated['metodo_pago'] ?? null,
            'notas' => $validated['notas'] ?? null,
        ]);

        $subtotal = 0;

        foreach ($validated['items'] as $item) {
            $producto = Producto::withoutGlobalScope(OwnerScope::class)->findOrFail($item['producto_id']);
            $cantidad = $item['cantidad'];
            $precio = $producto->precio_venta;
            $itemSubtotal = $precio * $cantidad;
            $subtotal += $itemSubtotal;

            PedidoItem::create([
                'pedido_id' => $pedido->id,
                'producto_id' => $producto->id,
                'nombre_producto' => $producto->nombre,
                'precio_unitario' => $precio,
                'cantidad' => $cantidad,
                'subtotal' => $itemSubtotal,
            ]);
        }

        $impuesto = $subtotal * 0.19;
        $total = $subtotal + $impuesto;

        $pedido->update([
            'subtotal' => $subtotal,
            'impuesto' => $impuesto,
            'total' => $total,
        ]);

        // --- ERP SYNC: Create Cliente and create Venta with Financials ---
        $vendedorId = $publicProfile->user_id;
        $vendedorOwnerId = $publicProfile->owner_id;
        $compradorLogueado = Auth::user();

        // Find or create Cliente for the Seller
        // We use the email provided in the auth or a fallback if it's a guest purchase
        $clienteErp = Cliente::withoutGlobalScope(OwnerScope::class)->updateOrCreate(
            ['email' => $compradorLogueado?->email ?? 'guest_'.time().'@marketplace.com', 'user_id' => $vendedorId],
            [
                'nombre' => $validated['nombre_cliente'],
                'telefono' => $validated['telefono_cliente'] ?? $compradorLogueado?->phone ?? '',
                'direccion' => $validated['direccion_cliente'] ?? '',
                'activo' => true,
                'owner_id' => $vendedorOwnerId,
            ]
        );

        // Map marketplace payment method to ERP enum: efectivo, tarjeta, transferencia, otro
        $metodoPagoErp = match (strtolower($validated['metodo_pago'] ?? '')) {
            'efectivo' => 'efectivo',
            'tarjeta', 'debito', 'credito' => 'tarjeta',
            'transferencia' => 'transferencia',
            default => 'otro'
        };

        // Create Venta record in ERP as 'pagada'
        $venta = Venta::withoutGlobalScope(OwnerScope::class)->create([
            'numero_factura' => str_replace('PED-', 'VMT-', $pedido->numero_pedido),
            'cliente_id' => $clienteErp->id,
            'user_id' => $vendedorId,
            'owner_id' => $vendedorOwnerId,
            'fecha' => now(),
            'subtotal' => $subtotal,
            'iva' => $impuesto,
            'total' => $total,
            'metodo_pago' => $metodoPagoErp,
            'estado' => 'pagada',
            'notas' => "Originado desde Pedido Marketplace #{$pedido->numero_pedido}. ".($validated['notas'] ?? ''),
        ]);

        // Sync items to DetalleVenta
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
        Tesoreria::withoutGlobalScope(OwnerScope::class)->create([
            'tipo' => 'ingreso',
            'monto' => $total,
            'cuenta' => 'Caja/Banco',
            'descripcion' => "Venta Marketplace - Pedido #{$pedido->numero_pedido}",
            'fecha' => now(),
            'referencia' => $venta->numero_factura,
            'owner_id' => $vendedorOwnerId,
        ]);

        // 2. Registro Contable (Asiento Diario)
        $asiento = Asiento::withoutGlobalScope(OwnerScope::class)->create([
            'user_id' => $vendedorId,
            'owner_id' => $vendedorOwnerId,
            'fecha' => now(),
            'numero' => 'AS-VMT-'.time(),
            'descripcion' => "Registro de venta marketplace #{$pedido->numero_pedido}",
            'tipo' => 'venta',
            'total_debe' => $total,
            'total_haber' => $total,
            'estado' => true,
        ]);

        // Detalle 1: Ingreso a Caja/Banco (Debe)
        $asiento->detalles()->create([
            'cuenta' => 'Caja/Banco',
            'cuenta_codigo' => '1.1.01',
            'descripcion' => 'Ingreso por venta marketplace',
            'debe' => $total,
            'haber' => 0,
            'owner_id' => $vendedorOwnerId,
        ]);

        // Detalle 2: Ingreso por Ventas (Haber - Subtotal)
        $asiento->detalles()->create([
            'cuenta' => 'Ventas Marketplace',
            'cuenta_codigo' => '4.1.01',
            'descripcion' => 'Venta de productos',
            'debe' => 0,
            'haber' => $subtotal,
            'owner_id' => $vendedorOwnerId,
        ]);

        // Detalle 3: IVA por Pagar (Haber - Impuesto)
        if ($impuesto > 0) {
            $asiento->detalles()->create([
                'cuenta' => 'IVA Débito Fiscal',
                'cuenta_codigo' => '2.1.03',
                'descripcion' => 'Impuesto sobre ventas',
                'debe' => 0,
                'haber' => $impuesto,
                'owner_id' => $vendedorOwnerId,
            ]);
        }
        // --- END ERP SYNC ---

        Conversacion::create([
            'pedido_id' => $pedido->id,
            'public_profile_id' => $validated['public_profile_id'],
            'comprador_id' => Auth::id(), // Allow null for guests
            'vendedor_id' => $vendedorId,
            'titulo' => "Pedido #{$pedido->numero_pedido}",
        ]);

        return redirect()->route('tienda.confirmacion', [
            'slug' => $publicProfile->slug,
            'pedido' => $pedido->id,
        ]);
    }

    public function confirmacion(string $slug, int $pedidoId): Response
    {
        $pedido = Pedido::with(['items', 'publicProfile' => function ($query) {
            $query->withoutGlobalScope(OwnerScope::class);
        }])
            ->where('id', $pedidoId)
            ->where('cliente_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('marketplace/Confirmacion', [
            'pedido' => $pedido,
            'tienda' => $pedido->publicProfile,
        ]);
    }

    public function misPedidos(): Response
    {
        $userId = Auth::id();

        $compras = Pedido::with([
            'publicProfile' => function ($query) {
                $query->withoutGlobalScope(OwnerScope::class)->select('id', 'user_id', 'owner_id', 'title', 'slug');
            },
            'items',
            'conversacion',
        ])
            ->where('cliente_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $ventas = Pedido::with([
            'publicProfile' => function ($query) {
                $query->withoutGlobalScope(OwnerScope::class)->select('id', 'user_id', 'owner_id', 'title', 'slug');
            },
            'items',
            'conversacion',
            'cliente:id,name',
        ])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Debug: ensure relations are loaded
        foreach ($ventas as $pedido) {
            if (! $pedido->relationLoaded('publicProfile')) {
                $pedido->load('publicProfile');
            }
        }

        return Inertia::render('marketplace/MisPedidos', [
            'compras' => $compras,
            'ventas' => $ventas,
        ]);
    }

    public function verPedido(Pedido $pedido): Response
    {
        if ($pedido->cliente_id !== Auth::id() && $pedido->user_id !== Auth::id()) {
            abort(403);
        }

        $pedido->load([
            'items',
            'publicProfile' => function ($query) {
                $query->withoutGlobalScope(OwnerScope::class);
            },
            'conversacion' => function ($query) {
                $query->with(['mensajes' => function ($q) {
                    $q->with('sender:id,name,profile_photo_path')->orderBy('created_at', 'asc');
                }]);
            },
            'cliente:id,name',
        ]);

        return Inertia::render('marketplace/PedidoDetalle', [
            'pedido' => $pedido,
        ]);
    }

    public function estado(Pedido $pedido): array
    {
        if ($pedido->cliente_id !== Auth::id() && $pedido->user_id !== Auth::id()) {
            abort(403);
        }

        return [
            'estado' => $pedido->estado,
            'historial' => $this->getHistorialEstado($pedido),
        ];
    }

    private function getHistorialEstado(Pedido $pedido): array
    {
        $estados = [
            'pendiente' => ['label' => 'Pedido recibido', 'icon' => 'clock', 'color' => 'yellow'],
            'confirmado' => ['label' => 'Confirmado', 'icon' => 'check', 'color' => 'blue'],
            'preparando' => ['label' => 'En preparación', 'icon' => 'package', 'color' => 'orange'],
            'enviado' => ['label' => 'Enviado', 'icon' => 'truck', 'color' => 'purple'],
            'entregado' => ['label' => 'Entregado', 'icon' => 'check-circle', 'color' => 'green'],
            'cancelado' => ['label' => 'Cancelado', 'icon' => 'x', 'color' => 'red'],
        ];

        $pedidoEstado = array_search($pedido->estado, array_keys($estados));

        return collect($estados)->map(function ($item, $idx) use ($pedidoEstado) {
            return array_merge($item, [
                'completado' => $idx <= $pedidoEstado,
                'actual' => $idx === $pedidoEstado,
            ]);
        })->values()->toArray();
    }
}
