import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Home, 
    Settings, 
    ChevronDown,
    Users,
    Phone,
    Send,
    Sliders
} from 'lucide-react';

/**
 * AuthenticatedLayout
 *
 * Props:
 *  - header: string | ReactNode  — page title shown in the top nav bar
 *  - tabs: Array<{ id, label, icon?, href?, routeName? }>  — optional tab list
 *  - activeTab: string            — controlled active tab id (used when tabs have no href)
 *  - onTabChange: (id) => void    — called when a non-link tab is clicked
 *  - children
 *
 * When `tabs` is supplied the top nav expands to show a tab row beneath the
 * header text.  A tab becomes "active" when:
 *   1. Its `routeName` matches the current Inertia route, OR
 *   2. Its `id` matches `activeTab` (for client-side tab switching).
 */
export default function AuthenticatedLayout({ header, tabs, activeTab, onTabChange, children }) {
    const user = usePage().props.auth.user;
     
    const { component } = usePage()
    
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState({
        configure: true,
        monitor: true,
        deploy: true
    });

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
    };

    const isTabActive = (tab) => {
        if (tab.routeName) {
            try { return route().current(tab.routeName); } catch { /* noop */ }
        }
        return tab.id === activeTab;
    };

    const hasTabs = Array.isArray(tabs) && tabs.length > 0;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
                    showingNavigationDropdown ? 'translate-x-0' : ''
                }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center border-gray-200 px-4">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="h-8 w-auto fill-current text-gray-800" />
                    </Link>
                </div>

                {/* Nav links */}
                <div className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-4">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link
                                href={route('dashboard')}
                                className={`flex items-center rounded-lg p-2 transition-colors ${
                                    route().current('dashboard')
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Home className="h-5 w-5 text-gray-500" />
                                <span className="ms-3">Home</span>
                            </Link>
                        </li>

                        {/* Configure */}
                        <li>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('configure')}
                                className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100"
                            >
                                <Sliders className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex-1 whitespace-nowrap text-left">Configure</span>
                                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdowns.configure ? 'rotate-180' : ''}`} />
                            </button>
                            <ul className={`space-y-2 py-2 ${openDropdowns.configure ? '' : 'hidden'}`}>
                                {[
                                    { href: route('agents'), name: 'agents', label: 'Agents', Icon: Users },
                            
                                ].map(({ href, name, label, Icon }) => (
                                    <li key={label}>
                                        <Link
                                            href={href}
                                            className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                               component === 'Agent' || component === 'Agents'
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="mr-3 h-4 w-4 text-gray-500" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                       

                        {/* Deploy */}
                        <li>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('deploy')}
                                className="group flex w-full items-center rounded-lg p-2 text-base text-gray-900 transition duration-75 hover:bg-gray-100"
                            >
                                <Send className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex-1 whitespace-nowrap text-left">Deploy</span>
                                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${openDropdowns.deploy ? 'rotate-180' : ''}`} />
                            </button>
                            <ul className={`space-y-2 py-2 ${openDropdowns.deploy ? '' : 'hidden'}`}>
                                {[
                                    { href: route('numbers'),label: 'Phone Numbers', Icon: Phone },

                                ].map(({ href, label, Icon }) => (
                                    <li key={label}>
                                        <Link href={href} 
                                        
                                            className={`group flex w-full items-center rounded-lg p-2 pl-11 transition-colors ${
                                                route().current('numbers')
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-900 hover:bg-gray-100'
                                            }`}
                                        
                                        >
                                            <Icon className="mr-3 h-4 w-4 text-gray-500" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li>
                            <Link href="" className="flex items-center rounded-lg p-2 text-gray-900 transition-colors hover:bg-gray-100">
                                <Send className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex items-center">
                                    Outbound
                                </span>
                            </Link>
                        </li>

                        <li>
                            <Link href="" className="flex items-center rounded-lg p-2 text-gray-900 transition-colors hover:bg-gray-100">
                                <Settings className="h-5 w-5 text-gray-500" />
                                <span className="ms-3">Settings</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Mobile overlay */}
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                />
            )}

            {/* ── Top Header ──────────────────────────────────────────────── */}
            <nav className={`fixed left-0 right-0 top-0 z-20 border-b border-gray-200 bg-white lg:left-64 ${hasTabs ? '' : ''}`}>
                {/* Primary bar — always 64 px tall */}
                <div className="flex h-16 items-center justify-between px-4">
                    {/* Left: hamburger + title */}
                    <div className="flex items-center">
                        <button
                            onClick={() => setShowingNavigationDropdown(prev => !prev)}
                            className="mr-3 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                <path clipRule="evenodd" fillRule="evenodd"
                                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                                />
                            </svg>
                        </button>
                        {header && (
                            <div className="text-lg font-semibold text-gray-800">{header}</div>
                        )}
                    </div>

                    {/* Right: user menu */}
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
                                <div className="border-t border-gray-100" />
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {/* ── Tab bar — only rendered when `tabs` prop is provided ── */}
                {hasTabs && (
                    <div className="flex items-end gap-1 overflow-x-auto px-4 scrollbar-none">
                        {tabs.map((tab) => {
                            const active = isTabActive(tab);
                            const Icon = tab.icon;

                            const baseClass =
                                'group relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-2 text-sm font-medium transition-colors focus:outline-none';
                            const activeClass = 'text-indigo-600';
                            const inactiveClass = 'text-gray-500 hover:text-gray-700';

                            const inner = (
                                <>
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {tab.label}
                                    {/* Active underline */}
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-t-full transition-colors ${
                                            active ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-gray-200'
                                        }`}
                                    />
                                </>
                            );

                            // Render as <Link> when an href is provided, otherwise <button>
                            return tab.href ? (

                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className={`${baseClass} ${active ? activeClass : inactiveClass}`}
                                >
                                    {inner}
                                </Link>

                            ) : (

                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onTabChange?.(tab.id)}
                                    className={`${baseClass} ${active ? activeClass : inactiveClass}`}
                                >
                                    {inner}
                                </button>
                                
                            );
                        })}
                    </div>
                )}
            </nav>

            {/* ── Main content ────────────────────────────────────────────── */}
            {/*
                When tabs are present the nav is taller (64 px header + ~44 px tabs = ~108 px).
                We compensate with extra top padding so content never hides behind the nav.
            */}
            <div className={`lg:pl-64 ${hasTabs ? 'pt-[108px]' : 'pt-16'}`}>
                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}