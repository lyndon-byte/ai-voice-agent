<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;

class VoiceController extends Controller
{
    public function getVoices(Request $request){

        $searchQuery = $request->searchQuery;

        $client = new Client();

        $response = $client->request('GET', "https://api.elevenlabs.io/v2/voices?page_size=100&search={$searchQuery}",[
            'headers' => [
                'xi-api-key' => env('ELEVEN_LABS_KEY'),
                'Content-Type' => 'application/json',
            ],
        ]);
        
        $voices = json_decode($response->getBody(), true);

        return response()->json($voices);

    }
}
