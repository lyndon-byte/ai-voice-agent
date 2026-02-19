import { Plus } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, actionLabel }) {
    return (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-6 text-center sm:rounded-xl sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 text-gray-400 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900 sm:text-base">{title}</h3>
            <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">{description}</p>
            <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 sm:mt-5 sm:gap-2 sm:px-5 sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {actionLabel}
            </button>
        </div>
    );
}