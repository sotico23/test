<?php

namespace App\Policies;

use App\Models\Nomina;
use App\Models\User;

class NominaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Nomina $nomina): bool
    {
        return $user->getOwnerId() === $nomina->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Nomina $nomina): bool
    {
        return $user->getOwnerId() === $nomina->owner_id;
    }

    public function delete(User $user, Nomina $nomina): bool
    {
        return $user->getOwnerId() === $nomina->owner_id;
    }

    public function restore(User $user, Nomina $nomina): bool
    {
        return $user->getOwnerId() === $nomina->owner_id;
    }

    public function forceDelete(User $user, Nomina $nomina): bool
    {
        return $user->getOwnerId() === $nomina->owner_id;
    }
}
