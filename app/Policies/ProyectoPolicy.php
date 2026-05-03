<?php

namespace App\Policies;

use App\Models\Proyecto;
use App\Models\User;

class ProyectoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Proyecto $proyecto): bool
    {
        return $user->getOwnerId() === $proyecto->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Proyecto $proyecto): bool
    {
        return $user->getOwnerId() === $proyecto->owner_id;
    }

    public function delete(User $user, Proyecto $proyecto): bool
    {
        return $user->getOwnerId() === $proyecto->owner_id;
    }

    public function restore(User $user, Proyecto $proyecto): bool
    {
        return $user->getOwnerId() === $proyecto->owner_id;
    }

    public function forceDelete(User $user, Proyecto $proyecto): bool
    {
        return $user->getOwnerId() === $proyecto->owner_id;
    }
}
