<?php

namespace Database\Seeders;

use App\Models\GastoProyecto;
use Illuminate\Database\Seeder;

class GastoProyectoSeeder extends Seeder
{
    public function run(): void
    {
        GastoProyecto::factory()
            ->count(500)
            ->create([
                'owner_id' => 1,
            ]);
    }
}
