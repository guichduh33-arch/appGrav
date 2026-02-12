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
import { cn } from '@/lib/utils';

interface INavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isSessionValid, userName, sentOrders, logout } = useMobileStore();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isAuthenticated || !isSessionValid()) {
      navigate('/mobile/login');
    }
  }, [isAuthenticated, isSessionValid, navigate]);

  const readyOrdersCount = sentOrders.filter((o) => o.status === 'ready').length;

  const navItems: INavItem[] = [
    { path: '/mobile', label: 'Home', icon: <Home size={24} /> },
    { path: '/mobile/catalog', label: 'Products', icon: <ShoppingBag size={24} /> },
    { path: '/mobile/orders', label: 'Orders', icon: <ClipboardList size={24} />, badge: readyOrdersCount > 0 ? readyOrdersCount : undefined },
    { path: '/mobile/profile', label: 'Profile', icon: <User size={24} /> },
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

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-2 bg-white border-b border-border min-h-[56px] z-[100] supports-[padding:env(safe-area-inset-top)]:pt-[calc(0.5rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥐</span>
          <span className="font-semibold text-lg text-foreground">The Breakery</span>
        </div>
        <div className="ml-auto">
          {isOnline ? (
            <Wifi size={20} className="text-success transition-colors duration-200" />
          ) : (
            <WifiOff size={20} className="text-red-500 transition-colors duration-200" />
          )}
        </div>
        <div className="px-2 py-1 text-sm text-muted-foreground cursor-pointer" onClick={handleLogout}>
          <span>{userName}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom,0)]">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="flex bg-white border-t border-border pb-[env(safe-area-inset-bottom,0)] z-[100]">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-transparent border-none text-muted-foreground cursor-pointer transition-colors duration-200 min-h-[56px] min-w-[44px] active:bg-gray-100',
              isActivePath(item.path) && 'text-primary'
            )}
            onClick={() => navigate(item.path)}
          >
            <div className="relative flex items-center justify-center">
              {item.icon}
              {item.badge && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[0.625rem] font-bold px-[5px] py-0.5 rounded-full min-w-[16px] text-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
