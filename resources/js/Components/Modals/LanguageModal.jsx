import Portal from "../Shared/Portal";

export default function LanguageModal({ isOpen, onClose, onSelect, currentLanguage }) {

    if (!isOpen) return null;

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸', isDefault: true },
        // { code: 'fil', name: 'Filipino', flag: '🇵🇭', isDefault: false },
    ];

    return (

        <Portal>

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
                <div 
                    className="w-full max-w-md bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">Select Language</h3>
                        <button 
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Language List */}
                    <div className="divide-y divide-gray-100">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => onSelect(lang.code)}
                                className={`flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50 ${
                                    lang.code === currentLanguage ? 'bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{lang.flag}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                                            {lang.isDefault && (
                                                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">{lang.code}</span>
                                    </div>
                                </div>
                                {lang.code === currentLanguage && (
                                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </Portal>
    )
}