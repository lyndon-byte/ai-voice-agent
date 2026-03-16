<?php

namespace App\Http\Controllers;

use App\Jobs\AgentsSwitchJob;
use App\Mail\AccountStatusMail;
use App\Mail\RegistrationInviteMail;
use App\Models\JobTracker;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SuperAdminDashboardController extends Controller
{
    public function index(Request $request){
        
        $organizations = Organization::with('users')
            ->where('domain', '!=', 'system.local')
            ->get();

        return Inertia::render('SuperAdminDashboard',[

            'organizations' => $organizations

        ]);

    }

    public function agentsSwitch(Request $request)
    {
        $validated = $request->validate([
            'org_id' => 'required|integer',
            'reason' => 'required|string|max:1000',
            'command' => 'required|in:on,off'
        ]);

        $org = Organization::findOrFail($validated['org_id']);

        // generate job id
        $jobId = (string) Str::uuid();

        // create tracker before dispatch
        JobTracker::create([
            'organization_id' => $org->id,
            'jobId' => $jobId,
            'status' => 'processing',
            'category' => $validated['command'] === 'on' ? 'turn_on_agents' : 'turn_off_agents',
            'data' => [
                'command' => $validated['command'],
                'reason' => $validated['reason'],
                'organization_status_before' => $org->active
            ]
        ]);

        // dispatch background job
        AgentsSwitchJob::dispatch(
            $org->id,
            $validated['command'],
            $validated['reason'],
            $jobId
        );

        // update organization status immediately
        $org->active = $validated['command'] === 'on';
        
        $owner = $org->users()->oldest()->value('email');

        if($validated['command'] === 'off') {

            $org->super_admin_note = $validated['reason'];

            Mail::to($owner)->queue(
                new AccountStatusMail(
                    false,
                    $validated['reason']
                )
            );

        } else {

            Mail::to($owner)->queue(
                new AccountStatusMail(true)
            );
        
        }

        $org->save();

        return response()->json([
            'message' => 'processing',
            'job_id' => $jobId
        ], 202);
    }


    public function sendInvite(Request $request){

        $email = $request->input('email');

        $link = URL::temporarySignedRoute(
            'register.invite',
            now()->addDays(3),
            [
                'email' => $email
            ]
        );

        Mail::to($email)->queue(
            new RegistrationInviteMail(
                $link,
            )
        );

        return response()->json([
            
            'success' => true,
            'email' => $email

        ], 202);
    }

}
