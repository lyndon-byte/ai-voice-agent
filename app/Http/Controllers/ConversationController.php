<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConversationController extends Controller
{
    public function publicView(Request $request, $conversation_id)
    {
        if (!$request->hasValidSignature()) {
            abort(403);
        }

        $agentName = $request->query('agent_name');

        $client = new Client();
 
        $response = $client->request('GET', "https://api.elevenlabs.io/v1/convai/conversations/{$conversation_id}", [

             'headers' => [
                 'xi-api-key' => env('ELEVEN_LABS_KEY'),
                 'Content-Type' => 'application/json',
             ],

         ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);
  
        return Inertia::render('ConversationPublicView',[

            'detail' => $data,
            'agentName' => $agentName

        ]);

    }
}
