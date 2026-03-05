import { useState, useEffect, useRef } from 'react';
import { Plus, Wrench, Settings, X, Trash2 } from 'lucide-react';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';
import axios from 'axios';

const SYSTEM_TOOLS = [
    { id: 'end_call',               label: 'End conversation' },
    { id: 'language_detection',     label: 'Detect language' },
    { id: 'skip_turn',              label: 'Skip turn' },
    { id: 'transfer_to_agent',      label: 'Transfer to agent' },
    { id: 'transfer_to_number',     label: 'Transfer to number' },
    { id: 'play_keypad_touch_tone', label: 'Play keypad touch tone' },
    { id: 'voicemail_detection',    label: 'Voicemail detection' },
];

const REQUIRES_DRAWER_ON_ENABLE = new Set(['transfer_to_agent', 'transfer_to_number']);

const DEFAULT_TOOL_CONFIG = {
    response_timeout_secs:    20,
    disable_interruptions:    false,
    force_pre_tool_speech:    false,
    tool_call_sound_behavior: 'auto',
    tool_error_handling_mode: 'auto',
};

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

const stripEmpty = (value) => {
    if (Array.isArray(value)) {
        const cleaned = value.map(stripEmpty).filter(v =>
            v !== null && v !== undefined && v !== '' &&
            !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
        );
        return cleaned;
    }
    if (value !== null && typeof value === 'object') {
        const cleaned = Object.fromEntries(
            Object.entries(value)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([k, v]) => [k, stripEmpty(v)])
                .filter(([, v]) =>
                    !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
                )
        );
        return cleaned;
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

// ── Deserialize API tool_data → internal drawer format ────────────────────────

const BLANK_PARAM = () => ({
    _key:        crypto.randomUUID(),
    identifier:  '',
    type:        'string',
    required:    false,
    value_type:  'llm_prompt',
    description: '',
    enum_values: [],
    enum_input:  '',
});

const BLANK_HEADER = () => ({
    _key:        crypto.randomUUID(),
    header_type: 'secret',
    name:        '',
    secret_id:   '',
    value:       '',
});

function deserializeTool(toolData) {
    const api = toolData.api_schema ?? {};

    const request_headers = Object.entries(api.request_headers ?? {}).map(([name, val]) => ({
        ...BLANK_HEADER(),
        name,
        header_type: val.secret_id ? 'secret' : 'value',
        secret_id:   val.secret_id ?? '',
        value:       val.value ?? '',
    }));

    const qSchema = api.query_params_schema ?? {};
    const query_params_schema = Object.entries(qSchema.properties ?? {}).map(([identifier, prop]) => ({
        ...BLANK_PARAM(),
        identifier,
        type:        prop.type ?? 'string',
        required:    (qSchema.required ?? []).includes(identifier),
        description: prop.description ?? '',
        enum_values: prop.enum ?? [],
    }));

    const bSchema = api.request_body_schema ?? {};
    const bodyProps = Object.entries(bSchema.properties ?? {}).map(([identifier, prop]) => ({
        ...BLANK_PARAM(),
        identifier,
        type:        prop.type ?? 'string',
        required:    (bSchema.required ?? []).includes(identifier),
        description: prop.description ?? '',
        enum_values: prop.enum ?? [],
    }));

    return {
        name:                     toolData.name ?? '',
        description:              toolData.description ?? '',
        response_timeout_secs:    toolData.response_timeout_secs ?? 20,
        disable_interruptions:    toolData.disable_interruptions ?? false,
        force_pre_tool_speech:    toolData.force_pre_tool_speech ?? false,
        tool_call_sound:          toolData.tool_call_sound ?? null,
        tool_call_sound_behavior: toolData.tool_call_sound_behavior ?? 'auto',
        tool_error_handling_mode: toolData.tool_error_handling_mode ?? 'auto',
        execution_mode:           toolData.execution_mode ?? 'immediate',
        api_schema: {
            method:          api.method ?? 'POST',
            url:             api.url ?? '',
            content_type:    api.content_type ?? 'application/json',
            auth_connection: api.auth_connection ?? null,
            request_headers,
            query_params_schema,
            request_body_schema: {
                description: bSchema.description ?? '',
                properties:  bodyProps,
            },
        },
    };
}

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

function Spinner({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
        </svg>
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

function AgentSelect({ value, onChange, currentAgentId }) {
    const [agents, setAgents]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get('/get-all-agents')
            .then(res => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.agents ?? []);
                setAgents(list.filter(a => a.agent_id !== currentAgentId));
            })
            .catch(() => setError('Failed to load agents'))
            .finally(() => setLoading(false));
    }, [currentAgentId]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <svg className="h-3.5 w-3.5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm text-gray-400">Loading agents…</span>
            </div>
        );
    }

    if (error) {
        return <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>;
    }

    return (
        <select
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
            <option value="" disabled>Select an agent…</option>
            {agents.map(a => (
                <option key={a.agent_id} value={a.agent_id}>
                    {a.name ?? a.agent_id}
                </option>
            ))}
        </select>
    );
}

