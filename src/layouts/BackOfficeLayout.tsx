import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    FileText, Building2,
    ShoppingCart, BarChart3, Users, Settings, Store, Utensils,
    ChevronLeft, ChevronRight, LogOut, Truck, UserCircle, Coffee, Boxes,
    Shield, ScrollText, CloudCog, Calculator, LayoutDashboard, Receipt
} from 'lucide-react';
import { NetworkIndicator } from '../components/ui/NetworkIndicator';
import { SyncIndicator } from '../components/ui/SyncIndicator';
import { PendingSyncCounter } from '../components/sync/PendingSyncCounter';
import { PostOfflineSyncReport } from '../components/sync/PostOfflineSyncReport';
import { StockAlertsBadge } from '../components/inventory/StockAlertsBadge';
import { NotificationBell } from '../components/ui/NotificationBell';
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
        <div className="flex h-screen w-screen bg-[var(--theme-bg-primary)] overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    'bo-sidebar flex flex-col h-full shrink-0 z-50 relative',
                    'bg-[var(--theme-bg-primary)] border-r border-white/5',
                    'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    isCollapsed ? 'w-[88px]' : 'w-64',
                    'max-md:fixed max-md:left-0 max-md:top-0 max-md:z-[100]'
                )}
            >
                {/* Header / Logo */}
                <div
                    className={cn(
                        'h-[88px] flex items-center border-b border-white/5',
                        isCollapsed ? 'justify-center p-0' : 'px-8'
                    )}
                >
                    {!isCollapsed ? (
                        <div className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                            <h1 className="font-display text-2xl italic font-semibold text-[var(--color-gold)]">
                                The Breakery
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--muted-smoke)] mt-1 opacity-70">
                                Artisanal Bakery System
                            </p>
                        </div>
                    ) : (
                        <span className="font-display text-xl italic font-semibold text-[var(--color-gold)]">
                            B
                        </span>
                    )}
                </div>

                {/* Status indicators */}
                <div className={cn('px-4 py-2 flex flex-col gap-1 border-b border-white/5', isCollapsed && 'items-center')}>
                    <NetworkIndicator compact={isCollapsed} className="" />
                    <SyncIndicator compact={isCollapsed} className="" />
                    <PendingSyncCounter className="" />
                    <NotificationBell compact={isCollapsed} className="" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden flex flex-col gap-6 custom-scrollbar">
                    <div className="flex flex-col gap-1">
                        {!isCollapsed && (
                            <p className="px-4 text-[10px] font-semibold text-[var(--muted-smoke)] uppercase tracking-wider mb-2 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                Operations
                            </p>
                        )}
                        <NavLink to="/" end className="bo-nav-item" title={isCollapsed ? "Dashboard" : ""} data-collapsed={isCollapsed || undefined}>
                            <LayoutDashboard size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Dashboard</span>}
                        </NavLink>
                        <NavLink to="/pos" className="bo-nav-item" title={isCollapsed ? "POS Terminal" : ""} data-collapsed={isCollapsed || undefined}>
                            <Store size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">POS Terminal</span>}
                        </NavLink>
                        <NavLink to="/kds" className="bo-nav-item" title={isCollapsed ? "Kitchen Display" : ""} data-collapsed={isCollapsed || undefined}>
                            <Utensils size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Kitchen Display</span>}
                        </NavLink>
                    </div>

                    <div className="flex flex-col gap-1">
                        {!isCollapsed && (
                            <p className="px-4 text-[10px] font-semibold text-[var(--muted-smoke)] uppercase tracking-wider mb-2 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                Management
                            </p>
                        )}
                        <NavLink to="/products" className="bo-nav-item" title={isCollapsed ? "Products" : ""} data-collapsed={isCollapsed || undefined}>
                            <Coffee size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Products</span>}
                        </NavLink>
                        <NavLink to="/inventory" className="bo-nav-item" title={isCollapsed ? "Stock & Inventory" : ""} data-collapsed={isCollapsed || undefined}>
                            <Boxes size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Stock & Inventory</span>}
                            <StockAlertsBadge className={isCollapsed ? '' : 'ml-auto'} />
                        </NavLink>
                        <NavLink to="/orders" className="bo-nav-item" title={isCollapsed ? "Order History" : ""} data-collapsed={isCollapsed || undefined}>
                            <FileText size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Order History</span>}
                        </NavLink>
                        <NavLink to="/b2b" className="bo-nav-item" title={isCollapsed ? "B2B Wholesale" : ""} data-collapsed={isCollapsed || undefined}>
                            <Building2 size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">B2B Wholesale</span>}
                        </NavLink>
                        <NavLink to="/purchasing/purchase-orders" className="bo-nav-item" title={isCollapsed ? "Purchases" : ""} data-collapsed={isCollapsed || undefined}>
                            <ShoppingCart size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Purchases</span>}
                        </NavLink>
                        <NavLink to="/purchasing/suppliers" className="bo-nav-item" title={isCollapsed ? "Suppliers" : ""} data-collapsed={isCollapsed || undefined}>
                            <Truck size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Suppliers</span>}
                        </NavLink>
                        <NavLink to="/expenses" className="bo-nav-item" title={isCollapsed ? "Expenses" : ""} data-collapsed={isCollapsed || undefined}>
                            <Receipt size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Expenses</span>}
                        </NavLink>
                        <NavLink to="/customers" className="bo-nav-item" title={isCollapsed ? "Customers" : ""} data-collapsed={isCollapsed || undefined}>
                            <UserCircle size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Customers</span>}
                        </NavLink>
                    </div>

                    <div className="flex flex-col gap-1">
                        {!isCollapsed && (
                            <p className="px-4 text-[10px] font-semibold text-[var(--muted-smoke)] uppercase tracking-wider mb-2 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                Admin
                            </p>
                        )}
                        <NavLink to="/reports" className="bo-nav-item" title={isCollapsed ? "Reports" : ""} data-collapsed={isCollapsed || undefined}>
                            <BarChart3 size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Reports</span>}
                        </NavLink>
                        <NavLink to="/accounting" className="bo-nav-item" title={isCollapsed ? "Accounting" : ""} data-collapsed={isCollapsed || undefined}>
                            <Calculator size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Accounting</span>}
                        </NavLink>
                        <NavLink to="/users" className="bo-nav-item" title={isCollapsed ? "Users" : ""} data-collapsed={isCollapsed || undefined}>
                            <Users size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Users</span>}
                        </NavLink>
                        <NavLink to="/settings" className="bo-nav-item" title={isCollapsed ? "Settings" : ""} data-collapsed={isCollapsed || undefined}>
                            <Settings size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Settings</span>}
                        </NavLink>
                        <NavLink to="/settings/roles" className="bo-nav-item" title={isCollapsed ? "Roles" : ""} data-collapsed={isCollapsed || undefined}>
                            <Shield size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Roles</span>}
                        </NavLink>
                        <NavLink to="/settings/audit" className="bo-nav-item" title={isCollapsed ? "Audit" : ""} data-collapsed={isCollapsed || undefined}>
                            <ScrollText size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Audit</span>}
                        </NavLink>
                        <NavLink to="/settings/sync" className="bo-nav-item" title={isCollapsed ? "Sync" : ""} data-collapsed={isCollapsed || undefined}>
                            <CloudCog size={20} strokeWidth={1.8} />
                            {!isCollapsed && <span className="animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">Sync</span>}
                        </NavLink>
                    </div>
                </nav>

                {/* Footer / Toggle + User */}
                <div className="p-4 border-t border-white/5 flex flex-col gap-3">
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            'w-8 h-8 flex items-center justify-center rounded-md cursor-pointer',
                            'border border-white/10 text-[var(--muted-smoke)]',
                            'transition-all duration-200 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
                            isCollapsed ? 'self-center' : 'self-end'
                        )}
                        title={isCollapsed ? "Expand menu" : "Collapse menu"}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    <div className="flex items-center justify-center min-h-[50px]">
                        {!isCollapsed ? (
                            <div className="flex items-center gap-3 w-full p-3 bg-[var(--onyx-surface)] rounded-xl border border-white/5 animate-[sidebarFadeIn_0.3s_ease-in-out_forwards]">
                                <NavLink
                                    to="/profile"
                                    className="w-10 h-10 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-[var(--theme-bg-primary)] font-bold text-sm shrink-0"
                                    title="My Profile"
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </NavLink>
                                <NavLink to="/profile" className="flex flex-col flex-1 overflow-hidden" title="My Profile">
                                    <span className="text-xs font-semibold text-[var(--theme-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                                        {user?.display_name || user?.name}
                                    </span>
                                    <span className="text-[10px] text-[var(--muted-smoke)] uppercase">
                                        {user?.role}
                                    </span>
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="text-[var(--muted-smoke)] hover:text-[var(--color-gold)] transition-colors bg-transparent border-none cursor-pointer p-1.5 rounded"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center border-none bg-transparent text-[var(--muted-smoke)] cursor-pointer rounded-md transition-all duration-200 hover:text-[var(--color-danger)]"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="bo-content flex-1 overflow-y-auto bg-[var(--theme-bg-primary)] relative">
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

            {/* Scoped styles for nav items and tooltips */}
            <style>{`
                @keyframes sidebarFadeIn {
                    from { opacity: 0; transform: translateX(-5px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Nav items — Stitch Luxe Dark pattern */
                .bo-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.625rem 1rem;
                    color: var(--theme-text-secondary);
                    text-decoration: none;
                    border-radius: var(--radius-md);
                    transition: all 0.2s ease;
                    font-family: var(--font-body);
                    font-weight: 500;
                    font-size: var(--text-sm);
                    white-space: nowrap;
                    position: relative;
                    height: 44px;
                    border-right: 2px solid transparent;
                }
                .bo-nav-item[data-collapsed] {
                    justify-content: center;
                    padding: 0;
                    width: 48px;
                    margin: 0 auto;
                    border-right: none;
                }
                .bo-nav-item:hover {
                    color: var(--color-gold);
                    background: rgba(201, 165, 92, 0.03);
                }
                .bo-nav-item.active {
                    color: var(--color-gold);
                    background: rgba(201, 165, 92, 0.05);
                    border-right-color: var(--color-gold);
                }
                .bo-nav-item[data-collapsed].active {
                    border-right: none;
                    background: rgba(201, 165, 92, 0.08);
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
                    background: var(--onyx-surface);
                    color: var(--theme-text-primary);
                    padding: 0.5rem 0.75rem;
                    border-radius: var(--radius-md);
                    font-size: var(--text-xs);
                    font-weight: 500;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    z-index: 100;
                    border: 1px solid rgba(255,255,255,0.05);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
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
