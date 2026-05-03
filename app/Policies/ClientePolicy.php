<?php

namespace App\Policies;

use App\Models\Cliente;
use App\Models\User;

class ClientePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Cliente $cliente): bool
    {
        return $user->getOwnerId() === $cliente->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Cliente $cliente): bool
    {
        return $user->getOwnerId() === $cliente->owner_id;
    }

    public function delete(User $user, Cliente $cliente): bool
    {
        return $user->getOwnerId() === $cliente->owner_id;
    }

    public function restore(User $user, Cliente $cliente): bool
    {
        return $user->getOwnerId() === $cliente->owner_id;
    }

    public function forceDelete(User $user, Cliente $cliente): bool
    {
        return $user->getOwnerId() === $cliente->owner_id;
    }
}
