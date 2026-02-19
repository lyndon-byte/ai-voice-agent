import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ModernField from '../shared/ModernField';
import TimezoneModal from '../modals/TimezoneModal';
import LanguageModal from '../modals/LanguageModal';
import VoiceDrawer from '../modals/VoiceDrawer';
import { useAgentChanges } from '@/Contexts/Agentchangescontext';

export default function ConfigurationTab({ agent, config, currentVoice }) {
    const { trackChange } = useAgentChanges();
    
    const [selectedTimezone, setSelectedTimezone] = useState(config?.agent?.prompt?.timezone || null);
    const [showTimezoneModal, setShowTimezoneModal] = useState(false);
    
    const [defaultPersonalityEnabled, setDefaultPersonalityEnabled] = useState(
        !config?.agent?.prompt?.ignore_default_personality
    );
    const [interruptibleEnabled, setInterruptibleEnabled] = useState(
        !config?.agent?.disable_first_message_interruptions
    );
    
    const [selectedLanguage, setSelectedLanguage] = useState(config?.agent?.language || 'en');
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    
    const [selectedVoice, setSelectedVoice] = useState(
        { voice_id: null, name: currentVoice.name }
    );
    const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);

    // Handlers with change tracking
    const handleTimezoneChange = (tz) => {
        setSelectedTimezone(tz);
        trackChange('agent.prompt.timezone', tz);
        setShowTimezoneModal(false);
    };

    const handleDefaultPersonalityToggle = (checked) => {
        setDefaultPersonalityEnabled(checked);
        // Note: storing the UI state, will be inverted when mapping to API
        trackChange('agent.prompt.ignore_default_personality', checked);
    };

    const handleInterruptibleToggle = (checked) => {
        setInterruptibleEnabled(checked);
        // Note: storing the UI state, will be inverted when mapping to API
        trackChange('agent.disable_first_message_interruptions', checked);
    };

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        trackChange('agent.language', lang);
        setShowLanguageModal(false);
    };

    const handleVoiceChange = (voice) => {
        setSelectedVoice(voice);
        trackChange('tts.voice_id', voice.voice_id);
        trackChange('tts.name', voice.name);
        setShowVoiceDrawer(false);
    };

    return (
        <>
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
                                onChange={(e) => trackChange('agent.prompt.prompt', e.target.value)}
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
                                                onChange={(e) => handleDefaultPersonalityToggle(e.target.checked)}
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
                                onChange={(e) => trackChange('agent.first_message', e.target.value)}
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
                                            onChange={(e) => handleInterruptibleToggle(e.target.checked)}
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
                                    onChange={(e) => trackChange('turn.turn_eagerness', e.target.value)}
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
                    <VoiceSection 
                        selectedVoice={selectedVoice}
                        onOpenDrawer={() => setShowVoiceDrawer(true)}
                    />

                    {/* Language */}
                    <LanguageSection 
                        selectedLanguage={selectedLanguage}
                        onOpenModal={() => setShowLanguageModal(true)}
                    />

                    {/* LLM */}
                    <LLMSection />
                </div>
            </div>

            {/* Modals */}
            <TimezoneModal 
                isOpen={showTimezoneModal}
                onClose={() => setShowTimezoneModal(false)}
                onSelect={handleTimezoneChange}
                currentTimezone={selectedTimezone || config?.agent?.prompt?.timezone}
            />
            
            <LanguageModal 
                isOpen={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                onSelect={handleLanguageChange}
                currentLanguage={selectedLanguage}
            />
            
            <VoiceDrawer 
                isOpen={showVoiceDrawer}
                onClose={() => setShowVoiceDrawer(false)}
                onSelect={handleVoiceChange}
                currentVoice={selectedVoice}
            />
        </>
    );
}

// Sub-components (same as before)
function VoiceSection({ selectedVoice, onOpenDrawer }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Voices</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
            <p className="mb-3 text-xs text-gray-500">
                Select the ElevenLabs voices you want to use for the agent.
            </p>
            <div className="space-y-2">
                <button
                    onClick={onOpenDrawer}
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
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                    </svg>
                    Add additional voice
                </button>
            </div>
        </div>
    );
}

function LanguageSection({ selectedLanguage, onOpenModal }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Language</h3>
            <p className="mb-3 text-xs text-gray-500">
                Choose the default and additional languages the agent will communicate in.
            </p>
            <div className="space-y-2">
                <button
                    onClick={onOpenModal}
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
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                    </svg>
                    Add additional languages
                </button>
            </div>
        </div>
    );
}

function LLMSection() {
    return (
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
    );
}