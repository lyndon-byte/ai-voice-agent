import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import InputError from '@/Components/InputError';

export default function CreateAgent() {

    const { data, setData, post, processing, errors, reset } = useForm({
        agent_name: ''
    });

    const maxLength = 50;

    const handleSubmit = (e) => {

        e.preventDefault();

        post(route('agents.create.store'), {
            onFinish: () => reset('agent_name'),
        });
    };

    return (

        <>
            <Head title="Create Agent" />

            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Create agent
                            </h1>
                            <p className="mt-2 text-base text-gray-500">
                                Choose a name that reflects your agent's purpose
                            </p>
                        </div>

                        {/* Agent Name Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="agent-name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Agent Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="agent-name"
                                    value={data.agent_name}
                                    onChange={(e) => setData('agent_name',e.target.value)}
                                    maxLength={maxLength}
                                    className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    placeholder="Enter agent name"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                    {data.agent_name.length}/{maxLength}
                                </div>
                            </div>
                        </div>

                        <InputError message={errors.agent_name} className="mt-2" />


                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <Link
                                href="/app/agents"
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                            <button
                                type="submit"
                                className="inline-flex items-center rounded-md bg-black px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                disabled={processing}
                            >
                                Create Agent
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}