import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    FileText, Building2,
    ShoppingCart, BarChart3, Users, Settings, Store, Utensils,
    ChevronLeft, ChevronRight, LogOut, Truck, UserCircle, Coffee, Boxes,
    Shield, ScrollText
} from 'lucide-react';
import './BackOfficeLayout.css';

const BackOfficeLayout: React.FC = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

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
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav custom-scrollbar">
                    <div className="nav-section">
                        {!isCollapsed && <h3 className="section-title fade-in">{t('nav.operations')}</h3>}
                        <NavLink to="/pos" className="nav-item" title={isCollapsed ? t('nav.pos_terminal') : ""}>
                            <Store size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.pos_terminal')}</span>}
                        </NavLink>
                        <NavLink to="/kds" className="nav-item" title={isCollapsed ? t('nav.kitchen_display') : ""}>
                            <Utensils size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.kitchen_display')}</span>}
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        {!isCollapsed && <h3 className="section-title fade-in">{t('nav.management')}</h3>}
                        <NavLink to="/products" className="nav-item" title={isCollapsed ? "Produits" : ""}>
                            <Coffee size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Produits</span>}
                        </NavLink>
                        <NavLink to="/inventory" className="nav-item" title={isCollapsed ? t('nav.stock_inventory') : ""}>
                            <Boxes size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.stock_inventory')}</span>}
                        </NavLink>
                        <NavLink to="/orders" className="nav-item" title={isCollapsed ? t('nav.order_history') : ""}>
                            <FileText size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.order_history')}</span>}
                        </NavLink>
                        <NavLink to="/b2b" className="nav-item" title={isCollapsed ? t('nav.b2b_wholesale') : ""}>
                            <Building2 size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.b2b_wholesale')}</span>}
                        </NavLink>
                        <NavLink to="/purchasing/purchase-orders" className="nav-item" title={isCollapsed ? t('nav.purchases') : ""}>
                            <ShoppingCart size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.purchases')}</span>}
                        </NavLink>
                        <NavLink to="/purchasing/suppliers" className="nav-item" title={isCollapsed ? "Fournisseurs" : ""}>
                            <Truck size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Fournisseurs</span>}
                        </NavLink>
                        <NavLink to="/customers" className="nav-item" title={isCollapsed ? "Clients" : ""}>
                            <UserCircle size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">Clients</span>}
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        {!isCollapsed && <h3 className="section-title fade-in">{t('nav.admin')}</h3>}
                        <NavLink to="/reports" className="nav-item" title={isCollapsed ? t('nav.reports') : ""}>
                            <BarChart3 size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.reports')}</span>}
                        </NavLink>
                        <NavLink to="/users" className="nav-item" title={isCollapsed ? t('nav.team') : ""}>
                            <Users size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.team')}</span>}
                        </NavLink>
                        <NavLink to="/settings" className="nav-item" title={isCollapsed ? t('nav.settings') : ""}>
                            <Settings size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.settings')}</span>}
                        </NavLink>
                        <NavLink to="/settings/roles" className="nav-item" title={isCollapsed ? t('nav.roles') : ""}>
                            <Shield size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.roles') || 'Rôles'}</span>}
                        </NavLink>
                        <NavLink to="/settings/audit" className="nav-item" title={isCollapsed ? t('nav.audit') : ""}>
                            <ScrollText size={22} strokeWidth={2} />
                            {!isCollapsed && <span className="fade-in">{t('nav.audit') || 'Audit'}</span>}
                        </NavLink>
                    </div>
                </nav>

                {/* Footer / Toggle */}
                <div className="sidebar-footer">
                    <button
                        onClick={toggleSidebar}
                        className="toggle-btn"
                        title={isCollapsed ? t('nav.expand_menu') : t('nav.collapse_menu')}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <div className="user-section">
                        {!isCollapsed ? (
                            <div className="user-info fade-in">
                                <NavLink to="/profile" className="user-avatar-sm" title={t('nav.profile') || 'Mon profil'}>
                                    {user?.name?.charAt(0) || 'U'}
                                </NavLink>
                                <NavLink to="/profile" className="user-details" title={t('nav.profile') || 'Mon profil'}>
                                    <span className="user-name">{user?.display_name || user?.name}</span>
                                    <span className="user-role">{user?.role}</span>
                                </NavLink>
                                <button onClick={handleLogout} className="logout-btn-mini" title={t('common.logout')}>
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleLogout} className="logout-btn-icon" title={t('common.logout')}>
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
        </div>
    );
};

export default BackOfficeLayout;
