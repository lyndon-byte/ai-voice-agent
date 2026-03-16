import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare, Plus, Trash2, Clock, Hash, FileText, Activity,
    ChevronRight, ChevronLeft, Loader2, X, Play, Pause, RotateCcw, RotateCw,
    MoreHorizontal, Info, RefreshCw, CheckCircle2, XCircle, AlertCircle, FormInput,
    Settings2, SlidersHorizontal,
} from 'lucide-react';
import axios from 'axios';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';
import Portal from '../Shared/Portal';


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
function Waveform({ isPlaying = false  }) {

    const BARS = 90;

    const baseProfile = Array.from({ length: BARS }, (_, i) =>
    Math.max(4, Math.abs(Math.sin(i * 0.47) * 55 + Math.cos(i * 0.28) * 18))
    );
    const idleHeights = baseProfile.map(h => Math.max(3, h * 0.12));

    const barsRef = useRef([]);
    const rafId = useRef(null);
    const current = useRef([...idleHeights]);
    const target = useRef([...idleHeights]);
    const tick = useRef(0);
  
    const setHeights = () => {
      current.current.forEach((h, i) => {
        if (barsRef.current[i]) {
          barsRef.current[i].style.height = Math.max(3, h) + "px";
        }
      });
    };
  
    useEffect(() => {
      cancelAnimationFrame(rafId.current);
  
      if (isPlaying) {
        const randomTargets = () => {
          target.current = baseProfile.map(h =>
            Math.max(4, h * (0.3 + Math.random() * 0.9))
          );
        };
  
        const animate = () => {
          if (tick.current % 8 === 0) randomTargets();
          tick.current++;
          current.current = current.current.map((h, i) => h + (target.current[i] - h) * 0.25);
          setHeights();
          rafId.current = requestAnimationFrame(animate);
        };
  
        randomTargets();
        animate();
      } else {
        const fadeToIdle = () => {
          const done = current.current.every((h, i) => Math.abs(h - idleHeights[i]) < 0.5);
          if (done) {
            current.current = [...idleHeights];
            setHeights();
            return;
          }
          current.current = current.current.map((h, i) => h + (idleHeights[i] - h) * 0.12);
          setHeights();
          rafId.current = requestAnimationFrame(fadeToIdle);
        };
  
        fadeToIdle();
      }
  
      return () => cancelAnimationFrame(rafId.current);
    }, [isPlaying]); // ← reacts to actual play state, not progress value
  
    return (
      <div className="flex h-16 w-full items-center gap-px">
        {Array.from({ length: BARS }).map((_, i) => (
          <div
            key={i}
            ref={el => (barsRef.current[i] = el)}
            className="flex-1 min-w-0 rounded-sm bg-gray-900"
            style={{ height: idleHeights[i] + "px" }}
          />
        ))}
      </div>
    );
}

// ─── Audio Player ───────────────────────────────────────────────────────────
function AudioPlayer({ conversationId, audioLink }) {

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
        if (audioUrl) { audioRef.current?.play(); setPlaying(true); return; }
        setLoading(true); setError(null);
        try {
            const { data } = await axios.get(audioLink, {
                responseType: 'blob',
            });
            setAudioUrl(URL.createObjectURL(data));
        } catch { setError('Could not load audio.'); setLoading(false); }
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
                onTimeUpdate={e => { const d = e.target.duration || 1; const c = e.target.currentTime; setCurrent(c); setProgress((c / d) * 100); }}
                onLoadedMetadata={e => setDuration(e.target.duration)}
                onEnded={() => { setPlaying(false); setProgress(100); }}
            />
            <Waveform progress={progress} isPlaying={playing} />
            <div className="mt-3 flex items-center gap-3">
                <button onClick={togglePlay} disabled={loading} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition-colors hover:bg-gray-700 disabled:opacity-50">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 " />}
                </button>
                <button onClick={cycleSpeed} className="w-11 rounded-md bg-gray-100 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200">{speed}x</button>
                <span className="ml-auto text-xs tabular-nums text-gray-500">{formatDuration(current)} / {formatDuration(duration)}</span>
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
            <Icon className="h-3.5 w-3.5" />{cfg.label}
        </span>
    );
}

