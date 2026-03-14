<?php

namespace App\Jobs;

use App\Models\JobTracker;
use App\Models\Organization;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class AgentsSwitchJob implements ShouldQueue, NotTenantAware
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $orgId;
    public $command;
    public $reason;
    public $jobId;
    /**
     * Create a new job instance.
     */
    public function __construct($orgId, $command, $reason, $jobId)
    {
        $this->orgId = $orgId;
        $this->command = $command;
        $this->reason = $reason;
        $this->jobId = $jobId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $org = Organization::find($this->orgId);

        $agents = $org->agents()->get();

        foreach ($agents as $agent) {

            Http::withHeaders([
                'xi-api-key' => config('services.elevenlabs.api_key'),
                'Content-Type' => 'application/json',
            ])->patch("https://api.elevenlabs.io/v1/convai/agents/{$agent->agent_id}", [
                'platform_settings' => [
                    'archived' => $this->command === 'on' ? false : true
                ]
            ]);
        }

        JobTracker::where('jobId', $this->jobId)->update([
            'status' => 'complete'
        ]);
    }
}
