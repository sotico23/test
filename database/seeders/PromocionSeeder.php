<?php

namespace Database\Seeders;

use App\Models\Promocion;
use App\Models\User;
use Illuminate\Database\Seeder;

class PromocionSeeder extends Seeder
{
    public function run(): void
    {
        $userId = User::first()?->id;

        Promocion::create([
            'user_id' => $userId,
            'nombre' => 'Black Friday',
            'tipo' => 'porcentaje',
            'valor' => 20,
            'descripcion' => '20% de descuento en toda la tienda',
            'skus' => null,
            'categoria_id' => null,
            'compra_minima' => 10000,
            'fecha_inicio' => now()->startOfMonth(),
            'fecha_fin' => now()->endOfMonth(),
            'activa' => true,
        ]);

        Promocion::create([
            'user_id' => $userId,
            'nombre' => 'Pack Gamer',
            'tipo' => 'precio_fijo',
            'valor' => 49990,
            'descripcion' => 'Pack de teclado y mouse gamer',
            'skus' => ['TCL-01', 'MS-02'],
            'categoria_id' => null,
            'compra_minima' => null,
            'fecha_inicio' => null,
            'fecha_fin' => null,
            'activa' => true,
        ]);

        Promocion::create([
            'user_id' => $userId,
            'nombre' => 'Martes de Locura',
            'tipo' => 'combo_2x1',
            'valor' => 0,
            'descripcion' => 'Compra 2, Paga 1 en accesorios de celular',
            'skus' => null,
            'categoria_id' => null,
            'compra_minima' => null,
            'fecha_inicio' => null,
            'fecha_fin' => null,
            'activa' => false,
        ]);
    }
}
