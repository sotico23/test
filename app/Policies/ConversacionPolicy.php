<?php

namespace App\Policies;

use App\Models\Conversacion;
use App\Models\User;

class ConversacionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Conversacion $conversacion): bool
    {
        return $user->getOwnerId() === $conversacion->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Conversacion $conversacion): bool
    {
        return $user->getOwnerId() === $conversacion->owner_id;
    }

    public function delete(User $user, Conversacion $conversacion): bool
    {
        return $user->getOwnerId() === $conversacion->owner_id;
    }

    public function restore(User $user, Conversacion $conversacion): bool
    {
        return $user->getOwnerId() === $conversacion->owner_id;
    }

    public function forceDelete(User $user, Conversacion $conversacion): bool
    {
        return $user->getOwnerId() === $conversacion->owner_id;
    }
}
