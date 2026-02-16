import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState,useEffect } from 'react';
import { 
    Save, 
    ChevronLeft, 
    ChevronDown, 
    ChevronUp,
    Settings,
    MessageSquare,
    Mic,
    Volume2,
    Shield,
    Palette,
    Phone,
    Globe,
    Lock,
    AlertCircle,
    Trash2
} from 'lucide-react';

export default function Agent({ agent }) {
    const [activeTab, setActiveTab] = useState('general');
    const [expandedSections, setExpandedSections] = useState({
        asr: true,
        turn: true,
        tts: true,
        conversation: true,
        agent: true,
        widget: true,
        guardrails: false,
        privacy: false,
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'conversation', label: 'Conversation', icon: MessageSquare },
        { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
        { id: 'widget', label: 'Widget', icon: Palette },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
        { id: 'deployment', label: 'Deployment', icon: Phone },
    ];

    useEffect(() => {

        console.log(agent)

    },[])

    return (

        <>
            <Head title="Agent Configuration" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/agents"
                            className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {agent?.name || 'Agent Configuration'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {agent?.agent_id || 'agent_id'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Agent
                        </button>
                        <button className="inline-flex items-center rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-black text-black'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <Section title="Basic Information">
                                <FormField label="Agent Name" required>
                                    <input
                                        type="text"
                                        defaultValue={agent?.name}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Agent ID">
                                    <input
                                        type="text"
                                        value={agent?.agent_id}
                                        disabled
                                        className="input-field bg-gray-50"
                                    />
                                </FormField>
                            </Section>

                            <Section title="Agent Behavior">
                                <FormField label="First Message">
                                    <textarea
                                        defaultValue={agent?.conversation_config?.agent?.first_message}
                                        rows={3}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="System Prompt">
                                    <textarea
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.prompt}
                                        rows={6}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Language">
                                    <select className="input-field">
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="zh">Chinese</option>
                                        <option value="ja">Japanese</option>
                                    </select>
                                </FormField>
                                <FormField label="LLM Model">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.llm}
                                    >
                                        <option value="gpt-4o">GPT-4o</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        <option value="claude-3-opus">Claude 3 Opus</option>
                                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                        <option value="gemini-pro">Gemini Pro</option>
                                    </select>
                                </FormField>
                                <FormField label="Temperature">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            defaultValue={agent?.conversation_config?.agent?.prompt?.temperature}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-sm text-gray-600">
                                            {agent?.conversation_config?.agent?.prompt?.temperature}
                                        </span>
                                    </div>
                                </FormField>
                            </Section>

                            <Section title="Advanced Settings">
                                <FormField label="Max Tokens">
                                    <input
                                        type="number"
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.max_tokens}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Cascade Timeout (seconds)">
                                    <input
                                        type="number"
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.cascade_timeout_seconds}
                                        className="input-field"
                                    />
                                </FormField>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="parallel-tools"
                                        defaultChecked={agent?.conversation_config?.agent?.prompt?.enable_parallel_tool_calls}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="parallel-tools" className="text-sm text-gray-700">
                                        Enable parallel tool calls
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="disable-interruptions"
                                        defaultChecked={agent?.conversation_config?.agent?.disable_first_message_interruptions}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="disable-interruptions" className="text-sm text-gray-700">
                                        Disable first message interruptions
                                    </label>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Conversation Tab */}
                    {activeTab === 'conversation' && (
                        <div className="space-y-6">
                            <CollapsibleSection
                                title="Turn Management"
                                isExpanded={expandedSections.turn}
                                onToggle={() => toggleSection('turn')}
                            >
                                <FormField label="Turn Mode">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.turn?.mode}
                                    >
                                        <option value="turn">Turn-based</option>
                                        <option value="duplex">Duplex</option>
                                        <option value="free">Free-flowing</option>
                                    </select>
                                </FormField>
                                <FormField label="Turn Timeout (seconds)">
                                    <input
                                        type="number"
                                        defaultValue={agent?.conversation_config?.turn?.turn_timeout}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Turn Eagerness">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.turn?.turn_eagerness}
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                    </select>
                                </FormField>
                                <FormField label="Silence End Call Timeout">
                                    <input
                                        type="number"
                                        defaultValue={agent?.conversation_config?.turn?.silence_end_call_timeout}
                                        className="input-field"
                                    />
                                </FormField>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="speculative-turn"
                                        defaultChecked={agent?.conversation_config?.turn?.speculative_turn}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="speculative-turn" className="text-sm text-gray-700">
                                        Enable speculative turn
                                    </label>
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection
                                title="Conversation Settings"
                                isExpanded={expandedSections.conversation}
                                onToggle={() => toggleSection('conversation')}
                            >
                                <FormField label="Max Duration (seconds)">
                                    <input
                                        type="number"
                                        defaultValue={agent?.conversation_config?.conversation?.max_duration_seconds}
                                        className="input-field"
                                    />
                                </FormField>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="text-only"
                                        defaultChecked={agent?.conversation_config?.conversation?.text_only}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="text-only" className="text-sm text-gray-700">
                                        Text only mode
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="monitoring"
                                        defaultChecked={agent?.conversation_config?.conversation?.monitoring_enabled}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="monitoring" className="text-sm text-gray-700">
                                        Enable monitoring
                                    </label>
                                </div>
                            </CollapsibleSection>

                            <Section title="RAG (Retrieval-Augmented Generation)">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="rag-enabled"
                                        defaultChecked={agent?.conversation_config?.agent?.prompt?.rag?.enabled}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="rag-enabled" className="text-sm text-gray-700">
                                        Enable RAG
                                    </label>
                                </div>
                                <FormField label="Embedding Model">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.rag?.embedding_model}
                                    >
                                        <option value="e5_mistral_7b_instruct">E5 Mistral 7B Instruct</option>
                                        <option value="text-embedding-ada-002">OpenAI Ada-002</option>
                                        <option value="text-embedding-3-small">OpenAI Embedding 3 Small</option>
                                        <option value="text-embedding-3-large">OpenAI Embedding 3 Large</option>
                                    </select>
                                </FormField>
                                <FormField label="Max Vector Distance">
                                    <input
                                        type="number"
                                        step="0.1"
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.rag?.max_vector_distance}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Max Documents Length">
                                    <input
                                        type="number"
                                        defaultValue={agent?.conversation_config?.agent?.prompt?.rag?.max_documents_length}
                                        className="input-field"
                                    />
                                </FormField>
                            </Section>
                        </div>
                    )}

                    {/* Voice & Audio Tab */}
                    {activeTab === 'voice' && (
                        <div className="space-y-6">
                            <CollapsibleSection
                                title="Text-to-Speech (TTS)"
                                isExpanded={expandedSections.tts}
                                onToggle={() => toggleSection('tts')}
                            >
                                <FormField label="TTS Model">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.tts?.model_id}
                                    >
                                        <option value="eleven_turbo_v2">ElevenLabs Turbo V2</option>
                                        <option value="eleven_multilingual_v2">ElevenLabs Multilingual V2</option>
                                        <option value="eleven_monolingual_v1">ElevenLabs Monolingual V1</option>
                                        <option value="tts-1">OpenAI TTS-1</option>
                                        <option value="tts-1-hd">OpenAI TTS-1 HD</option>
                                    </select>
                                </FormField>
                                <FormField label="Voice ID">
                                    <input
                                        type="text"
                                        defaultValue={agent?.conversation_config?.tts?.voice_id}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Stability">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            defaultValue={agent?.conversation_config?.tts?.stability}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-sm text-gray-600">
                                            {agent?.conversation_config?.tts?.stability}
                                        </span>
                                    </div>
                                </FormField>
                                <FormField label="Similarity Boost">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            defaultValue={agent?.conversation_config?.tts?.similarity_boost}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-sm text-gray-600">
                                            {agent?.conversation_config?.tts?.similarity_boost}
                                        </span>
                                    </div>
                                </FormField>
                                <FormField label="Speed">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2"
                                            step="0.1"
                                            defaultValue={agent?.conversation_config?.tts?.speed}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-sm text-gray-600">
                                            {agent?.conversation_config?.tts?.speed}x
                                        </span>
                                    </div>
                                </FormField>
                                <FormField label="Streaming Latency Optimization">
                                    <select className="input-field" defaultValue={agent?.conversation_config?.tts?.optimize_streaming_latency}>
                                        <option value="0">None</option>
                                        <option value="1">Level 1</option>
                                        <option value="2">Level 2</option>
                                        <option value="3">Level 3</option>
                                        <option value="4">Level 4</option>
                                    </select>
                                </FormField>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="expressive-mode"
                                        defaultChecked={agent?.conversation_config?.tts?.expressive_mode}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="expressive-mode" className="text-sm text-gray-700">
                                        Enable expressive mode
                                    </label>
                                </div>
                            </CollapsibleSection>

                            <CollapsibleSection
                                title="Speech Recognition (ASR)"
                                isExpanded={expandedSections.asr}
                                onToggle={() => toggleSection('asr')}
                            >
                                <FormField label="ASR Provider">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.asr?.provider}
                                    >
                                        <option value="elevenlabs">ElevenLabs</option>
                                        <option value="deepgram">Deepgram</option>
                                        <option value="assemblyai">AssemblyAI</option>
                                        <option value="google">Google Cloud</option>
                                        <option value="azure">Azure</option>
                                    </select>
                                </FormField>
                                <FormField label="Quality">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.asr?.quality}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </FormField>
                                <FormField label="Audio Format">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.conversation_config?.asr?.user_input_audio_format}
                                    >
                                        <option value="pcm_16000">PCM 16kHz</option>
                                        <option value="pcm_8000">PCM 8kHz</option>
                                        <option value="mulaw_8000">μ-law 8kHz</option>
                                    </select>
                                </FormField>
                            </CollapsibleSection>

                            <Section title="Voice Activity Detection">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="background-voice"
                                        defaultChecked={agent?.conversation_config?.vad?.background_voice_detection}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="background-voice" className="text-sm text-gray-700">
                                        Background voice detection
                                    </label>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Widget Tab */}
                    {activeTab === 'widget' && (
                        <div className="space-y-6">
                            <Section title="Widget Appearance">
                                <FormField label="Variant">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.platform_settings?.widget?.variant}
                                    >
                                        <option value="full">Full</option>
                                        <option value="compact">Compact</option>
                                        <option value="minimal">Minimal</option>
                                    </select>
                                </FormField>
                                <FormField label="Placement">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.platform_settings?.widget?.placement}
                                    >
                                        <option value="bottom-right">Bottom Right</option>
                                        <option value="bottom-left">Bottom Left</option>
                                        <option value="top-right">Top Right</option>
                                        <option value="top-left">Top Left</option>
                                    </select>
                                </FormField>
                                <FormField label="Expandable">
                                    <select 
                                        className="input-field"
                                        defaultValue={agent?.platform_settings?.widget?.expandable}
                                    >
                                        <option value="always">Always</option>
                                        <option value="never">Never</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </FormField>
                            </Section>

                            <Section title="Colors">
                                <FormField label="Background Color">
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            defaultValue={agent?.platform_settings?.widget?.bg_color}
                                            className="h-10 w-20 rounded border"
                                        />
                                        <input
                                            type="text"
                                            defaultValue={agent?.platform_settings?.widget?.bg_color}
                                            className="input-field flex-1"
                                        />
                                    </div>
                                </FormField>
                                <FormField label="Text Color">
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            defaultValue={agent?.platform_settings?.widget?.text_color}
                                            className="h-10 w-20 rounded border"
                                        />
                                        <input
                                            type="text"
                                            defaultValue={agent?.platform_settings?.widget?.text_color}
                                            className="input-field flex-1"
                                        />
                                    </div>
                                </FormField>
                                <FormField label="Button Color">
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            defaultValue={agent?.platform_settings?.widget?.btn_color}
                                            className="h-10 w-20 rounded border"
                                        />
                                        <input
                                            type="text"
                                            defaultValue={agent?.platform_settings?.widget?.btn_color}
                                            className="input-field flex-1"
                                        />
                                    </div>
                                </FormField>
                                <FormField label="Border Color">
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            defaultValue={agent?.platform_settings?.widget?.border_color}
                                            className="h-10 w-20 rounded border"
                                        />
                                        <input
                                            type="text"
                                            defaultValue={agent?.platform_settings?.widget?.border_color}
                                            className="input-field flex-1"
                                        />
                                    </div>
                                </FormField>
                            </Section>

                            <Section title="Widget Features">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="transcript-enabled"
                                            defaultChecked={agent?.platform_settings?.widget?.transcript_enabled}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label htmlFor="transcript-enabled" className="text-sm text-gray-700">
                                            Show transcript
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="text-input-enabled"
                                            defaultChecked={agent?.platform_settings?.widget?.text_input_enabled}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label htmlFor="text-input-enabled" className="text-sm text-gray-700">
                                            Enable text input
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="mic-muting"
                                            defaultChecked={agent?.platform_settings?.widget?.mic_muting_enabled}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label htmlFor="mic-muting" className="text-sm text-gray-700">
                                            Allow mic muting
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="language-selector"
                                            defaultChecked={agent?.platform_settings?.widget?.language_selector}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label htmlFor="language-selector" className="text-sm text-gray-700">
                                            Show language selector
                                        </label>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Security & Privacy Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <Section title="Privacy Settings">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="record-voice"
                                        defaultChecked={agent?.platform_settings?.privacy?.record_voice}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="record-voice" className="text-sm text-gray-700">
                                        Record voice conversations
                                    </label>
                                </div>
                                <FormField label="Data Retention (days)">
                                    <input
                                        type="number"
                                        defaultValue={agent?.platform_settings?.privacy?.retention_days}
                                        className="input-field"
                                        placeholder="-1 for unlimited"
                                    />
                                </FormField>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="delete-transcript"
                                        defaultChecked={agent?.platform_settings?.privacy?.delete_transcript_and_pii}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="delete-transcript" className="text-sm text-gray-700">
                                        Delete transcript and PII
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="delete-audio"
                                        defaultChecked={agent?.platform_settings?.privacy?.delete_audio}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="delete-audio" className="text-sm text-gray-700">
                                        Delete audio recordings
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="zero-retention"
                                        defaultChecked={agent?.platform_settings?.privacy?.zero_retention_mode}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="zero-retention" className="text-sm text-gray-700">
                                        Zero retention mode
                                    </label>
                                </div>
                            </Section>

                            <Section title="Authentication">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="enable-auth"
                                        defaultChecked={agent?.platform_settings?.auth?.enable_auth}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="enable-auth" className="text-sm text-gray-700">
                                        Enable authentication
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="require-origin"
                                        defaultChecked={agent?.platform_settings?.auth?.require_origin_header}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="require-origin" className="text-sm text-gray-700">
                                        Require origin header
                                    </label>
                                </div>
                            </Section>

                            <CollapsibleSection
                                title="Content Guardrails"
                                isExpanded={expandedSections.guardrails}
                                onToggle={() => toggleSection('guardrails')}
                            >
                                <GuardrailCategory 
                                    title="Sexual Content"
                                    config={agent?.platform_settings?.guardrails?.content?.config?.sexual}
                                />
                                <GuardrailCategory 
                                    title="Violence"
                                    config={agent?.platform_settings?.guardrails?.content?.config?.violence}
                                />
                                <GuardrailCategory 
                                    title="Harassment"
                                    config={agent?.platform_settings?.guardrails?.content?.config?.harassment}
                                />
                                <GuardrailCategory 
                                    title="Self Harm"
                                    config={agent?.platform_settings?.guardrails?.content?.config?.self_harm}
                                />
                                <GuardrailCategory 
                                    title="Profanity"
                                    config={agent?.platform_settings?.guardrails?.content?.config?.profanity}
                                />
                            </CollapsibleSection>

                            <Section title="Call Limits">
                                <FormField label="Daily Call Limit">
                                    <input
                                        type="number"
                                        defaultValue={agent?.platform_settings?.call_limits?.daily_limit}
                                        className="input-field"
                                    />
                                </FormField>
                                <FormField label="Agent Concurrency Limit">
                                    <input
                                        type="number"
                                        defaultValue={agent?.platform_settings?.call_limits?.agent_concurrency_limit}
                                        className="input-field"
                                        placeholder="-1 for unlimited"
                                    />
                                </FormField>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="bursting"
                                        defaultChecked={agent?.platform_settings?.call_limits?.bursting_enabled}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="bursting" className="text-sm text-gray-700">
                                        Enable bursting
                                    </label>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Deployment Tab */}
                    {activeTab === 'deployment' && (
                        <div className="space-y-6">
                            <Section title="Phone Numbers">
                                {agent?.phone_numbers?.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                        <Phone className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">
                                            No phone numbers connected
                                        </p>
                                        <button className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
                                            Add Phone Number
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {agent.phone_numbers.map((number, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border p-4">
                                                <span className="font-medium">{number}</span>
                                                <button className="text-red-600 hover:text-red-700">
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Section>

                            <Section title="WhatsApp Accounts">
                                {agent?.whatsapp_accounts?.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">
                                            No WhatsApp accounts connected
                                        </p>
                                        <button className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
                                            Connect WhatsApp
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {agent.whatsapp_accounts.map((account, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border p-4">
                                                <span className="font-medium">{account}</span>
                                                <button className="text-red-600 hover:text-red-700">
                                                    Disconnect
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Section>

                            <Section title="Metadata">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Created At</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(agent?.metadata?.created_at_unix_secs * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Last Updated</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(agent?.metadata?.updated_at_unix_secs * 1000).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .input-field {
                    @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400;
                }
            `}</style>
        </>
    );
}

// Helper Components
function Section({ title, children }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function CollapsibleSection({ title, isExpanded, onToggle, children }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between p-6 text-left hover:bg-gray-50"
            >
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
            </button>
            {isExpanded && <div className="space-y-4 p-6 pt-0">{children}</div>}
        </div>
    );
}

function FormField({ label, required, children }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {children}
        </div>
    );
}

function GuardrailCategory({ title, config }) {
    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{title}</h4>
                <input
                    type="checkbox"
                    defaultChecked={config?.is_enabled}
                    className="h-4 w-4 rounded border-gray-300"
                />
            </div>
            <FormField label="Threshold">
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={config?.threshold}
                        className="flex-1"
                    />
                    <span className="w-12 text-sm text-gray-600">{config?.threshold}</span>
                </div>
            </FormField>
        </div>
    );
}