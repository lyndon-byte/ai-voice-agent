import { useState } from 'react';
import { Plus, Wrench, Settings, X, Trash2 } from 'lucide-react';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';

const SYSTEM_TOOLS = [
    { id: 'end_call',               label: 'End conversation' },
    { id: 'language_detection',     label: 'Detect language' },
    { id: 'skip_turn',              label: 'Skip turn' },
    { id: 'transfer_to_agent',      label: 'Transfer to agent' },
    { id: 'transfer_to_number',     label: 'Transfer to number' },
    { id: 'play_keypad_touch_tone', label: 'Play keypad touch tone' },
    { id: 'voicemail_detection',    label: 'Voicemail detection' },
];

// These tools must open the drawer on toggle-on; cancel reverts the toggle.
const REQUIRES_DRAWER_ON_ENABLE = new Set(['transfer_to_agent', 'transfer_to_number']);

const DEFAULT_TOOL_CONFIG = {
    response_timeout_secs:    20,
    disable_interruptions:    false,
    force_pre_tool_speech:    false,
    tool_call_sound_behavior: 'auto',
    tool_error_handling_mode: 'auto',
};

// Defaults seeded when toggling a tool ON that has no existing config.
// Optional string fields (description, transfer_message, etc.) are intentionally
// absent — they'll be stripped by stripEmpty anyway if added empty.
const DEFAULT_ENABLED_CONFIGS = {
    end_call:               { ...DEFAULT_TOOL_CONFIG, name: 'end_call',               params: { system_tool_type: 'end_call' } },
    language_detection:     { ...DEFAULT_TOOL_CONFIG, name: 'language_detection',     params: { system_tool_type: 'language_detection' } },
    skip_turn:              { ...DEFAULT_TOOL_CONFIG, name: 'skip_turn',              params: { system_tool_type: 'skip_turn' } },
    play_keypad_touch_tone: { ...DEFAULT_TOOL_CONFIG, name: 'play_keypad_touch_tone', params: { system_tool_type: 'play_keypad_touch_tone', use_out_of_band_dtmf: false } },
    voicemail_detection:    { ...DEFAULT_TOOL_CONFIG, name: 'voicemail_detection',    params: { system_tool_type: 'voicemail_detection' } },
    transfer_to_agent:      { ...DEFAULT_TOOL_CONFIG, name: 'transfer_to_agent',      params: { system_tool_type: 'transfer_to_agent',  transfers: [] } },
    transfer_to_number:     { ...DEFAULT_TOOL_CONFIG, name: 'transfer_to_number',     params: { system_tool_type: 'transfer_to_number', transfers: [], enable_client_message: true } },
};

const TOOL_PARAMS_DEFAULTS = {
    end_call:               {},
    language_detection:     {},
    skip_turn:              {},
    play_keypad_touch_tone: { use_out_of_band_dtmf: false },
    voicemail_detection:    {},
    transfer_to_agent: {
        transfers: [{ agent_id: '', condition: '', delay_ms: 0, enable_transferred_agent_first_message: true }],
    },
    transfer_to_number: {
        transfers: [{ phone_number: '', condition: '', transfer_type: 'conference' }],
        enable_client_message: true,
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Recursively remove keys whose value is '', null, or undefined.
// Preserves false, 0, and non-empty arrays/objects.
const stripEmpty = (value) => {
    if (Array.isArray(value)) return value.map(stripEmpty);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([k, v]) => [k, stripEmpty(v)])
        );
    }
    return value;
};

const validateTransferToAgent = (params) => {
    const transfers = params?.transfers ?? [];
    if (!transfers.length) return ['At least one transfer rule is required.'];
    return transfers.flatMap((t, i) => [
        ...(t.agent_id?.trim()  ? [] : [`Transfer #${i + 1}: Agent ID is required.`]),
        ...(t.condition?.trim() ? [] : [`Transfer #${i + 1}: Condition is required.`]),
    ]);
};

