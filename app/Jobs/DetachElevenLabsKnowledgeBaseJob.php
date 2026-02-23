<?php

namespace App\Jobs;

use App\Models\JobTracker;
use App\Services\ElevenLabsAgentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class DetachElevenLabsKnowledgeBaseJob implements ShouldQueue, NotTenantAware
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 60;

    /**
     * @param string   $agentId     The ElevenLabs agent to detach documents from.
     * @param string $documentId One or more document IDs to remove from the agent's KB.
     */
    public function __construct(
        public readonly string  $agentId,
        public readonly string  $documentId,
        public readonly string  $organizationId,
        public readonly string  $jobId,
    ) {}

    public function handle(ElevenLabsAgentService $agentService): void
    {
        logger()->info("Detach KB Job started", [
            'agent_id'     => $this->agentId,
            'document_id' => $this->documentId,
        ]);

        $result = $agentService->detachKnowledgeBase($this->agentId, $this->documentId);

        if ($result['success']) {
            
            logger()->info("Detach KB Job: ✅ Done", [
                'agent_id'  => $this->agentId,
                'removed'   => $result['removed'],
                'remaining' => count($result['remaining']),
                'rag'       => $result['rag'],
            ]);

            
            JobTracker::create([

                'organization_id' => $this->organizationId,
                'jobId' => $this->jobId,
                'status' => 'complete',
                'category' => 'knowledge_base_dettached',
                'data' => $result['data']['conversation_config']['agent']['prompt']['knowledge_base']
            
            ]);

        } else {
            throw new \RuntimeException(
                "Failed to detach KB from agent {$this->agentId}: {$result['error']}"
            );
        }
    }

    public function failed(\Throwable $exception): void
    {
        logger()->error("Detach KB Job: ❌ Job failed", [
            'agent_id'     => $this->agentId,
            'document_ids' => $this->documentId,
            'exception'    => $exception->getMessage(),
        ]);
    }
}