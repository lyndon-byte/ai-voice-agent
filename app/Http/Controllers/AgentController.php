<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
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

    public function viewAgent(Request $request){

        $agentId = $request->query('agentId');

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

            return Inertia::render('Agent',[

                'agent' => $agent

            ]);

       } catch (ClientException $e){

          if ($e->getResponse() && $e->getResponse()->getStatusCode() === 404) {
            abort(404);
          }
       }

       
    }

}
