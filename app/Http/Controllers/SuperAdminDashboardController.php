<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperAdminDashboardController extends Controller
{
    public function index(Request $request){
        
        $organizations = Organization::with('users')->get();

        return Inertia::render('SuperAdminDashboard',[

            'organizations' => $organizations

        ]);

    }
}
