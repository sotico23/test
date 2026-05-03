<?php

namespace App\Policies;

use App\Models\ComentarioPublicacion;
use App\Models\User;

class ComentarioPublicacionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ComentarioPublicacion $comentarioPublicacion): bool
    {
        return $user->getOwnerId() === $comentarioPublicacion->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ComentarioPublicacion $comentarioPublicacion): bool
    {
        return $user->getOwnerId() === $comentarioPublicacion->owner_id;
    }

    public function delete(User $user, ComentarioPublicacion $comentarioPublicacion): bool
    {
        return $user->getOwnerId() === $comentarioPublicacion->owner_id;
    }

    public function restore(User $user, ComentarioPublicacion $comentarioPublicacion): bool
    {
        return $user->getOwnerId() === $comentarioPublicacion->owner_id;
    }

    public function forceDelete(User $user, ComentarioPublicacion $comentarioPublicacion): bool
    {
        return $user->getOwnerId() === $comentarioPublicacion->owner_id;
    }
}
