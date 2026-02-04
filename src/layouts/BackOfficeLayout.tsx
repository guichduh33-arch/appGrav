import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    FileText, Building2,
    ShoppingCart, BarChart3, Users, Settings, Store, Utensils,
    ChevronLeft, ChevronRight, LogOut, Truck, UserCircle, Coffee, Boxes,
    Shield, ScrollText, CloudCog
} from 'lucide-react';
import { NetworkIndicator } from '../components/ui/NetworkIndicator';
import { SyncIndicator } from '../components/ui/SyncIndicator';
import { PendingSyncCounter } from '../components/sync/PendingSyncCounter';
import { PostOfflineSyncReport } from '../components/sync/PostOfflineSyncReport';
import { StockAlertsBadge } from '../components/inventory/StockAlertsBadge';
import { useNetworkAlerts } from '../hooks/useNetworkAlerts';
import { useSyncReport } from '../hooks/useSyncReport';
import './BackOfficeLayout.css';

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
        <div className="backoffice-layout">
            {/* Sidebar */}
            <aside className={`backoffice-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
                            <Utensils size={isCollapsed ? 24 : 28} />
                        </div>
                        {!isCollapsed && (
                            <div className="logo-text fade-in">
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
                <nav className="sidebar-nav custom-scrollbar">
                    <div className="nav-section">
                        {!isCollapsed && <h3 className="section-title fade-in">Operations</h3>}
                        <NavLink to="/pos" className="nav-item" title={isCollapsed ? "POS Terminal" : ""}>
                            <Store size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">POS Terminal</span>}
                        </NavLink>
                        <NavLink to="/kds" className="nav-item" title={isCollapsed ? "Kitchen Display" : ""}>
                            <Utensils size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Kitchen Display</span>}
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        {!isCollapsed && <h3 className="section-title fade-in">Management</h3>}
                        <NavLink to="/products" className="nav-item" title={isCollapsed ? "Products" : ""}>
                            <Coffee size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Products</span>}
                        </NavLink>
                        <NavLink to="/inventory" className="nav-item" title={isCollapsed ? "Stock & Inventory" : ""}>
                            <Boxes size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Stock & Inventory</span>}
                            <StockAlertsBadge className={isCollapsed ? '' : 'ml-auto'} />
                        </NavLink>
                        <NavLink to="/orders" className="nav-item" title={isCollapsed ? "Order History" : ""}>
                            <FileText size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Order History</span>}
                        </NavLink>
                        <NavLink to="/b2b" className="nav-item" title={isCollapsed ? "B2B Wholesale" : ""}>
                            <Building2 size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">B2B Wholesale</span>}
                        </NavLink>
                        <NavLink to="/purchasing/purchase-orders" className="nav-item" title={isCollapsed ? "Purchases" : ""}>
                            <ShoppingCart size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Purchases</span>}
                        </NavLink>
                        <NavLink to="/purchasing/suppliers" className="nav-item" title={isCollapsed ? "Suppliers" : ""}>
                            <Truck size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Suppliers</span>}
                        </NavLink>
                        <NavLink to="/customers" className="nav-item" title={isCollapsed ? "Customers" : ""}>
                            <UserCircle size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Customers</span>}
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        {!isCollapsed && <h3 className="section-title fade-in">Admin</h3>}
                        <NavLink to="/reports" className="nav-item" title={isCollapsed ? "Reports" : ""}>
                            <BarChart3 size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Reports</span>}
                        </NavLink>
                        <NavLink to="/users" className="nav-item" title={isCollapsed ? "Users" : ""}>
                            <Users size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Users</span>}
                        </NavLink>
                        <NavLink to="/settings" className="nav-item" title={isCollapsed ? "Settings" : ""}>
                            <Settings size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Settings</span>}
                        </NavLink>
                        <NavLink to="/settings/roles" className="nav-item" title={isCollapsed ? "Roles" : ""}>
                            <Shield size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Roles</span>}
                        </NavLink>
                        <NavLink to="/settings/audit" className="nav-item" title={isCollapsed ? "Audit" : ""}>
                            <ScrollText size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Audit</span>}
                        </NavLink>
                        <NavLink to="/settings/sync" className="nav-item" title={isCollapsed ? "Sync" : ""}>
                            <CloudCog size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Sync</span>}
                        </NavLink>
                    </div>
                </nav>

                {/* Footer / Toggle */}
                <div className="sidebar-footer">
                    <button
                        onClick={toggleSidebar}
                        className="toggle-btn"
                        title={isCollapsed ? "Expand menu" : "Collapse menu"}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <div className="user-section">
                        {!isCollapsed ? (
                            <div className="user-info fade-in">
                                <NavLink to="/profile" className="user-avatar-sm" title="My Profile">
                                    {user?.name?.charAt(0) || 'U'}
                                </NavLink>
                                <NavLink to="/profile" className="user-details" title="My Profile">
                                    <span className="user-name">{user?.display_name || user?.name}</span>
                                    <span className="user-role">{user?.role}</span>
                                </NavLink>
                                <button onClick={handleLogout} className="logout-btn-mini" title="Logout">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleLogout} className="logout-btn-icon" title="Logout">
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="backoffice-content">
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
        </div>
    );
};

export default BackOfficeLayout;
