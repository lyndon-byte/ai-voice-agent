import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, MoreVertical, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteModal({ open, agent, onCancel, onConfirmed }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError]       = useState('');

    useEffect(() => {
        if (open) setError('');
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    async function handleConfirm() {
        setDeleting(true);
        setError('');
        try {
            await axios.post('/app/agents/agent/delete', { agent_id: agent.agent_id });
            onConfirmed(agent.id);
        } catch {
            setError('Failed to delete agent. Please try again.');
        } finally {
            setDeleting(false);
        }
    }

    if (!open || !agent) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon + heading */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 mb-4">
                        <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Delete agent</h3>
                    <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                        Are you sure you want to delete{' '}
                        <span className="font-medium text-gray-700">"{agent.agent_name}"</span>?
                        This action cannot be undone.
                    </p>
                    {error && (
                        <p className="mt-3 text-xs text-red-500 rounded border border-red-100 bg-red-50 px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="rounded border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {deleting && (
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        )}
                        {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ data }) {
    const { current_page, last_page, from, to, total, prev_page_url, next_page_url, links } = data;

    const navigate = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true });
    };

    // Only numbered page links (exclude Prev / Next labels)
    const pageLinks = links.filter((l) => !isNaN(Number(l.label)));

    return (
        <div className="flex items-center justify-between px-1 py-4">
            {/* Info */}
            <p className="text-sm text-gray-400">
                Showing <span className="font-medium text-gray-600">{from}–{to}</span> of{' '}
                <span className="font-medium text-gray-600">{total}</span> agents
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => navigate(prev_page_url)}
                    disabled={!prev_page_url}
                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {pageLinks.map((link) => (
                    <button
                        key={link.label}
                        onClick={() => navigate(link.url)}
                        disabled={link.active}
                        className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-medium transition
                            ${link.active
                                ? 'border-gray-900 bg-gray-900 text-white cursor-default'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {link.label}
                    </button>
                ))}

                {/* Next */}
                <button
                    onClick={() => navigate(next_page_url)}
                    disabled={!next_page_url}
                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Agents({ agents }) {
    const [searchQuery, setSearchQuery]         = useState('');
    const [openDropdown, setOpenDropdown]       = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const [deleteTarget, setDeleteTarget]       = useState(null);
    const buttonRefs = useRef({});

    const filteredAgents = agents.data.filter((agent) =>
        agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRowClick = (agentId) => {
        router.get(`/app/agents/agent?agentId=${agentId}`);
    };

    const openDeleteModal = (agent, e) => {
        e.stopPropagation();
        setOpenDropdown(null);
        setDeleteTarget(agent);
    };

    const handleDeleted = (deletedId) => {
        setDeleteTarget(null);
        // Refresh current page via Inertia
        router.reload({ only: ['agents'] });
    };

    const toggleDropdown = (agentId, e) => {
        e.stopPropagation();
        if (openDropdown === agentId) {
            setOpenDropdown(null);
        } else {
            const button = buttonRefs.current[agentId];
            if (button) {
                const rect = button.getBoundingClientRect();
                const dropdownHeight = 80;
                const spaceBelow = window.innerHeight - rect.bottom;

                setDropdownPosition(
                    spaceBelow < dropdownHeight && rect.top > dropdownHeight
                        ? { top: rect.top - dropdownHeight, right: window.innerWidth - rect.right }
                        : { top: rect.bottom + 6, right: window.innerWidth - rect.right }
                );
            }
            setOpenDropdown(agentId);
        }
    };

    const formatDate = (isoString) => new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(isoString));

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Agents</h2>
            }
        >
            <Head title="Agents" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mt-10">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
                    <Link
                        href="/app/agents/create"
                        className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        New agent
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-7">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search agents..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="max-h-[600px] overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created by</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        <div className="flex items-center">
                                            Created at <ChevronDown className="ml-1 h-4 w-4" />
                                        </div>
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredAgents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                                            No agents found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAgents.map((agent) => (
                                        <tr
                                            key={agent.id}
                                            onClick={() => handleRowClick(agent.agent_id)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {agent.agent_name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {agent.created_by}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {formatDate(agent.created_at)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    ref={(el) => (buttonRefs.current[agent.id] = el)}
                                                    onClick={(e) => toggleDropdown(agent.id, e)}
                                                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-gray-100 px-4">
                        <Pagination data={agents} />
                    </div>
                </div>

                {/* Dropdown */}
                {openDropdown !== null && (
                    <>
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}
                        />
                        <div
                            style={{ position: 'fixed', top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px` }}
                            className="z-[101] w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                        >
                            <div className="py-1">
                                <button
                                    onClick={(e) => {
                                        const agent = agents.data.find((a) => a.id === openDropdown);
                                        openDeleteModal(agent, e);
                                    }}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete confirmation modal */}
            <DeleteModal
                open={!!deleteTarget}
                agent={deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirmed={handleDeleted}
            />
        </AuthenticatedLayout>
    );
}