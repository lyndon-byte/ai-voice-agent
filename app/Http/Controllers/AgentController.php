<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index(Request $request){

        $user = auth()->user();
        $org = $user->organization;

        $agents = $org->agents()->orderBy('created_at','DESC')->get();

        return Inertia::render('Agents',[

            'agents' => $agents
        ]);

    }


    public function getAgents(Request $request){

        $user = auth()->user();
        $org = $user->organization;

        $agents = $org->agents()->orderBy('created_at','DESC')->get();

        return response()->json([

            'agents' => $agents 

        ]);

    }

    public function create(Request $request){

        return Inertia::render('CreateAgent');
    }

    public function store(Request $request){

        $request->validate([
           'agent_name' => 'required|string'
        ]);

        $client = new Client();

        $response = $client->request('POST', 'https://api.elevenlabs.io/v1/convai/agents/create', [
            'json' => [
                'name' => $request->agent_name,
                'conversation_config' => [
                    'agent' => [
                        'first_message' => 'Hello! How can I help you?',
                        'prompt' => [
                            'prompt' => 'You are a helpful assistant.',
                        ],
                    ],
                ],
            ],
            'headers' => [
                'xi-api-key' => env('ELEVEN_LABS_KEY'),
                'Content-Type' => 'application/json',
            ],
        ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);

        $agentId = $data['agent_id'];

        $user = auth()->user();
        $org = $user->organization;

        $agent = $org->agents()->create([

            'agent_id' => $agentId,
            'agent_name' => $request->agent_name,
            'created_by' =>  $user->name

        ]);

        return redirect()->route('agent.view', ['agentId' => $agent->agent_id ]);


    }

    public function update(Request $request){

        $validated = $request->validate([
            'agent_id' => 'required|string',
            'conversation_config' => 'sometimes|array',
            'platform_settings' => 'sometimes|array',
        ]);

        $client = new Client();

        $agentId = $validated['agent_id'];
        unset($validated['agent_id']);

        logger()->info("test", [
            'payload' =>  $validated,
        ]);

        $response = $client->request('PATCH', "https://api.elevenlabs.io/v1/convai/agents/{$agentId}", [
            'headers' => [
                'xi-api-key' => env('ELEVEN_LABS_KEY'),
                'Content-Type' => 'application/json',
            ],
            'json' => $validated
        ]);

        return response()->json([

            'message' => 'agent was updated'

        ]);

    }

    public function viewAgent(Request $request){

        $user = auth()->user();
        $org = $user->organization;
        $agentId = $request->query('agentId');

        $knowledgeBase = $org->knowledgeBase()->get();

        $client = new Client();

        try {

            $response = $client->request('GET', "https://api.elevenlabs.io/v1/convai/agents/{$agentId}",[
                'headers' => [
                    'xi-api-key' => env('ELEVEN_LABS_KEY'),
                    'Content-Type' => 'application/json',
                ],
            ]);
            
            $body = $response->getBody()->getContents();
            $agent = json_decode($body, true);


            $response = $client->request('GET', "https://api.elevenlabs.io/v1/voices/{$agent['conversation_config']['tts']['voice_id']}",[
                'headers' => [
                    'xi-api-key' => env('ELEVEN_LABS_KEY'),
                    'Content-Type' => 'application/json',
                ],
            ]);

            $body = $response->getBody()->getContents();
            $voice = json_decode($body, true);

            return Inertia::render('Agent',[

                'agent' => $agent,
                'currentVoice' => $voice,
                'localKb' => $knowledgeBase

            ]);

       } catch (ClientException $e){

          if ($e->getResponse() && $e->getResponse()->getStatusCode() === 404) {
            abort(404);
          }
       }

       
    }

    public function addAvatarImage(Request $request)
    {
        $request->validate([
            'file'     => 'required|file|mimes:jpg,jpeg,png|max:2048',
            'agent_id' => 'required|string',
        ]);
        
    
        $agentId = $request->input('agent_id');
        $file = $request->file('file');

        logger()->info("upload request", [
            'agent_id' => $agentId,
        ]);

        logger()->info('file details', [
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'path'          => $file->getRealPath(),
        ]);
    
        $client = new Client();
    
        try {

            $response = $client->request('POST', "https://api.elevenlabs.io/v1/convai/agents/{$agentId}/avatar", [
                'headers' => [
                    'xi-api-key' => env('ELEVEN_LABS_KEY'),
                ],
                'multipart' => [
                    [
                        'name'     => 'avatar_file',
                        'filename' => $file->getClientOriginalName(),
                        'contents' => fopen($file->getRealPath(), 'r'), 
                    ],
                ],
            ]);
    
            $body = json_decode($response->getBody(), true);

            logger()->info('url', [
                'avatar_url'  => $body['avatar_url'] ?? null,
            ]);
    
            return response()->json([
                'success'     => true,
                'avatar_url'  => $body['avatar_url'] ?? null,
                'raw'         => $body,
            ], 200);
    
        } catch (RequestException $e) {
    
            $errorBody = null;
    
            if ($e->hasResponse()) {
                $errorBody = json_decode($e->getResponse()->getBody(), true);
            }

            logger()->info("upload request", [
                'message' => $errorBody ?? $e->getMessage(),
            ]);
    
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar to ElevenLabs',
                'error'   => $errorBody ?? $e->getMessage(),
            ], $e->getCode() ?: 500);
    
        } catch (\Exception $e) {

            logger()->info("upload request", [
                'message' => $e->getMessage(),
            ]);
    
            return response()->json([
                'success' => false,
                'message' => 'Unexpected server error',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}
