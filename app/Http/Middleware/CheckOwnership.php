<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOwnership
{
    public function handle(Request $request, Closure $next, string $resource = 'resource'): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $model = $request->route($resource);

        if (! $model) {
            return response()->json(['message' => 'Resource not found'], 404);
        }

        if (isset($model->user_id) && $model->user_id !== $user->id) {
            if (! $user->role === 'admin' || $user->rol === 'admin') {
                return response()->json([
                    'message' => 'Access denied. You do not own this resource.',
                ], 403);
            }
        }

        return $next($request);
    }
}
