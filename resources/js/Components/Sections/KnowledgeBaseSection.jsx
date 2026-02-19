import { useState } from 'react';
import { Plus, Database, Edit2, Trash2 } from 'lucide-react';

export default function KnowledgeBaseSection({ config }) {
    
    const [showDropdown, setShowDropdown] = useState(false);
    const kb = config?.agent?.prompt?.knowledge_base || [];

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agent Knowledge Base</h2>
                <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Configure RAG
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Add document
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        autoFocus
                                    />
                                </div>
                                <div className="px-3 pb-2">
                                    <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
                                        <Plus className="h-3.5 w-3.5" /> Type
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 px-2 py-1">
                                    <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50">
                                        <span className="mt-0.5 text-sm font-bold text-gray-700">T</span>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">autodrive motors knowledge base</p>
                                            <p className="text-xs text-gray-500">iMZrTFp3e6GDVE6vJnAa</p>
                                        </div>
                                    </button>
                                </div>
                                <div className="flex gap-1 border-t border-gray-100 p-2">
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" strokeLinecap="round"/></svg>
                                        Add URL
                                    </button>
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                        Add Files
                                    </button>
                                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                                        <span className="text-xs font-bold">T</span>
                                        Create Text
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search Knowledge Base..."
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>
            <div className="mb-3">
                <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                    <Plus className="h-3 w-3" /> Type
                </button>
            </div>

            {/* Content */}
            {kb.length > 0 ? (
                <div className="space-y-2">
                    {kb.map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                    <Database className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.type} · {item.usage_mode}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
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
                    <button
                        onClick={() => setShowDropdown(true)}
                        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Add document
                    </button>
                </div>
            )}
        </div>
    );
}