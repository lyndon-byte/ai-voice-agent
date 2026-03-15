<?php

use App\Http\Controllers\AgentChangesController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JobTrackerController;
use App\Http\Controllers\KnowledgeBaseController; 
use App\Http\Controllers\PhoneNumbersController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdminDashboardController;
use App\Http\Controllers\SuperAdminImpersonationController;
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


Route::middleware(['auth','org','role:system'])->group(function () {
    
    // deactivate all agents at once that belongs to a certain organization
    Route::post('/admin/switch-agents',[SuperAdminDashboardController::class,'agentsSwitch']);
    Route::get('/admin/dashboard',[SuperAdminDashboardController::class,'index'])->name('system.admin.dashboard');
    Route::post('/admin/impersonate/{user}',[SuperAdminImpersonationController::class,'createToken']);
    Route::get('/impersonate/{token}',[SuperAdminImpersonationController::class,'login']);
    
});

Route::middleware(['auth','impersonation'])->group(function () {
    
    Route::post('/impersonate/leave',[SuperAdminImpersonationController::class,'leave']);

});



Route::middleware(['auth','verified','org','role:owner'])->group(function () {

    Route::get('/app/dashboard',[DashboardController::class, 'index'])->name('dashboard');
    Route::get('/app/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');

    Route::get('/app/agents', [AgentController::class, 'index'])->name('agents');
    Route::get('/app/get-agents', [AgentController::class, 'getAgents'])->name('agents.get');
    Route::get('/app/agents/agent', [AgentController::class, 'viewAgent'])->name('agent.view');
    Route::get('/app/agents/create', [AgentController::class, 'create'])->name('agents.create');
    Route::post('/app/agents/create', [AgentController::class, 'store'])->name('agents.create.store');
    Route::patch('/app/agents/update', [AgentController::class, 'update'])->name('agents.update');
    Route::post('/app/agents/agent/delete', [AgentController::class, 'destroy'])->name('agent.delete');

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

    Route::get('/app/get-webhook',[WorkSpaceController::class, 'webhook']);
    Route::post('/app/create-webhook',[WorkSpaceController::class, 'createWebhook']);
    Route::post('/app/delete-webhook',[WorkSpaceController::class, 'deleteWebhook']);
    Route::get('/app/get-secrets',[WorkSpaceController::class, 'secrets']);
    Route::post('/app/create-secret',[WorkSpaceController::class, 'createSecret']);

    Route::get('/app/post-call-email-notification-receivers',[WorkSpaceController::class, 'postCallEmailNotificationReceivers']);
    Route::post('/app/add-post-call-email-notification-receiver',[WorkSpaceController::class, 'addPostCallEmailNotificationReceiver']);
    Route::post('/app/remove-post-call-email-notification-receiver',[WorkSpaceController::class, 'removePostCallEmailNotificationReceiver']);


    
    Route::get('/app/phone-numbers',[PhoneNumbersController::class, 'index'])->name('numbers');
    Route::get('/app/available-numbers',[PhoneNumbersController::class, 'getAvailableNumbers'])->name('available.numbers');
    Route::get('/app/buy-system-number',[PhoneNumbersController::class, 'buySystemPhoneNumber']);
    Route::post('/app/import-twilio-phone-number',[PhoneNumbersController::class, 'importTwilioPhoneNumber']);
    Route::post('/app/update-phone-number',[PhoneNumbersController::class, 'update']);

    Route::get('/app/outbound',function() {

        return Inertia::render('OutboundCalls');

    })->name('outbound');


});

Route::post('/receive-webhook',[WorkSpaceController::class, 'receiveWebhook']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
