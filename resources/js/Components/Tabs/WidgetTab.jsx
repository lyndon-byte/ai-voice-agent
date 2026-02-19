import ColorPicker from '../shared/ColorPicker';
import FeatureToggle from '../shared/FeatureToggle';
import EmbedCode from '../shared/EmbedCode';

export default function WidgetTab({ agent, platformSettings }) {
    
    return (
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Left - Layout & Colors */}
            <div className="space-y-6">
                {/* Layout */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Layout</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">Variant</label>
                            <select
                                defaultValue={platformSettings?.widget?.variant}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            >
                                <option value="full">Full</option>
                                <option value="compact">Compact</option>
                                <option value="minimal">Minimal</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">Placement</label>
                            <select
                                defaultValue={platformSettings?.widget?.placement}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                            >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Colors</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <ColorPicker label="Background" value={platformSettings?.widget?.bg_color} />
                        <ColorPicker label="Text Color" value={platformSettings?.widget?.text_color} />
                        <ColorPicker label="Button Color" value={platformSettings?.widget?.btn_color} />
                        <ColorPicker label="Border Color" value={platformSettings?.widget?.border_color} />
                    </div>
                </div>

                {/* Embed Code */}
                <EmbedCode agentId={agent?.agent_id} />
            </div>

            {/* Right - Features */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Features</h3>
                <div className="space-y-1.5">
                    {[
                        { label: 'Show Transcript', key: 'transcript_enabled' },
                        { label: 'Text Input', key: 'text_input_enabled' },
                        { label: 'Microphone Muting', key: 'mic_muting_enabled' },
                        { label: 'Language Selector', key: 'language_selector' },
                        { label: 'Text Only Mode', key: 'supports_text_only' },
                    ].map(({ label, key }) => (
                        <FeatureToggle
                            key={key}
                            label={label}
                            checked={platformSettings?.widget?.[key]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}