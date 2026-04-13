<?php

namespace Database\Factories;

use App\Models\ApiKey;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApiKeyFactory extends Factory
{
    protected $model = ApiKey::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->randomElement(['Production', 'Development', 'Testing', 'Staging']).' Key',
            'clave' => fake()->sha256(),
            'permisos' => json_encode(['read', 'write']),
            'fecha_expiracion' => fake()->dateTimeBetween('now', '+1 year'),
            'activo' => true,
        ];
    }
}
