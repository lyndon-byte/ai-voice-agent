<?php

namespace App\Http\Controllers;

use App\Jobs\CreateElevenLabsKnowledgeBaseJob;
use App\Jobs\DetachElevenLabsKnowledgeBaseJob;
use App\Services\ElevenLabsKnowledgeBaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KnowledgeBaseController extends Controller
{
    // =========================================================================
    // Create & optionally attach
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        $organizationId = $user->organization_id;

        $request->merge([
            'organization_id' => $organizationId,
            'user_name' => $user->name,
        ]);
        
        $request->validate([
            'type'            => 'required|in:url,website,text,file',
            'organization_id' => 'required|integer',
            'agent_id'        => 'nullable|string',
        ]);

        return match ($request->input('type')) {
            'url'     => $this->dispatchUrl($request),
            'website' => $this->dispatchWebsite($request),
            'text'    => $this->dispatchText($request),
            'file'    => $this->dispatchFile($request),
        };
    }

    // =========================================================================
    // Detach from agent
    // =========================================================================

    /**
     * Remove one or more documents from an agent's knowledge base.
     * RAG is automatically disabled on the agent if no KB docs remain.
     *
     * POST /api/knowledge-base/detach
     * {
     *   "agent_id":     "agent_abc123",
     *   "document_ids": ["doc_1", "doc_2"]
     * }
     */
    
    public function detach(Request $request): JsonResponse
    {
        $user = auth()->user();
        $organizationId = $user->organization_id;
        
        $request->validate([
            'agent_id'      => 'required|string',
            'document_id'  => 'required|string',
            'job_id' => 'required|string'
        ]);

        DetachElevenLabsKnowledgeBaseJob::dispatch(
            agentId:     $request->input('agent_id'),
            documentId:  $request->input('document_id'),
            organizationId: $organizationId,
            jobId: $request->input('job_id')
        );

        return response()->json([
            'message'      => 'Detach knowledge base job dispatched.',
            'agent_id'     => $request->input('agent_id'),
            'document_ids' => $request->input('document_ids'),
        ], 202);
    }


    public function getDocument(Request $request,ElevenLabsKnowledgeBaseService $elevenLabs)
    {

        $validated = $request->validate([
            'document_id'  => 'required',
        ]);

        $document = $elevenLabs->getKnowledgeBaseDocument($validated['document_id']);

        return response()->json($document);
    }

    public function getFolderDocuments(Request $request,ElevenLabsKnowledgeBaseService $elevenLabs)
    {

        $validated = $request->validate([
            'folder_id'  => 'required',
        ]);

        $documents = $elevenLabs->getKnowledgeBaseFolderDocuments($validated['folder_id']);

        return response()->json($documents);
    }

    // =========================================================================
    // Shared context helpers
    // =========================================================================

    private function organizationId(Request $request): int
    {
        return (int) $request->input('organization_id');
    }

    private function createdBy(Request $request): ?string
    {
        return $request->input('user_name');
    }

    private function agentId(Request $request): ?string
    {
        return $request->input('agent_id') ?: null;
    }

    private function jobId(Request $request): ?string
    {
        return $request->input('job_id') ?: null;
    }


    private function name(Request $request): ?string
    {
        return $request->input('name') ?: null;
    }

    private function baseResponse(Request $request, array $extra = []): array
    {
        return array_merge([
            'organization_id' => $this->organizationId($request),
            'agent_id'        => $this->agentId($request),
            'attach_to_agent' => $this->agentId($request) !== null,
        ], $extra);
    }

    // =========================================================================
    // URL — single page
    // =========================================================================

    private function dispatchUrl(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = rtrim($request->input('url'), '/');

        CreateElevenLabsKnowledgeBaseJob::dispatch(
            jobId:          $this->jobId($request),
            type:           CreateElevenLabsKnowledgeBaseJob::TYPE_URL,
            organizationId: $this->organizationId($request),
            createdBy:      $this->createdBy($request),
            agentId:        $this->agentId($request),
            url:            $url,
        );

        return response()->json($this->baseResponse($request, [
            'message' => 'URL knowledge base job dispatched.',
            'type'    => 'url',
            'url'     => $url,
        ]), 202);
    }

    // =========================================================================
    // Website — crawl all pages
    // =========================================================================

    private function dispatchWebsite(Request $request): JsonResponse
    {
        $request->validate([
            'url'       => 'required|url',
            'max_pages' => 'nullable|integer|min:1|max:500',
        ]);

        $url      = rtrim($request->input('url'), '/');
        $maxPages = $request->input('max_pages', 100);

        CreateElevenLabsKnowledgeBaseJob::dispatch(
            jobId:          $this->jobId($request),
            type:           CreateElevenLabsKnowledgeBaseJob::TYPE_WEBSITE,
            organizationId: $this->organizationId($request),
            createdBy:      $this->createdBy($request),
            agentId:        $this->agentId($request),
            url:            $url,
            maxPages:       $maxPages,
        );

        return response()->json($this->baseResponse($request, [
            'message'   => 'Website crawl knowledge base job dispatched.',
            'type'      => 'website',
            'url'       => $url,
            'max_pages' => $maxPages,
        ]), 202);
    }

    // =========================================================================
    // Text
    // =========================================================================

    private function dispatchText(Request $request): JsonResponse
    {
        $request->validate([
            'text' => 'required|string|min:1',
            'name' => 'nullable|string|max:255',
        ]);

        CreateElevenLabsKnowledgeBaseJob::dispatch(
            jobId:          $this->jobId($request),
            type:           CreateElevenLabsKnowledgeBaseJob::TYPE_TEXT,
            organizationId: $this->organizationId($request),
            createdBy:      $this->createdBy($request),
            agentId:        $this->agentId($request),
            text:           $request->input('text'),
            name:           $request->input('name'),
        );

        return response()->json($this->baseResponse($request, [
            'message' => 'Text knowledge base job dispatched.',
            'type'    => 'text',
            'name'    => $request->input('name'),
        ]), 202);
    }

    // =========================================================================
    // File(s)
    // =========================================================================

    private function dispatchFile(Request $request): JsonResponse
    {
        $request->validate([
            'files'   => 'required|array|min:1',
            'files.*' => 'required|file|mimes:pdf,txt,doc,docx,md,html,csv|max:51200',
        ]);

        $storedFiles = [];

        foreach ($request->file('files') as $uploadedFile) {
            $storedPath = $uploadedFile->store('kb_uploads/temp', 'local');

            $storedFiles[] = [
                'path' => Storage::disk('local')->path($storedPath),
                'name' => $uploadedFile->getClientOriginalName(),
            ];
        }

        CreateElevenLabsKnowledgeBaseJob::dispatch(
            jobId:          $this->jobId($request),
            type:           CreateElevenLabsKnowledgeBaseJob::TYPE_FILE,
            organizationId: $this->organizationId($request),
            createdBy:      $this->createdBy($request),
            agentId:        $this->agentId($request),
            files:          $storedFiles,
        );

        return response()->json($this->baseResponse($request, [
            'message' => 'File knowledge base job dispatched.',
            'type'    => 'file',
            'files'   => array_column($storedFiles, 'name'),
        ]), 202);
    }
}