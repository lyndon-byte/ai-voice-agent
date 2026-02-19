export default function ColorPicker({ label, value }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                {label}
            </label>
            <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                    <input type="color"  />
                </div>
                <input type="text" />
            </div>
        </div>
    );
}