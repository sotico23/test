<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Master and Super Admin bypass via Gate::before, but we also check here for safety
        if ($user->hasRole('Master') || $user->hasRole('Super Admin')) {
            return $next($request);
        }

        // Check if user has any of the required permissions
        foreach ($permissions as $permissionGroup) {
            $permissionList = explode('|', $permissionGroup);
            foreach ($permissionList as $permission) {
                if ($user->can(trim($permission))) {
                    return $next($request);
                }
            }
        }

        abort(403, 'No tienes permiso para acceder a esta sección.');
    }
}
