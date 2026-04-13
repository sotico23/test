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
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userPermissions = $user->permissions ?? [];

        foreach ($permissions as $permission) {
            if (! in_array($permission, $userPermissions)) {
                return response()->json([
                    'message' => 'Access denied. Missing permission: '.$permission,
                ], 403);
            }
        }

        return $next($request);
    }
}
