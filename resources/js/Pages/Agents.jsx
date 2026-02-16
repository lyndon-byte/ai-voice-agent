import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, MoreVertical, Trash2, ChevronDown } from 'lucide-react';

export default function Agents({ agents }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const buttonRefs = useRef({});
  

    const filteredAgents = agents.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRowClick = (agentId) => {

        router.get(`/agents/agent?agentId=${agentId}`);
        
    };

    const handleDelete = (agentId, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this agent?')) {
            // Handle delete
            console.log('Delete agent:', agentId);
        }
        setOpenDropdown(null);
    };

    const toggleDropdown = (agentId, e) => {
        e.stopPropagation();
        
        if (openDropdown === agentId) {
            setOpenDropdown(null);
        } else {
            const button = buttonRefs.current[agentId];
            if (button) {
                const rect = button.getBoundingClientRect();
                const dropdownHeight = 100; // Approximate height of dropdown
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                
                // Position dropdown above if not enough space below
                if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                    setDropdownPosition({
                        top: rect.top - dropdownHeight,
                        right: window.innerWidth - rect.right,
                    });
                } else {
                    setDropdownPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right,
                    });
                }
            }
            setOpenDropdown(agentId);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Agents
                </h2>
            }
        >
            <Head title="Agents" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 mt-10">
                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
                    <div className="flex items-center gap-3">
                        
                        <Link
                            href="/app/agents/create"
                            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            New agent
                        </Link>

                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-7">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search agents..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                    </div>
                </div>

               
                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="max-h-[600px] overflow-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Created by
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        <div className="flex items-center">
                                            Created at
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        </div>
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredAgents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No agents found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAgents.map((agent) => (
                                        <tr
                                            key={agent.id}
                                            onClick={() => handleRowClick(agent.agent_id)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {agent.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {agent.created_by}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {agent.created_at}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <button
                                                    ref={(el) => (buttonRefs.current[agent.id] = el)}
                                                    onClick={(e) => toggleDropdown(agent.id, e)}
                                                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dropdown Menu - Rendered outside table with fixed positioning */}
                {openDropdown !== null && (
                    <>
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(null);
                            }}
                        ></div>
                        <div
                            style={{
                                position: 'fixed',
                                top: `${dropdownPosition.top}px`,
                                right: `${dropdownPosition.right}px`,
                            }}
                            className="z-[101] w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                            <div className="py-1">
                                <button
                                    onClick={(e) => handleDelete(openDropdown, e)}
                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    <Trash2 className="mr-3 h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}