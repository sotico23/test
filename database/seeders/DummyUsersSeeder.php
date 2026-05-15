<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DummyUsersSeeder extends Seeder
{
    public function run(): void
    {
        $availableRoles = Role::where('name', '!=', 'Master')->get();

        if ($availableRoles->isEmpty()) {
            return;
        }

        User::factory(30)->create()->each(function (User $user) use ($availableRoles) {
            $user->assignRole($availableRoles->random());
        });
    }
}
