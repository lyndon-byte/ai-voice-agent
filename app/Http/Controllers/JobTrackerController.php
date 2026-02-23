<?php

namespace App\Http\Controllers;
use App\Models\JobTracker;

use Illuminate\Http\Request;

class JobTrackerController extends Controller
{
    public function checkJob(Request $request){

        $user = auth()->user();
        
        $job = JobTracker::where('jobId', $request->jobId)
                        ->where('organization_id',$user->organization_id)
                        ->first();

        if (!$job) {
            return response()->json([
                'exists' => false,
                'data'   => null,
                'status' => 'not_found',
            ], 200);
        }
    
        return response()->json([
            'exists' => true,
            'data'   => $job->data,
            'status' => $job->status,
        ], 200);

    }
}
