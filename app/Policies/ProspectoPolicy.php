<?php

namespace App\Policies;

use App\Models\Prospecto;
use App\Models\User;

class ProspectoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Prospecto $prospecto): bool
    {
        return $user->getOwnerId() === $prospecto->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Prospecto $prospecto): bool
    {
        return $user->getOwnerId() === $prospecto->owner_id;
    }

    public function delete(User $user, Prospecto $prospecto): bool
    {
        return $user->getOwnerId() === $prospecto->owner_id;
    }

    public function restore(User $user, Prospecto $prospecto): bool
    {
        return $user->getOwnerId() === $prospecto->owner_id;
    }

    public function forceDelete(User $user, Prospecto $prospecto): bool
    {
        return $user->getOwnerId() === $prospecto->owner_id;
    }
}
