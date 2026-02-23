<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ElevenLabsAgentService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => 'https://api.elevenlabs.io',
            'timeout'  => 30,
            'headers'  => [
                'xi-api-key'   => config('services.elevenlabs.api_key'),
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    // =========================================================================
    // Get agent
    // =========================================================================

    /**
     * Fetch the full agent config from ElevenLabs.
     */
    public function getAgent(string $agentId): array
    {
        $response = $this->client->get("/v1/convai/agents/{$agentId}");

        return json_decode((string) $response->getBody(), true);
    }

    /**
     * Extract the existing knowledge_base array from the agent config.
     * Returns an empty array if none exists yet.
     *
     * ElevenLabs path: conversation_config.agent.prompt.knowledge_base
     * Each item shape:  ['id' => 'document_id', 'type' => 'file|url|text']
     */
    public function getAgentKnowledgeBase(string $agentId): array
    {
        $agent = $this->getAgent($agentId);

        return $agent['conversation_config']['agent']['prompt']['knowledge_base'] ?? [];
        
    }

    // =========================================================================
    // Attach
    // =========================================================================

    /**
     * Merge new documents into the agent's existing knowledge base,
     * PATCH the agent, and update RAG flag accordingly.
     *
     * $newDocuments — array of ['id' => 'document_id', 'type' => 'file|url|text']
     */
    public function attachKnowledgeBase(string $agentId, array $newDocuments): array
    {
        try {
            // Step 1 — Fetch current KB
            $existing = $this->getAgentKnowledgeBase($agentId);

            logger()->info('ElevenLabs Agent: Fetched existing KB for attach', [
                'agent_id'       => $agentId,
                'existing_count' => count($existing),
            ]);

            $newDocuments = array_values(array_filter(
                $newDocuments,
                fn($doc) => is_array($doc) && ! empty($doc['id'])
            ));

            if ($existing === null) {
                $toAdd  = $newDocuments;
                $merged = $newDocuments;
            } else {
                $existingIds = array_column($existing, 'id');

                $toAdd = array_values(array_filter(
                    $newDocuments,
                    fn($doc) => ! in_array($doc['id'], $existingIds, true)
                ));

                $merged = array_values(array_merge($existing, $toAdd));
            }

            if (empty($toAdd)) {
                logger()->info('ElevenLabs Agent: All documents already attached, skipping patch', [
                    'agent_id' => $agentId,
                ]);

                return [
                    'success'  => true,
                    'agent_id' => $agentId,
                    'merged'   => $existing,
                    'added'    => 0,
                    'skipped'  => count($newDocuments),
                ];
            }

            // Step 4 — PATCH agent: update knowledge_base + enable RAG (has docs now)
            $result = $this->patchAgent($agentId, $merged, rag: true);

            logger()->info('ElevenLabs Agent: ✅ KB attached to agent', [
                'agent_id' => $agentId,
                'existing' => count($existing),
                'added'    => count($toAdd),
                'total'    => count($merged),
                'rag'      => true,
            ]);

            return [
                'success'  => true,
                'agent_id' => $agentId,
                'merged'   => $merged,
                'added'    => count($toAdd),
                'skipped'  => count($newDocuments) - count($toAdd),
                'rag'      => true,
                'data'     => $result,
            ];

        } catch (RequestException $e) {
            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs Agent: ❌ Failed to attach KB', [
                'agent_id' => $agentId,
                'error'    => $errorBody,
            ]);

            return ['success' => false, 'agent_id' => $agentId, 'error' => $errorBody];
        }
    }

    // =========================================================================
    // Detach
    // =========================================================================

    /**
     * Remove specific documents from the agent's knowledge base,
     * PATCH the agent with the remaining list, and update RAG flag:
     *   - RAG = true  if remaining KB is non-empty
     *   - RAG = false if KB is now empty
     *
     * $documentId — array of document ID strings to remove e.g. ['doc_abc', 'doc_xyz']
     */
    public function detachKnowledgeBase(string $agentId, string $documentId): array
    {
        try {
            // Step 1 — Fetch current KB
            $existing = $this->getAgentKnowledgeBase($agentId);

            logger()->info('ElevenLabs Agent: Fetched existing KB for detach', [
                'agent_id'       => $agentId,
                'existing_count' => count($existing),
                'removing'       => $documentId,
            ]);

            $remaining = array_values(array_filter(
                $existing,
                fn($doc) => $doc['id'] !== $documentId
            ));

            $removedCount = count($existing) - count($remaining);

            if ($removedCount === 0) {
                logger()->info('ElevenLabs Agent: None of the given document IDs were attached, skipping patch', [
                    'agent_id' => $agentId,
                ]);

                return [
                    'success'   => true,
                    'agent_id'  => $agentId,
                    'remaining' => $existing,
                    'removed'   => 0,
                    'rag'       => ! empty($existing),
                ];
            }

            // Step 3 — RAG = true only if there are still documents left
            $rag = ! empty($remaining);

            // Step 4 — PATCH agent: update knowledge_base + toggle RAG flag
            $result = $this->patchAgent($agentId, $remaining, rag: $rag);

            logger()->info('ElevenLabs Agent: ✅ KB detached from agent', [
                'agent_id'  => $agentId,
                'removed'   => $removedCount,
                'remaining' => count($remaining),
                'rag'       => $rag,
            ]);

            return [
                'success'   => true,
                'agent_id'  => $agentId,
                'remaining' => $remaining,
                'removed'   => $removedCount,
                'rag'       => $rag,
                'data'      => $result,
            ];

        } catch (RequestException $e) {
            $errorBody = $e->hasResponse()
                ? (string) $e->getResponse()->getBody()
                : $e->getMessage();

            logger()->error('ElevenLabs Agent: ❌ Failed to detach KB', [
                'agent_id' => $agentId,
                'error'    => $errorBody,
            ]);

            return ['success' => false, 'agent_id' => $agentId, 'error' => $errorBody];
        }
    }

    // =========================================================================
    // Private — shared PATCH helper
    // =========================================================================

    /**
     * PATCH the agent with an updated knowledge_base list and RAG flag.
     *
     * Sends a single PATCH request updating:
     *   conversation_config.agent.prompt.knowledge_base  ← updated list
     *   conversation_config.agent.prompt.rag             ← true if KB non-empty, false if empty
     */
    public function patchAgent(string $agentId, array $knowledgeBase, bool $rag): array
    {
        $response = $this->client->patch("/v1/convai/agents/{$agentId}", [
            'json' => [
                'conversation_config' => [
                    'agent' => [
                        'prompt' => [
                            'knowledge_base' => $knowledgeBase,
                            'rag'            => ['enabled' => $rag],
                        ],
                    ],
                ],
            ],
        ]);


        return json_decode($response->getBody()->getContents(), true);
    }
}