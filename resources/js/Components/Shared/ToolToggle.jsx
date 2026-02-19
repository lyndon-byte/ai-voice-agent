import { useState } from 'react';
import { Wrench } from 'lucide-react';

export default function ToolToggle({ name, enabled }) {
    
    const [isEnabled, setIsEnabled] = useState(enabled || false);
    
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
            <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                    <Wrench className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-gray-900 sm:text-sm">{name}</span>
            </div>
            <label className="relative flex-shrink-0 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="peer sr-only"
                />
                <div className="h-4 w-8 rounded-full bg-gray-300 transition-all peer-checked:bg-green-600 sm:h-5 sm:w-9"></div>
                <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4 sm:h-4 sm:w-4"></div>
            </label>
        </div>
    );
}