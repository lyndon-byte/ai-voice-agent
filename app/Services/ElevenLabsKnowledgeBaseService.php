<?php

namespace App\Services;

use App\Models\KnowledgeBase;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ElevenLabsKnowledgeBaseService
{
    private Client $client;
    private string $apiKey;

    // Context set via withContext() before calling any add* method
    private ?int $organizationId = null;
    private ?string $createdBy      = null;

    public function __construct()
    {
        $this->apiKey = config('services.elevenlabs.api_key');

        $this->client = new Client([
            'base_uri' => 'https://api.elevenlabs.io',
            'timeout'  => 60,
            'headers'  => [
                'xi-api-key' => $this->apiKey,
            ],
        ]);
    }

    // =========================================================================
    // Context — call this before any add* method inside the job
    // =========================================================================

    /**
     * Set the organization and user context used when saving DB records.
     * Returns $this for fluent chaining.
     */
    public function withContext(?int $organizationId, ?string $createdBy = null): static
    {
        $this->organizationId = $organizationId;
        $this->createdBy      = $createdBy;

        return $this;
    }

    // =========================================================================
    // Folder
    // =========================================================================

    /**
     * Create a folder in the knowledge base.
     * Returns the folder ID on success.
     */
    public function createFolder(string $name): array
    {
        $response = $this->client->post('/v1/convai/knowledge-base/folder', [
            'headers' => ['Content-Type' => 'application/json'],
            'json'    => ['name' => $name],
        ]);

        $body = json_decode((string) $response->getBody(), true);
        $folderId = $body['id'];


        logger()->info('ElevenLabs: Created KB folder', [
            'name' => $name,
            'id'   => $folderId,
        ]);

        $this->saveToDatabase(
            documentId: $folderId,
            name: $name,
            type: KnowledgeBase::TYPE_FOLDER,
        );


        return [
            'folder_id'      => $folderId,
            'document_entry' => ['id' => $folderId, 'type' => KnowledgeBase::TYPE_FOLDER, 'name' => $body['name']],
        ];
    }

    // =========================================================================
    // URL
    // =========================================================================

    /**
     * Add a URL to the knowledge base.
     * Saves a DB record and sends to RAG index automatically.
     *
     * On success, result includes 'document_entry' => ['id' => ..., 'type' => 'url']
     * which can be used to attach to an agent.
     */
    public function addUrl(string $url, ?string $parentFolderId = null): array
    {
        $payload = ['url' => $url];

        if ($parentFolderId) {
            $payload['parent_folder_id'] = $parentFolderId;
        }

        try {
            $response = $this->client->post('/v1/convai/knowledge-base/url', [
                'headers' => ['Content-Type' => 'application/json'],
                'json'    => $payload,
            ]);

            $body       = json_decode((string) $response->getBody(), true);
            $documentId = $body['id'] ?? null;

            logger()->info('ElevenLabs: Added URL to KB', [
                'url'    => $url,
                'doc_id' => $documentId,
                'folder' => $parentFolderId,
            ]);

            if ($documentId) {
                $this->saveToDatabase(
                    documentId: $documentId,
                    name: $url,
                    type: KnowledgeBase::TYPE_URL,
                );

                $this->sendToRagIndex($documentId);
            }

            return [
                'success'        => true,
                'url'            => $url,
                'data'           => $body,
                'document_entry' => $documentId ? ['id' => $documentId, 'type' => KnowledgeBase::TYPE_URL, 'name' => $body['name']] : null,
            ];

        } catch (RequestException $e) {
            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs: Failed to add URL to KB', [
                'url'   => $url,
                'error' => $errorBody,
            ]);

            return ['success' => false, 'url' => $url, 'error' => $errorBody, 'document_entry' => null];
        }
    }

    // =========================================================================
    // Text
    // =========================================================================

    /**
     * Add plain text content to the knowledge base.
     * Saves a DB record and sends to RAG index automatically.
     *
     * On success, result includes 'document_entry' => ['id' => ..., 'type' => 'text']
     */
    public function addText(string $text, ?string $name = null, ?string $parentFolderId = null): array
    {
        $payload = ['text' => $text];

        if ($name) {
            $payload['name'] = $name;
        }

        if ($parentFolderId) {
            $payload['parent_folder_id'] = $parentFolderId;
        }

        try {
            $response = $this->client->post('/v1/convai/knowledge-base/text', [
                'headers' => ['Content-Type' => 'application/json'],
                'json'    => $payload,
            ]);

            $body       = json_decode((string) $response->getBody(), true);
            $documentId = $body['id'] ?? null;

            logger()->info('ElevenLabs: Added text to KB', [
                'name'   => $name,
                'doc_id' => $documentId,
                'folder' => $parentFolderId,
            ]);

            if ($documentId) {
                $this->saveToDatabase(
                    documentId: $documentId,
                    name: $name ?? 'Text Document',
                    type: KnowledgeBase::TYPE_TEXT,
                );

                $this->sendToRagIndex($documentId);
            }

            return [
                'success'        => true,
                'name'           => $name,
                'data'           => $body,
                'document_entry' => $documentId ? ['id' => $documentId, 'type' => KnowledgeBase::TYPE_TEXT, 'name' => $body['name']] : null,
            ];

        } catch (RequestException $e) {
            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs: Failed to add text to KB', [
                'name'  => $name,
                'error' => $errorBody,
            ]);

            return ['success' => false, 'name' => $name, 'error' => $errorBody, 'document_entry' => null];
        }
    }

    // =========================================================================
    // File(s)
    // =========================================================================

    /**
     * Upload a single file to the knowledge base.
     * Saves a DB record and sends to RAG index automatically.
     *
     * On success, result includes 'document_entry' => ['id' => ..., 'type' => 'file']
     */
    public function addFile(
        string $filePath,
        string $fileName,
        ?string $parentFolderId = null
    ): array {
        try {
            $multipart = [
                [
                    'name'     => 'file',
                    'filename' => $fileName,
                    'contents' => fopen($filePath, 'r'),
                ],
            ];

            if ($parentFolderId) {
                $multipart[] = [
                    'name'     => 'parent_folder_id',
                    'contents' => $parentFolderId,
                ];
            }

            $response = $this->client->post('/v1/convai/knowledge-base/file', [
                'multipart' => $multipart,
            ]);

            $body       = json_decode((string) $response->getBody(), true);
            $documentId = $body['id'] ?? null;

            logger()->info('ElevenLabs: Added file to KB', [
                'file'   => $fileName,
                'doc_id' => $documentId,
                'folder' => $parentFolderId,
            ]);

            if ($documentId) {
                $this->saveToDatabase(
                    documentId: $documentId,
                    name: $fileName,
                    type: KnowledgeBase::TYPE_FILE,
                );

                $this->sendToRagIndex($documentId);
            }

            return [
                'success'        => true,
                'file'           => $fileName,
                'data'           => $body,
                'document_entry' => $documentId ? ['id' => $documentId, 'type' => KnowledgeBase::TYPE_FILE, 'name' => $body['name']] : null,
            ];

        } catch (RequestException $e) {
            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs: Failed to add file to KB', [
                'file'  => $fileName,
                'error' => $errorBody,
            ]);

            return ['success' => false, 'file' => $fileName, 'error' => $errorBody, 'document_entry' => null];
        }
    }

    /**
     * Upload multiple files to the knowledge base.
     * Returns per-file results including 'document_entry' for each successful upload.
     */
    public function addFiles(array $files, ?string $parentFolderId = null): array
    {
        $results = [];
        $success = 0;
        $failed  = 0;

        foreach ($files as $index => $file) {
            logger()->info('ElevenLabs: Uploading file ' . ($index + 1) . '/' . count($files), [
                'file' => $file['name'],
            ]);

            $result = $this->addFile($file['path'], $file['name'], $parentFolderId);

            $results[] = $result;
            $result['success'] ? $success++ : $failed++;

            usleep(300000); // 300ms between uploads
        }

        return [
            'success'       => $failed === 0,
            'total'         => count($files),
            'success_count' => $success,
            'failed_count'  => $failed,
            'results'       => $results,
        ];
    }

    // =========================================================================
    // RAG Index
    // =========================================================================

    /**
     * Send a document to the RAG index.
     * Called automatically after every successful document creation.
     */
    public function sendToRagIndex(string $documentId, string $model = 'e5_mistral_7b_instruct'): array
    {
        try {
            $response = $this->client->post('/v1/convai/knowledge-base/rag-index', [
                'headers' => ['Content-Type' => 'application/json'],
                'json'    => [
                    'items' => [
                        [
                            'document_id'       => $documentId,
                            'create_if_missing' => true,
                            'model'             => $model,
                        ],
                    ],
                ],
            ]);

            $body = json_decode((string) $response->getBody(), true);

            logger()->info('ElevenLabs: Sent document to RAG index', [
                'document_id' => $documentId,
                'model'       => $model,
            ]);

            return ['success' => true, 'document_id' => $documentId, 'data' => $body];

        } catch (RequestException $e) {
            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs: Failed to send to RAG index', [
                'document_id' => $documentId,
                'error'       => $errorBody,
            ]);

            return ['success' => false, 'document_id' => $documentId, 'error' => $errorBody];
        }
    }

    public function getKnowledgeBaseDocument(string $documentId)
    {

        try {

            $response = $this->client->get("/v1/convai/knowledge-base/{$documentId}");

            $data = json_decode($response->getBody()->getContents(), true);

            return $data;

        } catch (RequestException $e) {

            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs: Failed to send to RAG index', [
                'document_id' => $documentId,
                'error'       => $errorBody,
            ]);

            return ['success' => false, 'document_id' => $documentId, 'error' => $errorBody];
        }

    }

    public function getKnowledgeBaseFolderDocuments(string $parentFolderId)
    {

        try {

            $response = $this->client->get("/v1/convai/knowledge-base?parent_folder_id={$parentFolderId}");

            $data = json_decode($response->getBody()->getContents(), true);

            return $data;

        } catch (RequestException $e) {

            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs: Failed to send to RAG index', [
                'document_id' => $documentId,
                'error'       => $errorBody,
            ]);

            return ['success' => false, 'folder_id' => $documentId, 'error' => $errorBody];
        }

    }

    // =========================================================================
    // DB persistence (private)
    // =========================================================================

    /**
     * Save a knowledge base document record to the local database.
     * Silently logs and skips if the save fails so the job doesn't stall.
     */
    private function saveToDatabase(string $documentId, string $name, string $type): void
    {
        try {
            KnowledgeBase::create([
                'organization_id' => $this->organizationId,
                'document_id'     => $documentId,
                'name'            => $name,
                'type'            => $type,
                'created_by'      => $this->createdBy,
            ]);

            logger()->info('ElevenLabs: Saved KB record to DB', [
                'document_id'     => $documentId,
                'name'            => $name,
                'type'            => $type,
                'organization_id' => $this->organizationId,
                'created_by'      => $this->createdBy,
            ]);

        } catch (\Throwable $e) {
            logger()->error('ElevenLabs: Failed to save KB record to DB', [
                'document_id' => $documentId,
                'error'       => $e->getMessage(),
            ]);
        }
    }
}