const validateTransferToNumber = (params) => {
    const transfers = params?.transfers ?? [];
    if (!transfers.length) return ['At least one transfer rule is required.'];
    return transfers.flatMap((t, i) => [
        ...(t.phone_number?.trim() ? [] : [`Transfer #${i + 1}: Phone number is required.`]),
        ...(t.condition?.trim()    ? [] : [`Transfer #${i + 1}: Condition is required.`]),
    ]);
};

const getValidationErrors = (toolId, params) => {
    if (toolId === 'transfer_to_agent')  return validateTransferToAgent(params);
    if (toolId === 'transfer_to_number') return validateTransferToNumber(params);
    return [];
};

// ── Form primitives ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
    return (
        <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
                <div className="h-5 w-9 rounded-full bg-gray-200 transition-all peer-checked:bg-gray-900" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
            </div>
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </label>
    );
}

function Field({ label, hint, required, children }) {
    return (
        <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {hint && <p className="mb-1.5 text-xs text-gray-400">{hint}</p>}
            {children}
        </div>
    );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
    return (
        <input
            type={type}
            value={value ?? ''}
            onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
    );
}

function Select({ value, onChange, options }) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}

// ── Shared config fields ──────────────────────────────────────────────────────

function CommonFields({ config, onChange }) {
    const set = (key, val) => onChange({ ...config, [key]: val });
    return (
        <div className="space-y-4">
            <Field label="Description" hint="Explain when the agent should use this tool.">
                <textarea
                    value={config.description ?? ''}
                    onChange={e => set('description', e.target.value)}
                    rows={3}
                    placeholder="e.g. End the call when the user says goodbye."
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </Field>
            <Field label="Response timeout (seconds)">
                <Input type="number" value={config.response_timeout_secs} onChange={v => set('response_timeout_secs', v)} />
            </Field>
            <Field label="Tool call sound behavior">
                <Select
                    value={config.tool_call_sound_behavior}
                    onChange={v => set('tool_call_sound_behavior', v)}
                    options={[
                        { value: 'auto',   label: 'Auto' },
                        { value: 'always', label: 'Always' },
                        { value: 'never',  label: 'Never' },
                    ]}
                />
            </Field>
            <Field label="Tool error handling mode">
                <Select
                    value={config.tool_error_handling_mode}
                    onChange={v => set('tool_error_handling_mode', v)}
                    options={[
                        { value: 'auto',   label: 'Auto' },
                        { value: 'fail',   label: 'Fail' },
                        { value: 'ignore', label: 'Ignore' },
                    ]}
                />
            </Field>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Toggle checked={config.disable_interruptions} onChange={v => set('disable_interruptions', v)} label="Disable interruptions" />
                <Toggle checked={config.force_pre_tool_speech} onChange={v => set('force_pre_tool_speech', v)} label="Force pre-tool speech" />
            </div>
        </div>
    );
}

// ── Tool-specific param forms ─────────────────────────────────────────────────

function PlayKeypadForm({ params, onChange }) {
    return (
        <Field label="DTMF settings">
            <Toggle
                checked={params.use_out_of_band_dtmf ?? false}
                onChange={v => onChange({ ...params, use_out_of_band_dtmf: v })}
                label="Use out-of-band DTMF"
            />
        </Field>
    );
}

function VoicemailForm({ params, onChange }) {
    return (
        <Field label="Voicemail message" hint="Message left when voicemail is detected.">
            <textarea
                value={params.voicemail_message ?? ''}
                onChange={e => onChange({ ...params, voicemail_message: e.target.value })}
                rows={3}
                placeholder="e.g. Hi, please call us back at..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
        </Field>
    );
}

