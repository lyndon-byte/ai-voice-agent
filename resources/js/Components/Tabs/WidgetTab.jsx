import { useState, useRef, useCallback,useEffect } from 'react';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';
import { useElevenLabs } from '@/Contexts/ElevenLabsProvider';
import ElevenLabsWidget from '../ElevenLabsWidget';

// ─── Primitives ──────────────────────────────────────────────────────────────

function SectionRow({ title, description, children }) {
    return (
        <div className="flex flex-col gap-6 py-8 sm:flex-row sm:gap-16 border-b border-gray-100 last:border-b-0">
            <div className="sm:w-56 shrink-0">
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                {description && (
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
                )}
            </div>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}

function SegmentedControl({ options, value, onChange }) {
    return (
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                        value === opt.value
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// items-center for label-only, items-start when a description is present
function Toggle({ checked, onChange, label, description }) {
    return (
        <div className={`flex gap-3 ${description ? 'items-start' : 'items-center'}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative ${description ? 'mt-0.5' : ''} inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 ${
                    checked ? 'bg-gray-900' : 'bg-gray-200'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </button>
            {(label || description) && (
                <div>
                    {label && <p className="text-sm font-medium text-gray-900 leading-5">{label}</p>}
                    {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
                </div>
            )}
        </div>
    );
}

function ColorInput({ label, value, onChange }) {
    const inputRef = useRef(null);
    return (
        <div>
            {label && <label className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>}
            <div
                className="flex items-center gap-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 cursor-pointer hover:border-gray-300 transition-colors"
                onClick={() => inputRef.current?.click()}
            >
                <span
                    className="h-4 w-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: value || '#000000' }}
                />
                <span className="text-sm text-gray-700 font-mono">{value || '#000000'}</span>
                <input
                    ref={inputRef}
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="sr-only"
                />
            </div>
        </div>
    );
}

function Select({ value, onChange, options, placeholder }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 pr-8"
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    );
}

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {message}
        </p>
    );
}

function EmbedCodeBlock({ agentId }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(`<elevenlabs-convai agent-id="${agentId || 'YOUR_AGENT_ID'}"></elevenlabs-convai>`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
                <span className="text-xs font-medium text-gray-500">HTML</span>
                <button
                    type="button"
                    onClick={copy}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                    {copied ? (
                        <>
                            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Copied
                        </>
                    ) : (
                        <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <div className="px-4 py-3 overflow-x-auto">
                <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">
                    <span className="text-blue-600">&lt;elevenlabs-convai</span>{' '}
                    <span className="text-orange-500">agent-id</span>
                    <span className="text-gray-600">=</span>
                    <span className="text-green-600">"{agentId || 'YOUR_AGENT_ID'}"</span>
                    <span className="text-blue-600">&gt;&lt;/elevenlabs-convai&gt;</span>
                </pre>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WidgetTab({ agent, platformSettings }) {
    const { trackChange } = useAgentChanges();
    const { config,setConfig,agentId, setAgentId } = useElevenLabs();
    const settings = platformSettings?.widget || {};

    const [avatarType, setAvatarType]       = useState(settings.avatar?.type   || 'orb');
    const [orbColor1, setOrbColor1]         = useState(settings.avatar?.color_1 || '#62a0cc');
    const [orbColor2, setOrbColor2]         = useState(settings.avatar?.color_2 || '#6fb8b8');
    const [avatarUrl, setAvatarUrl]         = useState(settings.avatar?.url    || '');
    const [variant, setVariant]             = useState(settings.variant        || 'tiny');
    const [placement, setPlacement]         = useState(settings.placement      || 'bottom-right');
    const [collapsible, setCollapsible]     = useState(settings.dismissible    ?? false);
    const [feedbackEnabled, setFeedbackEnabled] = useState(!!settings.end_feedback);
    const [termsEnabled, setTermsEnabled]   = useState(!!settings.terms_text);
    const [termsText, setTermsText]         = useState(settings.terms_text     || '');

    // Only show errors after the user has interacted with the field
    const [touchedAvatarUrl, setTouchedAvatarUrl] = useState(false);
    const [touchedTermsText, setTouchedTermsText] = useState(false);

    const fileInputRef = useRef(null);

    // ── Validation ────────────────────────────────────────────────────────────
    const avatarUrlError = (avatarType === 'link' || avatarType === 'image') && !avatarUrl.trim()
        ? avatarType === 'link' ? 'Image URL is required.' : 'Please upload an avatar image.'
        : null;

    const termsTextError = termsEnabled && !termsText.trim()
        ? 'Terms content is required when terms & conditions are enabled.'
        : null;

    // ── Data builder (for trackChange / save) ────────────────────────────────
    const buildData = useCallback((overrides = {}) => {
        const m = {
            avatarType, orbColor1, orbColor2, avatarUrl,
            variant, placement, collapsible,
            feedbackEnabled, termsEnabled, termsText,
            ...overrides,
        };
        return {
            avatar: m.avatarType === 'orb'
                ? { type: 'orb', color_1: m.orbColor1, color_2: m.orbColor2 }
                : { type: m.avatarType, url: m.avatarUrl },
            variant:      m.variant,
            placement:    m.placement,
            dismissible:  m.collapsible,
            end_feedback: m.feedbackEnabled ? { type: 'rating' } : null,
            terms_text:   m.termsEnabled ? m.termsText : null,
        };
    }, [avatarType, orbColor1, orbColor2, avatarUrl, variant, placement, collapsible, feedbackEnabled, termsEnabled, termsText]);

    // ── Live preview (setConfig) — merges only affected keys ─────────────────
    // Avatar fields are nested so we spread the existing avatar slice first.
    const liveUpdate = useCallback((patch) => {
        setConfig((prev) => {
            const next = { ...prev };

            if ('variant'      in patch) next.variant   = patch.variant;
            if ('placement'    in patch) next.placement = patch.placement;
            if ('collapsible'  in patch) next.expandable = patch.collapsible ? 'always' : 'never';
            if ('feedbackEnabled' in patch) next.end_feedback = patch.feedbackEnabled ? { type: 'rating' } : null;
            if ('termsEnabled' in patch || 'termsText' in patch) {
                const enabled = 'termsEnabled' in patch ? patch.termsEnabled : termsEnabled;
                const text    = 'termsText'    in patch ? patch.termsText    : termsText;
                next.terms_text = enabled ? text : null;
            }

            // Avatar: merge into existing avatar object so sibling keys are preserved
            const avatarPatch = {};
            if ('avatarType' in patch) avatarPatch.type    = patch.avatarType;
            if ('orbColor1'  in patch) avatarPatch.color_1 = patch.orbColor1;
            if ('orbColor2'  in patch) avatarPatch.color_2 = patch.orbColor2;
            if ('avatarUrl'  in patch) avatarPatch.url     = patch.avatarUrl;
            if (Object.keys(avatarPatch).length) {
                next.avatar = { ...prev.avatar, ...avatarPatch };
            }

            return next;
        });
    }, [setConfig, termsEnabled, termsText]);

    // ── Guard: block trackChange when state is invalid ────────────────────────
    const track = useCallback((overrides = {}) => {
        const next = { avatarType, avatarUrl, termsEnabled, termsText, ...overrides };
        const hasAvatarError = (next.avatarType === 'link' || next.avatarType === 'image') && !next.avatarUrl?.trim();
        const hasTermsError  = next.termsEnabled && !next.termsText?.trim();
        if (hasAvatarError || hasTermsError) return;
        trackChange('widget', buildData(overrides));
    }, [trackChange, buildData, avatarType, avatarUrl, termsEnabled, termsText]);

    // ── Handlers — call liveUpdate (always) + track (guarded) ────────────────
    const handleAvatarType   = (v) => { setAvatarType(v);      setTouchedAvatarUrl(false); liveUpdate({ avatarType: v }); track({ avatarType: v }); };
    const handleOrbColor1    = (v) => { setOrbColor1(v);       liveUpdate({ orbColor1: v });    track({ orbColor1: v }); };
    const handleOrbColor2    = (v) => { setOrbColor2(v);       liveUpdate({ orbColor2: v });    track({ orbColor2: v }); };
    const handleAvatarUrl    = (v) => { setAvatarUrl(v);       setTouchedAvatarUrl(true); liveUpdate({ avatarUrl: v }); track({ avatarUrl: v }); };
    const handleVariant      = (v) => { setVariant(v);         liveUpdate({ variant: v });      track({ variant: v }); };
    const handlePlacement    = (v) => { setPlacement(v);       liveUpdate({ placement: v });    track({ placement: v }); };
    const handleCollapsible  = (v) => { setCollapsible(v);     liveUpdate({ collapsible: v });  track({ collapsible: v }); };
    const handleFeedback     = (v) => { setFeedbackEnabled(v); liveUpdate({ feedbackEnabled: v }); track({ feedbackEnabled: v }); };
    const handleTermsEnabled = (v) => { setTermsEnabled(v);    liveUpdate({ termsEnabled: v }); track({ termsEnabled: v }); };
    const handleTermsText    = (v) => { setTermsText(v);       setTouchedTermsText(true); liveUpdate({ termsText: v }); track({ termsText: v }); };

    const handleAvatarFile = (e) => {
        const file = e.target.files?.[0];
        if (file) handleAvatarUrl(URL.createObjectURL(file));
    };

    useEffect(() => {

        setConfig(settings)
        setAgentId(agent.agent_id)
        
    },[])

    return (
        <div className="max-w-4xl">

            {/* ── Setup ── */}
            <SectionRow title="Setup" description="Attach the widget on your website.">
                <div className="space-y-4">
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-900">Embed code</p>
                        <p className="mb-3 text-sm text-gray-500">
                            Add the following snippet to the pages where you want the conversation widget to be.
                        </p>
                        <EmbedCodeBlock agentId={agent?.agent_id} />
                    </div>
                    <Toggle
                        checked={feedbackEnabled}
                        onChange={handleFeedback}
                        label="Feedback collection"
                        description="Callers can rate their satisfaction from 1 to 5 and optionally leave a comment after the conversation."
                    />
                </div>
            </SectionRow>

            {/* ── Avatar ── */}
            <SectionRow title="Avatar" description="Configure the voice orb or provide your own avatar.">
                <div className="space-y-4">
                    <div>
                        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
                        <SegmentedControl
                            options={[
                                { label: 'Orb',   value: 'orb' },
                                { label: 'Link',  value: 'link' },
                                { label: 'Image', value: 'image' },
                            ]}
                            value={avatarType}
                            onChange={handleAvatarType}
                        />
                    </div>

                    {avatarType === 'orb' && (
                        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="h-14 w-14 shrink-0 rounded-full" style={{
                                background: `conic-gradient(from 0deg, ${orbColor1}, ${orbColor2}, ${orbColor1})`,
                                boxShadow: `0 0 20px ${orbColor1}40`,
                            }} />
                            <div className="grid grid-cols-2 gap-3 flex-1">
                                <ColorInput label="First color"  value={orbColor1} onChange={handleOrbColor1} />
                                <ColorInput label="Second color" value={orbColor2} onChange={handleOrbColor2} />
                            </div>
                        </div>
                    )}

                    {avatarType === 'image' && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                            <div className="flex items-center gap-4">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className={`h-14 w-14 rounded-full flex items-center justify-center border ${touchedAvatarUrl && avatarUrlError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-200'}`}>
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => { setTouchedAvatarUrl(true); fileInputRef.current?.click(); }}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                        Upload image
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleAvatarFile} />
                                    <p className="text-xs text-gray-400">PNG, JPG or GIF up to 2MB</p>
                                </div>
                            </div>
                            {touchedAvatarUrl && <FieldError message={avatarUrlError} />}
                        </div>
                    )}

                    {avatarType === 'link' && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">Image URL</label>
                            <input
                                type="url"
                                value={avatarUrl}
                                onChange={(e) => handleAvatarUrl(e.target.value)}
                                onBlur={() => setTouchedAvatarUrl(true)}
                                placeholder="https://example.com/avatar.png"
                                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                                    touchedAvatarUrl && avatarUrlError
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-gray-400 focus:ring-gray-300'
                                }`}
                            />
                            {touchedAvatarUrl && <FieldError message={avatarUrlError} />}
                        </div>
                    )}
                </div>
            </SectionRow>

            {/* ── Styling ── */}
            <SectionRow title="Styling" description="Customize the colors and shape of the widget to best fit your website.">
                <div className="space-y-5">
                    <div>
                        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Variant</p>
                        <SegmentedControl
                            options={[
                                { label: 'Tiny',    value: 'tiny' },
                                { label: 'Compact', value: 'compact' },
                                { label: 'Full',    value: 'full' },
                            ]}
                            value={variant}
                            onChange={handleVariant}
                        />
                    </div>

                    <Toggle checked={collapsible} onChange={handleCollapsible} label="Collapsible" />

                    <div>
                        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Placement</p>
                        <p className="mb-2 text-xs text-gray-400">
                            The preview widget on this page is always placed in the bottom right corner of the screen. The placement you select here will only be used when the widget is embedded on your website.
                        </p>
                        <Select
                            value={placement}
                            onChange={handlePlacement}
                            options={[
                                { label: 'Top-left',     value: 'top-left' },
                                { label: 'Top',          value: 'top' },
                                { label: 'Top-right',    value: 'top-right' },
                                { label: 'Bottom-left',  value: 'bottom-left' },
                                { label: 'Bottom',       value: 'bottom' },
                                { label: 'Bottom-right', value: 'bottom-right' },
                            ]}
                        />
                    </div>
                </div>
            </SectionRow>

            {/* ── Terms & Conditions ── */}
            <SectionRow title="Terms & Conditions" description="Require the caller to accept your terms and conditions before initiating a call.">
                <div className="space-y-4">
                    <Toggle checked={termsEnabled} onChange={handleTermsEnabled} label="Enable terms & conditions" />

                    {termsEnabled && (
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Terms content</p>
                                <p className="text-sm text-gray-500">
                                    You can use{' '}
                                    <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-gray-900 transition-colors">
                                        Markdown
                                    </a>{' '}
                                    to format the text.
                                </p>
                            </div>
                            <textarea
                                value={termsText}
                                onChange={(e) => handleTermsText(e.target.value)}
                                onBlur={() => setTouchedTermsText(true)}
                                rows={6}
                                placeholder={`#### Terms and conditions\nBy clicking "Accept," you agree to our [terms](www.example.com/terms).`}
                                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 resize-y font-mono leading-relaxed transition-colors ${
                                    touchedTermsText && termsTextError
                                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-gray-400 focus:ring-gray-300'
                                }`}
                            />
                            {touchedTermsText && <FieldError message={termsTextError} />}
                        </div>
                    )}
                </div>
            </SectionRow>
            {
                config && agentId && (

                    <ElevenLabsWidget />
                )

            }
        </div>
    );
}