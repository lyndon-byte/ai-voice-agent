import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Home, 
    Settings, 
    ChevronDown,
    Users,
    Phone,
    Send,
    Sliders,
    ShieldAlert,
    LogOut
} from 'lucide-react';


export default function AuthenticatedLayout({ header, tabs, activeTab, onTabChange, children }) {

    const { auth, impersonated_by } = usePage().props;
    
    const user = auth.user;
    const organization = auth.organization;
    const isOrgDisabled = organization && organization.active === false;

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

    const handleLeaveImpersonation = () => {
        router.post('/impersonate/leave')
    };

    const impersonationBannerHeight = impersonated_by ? 40 : 0;
    const orgDisabledBannerHeight   = isOrgDisabled    ? 48 : 0;
    const bannerHeight  = impersonationBannerHeight + orgDisabledBannerHeight;
    const navHeight     = hasTabs ? 108 : 64;
    const totalOffset   = bannerHeight + navHeight;

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ── Impersonation Banner ─────────────────────────────────── */}
            {impersonated_by && (
                <div className="fixed left-0 right-0 top-0 z-50 flex h-10 items-center justify-between bg-amber-500 px-4 shadow-md">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-950">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>
                            You are impersonating{' '}
                            <span className="font-bold">{user.name}</span>
                            {' '}({user.email})
                            {' '}— logged in as{' '}
                            <span className="font-bold">{impersonated_by.name}</span>
                        </span>
                    </div>
                    <button
                        onClick={handleLeaveImpersonation}
                        className="flex items-center gap-1.5 rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-950 focus:ring-offset-1 focus:ring-offset-amber-500"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Leave Impersonation
                    </button>
                </div>
            )}

            {/* ── Account Disabled Banner ───────────────────────────────── */}
            {isOrgDisabled && (
                <div
                    style={{ top: impersonationBannerHeight }}
                className="fixed left-0 right-0 z-50 flex min-h-[60px] items-center gap-3 bg-red-600 px-4 py-2 shadow-md"
                >
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-100" />
                    <div className="flex flex-col text-sm text-red-50">
                        <span className="font-semibold">All agents are currently disabled for this account. You still have access to modify or update your agents, but they cannot be contacted.</span>
                        {organization.super_admin_note && (
                             <span className="text-red-200">Reason: {organization.super_admin_note}</span>
                        )}
                    </div>
                </div>
            )}

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside
                style={{ top: bannerHeight }}
                className={`fixed left-0 z-40 h-[calc(100vh-${bannerHeight}px)] w-64 -translate-x-full border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
                    showingNavigationDropdown ? 'translate-x-0' : ''
                }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-center border-gray-200 px-4">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo className="w-auto fill-current text-gray-800" style={{ width: 110, height: 110 }}/>
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
                                    { href: route('numbers'), label: 'Phone Numbers', Icon: Phone },
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

                        {/* <li>
                            <Link 
                                href={route('outbound')}
                                className={`flex items-center rounded-lg p-2 text-gray-900 transition-colors
                                ${route().current('outbound')
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Send className="h-5 w-5 text-gray-500" />
                                <span className="ms-3 flex items-center">Outbound</span>
                            </Link>
                        </li> */}

                        <li>
                            <Link 
                                href={route('profile.edit')} 
                                className={`flex items-center rounded-lg p-2 text-gray-900 transition-colors
                                        ${route().current('profile.edit')
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

                <div className="absolute bottom-0 left-0 w-full border-t border-gray-200 bg-white px-4 py-3 text-center">
                    <p className="text-xs text-gray-400">
                        powered by{' '}
                        <span className="font-semibold text-gray-500">Eleven Labs</span>
                    </p>
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
            <nav
                style={{ top: bannerHeight }}
                className="fixed left-0 right-0 z-20 border-b border-gray-200 bg-white lg:left-64"
            >
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
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${impersonated_by ? 'bg-amber-500 ring-2 ring-amber-300' : 'bg-gray-600'}`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width='auto'>
                                <div className="px-4 py-2 text-sm text-gray-900">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-gray-500">{user.email}</div>
                                    {impersonated_by && (
                                        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                                            <ShieldAlert className="h-3 w-3" />
                                            Impersonated by {impersonated_by.name}
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-gray-100" />
                                {impersonated_by ? (
                                    <div
                                        title="Cannot log out while impersonating a user"
                                        className="flex w-full cursor-not-allowed items-center px-4 py-2 text-left text-sm text-gray-300 select-none"
                                    >
                                        <span>Log Out</span>
                                        <span className="ml-auto text-xs text-amber-400">(impersonating)</span>
                                    </div>
                                ) : (
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                )}
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {/* ── Tab bar ── */}
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
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 w-full rounded-t-full transition-colors ${
                                            active ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-gray-200'
                                        }`}
                                    />
                                </>
                            );

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
            <div
                style={{ paddingTop: totalOffset }}
                className="lg:pl-64"
            >
                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}