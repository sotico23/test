<?php

namespace App\Policies;

use App\Models\Compra;
use App\Models\User;

class CompraPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Compra $compra): bool
    {
        return $user->getOwnerId() === $compra->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Compra $compra): bool
    {
        return $user->getOwnerId() === $compra->owner_id;
    }

    public function delete(User $user, Compra $compra): bool
    {
        return $user->getOwnerId() === $compra->owner_id;
    }

    public function restore(User $user, Compra $compra): bool
    {
        return $user->getOwnerId() === $compra->owner_id;
    }

    public function forceDelete(User $user, Compra $compra): bool
    {
        return $user->getOwnerId() === $compra->owner_id;
    }
}
