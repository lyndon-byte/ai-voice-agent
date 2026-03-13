<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ImpersonationMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        
        if (!session()->has('impersonated_by')) {
            abort(403, 'You are not impersonating any user.');
        }

        // Optional: ensure the original user is a super admin
        $originalUserId = session('impersonated_by');
        $originalUser = Auth::getProvider()->retrieveById($originalUserId);

        if (!$originalUser) {
            abort(403, 'Invalid impersonation.');
        }
        
        
        return $next($request);
    }
}
