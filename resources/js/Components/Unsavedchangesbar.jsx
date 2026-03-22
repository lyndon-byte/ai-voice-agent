import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAgentChanges } from '@/Contexts/AgentChangesContext';
import ViewChangesModal from './Modals/Viewchangesmodal';

export default function UnsavedChangesBar({ agentId, onSaveSuccess, onClearChanges }) {
    
    const { hasChanges, saving, clearChanges, saveChanges, changes, isClearingChanges } = useAgentChanges();
    const [showViewChanges, setShowViewChanges] = useState(false);

    if (!hasChanges && !isClearingChanges) return null;

    const handleSave = async () => {
        const result = await saveChanges(agentId);
        
        if (result.success) {
            if (onSaveSuccess) {
                onSaveSuccess(result.data);
            }
        } else {
            alert(result.error || 'Failed to save changes');
        }
    };

    const handleClear = async () => {

        await clearChanges();
        onClearChanges()
        
    };


    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-lg">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="text-sm font-medium text-gray-900">
                            You have unsaved changes
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClear}
                            disabled={saving || isClearingChanges}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            {isClearingChanges ? 'Clearing...' : 'Clear'}
                        </button>
                        
                        <button
                            onClick={() => setShowViewChanges(true)}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                            View changes
                        </button>
                        
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* View Changes Modal */}
            <ViewChangesModal 
                isOpen={showViewChanges}
                onClose={() => setShowViewChanges(false)}
                changes={changes}
            />
        </>
    );
}