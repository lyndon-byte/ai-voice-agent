import { MessageSquare } from 'lucide-react';

export default function AdvancedTab({ platformSettings }) {
    return (
        <div className="divide-y divide-gray-200">
            {/* Post-call Webhook Section */}
            <div className="grid gap-8 py-8 first:pt-0 lg:grid-cols-[280px,1fr]">
                {/* Left description */}
                <div>
                    <h3 className="mb-1.5 text-base font-semibold text-gray-900">Post-call Webhook</h3>
                    <p className="text-sm text-gray-500">
                        Override the post-call webhook for this agent. You can configure the default webhooks used by all agents in{' '}
                        <a href="#" className="font-medium text-gray-900 underline underline-offset-2">your workspace settings</a>.
                    </p>
                    <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="h-12 w-16 flex-shrink-0 rounded bg-gray-300"></div>
                        <p className="text-xs text-gray-700">Learn how to automate post-call workflows with ElevenLabs &amp; n8n</p>
                    </div>
                </div>

                {/* Right content */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">Post-call webhook</h4>
                        <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Create Webhook
                        </button>
                    </div>
                    {platformSettings?.workspace_overrides?.webhooks?.post_call_webhook_id ? (
                        <div className="space-y-3">
                            <input
                                type="url"
                                value={platformSettings.workspace_overrides.webhooks.post_call_webhook_id}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                placeholder="https://your-domain.com/webhook"
                            />
                            <div className="flex flex-wrap gap-1.5">
                                {platformSettings.workspace_overrides.webhooks.events?.map((event) => (
                                    <span key={event} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                        {event}
                                        <button className="text-gray-400 hover:text-gray-600">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-8">
                            <p className="text-sm text-gray-400">No post-call webhook configured.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation History Section */}
            <div className="grid gap-8 py-8 lg:grid-cols-[280px,1fr]">
                <div>
                    <h3 className="mb-1.5 text-base font-semibold text-gray-900">Conversation History</h3>
                    <p className="text-sm text-gray-500">
                        View and analyze past conversations for this agent.
                    </p>
                </div>
                <div>
                    <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-10">
                        <div className="text-center">
                            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm font-medium text-gray-900">Conversation data loaded separately</p>
                            <p className="mt-1 text-xs text-gray-500">Use the Conversations tab to view chat history</p>
                            <button className="mt-3 rounded-lg bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
                                View Conversations
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}