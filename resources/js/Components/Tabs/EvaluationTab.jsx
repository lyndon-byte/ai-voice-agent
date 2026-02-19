import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function EvaluationTab({ platformSettings }) {
    const filterChips = ['Date After','Date Before','Call status','Criteria','Data','Duration','Rating','Comments','Tools','Language','User','Channel'];

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Left - Conversations */}
            <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900">Analysis</h2>
                
                {/* Search */}
                <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
                
                {/* Filter chips */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                    {filterChips.map(f => (
                        <button key={f} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                            <span>+</span> {f}
                        </button>
                    ))}
                </div>
                
                {/* Conversation list empty state */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No conversations found</p>
                    <p className="mt-1 text-xs text-gray-500">This agent has no conversations yet.</p>
                </div>
            </div>

            {/* Right - Criteria & Data Collection */}
            <div className="space-y-4">
                {/* Evaluation Criteria */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900">Evaluation criteria</h3>
                    <p className="mb-3 text-xs text-gray-500">Define criteria to evaluate whether conversations were successful or not.</p>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-xs font-medium text-gray-700">
                            {platformSettings?.evaluation?.criteria?.length || 0} criteria
                        </span>
                        <button className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                            <Plus className="h-3.5 w-3.5" /> Add criteria
                        </button>
                    </div>
                    {platformSettings?.evaluation?.criteria?.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {platformSettings.evaluation.criteria.map((c) => (
                                <div key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 p-3">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-semibold text-gray-900">{c.name}</span>
                                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{c.type}</span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-500">{c.conversation_goal_prompt}</p>
                                    </div>
                                    <button className="flex-shrink-0 text-gray-400 hover:text-red-500">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
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
                        <span className="text-xs font-medium text-gray-700">
                            {platformSettings?.data_collection?.length || 0} data points
                        </span>
                        <button className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                            <Plus className="h-3.5 w-3.5" /> Add data point
                        </button>
                    </div>
                    {platformSettings?.data_collection?.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {platformSettings.data_collection.map((d, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-900">{d.dynamic_variable || d.type}</p>
                                        <p className="text-xs text-gray-500">{d.description}</p>
                                    </div>
                                    <button className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}