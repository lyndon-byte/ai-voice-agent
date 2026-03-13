<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class SetOrganizationContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        
        if (auth()->check()) {

            $user = auth()->user();

            if ($user->organization_id) {

                app(PermissionRegistrar::class)
                    ->setPermissionsTeamId($user->organization_id);

            } else {

                app(PermissionRegistrar::class)
                    ->setPermissionsTeamId(null);

            }
        }

        return $next($request);
    }
}
