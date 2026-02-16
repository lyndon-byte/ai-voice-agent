<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\ProfileController;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/app/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified','org','role:owner'])->name('dashboard');


Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/app/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/app/agents', [AgentController::class, 'index'])->name('agents');
    Route::get('/app/agents/agent', [AgentController::class, 'viewAgent'])->name('agent.view');
    Route::get('/app/agents/create', [AgentController::class, 'create'])->name('agents.create');
    Route::post('/app/agents/create', [AgentController::class, 'store'])->name('agents.create.store');

    Route::get('/test', function (){

        $agentId = 'agent_1401khhdv21tf5dr349d9x01e4nc';

        $client = new \GuzzleHttp\Client();

        try {

            $response = $client->request('GET', "https://api.elevenlabs.io/v1/convai/agents/{$agentId}",[
                'headers' => [
                    'xi-api-key' => env('ELEVEN_LABS_KEY'),
                    'Content-Type' => 'application/json',
                ],
            ]);
            
            $body = $response->getBody()->getContents();
            $data = json_decode($body, true);

            return $data;
            
        } catch (ClientException $e){

          if ($e->getResponse() && $e->getResponse()->getStatusCode() === 404) {
            abort(404);
          }
       }

    });
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
