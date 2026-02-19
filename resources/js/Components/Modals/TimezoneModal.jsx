import { useState } from 'react';
import { timezones } from '../timezones';
import Portal from '../Shared/Portal';

export default function TimezoneModal({ isOpen, onClose, onSelect, currentTimezone }) {
   
    const [searchQuery, setSearchQuery] = useState('');
    
    if (!isOpen) return null;

    const filteredTimezones = searchQuery.trim()
        ? timezones.filter(tz => tz.toLowerCase().includes(searchQuery.toLowerCase()))
        : timezones.slice(0, 10); // Show only first 10 by default

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div 
                    className="w-full max-w-md  bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">Select Timezone</h3>
                        <button 
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 py-4">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search timezones..."
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                autoFocus
                            />
                        </div>
                        {!searchQuery && (
                            <p className="mt-2 text-xs text-gray-500">Showing first 10 timezones. Search to see more.</p>
                        )}
                    </div>

                    {/* Timezone List */}
                    <div className="max-h-96 overflow-y-auto border-t border-gray-200">
                        {filteredTimezones.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredTimezones.map((tz) => (
                                    <button
                                        key={tz}
                                        onClick={() => onSelect(tz)}
                                        className={`flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-gray-50 ${
                                            tz === currentTimezone ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <span className="text-sm text-gray-900">{tz}</span>
                                        {tz === currentTimezone && (
                                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm text-gray-500">No timezones found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );

}