<?php

namespace Database\Seeders;

use App\Models\Proveedor;
use Illuminate\Database\Seeder;

class ProveedorSeeder extends Seeder
{
    public function run(): void
    {
        Proveedor::factory()
            ->count(500)
            ->create([
                'user_id' => 1,
                'owner_id' => 1,
            ]);
    }
}
