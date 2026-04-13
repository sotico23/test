<?php

namespace Database\Seeders;

use App\Models\Vehiculo;
use Illuminate\Database\Seeder;

class VehiculoTrackingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vehiculos = Vehiculo::all();

        if ($vehiculos->isEmpty()) {
            Vehiculo::create([
                'placa' => 'AB-1234',
                'marca' => 'Toyota',
                'modelo' => 'Hilux',
                'tipo' => 'Camioneta',
                'año' => 2023,
                'color' => 'Blanco',
                'lat' => -33.4489,
                'lng' => -70.6693,
                'velocidad' => 45,
                'ultima_actualizacion' => now(),
                'estado' => 'en_ruta',
                'kilometraje' => 15000,
            ]);

            Vehiculo::create([
                'placa' => 'CD-5678',
                'marca' => 'Mercedes',
                'modelo' => 'Sprinter',
                'tipo' => 'Furgón',
                'año' => 2022,
                'color' => 'Gris',
                'lat' => -33.4567,
                'lng' => -70.6482,
                'velocidad' => 0,
                'ultima_actualizacion' => now(),
                'estado' => 'disponible',
                'kilometraje' => 45000,
            ]);
        } else {
            foreach ($vehiculos as $v) {
                $v->update([
                    'lat' => -33.4489 + (rand(-50, 50) / 1000),
                    'lng' => -70.6693 + (rand(-50, 50) / 1000),
                    'velocidad' => rand(0, 80),
                    'ultima_actualizacion' => now(),
                ]);
            }
        }
    }
}
