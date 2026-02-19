import Portal from '../shared/Portal';

export default function ViewChangesModal({ isOpen, onClose, changes }) {
    
    if (!isOpen) return null;

    // Flatten changes into a readable list
    const flattenChanges = (obj, prefix = '') => {
        const result = [];
        
        for (const key in obj) {
            const value = obj[key];
            const path = prefix ? `${prefix}.${key}` : key;
            
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result.push(...flattenChanges(value, path));
            } else {
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
            'agent.first_message': 'First Message',
            'agent.language': 'Language',
            'agent.disable_first_message_interruptions': 'Interruptible',
            'turn.turn_eagerness': 'Turn Eagerness',
            'tts.voice_id': 'Voice',
            'tts.name': 'Voice Name',
            'widget.variant': 'Widget Variant',
            'widget.placement': 'Widget Placement',
            'widget.bg_color': 'Background Color',
            'widget.text_color': 'Text Color',
            'widget.btn_color': 'Button Color',
            'widget.border_color': 'Border Color',
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
        if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 50) + '...';
        }
        return String(value);
    };

    const changesList = flattenChanges(changes);

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div 
                    className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
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
                    <div className="max-h-96 overflow-y-auto p-6">
                        {changesList.length === 0 ? (
                            <p className="text-center text-sm text-gray-500">No changes to display</p>
                        ) : (
                            <div className="space-y-3">
                                {changesList.map((change, index) => (
                                    <div 
                                        key={index}
                                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{change.label}</p>
                                                <p className="mt-1 text-xs text-gray-500">Path: {change.path}</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                    {change.value}
                                                </span>
                                            </div>
                                        </div>
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