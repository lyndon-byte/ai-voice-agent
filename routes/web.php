<?php

use App\Http\Controllers\AgentChangesController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\JobTrackerController;
use App\Http\Controllers\KnowledgeBaseController; 
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ToolsController;
use App\Http\Controllers\VoiceController;
use App\Http\Controllers\WorkSpaceController;
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
    Route::post('/app/add-avatar-image', [AgentController::class, 'addAvatarImage']);


    Route::get('/app/agent-changes/session', [AgentChangesController::class, 'get']);
    Route::post('/app/agent-changes/session', [AgentChangesController::class, 'store']);
    Route::delete('/app/agent-changes/session', [AgentChangesController::class, 'clear']);


    Route::get('/app/voices', [VoiceController::class, 'getVoices'])->name('voices');

    Route::post('/app/knowledge-base',[KnowledgeBaseController::class, 'store']); 
    Route::post('/app/knowledge-base/detach',[KnowledgeBaseController::class, 'detach']);
    Route::get('/app/knowledge-base/get-document',[KnowledgeBaseController::class, 'getDocument']);
    Route::get('/app/knowledge-base/get-folder-documents',[KnowledgeBaseController::class, 'getFolderDocuments']);

    Route::post('/check-job',[JobTrackerController::class, 'checkJob']);

    Route::post('/app/save-tool',[ToolsController::class, 'store']);
    Route::post('/app/update-tool',[ToolsController::class, 'update']);
    Route::get('/app/get-tools',[ToolsController::class, 'getTools']);
    Route::get('/app/get-tool-details',[ToolsController::class, 'getToolDetails']);


    Route::get('/app/get-conversations',[AnalysisController::class, 'getConversations']);
    Route::get('/app/get-conversation-details',[AnalysisController::class, 'getConversationDetails']);
    Route::get('/app/get-conversation-audio',[AnalysisController::class, 'getConversationAudio']);

    Route::get('/app/get-webhooks',[WorkSpaceController::class, 'webhooks']);
    Route::post('/app/create-webhook',[WorkSpaceController::class, 'createWebhook']);
    Route::get('/app/get-secrets',[WorkSpaceController::class, 'secrets']);
    Route::post('/app/create-secret',[WorkSpaceController::class, 'createSecret']);
    

    Route::get('/test',function(){

        // $client = new \GuzzleHttp\Client();
        // $response = $client->request('GET', 'https://api.elevenlabs.io/v1/convai/agents/agent_0001khkj48t8f818stz6zrw03s81',[

        //     'headers' => [

        //         'xi-api-key' => env('ELEVEN_LABS_KEY'),
        //         'Content-Type' => 'application/json'
        //     ]

        // ]);

        // return json_decode($response->getBody()->getContents(),true);

        return response()->json([
            'changes' => session('agent_changes', [])
        ]);

    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
