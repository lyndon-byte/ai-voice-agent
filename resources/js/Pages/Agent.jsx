import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Save, 
    ArrowLeft, 
    Plus,
    Edit2,
    Trash2,
    Bot,
    MessageSquare,
    Settings,
    Palette,
    Database,
    Webhook,
    BookOpen,
    Wrench,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function Agent({ agent }) {
    const [activeTab, setActiveTab] = useState('configuration');

    const tabs = [
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'knowledge', label: 'Knowledge & Tools', icon: Database },
        { id: 'evaluation', label: 'Evaluation', icon: CheckCircle2 },
        { id: 'widget', label: 'Widget', icon: Palette },
        { id: 'advanced', label: 'Advanced', icon: Settings },
    ];

    const config = agent?.conversation_config;
    const platformSettings = agent?.platform_settings;

    return (
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
                            href="/agents"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 sm:h-9 sm:w-9"
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
                    {/* Configuration Tab */}
                    {activeTab === 'configuration' && (
                        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
                            {/* Left Column - Main Content */}
                            <div className="space-y-6">
                                {/* System Prompt */}
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-gray-900">System prompt</h3>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <textarea
                                            defaultValue={config?.agent?.prompt?.prompt || "You are a helpful assistant."}
                                            rows={5}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                                            placeholder="You are a helpful assistant..."
                                        />
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                            <span className="text-xs text-gray-600">
                                                Type <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">{'{{ }}'}</code> to add variables
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <label className="flex cursor-pointer items-center gap-2">
                                                    <input type="checkbox" className="peer sr-only" />
                                                    <div className="relative h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-gray-900">
                                                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4"></div>
                                                    </div>
                                                    <span className="text-xs text-gray-700">Default personality</span>
                                                </label>
                                                <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Set timezone
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* First Message */}
                                <div>
                                    <div className="mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">First message</h3>
                                        <p className="mt-0.5 text-xs text-gray-500">
                                            The first message the agent will say. If empty, the agent will wait for the user to start the conversation.{' '}
                                            <a href="#" className="text-blue-600 hover:underline">Disclosure Requirements →</a>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <textarea
                                            defaultValue={config?.agent?.first_message || "Hello! How can I help you?"}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                                            placeholder="Hello! How can I help you?"
                                        />
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                            <span className="text-xs text-gray-600">
                                                Type <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">{'{{ }}'}</code> to add variables
                                            </span>
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input type="checkbox" className="peer sr-only" />
                                                <div className="relative h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-gray-900">
                                                    <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4"></div>
                                                </div>
                                                <span className="text-xs text-gray-700">Interruptible</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Turn Management */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-gray-600" />
                                        <h3 className="text-sm font-semibold text-gray-900">Turn Management</h3>
                                    </div>
                                    <ModernField label="Turn Eagerness">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                            <select 
                                                defaultValue={config?.turn?.turn_eagerness}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:flex-1 sm:text-sm"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                            </select>
                                            <span className="text-xs text-gray-500 sm:flex-1">
                                                How quickly the agent responds
                                            </span>
                                        </div>
                                    </ModernField>
                                </div>
                            </div>

                            {/* Right Column - Settings Sidebar */}
                            <div className="space-y-4">
                                {/* Voices */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900">Voices</h3>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <Settings className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="mb-3 text-xs text-gray-500">
                                        Select the ElevenLabs voices you want to use for the agent.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-gray-300">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900">Eric - Smooth, Trustworthy</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">Primary</span>
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50">
                                            <Plus className="h-3.5 w-3.5" />
                                            Add additional voice
                                        </button>
                                    </div>

                                    {/* Expressive Mode */}
                                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="text-xs font-semibold text-gray-900">Expressive Mode</span>
                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">New</span>
                                        </div>
                                        <p className="mb-3 text-xs text-gray-600">
                                            Enhance your agent with emotionally intelligent speech, natural intonation, and expressive audio tags.
                                        </p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                                Enable
                                            </button>
                                            <button className="flex-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Language</h3>
                                    <p className="mb-3 text-xs text-gray-500">
                                        Choose the default and additional languages the agent will communicate in.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-gray-300">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">🇺🇸</span>
                                                <span className="text-xs font-medium text-gray-900">English</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">Default</span>
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50">
                                            <Plus className="h-3.5 w-3.5" />
                                            Add additional languages
                                        </button>
                                    </div>
                                </div>

                                {/* LLM */}
                                <div className="rounded-lg border border-gray-200 bg-white p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900">LLM</h3>
                                    <p className="mb-3 text-xs text-gray-500">
                                        Select which provider and model to use for the LLM.
                                    </p>
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-gray-300">
                                        <span className="text-xs font-medium text-gray-900">Gemini 2.5 Flash</span>
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Knowledge & Tools Tab */}
                    {activeTab === 'knowledge' && (
                        <>
                            <ModernCard 
                                icon={BookOpen} 
                                title="Knowledge Base"
                                description="Manage knowledge sources for your agent"
                            >
                                {config?.agent?.prompt?.knowledge_base?.length > 0 ? (
                                    <div className="space-y-2">
                                        {config.agent.prompt.knowledge_base.map((kb, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                                            >
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                        <Database className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-gray-900">{kb.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Type: {kb.type} • Mode: {kb.usage_mode}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-600">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-red-600">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={BookOpen}
                                        title="No knowledge base configured"
                                        description="Add documents, FAQs, or data sources to enhance your agent's knowledge"
                                        actionLabel="Add Knowledge Base"
                                    />
                                )}
                            </ModernCard>

                            <ModernCard 
                                icon={Wrench} 
                                title="Built-in Tools"
                                description="Enable pre-built capabilities for your agent"
                            >
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {Object.entries(config?.agent?.prompt?.built_in_tools || {}).map(([key, value]) => (
                                        <ToolToggle
                                            key={key}
                                            name={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            enabled={value !== null}
                                        />
                                    ))}
                                </div>
                            </ModernCard>
                        </>
                    )}

                    {/* Evaluation Tab */}
                    {activeTab === 'evaluation' && (
                        <>
                            <ModernCard 
                                icon={CheckCircle2} 
                                title="Evaluation Criteria"
                                description="Define how to measure agent performance"
                            >
                                {platformSettings?.evaluation?.criteria?.length > 0 ? (
                                    <div className="space-y-2">
                                        {platformSettings.evaluation.criteria.map((criterion) => (
                                            <div
                                                key={criterion.id}
                                                className="rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <h4 className="text-sm font-semibold text-gray-900">
                                                                {criterion.name}
                                                            </h4>
                                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                                {criterion.type}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-600">
                                                            {criterion.conversation_goal_prompt}
                                                        </p>
                                                    </div>
                                                    <button className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-600">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={CheckCircle2}
                                        title="No evaluation criteria set"
                                        description="Add criteria to automatically evaluate conversation quality"
                                        actionLabel="Add Criteria"
                                    />
                                )}
                            </ModernCard>

                            <ModernCard 
                                icon={Database} 
                                title="Data Collection"
                                description="Collect custom data during conversations"
                            >
                                {platformSettings?.data_collection?.length > 0 ? (
                                    <div className="space-y-2">
                                        {platformSettings.data_collection.map((data, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {data.dynamic_variable || data.type}
                                                        </p>
                                                        {data.is_system_provided && (
                                                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                                                                System
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600">{data.description}</p>
                                                    {data.enum && (
                                                        <p className="mt-0.5 text-xs text-gray-500">
                                                            Options: {data.enum.join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <button className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-red-600">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Database}
                                        title="No data collection configured"
                                        description="Collect custom information during conversations"
                                        actionLabel="Add Data Field"
                                    />
                                )}
                            </ModernCard>
                        </>
                    )}

                    {/* Widget Tab */}
                    {activeTab === 'widget' && (
                        <ModernCard 
                            icon={Palette} 
                            title="Widget Customization"
                            description="Customize the look and feel of your chat widget"
                        >
                            <div className="space-y-5">
                                {/* Layout */}
                                <div>
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">Layout</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <ModernField label="Variant">
                                            <select 
                                                defaultValue={platformSettings?.widget?.variant}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                                            >
                                                <option value="full">Full</option>
                                                <option value="compact">Compact</option>
                                                <option value="minimal">Minimal</option>
                                            </select>
                                        </ModernField>
                                        <ModernField label="Placement">
                                            <select 
                                                defaultValue={platformSettings?.widget?.placement}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                                            >
                                                <option value="bottom-right">Bottom Right</option>
                                                <option value="bottom-left">Bottom Left</option>
                                                <option value="top-right">Top Right</option>
                                                <option value="top-left">Top Left</option>
                                            </select>
                                        </ModernField>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">Colors</h4>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <ColorPicker 
                                            label="Background" 
                                            value={platformSettings?.widget?.bg_color} 
                                        />
                                        <ColorPicker 
                                            label="Text Color" 
                                            value={platformSettings?.widget?.text_color} 
                                        />
                                        <ColorPicker 
                                            label="Button Color" 
                                            value={platformSettings?.widget?.btn_color} 
                                        />
                                        <ColorPicker 
                                            label="Border Color" 
                                            value={platformSettings?.widget?.border_color} 
                                        />
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h4 className="mb-3 text-sm font-semibold text-gray-900">Features</h4>
                                    <div className="space-y-2">
                                        <FeatureToggle 
                                            label="Show Transcript"
                                            checked={platformSettings?.widget?.transcript_enabled}
                                        />
                                        <FeatureToggle 
                                            label="Text Input"
                                            checked={platformSettings?.widget?.text_input_enabled}
                                        />
                                        <FeatureToggle 
                                            label="Microphone Muting"
                                            checked={platformSettings?.widget?.mic_muting_enabled}
                                        />
                                        <FeatureToggle 
                                            label="Language Selector"
                                            checked={platformSettings?.widget?.language_selector}
                                        />
                                        <FeatureToggle 
                                            label="Text Only Mode"
                                            checked={platformSettings?.widget?.supports_text_only}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ModernCard>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <>
                            <ModernCard 
                                icon={Webhook} 
                                title="Post-Call Webhook"
                                description="Send conversation data to your endpoint after each call"
                            >
                                {platformSettings?.workspace_overrides?.webhooks?.post_call_webhook_id ? (
                                    <div className="space-y-3">
                                        <ModernField label="Webhook URL">
                                            <input
                                                type="url"
                                                value={platformSettings.workspace_overrides.webhooks.post_call_webhook_id}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                                                placeholder="https://your-domain.com/webhook"
                                            />
                                        </ModernField>
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-gray-700 sm:text-sm">
                                                Events
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {platformSettings.workspace_overrides.webhooks.events?.map((event) => (
                                                    <span
                                                        key={event}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                                    >
                                                        {event}
                                                        <button className="hover:text-blue-900">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Webhook}
                                        title="No webhook configured"
                                        description="Set up a webhook to receive conversation data after each call"
                                        actionLabel="Configure Webhook"
                                    />
                                )}
                            </ModernCard>

                            <ModernCard 
                                icon={AlertCircle} 
                                title="Conversation History"
                                description="View and analyze past conversations (requires separate endpoint)"
                            >
                                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center sm:p-8">
                                    <MessageSquare className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                                    <p className="mt-2 text-xs font-medium text-gray-900 sm:mt-3 sm:text-sm">
                                        Conversation data loaded separately
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Use the Conversations tab to view chat history
                                    </p>
                                    <button className="mt-3 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 sm:mt-4 sm:px-4 sm:py-2 sm:text-sm">
                                        View Conversations
                                    </button>
                                </div>
                            </ModernCard>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Modern Components
function ModernCard({ icon: Icon, title, description, children }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md sm:rounded-xl">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
                        <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-3 sm:p-4">{children}</div>
        </div>
    );
}

function ModernField({ label, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                {label}
            </label>
            {children}
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, actionLabel }) {
    return (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-6 text-center sm:rounded-xl sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 text-gray-400 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
            <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">{description}</p>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 sm:mt-5 sm:gap-2 sm:px-5 sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {actionLabel}
            </button>
        </div>
    );
}

function ColorPicker({ label, value }) {
    return (
        <ModernField label={label}>
            <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                    <input
                        type="color"
                        defaultValue={value}
                        className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent sm:h-10"
                    />
                    <div 
                        className="pointer-events-none absolute inset-0 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: value }}
                    />
                </div>
                <input
                    type="text"
                    defaultValue={value}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono sm:text-sm"
                />
            </div>
        </ModernField>
    );
}

function FeatureToggle({ label, checked }) {
    const [isChecked, setIsChecked] = useState(checked || false);
    
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-gray-300 hover:bg-white">
            <span className="text-xs font-medium text-gray-900 sm:text-sm">{label}</span>
            <div className="relative flex-shrink-0">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-blue-600 sm:h-6 sm:w-11"></div>
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4 sm:h-5 sm:w-5 sm:peer-checked:translate-x-5"></div>
            </div>
        </label>
    );
}

function ToolToggle({ name, enabled }) {
    const [isEnabled, setIsEnabled] = useState(enabled || false);
    
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
            <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                    <Wrench className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">{name}</span>
            </div>
            <label className="relative flex-shrink-0 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="peer sr-only"
                />
                <div className="h-4 w-8 rounded-full bg-gray-300 transition-all peer-checked:bg-green-600 sm:h-5 sm:w-9"></div>
                <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4 sm:h-4 sm:w-4"></div>
            </label>
        </div>
    );
}