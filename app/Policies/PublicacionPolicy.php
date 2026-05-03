<?php

namespace App\Policies;

use App\Models\Publicacion;
use App\Models\User;

class PublicacionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Publicacion $publicacion): bool
    {
        return $user->getOwnerId() === $publicacion->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Publicacion $publicacion): bool
    {
        return $user->getOwnerId() === $publicacion->owner_id;
    }

    public function delete(User $user, Publicacion $publicacion): bool
    {
        return $user->getOwnerId() === $publicacion->owner_id;
    }

    public function restore(User $user, Publicacion $publicacion): bool
    {
        return $user->getOwnerId() === $publicacion->owner_id;
    }

    public function forceDelete(User $user, Publicacion $publicacion): bool
    {
        return $user->getOwnerId() === $publicacion->owner_id;
    }
}
