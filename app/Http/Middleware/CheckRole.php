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
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $hasRole = $user->hasAnyRole($roles);

        if (! $hasRole) {
            return response()->json([
                'message' => 'Access denied. Required role: '.implode(' or ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
