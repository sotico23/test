<?php

namespace App\Policies;

use App\Models\Empleado;
use App\Models\User;

class EmpleadoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Empleado $empleado): bool
    {
        return $user->getOwnerId() === $empleado->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Empleado $empleado): bool
    {
        return $user->getOwnerId() === $empleado->owner_id;
    }

    public function delete(User $user, Empleado $empleado): bool
    {
        return $user->getOwnerId() === $empleado->owner_id;
    }

    public function restore(User $user, Empleado $empleado): bool
    {
        return $user->getOwnerId() === $empleado->owner_id;
    }

    public function forceDelete(User $user, Empleado $empleado): bool
    {
        return $user->getOwnerId() === $empleado->owner_id;
    }
}
