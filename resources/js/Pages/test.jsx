import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
import { timezones } from '@/timezones';
import axios from 'axios';
import { timezones } from '@/timezones';

export default function Agent({ agent }) {
    const [activeTab, setActiveTab] = useState('configuration');
    const [selectedTimezone, setSelectedTimezone] = useState(agent?.conversation_config?.agent?.prompt?.timezone || null);
    const [showTimezoneModal, setShowTimezoneModal] = useState(false);
    // Toggle ON = default personality enabled = ignore_default_personality false
    const [defaultPersonalityEnabled, setDefaultPersonalityEnabled] = useState(
        !agent?.conversation_config?.agent?.prompt?.ignore_default_personality
    );
    // Toggle ON = interruptible enabled = disable_first_message_interruptions false
    const [interruptibleEnabled, setInterruptibleEnabled] = useState(
        !agent?.conversation_config?.agent?.disable_first_message_interruptions
    );
    const [selectedLanguage, setSelectedLanguage] = useState(
        agent?.conversation_config?.agent?.language || 'en'
    );
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(
        agent?.conversation_config?.tts || { voice_id: null, name: 'Eric - Smooth, Trustworthy' }
    );
    const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);

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
                                                    <div className="relative">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={defaultPersonalityEnabled}
                                                            onChange={(e) => {
                                                                console.log('Default personality toggle:', e.target.checked);
                                                                setDefaultPersonalityEnabled(e.target.checked);
                                                            }}
                                                            className="sr-only" 
                                                        />
                                                        <div className={`h-5 w-9 rounded-full transition-all ${defaultPersonalityEnabled ? 'bg-gray-900' : 'bg-gray-300'}`}>
                                                            <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${defaultPersonalityEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-700">Default personality</span>
                                                </label>
                                                <button 
                                                    onClick={() => setShowTimezoneModal(true)}
                                                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {selectedTimezone || config?.agent?.prompt?.timezone || 'Set timezone'}
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
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={interruptibleEnabled}
                                                        onChange={(e) => {
                                                            console.log('Interruptible toggle:', e.target.checked);
                                                            setInterruptibleEnabled(e.target.checked);
                                                        }}
                                                        className="sr-only" 
                                                    />
                                                    <div className={`h-5 w-9 rounded-full transition-all ${interruptibleEnabled ? 'bg-gray-900' : 'bg-gray-300'}`}>
                                                        <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${interruptibleEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                    </div>
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
                                        <button
                                            onClick={() => setShowVoiceDrawer(true)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-gray-300 hover:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900">
                                                        {selectedVoice?.name || 'Eric - Smooth, Trustworthy'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">Primary</span>
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
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
                                        <button
                                            onClick={() => setShowLanguageModal(true)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-gray-300"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">
                                                    {selectedLanguage === 'en' ? '🇺🇸' : '🇵🇭'}
                                                </span>
                                                <span className="text-xs font-medium text-gray-900">
                                                    {selectedLanguage === 'en' ? 'English' : 'Filipino'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedLanguage === 'en' && (
                                                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">Default</span>
                                                )}
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
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

                    {/* Knowledge Tab */}
                    {activeTab === 'knowledge' && (
                        <KnowledgeBaseSection config={config} />
                    )}

                    {/* Tools Tab */}
                    {activeTab === 'tools' && (
                        <AgentToolsSection config={config} />
                    )}

                    {/* Evaluation Tab */}
                    {activeTab === 'evaluation' && (
                        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                            {/* Left - Conversations */}
                            <div>
                                <h2 className="mb-4 text-xl font-bold text-gray-900">Analysis</h2>
                                {/* Search */}
                                <div className="relative mb-3">
                                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                    />
                                </div>
                                {/* Filter chips */}
                                <div className="mb-4 flex flex-wrap gap-1.5">
                                    {['Date After','Date Before','Call status','Criteria','Data','Duration','Rating','Comments','Tools','Language','User','Channel'].map(f => (
                                        <button key={f} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                                            <span>+</span> {f}
                                        </button>
                                    ))}
                                </div>
                                {/* Conversation list empty state */}
                                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">No conversations found</p>
                                    <p className="mt-1 text-xs text-gray-500">This agent has no conversations yet.</p>
                                </div>
                            </div>

                            {/* Right - Criteria & Data Collection */}
                            <div className="space-y-4">
                                {/* Evaluation Criteria */}
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h3 className="mb-1 text-sm font-semibold text-gray-900">Evaluation criteria</h3>
                                    <p className="mb-3 text-xs text-gray-500">Define criteria to evaluate whether conversations were successful or not.</p>
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                                        <span className="text-xs font-medium text-gray-700">
                                            {platformSettings?.evaluation?.criteria?.length || 0} criteria
                                        </span>
                                        <button className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                                            <Plus className="h-3.5 w-3.5" /> Add criteria
                                        </button>
                                    </div>
                                    {platformSettings?.evaluation?.criteria?.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {platformSettings.evaluation.criteria.map((c) => (
                                                <div key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 p-3">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-semibold text-gray-900">{c.name}</span>
                                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{c.type}</span>
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-gray-500">{c.conversation_goal_prompt}</p>
                                                    </div>
                                                    <button className="flex-shrink-0 text-gray-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Data Collection */}
                                <div className="rounded-xl border border-gray-200 bg-white p-4">
                                    <h3 className="mb-1 text-sm font-semibold text-gray-900">Data collection</h3>
                                    <p className="mb-3 text-xs text-gray-500">Define custom data specifications to extract from conversation transcripts.</p>
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                                        <span className="text-xs font-medium text-gray-700">
                                            {platformSettings?.data_collection?.length || 0} data points
                                        </span>
                                        <button className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                                            <Plus className="h-3.5 w-3.5" /> Add data point
                                        </button>
                                    </div>
                                    {platformSettings?.data_collection?.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {platformSettings.data_collection.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-900">{d.dynamic_variable || d.type}</p>
                                                        <p className="text-xs text-gray-500">{d.description}</p>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-red-500">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Widget Tab */}
                    {activeTab === 'widget' && (
                        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                            {/* Left - Layout & Colors */}
                            <div className="space-y-6">
                                {/* Layout */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Layout</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-600">Variant</label>
                                            <select
                                                defaultValue={platformSettings?.widget?.variant}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            >
                                                <option value="full">Full</option>
                                                <option value="compact">Compact</option>
                                                <option value="minimal">Minimal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-600">Placement</label>
                                            <select
                                                defaultValue={platformSettings?.widget?.placement}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                            >
                                                <option value="bottom-right">Bottom Right</option>
                                                <option value="bottom-left">Bottom Left</option>
                                                <option value="top-right">Top Right</option>
                                                <option value="top-left">Top Left</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Colors</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <ColorPicker label="Background" value={platformSettings?.widget?.bg_color} />
                                        <ColorPicker label="Text Color" value={platformSettings?.widget?.text_color} />
                                        <ColorPicker label="Button Color" value={platformSettings?.widget?.btn_color} />
                                        <ColorPicker label="Border Color" value={platformSettings?.widget?.border_color} />
                                    </div>
                                </div>

                                {/* Embed Code */}
                                <EmbedCode agentId={agent?.agent_id} />
                            </div>

                            {/* Right - Features */}
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-gray-900">Features</h3>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'Show Transcript', key: 'transcript_enabled' },
                                        { label: 'Text Input', key: 'text_input_enabled' },
                                        { label: 'Microphone Muting', key: 'mic_muting_enabled' },
                                        { label: 'Language Selector', key: 'language_selector' },
                                        { label: 'Text Only Mode', key: 'supports_text_only' },
                                    ].map(({ label, key }) => (
                                        <FeatureToggle
                                            key={key}
                                            label={label}
                                            checked={platformSettings?.widget?.[key]}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <div className="divide-y divide-gray-200">
                            {/* Post-call Webhook Section */}
                            <div className="grid gap-8 py-8 first:pt-0 lg:grid-cols-[280px,1fr]">
                                {/* Left description */}
                                <div>
                                    <h3 className="mb-1.5 text-base font-semibold text-gray-900">Post-call Webhook</h3>
                                    <p className="text-sm text-gray-500">
                                        Override the post-call webhook for this agent. You can configure the default webhooks used by all agents in{' '}
                                        <a href="#" className="font-medium text-gray-900 underline underline-offset-2">your workspace settings</a>.
                                    </p>
                                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <div className="h-12 w-16 flex-shrink-0 rounded bg-gray-300"></div>
                                        <p className="text-xs text-gray-700">Learn how to automate post-call workflows with ElevenLabs &amp; n8n</p>
                                    </div>
                                </div>

                                {/* Right content */}
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-gray-900">Post-call webhook</h4>
                                        <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Create Webhook
                                        </button>
                                    </div>
                                    {platformSettings?.workspace_overrides?.webhooks?.post_call_webhook_id ? (
                                        <div className="space-y-3">
                                            <input
                                                type="url"
                                                value={platformSettings.workspace_overrides.webhooks.post_call_webhook_id}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                                placeholder="https://your-domain.com/webhook"
                                            />
                                            <div className="flex flex-wrap gap-1.5">
                                                {platformSettings.workspace_overrides.webhooks.events?.map((event) => (
                                                    <span key={event} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                        {event}
                                                        <button className="text-gray-400 hover:text-gray-600">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-8">
                                            <p className="text-sm text-gray-400">No post-call webhook configured.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Conversation History Section */}
                            <div className="grid gap-8 py-8 lg:grid-cols-[280px,1fr]">
                                <div>
                                    <h3 className="mb-1.5 text-base font-semibold text-gray-900">Conversation History</h3>
                                    <p className="text-sm text-gray-500">
                                        View and analyze past conversations for this agent.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-10">
                                        <div className="text-center">
                                            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-900">Conversation data loaded separately</p>
                                            <p className="mt-1 text-xs text-gray-500">Use the Conversations tab to view chat history</p>
                                            <button className="mt-3 rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
                                                View Conversations
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Timezone Modal */}
            <TimezoneModal 
                isOpen={showTimezoneModal}
                onClose={() => setShowTimezoneModal(false)}
                onSelect={(tz) => {
                    setSelectedTimezone(tz);
                    setShowTimezoneModal(false);
                }}
                currentTimezone={selectedTimezone || config?.agent?.prompt?.timezone}
            />
            
            {/* Language Modal */}
            <LanguageModal 
                isOpen={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                onSelect={(lang) => {
                    setSelectedLanguage(lang);
                    setShowLanguageModal(false);
                }}
                currentLanguage={selectedLanguage}
            />
            
            {/* Voice Drawer */}
            <VoiceDrawer 
                isOpen={showVoiceDrawer}
                onClose={() => setShowVoiceDrawer(false)}
                onSelect={(voice) => {
                    setSelectedVoice(voice);
                    setShowVoiceDrawer(false);
                }}
                currentVoice={selectedVoice}
            />
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

function KnowledgeBaseSection({ config }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const kb = config?.agent?.prompt?.knowledge_base || [];

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agent Knowledge Base</h2>
                <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Configure RAG
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Add document
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        autoFocus
                                    />
                                </div>
                                <div className="px-3 pb-2">
                                    <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                                        <Plus className="h-3.5 w-3.5" /> Type
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 px-2 py-1">
                                    <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50">
                                        <span className="mt-0.5 text-sm font-bold text-gray-700">T</span>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">autodrive motors knowledge base</p>
                                            <p className="text-xs text-gray-500">iMZrTFp3e6GDVE6vJnAa</p>
                                        </div>
                                    </button>
                                </div>
                                <div className="flex gap-1 border-t border-gray-100 p-2">
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round"/></svg>
                                        Add URL
                                    </button>
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                        Add Files
                                    </button>
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                        <span className="text-xs font-bold">T</span>
                                        Create Text
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search Knowledge Base..."
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>
            <div className="mb-3">
                <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                    <Plus className="h-3 w-3" /> Type
                </button>
            </div>

            {/* Content */}
            {kb.length > 0 ? (
                <div className="space-y-2">
                    {kb.map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                    <Database className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.type} · {item.usage_mode}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                        <Database className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No documents found</p>
                    <p className="mt-1 text-xs text-gray-500">This agent has no attached documents yet.</p>
                    <button
                        onClick={() => setShowDropdown(true)}
                        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Add document
                    </button>
                </div>
            )}
        </div>
    );
}

const SYSTEM_TOOLS = [
    { id: 'end_conversation', label: 'End conversation' },
    { id: 'detect_language', label: 'Detect language' },
    { id: 'skip_turn', label: 'Skip turn' },
    { id: 'transfer_to_agent', label: 'Transfer to agent' },
    { id: 'transfer_to_number', label: 'Transfer to number' },
    { id: 'play_keypad_touch_tone', label: 'Play keypad touch tone' },
    { id: 'voicemail_detection', label: 'Voicemail detection' },
];

function AgentToolsSection({ config }) {
    const [activeToolTab, setActiveToolTab] = useState('tools');
    const builtInTools = config?.agent?.prompt?.built_in_tools || {};
    const [toolStates, setToolStates] = useState(() => {
        const initial = {};
        SYSTEM_TOOLS.forEach(t => {
            initial[t.id] = builtInTools[t.id] !== undefined ? builtInTools[t.id] !== null : false;
        });
        // default end_conversation and play_keypad_touch_tone to on to match image
        if (!builtInTools.end_conversation) initial['end_conversation'] = true;
        if (!builtInTools.play_keypad_touch_tone) initial['play_keypad_touch_tone'] = true;
        return initial;
    });

    const activeCount = Object.values(toolStates).filter(Boolean).length;

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Left - Custom Tools */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Agent Tools</h2>
                    <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
                        Add tool
                    </button>
                </div>

                {/* Sub-tabs */}
                <div className="mb-4 flex items-center gap-1">
                    {['tools', 'mcp'].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveToolTab(t)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                                activeToolTab === t
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
                <div className="mb-3">
                    <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                        <Plus className="h-3 w-3" /> Type
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                        <Wrench className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No tools found</p>
                    <p className="mt-1 text-xs text-gray-500">This agent has no attached tools yet.</p>
                    <button className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        Add tool
                    </button>
                </div>
            </div>

            {/* Right - System Tools */}
            <div>
                <h3 className="mb-0.5 text-sm font-semibold text-gray-900">System tools</h3>
                <p className="mb-3 text-xs text-gray-500">Allow the agent perform built-in actions.</p>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-4 py-2.5">
                        <p className="text-xs font-medium text-gray-700">{activeCount} active tools</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {SYSTEM_TOOLS.map(tool => (
                            <div key={tool.id} className="flex items-center justify-between px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                    <Wrench className="h-3.5 w-3.5 text-gray-500" />
                                    <span className="text-sm text-gray-800">{tool.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {toolStates[tool.id] && (
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <Settings className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={toolStates[tool.id] || false}
                                            onChange={e => setToolStates(prev => ({ ...prev, [tool.id]: e.target.checked }))}
                                            className="peer sr-only"
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-gray-900"></div>
                                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmbedCode({ agentId }) {
    const [copied, setCopied] = useState(false);
    const code = `<elevenlabs-convai agent-id="${agentId || 'YOUR_AGENT_ID'}"></elevenlabs-convai>\n<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Embed code</h3>
            <p className="mb-3 text-xs text-gray-500">
                Add the following snippet to the pages where you want the conversation widget to be.
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 select-none text-xs text-gray-400">1</span>
                    <pre className="flex-1 overflow-x-auto text-xs text-gray-800 whitespace-pre-wrap break-all">
                        <span className="text-blue-600">&lt;elevenlabs-convai</span>
                        {' '}
                        <span className="text-gray-600">agent-id=</span>
                        <span className="text-orange-500">"{agentId || 'YOUR_AGENT_ID'}"</span>
                        <span className="text-blue-600">&gt;&lt;/elevenlabs-convai&gt;</span>
                        {'\n'}
                        <span className="mt-1 block text-blue-600">&lt;script</span>
                        {' '}
                        <span className="text-gray-600">src=</span>
                        <span className="text-orange-500">"https://unpkg.com/@elevenlabs/convai-widget-embed"</span>
                        {' '}
                        <span className="text-gray-600">async type=</span>
                        <span className="text-orange-500">"text/javascript"</span>
                        <span className="text-blue-600">&gt;&lt;/script&gt;</span>
                    </pre>
                    <button
                        onClick={handleCopy}
                        title="Copy to clipboard"
                        className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                    >
                        {copied ? (
                            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TimezoneModal({ isOpen, onClose, onSelect, currentTimezone }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    if (!isOpen) return null;

    // Filter timezones based on search query
    const filteredTimezones = searchQuery.trim()
        ? timezones.filter(tz => tz.toLowerCase().includes(searchQuery.toLowerCase()))
        : timezones.slice(0, 10); // Show only first 10 by default

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Select Timezone</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search timezones..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            autoFocus
                        />
                    </div>
                    {!searchQuery && (
                        <p className="mt-2 text-xs text-gray-500">Showing first 10 timezones. Search to see more.</p>
                    )}
                </div>

                {/* Timezone List */}
                <div className="max-h-96 overflow-y-auto border-t border-gray-200">
                    {filteredTimezones.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredTimezones.map((tz) => (
                                <button
                                    key={tz}
                                    onClick={() => onSelect(tz)}
                                    className={`flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-gray-50 ${
                                        tz === currentTimezone ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <span className="text-sm text-gray-900">{tz}</span>
                                    {tz === currentTimezone && (
                                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-gray-500">No timezones found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function LanguageModal({ isOpen, onClose, onSelect, currentLanguage }) {
    if (!isOpen) return null;

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸', isDefault: true },
        { code: 'fil', name: 'Filipino', flag: '🇵🇭', isDefault: false },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div 
                className="w-full max-w-md rounded-xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Select Language</h3>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Language List */}
                <div className="divide-y divide-gray-100">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelect(lang.code)}
                            className={`flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 ${
                                lang.code === currentLanguage ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{lang.flag}</span>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                                        {lang.isDefault && (
                                            <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">{lang.code}</span>
                                </div>
                            </div>
                            {lang.code === currentLanguage && (
                                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function VoiceDrawer({ isOpen, onClose, onSelect, currentVoice }) {
    
    const [voices, setVoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const [audioElement, setAudioElement] = useState(null);
    
    // Filters
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedAge, setSelectedAge] = useState('');

    const categories = ['Narration', 'Conversational', 'Characters', 'Social Media', 'Entertainment', 'Advertisement', 'Educational'];
    const genders = ['Male', 'Female', 'Neutral'];
    const ages = ['Young', 'Middle Aged', 'Old'];

    // Fetch voices with all parameters
    const fetchVoices = async () => {
        setLoading(true);
        try {
            const params = {
                searchQuery: searchQuery
            };
            
            // Add filters to params if they're selected
            if (selectedCategory) params.category = selectedCategory;
            if (selectedGender) params.gender = selectedGender;
            if (selectedAge) params.age = selectedAge;
            
            const response = await axios.get(`/app/voices`, { params });
            setVoices(response.data.voices || response.data || []);
        } catch (error) {
            console.error('Error fetching voices:', error);
            setVoices([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount or when drawer opens
    useEffect(() => {
        if (isOpen) {
            fetchVoices();
            setSearchQuery('');
            setSelectedCategory('');
            setSelectedGender('');
            setSelectedAge('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Fetch when filters change
    useEffect(() => {
        if (isOpen) {
            fetchVoices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, selectedGender, selectedAge]);

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    // Trigger search on Enter or after debounce
    useEffect(() => {
        if (isOpen) {
            const timeoutId = setTimeout(() => {
                fetchVoices();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Handle voice preview play
    const handlePlay = (voice) => {
        // Stop currently playing audio
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }

        if (playingVoiceId === voice.voice_id) {
            setPlayingVoiceId(null);
            setAudioElement(null);
        } else {
            const audio = new Audio(voice.preview_url);
            audio.play();
            setPlayingVoiceId(voice.voice_id);
            setAudioElement(audio);
            
            audio.onended = () => {
                setPlayingVoiceId(null);
                setAudioElement(null);
            };
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            ></div>
            
            {/* Drawer */}
            <div className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Select Voice</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Choose a voice from your library</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search voices..."
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="border-b border-gray-200 px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Gender Filter */}
                        <select
                            value={selectedGender}
                            onChange={(e) => setSelectedGender(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All Genders</option>
                            {genders.map(gender => (
                                <option key={gender} value={gender}>{gender}</option>
                            ))}
                        </select>

                        {/* Age Filter */}
                        <select
                            value={selectedAge}
                            onChange={(e) => setSelectedAge(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All Ages</option>
                            {ages.map(age => (
                                <option key={age} value={age}>{age}</option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        {(selectedCategory || selectedGender || selectedAge) && (
                            <button
                                onClick={() => {
                                    setSelectedCategory('');
                                    setSelectedGender('');
                                    setSelectedAge('');
                                }}
                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Voice List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                <p className="mt-4 text-sm text-gray-500">Loading voices...</p>
                            </div>
                        </div>
                    ) : voices.length > 0 ? (
                        <div className="grid gap-4">
                            {voices.map((voice) => (
                                <div
                                    key={voice.voice_id}
                                    className={`rounded-lg border-2 p-4 transition-all ${
                                        currentVoice?.voice_id === voice.voice_id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                                                {currentVoice?.voice_id === voice.voice_id && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                {voice.description || 'No description available'}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                {voice.category && (
                                                    <span className="rounded bg-gray-100 px-2 py-0.5">{voice.category}</span>
                                                )}
                                                {voice.gender && (
                                                    <span className="rounded bg-gray-100 px-2 py-0.5">{voice.gender}</span>
                                                )}
                                                {voice.age && (
                                                    <span className="rounded bg-gray-100 px-2 py-0.5">{voice.age}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-shrink-0 items-center gap-2">
                                            {/* Play button */}
                                            {voice.preview_url && (
                                                <button
                                                    onClick={() => handlePlay(voice)}
                                                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                                                    title="Play preview"
                                                >
                                                    {playingVoiceId === voice.voice_id ? (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}

                                            {/* Select button */}
                                            <button
                                                onClick={() => onSelect(voice)}
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <p className="mt-4 text-sm font-medium text-gray-900">No voices found</p>
                                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}