function TransferToAgentForm({ params, onChange }) {
    const transfers = params.transfers ?? [];

    const updateTransfer = (i, patch) =>
        onChange({ ...params, transfers: transfers.map((t, idx) => idx === i ? { ...t, ...patch } : t) });
    const addTransfer = () =>
        onChange({ ...params, transfers: [...transfers, { agent_id: '', condition: '', delay_ms: 0, enable_transferred_agent_first_message: true }] });
    const removeTransfer = (i) =>
        onChange({ ...params, transfers: transfers.filter((_, idx) => idx !== i) });

    return (
        <div className="space-y-4">
            {transfers.map((tr, i) => (
                <div key={i} className="relative rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <button onClick={() => removeTransfer(i)} className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Transfer #{i + 1}</p>
                    <div className="space-y-3">
                        <Field label="Agent ID" required>
                            <Input value={tr.agent_id ?? ''} onChange={v => updateTransfer(i, { agent_id: v })} placeholder="agent_xxxx" />
                        </Field>
                        <Field label="Condition" required>
                            <Input value={tr.condition ?? ''} onChange={v => updateTransfer(i, { condition: v })} placeholder="e.g. if user asks for support" />
                        </Field>
                        <Field label="Delay (ms)">
                            <Input type="number" value={tr.delay_ms ?? 0} onChange={v => updateTransfer(i, { delay_ms: v })} />
                        </Field>
                        <Field label="Transfer message">
                            <Input value={tr.transfer_message ?? ''} onChange={v => updateTransfer(i, { transfer_message: v })} placeholder="Optional message on transfer" />
                        </Field>
                        <Toggle
                            checked={tr.enable_transferred_agent_first_message ?? true}
                            onChange={v => updateTransfer(i, { enable_transferred_agent_first_message: v })}
                            label="Enable transferred agent first message"
                        />
                    </div>
                </div>
            ))}
            <button
                onClick={addTransfer}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
                <Plus className="h-4 w-4" /> Add transfer
            </button>
        </div>
    );
}

function TransferToNumberForm({ params, onChange }) {
    const transfers = params.transfers ?? [];

    const updateTransfer = (i, patch) =>
        onChange({ ...params, transfers: transfers.map((t, idx) => idx === i ? { ...t, ...patch } : t) });
    const addTransfer = () =>
        onChange({ ...params, transfers: [...transfers, { phone_number: '', condition: '', transfer_type: 'conference' }] });
    const removeTransfer = (i) =>
        onChange({ ...params, transfers: transfers.filter((_, idx) => idx !== i) });

    return (
        <div className="space-y-4">
            {transfers.map((tr, i) => (
                <div key={i} className="relative rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <button onClick={() => removeTransfer(i)} className="absolute right-3 top-3 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Transfer #{i + 1}</p>
                    <div className="space-y-3">
                        <Field label="Phone number" required>
                            <Input
                                value={tr.phone_number ?? ''}
                                onChange={v => updateTransfer(i, {
                                    phone_number: v,
                                    transfer_destination: { type: 'phone', phone_number: v },
                                })}
                                placeholder="+1 555 000 0000"
                            />
                        </Field>
                        <Field label="Condition" required>
                            <Input value={tr.condition ?? ''} onChange={v => updateTransfer(i, { condition: v })} placeholder="e.g. if user asks for a human" />
                        </Field>
                        <Field label="Transfer type">
                            <Select
                                value={tr.transfer_type ?? 'conference'}
                                onChange={v => updateTransfer(i, { transfer_type: v })}
                                options={[
                                    { value: 'conference', label: 'Conference' },
                                    { value: 'blind',      label: 'Blind' },
                                    { value: 'sip_refer',  label: 'SIP REFER' },
                                ]}
                            />
                        </Field>
                        <Field label="Post dial digits">
                            <Input value={tr.post_dial_digits ?? ''} onChange={v => updateTransfer(i, { post_dial_digits: v })} placeholder="Optional DTMF digits" />
                        </Field>
                    </div>
                </div>
            ))}
            <button
                onClick={addTransfer}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
                <Plus className="h-4 w-4" /> Add transfer
            </button>
            <Toggle
                checked={params.enable_client_message ?? true}
                onChange={v => onChange({ ...params, enable_client_message: v })}
                label="Enable client message"
            />
        </div>
    );
}

