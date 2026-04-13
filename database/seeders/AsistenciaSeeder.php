<?php

namespace Database\Seeders;

use App\Models\Asistencia;
use App\Models\Empleado;
use Illuminate\Database\Seeder;

class AsistenciaSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have some active employees
        if (Empleado::count() === 0) {
            Empleado::factory()->count(50)->create(['estado' => 'activo']);
        }

        $empleados = Empleado::pluck('id')->toArray();

        for ($i = 0; $i < 500; $i++) {
            Asistencia::factory()->create([
                'empleado_id' => fake()->randomElement($empleados),
                'estado' => fake()->randomElement(['presente', 'ausente', 'tarde', 'permiso', 'vacacion']), // Matching frontend states
            ]);
        }
    }
}
