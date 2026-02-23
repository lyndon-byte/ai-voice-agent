<?php

namespace App\Jobs;

use App\Services\ElevenLabsAgentService;
use App\Services\ElevenLabsKnowledgeBaseService;
use App\Services\WebCrawlerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\Multitenancy\Jobs\NotTenantAware;
use App\Models\JobTracker;


class CreateElevenLabsKnowledgeBaseJob implements ShouldQueue, NotTenantAware
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 600; // 10 minutes

    public const TYPE_URL     = 'url';
    public const TYPE_WEBSITE = 'website';
    public const TYPE_TEXT    = 'text';
    public const TYPE_FILE    = 'file';

    /**
     * @param string      $type           One of the TYPE_* constants.
     * @param int|null    $organizationId Organization to associate KB records with.
     * @param string|null    $createdBy      User ID who triggered the action.
     * @param string|null $agentId        If provided, newly created documents will be
     *                                    attached to this ElevenLabs agent after creation.
     *                                    If null, documents are only added to the KB.
     *
     * --- TYPE_URL ---
     * @param string|null $url            Single URL to add.
     *
     * --- TYPE_WEBSITE ---
     * @param string|null $url            Root URL to crawl.
     * @param int         $maxPages       Max pages to crawl.
     *
     * --- TYPE_TEXT ---
     * @param string|null $text           Plain text content.
     * @param string|null $name           Optional document name.
     *
     * --- TYPE_FILE ---
     * @param array       $files          Array of ['path' => ..., 'name' => ...].
     */
    public function __construct(
        public readonly string  $jobId,
        public readonly string  $type,
        public readonly ?int    $organizationId = null,
        public readonly ?string $createdBy      = null,
        public readonly ?string $agentId        = null,
        public readonly ?string $url            = null,
        public readonly ?string $text           = null,
        public readonly ?string $name           = null,
        public readonly array   $files          = [],
        public readonly int     $maxPages       = 100,
    ) {}

    public function handle(
        ElevenLabsKnowledgeBaseService $elevenLabs,
        ElevenLabsAgentService $agentService,
        WebCrawlerService $crawler,
    ): void {
        $elevenLabs->withContext(
            organizationId: $this->organizationId,
            createdBy: $this->createdBy,
        );

        logger()->info("KB Job started [type={$this->type}]", [
            'organization_id' => $this->organizationId,
            'created_by'      => $this->createdBy,
            'agent_id'        => $this->agentId ?? 'none (KB only)',
        ]);

        // Each handler returns an array of document entries created:
        // [['id' => 'doc_id', 'type' => 'url|text|file'], ...]
        $documentEntries = match ($this->type) {
            self::TYPE_URL     => $this->handleUrl($elevenLabs),
            self::TYPE_WEBSITE => $this->handleWebsite($elevenLabs, $crawler),
            self::TYPE_TEXT    => $this->handleText($elevenLabs),
            self::TYPE_FILE    => $this->handleFiles($elevenLabs),
            default            => throw new \InvalidArgumentException("Unknown KB type: {$this->type}"),
        };

        // If an agent ID was provided, attach all newly created docs to the agent
        if ($this->agentId && ! empty($documentEntries)) {
            $this->attachToAgent($agentService, $documentEntries);
        }
    }

    // =========================================================================
    // URL — single page
    // =========================================================================

    private function handleUrl(ElevenLabsKnowledgeBaseService $elevenLabs): array
    {
        logger()->info("KB Job: Adding single URL", ['url' => $this->url]);

        $result = $elevenLabs->addUrl($this->url);

        if (! $result['success']) {
            throw new \RuntimeException("Failed to add URL: {$result['error']}");
        }

        logger()->info("KB Job: ✅ URL added", ['url' => $this->url]);

        return array_filter([$result['document_entry']]);
    }

    // =========================================================================
    // Website — crawl all pages and add each to a folder
    // =========================================================================

    private function handleWebsite(
        ElevenLabsKnowledgeBaseService $elevenLabs,
        WebCrawlerService $crawler,
    ): array {
        // Step 1 — Create folder named after the root URL
        logger()->info("KB Job: Creating folder", ['name' => $this->url]);
        $folder = $elevenLabs->createFolder($this->url);
        $folderId      = $folder['folder_id'];
        $folderEntry   = $folder['document_entry']; 
        logger()->info("KB Job: ✅ Folder created", ['folder_id' => $folderId]);

        // Step 2 — Crawl
        logger()->info("KB Job: Crawling website", ['url' => $this->url, 'max' => $this->maxPages]);
        $links = $crawler->crawl($this->url);
        logger()->info("KB Job: Crawl done", ['total' => count($links)]);

        if (empty($links)) {
            logger()->warning("KB Job: No links found", ['url' => $this->url]);
            return [];
        }

        // Step 3 — Add each link, collect document entries
        $documentEntries = [];
        $success         = 0;
        $failed          = 0;

        foreach ($links as $i => $link) {

            logger()->info("KB Job: Adding link " . ($i + 1) . '/' . count($links), ['url' => $link]);

            $result = $elevenLabs->addUrl($link, $folderId);

            $result['success'] ? $success++ : $failed++;

            usleep(500000); // 500ms rate-limit delay

        }

        logger()->info("KB Job: ✅ Website done", [
            'url'           => $this->url,
            'folder_id'     => $folderId,
            'pages_success' => $success,
            'pages_failed'  => $failed,
        ]);

        return [$folderEntry];
    }

    // =========================================================================
    // Text
    // =========================================================================

    private function handleText(ElevenLabsKnowledgeBaseService $elevenLabs): array
    {
        logger()->info("KB Job: Adding text", ['name' => $this->name]);

        $result = $elevenLabs->addText($this->text, $this->name);

        if (! $result['success']) {
            throw new \RuntimeException("Failed to add text: {$result['error']}");
        }

        logger()->info("KB Job: ✅ Text added", ['name' => $this->name]);

        return array_filter([$result['document_entry']]);
    }

    // =========================================================================
    // File(s)
    // =========================================================================

    private function handleFiles(ElevenLabsKnowledgeBaseService $elevenLabs): array
    {
        logger()->info("KB Job: Uploading files", ['count' => count($this->files)]);

        $summary = $elevenLabs->addFiles($this->files);

        logger()->info("KB Job: ✅ Files done", [
            'total'   => $summary['total'],
            'success' => $summary['success_count'],
            'failed'  => $summary['failed_count'],
        ]);

        // Clean up temp files from storage after upload
        foreach ($this->files as $file) {
            if (file_exists($file['path'])) {
                unlink($file['path']);
            }
        }

        if ($summary['failed_count'] > 0 && $summary['success_count'] === 0) {
            throw new \RuntimeException("All file uploads failed.");
        }

        // Collect document entries from all successful uploads
        return array_values(array_filter(
            array_column($summary['results'], 'document_entry')
        ));
    }

    // =========================================================================
    // Attach collected documents to the agent
    // =========================================================================

    private function attachToAgent(ElevenLabsAgentService $agentService, array $documentEntries): void
    {
        logger()->info("KB Job: Attaching documents to agent", [
            'agent_id' => $this->agentId,
            'count'    => count($documentEntries),
            'entries' => $documentEntries
        ]);

        $result = $agentService->attachKnowledgeBase($this->agentId, $documentEntries);

        if ($result['success']) {
            
            logger()->info("KB Job: ✅ Documents attached to agent", [
                'agent_id' => $this->agentId,
                'added'    => $result['added'],
                'skipped'  => $result['skipped'],
                'total'    => count($result['merged']),
                'rag'      => $result['rag'], 
            ]);

            JobTracker::create([

                'organization_id' => $this->organizationId,
                'jobId' => $this->jobId,
                'status' => 'complete',
                'category' => 'knowledge_base_attached',
                'data' => $result['data']['conversation_config']['agent']['prompt']['knowledge_base']
            ]);

        } else {
            // Log but don't throw — KB docs were created successfully,
            // only the agent attachment failed. Job should not retry for this.
            logger()->error("KB Job: ❌ Failed to attach documents to agent", [
                'agent_id' => $this->agentId,
                'error'    => $result['error'],
            ]);
        }
    }

    // =========================================================================
    // Failure handler
    // =========================================================================

    public function failed(\Throwable $exception): void
    {
        logger()->error("KB Job: ❌ Job failed", [
            'type'            => $this->type,
            'organization_id' => $this->organizationId,
            'created_by'      => $this->createdBy,
            'agent_id'        => $this->agentId,
            'exception'       => $exception->getMessage(),
        ]);
    }
}