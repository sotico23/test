<?php

namespace Database\Factories;

use App\Models\Inventario;
use Illuminate\Database\Eloquent\Factories\Factory;

class InventarioFactory extends Factory
{
    protected $model = Inventario::class;

    public function definition(): array
    {
        return [
            'producto_id' => fake()->numberBetween(1, 50),
            'cantidad' => fake()->randomFloat(3, 0, 1000),
            'cantidad_minima' => fake()->randomFloat(3, 5, 100),
            'ubicacion' => 'Estante '.fake()->randomLetter().'-'.fake()->numberBetween(1, 20),
        ];
    }
}
