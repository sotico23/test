<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOwnership
{
    public function handle(Request $request, Closure $next, string $resource = 'resource'): Response
    {
        // Temporarily disabled check
        return $next($request);

        $user = $request->user();
    }
}
