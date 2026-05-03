<?php

namespace App\Policies;

use App\Models\Cotizacion;
use App\Models\User;

class CotizacionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Cotizacion $cotizacion): bool
    {
        return $user->getOwnerId() === $cotizacion->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Cotizacion $cotizacion): bool
    {
        return $user->getOwnerId() === $cotizacion->owner_id;
    }

    public function delete(User $user, Cotizacion $cotizacion): bool
    {
        return $user->getOwnerId() === $cotizacion->owner_id;
    }

    public function restore(User $user, Cotizacion $cotizacion): bool
    {
        return $user->getOwnerId() === $cotizacion->owner_id;
    }

    public function forceDelete(User $user, Cotizacion $cotizacion): bool
    {
        return $user->getOwnerId() === $cotizacion->owner_id;
    }
}
