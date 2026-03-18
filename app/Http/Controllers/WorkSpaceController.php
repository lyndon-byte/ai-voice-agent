<?php

namespace App\Http\Controllers;

use App\Mail\PostCallNotificationMail;
use App\Models\Agents;
use App\Models\Secrets;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class WorkSpaceController extends Controller
{
    public function webhook(Request $request)
    {
        
        $user = auth()->user();
        $org  = $user->organization;

        $webhook = $org->webhook;

        return response()->json([
            'webhook' => $webhook,
        ], 200);
        

    }

    public function createWebhook(Request $request)
    {

        $validated = $request->validate([
            'name' => 'required|string',
            'webhook_url' => 'required|url',
            'agent_id' => 'required|string'
        ]);

        $secret = 'whsec_' . Str::random(40);
        $webhookId = 'wh-' . bin2hex(random_bytes(10));

        $user = auth()->user();
        $org = $user->organization;

        $webhook = $org->webhook()->create([

            'webhook_id' => $webhookId,
            'agent_id' => $validated["agent_id"],
            'name' => $validated["name"],
            'webhook_url' => $validated["webhook_url"],
            'auth_hmac' => $secret

        ]);

        return response()->json([
            'webhook_id' => $webhook->webhook_id,
            'secret' => $webhook->auth_hmac
        ],202);

    }

    // receive webhook directly passed by elevenlabs to pass it to webhook set by org. (this is for capturing call logs)
    public function receiveWebhook(Request $request){
        
        $secret = config('services.elevenlabs.webhook_auth_key');

        $header = $request->header('ElevenLabs-Signature');

        if (!$header) {
            return response()->json(['error' => 'Missing signature'], 400);
        }

        $parts = [];
        foreach (explode(',', $header) as $item) {
            [$k,$v] = explode('=', $item);
            $parts[$k] = $v;
        }

        $timestamp = $parts['t'] ?? null;
        $signature = $parts['v0'] ?? null;

        if (!$timestamp || !$signature) {
            return response()->json(['error' => 'Invalid signature format'], 400);
        }

        $payload = $request->getContent();
        $signedPayload = $timestamp . '.' . $payload;
        $computed = hash_hmac('sha256', $signedPayload, $secret);

        // Compare
        if (!hash_equals($computed, $signature)) {

            Log::warning('Invalid ElevenLabs webhook signature', [
                'computed' => $computed,
                'received' => $signature
            ]);

            return response()->json(['error' => 'Invalid signature'], 401);
        }

        Log::info('Webhook verified', [
            'payload' => json_decode($payload, true)
        ]);

        $decodedPayload = json_decode($request->getContent(), true);

        $data = $decodedPayload['data'] ?? [];

        $agent = Agents::where('agent_id', $data['agent_id'] ?? null)->first();

        if (!$agent) {

            \Log::warning('Agent not found', [
                'agent_id' => $data['agent_id'] ?? null
            ]);

            return response()->json(['status' => 'agent_not_found'], 200);
        }

        $org = $agent->organization;

        $org->receivedCalls()->create([

            'agent_name' => $data['agent_name'] ?? null,
            'agent_id'   => $data['agent_id'] ?? null,
            'duration'   => data_get($data, 'metadata.call_duration_secs'),
            'credits'    => data_get($data, 'metadata.cost'),
            'llm_cost'   => data_get($data, 'metadata.charging.llm_charge'),

        ]);

        $webhook = $org->webhook()->where('agent_id',$data['agent_id'])->first();
    
        $receivers = $org->postCallNotificationReceivers()->pluck('email');

        if ($webhook) {
        
            $rawPayload = $request->getContent();
        
            $signature = hash_hmac('sha256', $rawPayload, $webhook->auth_hmac);
        
            Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-Webhook-Signature' => $signature
            ])
            ->withBody($rawPayload, 'application/json')
            ->post($webhook->webhook_url);
        }

        // check post call notification receiver
        if ($receivers->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No receivers configured'
            ]);
        }

        $link = URL::temporarySignedRoute(
            'conversation.public',
            now()->addDays(7),
            [
                'conversation_id' => $data['conversation_id'],
                'agent_name' => $data['agent_name']
            ]
        );

        foreach ($receivers as $email) {

            Mail::to($email)->send(
                new PostCallNotificationMail(
                    $data['agent_name'],
                    $data['conversation_id'],
                    $link
                )
            );
    
        }
    
        return response()->json(['status' => 'saved']);        

    }

    public function deleteWebhook(Request $request){

        $org = auth()->user()->organization;

        $webhook = $org->webhook;
    
        if (!$webhook) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook not found'
            ], 404);
        }
    
        $webhook->delete();
    
        return response()->json([
            'success' => true,
            'message' => 'Webhook deleted successfully'
        ], 200);


    }

    public function addPostCallEmailNotificationReceiver(Request $request){

        $user = auth()->user();
        $org  = $user->organization;

        $validated = $request->validate([
            'emails' => 'required|array',
            'emails.*' => 'email'
        ]);

        $org->postCallNotificationReceivers()->createMany(
            collect($validated['emails'])->map(fn($email) => [
                'email' => $email
            ])->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'successfully added receivers'
        ], 200);
    }

    public function removePostCallEmailNotificationReceiver(Request $request){

        $user = auth()->user();
        $org  = $user->organization;

        $validated = $request->validate([
            'email' => 'required|email'
        ]);

        $receiver = $org->postCallNotificationReceivers()
            ->where('email', $validated['email'])
            ->first();

        if (!$receiver) {
            return response()->json([
                'success' => false,
                'message' => 'Receiver not found'
            ], 404);
        }

        $receiver->delete();

        return response()->json([
            'success' => true,
            'message' => 'Receiver deleted successfully'
        ]);
    }

    public function postCallEmailNotificationReceivers(Request $request){

        $org = auth()->user()->organization;

        return response()->json([
            'receivers' => $org->postCallNotificationReceivers()
                ->pluck('email')
        ]);
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