function ToolParamsForm({ toolId, params, onChange }) {
    if (toolId === 'play_keypad_touch_tone') return <PlayKeypadForm params={params} onChange={onChange} />;
    if (toolId === 'voicemail_detection')    return <VoicemailForm  params={params} onChange={onChange} />;
    if (toolId === 'transfer_to_agent')      return <TransferToAgentForm  params={params} onChange={onChange} />;
    if (toolId === 'transfer_to_number')     return <TransferToNumberForm params={params} onChange={onChange} />;
    return <p className="text-xs italic text-gray-400">No additional configuration for this tool.</p>;
}

// ── Settings Drawer ───────────────────────────────────────────────────────────

function SettingsDrawer({ tool, toolConfig, onClose, onSave, onCancel }) {
    const [config, setConfig] = useState(() => ({ ...DEFAULT_TOOL_CONFIG, ...toolConfig }));
    const [params, setParams] = useState(() => ({
        ...(TOOL_PARAMS_DEFAULTS[tool.id] || {}),
        ...(toolConfig?.params || {}),
    }));

    const hasParams = ['play_keypad_touch_tone', 'voicemail_detection', 'transfer_to_agent', 'transfer_to_number'].includes(tool.id);
    const validationErrors = getValidationErrors(tool.id, params);
    const isInvalid = validationErrors.length > 0;

    const handleCancel = () => {
        onCancel?.();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={handleCancel} />

            {/* Panel */}
            <div className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col border-l border-gray-200 bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                                <Wrench className="h-3.5 w-3.5 text-gray-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">{tool.label}</h3>
                        </div>
                        <p className="mt-0.5 pl-9 text-xs text-gray-500">System tool configuration</p>
                    </div>
                    <button onClick={handleCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto space-y-6 px-5 py-5">
                    <section>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">General</p>
                        <CommonFields config={config} onChange={setConfig} />
                    </section>

                    {hasParams && (
                        <>
                            <div className="border-t border-gray-100" />
                            <section>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Tool Parameters</p>
                                <ToolParamsForm toolId={tool.id} params={params} onChange={setParams} />
                            </section>
                        </>
                    )}
                </div>

                {/* Validation errors */}
                {isInvalid && (
                    <div className="border-t border-red-100 bg-red-50 px-5 py-3 space-y-0.5">
                        {validationErrors.map((e, i) => (
                            <p key={i} className="text-xs text-red-600">{e}</p>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex gap-2 justify-end border-t border-gray-100 px-5 py-4">
                    <button
                        onClick={handleCancel}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isInvalid}
                        onClick={() => { onSave(tool.id, config, params); onClose(); }}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Save changes
                    </button>
                </div>
            </div>
        </>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

const INITIAL_BUILT_IN_TOOLS = {
    end_call:               { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'end_call' } },
    language_detection:     { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'language_detection' } },
    skip_turn:              { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'skip_turn' } },
    transfer_to_agent:      { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'transfer_to_agent',  transfers: [{ agent_id: 'agent_1401khhdv21tf5dr349d9x01e4nc', condition: 'if user ask for support', delay_ms: 0, transfer_message: null, enable_transferred_agent_first_message: true }] } },
    transfer_to_number:     { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'transfer_to_number', transfers: [{ custom_sip_headers: [], phone_number: '+155122345678', condition: 'if the user ask for human', transfer_type: 'conference', post_dial_digits: null }], enable_client_message: true } },
    play_keypad_touch_tone: { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'play_keypad_touch_tone', use_out_of_band_dtmf: false } },
    voicemail_detection:    { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'voicemail_detection', voicemail_message: '' } },
};

