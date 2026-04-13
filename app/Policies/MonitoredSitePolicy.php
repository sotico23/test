<?php

namespace App\Policies;

use App\Models\MonitoredSite;
use App\Models\User;

class MonitoredSitePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MonitoredSite $monitoredSite): bool
    {
        return $user->getOwnerId() === $monitoredSite->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, MonitoredSite $monitoredSite): bool
    {
        return $user->getOwnerId() === $monitoredSite->user_id;
    }

    public function delete(User $user, MonitoredSite $monitoredSite): bool
    {
        return $user->getOwnerId() === $monitoredSite->user_id;
    }

    public function restore(User $user, MonitoredSite $monitoredSite): bool
    {
        return $user->getOwnerId() === $monitoredSite->user_id;
    }

    public function forceDelete(User $user, MonitoredSite $monitoredSite): bool
    {
        return $user->getOwnerId() === $monitoredSite->user_id;
    }
}