function DataCollectionResultItem({ item, index }) {
    const [showRationale, setShowRationale] = useState(false);
    return (
        <div className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                <span className="text-sm font-medium text-gray-600 shrink-0">{item.data_collection_id}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800 text-right break-all">{item.value ?? '—'}</span>
                    {item.rationale && (
                        <button onClick={() => setShowRationale(v => !v)} title="Show rationale" className={`flex-shrink-0 rounded-full p-0.5 transition-colors ${showRationale ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Info className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
            {showRationale && item.rationale && (
                <div className="border-t border-gray-100 bg-blue-50/50 px-3 py-2">
                    <p className="text-xs leading-relaxed text-gray-500">{item.rationale}</p>
                </div>
            )}
        </div>
    );
}

function EvaluationCriteriaResultItem({ criteriaKey, item, index }) {
    
    if (!item) return null;

    const resultMap = {
        success: { cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
        failure: { cls: 'bg-red-100 text-red-600',     Icon: XCircle },
        unknown: { cls: 'bg-gray-100 text-gray-500',   Icon: AlertCircle },
    };
    const cfg = resultMap[item.result] ?? resultMap.unknown;
    const { Icon } = cfg;

    return (
        <div className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                <span className="text-sm font-medium text-gray-600 shrink-0">
                    {item.criteria_id ?? criteriaKey}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                        <Icon className="h-3 w-3" />
                        {item.result ?? 'unknown'}
                    </span>
                   
                </div>
            </div>
            {item.rationale && (
                <div className="border-t border-gray-100 bg-blue-50/50 px-3 py-2">
                    <p className="text-xs leading-relaxed text-gray-500">{item.rationale}</p>
                </div>
            )}
        </div>
    );
}

function OverviewTab({ detail }) {
    const analysis = detail?.analysis ?? {};
    const meta     = detail?.metadata ?? {};

    const evaluationResults = analysis.evaluation_criteria_results;
    const hasEvaluationResults =
        evaluationResults != null &&
        typeof evaluationResults === 'object' &&
        Object.keys(evaluationResults).length > 0;

    const rows = [
        { label: 'Call status',        value: <CallSuccessBadge value={analysis.call_successful} />},
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
                            {refresh && <button className="text-gray-300 hover:text-gray-500"><RefreshCw className="h-3.5 w-3.5" /></button>}
                        </span>
                    </div>
                ))}
            </div>

            {analysis.data_collection_results_list?.length > 0 && (
                <div className="mt-5">
                    <p className="mb-2 text-sm font-semibold text-gray-900">Data collection</p>
                    <div className="overflow-hidden rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {analysis.data_collection_results_list.map((item, i) => (
                            <DataCollectionResultItem key={item.data_collection_id ?? i} item={item} index={i} />
                        ))}
                    </div>
                </div>
            )}

            {hasEvaluationResults && (

                <div className="mt-5">
                    <p className="mb-2 text-sm font-semibold text-gray-900">Evaluation criteria</p>
                    <div className="overflow-hidden rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {Object.entries(evaluationResults).map(([key, item], i) => (
                            <EvaluationCriteriaResultItem
                                key={key}
                                criteriaKey={key}
                                item={item}
                                index={i}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function TranscriptionTab({ transcript }) {
    if (!transcript?.length) return <p className="py-10 text-center text-sm text-gray-400">No transcript available.</p>;
    return (
        <div className="space-y-3">
            {transcript.map((turn, idx) => {
                const isAgent = turn.role === 'agent';
                const toolCalls = turn.tool_calls?.filter(t => t?.tool_name) ?? [];
                return (
                    <div key={idx} className="space-y-1.5">
                        <div className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${isAgent ? 'bg-gray-900 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                {isAgent ? 'A' : 'U'}
                            </div>
                            <div className={`max-w-[80%] ${isAgent ? '' : 'text-right'}`}>
                                <div className={`inline-block rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isAgent ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
                                    {turn.message}
                                </div>
                                <p className="mt-1 text-xs text-gray-400">{formatDuration(turn.time_in_call_secs)} in call</p>
                            </div>
                        </div>
                        {toolCalls.length > 0 && (
                            <div className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                                <div className="h-7 w-7 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1.5">
                                    {toolCalls.map((tool, tIdx) => (
                                        <span key={tIdx} className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                                            {tool.tool_name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ClientDataTab({ detail }) {
    const clientData = detail?.conversation_initiation_client_data ?? {};
    const dynVars    = clientData?.dynamic_variables ?? {};
    const DataTable = ({ data }) => (
        <div className="overflow-hidden rounded-lg border border-gray-200">
            {Object.entries(data).map(([k, v], i) => (
                <div key={k} className={`flex items-start justify-between gap-4 px-3 py-2 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <span className="font-mono text-gray-500 break-all min-w-0 flex-1">{k}</span>
                    <span className="text-gray-700 text-right break-all max-w-[55%]">{v == null ? <em className="text-gray-400">null</em> : String(v)}</span>
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
        </div>
    );
}

function MetadataPanel({ detail }) {
    const meta     = detail?.metadata ?? {};
    const charging = meta.charging ?? {};
    const llmPrice = charging.llm_price;
    const durationSecs = meta.call_duration_secs;
    const llmPerMin = llmPrice != null && durationSecs ? formatCost((llmPrice / durationSecs) * 60) : '—';
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
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-right text-sm font-semibold text-gray-800">{value}</span>
                        </div>
                        {sub && <p className="mt-0.5 text-right text-xs text-gray-400">{sub}</p>}
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
    const [audioLink,     setAudioLink]          = useState('');

    const tabs = [
        { key: 'overview',      label: 'Overview' },
        { key: 'transcription', label: 'Transcription' },
        { key: 'client data',   label: 'Client data' },
    ];
    const conversationId = conversation?.conversation_id ?? conversation?.id;

    useEffect(() => {
        if (!conversationId) return;
        setDetail(null); setDetailLoading(true); setDetailError(null); setActiveTab('overview');
        axios.get('/app/get-conversation-details', { params: { conversation_id: conversationId } })
            .then(({ data }) => { 
                setDetail(data?.data ?? data)
                setAudioLink(data.audioLink)
            })
            .catch(err => setDetailError(err?.response?.data?.message ?? 'Failed to load details.'))
            .finally(() => setDetailLoading(false));
    }, [conversationId]);

    const agentName = detail?.agent_name ?? conversation?.agent_name ?? 'Agent';

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 flex w-[820px] max-w-[95vw] flex-col bg-white shadow-2xl">
                <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-gray-900">Conversation with <span className="font-bold">{agentName}</span></h2>
                        <p className="mt-0.5 truncate font-mono text-xs text-gray-400">{conversationId}</p>
                    </div>
                    <button onClick={onClose} className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {detailLoading ? (
                    <div className="flex flex-1 items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading conversation…</span>
                    </div>
                ) : detailError ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2">
                        <XCircle className="h-8 w-8 text-red-300" />
                        <p className="text-sm text-red-500">{detailError}</p>
                    </div>
                ) : (
                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
                                <AudioPlayer conversationId={conversationId} audioLink={audioLink} />
                                
                                <div className="mb-5 border-b border-gray-200">
                                    <div className="flex gap-0.5">
                                        {tabs.map(({ key, label }) => (
                                            <button key={key} onClick={() => setActiveTab(key)} className={`relative px-3 pb-3 pt-1 text-sm font-medium transition-colors ${activeTab === key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                                                {label}
                                                {activeTab === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-gray-900" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {activeTab === 'overview'      && <OverviewTab      detail={detail} />}
                                {activeTab === 'transcription' && <TranscriptionTab transcript={detail?.transcript} />}
                                {activeTab === 'client data'   && <ClientDataTab    detail={detail} />}
                            </div>
                        </div>
                        <MetadataPanel detail={detail} />
                    </div>
                )}
            </div>
        </>
    );
}

// ─── DataPointRow ────────────────────────────────────────────────────────────
function DataPointRow({ dp, isLast, onUpdate, onRemove }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`${!isLast ? 'border-b border-gray-200' : ''}`}>
            <button onClick={() => setExpanded(e => !e)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors">
                <FormInput className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="flex-1 text-sm text-gray-800">
                    {dp.dynamic_variable || <em className="text-gray-400 font-normal">unnamed</em>}
                </span>
                <ChevronRight className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
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
                        <button onClick={() => onRemove(dp.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" /> Remove
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Evaluation Settings Drawer ──────────────────────────────────────────────
function EvaluationSettingsDrawer({
    open,
    onClose,
    criteria,
    dataPoints,
    onAddCriterion,
    onRemoveCriterion,
    onUpdateCriterion,
    onAddDataPoint,
    onRemoveDataPoint,
    onUpdateDataPoint,
}) {
    // Active section tab inside the drawer
    const [section, setSection] = useState('criteria');

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <Portal>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-[480px] max-w-[95vw] flex-col bg-white shadow-2xl">

                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-900">Evaluation Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Section tabs */}
                <div className="flex flex-shrink-0 gap-px border-b border-gray-200 bg-gray-50 px-5 pt-3">
                    {[
                        { key: 'criteria',   label: 'Evaluation Criteria', count: criteria.length },
                        { key: 'collection', label: 'Data Collection',     count: dataPoints.length },
                    ].map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setSection(key)}
                            className={`relative flex items-center gap-1.5 px-3 pb-3 pt-1 text-xs font-medium transition-colors ${
                                section === key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {label}
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                section === key ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {count}
                            </span>
                            {section === key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-gray-900" />}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5">

                    {/* ── Evaluation Criteria section ── */}
                    {section === 'criteria' && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Evaluation criteria</p>
                                    <p className="mt-0.5 text-xs text-gray-500">Define criteria to evaluate whether conversations were successful.</p>
                                </div>
                                <button
                                    onClick={onAddCriterion}
                                    title="Add criterion"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {criteria.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-300 shadow-sm">
                                        <Settings2 className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No criteria yet</p>
                                    <p className="mt-0.5 text-xs text-gray-400">Click "Add criterion" to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {criteria.map((criterion) => (
                                        <div key={criterion.id} className="group rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={criterion.name}
                                                        onChange={e => onUpdateCriterion(criterion.id, 'name', e.target.value)}
                                                        placeholder="Criterion name"
                                                        className="w-full rounded-md border border-transparent bg-transparent px-0 py-0.5 text-sm font-semibold text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:bg-white focus:px-2 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => onRemoveCriterion(criterion.id)}
                                                    className="flex-shrink-0 rounded-md p-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                                                    title="Remove criterion"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="mt-2.5">
                                                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                                    Evaluation prompt
                                                </label>
                                                <textarea
                                                    value={criterion.conversation_goal_prompt}
                                                    onChange={e => onUpdateCriterion(criterion.id, 'conversation_goal_prompt', e.target.value)}
                                                    placeholder="Describe what this criterion should evaluate…"
                                                    rows={3}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none resize-none transition-colors"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Data Collection section ── */}
                    {section === 'collection' && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Data collection</p>
                                    <p className="mt-0.5 text-xs text-gray-500">Define custom data specifications to extract from transcripts.</p>
                                </div>
                                <button
                                    onClick={onAddDataPoint}
                                    title="Add data point"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {dataPoints.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-300 shadow-sm">
                                        <FormInput className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No data points yet</p>
                                    <p className="mt-0.5 text-xs text-gray-400">Click "Add data point" to get started.</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                    {dataPoints.map((dp, idx) => (
                                        <DataPointRow
                                            key={dp.id}
                                            dp={dp}
                                            isLast={idx === dataPoints.length - 1}
                                            onUpdate={onUpdateDataPoint}
                                            onRemove={onRemoveDataPoint}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
                    <p className="text-xs text-gray-400">
                        {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'} · {dataPoints.length} data {dataPoints.length === 1 ? 'point' : 'points'}
                    </p>
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Portal>
    );
}

// ─── Main EvaluationTab ─────────────────────────────────────────────────────
export default function EvaluationTab({ platformSettings, agentId }) {
    const { addArrayItem, removeArrayItem, updateArrayItem, trackChange } = useAgentChanges();

    const [criteria,   setCriteria]   = useState(platformSettings?.evaluation?.criteria || []);

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
    const [settingsOpen,         setSettingsOpen]         = useState(false);
    const [nextCursor,           setNextCursor]           = useState(null);
    const [prevCursors,          setPrevCursors]          = useState([]);

    const fetchConversations = useCallback((cursor = null) => {
        let cancelled = false;
        setConversationsLoading(true);
        setConversationsError(null);
        const params = { agent_id: agentId, ...(cursor ? { next_cursor: cursor } : {}) };
        axios.get('/app/get-conversations', { params })
            .then(({ data }) => {
                if (!cancelled) {
                    setConversations(data?.conversations ?? data?.data ?? data ?? []);
                    setNextCursor(data?.next_cursor ?? null);
                }
            })
            .catch(err => { if (!cancelled) setConversationsError(err?.response?.data?.message ?? 'Failed to load conversations.'); })
            .finally(()  => { if (!cancelled) setConversationsLoading(false); });
        return () => { cancelled = true; };
    }, [agentId]);

    useEffect(() => {
        if (!agentId) return;
        setPrevCursors([]); setNextCursor(null);
        return fetchConversations(null);
    }, [agentId]);

    const handleNextPage = () => {
        if (!nextCursor) return;
        setPrevCursors(prev => [...prev, null]);
        fetchConversations(nextCursor);
    };
    const handlePrevPage = () => {
        const stack = [...prevCursors];
        const prevCursor = stack.pop() ?? null;
        setPrevCursors(stack);
        fetchConversations(prevCursor);
    };

    // Criteria handlers
    const handleAddCriterion = () => {
        const c = { id: `crit_${Date.now()}`, name: 'New Criterion', conversation_goal_prompt: '' };
        const next = [...criteria, c];
        setCriteria(next);
        // Include all existing criteria when adding the new item
        next.forEach(item => addArrayItem('evaluation.criteria', item));
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
            <>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                    <div className="divide-y divide-gray-100">
                        {conversations.map((conv, idx) => {
                            const statusKey = (conv.status ?? '').toLowerCase();
                            const statusCfg = STATUS_CONFIG[statusKey] ?? { className: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200', dot: 'bg-gray-400' };
                            return (
                                <button
                                    key={conv.conversation_id ?? conv.id ?? idx}
                                    onClick={() => setDrawerConversation(conv)}
                                    className="group grid w-full grid-cols-[1fr,90px,60px,100px,20px] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
                                >
                                    <span className="truncate text-sm font-medium text-gray-800">
                                        {conv.call_summary_title || <em className="font-normal text-gray-400">No summary</em>}
                                    </span>
                                    <span className="text-sm tabular-nums text-gray-500">{formatDurationLabel(conv.call_duration_secs)}</span>
                                    <span className="text-sm tabular-nums text-gray-500">{conv.message_count ?? '—'}</span>
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
                <div className="mt-3 flex items-center justify-between">
                    <button onClick={handlePrevPage} disabled={prevCursors.length === 0 || conversationsLoading} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                        <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    <button onClick={handleNextPage} disabled={!nextCursor || conversationsLoading} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </>
        );
    };

    return (
        <>
            <div className="space-y-4">
                {/* Page header row */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:border-gray-300"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Evaluation settings
                        {/* Summary badges */}
                        {(criteria.length > 0 || dataPoints.length > 0) && (
                            <span className="flex items-center gap-1 ml-0.5">
                                {criteria.length > 0 && (
                                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                                        {criteria.length} {criteria.length === 1 ? 'criterion' : 'criteria'}
                                    </span>
                                )}
                                {dataPoints.length > 0 && (
                                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                                        {dataPoints.length} data {dataPoints.length === 1 ? 'point' : 'points'}
                                    </span>
                                )}
                            </span>
                        )}
                    </button>
                </div>

                {/* Conversation list */}
                {renderConversationList()}
            </div>

            {/* Evaluation settings drawer */}
            <EvaluationSettingsDrawer
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                criteria={criteria}
                dataPoints={dataPoints}
                onAddCriterion={handleAddCriterion}
                onRemoveCriterion={handleRemoveCriterion}
                onUpdateCriterion={handleUpdateCriterion}
                onAddDataPoint={handleAddDataPoint}
                onRemoveDataPoint={handleRemoveDataPoint}
                onUpdateDataPoint={handleUpdateDataPoint}
            />

            {/* Conversation detail drawer */}
            {drawerConversation && (
                <Portal>
                    <ConversationDrawer
                        conversation={drawerConversation}
                        onClose={() => setDrawerConversation(null)}
                    />
                </Portal>
            )}
        </>
    );
}