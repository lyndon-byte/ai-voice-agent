import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Save, ArrowLeft, Trash2, Settings, Database, CheckCircle2, Palette, BookOpen, Wrench } from 'lucide-react';

// Tab Components
import ConfigurationTab from '@/Components/Tabs/ConfigurationTab';
import KnowledgeTab from '@/Components/Tabs/KnowledgeTab';
import ToolsTab from '@/Components/Tabs/ToolsTab';
import EvaluationTab from '@/Components/Tabs/EvaluationTab';
import WidgetTab from '@/Components/Tabs/WidgetTab';
import AdvancedTab from '@/Components/Tabs/AdvancedTab';

import { AgentChangesProvider } from '@/Contexts/Agentchangescontext';
import UnsavedChangesBar from '@/Components/Unsavedchangesbar';

export default function Agent({ agent,currentVoice,localKb }) {
    
    const [activeTab, setActiveTab] = useState('configuration');

    const tabs = [
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
        { id: 'tools', label: 'Tools', icon: Wrench },
        { id: 'evaluation', label: 'Evaluation', icon: CheckCircle2 },
        { id: 'widget', label: 'Widget', icon: Palette },
        { id: 'advanced', label: 'Advanced', icon: Settings },
    ];

    const config = agent?.conversation_config;
    const platformSettings = agent?.platform_settings;

    const handleSaveSuccess = (updatedData) => {
        // Optionally refresh the page or update local state
        console.log('Agent saved successfully:', updatedData);
        // You could use Inertia to reload the page with fresh data:
        // router.reload({ only: ['agent'] });
    };

    return (

        <AgentChangesProvider initialAgent={agent}>

            <AuthenticatedLayout
                header={
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold leading-tight text-gray-800 sm:text-xl">
                            {agent?.name || 'Agent Configuration'}
                        </h2>
                    </div>
                }
            >
                <Head title="Agent Configuration" />

                <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/app/agents"
                                className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 sm:h-9 sm:w-9"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                                    {agent?.name}
                                </h1>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    ID: {agent?.agent_id}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 sm:flex-none sm:px-4 sm:text-sm">
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                            </button>
                            <button className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 sm:flex-none sm:px-5 sm:text-sm">
                                <Save className="h-3.5 w-3.5" />
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-4 sm:mb-6">
                        <nav className="flex space-x-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:text-sm ${
                                            activeTab === tab.id
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                        {activeTab === 'configuration' && (
                            <ConfigurationTab 
                              agent={agent} 
                              config={config} 
                              currentVoice={currentVoice}
                            />
                        )}
                        
                        {activeTab === 'knowledge' && (
                            <KnowledgeTab 
                              config={config} 
                              agent={agent}
                              localKb={localKb} 
                            />
                        )}
                        
                        {activeTab === 'tools' && (
                            <ToolsTab config={config} agentId={agent.agent_id} />
                        )}
                        
                        {activeTab === 'evaluation' && (
                            <EvaluationTab platformSettings={platformSettings} agentId={agent.agent_id} />
                        )}
                        
                        {activeTab === 'widget' && (
                            <WidgetTab agent={agent} platformSettings={platformSettings} />
                        )}
                        
                        {activeTab === 'advanced' && (
                            <AdvancedTab platformSettings={platformSettings} />
                        )}
                    </div>
                </div>

                <UnsavedChangesBar 
                    agentId={agent?.agent_id}
                    onSaveSuccess={handleSaveSuccess}
                />

            </AuthenticatedLayout>

      </AgentChangesProvider>

    );
}