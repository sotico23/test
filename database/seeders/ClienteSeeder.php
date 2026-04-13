<?php

namespace Database\Seeders;

use App\Models\Cliente;
use Illuminate\Database\Seeder;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        Cliente::factory()
            ->count(500)
            ->create([
                'user_id' => null,
                'owner_id' => 1,
            ]);
    }
}
