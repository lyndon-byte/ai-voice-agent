import { useState } from 'react';

export default function FeatureToggle({ label, checked }) {
    
    const [isChecked, setIsChecked] = useState(checked || false);
    
    return (
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3...">
             <span className="text-xs font-medium text-gray-900 sm:text-sm">{label}</span>
            <div className="relative flex-shrink-0">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-gray-300 transition-all peer-checked:bg-blue-600 sm:h-6 sm:w-11"></div>
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4 sm:h-5 sm:w-5 sm:peer-checked:translate-x-5"></div>
            </div>
        </label>
    );
}