function TransferToAgentForm({ params, onChange, currentAgentId }) {
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
                        <Field label="Agent" required>
                            <AgentSelect value={tr.agent_id ?? ''} onChange={v => updateTransfer(i, { agent_id: v })} currentAgentId={currentAgentId} />
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

function ToolParamsForm({ toolId, params, onChange, currentAgentId }) {
    if (toolId === 'play_keypad_touch_tone') return <PlayKeypadForm params={params} onChange={onChange} />;
    if (toolId === 'voicemail_detection')    return <VoicemailForm  params={params} onChange={onChange} />;
    if (toolId === 'transfer_to_agent')      return <TransferToAgentForm  params={params} onChange={onChange} currentAgentId={currentAgentId} />;
    if (toolId === 'transfer_to_number')     return <TransferToNumberForm params={params} onChange={onChange} />;
    return <p className="text-xs italic text-gray-400">No additional configuration for this tool.</p>;
}

// ── Settings Drawer ───────────────────────────────────────────────────────────

function SettingsDrawer({ tool, toolConfig, onClose, onSave, onCancel, currentAgentId }) {
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
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={handleCancel} />
            <div className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col border-l border-gray-200 bg-white shadow-2xl">
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
                                <ToolParamsForm toolId={tool.id} params={params} onChange={setParams} currentAgentId={currentAgentId} />
                            </section>
                        </>
                    )}
                </div>

                {isInvalid && (
                    <div className="border-t border-red-100 bg-red-50 px-5 py-3 space-y-0.5">
                        {validationErrors.map((e, i) => (
                            <p key={i} className="text-xs text-red-600">{e}</p>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 justify-end border-t border-gray-100 px-5 py-4">
                    <button onClick={handleCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
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

// ── Webhook Tool Drawer (Add + Edit) ──────────────────────────────────────────

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const BODY_METHODS  = new Set(['POST', 'PUT', 'PATCH']);

const BLANK_TOOL = () => ({
    name:                     '',
    description:              '',
    response_timeout_secs:    20,
    disable_interruptions:    false,
    force_pre_tool_speech:    false,
    tool_call_sound:          null,
    tool_call_sound_behavior: 'auto',
    tool_error_handling_mode: 'auto',
    execution_mode:           'immediate',
    api_schema: {
        method:          'POST',
        url:             '',
        content_type:    'application/json',
        auth_connection: null,
        request_headers:     [],
        query_params_schema: [],
        request_body_schema: {
            description: '',
            properties:  [],
        },
    },
});

function serializeTool(tool) {
    const { api_schema, ...rest } = tool;

    const request_headers = {};
    (api_schema.request_headers ?? []).forEach(h => {
        if (!h.name.trim()) return;
        request_headers[h.name] = h.header_type === 'secret'
            ? { secret_id: h.secret_id }
            : { value: h.value };
    });

    const query_params_schema = (api_schema.query_params_schema ?? []).length
        ? buildParamsSchema(api_schema.query_params_schema)
        : null;

    const body_props = (api_schema.request_body_schema?.properties ?? []).filter(p => p.identifier.trim());
    let request_body_schema = null;
    if (BODY_METHODS.has(api_schema.method)) {
        const properties = {};
        body_props.forEach(p => {
            const prop = { type: p.type, is_system_provided: false };
            if (p.description) prop.description = p.description;
            if (p.enum_values?.length) prop.enum = p.enum_values;
            properties[p.identifier] = prop;
        });
        const desc = api_schema.request_body_schema?.description;
        request_body_schema = {
            type: 'object',
            ...(desc ? { description: desc } : {}),
            required: body_props.filter(p => p.required).map(p => p.identifier),
            properties,
        };
    }

    const final_body_schema = BODY_METHODS.has(api_schema.method)
        ? (request_body_schema ?? { type: 'object', description: '', required: [], properties: {} })
        : null;

    const schema = {
        url:          api_schema.url,
        method:       api_schema.method,
        content_type: api_schema.content_type,
        ...(Object.keys(request_headers).length ? { request_headers } : {}),
        ...(query_params_schema ? { query_params_schema } : {}),
        ...(final_body_schema   ? { request_body_schema: final_body_schema } : {}),
    };

    const top = {};
    if (rest.name)        top.name        = rest.name;
    if (rest.description) top.description = rest.description;
    top.response_timeout_secs    = rest.response_timeout_secs;
    top.disable_interruptions    = rest.disable_interruptions;
    top.force_pre_tool_speech    = rest.force_pre_tool_speech;
    top.tool_call_sound_behavior = rest.tool_call_sound_behavior;
    top.tool_error_handling_mode = rest.tool_error_handling_mode;
    top.execution_mode           = rest.execution_mode;
    if (rest.tool_call_sound) top.tool_call_sound = rest.tool_call_sound;

    return { type: 'webhook', ...top, api_schema: schema };
}

function buildParamsSchema(params) {
    const valid = params.filter(p => p.identifier.trim());
    const schema = {
        type: 'object',
        required: valid.filter(p => p.required).map(p => p.identifier),
        properties: {},
    };
    valid.forEach(p => {
        const prop = { type: p.type, is_system_provided: false };
        if (p.description) prop.description = p.description;
        if (p.enum_values?.length) prop.enum = p.enum_values;
        schema.properties[p.identifier] = prop;
    });
    return schema;
}

function ParamRow({ param, onChange, onDelete }) {
    const addEnum = () => {
        if (!param.enum_input.trim()) return;
        onChange({ ...param, enum_values: [...param.enum_values, param.enum_input.trim()], enum_input: '' });
    };
    const removeEnum = (i) => onChange({ ...param, enum_values: param.enum_values.filter((_, idx) => idx !== i) });

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Data type">
                    <Select
                        value={param.type}
                        onChange={v => onChange({ ...param, type: v })}
                        options={[
                            { value: 'string',  label: 'String' },
                            { value: 'number',  label: 'Number' },
                            { value: 'boolean', label: 'Boolean' },
                            { value: 'array',   label: 'Array' },
                        ]}
                    />
                </Field>
                <Field label="Identifier">
                    <Input value={param.identifier} onChange={v => onChange({ ...param, identifier: v })} placeholder="param_name" />
                </Field>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
                <input
                    type="checkbox"
                    checked={param.required}
                    onChange={e => onChange({ ...param, required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                />
                <span className="text-sm text-gray-700">Required</span>
            </label>
            <Field label="Value Type">
                <Select
                    value={param.value_type}
                    onChange={v => onChange({ ...param, value_type: v })}
                    options={[
                        { value: 'llm_prompt',       label: 'LLM Prompt' },
                        { value: 'dynamic_variable',  label: 'Dynamic variable' },
                        { value: 'constant',          label: 'Constant' },
                    ]}
                />
            </Field>
            <Field label="Description">
                <textarea
                    value={param.description}
                    onChange={e => onChange({ ...param, description: e.target.value })}
                    rows={2}
                    placeholder="Describe this parameter for the LLM…"
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
                <p className="mt-1 text-xs text-gray-400">This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.</p>
            </Field>
            <Field label="Enum Values (optional)">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={param.enum_input}
                        onChange={e => onChange({ ...param, enum_input: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEnum())}
                        placeholder="Enter an enum value"
                        className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <button onClick={addEnum} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
                {param.enum_values.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {param.enum_values.map((v, i) => (
                            <span key={i} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                                {v}
                                <button onClick={() => removeEnum(i)} className="text-gray-400 hover:text-red-500">x</button>
                            </span>
                        ))}
                    </div>
                )}
                <p className="mt-1 text-xs text-gray-400">Add predefined values that the LLM can select from.</p>
            </Field>
            <div className="flex justify-end">
                <button onClick={onDelete} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    Delete
                </button>
            </div>
        </div>
    );
}

function HeaderRow({ header, onChange, onDelete, secrets, onOpenSecretDrawer }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                    <Select
                        value={header.header_type}
                        onChange={v => onChange({ ...header, header_type: v })}
                        options={[
                            { value: 'secret', label: 'Secret' },
                            { value: 'value',  label: 'Value' },
                        ]}
                    />
                </Field>
                <Field label="Name">
                    <Input value={header.name} onChange={v => onChange({ ...header, name: v })} placeholder="Authorization" />
                </Field>
            </div>
            {header.header_type === 'secret' ? (
                <Field label="Secret">
                    <SecretSelect value={header.secret_id} onChange={(v) => onChange({ ...header, secret_id: v })} secrets={secrets} onCreateNew={onOpenSecretDrawer} />
                </Field>
            ) : (
                <Field label="Value">
                    <Input value={header.value} onChange={v => onChange({ ...header, value: v })} placeholder="header value" />
                </Field>
            )}
            <div className="flex justify-end">
                <button onClick={onDelete} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                    Delete
                </button>
            </div>
        </div>
    );
}

function SecretSelect({ value, onChange, secrets, onCreateNew }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = secrets.find((s) => s.secret_id === value);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
            >
                <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                    {selected ? selected.name : 'Select a secret…'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <div className="absolute z-30 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg overflow-hidden">
                    {secrets.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No secrets yet.</p>}
                    {secrets.map((s) => (
                        <button key={s.id} type="button" onClick={() => { onChange(s.secret_id); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors">
                            {s.name}
                            {s.id === value && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                    <div className="border-t border-gray-100">
                        <button type="button" onClick={() => { setOpen(false); onCreateNew(); }} className="flex w-full items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            Create new secret
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SecretDrawer({ open, onClose, onCreated }) {
    const [name, setName]     = useState('');
    const [value, setValue]   = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState('');

    useEffect(() => {
        if (open) { setName(''); setValue(''); setError(''); }
    }, [open]);

    async function handleAdd() {
        if (!name.trim() || !value.trim()) { setError('Both name and value are required.'); return; }
        setError('');
        setSaving(true);
        try {
            const res = await axios.post('/app/create-secret', { name: name.trim(), value: value.trim() });
            const created = res.data?.secret ?? { id: res.data?.id, name: name.trim() };
            onCreated(created);
            onClose();
        } catch {
            setError('Failed to create secret. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div
                className="fixed inset-0 z-40 transition-opacity duration-200"
                style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(1px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
                onClick={onClose}
            />
            <div
                className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
                style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-500">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-900">Add secret</h2>
                        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">Securely store a value that can be used by the tools. Once added the value cannot be retrieved.</p>
                    </div>
                    <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none mt-0.5">x</button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <Field label="Name"><Input value={name} onChange={setName} placeholder="e.g. API_KEY" /></Field>
                    <Field label="Value">
                        <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Secret value…" rows={10} className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors resize-none font-mono" />
                    </Field>
                    {error && <p className="text-xs text-red-500 rounded border border-red-100 bg-red-50 px-3 py-2">{error}</p>}
                </div>
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="rounded border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={handleAdd} disabled={saving || !name.trim() || !value.trim()} className="flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        {saving && <Spinner size={13} />}
                        {saving ? 'Adding…' : 'Add secret'}
                    </button>
                </div>
            </div>
        </>
    );
}

function SectionBlock({ title, hint, actionLabel, onAdd, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
                </div>
                <button onClick={onAdd} className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    {actionLabel}
                </button>
            </div>
            {children}
        </div>
    );
}

// ── Unified Add / Edit Webhook Tool Drawer ────────────────────────────────────
// Props:
//   mode        'add' | 'edit'
//   editToolId  string – tool_id (edit only)
//   initialTool deserialized tool object (edit only)
//   onSave      async (serialized) => void  (add mode)
//   onUpdate    (toolId, serialized) => void (edit mode, called after success)
//   onClose     () => void

function AddToolDrawer({ onClose, onSave, onUpdate, mode = 'add', editToolId = null, initialTool = null }) {

    const [tool, setTool]         = useState(() => initialTool ?? BLANK_TOOL());
    const [secrets, setSecrets]   = useState([]);
    const [saving, setSaving]     = useState(false);
    const [saveError, setSaveError] = useState('');
    const [secretDrawerOpen, setSecretDrawerOpen] = useState(false);
    const pendingHeaderIdx = useRef(null);

    const isEdit = mode === 'edit';

    // Keep tool in sync when initialTool arrives asynchronously
    useEffect(() => {
        if (initialTool) setTool(initialTool);
    }, [initialTool]);

    // Fetch workspace secrets
    useEffect(() => {
        axios.get('/app/get-secrets').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.secrets ?? []);
            setSecrets(list);
        }).catch(() => {});
    }, []);

    const setSchema   = (patch) => setTool(t => ({ ...t, api_schema: { ...t.api_schema, ...patch } }));
    const setBodyMeta = (patch) => setSchema({ request_body_schema: { ...tool.api_schema.request_body_schema, ...patch } });

    const updateQueryParam = (i, patch) => setSchema({ query_params_schema: tool.api_schema.query_params_schema.map((p, idx) => idx === i ? { ...p, ...patch } : p) });
    const addQueryParam    = () => setSchema({ query_params_schema: [...tool.api_schema.query_params_schema, BLANK_PARAM()] });
    const removeQueryParam = (i) => setSchema({ query_params_schema: tool.api_schema.query_params_schema.filter((_, idx) => idx !== i) });

    const bodyProps      = tool.api_schema.request_body_schema?.properties ?? [];
    const updateBodyProp = (i, patch) => setBodyMeta({ properties: bodyProps.map((p, idx) => idx === i ? { ...p, ...patch } : p) });
    const addBodyProp    = () => setBodyMeta({ properties: [...bodyProps, BLANK_PARAM()] });
    const removeBodyProp = (i) => setBodyMeta({ properties: bodyProps.filter((_, idx) => idx !== i) });

    const headers      = tool.api_schema.request_headers ?? [];
    const updateHeader = (i, patch) => setSchema({ request_headers: headers.map((h, idx) => idx === i ? { ...h, ...patch } : h) });
    const addHeader    = () => setSchema({ request_headers: [...headers, BLANK_HEADER()] });
    const removeHeader = (i) => setSchema({ request_headers: headers.filter((_, idx) => idx !== i) });

    const showBody = BODY_METHODS.has(tool.api_schema.method);

    function openDrawerForHeader(idx) {
        pendingHeaderIdx.current = idx;
        setSecretDrawerOpen(true);
    }

    function handleSecretCreated(newSecret) {
        setSecrets((prev) => [...prev, newSecret]);
        const idx = pendingHeaderIdx.current;
        if (idx !== null) {
            updateHeader(idx, { secret_id: newSecret.secret_id });
            pendingHeaderIdx.current = null;
        }
    }

    const handleSave = async () => {
        setSaveError('');
        setSaving(true);
        try {
            const serialized = serializeTool(tool);
            if (isEdit) {
                
                console.log(serialized)
                await axios.post('/app/update-tool', { config: serialized, tool_id: editToolId });
                onUpdate?.(editToolId, serialized);
            } else {
                // Create new tool
                await onSave(serialized);
            }
            onClose();
        } catch {
            setSaveError(isEdit
                ? 'Failed to update tool. Please try again.'
                : 'Failed to save tool. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const isDisabled = !tool.name.trim() || !tool.api_schema.url.trim() || saving;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
            <div className="fixed right-0 top-0 z-50 flex h-full w-[520px] flex-col border-l border-gray-200 bg-white shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {isEdit ? 'Edit webhook tool' : 'Add webhook tool'}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {isEdit
                                ? `Editing: ${tool.name || 'tool'}`
                                : 'Configure a webhook tool for this agent'}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto space-y-5 px-5 py-5">
                    <Field label="Name" required>
                        <Input value={tool.name} onChange={v => setTool(t => ({ ...t, name: v }))} placeholder="book_appointment" />
                    </Field>
                    <Field label="Description">
                        <textarea
                            value={tool.description}
                            onChange={e => setTool(t => ({ ...t, description: e.target.value }))}
                            rows={3}
                            placeholder="Describe what this tool does…"
                            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                    </Field>
                    <div className="grid grid-cols-[140px,1fr] gap-3">
                        <Field label="Method">
                            <Select value={tool.api_schema.method} onChange={v => setSchema({ method: v })} options={HTTP_METHODS.map(m => ({ value: m, label: m }))} />
                        </Field>
                        <Field label="URL" required>
                            <Input value={tool.api_schema.url} onChange={v => setSchema({ url: v })} placeholder="https://example.com/webhook" />
                        </Field>
                    </div>
                    <Field label="Response timeout (seconds)" hint="How long to wait for the tool to respond before timing out. Default is 20 seconds.">
                        <div className="flex items-center gap-3">
                            <input type="range" min={1} max={60} value={tool.response_timeout_secs} onChange={e => setTool(t => ({ ...t, response_timeout_secs: Number(e.target.value) }))} className="flex-1 accent-gray-900" />
                            <span className="w-8 text-right text-sm font-medium text-gray-700">{tool.response_timeout_secs}</span>
                        </div>
                    </Field>
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <label className="flex cursor-pointer items-center gap-3">
                            <input type="checkbox" checked={tool.disable_interruptions} onChange={e => setTool(t => ({ ...t, disable_interruptions: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 accent-gray-900" />
                            <div>
                                <p className="text-sm font-medium text-gray-800">Disable interruptions</p>
                                <p className="text-xs text-gray-400">Select this box to disable interruptions while the tool is running.</p>
                            </div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Pre-tool speech</p>
                            <p className="mt-0.5 text-xs text-gray-400">Force agent speech before tool execution or let it decide automatically based on recent execution times.</p>
                        </div>
                        <Select
                            value={tool.force_pre_tool_speech ? 'forced' : 'auto'}
                            onChange={v => setTool(t => ({ ...t, force_pre_tool_speech: v === 'forced' }))}
                            options={[{ value: 'auto', label: 'Auto' }, { value: 'forced', label: 'Forced' }]}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Execution mode</p>
                            <p className="mt-0.5 text-xs text-gray-400">Determines when and how the tool executes relative to agent speech.</p>
                        </div>
                        <Select
                            value={tool.execution_mode}
                            onChange={v => setTool(t => ({ ...t, execution_mode: v }))}
                            options={[{ value: 'immediate', label: 'Immediate' }, { value: 'blocking', label: 'Blocking' }, { value: 'background', label: 'Background' }]}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Tool call sound</p>
                            <p className="mt-0.5 text-xs text-gray-400">Optional sound effect that plays during tool execution.</p>
                        </div>
                        <Select
                            value={tool.tool_call_sound ?? 'none'}
                            onChange={v => setTool(t => ({ ...t, tool_call_sound: v === 'none' ? null : v }))}
                            options={[{ value: 'none', label: 'None' }, { value: 'typing', label: 'Typing' }, { value: 'beep', label: 'Beep' }]}
                        />
                    </div>
                    <SectionBlock title="Headers" hint="Define headers that will be sent with the request" actionLabel="Add header" onAdd={addHeader}>
                        {headers.map((h, i) => (
                            <HeaderRow key={h._key} header={h} secrets={secrets} onChange={patch => updateHeader(i, patch)} onDelete={() => removeHeader(i)} onOpenSecretDrawer={() => openDrawerForHeader(i)} />
                        ))}
                    </SectionBlock>
                    <SecretDrawer open={secretDrawerOpen} onClose={() => setSecretDrawerOpen(false)} onCreated={handleSecretCreated} />
                    <SectionBlock title="Query parameters" hint="Define parameters that will be collected by the LLM and sent as the query of the request." actionLabel="Add param" onAdd={addQueryParam}>
                        {tool.api_schema.query_params_schema.map((p, i) => (
                            <ParamRow key={p._key} param={p} onChange={patch => updateQueryParam(i, patch)} onDelete={() => removeQueryParam(i)} />
                        ))}
                    </SectionBlock>
                    {showBody && (
                        <SectionBlock title="Body parameters" hint="Define parameters that will be collected by the LLM and sent as the body of the request." actionLabel="Add param" onAdd={addBodyProp}>
                            <Field label="Description">
                                <textarea
                                    value={tool.api_schema.request_body_schema?.description ?? ''}
                                    onChange={e => setBodyMeta({ description: e.target.value })}
                                    rows={2}
                                    placeholder="Describe the body for the LLM…"
                                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                />
                                <p className="mt-1 text-xs text-gray-400">This field will be passed to the LLM and should describe in detail how to extract the data from the transcript.</p>
                            </Field>
                            {bodyProps.length > 0 && (
                                <div>
                                    <p className="mb-2 text-xs font-semibold text-gray-500">Properties</p>
                                    <div className="space-y-3">
                                        {bodyProps.map((p, i) => (
                                            <ParamRow key={p._key} param={p} onChange={patch => updateBodyProp(i, patch)} onDelete={() => removeBodyProp(i)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </SectionBlock>
                    )}
                </div>

                {/* Save error banner */}
                {saveError && (
                    <div className="border-t border-red-100 bg-red-50 px-5 py-3">
                        <p className="text-xs text-red-600">{saveError}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex gap-2 justify-end border-t border-gray-100 px-5 py-4">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isDisabled}
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                    >
                        {saving && <Spinner size={13} />}
                        {saving
                            ? (isEdit ? 'Updating…' : 'Adding…')
                            : (isEdit ? 'Update tool' : 'Add tool')
                        }
                    </button>
                </div>
            </div>
        </>
    );
}

// ── Initial built-in tools ────────────────────────────────────────────────────

const INITIAL_BUILT_IN_TOOLS = {
    end_call:               { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'end_call' } },
    language_detection:     { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'language_detection' } },
    skip_turn:              { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'skip_turn' } },
    transfer_to_agent:      { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'transfer_to_agent',  transfers: [{ agent_id: 'agent_1401khhdv21tf5dr349d9x01e4nc', condition: 'if user ask for support', delay_ms: 0, transfer_message: null, enable_transferred_agent_first_message: true }] } },
    transfer_to_number:     { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'transfer_to_number', transfers: [{ custom_sip_headers: [], phone_number: '+155122345678', condition: 'if the user ask for human', transfer_type: 'conference', post_dial_digits: null }], enable_client_message: true } },
    play_keypad_touch_tone: { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'play_keypad_touch_tone', use_out_of_band_dtmf: false } },
    voicemail_detection:    { description: '', response_timeout_secs: 20, disable_interruptions: false, force_pre_tool_speech: false, tool_call_sound: null, tool_call_sound_behavior: 'auto', tool_error_handling_mode: 'auto', params: { system_tool_type: 'voicemail_detection', voicemail_message: '' } },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AgentToolsSection({ config, agentId }) {
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

    const [toolConfigs, setToolConfigs]   = useState(() => ({ ...builtInTools }));
    const [drawerTool, setDrawerTool]     = useState(null);
    const [drawerOpenedByToggle, setDrawerOpenedByToggle] = useState(false);

    // Add tool
    const [showAddTool, setShowAddTool]   = useState(false);
    const [customTools, setCustomTools]   = useState([]);
    const [toolsLoading, setToolsLoading] = useState(false);
    const [toolIds, setToolIds]           = useState(() => config?.agent?.prompt?.tool_ids ?? []);

    // Edit tool
    const [editingToolId, setEditingToolId]     = useState(null);   // tool_id of the tool being edited
    const [editingToolData, setEditingToolData] = useState(null);   // deserialized initialTool for the drawer
    const [loadingToolId, setLoadingToolId]     = useState(null);   // tool_id row loading spinner
    const [rowFetchError, setRowFetchError]     = useState(null);   // tool_id of failed fetch

    // Fetch full tool list on mount
    useEffect(() => {
        const ids = config?.agent?.prompt?.tool_ids ?? [];
        if (!ids.length) return;
        setToolsLoading(true);
        axios.get('/app/get-tools', { params: { tool_ids: ids } })
            .then(res => {
                const list = Array.isArray(res.data) ? res.data : (res.data?.tools ?? []);
                setCustomTools(list);
            })
            .catch(() => {})
            .finally(() => setToolsLoading(false));
    }, []);

    const activeCount = Object.values(toolStates).filter(Boolean).length;

    // ── handleSave (system tool) ──────────────────────────────────────────────
    const handleSave = (toolId, newConfig, newParams) => {
        const updatedTool = stripEmpty({
            ...newConfig,
            params: { ...newParams, system_tool_type: toolId },
        });
        setToolConfigs(prev => ({ ...prev, [toolId]: updatedTool }));
        trackChange(`agent.prompt.built_in_tools.${toolId}`, updatedTool);
    };

    const handleDrawerCancel = () => {
        if (drawerOpenedByToggle && drawerTool) {
            setToolStates(prev => ({ ...prev, [drawerTool.id]: false }));
            trackChange(`agent.prompt.built_in_tools.${drawerTool.id}`, null);
        }
        setDrawerOpenedByToggle(false);
    };

    // ── handleAddToolSave (create new webhook tool) ───────────────────────────
    const handleAddToolSave = async (serialized) => {
        const res = await axios.post('/app/save-tool', { config: serialized });
        const savedTool = res.data;
        const newToolId = savedTool.toolId;
        setCustomTools(prev => [...prev, savedTool]);
        setToolIds(prev => {
            const updated = [...prev, newToolId];
            trackChange('agent.prompt.tool_ids', updated);
            return updated;
        });
    };

    // ── handleCustomToolClick (fetch details → open edit drawer) ──────────────
    const handleCustomToolClick = async (tool) => {
        const toolId = tool.tool_id ?? tool.id;
        if (loadingToolId === toolId) return;   // already loading
        setRowFetchError(null);
        setLoadingToolId(toolId);
        try {
            const res = await axios.get('/app/get-tool-details', { params: { tool_id: toolId } });
            const rawData = res.data?.tool_data;
            const deserialized = deserializeTool(rawData);
            setEditingToolData(deserialized);
            setEditingToolId(toolId);
        } catch {
            setRowFetchError(toolId);
        } finally {
            setLoadingToolId(null);
        }
    };

    // ── handleUpdateTool (after successful update) ────────────────────────────
    const handleUpdateTool = (toolId, serialized) => {
        setCustomTools(prev =>
            prev.map(t =>
                (t.tool_id ?? t.id) === toolId
                    ? { ...t, tool_name: serialized.name, tool_description: serialized.description }
                    : t
            )
        );
    };

    // ── handleToggle ──────────────────────────────────────────────────────────
    const handleToggle = (tool, enabled) => {
        setToolStates(prev => ({ ...prev, [tool.id]: enabled }));

        if (!enabled) {
            trackChange(`agent.prompt.built_in_tools.${tool.id}`, null);
            return;
        }

        const existingConfig = toolConfigs[tool.id];
        const seedConfig = existingConfig ?? DEFAULT_ENABLED_CONFIGS[tool.id];
        if (!existingConfig) {
            setToolConfigs(prev => ({ ...prev, [tool.id]: seedConfig }));
        }

        if (REQUIRES_DRAWER_ON_ENABLE.has(tool.id)) {
            setDrawerTool(tool);
            setDrawerOpenedByToggle(true);
        } else {
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
                        <button onClick={() => setShowAddTool(true)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
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

                    {toolsLoading ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-12">
                            <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span className="text-sm text-gray-400">Loading tools…</span>
                        </div>
                    ) : customTools.length > 0 ? (
                        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {customTools.map((t, i) => {
                                const toolId   = t.tool_id ?? t.id;
                                const isLoading = loadingToolId === toolId;
                                const hasError  = rowFetchError === toolId;

                                return (
                                    <div
                                        key={toolId ?? i}
                                        onClick={() => !isLoading && handleCustomToolClick(t)}
                                        className={`group flex items-center justify-between px-4 py-3 transition-colors ${isLoading ? 'cursor-wait' : 'cursor-pointer hover:bg-gray-50'}`}
                                    >
                                        {/* Left: icon + text */}
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${isLoading ? 'bg-gray-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                                {isLoading
                                                    ? <Spinner size={14} />
                                                    : <Wrench className="h-3.5 w-3.5 text-gray-500" />
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{t.tool_name}</p>
                                                {hasError ? (
                                                    <p className="text-xs text-red-500">Failed to load — click to retry</p>
                                                ) : t.tool_description ? (
                                                    <p className="text-xs text-gray-400 truncate max-w-[220px]">{t.tool_description}</p>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Right: hover hint + remove */}
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            {!isLoading && (
                                                <span className="hidden group-hover:inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 mr-1">
                                                    <Settings className="h-3 w-3" /> Edit
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const removedId = toolId;
                                                    setCustomTools(prev => prev.filter((_, idx) => idx !== i));
                                                    setToolIds(prev => {
                                                        const updated = prev.filter(id => id !== removedId);
                                                        trackChange('agent.prompt.tool_ids', updated);
                                                        return updated;
                                                    });
                                                }}
                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Detach tool"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                                <Wrench className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">No tools found</p>
                            <p className="mt-1 text-xs text-gray-500">This agent has no attached tools yet.</p>
                            <button onClick={() => setShowAddTool(true)} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                                Add tool
                            </button>
                        </div>
                    )}
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
                                                onClick={() => { setDrawerOpenedByToggle(false); setDrawerTool(tool); }}
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

            {/* System tool Settings Drawer */}
            {drawerTool && (
                <SettingsDrawer
                    tool={drawerTool}
                    toolConfig={toolConfigs[drawerTool.id]}
                    onClose={() => { setDrawerTool(null); setDrawerOpenedByToggle(false); }}
                    onSave={handleSave}
                    onCancel={handleDrawerCancel}
                    currentAgentId={agentId}
                />
            )}

            {/* Add Webhook Tool Drawer */}
            {showAddTool && (
                <AddToolDrawer
                    mode="add"
                    onClose={() => setShowAddTool(false)}
                    onSave={handleAddToolSave}
                />
            )}

            {/* Edit Webhook Tool Drawer — opens after details are fetched */}
            {editingToolId && editingToolData && (
                <AddToolDrawer
                    mode="edit"
                    editToolId={editingToolId}
                    initialTool={editingToolData}
                    onClose={() => { setEditingToolId(null); setEditingToolData(null); }}
                    onUpdate={handleUpdateTool}
                />
            )}
        </>
    );
}