<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Venta;

class VentaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Venta $venta): bool
    {
        return $user->getOwnerId() === $venta->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Venta $venta): bool
    {
        return $user->getOwnerId() === $venta->owner_id;
    }

    public function delete(User $user, Venta $venta): bool
    {
        return $user->getOwnerId() === $venta->owner_id;
    }

    public function restore(User $user, Venta $venta): bool
    {
        return $user->getOwnerId() === $venta->owner_id;
    }

    public function forceDelete(User $user, Venta $venta): bool
    {
        return $user->getOwnerId() === $venta->owner_id;
    }
}
