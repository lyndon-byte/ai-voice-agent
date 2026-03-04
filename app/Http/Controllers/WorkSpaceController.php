<?php

namespace App\Http\Controllers;

use App\Models\Secrets;
use App\Models\Webhooks;
use GuzzleHttp\Client;
use Illuminate\Http\Request;

class WorkSpaceController extends Controller
{
    public function webhooks(Request $request)
    {
        $user = auth()->user();
        $org  = $user->organization;

        $query = Webhooks::where('organization_id', $org->id);

        if ($request->filled('webhook_id')) {

            $webhook = $query->where('webhook_id', $request->webhook_id)->first();

            return response()->json([
                'webhook' => $webhook,
            ], 200);
        }

        $webhooks = $query->get();

        return response()->json([
            'webhooks' => $webhooks,
        ], 200);
    }

    public function createWebhook(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string',
            'webhook_url' => 'required|url'
        ]);

        $user = auth()->user();
        $org = $user->organization;

        $client = new Client();

        $response = $client->request('POST', 'https://api.elevenlabs.io/v1/workspace/webhooks', [
            'json' => [
                "settings" => [
                    "auth_type" => "hmac",
                    "name" => $validated["name"],
                    "webhook_url" => $validated["webhook_url"]
                ]
            ],
            'headers' => [
                'xi-api-key' => env('ELEVEN_LABS_KEY'),
                'Content-Type' => 'application/json',
            ],
        ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);

        $webhook = $org->webhooks()->create([

            'webhook_id' => $data["webhook_id"],
            'name' => $validated["name"],
            'webhook_url' => $validated["webhook_url"],

        ]);

        return response()->json([
            'webhook_id' => $data['webhook_id'],
            'secret' => $data['webhook_secret']
        ],202);

    }

    public function secrets(Request $request)
    {
        $user = auth()->user();
        $org  = $user->organization;

        $query = Secrets::where('organization_id', $org->id);

        if ($request->filled('secret_id')) {

            $secret = $query->where('secret_id', $request->secret_id)->first();

            return response()->json([
                'secret' => $secret,
            ], 200);
        }

        $secrets = $query->get();

        return response()->json([
            'secrets' => $secrets,
        ], 200);
    }

    public function createSecret(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'value' => 'required|string|max:255'
        ]);

        $user = auth()->user();
        $org = $user->organization; 

        $client = new Client();

        $response = $client->request('POST', 'https://api.elevenlabs.io/v1/convai/secrets', [
            'json' => [
                "type" => "new",
                "name" => $validated["name"],
                "value" => $validated["value"]
            ],
            'headers' => [
                'xi-api-key' => env('ELEVEN_LABS_KEY'),
                'Content-Type' => 'application/json',
            ],
        ]);

        $body = $response->getBody()->getContents();
        $data = json_decode($body, true);

        $secret = $org->secrets()->create([

            'secret_id' => $data["secret_id"],
            'name' => $data["name"],

        ]);

        return response()->json([
           
            'secret_id' => $secret["secret_id"],
            'name' => $secret["name"],

        ],202);

    }
}
