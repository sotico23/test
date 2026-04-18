<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionsSeeder::class,
            UsersTestSeeder::class,
            //  CategoriaSeeder::class ,
            // DataSeeder::class ,
            // MassiveDataSeeder::class,
            // VentaSeeder::class,
            // CotizacionSeeder::class,
            // ClienteSeeder::class,
            // ProveedorSeeder::class,
        ]);
    }
}
