<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Cotizacion;
use Illuminate\Database\Eloquent\Factories\Factory;

class CotizacionFactory extends Factory
{
    protected $model = Cotizacion::class;

    public function definition(): array
    {
        return [
            'numero' => fake()->unique()->numerify('COT-########'),
            'cliente_id' => Cliente::all()->random()->id ?? Cliente::factory(),
            'user_id' => 1,
            'owner_id' => 1,
            'fecha' => fake()->dateTimeBetween('-3 months', 'now'),
            'fecha_validez' => fake()->dateTimeBetween('now', '+30 days'),
            'subtotal' => (int) fake()->numberBetween(50000, 5000000),
            'impuesto' => (int) fake()->numberBetween(9500, 950000),
            'total' => (int) fake()->numberBetween(59500, 5950000),
            'estado' => fake()->randomElement(['borrador', 'enviada', 'aprobada', 'rechazada']),
            'condiciones' => fake()->paragraph(),
            'notas' => fake()->optional()->sentence(),
        ];
    }
}
