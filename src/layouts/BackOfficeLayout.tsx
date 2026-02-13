import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    FileText, Building2,
    ShoppingCart, BarChart3, Users, Settings, Store, Utensils,
    ChevronLeft, ChevronRight, LogOut, Truck, UserCircle, Coffee, Boxes,
    Shield, ScrollText, CloudCog, Calculator, LayoutDashboard
} from 'lucide-react';
import { NetworkIndicator } from '../components/ui/NetworkIndicator';
import { SyncIndicator } from '../components/ui/SyncIndicator';
import { PendingSyncCounter } from '../components/sync/PendingSyncCounter';
import { PostOfflineSyncReport } from '../components/sync/PostOfflineSyncReport';
import { StockAlertsBadge } from '../components/inventory/StockAlertsBadge';
import { useNetworkAlerts } from '../hooks/useNetworkAlerts';
import { useSyncReport } from '../hooks/useSyncReport';
import { cn } from '@/lib/utils';

const BackOfficeLayout: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Enable network status alerts (Story 3.2)
    useNetworkAlerts();

    // Enable post-offline sync report modal (Story 3.3)
    const { showReport, period, dismissReport, retryFailed } = useSyncReport();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex h-screen w-screen bg-cream overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    'bo-sidebar flex flex-col h-full shrink-0 z-50 relative border-r border-parchment',
                    'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    'shadow-[2px_0_12px_rgba(45,42,36,0.06)]',
                    isCollapsed ? 'w-[88px]' : 'w-[280px]',
                    'max-md:fixed max-md:left-0 max-md:top-0 max-md:z-[100]'
                )}
                style={{
                    background: 'linear-gradient(180deg, var(--color-flour) 0%, var(--color-kraft) 100%)',
                }}
            >
                {/* Header */}
                <div
                    className={cn(
                        'h-[88px] flex items-center border-b border-parchment bg-flour',
                        isCollapsed ? 'justify-center p-0' : 'px-xl'
                    )}
                >
                    <div className="flex items-center gap-md overflow-hidden whitespace-nowrap">
                        <div
                            className="flex items-center justify-center text-[2rem] transition-all duration-300 text-white p-2 rounded-xl shadow-lg shadow-gold/20"
                            style={{ background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)' }}
                        >
                            <Utensils size={isCollapsed ? 24 : 28} />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                <h1 className="text-lg font-bold tracking-tight text-gray-900">The Breakery</h1>
                                <span className="badge badge-neutral text-xs px-2 py-0.5 mt-1">Back Office</span>
                            </div>
                        )}
                    </div>
                    {/* Network Status Indicator - Always visible per NFR-U4 */}
                    <NetworkIndicator compact={isCollapsed} className="mt-2" />
                    {/* Sync Status Indicator - Story 2.6 */}
                    <SyncIndicator compact={isCollapsed} className="mt-1" />
                    {/* Pending Sync Counter - Story 3.8 */}
                    <PendingSyncCounter className="mt-1" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-lg py-xl overflow-y-auto overflow-x-hidden flex flex-col gap-2xl custom-scrollbar">
                    <div className="flex flex-col gap-xs">
                        {!isCollapsed && (
                            <h3 className="font-body text-[0.65rem] uppercase text-stone tracking-[0.12em] font-bold mb-sm pl-md h-5 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                Operations
                            </h3>
                        )}
                        <NavLink to="/" end className="bo-nav-item" title={isCollapsed ? "Dashboard" : ""} data-collapsed={isCollapsed || undefined}>
                            <LayoutDashboard size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Dashboard</span>}
                        </NavLink>
                        <NavLink to="/pos" className="bo-nav-item" title={isCollapsed ? "POS Terminal" : ""} data-collapsed={isCollapsed || undefined}>
                            <Store size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">POS Terminal</span>}
                        </NavLink>
                        <NavLink to="/kds" className="bo-nav-item" title={isCollapsed ? "Kitchen Display" : ""} data-collapsed={isCollapsed || undefined}>
                            <Utensils size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Kitchen Display</span>}
                        </NavLink>
                    </div>

                    <div className="flex flex-col gap-xs">
                        {!isCollapsed && (
                            <h3 className="font-body text-[0.65rem] uppercase text-stone tracking-[0.12em] font-bold mb-sm pl-md h-5 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                Management
                            </h3>
                        )}
                        <NavLink to="/products" className="bo-nav-item" title={isCollapsed ? "Products" : ""} data-collapsed={isCollapsed || undefined}>
                            <Coffee size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Products</span>}
                        </NavLink>
                        <NavLink to="/inventory" className="bo-nav-item" title={isCollapsed ? "Stock & Inventory" : ""} data-collapsed={isCollapsed || undefined}>
                            <Boxes size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Stock & Inventory</span>}
                            <StockAlertsBadge className={isCollapsed ? '' : 'ml-auto'} />
                        </NavLink>
                        <NavLink to="/orders" className="bo-nav-item" title={isCollapsed ? "Order History" : ""} data-collapsed={isCollapsed || undefined}>
                            <FileText size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Order History</span>}
                        </NavLink>
                        <NavLink to="/b2b" className="bo-nav-item" title={isCollapsed ? "B2B Wholesale" : ""} data-collapsed={isCollapsed || undefined}>
                            <Building2 size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">B2B Wholesale</span>}
                        </NavLink>
                        <NavLink to="/purchasing/purchase-orders" className="bo-nav-item" title={isCollapsed ? "Purchases" : ""} data-collapsed={isCollapsed || undefined}>
                            <ShoppingCart size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Purchases</span>}
                        </NavLink>
                        <NavLink to="/purchasing/suppliers" className="bo-nav-item" title={isCollapsed ? "Suppliers" : ""} data-collapsed={isCollapsed || undefined}>
                            <Truck size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Suppliers</span>}
                        </NavLink>
                        <NavLink to="/customers" className="bo-nav-item" title={isCollapsed ? "Customers" : ""} data-collapsed={isCollapsed || undefined}>
                            <UserCircle size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Customers</span>}
                        </NavLink>
                    </div>

                    <div className="flex flex-col gap-xs">
                        {!isCollapsed && (
                            <h3 className="font-body text-[0.65rem] uppercase text-stone tracking-[0.12em] font-bold mb-sm pl-md h-5 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                Admin
                            </h3>
                        )}
                        <NavLink to="/reports" className="bo-nav-item" title={isCollapsed ? "Reports" : ""} data-collapsed={isCollapsed || undefined}>
                            <BarChart3 size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Reports</span>}
                        </NavLink>
                        <NavLink to="/accounting" className="bo-nav-item" title={isCollapsed ? "Accounting" : ""} data-collapsed={isCollapsed || undefined}>
                            <Calculator size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Accounting</span>}
                        </NavLink>
                        <NavLink to="/users" className="bo-nav-item" title={isCollapsed ? "Users" : ""} data-collapsed={isCollapsed || undefined}>
                            <Users size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Users</span>}
                        </NavLink>
                        <NavLink to="/settings" className="bo-nav-item" title={isCollapsed ? "Settings" : ""} data-collapsed={isCollapsed || undefined}>
                            <Settings size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Settings</span>}
                        </NavLink>
                        <NavLink to="/settings/roles" className="bo-nav-item" title={isCollapsed ? "Roles" : ""} data-collapsed={isCollapsed || undefined}>
                            <Shield size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Roles</span>}
                        </NavLink>
                        <NavLink to="/settings/audit" className="bo-nav-item" title={isCollapsed ? "Audit" : ""} data-collapsed={isCollapsed || undefined}>
                            <ScrollText size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Audit</span>}
                        </NavLink>
                        <NavLink to="/settings/sync" className="bo-nav-item" title={isCollapsed ? "Sync" : ""} data-collapsed={isCollapsed || undefined}>
                            <CloudCog size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Sync</span>}
                        </NavLink>
                    </div>
                </nav>

                {/* Footer / Toggle */}
                <div className="p-lg border-t border-parchment bg-flour flex flex-col gap-md">
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            'w-8 h-8 flex items-center justify-center border border-parchment bg-flour rounded-md text-stone cursor-pointer',
                            'transition-all duration-200 hover:border-gold hover:text-gold hover:bg-[var(--color-primary-50)]',
                            isCollapsed ? 'self-center' : 'self-end'
                        )}
                        title={isCollapsed ? "Expand menu" : "Collapse menu"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <div className="flex items-center justify-center min-h-[50px]">
                        {!isCollapsed ? (
                            <div className="flex items-center gap-md w-full p-[0.625rem] bg-kraft rounded-lg border border-parchment animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                <NavLink
                                    to="/profile"
                                    className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm text-white shrink-0 shadow-[0_2px_6px_rgba(201,165,92,0.3)]"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                    }}
                                    title="My Profile"
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </NavLink>
                                <NavLink to="/profile" className="flex flex-col flex-1 overflow-hidden" title="My Profile">
                                    <span className="font-body font-semibold text-[0.8125rem] text-charcoal whitespace-nowrap overflow-hidden text-ellipsis">
                                        {user?.display_name || user?.name}
                                    </span>
                                    <span className="font-body text-[0.6875rem] text-stone capitalize">
                                        {user?.role}
                                    </span>
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="bg-none border-none text-stone cursor-pointer p-[0.375rem] rounded-sm transition-all duration-200 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center border-none bg-transparent text-stone cursor-pointer rounded-md transition-all duration-200 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="bo-content flex-1 overflow-y-auto bg-cream relative">
                <Outlet />
            </main>

            {/* Post-Offline Sync Report Modal (Story 3.3) */}
            {showReport && period && (
                <PostOfflineSyncReport
                    period={period}
                    onClose={dismissReport}
                    onRetryFailed={retryFailed}
                />
            )}

            {/* Scoped styles for pseudo-elements, tooltips, and complex selectors */}
            <style>{`
                @keyframes sidebarFadeIn {
                    from { opacity: 0; transform: translateX(-5px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Sidebar gold accent line */
                .bo-sidebar::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 3px;
                    height: 100%;
                    background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-dark) 50%, var(--color-gold) 100%);
                    opacity: 0.6;
                }
                .bo-sidebar.w-\\[88px\\]::before {
                    display: none;
                }

                /* Content grain texture */
                .bo-content::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.02;
                    pointer-events: none;
                    z-index: 0;
                }
                .bo-content > * {
                    position: relative;
                    z-index: 1;
                }

                /* Nav items */
                .bo-nav-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: 0.75rem 1rem;
                    color: var(--color-smoke);
                    text-decoration: none;
                    border-radius: var(--radius-md);
                    transition: all 0.2s ease;
                    font-family: var(--font-body);
                    font-weight: 500;
                    font-size: var(--text-sm);
                    white-space: nowrap;
                    position: relative;
                    height: 48px;
                    border: 1px solid transparent;
                }
                .bo-nav-item[data-collapsed] {
                    justify-content: center;
                    padding: 0;
                    width: 48px;
                    margin: 0 auto;
                }
                .bo-nav-item:hover {
                    background: var(--color-kraft);
                    color: var(--color-charcoal);
                    border-color: var(--color-parchment);
                }
                .bo-nav-item.active {
                    background: linear-gradient(135deg, rgba(201,165,92,0.12) 0%, rgba(201,165,92,0.06) 100%);
                    color: var(--color-gold-dark);
                    border-color: var(--color-gold);
                }
                .bo-nav-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 24px;
                    background: var(--color-gold);
                    border-radius: 0 2px 2px 0;
                }
                .bo-nav-item[data-collapsed].active::before {
                    display: none;
                }
                .bo-nav-item svg {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                }
                .bo-nav-item.active svg {
                    color: var(--color-gold);
                }

                /* Tooltip for collapsed state */
                .bo-nav-item[data-collapsed]::after {
                    content: attr(title);
                    position: absolute;
                    left: calc(100% + 8px);
                    top: 50%;
                    transform: translateY(-50%);
                    background: var(--color-charcoal);
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: var(--radius-md);
                    font-size: var(--text-xs);
                    font-weight: 500;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    z-index: 100;
                    box-shadow: var(--shadow-md);
                }
                .bo-nav-item[data-collapsed]:hover::after {
                    opacity: 1;
                    visibility: visible;
                }

                @media (max-width: 768px) {
                    .bo-sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    .bo-sidebar.open {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default BackOfficeLayout;
