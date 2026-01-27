/**
 * Mobile Layout Component
 * Epic 6 - Application Mobile Serveurs
 *
 * Layout wrapper for mobile server app with bottom navigation.
 */

import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ClipboardList,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useMobileStore } from '@/stores/mobileStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import './MobileLayout.css';

/**
 * Navigation item
 */
interface INavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

/**
 * Mobile Layout with bottom navigation
 */
export default function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isSessionValid, userName, sentOrders, logout } = useMobileStore();
  const { isOnline } = useNetworkStatus();

  // Check session validity
  useEffect(() => {
    if (!isAuthenticated || !isSessionValid()) {
      navigate('/mobile/login');
    }
  }, [isAuthenticated, isSessionValid, navigate]);

  // Count orders that are ready (for badge)
  const readyOrdersCount = sentOrders.filter((o) => o.status === 'ready').length;

  const navItems: INavItem[] = [
    {
      path: '/mobile',
      label: 'Accueil',
      icon: <Home size={24} />,
    },
    {
      path: '/mobile/catalog',
      label: 'Produits',
      icon: <ShoppingBag size={24} />,
    },
    {
      path: '/mobile/orders',
      label: 'Commandes',
      icon: <ClipboardList size={24} />,
      badge: readyOrdersCount > 0 ? readyOrdersCount : undefined,
    },
    {
      path: '/mobile/profile',
      label: 'Profil',
      icon: <User size={24} />,
    },
  ];

  const isActivePath = (path: string) => {
    if (path === '/mobile') {
      return location.pathname === '/mobile' || location.pathname === '/mobile/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/mobile/login');
  };

  // If not authenticated, don't render layout
  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="mobile-layout">
      {/* Header */}
      <header className="mobile-header">
        <div className="mobile-header__brand">
          <span className="mobile-header__logo">🥐</span>
          <span className="mobile-header__title">The Breakery</span>
        </div>
        <div className="mobile-header__status">
          {isOnline ? (
            <Wifi size={20} className="mobile-header__icon mobile-header__icon--online" />
          ) : (
            <WifiOff size={20} className="mobile-header__icon mobile-header__icon--offline" />
          )}
        </div>
        <div className="mobile-header__user" onClick={handleLogout}>
          <span>{userName}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-main">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`mobile-nav__item ${isActivePath(item.path) ? 'mobile-nav__item--active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="mobile-nav__icon">
              {item.icon}
              {item.badge && (
                <span className="mobile-nav__badge">{item.badge}</span>
              )}
            </div>
            <span className="mobile-nav__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
