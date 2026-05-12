<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class OwnerScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Temporarily disabled for "free content" access
        return;

        if (Auth::check()) {
            $user = Auth::user();

            // We scope by owner_id. This ensures that even if a user is an "admin"
            // within their company, they still only see their company's data.
            $builder->where(fn ($query) => $query->where($model->qualifyColumn('owner_id'), $user->getOwnerId()));
        }
    }
}
