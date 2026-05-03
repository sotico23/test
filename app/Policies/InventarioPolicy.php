<?php

namespace App\Policies;

use App\Models\Inventario;
use App\Models\User;

class InventarioPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Inventario $inventario): bool
    {
        return $user->getOwnerId() === $inventario->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Inventario $inventario): bool
    {
        return $user->getOwnerId() === $inventario->owner_id;
    }

    public function delete(User $user, Inventario $inventario): bool
    {
        return $user->getOwnerId() === $inventario->owner_id;
    }

    public function restore(User $user, Inventario $inventario): bool
    {
        return $user->getOwnerId() === $inventario->owner_id;
    }

    public function forceDelete(User $user, Inventario $inventario): bool
    {
        return $user->getOwnerId() === $inventario->owner_id;
    }
}
