<?php

namespace App\Http\Controllers;

use App\Models\ImpersonationToken;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

class SuperAdminImpersonationController extends Controller
{
    public function createToken($userId)
    {
        $admin = Auth::user();

        $user = User::findOrFail($userId);

        $token = ImpersonationToken::create([
            'token' => Str::uuid(),
            'user_id' => $user->id,
            'admin_id' => $admin->id,
            'expires_at' => now()->addMinutes(5),
        ]);

        return response()->json([

            'url' => "/impersonate/". $token->token
            
        ]);
    }

    public function login($token)
    {
        $record = ImpersonationToken::where('token',$token)
            ->where('used',false)
            ->firstOrFail();

        if ($record->expires_at->isPast()) {
            abort(403,'Token expired');
        }

        $user = User::findOrFail($record->user_id);

        $organization = Organization::findOrFail($user->organization_id);

        Auth::login($user);

        app(PermissionRegistrar::class)
            ->setPermissionsTeamId($organization->id);

        $record->update(['used' => true]);

        session([
            'impersonated_by' => $record->admin_id
        ]);

        return redirect()->route('dashboard');
    }

    public function leave()
    {
        $adminId = session('impersonated_by');

        abort_if(!$adminId,403);

        Auth::loginUsingId($adminId);

        session()->forget('impersonated_by');

        return redirect()->route('system.admin.dashboard');
    }
    
}
