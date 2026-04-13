<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password123');

        // Super Admin
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@erp.com'],
            [
                'name' => 'Super Admin Test',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->assignRole('Super Admin');

        // Administrador
        $administrador = User::updateOrCreate(
            ['email' => 'manager@erp.com'],
            [
                'name' => 'Manager Test',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $administrador->assignRole('Administrador');

        // Empleado
        $empleado = User::updateOrCreate(
            ['email' => 'empleado@erp.com'],
            [
                'name' => 'Empleado Test',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $empleado->assignRole('Empleado');

        // Cliente
        $cliente = User::updateOrCreate(
            ['email' => 'cliente@erp.com'],
            [
                'name' => 'Cliente Test',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        $cliente->assignRole('Cliente');
    }
}
