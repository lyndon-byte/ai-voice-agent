import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Plus, Database, Trash2, Globe,
    File, FolderOpen, X, ChevronLeft, Search,
    Upload, Check, Type, Loader2, AlertCircle, RefreshCw,
    FileText, ExternalLink,
} from 'lucide-react';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';

const MOCK_KB = [
    { id: 'doc_04', name: 'https://example.com', type: 'folder', children_count: 42, usage_mode: 'auto' },
    { id: 'doc_01', name: 'Product FAQ', type: 'text', usage_mode: 'auto' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateJobId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

function KbTypeIcon({ type, className = 'h-4 w-4' }) {
    if (type === 'folder') return <FolderOpen className={className} />;
    if (type === 'url')    return <Globe className={className} />;
    if (type === 'file')   return <File className={className} />;
    if (type === 'text')   return <Type className={className} />;
    return <Database className={className} />;
}

function iconColors(type) {
    if (type === 'folder') return 'bg-amber-50 text-amber-600';
    if (type === 'url')    return 'bg-blue-50 text-blue-600';
    if (type === 'file')   return 'bg-violet-50 text-violet-600';
    if (type === 'text')   return 'bg-emerald-50 text-emerald-600';
    return 'bg-gray-100 text-gray-500';
}

function isValidUrl(str) {
    try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {message}
        </p>
    );
}

function inputCls(hasError) {
    return [
        'w-full rounded-lg border bg-white py-2.5 text-sm text-gray-900',
        'placeholder:text-gray-400 focus:outline-none focus:ring-2 transition',
        hasError
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-300 focus:border-gray-400 focus:ring-gray-100',
    ].join(' ');
}

// ─── Document Drawer ──────────────────────────────────────────────────────────
function DocumentDrawer({ item, onClose }) {
    // view: 'folder-list' | 'document'
    const [view, setView]               = useState(item.type === 'folder' ? 'folder-list' : 'document');
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [folderDocs, setFolderDocs]   = useState([]);
    const [docData, setDocData]         = useState(null);
    const [activeChild, setActiveChild] = useState(null); // child doc item for folder drill-in

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);
    // Fetch on mount based on type
    useEffect(() => {
        if (item.type === 'folder') {
            fetchFolderDocs(item.id);
        } else {
            fetchDocument(item.id);
        }
    }, [item]);

    async function fetchFolderDocs(documentId) {
        setLoading(true); setError('');
        try {
            const { data } = await axios.get('/app/knowledge-base/get-folder-documents', {
                params: { documentId },
            });
            setFolderDocs(Array.isArray(data) ? data : data.documents ?? []);
        } catch {
            setError('Failed to load folder documents.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchDocument(documentId) {
        setLoading(true); setError('');
        try {
            const { data } = await axios.get('/app/knowledge-base/get-document', {
                params: { documentId },
            });
            setDocData(data);
        } catch {
            setError('Failed to load document.');
        } finally {
            setLoading(false);
        }
    }

    async function openChildDoc(child) {
        setActiveChild(child);
        setView('document');
        setLoading(true); setError(''); setDocData(null);
        try {
            const { data } = await axios.get('/app/knowledge-base/get-document', {
                params: { documentId: child.id },
            });
            setDocData(data);
        } catch {
            setError('Failed to load document.');
        } finally {
            setLoading(false);
        }
    }

    function goBackToFolder() {
        setView('folder-list');
        setActiveChild(null);
        setDocData(null);
        setError('');
    }

    const isFolder      = item.type === 'folder';
    const showingChild  = isFolder && view === 'document';

    // Header title & subtitle
    const headerTitle    = showingChild ? (activeChild?.name ?? 'Document') : item.name;
    const headerSubtitle = showingChild
        ? item.name
        : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}${item.usage_mode ? ` · ${item.usage_mode}` : ''}`;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">

                {/* Header */}
                <div className="flex flex-shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        {showingChild && (
                            <button
                                onClick={goBackToFolder}
                                className="mt-0.5 flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        )}
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconColors(showingChild ? (activeChild?.type ?? 'file') : item.type)}`}>
                            <KbTypeIcon type={showingChild ? (activeChild?.type ?? 'file') : item.type} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-gray-900">{headerTitle}</h3>
                            <p className="mt-0.5 truncate text-xs text-gray-400">{headerSubtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-3 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">

                    {/* Loading */}
                    {loading && (
                        <div className="flex h-48 items-center justify-center gap-2 text-gray-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Loading…</span>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="m-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Folder document list */}
                    {!loading && !error && view === 'folder-list' && (
                        <div className="px-5 py-4">
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                {folderDocs.length} document{folderDocs.length !== 1 ? 's' : ''}
                            </p>
                            {folderDocs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <FileText className="mb-2 h-8 w-8 text-gray-300" />
                                    <p className="text-sm text-gray-500">No documents in this folder.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {folderDocs.map((doc, i) => (
                                        <button
                                            key={doc.id ?? i}
                                            onClick={() => openChildDoc(doc)}
                                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
                                        >
                                            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconColors(doc.type ?? 'file')}`}>
                                                <KbTypeIcon type={doc.type ?? 'file'} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">{doc.name ?? doc.title ?? 'Untitled'}</p>
                                                {doc.url && (
                                                    <p className="truncate text-xs text-gray-400">{doc.url}</p>
                                                )}
                                            </div>
                                            <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Document content */}
                    {!loading && !error && view === 'document' && docData && (
                        <div className="divide-y divide-gray-100">

                            {/* Meta fields */}
                            <div className="space-y-4 px-5 py-4">
                                {docData.name && (
                                    <InfoRow label="Name" value={docData.name} />
                                )}
                                {docData.url && (
                                    <InfoRow label="URL" value={
                                        <a href={docData.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 break-all text-blue-600 hover:underline">
                                            {docData.url}
                                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        </a>
                                    } />
                                )}
                                {docData.type && (
                                    <InfoRow label="Type" value={<span className="capitalize">{docData.type}</span>} />
                                )}
                                {docData.usage_mode && (
                                    <InfoRow label="Usage mode" value={docData.usage_mode} />
                                )}
                                {docData.created_at && (
                                    <InfoRow label="Created" value={new Date(docData.created_at).toLocaleString()} />
                                )}
                                {docData.updated_at && (
                                    <InfoRow label="Updated" value={new Date(docData.updated_at).toLocaleString()} />
                                )}
                                {docData.size && (
                                    <InfoRow label="Size" value={docData.size} />
                                )}
                                {docData.pages != null && (
                                    <InfoRow label="Pages" value={docData.pages} />
                                )}
                            </div>

                            {/* Text content block */}
                            {docData.content && (
                                <div className="px-5 py-4">
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Content</p>
                                    <pre className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700">
                                        {docData.content}
                                    </pre>
                                </div>
                            )}

                            {/* Raw JSON fallback — any extra keys */}
                            {docData && !docData.content && !docData.name && !docData.url && (
                                <div className="px-5 py-4">
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Data</p>
                                    <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">
                                        {JSON.stringify(docData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
            <span className="text-sm text-gray-800">{value}</span>
        </div>
    );
}

// ─── Add Document Modal ───────────────────────────────────────────────────────
function AddDocumentModal({ agentId, onClose, onJobStarted }) {
    const [view, setView]         = useState('menu');
    const [loading, setLoading]   = useState(false);
    const [apiError, setApiError] = useState('');

    const [urlMode, setUrlMode]     = useState('single');
    const [urlValue, setUrlValue]   = useState('');
    const [maxPages, setMaxPages]   = useState(50);
    const [urlErrors, setUrlErrors] = useState({});

    const [files, setFiles]         = useState([]);
    const fileInputRef               = useRef(null);
    const [fileError, setFileError] = useState('');

    const [textName, setTextName]       = useState('');
    const [textContent, setTextContent] = useState('');
    const [textErrors, setTextErrors]   = useState({});

    function reset() {
        setView('menu'); setLoading(false); setApiError('');
        setUrlValue(''); setUrlMode('single'); setMaxPages(50); setUrlErrors({});
        setFiles([]); setFileError('');
        setTextName(''); setTextContent(''); setTextErrors({});
    }

    function handleClose() { reset(); onClose(); }
    function handleBack()  { reset(); }

    function validateUrl() {
        const errs = {};
        if (!urlValue.trim())              errs.url = 'URL is required.';
        else if (!isValidUrl(urlValue.trim())) errs.url = 'Enter a valid URL starting with http:// or https://';
        if (urlMode === 'website') {
            if (!maxPages || maxPages < 1) errs.maxPages = 'Must be at least 1.';
            else if (maxPages > 500)       errs.maxPages = 'Cannot exceed 500 pages.';
        }
        setUrlErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function validateFiles() {
        if (files.length === 0) { setFileError('Please select at least one file.'); return false; }
        setFileError(''); return true;
    }

    function validateText() {
        const errs = {};
        if (!textName.trim())    errs.name    = 'Document name is required.';
        if (!textContent.trim()) errs.content = 'Content cannot be empty.';
        setTextErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmitUrl() {
        if (!validateUrl()) return;
        setApiError(''); setLoading(true);
        const job_id = generateJobId();
        try {
            await axios.post('/app/knowledge-base', {
                type: urlMode === 'single' ? 'url' : 'website',
                url: urlValue.trim(), agent_id: agentId, job_id,
                ...(urlMode === 'website' && { max_pages: maxPages }),
            });
            onJobStarted(job_id); handleClose();
        } catch (e) {
            setApiError(e?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    }

    async function handleSubmitFiles() {
        if (!validateFiles()) return;
        setApiError(''); setLoading(true);
        const job_id = generateJobId();
        try {
            const form = new FormData();
            form.append('type', 'file');
            form.append('agent_id', agentId);
            form.append('job_id', job_id);
            files.forEach(f => form.append('files[]', f));
            await axios.post('/app/knowledge-base', form);
            onJobStarted(job_id); handleClose();
        } catch (e) {
            setApiError(e?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    }

    async function handleSubmitText() {
        if (!validateText()) return;
        setApiError(''); setLoading(true);
        const job_id = generateJobId();
        try {
            await axios.post('/app/knowledge-base', {
                type: 'text', name: textName.trim(),
                content: textContent.trim(), agent_id: agentId, job_id,
            });
            onJobStarted(job_id); handleClose();
        } catch (e) {
            setApiError(e?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally { setLoading(false); }
    }

    const submitHandlers = { url: handleSubmitUrl, file: handleSubmitFiles, text: handleSubmitText };
    const submitLabels   = {
        url:  { idle: urlMode === 'website' ? 'Start crawl' : 'Add URL', busy: urlMode === 'website' ? 'Crawling…' : 'Adding…' },
        file: { idle: files.length > 0 ? `Upload ${files.length} file${files.length > 1 ? 's' : ''}` : 'Upload', busy: 'Uploading…' },
        text: { idle: 'Save document', busy: 'Saving…' },
    };
    const titles    = { url: 'Add URL', file: 'Upload files', text: 'Create text document' };
    const menuItems = [
        { key: 'url',  icon: <Globe className="h-4 w-4" />, label: 'URL',  desc: 'Single page or full website crawl', color: 'bg-blue-50 text-blue-600' },
        { key: 'file', icon: <File className="h-4 w-4" />,  label: 'File', desc: 'PDF, DOCX, TXT, CSV and more',      color: 'bg-violet-50 text-violet-600' },
        { key: 'text', icon: <Type className="h-4 w-4" />,  label: 'Text', desc: 'Paste or write content directly',   color: 'bg-emerald-50 text-emerald-600' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        {view !== 'menu' && (
                            <button onClick={handleBack} disabled={loading}
                                className="mr-1 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-40">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        )}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                {view === 'menu' ? 'Add document' : titles[view]}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-400">
                                {view === 'menu' ? 'Choose the type of content to add' : 'Fill in the details below'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} disabled={loading}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    {apiError && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                            <span className="text-xs text-red-600">{apiError}</span>
                        </div>
                    )}

                    {/* MENU */}
                    {view === 'menu' && (
                        <div className="space-y-1">
                            {menuItems.map(({ key, icon, label, desc, color }) => (
                                <button key={key} onClick={() => setView(key)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition hover:bg-gray-50">
                                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>{icon}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                                        <p className="text-xs text-gray-400">{desc}</p>
                                    </div>
                                    <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* URL */}
                    {view === 'url' && (
                        <div className="space-y-4">
                            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                {[{ val: 'single', label: 'Single page' }, { val: 'website', label: 'Whole website' }].map(({ val, label }) => (
                                    <button key={val} onClick={() => { setUrlMode(val); setUrlErrors({}); }} disabled={loading}
                                        className={`flex-1 rounded-md py-1.5 text-xs font-medium transition
                                            ${urlMode === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    {urlMode === 'single' ? 'Page URL' : 'Root URL to crawl'}
                                    <span className="ml-0.5 text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Globe className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${urlErrors.url ? 'text-red-400' : 'text-gray-400'}`} />
                                    <input autoFocus type="url" placeholder="https://example.com"
                                        value={urlValue} disabled={loading}
                                        onChange={e => { setUrlValue(e.target.value); if (urlErrors.url) setUrlErrors(p => ({ ...p, url: '' })); }}
                                        className={`${inputCls(!!urlErrors.url)} pl-9 pr-9`}
                                    />
                                    {urlValue && !loading && (
                                        <button onClick={() => { setUrlValue(''); setUrlErrors(p => ({ ...p, url: '' })); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <X className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" />
                                        </button>
                                    )}
                                </div>
                                <FieldError message={urlErrors.url} />
                            </div>

                            {urlMode === 'website' && (
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                        Max pages <span className="font-normal text-gray-400">(1–500)</span>
                                        <span className="ml-0.5 text-red-400">*</span>
                                    </label>
                                    <input type="number" min={1} max={500} value={maxPages} disabled={loading}
                                        onChange={e => { setMaxPages(+e.target.value); if (urlErrors.maxPages) setUrlErrors(p => ({ ...p, maxPages: '' })); }}
                                        className={`${inputCls(!!urlErrors.maxPages)} px-3`}
                                    />
                                    <FieldError message={urlErrors.maxPages} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* FILE */}
                    {view === 'file' && (
                        <div className="space-y-3">
                            <div
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => { e.preventDefault(); if (loading) return; setFiles(p => [...p, ...Array.from(e.dataTransfer.files)]); setFileError(''); }}
                                onClick={() => !loading && fileInputRef.current?.click()}
                                className={[
                                    'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-10 transition',
                                    fileError ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
                                    loading ? 'cursor-not-allowed opacity-50' : '',
                                ].join(' ')}
                            >
                                <Upload className={`h-5 w-5 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                                <div className="text-center">
                                    <p className="text-xs font-medium text-gray-700">Drop files or <span className="underline">browse</span></p>
                                    <p className="mt-0.5 text-[11px] text-gray-400">PDF, DOCX, TXT, MD, CSV · max 50 MB</p>
                                </div>
                                <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.doc,.docx,.md,.html,.csv"
                                    className="hidden"
                                    onChange={e => { setFiles(p => [...p, ...Array.from(e.target.files)]); setFileError(''); }}
                                />
                            </div>
                            <FieldError message={fileError} />
                            {files.length > 0 && (
                                <div className="max-h-36 space-y-1.5 overflow-y-auto">
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                            <File className="h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                                            <span className="flex-1 truncate text-xs text-gray-700">{f.name}</span>
                                            {!loading && (
                                                <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}>
                                                    <X className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TEXT */}
                    {view === 'text' && (
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Document name<span className="ml-0.5 text-red-400">*</span>
                                </label>
                                <input autoFocus type="text" placeholder="e.g. Company FAQ"
                                    value={textName} disabled={loading}
                                    onChange={e => { setTextName(e.target.value); if (textErrors.name) setTextErrors(p => ({ ...p, name: '' })); }}
                                    className={`${inputCls(!!textErrors.name)} px-3`}
                                />
                                <FieldError message={textErrors.name} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                    Content<span className="ml-0.5 text-red-400">*</span>
                                </label>
                                <textarea placeholder="Paste or type your content here..."
                                    value={textContent} disabled={loading} rows={5}
                                    onChange={e => { setTextContent(e.target.value); if (textErrors.content) setTextErrors(p => ({ ...p, content: '' })); }}
                                    className={`${inputCls(!!textErrors.content)} resize-none px-3 py-2.5`}
                                />
                                <div className="flex items-start justify-between gap-2">
                                    <FieldError message={textErrors.content} />
                                    <p className="ml-auto mt-1 flex-shrink-0 text-right text-[11px] text-gray-400">{textContent.length} chars</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {view !== 'menu' && (
                    <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
                        <button onClick={handleClose} disabled={loading}
                            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-40">
                            Cancel
                        </button>
                        <button onClick={submitHandlers[view]} disabled={loading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition">
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {loading ? submitLabels[view]?.busy : submitLabels[view]?.idle}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Processing Banner ────────────────────────────────────────────────────────
function ProcessingBanner({ jobId, mode = 'add' }) {
    const label = mode === 'detach' ? 'Detaching document…' : 'Processing document…';
    return (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin text-blue-500" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-800">{label}</p>
                <p className="truncate text-[11px] text-blue-500">Job {jobId}</p>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
// ─── Detach Confirm Modal ──────────────────────────────────────────────
function DetachConfirmModal({ item, agentId, onClose, onJobStarted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    async function handleDetach() {
        setError(''); setLoading(true);
        const job_id = generateJobId();
        try {
            await axios.post('/app/knowledge-base/detach', {
                job_id,
                agent_id:    agentId,
                document_id: item.id,
            });
            onJobStarted(job_id);
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to detach. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl">

                <div className="px-5 pt-5 pb-4">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                        <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Detach document?</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                        <span className="font-medium text-gray-700">\"{item.name}\"</span> will be detached from this
                        agent. The document will remain in your knowledge base library.
                    </p>
                </div>

                {error && (
                    <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                        <span className="text-xs text-red-600">{error}</span>
                    </div>
                )}

                <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDetach}
                        disabled={loading}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 transition"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {loading ? 'Detaching…' : 'Detach'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const POLL_INTERVAL_MS = 3000;

export default function KnowledgeBaseSection({ config, agentId, localKb }) {

    const { trackChange } = useAgentChanges();

    const initialKb = config?.agent?.prompt?.knowledge_base || MOCK_KB;

    const [selectedKbItems, setSelectedKbItems] = useState([]);


    const [kbList, setKbList]             = useState(initialKb);
    const [pollingJobId, setPollingJobId] = useState(null);
    const pollTimerRef                    = useRef(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showModal, setShowModal]       = useState(false);
    const [kbSearch, setKbSearch]         = useState('');
    const [search, setSearch]             = useState('');

    // Drawer state
    const [drawerItem, setDrawerItem] = useState(null);

    // Detach confirm state
    const [detachItem, setDetachItem] = useState(null);
    const [pollingMode, setPollingMode] = useState('add'); // 'add' | 'detach'

    // ── Polling ───────────────────────────────────────────────────────────────
    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
        setPollingJobId(null);
    }, []);

    const startPolling = useCallback((jobId) => {
        setPollingJobId(jobId);
        const tick = async () => {
            try {
                const { data } = await axios.post('/check-job', { jobId });
                if (!data.exists || data.status === 'not_found') return;
                if (data.status === 'complete') {
                    if (Array.isArray(data.data)) setKbList(data.data);
                    stopPolling();
                }
            } catch { /* silently continue */ }
        };
        tick();
        pollTimerRef.current = setInterval(tick, POLL_INTERVAL_MS);
    }, [stopPolling]);

    useEffect(() => () => stopPolling(), [stopPolling]);

    function handleJobStarted(jobId, mode = 'add') { stopPolling(); setPollingMode(mode); startPolling(jobId); }

    function toggleKbSelection(kbItem) {

        setSelectedKbItems(prev => {
            const exists = prev.some(s => s.id === kbItem.document_id);
            if (exists) return prev.filter(s => s.document_id !== kbItem.document_id);
            return [...prev, { id: kbItem.document_id, name: kbItem.name, type: kbItem.type }];
        });

    }

    // ── Derived ───────────────────────────────────────────────────────────────
    const attachedIds = new Set(kbList.map(k => k.id));

    const pendingKbItems = selectedKbItems
        .filter(s => !attachedIds.has(s.document_id))
        .map(s => ({ id: s.id, name: s.name, type: s.type, usage_mode: 'auto' }));

    const combinedKb = [...kbList, ...pendingKbItems];

    const filteredKb  = combinedKb.filter(k => (k.name || '').toLowerCase().includes(search.toLowerCase()));
    const availableKb = localKb.filter(k =>
        !attachedIds.has(k.document_id) &&
        k.name.toLowerCase().includes(kbSearch.toLowerCase())
    );

    return (
        <div className="font-sans antialiased">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agent Knowledge Base</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowModal(true)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                        Browse library
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition">
                        <Plus className="h-3.5 w-3.5" />
                        Add document
                    </button>
                </div>
            </div>

            {/* Processing banner */}
            {pollingJobId && <ProcessingBanner jobId={pollingJobId} mode={pollingMode} />}

            {/* Search */}
            <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search Knowledge Base..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" />
                    </button>
                )}
            </div>

            {/* KB list */}
            {filteredKb.length > 0 ? (
                <div className="space-y-2">
                    {filteredKb.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => setDrawerItem(item)}
                            className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconColors(item.type)}`}>
                                    <KbTypeIcon type={item.type} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <span className="capitalize">{item.type}</span>
                                        {item.usage_mode && <><span>·</span><span>{item.usage_mode}</span></>}
                                        {item.type === 'folder' && item.children_count != null && (
                                            <><span>·</span><span>{item.children_count} pages</span></>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Detach button */}
                            <button
                                onClick={e => { e.stopPropagation(); setDetachItem(item); }}
                                className="flex-shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                                title="Detach"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                        <Database className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No documents found</p>
                    <p className="mt-1 text-xs text-gray-500">This agent has no attached documents yet.</p>
                    <div className="mt-4 flex gap-2">
                        <button onClick={() => setShowModal(true)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Browse library
                        </button>
                        <button onClick={() => setShowAddModal(true)} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                            Add document
                        </button>
                    </div>
                </div>
            )}

            {/* Document Drawer */}
            {drawerItem && (
                <DocumentDrawer
                    item={drawerItem}
                    onClose={() => setDrawerItem(null)}
                />
            )}

            {/* Detach Confirm Modal */}
            {detachItem && (
                <DetachConfirmModal
                    item={detachItem}
                    agentId={agentId}
                    onClose={() => setDetachItem(null)}
                    onJobStarted={(jobId) => { handleJobStarted(jobId, 'detach'); setDetachItem(null); }}
                />
            )}

            {/* Add Document Modal */}
            {showAddModal && (
                <AddDocumentModal
                    agentId={agentId}
                    onClose={() => setShowAddModal(false)}
                    onJobStarted={handleJobStarted}
                />
            )}

            {/* Library modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Knowledge Base Library</h3>
                                <p className="mt-0.5 text-xs text-gray-400">Select documents to attach to this agent</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setKbSearch(''); }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="border-b border-gray-100 px-4 py-3">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                <input autoFocus type="text" placeholder="Search library..."
                                    value={kbSearch} onChange={e => setKbSearch(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition"
                                />
                                {kbSearch && (
                                    <button onClick={() => setKbSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {kbList.length > 0 && (
                                <div className="px-4 py-3">
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Attached</p>
                                    <div className="space-y-0.5">
                                        {kbList.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2 opacity-60">
                                                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${iconColors(item.type)}`}>
                                                    <KbTypeIcon type={item.type} className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm text-gray-700">{item.name}</p>
                                                    {item.type === 'folder' && item.children_count != null && (
                                                        <p className="text-xs text-gray-400">{item.children_count} pages</p>
                                                    )}
                                                </div>
                                                <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={`px-4 py-3 ${kbList.length > 0 ? 'border-t border-gray-100' : ''}`}>
                                {availableKb.length > 0 ? (
                                    <>
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Available</p>
                                        <div className="space-y-0.5">
                                            {availableKb.map(kbItem => {

                                                const isSelected = selectedKbItems.some(s => s.id === kbItem.document_id);
                                                return (

                                                    <button
                                                        key={kbItem.id}
                                                        onClick={() => toggleKbSelection(kbItem)}
                                                        className={[
                                                            "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition",
                                                            isSelected ? "bg-gray-50" : "hover:bg-gray-50",
                                                        ].join(' ')}
                                                    >
                                                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${iconColors(kbItem.type)}`}>
                                                            <KbTypeIcon type={kbItem.type} className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-900">{kbItem.name}</p>
                                                            <p className="text-xs capitalize text-gray-400">
                                                                {kbItem.type}{kbItem.type === 'folder' && kbItem.children_count != null && ` · ${kbItem.children_count} pages`}
                                                            </p>
                                                        </div>
                                                        <div className={[
                                                            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition",
                                                            isSelected
                                                                ? "border-gray-900 bg-gray-900"
                                                                : "border-gray-300 bg-white",
                                                        ].join(' ')}>
                                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-sm font-medium text-gray-700">No documents available</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {kbSearch ? 'No results match your search.' : 'All library documents are already attached.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
                            <button 
                              onClick={() => { 
                               
                                trackChange('agent.prompt.knowledge_base', combinedKb);
                                setShowModal(false); 
                                setKbSearch(''); 
                            }}
                              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}