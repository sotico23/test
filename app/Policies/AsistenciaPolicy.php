<?php

namespace App\Policies;

use App\Models\Asistencia;
use App\Models\User;

class AsistenciaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Asistencia $asistencia): bool
    {
        return $user->getOwnerId() === $asistencia->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Asistencia $asistencia): bool
    {
        return $user->getOwnerId() === $asistencia->owner_id;
    }

    public function delete(User $user, Asistencia $asistencia): bool
    {
        return $user->getOwnerId() === $asistencia->owner_id;
    }

    public function restore(User $user, Asistencia $asistencia): bool
    {
        return $user->getOwnerId() === $asistencia->owner_id;
    }

    public function forceDelete(User $user, Asistencia $asistencia): bool
    {
        return $user->getOwnerId() === $asistencia->owner_id;
    }
}
