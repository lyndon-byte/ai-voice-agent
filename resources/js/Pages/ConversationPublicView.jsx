import { useState,useEffect,useRef,useCallback } from "react";
import {
   Loader2, Play, Pause,Info, RefreshCw, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import axios from 'axios';


function formatDuration(secs) {
    if (secs == null) return '—';
    const m = Math.floor(secs / 60);
    const s = String(Math.floor(secs % 60)).padStart(2, '0');
    return `${m}:${s}`;
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
        if (audioUrl) { audioRef.current?.play(); setPlaying(true); return; }
        setLoading(true); setError(null);
        try {
            const { data } = await axios.get('/app/get-conversation-audio', {
                params: { conversation_id: conversationId },
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

function OverviewTab({ detail }) {
    const analysis = detail?.analysis ?? {};
    const meta     = detail?.metadata ?? {};
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
export default function ConversationPublicView({ detail, agentName }) {

    const [activeTab,     setActiveTab]     = useState('overview');

    const tabs = [
        { key: 'overview',      label: 'Overview' },
        { key: 'transcription', label: 'Transcription' },
        { key: 'client data',   label: 'Client data' },
    ];

    const conversationId = detail?.conversation_id ?? detail?.id;
  
    return (
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Conversation with <span className="font-bold">{agentName}</span>
            </h1>
            <p className="font-mono text-xs text-gray-400">{conversationId}</p>
          </div>
        </div>
  
        {/* Two-column layout */}
        <div className="flex min-h-0 gap-4">
          <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
                                <AudioPlayer conversationId={conversationId} />
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
                </div>
          </div>
          <MetadataPanel detail={detail} />
        </div>
      </div>
    );
  }