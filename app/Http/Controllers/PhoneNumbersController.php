<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PhoneNumbersController extends Controller
{
    public function index(Request $request){

        $user = auth()->user();
        $org = $user->organization;

        $numbers = $org->numbers()->orderBy('created_at','DESC')->get();

        return Inertia::render('PhoneNumbers',[

            'numbers' => $numbers

        ]);
    }

    public function importTwilioPhoneNumber(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'source' => 'required|in:system,external',
            'sid' => 'required_if:source,external|string|max:255|nullable',
            'token' => 'required_if:source,external|string|max:255|nullable',
        ]);

        $user = auth()->user();
        $org = $user->organization;

        /**
         * Determine credential source
         */
        if ($validated['source'] === 'system') {

            $sid = config('services.twilio.sid');
            $token = config('services.twilio.auth_token');

        } else {

            $sid = $validated['sid'];
            $token = $validated['token'];

        }

        try {

            $client = new Client([
                'timeout' => 10
            ]);

            $response = $client->request('POST', 'https://api.elevenlabs.io/v1/convai/phone-numbers', [
                'json' => [
                    'provider' => 'twilio',
                    'label' => $validated['label'],
                    'phone_number' => $validated['phone_number'],
                    'sid' => $sid,
                    'token' => $token,
                ],
                'headers' => [
                    'xi-api-key' => config('services.elevenlabs.api_key'),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['phone_number_id'])) {

                Log::error('ElevenLabs phone import invalid response', [
                    'response' => $data
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid response from ElevenLabs.'
                ], 500);
            }

            DB::beginTransaction();

            $number = $org->numbers()->create([
                'provider' => 'twilio',
                'label' => $validated['label'],
                'phone_number' => $validated['phone_number'],
                'phone_number_id' => $data['phone_number_id'],
                'source' => $validated['source'],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phone number imported successfully.',
                'number' => $number
            ], 201);

        } catch (RequestException $e) {

            Log::error('ElevenLabs Twilio import failed', [
                'phone_number' => $validated['phone_number'],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to import phone number.'
            ], 500);

        } catch (\Exception $e) {

            DB::rollBack();

            Log::error('Phone import internal error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unexpected server error.'
            ], 500);
        }
    }

    public function importPhoneNumberBySIP(Request $request)
    {
        
        // sample client request

        // {
        //     "label": "SIP Main Line",
        //     "phone_number": "+15551234567",

        //     "inbound": {
        //         "allowed_addresses": ["10.0.0.1"],
        //         "allowed_numbers": ["+155500000"],
        //         "media_encryption": "allowed",
        //         "credentials": {
        //         "username": "sipuser",
        //         "password": "secret"
        //         },
        //         "remote_domains": ["sip.example.com"]
        //     },

        //     "outbound": {
        //         "address": "sip.example.com",
        //         "transport": "tls",
        //         "media_encryption": "required",
        //         "headers": {
        //         "X-Custom": "value"
        //         },
        //         "credentials": {
        //         "username": "sipuser",
        //         "password": "secret"
        //         }
        //     }
        // }
        
        $validated = $request->validate([

            'label' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',

            // inbound trunk
            'inbound.allowed_addresses' => 'array',
            'inbound.allowed_addresses.*' => 'string',

            'inbound.allowed_numbers' => 'array',
            'inbound.allowed_numbers.*' => 'string',

            'inbound.media_encryption' => 'nullable|in:disabled,allowed,required',

            'inbound.credentials.username' => 'nullable|string',
            'inbound.credentials.password' => 'nullable|string',

            'inbound.remote_domains' => 'array',
            'inbound.remote_domains.*' => 'string',

            // outbound trunk
            'outbound.address' => 'nullable|string',
            'outbound.transport' => 'nullable|in:auto,udp,tcp,tls',
            'outbound.media_encryption' => 'nullable|in:disabled,allowed,required',

            'outbound.headers' => 'array',

            'outbound.credentials.username' => 'nullable|string',
            'outbound.credentials.password' => 'nullable|string',
        ]);

        $user = auth()->user();
        $org = $user->organization;

        try {

            $payload = [
                'provider' => 'sip_trunk',
                'label' => $validated['label'],
                'phone_number' => $validated['phone_number'],
            ];

            /**
             * Build inbound trunk config dynamically
             */
            if ($request->filled('inbound')) {

                $inbound = [];

                if ($request->filled('inbound.allowed_addresses'))
                    $inbound['allowed_addresses'] = $validated['inbound']['allowed_addresses'];

                if ($request->filled('inbound.allowed_numbers'))
                    $inbound['allowed_numbers'] = $validated['inbound']['allowed_numbers'];

                if ($request->filled('inbound.media_encryption'))
                    $inbound['media_encryption'] = $validated['inbound']['media_encryption'];

                if (!empty($validated['inbound']['credentials']['username'] ?? null)) {
                    $inbound['credentials'] = [
                        'username' => $validated['inbound']['credentials']['username'],
                        'password' => $validated['inbound']['credentials']['password'] ?? null,
                    ];
                }

                if ($request->filled('inbound.remote_domains'))
                    $inbound['remote_domains'] = $validated['inbound']['remote_domains'];

                if (!empty($inbound)) {
                    $payload['inbound_trunk_config'] = $inbound;
                }
            }

            /**
             * Build outbound trunk config dynamically
             */
            if ($request->filled('outbound')) {

                $outbound = [];

                if ($request->filled('outbound.address'))
                    $outbound['address'] = $validated['outbound']['address'];

                if ($request->filled('outbound.transport'))
                    $outbound['transport'] = $validated['outbound']['transport'];

                if ($request->filled('outbound.media_encryption'))
                    $outbound['media_encryption'] = $validated['outbound']['media_encryption'];

                if ($request->filled('outbound.headers'))
                    $outbound['headers'] = $validated['outbound']['headers'];

                if (!empty($validated['outbound']['credentials']['username'] ?? null)) {
                    $outbound['credentials'] = [
                        'username' => $validated['outbound']['credentials']['username'],
                        'password' => $validated['outbound']['credentials']['password'] ?? null,
                    ];
                }

                if (!empty($outbound)) {
                    $payload['outbound_trunk_config'] = $outbound;
                }
            }

            $client = new Client(['timeout' => 10]);

            $response = $client->request(
                'POST',
                'https://api.elevenlabs.io/v1/convai/phone-numbers',
                [
                    'json' => $payload,
                    'headers' => [
                        'xi-api-key' => config('services.elevenlabs.api_key'),
                        'Accept' => 'application/json',
                        'Content-Type' => 'application/json',
                    ],
                ]
            );

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['phone_number_id'])) {

                Log::error('ElevenLabs SIP import invalid response', [
                    'response' => $data
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid response from ElevenLabs.'
                ], 500);
            }

            DB::beginTransaction();

            $number = $org->numbers()->create([
                'provider' => 'sip_trunk',
                'label' => $validated['label'],
                'phone_number' => $validated['phone_number'],
                'phone_number_id' => $data['phone_number_id'],
                'source' => 'sip',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Phone number imported successfully.',
                'number' => $number
            ], 201);

        } catch (RequestException $e) {

            Log::error('ElevenLabs SIP import failed', [
                'phone_number' => $validated['phone_number'],
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to import SIP phone number.'
            ], 500);

        } catch (\Exception $e) {

            DB::rollBack();

            Log::error('SIP phone import internal error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unexpected server error.'
            ], 500);
        }
    }
    
    public function getAvailableNumbers(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|in:local,toll_free',
            'area_code' => 'nullable|digits:3'
        ]);

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.auth_token');

        // default type
        $type = $validated['type'] ?? 'local';

        // determine Twilio endpoint
        $endpoint = $type === 'toll_free'
            ? 'TollFree.json'
            : 'Local.json';

        $params = [
            'PageSize' => 20,
        ];

        // AreaCode only applies to local numbers
        if ($type === 'local' && !empty($validated['area_code'])) {
            $params['AreaCode'] = $validated['area_code'];
        }

        try {

            $response = Http::timeout(10)
                ->withBasicAuth($sid, $token)
                ->get(
                    "https://api.twilio.com/2010-04-01/Accounts/{$sid}/AvailablePhoneNumbers/US/{$endpoint}",
                    $params
                );

            if (!$response->successful()) {

                Log::error('Twilio available numbers request failed', [
                    'response' => $response->body()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch available numbers'
                ], 500);
            }

            $numbers = $response->json()['available_phone_numbers'] ?? [];

            return response()->json([
                'success' => true,
                'type' => $type,
                'numbers' => $numbers
            ]);

        } catch (\Exception $e) {

            Log::error('Twilio API error', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unexpected server error'  
            ], 500);
        }
    }

    public function buySystemPhoneNumber(Request $request)
    {

        $validated = $request->validate([

            'phone_number' => 'required|string'
            
        ]);

        $sid = config('services.twilio.sid');
        $token = config('services.twilio.auth_token');
        
        $response = Http::withBasicAuth(
            $sid,
            $token
        )->asForm()->post(
            "https://api.twilio.com/2010-04-01/Accounts/{$sid}/IncomingPhoneNumbers.json",
            [
                'PhoneNumber' => $validated['phone_number']
            ]
        );
        
        $data = $response->json();

        return $response->json($data);
    }

    // update phone number (edit label, add or remove agent)
    public function update(Request $request)
    {
        $user = auth()->user();
        $org  = $user->organization;

        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'update_item'     => 'required|in:label,select_agent,remove_agent',
            'agent_id'        => 'nullable|string|max:255',
            'label'           => 'nullable|string|max:255',
        ]);

        $payload = [];

        // Determine what should be updated
        if ($validated['update_item'] === 'label') {
            $request->validate([
                'label' => 'required|string|max:255'
            ]);

            $payload['label'] = $validated['label'];
        }

        if ($validated['update_item'] === 'select_agent') {
            $request->validate([
                'agent_id' => 'required|string|max:255'
            ]);

            $payload['agent_id'] = $validated['agent_id'];
        }

        if ($validated['update_item'] === 'remove_agent') {
            $payload['agent_id'] = null;
        }

        $client = new Client();

        $response = $client->request(
            'PATCH',
            "https://api.elevenlabs.io/v1/convai/phone-numbers/{$validated['phone_number_id']}",
            [
                'json' => $payload,
                'headers' => [
                    'xi-api-key'   => config('services.elevenlabs.api_key'),
                    'Content-Type' => 'application/json',
                ],
            ]
        );

        $data = json_decode($response->getBody()->getContents(), true);

        $phoneNumber = $org->numbers()->updateOrCreate(
            [
                'phone_number_id' => $data['phone_number_id'],
            ],
            [
                'label'          => $data['label'] ?? null,
                'assigned_agent' => $data['assigned_agent'] ? $data['assigned_agent'] : null,
            ]
        );

        return response()->json([
            'message' => 'Phone number updated successfully!',
            'number'  => $data
        ], 200);
    }

    public function getPhoneNumberDetails(Request $request)
    {


    }
}
