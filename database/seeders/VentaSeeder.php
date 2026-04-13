<?php

namespace Database\Seeders;

use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Database\Seeder;

class VentaSeeder extends Seeder
{
    public function run(): void
    {
        Venta::factory()
            ->count(500)
            ->create([
                'user_id' => 1,
                'owner_id' => 1,
            ])
            ->each(function ($venta) {
                // Agregar entre 1 y 5 productos a cada venta
                $productos = Producto::all();
                if ($productos->count() > 0) {
                    $cantItems = rand(1, 5);
                    for ($i = 0; $i < $cantItems; $i++) {
                        $producto = $productos->random();
                        $cantidad = rand(1, 10);
                        $precio_unitario = $producto->precio_venta;
                        $subtotal = $cantidad * $precio_unitario;

                        DetalleVenta::create([
                            'venta_id' => $venta->id,
                            'producto_id' => $producto->id,
                            'cantidad' => $cantidad,
                            'precio_unitario' => $precio_unitario,
                            'subtotal' => $subtotal,
                        ]);
                    }

                    // Recalcular totales de la venta
                    $subtotalVenta = $venta->detalleVentas()->sum('subtotal');
                    $ivaVenta = round($subtotalVenta * 0.19);
                    $venta->update([
                        'subtotal' => (int) $subtotalVenta,
                        'iva' => (int) $ivaVenta,
                        'total' => (int) ($subtotalVenta + $ivaVenta),
                    ]);
                }
            });
    }
}
