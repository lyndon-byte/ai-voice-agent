import { useState } from 'react';

export default function EmbedCode({ agentId }) {
    
    const [copied, setCopied] = useState(false);
    const code = `<elevenlabs-convai agent-id="${agentId || 'YOUR_AGENT_ID'}"></elevenlabs-convai>...`;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Embed code</h3>
            <p className="mb-3 text-xs text-gray-500">
                Add the following snippet to the pages where you want the conversation widget to be.
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 select-none text-xs text-gray-400">1</span>
                    <pre className="flex-1 overflow-x-auto text-xs text-gray-800 whitespace-pre-wrap break-all">
                        <span className="text-blue-600">&lt;elevenlabs-convai</span>
                        {' '}
                        <span className="text-gray-600">agent-id=</span>
                        <span className="text-orange-500">"{agentId || 'YOUR_AGENT_ID'}"</span>
                        <span className="text-blue-600">&gt;&lt;/elevenlabs-convai&gt;</span>
                        {'\n'}
                        <span className="mt-1 block text-blue-600">&lt;script</span>
                        {' '}
                        <span className="text-gray-600">src=</span>
                        <span className="text-orange-500">"https://unpkg.com/@elevenlabs/convai-widget-embed"</span>
                        {' '}
                        <span className="text-gray-600">async type=</span>
                        <span className="text-orange-500">"text/javascript"</span>
                        <span className="text-blue-600">&gt;&lt;/script&gt;</span>
                    </pre>
                    <button
                        onClick={handleCopy}
                        title="Copy to clipboard"
                        className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                    >
                        {copied ? (
                            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}