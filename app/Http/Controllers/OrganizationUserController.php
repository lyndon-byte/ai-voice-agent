<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class OrganizationUserController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create-user');
    
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt('temporary123'),
            'organization_id' => auth()->user()->organization_id,
        ]);
    
        $user->assignRole($request->role ?? 'user');
    
        return back();
    }
}
