import { useState, useEffect, useRef, useCallback } from "react";
import {
    Loader2, Play, Pause, Info, CheckCircle2, XCircle,
    AlertCircle, Wrench
} from 'lucide-react';

import axios from 'axios';
import { Head } from "@inertiajs/react";

function GuestLayout({ children, title, conversationId }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <GuestNavbar title={title} conversationId={conversationId} />
            <main>{children}</main>
        </div>
    );
}

function GuestNavbar({ title, conversationId }) {
    return (
        <nav className="sticky top-0 z-10 flex h-[52px] items-center gap-3 border-b border-gray-100 bg-white px-4 md:px-6">
            <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-bold text-gray-900 whitespace-nowrap text-sm md:text-base">
                    Conversation with <strong className="font-medium">{title}</strong>
                </span>
                <span className="font-mono text-xs text-gray-400 hidden sm:inline truncate">
                    ({conversationId})
                </span>
            </div>
        </nav>
    );
}

function formatDuration(secs) {
    if (secs == null) return '—';
    const m = Math.floor(secs / 60);
    const s = String(Math.floor(secs % 60)).padStart(2, '0');
    return `${m}:${s}`;
}

function Waveform({ isPlaying = false }) {
    const BARS = 60;
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
    }, [isPlaying]);

    return (
        <div className="flex h-12 w-full items-center gap-px">
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

// ─── Audio Player ────────────────────────────────────────────────────────────
function AudioPlayer({ conversationId, audioLink }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [current, setCurrent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const fetchAndPlay = useCallback(async () => {
        if (audioUrl) { audioRef.current?.play(); setPlaying(true); return; }
        setLoading(true); setError(null);
        try {
            const { data } = await axios.get(audioLink, { responseType: 'blob' });
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
        else { audioRef.current.play(); setPlaying(true); }
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
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button onClick={cycleSpeed} className="w-11 rounded-md bg-gray-100 py-1 text-xs font-bold text-gray-700 hover:bg-gray-200">{speed}x</button>
                <span className="ml-auto text-xs tabular-nums text-gray-500">{formatDuration(current)} / {formatDuration(duration)}</span>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
    );
}

// ─── Call success badge ──────────────────────────────────────────────────────
function CallSuccessBadge({ value }) {
    const map = {
        success: { label: 'Successful', Icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
        failure: { label: 'Failed', Icon: XCircle, cls: 'bg-red-100 text-red-600' },
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
            {item.rationale && (
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
        failure: { cls: 'bg-red-100 text-red-600', Icon: XCircle },
        unknown: { cls: 'bg-gray-100 text-gray-500', Icon: AlertCircle },
    };
    const cfg = resultMap[item.result] ?? resultMap.unknown;
    const { Icon } = cfg;
    return (
        <div className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between gap-4 px-3 py-2.5">
                <span className="text-sm font-medium text-gray-600 shrink-0">{item.criteria_id ?? criteriaKey}</span>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                        <Icon className="h-3 w-3" />{item.result ?? 'unknown'}
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

    const evaluationResults = analysis.evaluation_criteria_results;
    const hasEvaluationResults =
        evaluationResults != null &&
        typeof evaluationResults === 'object' &&
        Object.keys(evaluationResults).length > 0;

    return (
        <div>

            {analysis.transcript_summary && (
                <div className="mb-5">
                    <p className="mb-1.5 text-sm font-semibold text-gray-900">Summary</p>
                    <p className="text-sm leading-relaxed text-gray-600">{analysis.transcript_summary}</p>
                </div>
            )}
          
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
                            <EvaluationCriteriaResultItem key={key} criteriaKey={key} item={item} index={i} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Chat-style Transcription Tab ────────────────────────────────────────────
function ToolCallPill({ tool }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
            <Wrench className="h-3 w-3" />
            {tool.tool_name}
        </span>
    );
}

function TranscriptionTab({ transcript }) {
    if (!transcript?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">No transcript available.</p>
            </div>
        );
    }

    return (
        /* Chat container with subtle background */
        <div className="rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                <div className="flex -space-x-1.5">
                    <div className="h-7 w-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white z-10">A</div>
                    <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">U</div>
                </div>
                <span className="text-xs font-medium text-gray-500">
                    {transcript.length} message{transcript.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-1 px-3 py-4 sm:px-4">
                {transcript.map((turn, idx) => {
                    const isAgent = turn.role === 'agent';
                    const toolCalls = turn.tool_calls?.filter(t => t?.tool_name) ?? [];

                    // Check if adjacent messages have the same role (for grouping)
                    const prevSame = idx > 0 && transcript[idx - 1].role === turn.role;
                    const nextSame = idx < transcript.length - 1 && transcript[idx + 1].role === turn.role;

                    return (
                        <div key={idx} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'} ${prevSame ? 'mt-0.5' : 'mt-3'}`}>
                            {/* Avatar + name label — only show on first in a group */}
                            {!prevSame && (
                                <div className={`flex items-center gap-1.5 mb-1 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isAgent ? 'bg-gray-900 text-white' : 'bg-blue-500 text-white'}`}>
                                        {isAgent ? 'A' : 'U'}
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-400">
                                        {isAgent ? 'Agent' : 'User'}
                                        {turn.time_in_call_secs != null && (
                                            <span className="ml-1 text-gray-300">· {formatDuration(turn.time_in_call_secs)}</span>
                                        )}
                                    </span>
                                </div>
                            )}

                            {/* Bubble */}
                            {turn.message && (
                                <div
                                    className={`
                                        max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm rounded-lg
                                        ${isAgent
                                            ? `bg-white text-gray-800 border border-gray-200`
                                            : `bg-blue-600 text-white`
                                        }
                                    `}
                                >
                                    {turn.message}
                                </div>
                            )}

                            {/* Tool calls — shown as pills below the bubble */}
                            {toolCalls.length > 0 && (
                                <div className={`flex flex-wrap gap-1 mt-1.5 ${isAgent ? 'justify-start' : 'justify-end'}`}>
                                    {toolCalls.map((tool, tIdx) => (
                                        <ToolCallPill key={tIdx} tool={tool} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ClientDataTab({ detail }) {
    const clientData = detail?.conversation_initiation_client_data ?? {};
    const dynVars = clientData?.dynamic_variables ?? {};

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


// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ConversationPublicView({ detail, agentName, audioLink }) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'transcription', label: 'Transcription' },
        { key: 'client data', label: 'Client data' },
    ];

    const conversationId = detail?.conversation_id ?? detail?.id;

    return (
        <GuestLayout title={agentName} conversationId={conversationId}>
            <Head title="View Conversation" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex min-h-0">
                        {/* Main content */}
                        <div className="flex flex-1 flex-col min-w-0">
                            <div className="px-4 sm:px-6 pt-5 pb-6">
                                {/* Audio player */}
                                <AudioPlayer conversationId={conversationId} audioLink={audioLink} />

                                {/* Tabs */}
                                <div className="mb-5 border-b border-gray-200">
                                    <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
                                        {tabs.map(({ key, label }) => (
                                            <button
                                                key={key}
                                                onClick={() => setActiveTab(key)}
                                                className={`relative whitespace-nowrap px-3 pb-3 pt-1 text-sm font-medium transition-colors flex-shrink-0 ${activeTab === key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
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
                                {activeTab === 'overview' && <OverviewTab detail={detail} />}
                                {activeTab === 'transcription' && <TranscriptionTab transcript={detail?.transcript} />}
                                {activeTab === 'client data' && <ClientDataTab detail={detail} />}

                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}