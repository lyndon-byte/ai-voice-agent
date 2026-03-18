import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import ModernField from '../Shared/ModernField';
import TimezoneModal from '../Modals/TimezoneModal';
import LanguageModal from '../Modals/LanguageModal';
import VoiceDrawer from '../Modals/VoiceDrawer';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';

// ─── System variables list ────────────────────────────────────────────────────
const SYSTEM_VARIABLES = [
    'system__agent_id',
    'system__current_agent_id',
    'system__caller_id',
    'system__called_number',
    'system__call_duration_secs',
    'system__time_utc',
    'system__time',
    'system__timezone',
    'system__conversation_id',
    'system__call_sid',
    'system__agent_turns',
    'system__current_agent_turns',
    'system__current_subagent_turns',
];

// ─── Variable Dropdown ────────────────────────────────────────────────────────
function VariableDropdown({ position, onSelect, filter }) {
    const filtered = filter
        ? SYSTEM_VARIABLES.filter((v) => v.includes(filter.toLowerCase()))
        : SYSTEM_VARIABLES;

    if (!filtered.length) return null;

    return (
        <div
            className="absolute z-50 min-w-[260px] rounded-lg border border-gray-200 bg-white shadow-lg py-1"
            style={{ top: position.top, left: position.left }}
        >
            <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                System variables
            </p>
            {filtered.map((variable) => (
                <button
                    key={variable}
                    onMouseDown={(e) => {
                        e.preventDefault(); // prevent textarea blur
                        onSelect(variable);
                    }}
                    className="flex w-full items-center px-3 py-1.5 text-left text-sm text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg focus:bg-gray-50 focus:outline-none"
                >
                    {variable}
                </button>
            ))}
        </div>
    );
}

