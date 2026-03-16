<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class AnalysisController extends Controller
{
    public function getConversations(Request $request){

        $validated = $request->validate([
            'agent_id' => 'required'
        ]);

        $cursor = $request->next_cursor ?? "";

        $client = new Client();
 
        $response = $client->request('GET', "https://api.elevenlabs.io/v1/convai/conversations?page_size=8&cursor={$cursor}&agent_id={$validated['agent_id']}", [

             'headers' => [
                 'xi-api-key' => env('ELEVEN_LABS_KEY'),
                 'Content-Type' => 'application/json',
             ],

         ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);
  
        return response()->json($data);
    }

    public function getConversationDetails(Request $request){

        $validated = $request->validate([
            'conversation_id' => 'required'
        ]);

        $client = new Client();
 
        $response = $client->request('GET', "https://api.elevenlabs.io/v1/convai/conversations/{$validated['conversation_id']}", [

             'headers' => [
                 'xi-api-key' => env('ELEVEN_LABS_KEY'),
                 'Content-Type' => 'application/json',
             ],

         ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);

        $link = URL::temporarySignedRoute(
            'conversation.audio',
            now()->addHours(24),
            [
                'conversation_id' => $validated['conversation_id']
            ]
        );
  
        return response()->json(
            
            [
                'data' => $data,
                'audioLink' => $link
                
            ]
        );
    }

    public function getConversationAudio(Request $request){

        if (!$request->hasValidSignature()) {
            abort(403);
        }
    
        $validated = $request->validate([
            'conversation_id' => 'required'
        ]);

        $client = new Client();
 
        $response = $client->request('GET', "https://api.elevenlabs.io/v1/convai/conversations/{$validated['conversation_id']}/audio", [

             'headers' => [
                 'xi-api-key' => config('services.elevenlabs.api_key'),
                 'Content-Type' => 'application/json',
             ],

         ]);

         return $response->getBody(); 

    }

    
}
