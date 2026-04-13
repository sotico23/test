<?php

namespace Database\Seeders;

use App\Models\Cotizacion;
use App\Models\Producto;
use Illuminate\Database\Seeder;

class CotizacionSeeder extends Seeder
{
    public function run(): void
    {
        $productos = Producto::all();

        Cotizacion::factory()
            ->count(500)
            ->create([
                'user_id' => 1,
                'owner_id' => 1,
            ])
            ->each(function ($cotizacion) use ($productos) {
                if ($productos->count() > 0) {
                    $detalles = [];
                    $subtotal = 0;
                    $cantItems = rand(1, 5);

                    for ($i = 0; $i < $cantItems; $i++) {
                        $producto = $productos->random();
                        $cantidad = rand(1, 10);
                        $precio = $producto->precio_venta;
                        $itemSubtotal = $cantidad * $precio;

                        $detalles[] = [
                            'producto_id' => $producto->id,
                            'descripcion' => $producto->nombre,
                            'cantidad' => $cantidad,
                            'precio' => $precio,
                        ];
                        $subtotal += $itemSubtotal;
                    }

                    $impuesto = round($subtotal * 0.19);
                    $total = $subtotal + $impuesto;

                    $cotizacion->update([
                        'detalles' => $detalles,
                        'subtotal' => (int) $subtotal,
                        'impuesto' => (int) $impuesto,
                        'total' => (int) $total,
                    ]);
                }
            });
    }
}