export default function AgentToolsSection({ config }) {
    const { trackChange } = useAgentChanges();
    const [activeToolTab, setActiveToolTab] = useState('tools');

    const builtInTools = config?.agent?.prompt?.built_in_tools || INITIAL_BUILT_IN_TOOLS;

    const [toolStates, setToolStates] = useState(() => {
        const initial = {};
        SYSTEM_TOOLS.forEach(t => {
            initial[t.id] = builtInTools[t.id] !== undefined && builtInTools[t.id] !== null;
        });
        return initial;
    });

    const [toolConfigs, setToolConfigs] = useState(() => ({ ...builtInTools }));
    const [drawerTool, setDrawerTool] = useState(null);
    // True when the drawer was opened automatically by a toggle-on; cancel should revert the toggle.
    const [drawerOpenedByToggle, setDrawerOpenedByToggle] = useState(false);

    const activeCount = Object.values(toolStates).filter(Boolean).length;

    // ── handleSave ────────────────────────────────────────────────────────────
    const handleSave = (toolId, newConfig, newParams) => {
        const updatedTool = stripEmpty({
            ...newConfig,
            params: { ...newParams, system_tool_type: toolId },
        });

        setToolConfigs(prev => ({ ...prev, [toolId]: updatedTool }));
        trackChange(`agent.prompt.built_in_tools.${toolId}`, updatedTool);
    };

    // ── handleDrawerCancel ────────────────────────────────────────────────────
    // Reverts toggle if drawer was auto-opened on a fresh enable.
    const handleDrawerCancel = () => {
        if (drawerOpenedByToggle && drawerTool) {
            setToolStates(prev => ({ ...prev, [drawerTool.id]: false }));
            trackChange(`agent.prompt.built_in_tools.${drawerTool.id}`, null);
        }
        setDrawerOpenedByToggle(false);
    };

    // ── handleToggle ──────────────────────────────────────────────────────────
    const handleToggle = (tool, enabled) => {
        setToolStates(prev => ({ ...prev, [tool.id]: enabled }));

        if (!enabled) {
            trackChange(`agent.prompt.built_in_tools.${tool.id}`, null);
            return;
        }

        // Seed defaults if no existing config
        const existingConfig = toolConfigs[tool.id];
        const seedConfig = existingConfig ?? DEFAULT_ENABLED_CONFIGS[tool.id];
        if (!existingConfig) {
            setToolConfigs(prev => ({ ...prev, [tool.id]: seedConfig }));
        }

        if (REQUIRES_DRAWER_ON_ENABLE.has(tool.id)) {
            // Open drawer; trackChange fires only after user saves
            setDrawerTool(tool);
            setDrawerOpenedByToggle(true);
        } else {
            // Track immediately with stripped defaults
            trackChange(`agent.prompt.built_in_tools.${tool.id}`, stripEmpty(seedConfig));
        }
    };

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                {/* Left — Custom Tools */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Agent Tools</h2>
                        <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
                            Add tool
                        </button>
                    </div>

                    <div className="mb-4 flex items-center gap-1">
                        {['tools', 'mcp'].map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveToolTab(t)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${activeToolTab === t ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>

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

                {/* Right — System Tools */}
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
                                            <button
                                                onClick={() => {
                                                    setDrawerOpenedByToggle(false);
                                                    setDrawerTool(tool);
                                                }}
                                                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                                title="Configure tool"
                                            >
                                                <Settings className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <label className="relative cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={toolStates[tool.id] || false}
                                                onChange={e => handleToggle(tool, e.target.checked)}
                                                className="peer sr-only"
                                            />
                                            <div className="h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-gray-900" />
                                            <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Drawer */}
            {drawerTool && (
                <SettingsDrawer
                    tool={drawerTool}
                    toolConfig={toolConfigs[drawerTool.id]}
                    onClose={() => { setDrawerTool(null); setDrawerOpenedByToggle(false); }}
                    onSave={handleSave}
                    onCancel={handleDrawerCancel}
                />
            )}
        </>
    );
}