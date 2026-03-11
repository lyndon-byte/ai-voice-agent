import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useNotifications } from '@/Hooks/Notifications';
import { Head,router } from '@inertiajs/react';
import {Settings, CheckCircle2, Palette, BookOpen, Wrench } from 'lucide-react';

// Tab Components
import ConfigurationTab from '@/Components/Tabs/ConfigurationTab';
import KnowledgeTab from '@/Components/Tabs/KnowledgeTab';
import ToolsTab from '@/Components/Tabs/ToolsTab';
import EvaluationTab from '@/Components/Tabs/EvaluationTab';
import WidgetTab from '@/Components/Tabs/WidgetTab';
import AdvancedTab from '@/Components/Tabs/AdvancedTab';

import { AgentChangesProvider } from '@/Contexts/Agentchangescontext';
import { ElevenLabsProvider } from '@/Contexts/ElevenLabsProvider';
import UnsavedChangesBar from '@/Components/Unsavedchangesbar';

export default function Agent({ agent,currentVoice,localKb,currentTab }) {

    const { notify, NotificationPortal } = useNotifications();
    
    const activeTab = currentTab;

    const rootUrl = `/app/agents/agent?agentId=${agent.agent_id}&currentTab`

    const tabs = [
        { id: 'configuration', label: 'Configuration', icon: Settings , href: `${rootUrl}=configuration` },
        { id: 'knowledge', label: 'Knowledge', icon: BookOpen, href: `${rootUrl}=knowledge` },
        { id: 'tools', label: 'Tools', icon: Wrench, href: `${rootUrl}=tools` },
        { id: 'evaluation', label: 'Evaluation', icon: CheckCircle2, href: `${rootUrl}=evaluation` },
        { id: 'widget', label: 'Widget', icon: Palette, href: `${rootUrl}=widget` },
        { id: 'advanced', label: 'Advanced', icon: Settings, href: `${rootUrl}=advanced` },
    ];

    const config = agent?.conversation_config;
    const platformSettings = agent?.platform_settings;

    const handleReset = () => {

        router.get(`${rootUrl}=${activeTab}`);
    }

    const handleSaveSuccess = () => {
        notify({ type: "success", title: "Saved!", message: "Your changes were saved." });
    };

    return (

        <AgentChangesProvider initialAgent={agent}>
            <ElevenLabsProvider>
                <AuthenticatedLayout
                    header={  
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                                {agent?.name}
                            </h1>
                            <p className="mt-0.5 text-xs text-gray-500">
                                ID: {agent?.agent_id}
                            </p>
                        </div>
                    }
                    tabs={tabs}
                    activeTab={currentTab}
                >

                <Head title="Agent Configuration" />

                <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
                 
                    {/* Tab Content */}
                        <div className="space-y-4 mt-10">
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
                                <AdvancedTab  />
                            )}
                        </div>
                </div>

                <UnsavedChangesBar 
                    agentId={agent?.agent_id}
                    onSaveSuccess={handleSaveSuccess}
                    onClearChanges={handleReset}
                />
                
                <NotificationPortal/>

            </AuthenticatedLayout>
         </ElevenLabsProvider>                  
      </AgentChangesProvider>

    );
}