import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Home, 
    Settings, 
    ChevronDown,
    Users,
    BookOpen,
    Wrench,
    Plug,
    Mic,
    MessageSquare,
    FlaskConical,
    Phone,
    MessageCircle,
    Send,
    Sliders
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [openDropdowns, setOpenDropdowns] = useState({
        configure: true,
        monitor: true,
        deploy: true
    });

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar - Full Height from Top */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
                    showingNavigationDropdown ? 'translate-x-0' : ''
                }`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center border-gray-200 px-4">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="h-8 w-auto fill-current text-gray-800" />
                    </Link>
                </div>

                {/* Navigation */}
                <div className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link
                                href={route('dashboard')}
                                className={`flex items-center rounded-lg p-2 transition-colors  ${
                                    route().current('dashboard')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Home className="h-5 w-5 text-gray-500" />
                                <span className="ms-3">Home</span>
                            </Link>
                        </li>
                        
                        {/* Configure Section */}
                        <li>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('configure')}
                                className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100"
                            >
                                <Sliders className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex-1 whitespace-nowrap text-left">
                                    Configure
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 text-gray-500 transition-transform ${
                                        openDropdowns.configure ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <ul
                                className={`space-y-2 py-2 ${
                                    openDropdowns.configure ? '' : 'hidden'
                                }`}
                            >
                                <li>
                                    <Link
                                        href={route('agents')}
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('agents')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Users className="mr-3 h-4 w-4 text-gray-500" />
                                        Agents
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <BookOpen className="mr-3 h-4 w-4 text-gray-500" />
                                        Knowledge Base
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Wrench className="mr-3 h-4 w-4 text-gray-500" />
                                        Tools
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Plug className="mr-3 h-4 w-4 text-gray-500" />
                                        Integrations
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li>
                            <Link
                                href=""
                                className={`flex items-center rounded-lg p-2 transition-colors ${
                                    route().current('')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Mic className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex items-center">
                                    Voices
                                    <span className="ms-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                                        Alpha
                                    </span>
                                </span>
                            </Link>
                        </li>

                        {/* Monitor Section */}
                        <li>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('monitor')}
                                className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100"
                            >
                                <MessageSquare className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex-1 whitespace-nowrap text-left">
                                    Monitor
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 text-gray-500 transition-transform ${
                                        openDropdowns.monitor ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <ul
                                className={`space-y-2 py-2 ${
                                    openDropdowns.monitor ? '' : 'hidden'
                                }`}
                            >
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <MessageSquare className="mr-3 h-4 w-4 text-gray-500" />
                                        Conversations
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FlaskConical className="mr-3 h-4 w-4 text-gray-500" />
                                        Tests
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Deploy Section */}
                        <li>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('deploy')}
                                className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100"
                            >
                                <Send className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex-1 whitespace-nowrap text-left">
                                    Deploy
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 text-gray-500 transition-transform ${
                                        openDropdowns.deploy ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            <ul
                                className={`space-y-2 py-2 ${
                                    openDropdowns.deploy ? '' : 'hidden'
                                }`}
                            >
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Phone className="mr-3 h-4 w-4 text-gray-500" />
                                        Phone Numbers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                            route().current('')
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <MessageCircle className="mr-3 h-4 w-4 text-gray-500" />
                                        WhatsApp
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li>
                            <Link
                                href=""
                                className={`flex items-center rounded-lg p-2 transition-colors ${
                                    route().current('')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Send className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex items-center">
                                    Outbound
                                    <span className="ms-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                                        Alpha
                                    </span>
                                </span>
                            </Link>
                        </li>

                        <li>
                            <Link
                                href=""
                                className={`flex items-center rounded-lg p-2 transition-colors ${
                                    route().current('')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Settings className="h-5 w-5 text-gray-500" />
                                <span className="ms-3">Settings</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                ></div>
            )}

            {/* Top Header */}
            <nav className="fixed left-0 right-0 top-0 z-20 border-b border-gray-200 bg-white lg:left-64">
                <div className="flex h-16 items-center justify-between px-4">
                    {/* Left: Hamburger + Header Content */}
                    <div className="flex items-center">
                        <button
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    (previousState) => !previousState,
                                )
                            }
                            className="mr-3 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    clipRule="evenodd"
                                    fillRule="evenodd"
                                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                                ></path>
                            </svg>
                        </button>
                        {header && (
                            <div className="text-lg font-semibold text-gray-800">
                                {header}
                            </div>
                        )}
                    </div>

                    {/* Right: User Menu */}
                    <div className="flex items-center">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="flex items-center rounded-full bg-gray-100 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right">
                                <div className="px-4 py-2 text-sm text-gray-900">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-gray-500">{user.email}</div>
                                </div>
                                <div className="border-t border-gray-100"></div>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-16 lg:pl-64">
                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}