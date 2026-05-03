<?php

namespace App\Policies;

use App\Models\Pedido;
use App\Models\User;

class PedidoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Pedido $pedido): bool
    {
        return $user->getOwnerId() === $pedido->owner_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Pedido $pedido): bool
    {
        return $user->getOwnerId() === $pedido->owner_id;
    }

    public function delete(User $user, Pedido $pedido): bool
    {
        return $user->getOwnerId() === $pedido->owner_id;
    }

    public function restore(User $user, Pedido $pedido): bool
    {
        return $user->getOwnerId() === $pedido->owner_id;
    }

    public function forceDelete(User $user, Pedido $pedido): bool
    {
        return $user->getOwnerId() === $pedido->owner_id;
    }
}
