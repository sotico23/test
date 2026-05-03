<?php

namespace App\Policies;

use App\Models\Almacen;
use App\Models\User;

class AlmacenPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Almacen $almacen): bool
    {
        return $user->getOwnerId() === $almacen->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Almacen $almacen): bool
    {
        return $user->getOwnerId() === $almacen->owner_id;
    }

    public function delete(User $user, Almacen $almacen): bool
    {
        return $user->getOwnerId() === $almacen->owner_id;
    }

    public function restore(User $user, Almacen $almacen): bool
    {
        return $user->getOwnerId() === $almacen->owner_id;
    }

    public function forceDelete(User $user, Almacen $almacen): bool
    {
        return $user->getOwnerId() === $almacen->owner_id;
    }
}
