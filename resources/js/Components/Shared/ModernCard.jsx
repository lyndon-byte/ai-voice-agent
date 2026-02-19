export default function ModernCard({ icon: Icon, title, description, children }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md sm:rounded-xl">
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
                        <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-3 sm:p-4">{children}</div>
        </div>
    );
}