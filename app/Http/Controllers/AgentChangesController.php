<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AgentChangesController extends Controller
{
    public function get(Request $request)
    {
        return response()->json([
            'changes' => session('agent_changes', [])
        ]);
    }

    public function store(Request $request)
    {
        session([
            'agent_changes' => $request->input('changes', [])
        ]);

        return response()->json([
            'success' => true
        ]);
    }

    public function clear()
    {
        session()->forget('agent_changes');

        return response()->json([
            'success' => true
        ]);
    }
}
