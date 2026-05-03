<?php

namespace App\Policies;

use App\Models\Factura;
use App\Models\User;

class FacturaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Factura $factura): bool
    {
        return $user->getOwnerId() === $factura->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Factura $factura): bool
    {
        return $user->getOwnerId() === $factura->owner_id;
    }

    public function delete(User $user, Factura $factura): bool
    {
        return $user->getOwnerId() === $factura->owner_id;
    }

    public function restore(User $user, Factura $factura): bool
    {
        return $user->getOwnerId() === $factura->owner_id;
    }

    public function forceDelete(User $user, Factura $factura): bool
    {
        return $user->getOwnerId() === $factura->owner_id;
    }
}
