import Portal from '../shared/Portal';

export default function ViewChangesModal({ isOpen, onClose, changes }) {
    if (!isOpen) return null;

    // Flatten changes into a readable list
    const flattenChanges = (obj, prefix = '') => {
        const result = [];
        
        for (const key in obj) {
            const value = obj[key];
            const path = prefix ? `${prefix}.${key}` : key;
            
            // Handle arrays
            if (Array.isArray(value)) {
                result.push({
                    path,
                    label: formatLabel(path),
                    value: JSON.stringify(value, null, 2),
                    isArray: true,
                    arrayLength: value.length,
                    rawValue: value
                });
            }
            // Handle objects (but not arrays)
            else if (value && typeof value === 'object') {
                result.push({
                    path,
                    label: formatLabel(path),
                    value: JSON.stringify(value, null, 2),
                    isObject: true,
                    rawValue: value
                });
            }
            // Handle primitives
            else {
                result.push({
                    path,
                    label: formatLabel(path),
                    value: formatValue(value)
                });
            }
        }
        
        return result;
    };

    const formatLabel = (path) => {
        // Convert path like "agent.prompt.prompt" to "System Prompt"
        const labelMap = {
            'agent.prompt.prompt': 'System Prompt',
            'agent.prompt.timezone': 'Timezone',
            'agent.prompt.ignore_default_personality': 'Default Personality',
            'agent.prompt.knowledge_base': 'Knowledge Base',
            'agent.first_message': 'First Message',
            'agent.language': 'Language',
            'agent.languages': 'Additional Languages',
            'agent.disable_first_message_interruptions': 'Interruptible',
            'turn.turn_eagerness': 'Turn Eagerness',
            'tts': 'Voice',
            'tts.voice_id': 'Voice ID',
            'tts.name': 'Voice Name',
            'tts.additional_voices': 'Additional Voices',
            'widget.variant': 'Widget Variant',
            'widget.placement': 'Widget Placement',
            'widget.bg_color': 'Background Color',
            'widget.text_color': 'Text Color',
            'widget.btn_color': 'Button Color',
            'widget.border_color': 'Border Color',
            'widget.transcript_enabled': 'Show Transcript',
            'widget.text_input_enabled': 'Text Input',
            'widget.mic_muting_enabled': 'Mic Muting',
            'widget.language_selector': 'Language Selector',
            'widget.supports_text_only': 'Text Only Mode',
            'evaluation.criteria': 'Evaluation Criteria',
            'data_collection': 'Data Collection',
        };
        
        return labelMap[path] || path.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatValue = (value) => {
        if (typeof value === 'boolean') {
            return value ? 'Enabled' : 'Disabled';
        }
        if (value === null || value === undefined) {
            return 'Not set';
        }
        if (typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        return String(value);
    };

    const changesList = flattenChanges(changes);

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div 
                    className="w-full max-w-4xl rounded-xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
                            <p className="mt-1 text-sm text-gray-500">{changesList.length} changes pending</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Changes List */}
                    <div className="max-h-[32rem] overflow-y-auto p-6">
                        {changesList.length === 0 ? (
                            <p className="text-center text-sm text-gray-500">No changes to display</p>
                        ) : (
                            <div className="space-y-4">
                                {changesList.map((change, index) => (
                                    <div 
                                        key={index}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                    >
                                        {/* Header */}
                                        <div className="mb-2 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-900">{change.label}</p>
                                                {change.isArray && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Array ({change.arrayLength} {change.arrayLength === 1 ? 'item' : 'items'})
                                                    </span>
                                                )}
                                                {change.isObject && (
                                                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                        Object
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Path */}
                                        <p className="mb-2 text-xs text-gray-500">Path: {change.path}</p>

                                        {/* Value */}
                                        {(change.isArray || change.isObject) ? (
                                            <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-green-400">
                                                <code>{change.value}</code>
                                            </pre>
                                        ) : (
                                            <div className="rounded-md bg-blue-50 px-3 py-2">
                                                <span className="text-sm font-medium text-blue-900">
                                                    {change.value}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}