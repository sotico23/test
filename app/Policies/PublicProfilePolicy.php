<?php

namespace App\Policies;

use App\Models\PublicProfile;
use App\Models\User;

class PublicProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PublicProfile $publicProfile): bool
    {
        return $user->getOwnerId() === $publicProfile->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PublicProfile $publicProfile): bool
    {
        return $user->getOwnerId() === $publicProfile->owner_id;
    }

    public function delete(User $user, PublicProfile $publicProfile): bool
    {
        return $user->getOwnerId() === $publicProfile->owner_id;
    }

    public function restore(User $user, PublicProfile $publicProfile): bool
    {
        return $user->getOwnerId() === $publicProfile->owner_id;
    }

    public function forceDelete(User $user, PublicProfile $publicProfile): bool
    {
        return $user->getOwnerId() === $publicProfile->owner_id;
    }
}