// ─── Variable-aware Textarea ──────────────────────────────────────────────────
function VariableTextarea({ defaultValue, rows, onChange, placeholder, className }) {
    const textareaRef = useRef(null);
    const wrapperRef = useRef(null);
    const [value, setValue] = useState(defaultValue || '');
    const [dropdown, setDropdown] = useState(null); // { top, left, triggerIndex }

    // Find the `{{` trigger just before the cursor
    const findTrigger = (text, cursorPos) => {
        // Look backwards from cursor for `{{`
        const before = text.slice(0, cursorPos);
        const lastOpen = before.lastIndexOf('{{');
        if (lastOpen === -1) return null;
        // Make sure there's no closing `}}` after the last `{{`
        const afterOpen = before.slice(lastOpen + 2);
        if (afterOpen.includes('}}')) return null;
        return { triggerIndex: lastOpen, query: afterOpen };
    };

    const getCaretCoordinates = (textarea, position) => {
        // Create a mirror div to measure caret position
        const mirror = document.createElement('div');
        const style = window.getComputedStyle(textarea);
        const props = [
            'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
            'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
            'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
            'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch',
            'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
            'textAlign', 'textTransform', 'textIndent', 'textDecoration',
            'letterSpacing', 'wordSpacing', 'tabSize',
        ];
        mirror.style.position = 'absolute';
        mirror.style.visibility = 'hidden';
        mirror.style.whiteSpace = 'pre-wrap';
        mirror.style.wordWrap = 'break-word';
        props.forEach((prop) => {
            mirror.style[prop] = style[prop];
        });
        mirror.textContent = textarea.value.slice(0, position);
        const span = document.createElement('span');
        span.textContent = '|';
        mirror.appendChild(span);
        document.body.appendChild(mirror);
        const rect = textarea.getBoundingClientRect();
        const spanRect = span.getBoundingClientRect();
        const mirrorRect = mirror.getBoundingClientRect();
        document.body.removeChild(mirror);
        return {
            top: spanRect.top - mirrorRect.top,
            left: spanRect.left - mirrorRect.left,
        };
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange?.(e);
    
        const cursor = e.target.selectionStart;
        const trigger = findTrigger(newValue, cursor);
    
        if (trigger) {
            const textarea = textareaRef.current;
            const caret = getCaretCoordinates(textarea, trigger.triggerIndex);
            const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
            setDropdown({
                top: caret.top + lineHeight
                    + parseInt(window.getComputedStyle(textarea).paddingTop)
                    - textarea.scrollTop,   // ← subtract scroll offset
                left: caret.left + parseInt(window.getComputedStyle(textarea).paddingLeft),
                triggerIndex: trigger.triggerIndex,
                query: trigger.query,
            });
        } else {
            setDropdown(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && dropdown) {
            setDropdown(null);
        }
    };

    const handleBlur = () => {
        // Small delay so onMouseDown on dropdown item fires first
        setTimeout(() => setDropdown(null), 150);
    };

    const handleSelect = (variable) => {
        if (!textareaRef.current || dropdown === null) return;
        const textarea = textareaRef.current;
        const before = value.slice(0, dropdown.triggerIndex);
        const after = value.slice(textarea.selectionStart);
        const inserted = `{{${variable}}}`;
        const newValue = before + inserted + after;
        setValue(newValue);
        onChange?.({ target: { value: newValue } });
        setDropdown(null);
        // Restore focus + move cursor after inserted text
        setTimeout(() => {
            textarea.focus();
            const newCursor = before.length + inserted.length;
            textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                rows={rows}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className={className}
                placeholder={placeholder}
            />
            {dropdown && (
                <VariableDropdown
                    position={{ top: dropdown.top, left: dropdown.left }}
                    onSelect={handleSelect}
                    filter={dropdown.query}
                />
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConfigurationTab({ config, currentVoice }) {
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
        { voice_id: currentVoice.voice_id, name: currentVoice.name }
    );
    const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);

    const handleTimezoneChange = (tz) => {
        setSelectedTimezone(tz);
        trackChange('agent.prompt.timezone', tz);
        setShowTimezoneModal(false);
    };

    const handleDefaultPersonalityToggle = (checked) => {
        setDefaultPersonalityEnabled(checked);
        trackChange('agent.prompt.ignore_default_personality', checked);
    };

    const handleInterruptibleToggle = (checked) => {
        setInterruptibleEnabled(checked);
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
                {/* ── Left Column ─────────────────────────────────────────── */}
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
                            <VariableTextarea
                                defaultValue={config?.agent?.prompt?.prompt || 'You are a helpful assistant.'}
                                rows={5}
                                onChange={(e) => trackChange('agent.prompt.prompt', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                                placeholder="You are a helpful assistant..."
                            />
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-1">
                                <span className="text-xs text-gray-600">
                                    Type <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">{'{{'}</code> to add variables
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
                                        className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
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
                              
                            </p>
                        </div>
                        <div className="space-y-2">
                            <VariableTextarea
                                defaultValue={config?.agent?.first_message || 'Hello! How can I help you?'}
                                rows={3}
                                onChange={(e) => trackChange('agent.first_message', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                                placeholder="Hello! How can I help you?"
                            />
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                                <span className="text-xs text-gray-600">
                                    Type <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">{'{{'}</code> to add variables
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

                    {/* ── Turn Management (compact) ──────────────────────── */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-600" />
                            <h3 className="text-sm font-semibold text-gray-900">Turn Management</h3>
                        </div>
                        <ModernField 
                            label="Turn Eagerness"
                            subLabel="How quickly the agent responds"
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-2">
                                <select 
                                    defaultValue={config?.turn?.turn_eagerness}
                                    onChange={(e) => trackChange('turn.turn_eagerness', e.target.value)}
                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:flex-1 sm:text-sm"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                               
                            </div>
                        </ModernField>
                    </div>
                </div>

                {/* ── Right Column ─────────────────────────────────────────── */}
                {/* mt-0 keeps top of sidebar flush with top of left column */}
                <div className="space-y-4 mt-7">
                    <VoiceSection
                        selectedVoice={selectedVoice}
                        onOpenDrawer={() => setShowVoiceDrawer(true)}
                    />
                    <LanguageSection
                        selectedLanguage={selectedLanguage}
                        onOpenModal={() => setShowLanguageModal(true)}
                    />
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function VoiceSection({ selectedVoice, onOpenDrawer }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Voices</h3>
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
                        <p className="text-xs font-medium text-gray-900">
                            {selectedVoice?.name || 'Eric - Smooth, Trustworthy'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">Primary</span>
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
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
            </div>
        </div>
    );
}