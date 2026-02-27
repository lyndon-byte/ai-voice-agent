import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare, Plus, Trash2, Clock, Hash, FileText, Activity,
    ChevronRight, Loader2, X, Play, Pause, RotateCcw, RotateCw,
    MoreHorizontal, Info, RefreshCw, CheckCircle2, XCircle, AlertCircle, FormInput,
} from 'lucide-react';
import axios from 'axios';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';

// ─── Status badge config ────────────────────────────────────────────────────
const STATUS_CONFIG = {
    initiated:     { className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',      dot: 'bg-slate-400' },
    'in-progress': { className: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200',          dot: 'bg-blue-500 animate-pulse' },
    processing:    { className: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200',    dot: 'bg-violet-500 animate-pulse' },
    done:          { className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
    failed:        { className: 'bg-red-50 text-red-600 ring-1 ring-red-200',             dot: 'bg-red-500' },
};
const STATUS_LABELS = {
    initiated: 'Initiated', 'in-progress': 'In Progress',
    processing: 'Processing', done: 'Done', failed: 'Failed',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDuration(secs) {
    if (secs == null) return '—';
    const m = Math.floor(secs / 60);
    const s = String(Math.floor(secs % 60)).padStart(2, '0');
    return `${m}:${s}`;
}
function formatDurationLabel(secs) {
    if (secs == null) return '—';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function formatDate(unixSecs) {
    if (!unixSecs) return '—';
    return new Date(unixSecs * 1000).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}
function formatCost(n) {
    if (n == null) return '—';
    return `$${Number(n).toFixed(5)}`;
}

// ─── Waveform (decorative bars) ─────────────────────────────────────────────
function Waveform({ progress = 0 }) {
    const bars = 90;
    return (
        <div className="flex h-16 w-full items-center gap-px overflow-hidden">
            {Array.from({ length: bars }).map((_, i) => {
                const h = 15 + Math.abs(Math.sin(i * 0.47) * 60 + Math.cos(i * 0.28) * 22);
                const filled = (i / bars) * 100 < progress;
                return (
                    <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-full flex-1 rounded-[1px] transition-colors duration-75 ${
                            filled ? 'bg-gray-800' : 'bg-gray-200'
                        }`}
                    />
                );
            })}
        </div>
    );
}

// ─── Audio Player ───────────────────────────────────────────────────────────
function AudioPlayer({ conversationId }) {
    const audioRef = useRef(null);
    const [playing,  setPlaying]  = useState(false);
    const [progress, setProgress] = useState(0);
    const [current,  setCurrent]  = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed,    setSpeed]    = useState(1);
    const [loading,  setLoading]  = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error,    setError]    = useState(null);

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const fetchAndPlay = useCallback(async () => {
        if (audioUrl) {
            audioRef.current?.play();
            setPlaying(true);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get('/app/get-conversation-audio', {
                params: { conversationId },
                responseType: 'blob',
            });
            setAudioUrl(URL.createObjectURL(data));
        } catch {
            setError('Could not load audio.');
            setLoading(false);
        }
    }, [conversationId, audioUrl]);

    useEffect(() => {
        if (!audioUrl || !audioRef.current) return;
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().then(() => setPlaying(true)).finally(() => setLoading(false));
    }, [audioUrl]);

    useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

    const togglePlay = () => {
        if (!audioRef.current || loading) return;
        if (!audioUrl) { fetchAndPlay(); return; }
        if (playing) { audioRef.current.pause(); setPlaying(false); }
        else         { audioRef.current.play();  setPlaying(true); }
    };

    const skip = (secs) => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + secs);
    };

    const cycleSpeed = () => {
        const next = speedOptions[(speedOptions.indexOf(speed) + 1) % speedOptions.length];
        setSpeed(next);
        if (audioRef.current) audioRef.current.playbackRate = next;
    };

    return (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
            <audio
                ref={audioRef}
                onTimeUpdate={e => {
                    const d = e.target.duration || 1;
                    const c = e.target.currentTime;
                    setCurrent(c);
                    setProgress((c / d) * 100);
                }}
                onLoadedMetadata={e => setDuration(e.target.duration)}
                onEnded={() => { setPlaying(false); setProgress(100); }}
            />

            <Waveform progress={progress} />

            <div className="mt-3 flex items-center gap-3">
                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    disabled={loading}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition-colors hover:bg-gray-700 disabled:opacity-50"
                >
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : playing
                            ? <Pause className="h-4 w-4" />
                            : <Play  className="h-4 w-4 translate-x-0.5" />
                    }
                </button>

                {/* Speed */}
                <button onClick={cycleSpeed} className="w-11 rounded-md bg-gray-100 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200">
                    {speed}x
                </button>

                {/* Rewind 10s */}
                <button onClick={() => skip(-10)} className="text-gray-400 hover:text-gray-700">
                    <RotateCcw className="h-4 w-4" />
                </button>

                {/* Forward 10s */}
                <button onClick={() => skip(10)} className="text-gray-400 hover:text-gray-700">
                    <RotateCw className="h-4 w-4" />
                </button>

                {/* Time */}
                <span className="ml-auto text-xs tabular-nums text-gray-500">
                    {formatDuration(current)} / {formatDuration(duration)}
                </span>

                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ─── Call success badge ─────────────────────────────────────────────────────
function CallSuccessBadge({ value }) {
    const map = {
        success: { label: 'Successful', Icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
        failure: { label: 'Failed',     Icon: XCircle,      cls: 'bg-red-100 text-red-600' },
    };
    const cfg = map[value] ?? { label: value ?? 'Unknown', Icon: AlertCircle, cls: 'bg-gray-100 text-gray-600' };
    const { Icon } = cfg;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
        </span>
    );
}

// ─── Overview tab ───────────────────────────────────────────────────────────
function OverviewTab({ detail }) {
    const analysis = detail?.analysis ?? {};
    const meta     = detail?.metadata ?? {};
    const rows = [
        { label: 'Call status',        value: <CallSuccessBadge value={analysis.call_successful} />, refresh: true },
        { label: 'How the call ended', value: meta.termination_reason ?? '—' },
        { label: 'User ID',            value: detail?.user_id ?? '—' },
    ];
    return (
        <div>
            {analysis.transcript_summary && (
                <div className="mb-5">
                    <p className="mb-1.5 text-sm font-semibold text-gray-900">Summary</p>
                    <p className="text-sm leading-relaxed text-gray-600">{analysis.transcript_summary}</p>
                </div>
            )}
            <div className="divide-y divide-gray-100">
                {rows.map(({ label, value, refresh }) => (
                    <div key={label} className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-700">{label}</span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            {value}
                            {refresh && (
                                <button className="text-gray-300 hover:text-gray-500">
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Transcription tab ──────────────────────────────────────────────────────
function TranscriptionTab({ transcript }) {
    if (!transcript?.length) return (
        <p className="py-10 text-center text-sm text-gray-400">No transcript available.</p>
    );
    return (
        <div className="space-y-4">
            {transcript.map((turn, idx) => {
                const isAgent = turn.role === 'agent';
                return (
                    <div key={idx} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isAgent ? 'bg-gray-900 text-white' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {isAgent ? 'A' : 'U'}
                        </div>
                        <div className={`max-w-[80%] ${isAgent ? '' : 'text-right'}`}>
                            <div className={`inline-block rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                isAgent ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'
                            }`}>
                                {turn.message}
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                                {formatDuration(turn.time_in_call_secs)} in call
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Client data tab ────────────────────────────────────────────────────────
function ClientDataTab({ detail }) {
    const clientData = detail?.conversation_initiation_client_data ?? {};
    const dynVars    = clientData?.dynamic_variables ?? {};
    const sourceInfo = clientData?.source_info ?? {};

    const DataTable = ({ data }) => (
        <div className="overflow-hidden rounded-lg border border-gray-200">
            {Object.entries(data).map(([k, v], i) => (
                <div key={k} className={`flex items-start justify-between gap-4 px-3 py-2 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <span className="font-mono text-gray-500 break-all min-w-0 flex-1">{k}</span>
                    <span className="text-gray-700 text-right break-all max-w-[55%]">
                        {v == null ? <em className="text-gray-400">null</em> : String(v)}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-5">
            {Object.keys(dynVars).length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Dynamic Variables</p>
                    <DataTable data={dynVars} />
                </div>
            )}
            {Object.keys(sourceInfo).length > 0 && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Source Info</p>
                    <DataTable data={sourceInfo} />
                </div>
            )}
        </div>
    );
}

// ─── Metadata sidebar ───────────────────────────────────────────────────────
function MetadataPanel({ detail }) {
    const meta     = detail?.metadata ?? {};
    const charging = meta.charging ?? {};

    const llmPrice = charging.llm_price;
    const durationSecs = meta.call_duration_secs;
    const llmPerMin = llmPrice != null && durationSecs
        ? formatCost((llmPrice / durationSecs) * 60)
        : '—';

    const rows = [
        { label: 'Date',               value: formatDate(meta.start_time_unix_secs) },
        { label: 'Text-only',          value: meta.text_only ? 'Yes' : 'No' },
        { label: 'Connection duration', value: formatDuration(meta.call_duration_secs) },
        { label: 'Call cost',          value: `${charging.call_charge ?? '—'} credits`, sub: charging.dev_discount ? 'Development discount applied' : null },
        { label: 'Credits (LLM)',      value: charging.llm_charge ?? '—' },
        { label: 'LLM cost',           value: llmPrice != null ? `${llmPerMin} / min` : '—', sub: llmPrice != null ? `Total: ${formatCost(llmPrice)}` : null },
    ];

    return (
        <div className="w-[260px] flex-shrink-0 border-l border-gray-100 bg-gray-50/50">
            <div className="border-b border-gray-100 px-4 py-3">
                <span className="text-sm font-semibold text-gray-900">Metadata</span>
            </div>
            <div className="divide-y divide-gray-100 px-4">
                {rows.map(({ label, value, sub }) => (
                    <div key={label} className="py-3">
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-xs text-gray-500">{label}</span>
                            <span className="text-right text-xs font-semibold text-gray-800">{value}</span>
                        </div>
                        {sub && <p className="mt-0.5 text-right text-[11px] text-gray-400">{sub}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Conversation Drawer ────────────────────────────────────────────────────
function ConversationDrawer({ conversation, onClose }) {
    const [detail,        setDetail]        = useState(null);
    const [detailLoading, setDetailLoading] = useState(true);
    const [detailError,   setDetailError]   = useState(null);
    const [activeTab,     setActiveTab]     = useState('overview');

    const tabs = [
        { key: 'overview',      label: 'Overview' },
        { key: 'transcription', label: 'Transcription' },
        { key: 'client data',   label: 'Client data' },
    ];

    const conversationId = conversation?.conversation_id ?? conversation?.id;

    useEffect(() => {
        if (!conversationId) return;
        setDetail(null);
        setDetailLoading(true);
        setDetailError(null);
        setActiveTab('overview');

        axios.get('/app/get-conversation-details', { params: { conversationId } })
            .then(({ data }) => setDetail(data?.data ?? data))
            .catch(err       => setDetailError(err?.response?.data?.message ?? 'Failed to load details.'))
            .finally(()      => setDetailLoading(false));
    }, [conversationId]);

    const agentName = detail?.agent_name ?? conversation?.agent_name ?? 'Agent';

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-[820px] max-w-[95vw] flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-900">
                            Conversation with{' '}
                            <span className="font-bold">{agentName}</span>
                        </h2>
                        <p className="mt-0.5 truncate font-mono text-xs text-gray-400">{conversationId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                {detailLoading ? (
                    <div className="flex flex-1 items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading conversation…</span>
                    </div>
                ) : detailError ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2">
                        <XCircle className="h-8 w-8 text-red-300" />
                        <p className="text-sm text-red-500">{detailError}</p>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        {/* Main content */}
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
                                {/* Audio player */}
                                <AudioPlayer conversationId={conversationId} />

                                {/* Info banner */}
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                                    <p className="text-xs leading-relaxed text-blue-700">
                                        You can now ensure your agent returns high quality responses to conversations like this one.
                                        Try Tests in the Transcription tab.
                                    </p>
                                </div>

                                {/* Tabs */}
                                <div className="mb-5 border-b border-gray-200">
                                    <div className="flex gap-0.5">
                                        {tabs.map(({ key, label }) => (
                                            <button
                                                key={key}
                                                onClick={() => setActiveTab(key)}
                                                className={`relative px-3 pb-3 pt-1 text-sm font-medium transition-colors ${
                                                    activeTab === key
                                                        ? 'text-gray-900'
                                                        : 'text-gray-400 hover:text-gray-700'
                                                }`}
                                            >
                                                {label}
                                                {activeTab === key && (
                                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-gray-900" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab content */}
                                {activeTab === 'overview'      && <OverviewTab      detail={detail} />}
                                {activeTab === 'transcription' && <TranscriptionTab transcript={detail?.transcript} />}
                                {activeTab === 'client data'   && <ClientDataTab    detail={detail} />}
                            </div>
                        </div>

                        {/* Metadata sidebar */}
                        <MetadataPanel detail={detail} />
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Main EvaluationTab ─────────────────────────────────────────────────────
// ─── DataPointRow ────────────────────────────────────────────────────────────
function DataPointRow({ dp, isLast, onUpdate, onRemove }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`${!isLast ? 'border-b border-gray-200' : ''}`}>
            {/* Collapsed row */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
            >
                <FormInput className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="flex-1 text-sm text-gray-800">
                    {dp.dynamic_variable || <em className="text-gray-400 font-normal">unnamed</em>}
                </span>
                <ChevronRight className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {/* Expanded edit form */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-3 py-3 space-y-2">
                    <input
                        type="text"
                        value={dp.dynamic_variable}
                        onChange={e => onUpdate(dp.id, 'dynamic_variable', e.target.value)}
                        placeholder="Variable name (e.g., customer_email)"
                        className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                    <select
                        value={dp.type}
                        onChange={e => onUpdate(dp.id, 'type', e.target.value)}
                        className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                    >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="array">Array</option>
                    </select>
                    <textarea
                        value={dp.description}
                        onChange={e => onUpdate(dp.id, 'description', e.target.value)}
                        placeholder="Description"
                        rows={3}
                        className="w-full rounded border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={() => onRemove(dp.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3" /> Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EvaluationTab({ platformSettings, agentId }) {
    const { addArrayItem, removeArrayItem, updateArrayItem, trackChange } = useAgentChanges();

    const [criteria,   setCriteria]   = useState(platformSettings?.evaluation?.criteria || []);
    // Convert data_collection map ({ email: { type, description, ... } }) → array with id + dynamic_variable
    const initDataPoints = (dataCollection) => {
        if (!dataCollection) return [];
        if (Array.isArray(dataCollection)) return dataCollection;
        return Object.entries(dataCollection).map(([key, val]) => ({
            id: `data_${key}_${Date.now()}`,
            dynamic_variable: key,
            type: val.type || 'string',
            description: val.description || '',
        }));
    };
    const [dataPoints, setDataPoints] = useState(() => initDataPoints(platformSettings?.data_collection));

    const [conversations,        setConversations]        = useState([]);
    const [conversationsLoading, setConversationsLoading] = useState(false);
    const [conversationsError,   setConversationsError]   = useState(null);
    const [drawerConversation,   setDrawerConversation]   = useState(null);

    const filterChips = [
        'Date After','Date Before','Call status','Criteria',
        'Data','Duration','Rating','Comments','Tools','Language','User','Channel',
    ];

    useEffect(() => {
        if (!agentId) return;
        let cancelled = false;
        setConversationsLoading(true);
        setConversationsError(null);

        axios.get('/app/get-conversations', { params: { agentId } })
            .then(({ data }) => { if (!cancelled) setConversations(data?.data ?? data ?? []); })
            .catch(err       => { if (!cancelled) setConversationsError(err?.response?.data?.message ?? 'Failed to load conversations.'); })
            .finally(()      => { if (!cancelled) setConversationsLoading(false); });

        return () => { cancelled = true; };
    }, [agentId]);

    // Criteria handlers
    const handleAddCriterion = () => {
        const c = { id: `crit_${Date.now()}`, name: 'New Criterion', type: 'boolean', conversation_goal_prompt: '' };
        setCriteria(prev => [...prev, c]);
        addArrayItem('evaluation.criteria', c);
    };
    const handleRemoveCriterion = (id) => {
        setCriteria(prev => prev.filter(c => c.id !== id));
        removeArrayItem('evaluation.criteria', id);
    };
    const handleUpdateCriterion = (id, field, value) => {
        const next = criteria.map(c => c.id === id ? { ...c, [field]: value } : c);
        setCriteria(next);
        const updated = next.find(c => c.id === id);
        if (updated) updateArrayItem('evaluation.criteria', id, updated);
    };

    // Data point handlers
    const handleAddDataPoint = () => {
        const dp = { id: `data_${Date.now()}`, dynamic_variable: '', type: 'string', description: '' };
        const next = [...dataPoints, dp];
        setDataPoints(next);
        trackChange('data_collection', next);
    };
    const handleRemoveDataPoint = (id) => {
        const next = dataPoints.filter(dp => dp.id !== id);
        setDataPoints(next);
        trackChange('data_collection', next);
    };
    const handleUpdateDataPoint = (id, field, value) => {
        const next = dataPoints.map(dp => dp.id === id ? { ...dp, [field]: value } : dp);
        setDataPoints(next);
        trackChange('data_collection', next);
    };

    const renderConversationList = () => {
        if (conversationsLoading) return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 gap-3">
                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-500">Loading conversations…</p>
            </div>
        );
        if (conversationsError) return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12 gap-1">
                <p className="text-sm font-semibold text-red-600">Error loading conversations</p>
                <p className="text-xs text-red-400">{conversationsError}</p>
            </div>
        );
        if (!conversations.length) return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm">
                    <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-900">No conversations found</p>
                <p className="mt-1 text-xs text-gray-500">This agent has no conversations yet.</p>
            </div>
        );

        return (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {/* Header */}
                <div className="grid grid-cols-[1fr,90px,60px,100px,20px] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                    {[
                        { icon: FileText,  label: 'Summary'  },
                        { icon: Clock,     label: 'Duration' },
                        { icon: Hash,      label: 'Msgs'     },
                        { icon: Activity,  label: 'Status'   },
                    ].map(({ icon: Icon, label }) => (
                        <span key={label} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            <Icon className="h-3 w-3" /> {label}
                        </span>
                    ))}
                    <span />
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                    {conversations.map((conv, idx) => {
                        const statusKey = (conv.status ?? '').toLowerCase();
                        const statusCfg = STATUS_CONFIG[statusKey] ?? {
                            className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
                            dot: 'bg-gray-400',
                        };
                        return (
                            <button
                                key={conv.conversation_id ?? conv.id ?? idx}
                                onClick={() => setDrawerConversation(conv)}
                                className="group grid w-full grid-cols-[1fr,90px,60px,100px,20px] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                            >
                                <span className="truncate text-sm font-medium text-gray-800">
                                    {conv.call_summary_title || <em className="font-normal text-gray-400">No summary</em>}
                                </span>
                                <span className="text-sm tabular-nums text-gray-500">
                                    {formatDurationLabel(conv.call_duration_secs)}
                                </span>
                                <span className="text-sm tabular-nums text-gray-500">
                                    {conv.message_count ?? '—'}
                                </span>
                                <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                                    <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${statusCfg.dot}`} />
                                    {STATUS_LABELS[statusKey] ?? conv.status ?? 'Unknown'}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
                {/* Left */}
                <div>
                    <h2 className="mb-4 text-xl font-bold text-gray-900">Analysis</h2>

                    <div className="relative mb-3">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search conversations..." className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300" />
                    </div>

                    <div className="mb-4 flex flex-wrap gap-1.5">
                        {filterChips.map(f => (
                            <button key={f} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                                <span>+</span> {f}
                            </button>
                        ))}
                    </div>

                    {renderConversationList()}
                </div>

                {/* Right */}
                <div className="space-y-4">
                    {/* Evaluation Criteria */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">Evaluation criteria</h3>
                        <p className="mb-3 text-xs text-gray-500">Define criteria to evaluate whether conversations were successful or not.</p>
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <span className="text-xs font-medium text-gray-700">{criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'}</span>
                            <button onClick={handleAddCriterion} className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                                <Plus className="h-3.5 w-3.5" /> Add criteria
                            </button>
                        </div>
                        {criteria.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {criteria.map(criterion => (
                                    <div key={criterion.id} className="rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <input type="text" value={criterion.name} onChange={e => handleUpdateCriterion(criterion.id, 'name', e.target.value)} className="w-full border-b border-transparent px-0 py-1 text-xs font-semibold text-gray-900 focus:border-blue-500 focus:outline-none" placeholder="Criterion name" />
                                                <select value={criterion.type} onChange={e => handleUpdateCriterion(criterion.id, 'type', e.target.value)} className="mt-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                                                    <option value="boolean">Boolean</option>
                                                    <option value="rating">Rating</option>
                                                    <option value="text">Text</option>
                                                </select>
                                                <textarea value={criterion.conversation_goal_prompt} onChange={e => handleUpdateCriterion(criterion.id, 'conversation_goal_prompt', e.target.value)} placeholder="What should this evaluate?" className="mt-2 w-full rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 focus:border-blue-500 focus:outline-none" rows={2} />
                                            </div>
                                            <button onClick={() => handleRemoveCriterion(criterion.id)} className="flex-shrink-0 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
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
                            <span className="text-xs font-medium text-gray-700">{dataPoints.length} data {dataPoints.length === 1 ? 'point' : 'points'}</span>
                            <button onClick={handleAddDataPoint} className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                                <Plus className="h-3.5 w-3.5" /> Add data point
                            </button>
                        </div>
                        {dataPoints.length > 0 && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                                {dataPoints.map((dp, idx) => (
                                    <DataPointRow
                                        key={dp.id}
                                        dp={dp}
                                        isLast={idx === dataPoints.length - 1}
                                        onUpdate={handleUpdateDataPoint}
                                        onRemove={handleRemoveDataPoint}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Conversation drawer (portal-style, fixed) */}
            {drawerConversation && (
                <ConversationDrawer
                    conversation={drawerConversation}
                    onClose={() => setDrawerConversation(null)}
                />
            )}
        </>
    );
}