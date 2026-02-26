<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\JobTrackerController;
use App\Http\Controllers\KnowledgeBaseController; 
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ToolsController;
use App\Http\Controllers\VoiceController;
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


Route::middleware(['auth','verified'])->group(function () {

    Route::get('/app/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/app/agents', [AgentController::class, 'index'])->name('agents');
    Route::get('/app/get-agents', [AgentController::class, 'getAgents'])->name('agents.get');
    Route::get('/app/agents/agent', [AgentController::class, 'viewAgent'])->name('agent.view');
    Route::get('/app/agents/create', [AgentController::class, 'create'])->name('agents.create');
    Route::post('/app/agents/create', [AgentController::class, 'store'])->name('agents.create.store');
    Route::patch('/app/agents/update', [AgentController::class, 'update'])->name('agents.update');


    Route::get('/app/voices', [VoiceController::class, 'getVoices'])->name('voices');

    Route::post('/app/knowledge-base',[KnowledgeBaseController::class, 'store']); 
    Route::post('/app/knowledge-base/detach',[KnowledgeBaseController::class, 'detach']);
    Route::get('/app/knowledge-base/get-document',[KnowledgeBaseController::class, 'getDocument']);
    Route::get('/app/knowledge-base/get-folder-documents',[KnowledgeBaseController::class, 'getFolderDocuments']);

    Route::post('/check-job',[JobTrackerController::class, 'checkJob']);

    Route::post('/app/save-tool',[ToolsController::class, 'store']);
    Route::get('/app/get-tools',[ToolsController::class, 'getTools']);


    Route::get('/test',function(){

        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', 'https://api.elevenlabs.io/v1/convai/tools/tool_7501kdnr860cfxvvk26p0f3j36t3',[

            'headers' => [

                'xi-api-key' => env('ELEVEN_LABS_KEY'),
                'Content-Type' => 'application/json'
            ]

        ]);

        return json_decode($response->getBody()->getContents(),true);

    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
