<?php

namespace App\Traits;

use App\Models\Asiento;
use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\Pedido;
use App\Models\Tesoreria;
use App\Models\Venta;
use App\Scopes\OwnerScope;

trait ErpSyncTrait
{
    /**
     * Sincroniza un pedido confirmado con el ERP (Ventas, Tesorería, Contabilidad).
     */
    public function syncPedidoToErp(Pedido $pedido)
    {
        $publicProfile = $pedido->publicProfile()->withoutGlobalScope(OwnerScope::class)->first();
        if (! $publicProfile) {
            return;
        }

        $vendedorId = $publicProfile->user_id;
        $vendedorOwnerId = $publicProfile->owner_id;

        // 1. Asegurar registro de Cliente para el Vendedor
        $clienteEmail = $pedido->cliente->email ?? "guest_{$pedido->id}@marketplace.com";
        $clienteErp = Cliente::withoutGlobalScope(OwnerScope::class)
            ->where('email', $clienteEmail)
            ->first();

        if (! $clienteErp) {
            $clienteErp = Cliente::withoutGlobalScope(OwnerScope::class)->create([
                'email' => $clienteEmail,
                'user_id' => $vendedorId,
                'nombre' => $pedido->nombre_cliente,
                'telefono' => $pedido->telefono_cliente ?? '',
                'direccion' => $pedido->direccion_cliente ?? '',
                'activo' => true,
                'owner_id' => $vendedorOwnerId,
            ]);
        }

        // 2. Mapear método de pago
        $metodoPagoErp = match (strtolower($pedido->metodo_pago ?? '')) {
            'efectivo' => 'efectivo',
            'tarjeta', 'debito', 'credito', 'webpay', 'paypal', 'mercadopago' => 'tarjeta',
            'transferencia' => 'transferencia',
            default => 'otro'
        };

        // 3. Crear Venta
        $venta = Venta::withoutGlobalScope(OwnerScope::class)->create([
            'numero_factura' => str_replace('PED-', 'VMT-', $pedido->numero_pedido),
            'cliente_id' => $clienteErp->id,
            'user_id' => $vendedorId,
            'owner_id' => $vendedorOwnerId,
            'fecha' => now(),
            'subtotal' => $pedido->subtotal,
            'iva' => $pedido->impuesto,
            'total' => $pedido->total,
            'metodo_pago' => $metodoPagoErp,
            'estado' => 'pagada',
            'notas' => "Originado desde Pedido Marketplace #{$pedido->numero_pedido}. ".($pedido->notas ?? ''),
        ]);

        // 4. Detalle de Venta
        foreach ($pedido->items as $item) {
            DetalleVenta::create([
                'venta_id' => $venta->id,
                'producto_id' => $item->producto_id,
                'cantidad' => $item->cantidad,
                'precio_unitario' => $item->precio_unitario,
                'subtotal' => $item->subtotal,
            ]);
        }

        // 5. Registro en Tesorería
        Tesoreria::withoutGlobalScope(OwnerScope::class)->create([
            'tipo' => 'ingreso',
            'monto' => $pedido->total,
            'cuenta' => 'Caja/Banco',
            'descripcion' => "Venta Marketplace - Pedido #{$pedido->numero_pedido}",
            'fecha' => now(),
            'user_id' => $vendedorId,
            'owner_id' => $vendedorOwnerId,
        ]);

        // 6. Asiento Contable
        $asiento = Asiento::withoutGlobalScope(OwnerScope::class)->create([
            'fecha' => now(),
            'numero' => 'AS-VMT-'.time(),
            'descripcion' => "Registro de venta marketplace #{$pedido->numero_pedido}",
            'tipo' => 'venta',
            'total_debe' => $pedido->total,
            'total_haber' => $pedido->total,
            'estado' => true,
            'owner_id' => $vendedorOwnerId,
        ]);

        // Detalles Contables
        $asiento->detalles()->create([
            'cuenta' => 'Caja/Banco', 'cuenta_codigo' => '1.1.01', 'debe' => $pedido->total, 'haber' => 0, 'owner_id' => $vendedorOwnerId,
        ]);

        $asiento->detalles()->create([
            'cuenta' => 'Ventas Marketplace', 'cuenta_codigo' => '4.1.01', 'debe' => 0, 'haber' => $pedido->subtotal, 'owner_id' => $vendedorOwnerId,
        ]);

        if ($pedido->impuesto > 0) {
            $asiento->detalles()->create([
                'cuenta' => 'IVA Débito Fiscal', 'cuenta_codigo' => '2.1.03', 'debe' => 0, 'haber' => $pedido->impuesto, 'owner_id' => $vendedorOwnerId,
            ]);
        }
    }
}
