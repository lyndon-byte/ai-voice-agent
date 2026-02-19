export default function ModernField({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 sm:text-sm">
                {label}
            </label>
            <span className="text-xs text-gray-500 sm:flex-1 ">
                How quickly the agent responds
            </span>
            {children}
        </div>
    );
}