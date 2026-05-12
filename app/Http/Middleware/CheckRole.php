<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Super Admin has access to everything
        if ($user->hasRole('Super Admin')) {
            return $next($request);
        }

        // Check if user has any of the required roles (supports pipe-separated roles)
        foreach ($roles as $roleGroup) {
            $roleArray = explode('|', $roleGroup);
            foreach ($roleArray as $role) {
                if ($user->hasRole(trim($role))) {
                    return $next($request);
                }
            }
        }

        abort(403, 'No tienes permiso para acceder a esta sección.');
    }
}
