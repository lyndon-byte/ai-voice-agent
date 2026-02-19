import { useState } from 'react';
import { Plus, Wrench, Settings } from 'lucide-react';

const SYSTEM_TOOLS = [
    { id: 'end_conversation', label: 'End conversation' },
    { id: 'detect_language', label: 'Detect language' },
    { id: 'skip_turn', label: 'Skip turn' },
    { id: 'transfer_to_agent', label: 'Transfer to agent' },
    { id: 'transfer_to_number', label: 'Transfer to number' },
    { id: 'play_keypad_touch_tone', label: 'Play keypad touch tone' },
    { id: 'voicemail_detection', label: 'Voicemail detection' },
];

export default function AgentToolsSection({ config }) {
    const [activeToolTab, setActiveToolTab] = useState('tools');
    const builtInTools = config?.agent?.prompt?.built_in_tools || {};
    const [toolStates, setToolStates] = useState(() => {
        const initial = {};
        SYSTEM_TOOLS.forEach(t => {
            initial[t.id] = builtInTools[t.id] !== undefined ? builtInTools[t.id] !== null : false;
        });
        // default end_conversation and play_keypad_touch_tone to on to match image
        if (!builtInTools.end_conversation) initial['end_conversation'] = true;
        if (!builtInTools.play_keypad_touch_tone) initial['play_keypad_touch_tone'] = true;
        return initial;
    });

    const activeCount = Object.values(toolStates).filter(Boolean).length;

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Left - Custom Tools */}
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Agent Tools</h2>
                    <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
                        Add tool
                    </button>
                </div>

                {/* Sub-tabs */}
                <div className="mb-4 flex items-center gap-1">
                    {['tools', 'mcp'].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveToolTab(t)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                                activeToolTab === t
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Search */}
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

                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                        <Wrench className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No tools found</p>
                    <p className="mt-1 text-xs text-gray-500">This agent has no attached tools yet.</p>
                    <button className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        Add tool
                    </button>
                </div>
            </div>

            {/* Right - System Tools */}
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
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <Settings className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={toolStates[tool.id] || false}
                                            onChange={e => setToolStates(prev => ({ ...prev, [tool.id]: e.target.checked }))}
                                            className="peer sr-only"
                                        />
                                        <div className="h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-gray-900"></div>
                                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}