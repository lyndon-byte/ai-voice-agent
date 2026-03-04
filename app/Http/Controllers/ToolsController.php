<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;

class ToolsController extends Controller
{
    
    public function getTools(Request $request)
    {
        $request->validate([
            'tool_ids' => 'required|array'
        ]);

        $user = auth()->user();
        $org = $user->organization;

        $tools = $org->tools()
            ->whereIn('tool_id', $request->tool_ids)
            ->get();

        return response()->json([
            'tools' => $tools
        ]);
    }
    
    public function store(Request $request){

        $validated =  $request->validate([
            'config' => 'required|array'
        ]);
    
        $client = new Client();
 
        $response = $client->request('POST', 'https://api.elevenlabs.io/v1/convai/tools', [

             'json' => [
                 'tool_config' => $validated['config']
             ],
             'headers' => [
                 'xi-api-key' => env('ELEVEN_LABS_KEY'),
                 'Content-Type' => 'application/json',
             ],

         ]);

 
         $body = $response->getBody()->getContents();
         $data = json_decode($body, true);
  
         $user = auth()->user();
         $org = $user->organization;
 
         $tool = $org->tools()->create([
 
             'tool_id' => $data['id'],
             'tool_name' => $data['tool_config']['name'],
             'tool_description' =>  $data['tool_config']['description'],
             'created_by' =>  $user->name
 
         ]);

         return response()->json([

            'toolId' => $tool->tool_id,
            'data' => $tool
            
         ]);

    }
}
