import { Outlet, NavLink } from 'react-router-dom';
import {
  Building2,
  ShoppingCart,
  Receipt,
  Package,
  Printer,
  Bell,
  Globe,
  Shield,
  Plug,
  Database,
  Palette,
  Settings2,
  Clock,
  History,
  Layers,
  ChefHat,
  Grid,
  Wallet,
} from 'lucide-react';
import { useSettingsCategories, useInitializeSettings } from '../../hooks/settings';
import './SettingsPage.css';

// Icon mapping for settings categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  company: <Building2 size={18} />,
  pos: <ShoppingCart size={18} />,
  tax: <Receipt size={18} />,
  inventory: <Package size={18} />,
  printing: <Printer size={18} />,
  notifications: <Bell size={18} />,
  localization: <Globe size={18} />,
  security: <Shield size={18} />,
  integrations: <Plug size={18} />,
  backup: <Database size={18} />,
  appearance: <Palette size={18} />,
  advanced: <Settings2 size={18} />,
};

// Additional static tabs not in categories
const EXTRA_TABS = [
  { code: 'payments', path: 'payments', icon: <Wallet size={18} /> },
  { code: 'hours', path: 'hours', icon: <Clock size={18} /> },
  { code: 'sections', path: 'sections', icon: <Layers size={18} /> },
  { code: 'floorplan', path: 'floorplan', icon: <Grid size={18} /> },
  { code: 'kds', path: 'kds', icon: <ChefHat size={18} /> },
  { code: 'history', path: 'history', icon: <History size={18} /> },
];

const EXTRA_TAB_NAMES: Record<string, { fr: string; en: string; id: string }> = {
  payments: { fr: 'Méthodes de Paiement', en: 'Payment Methods', id: 'Metode Pembayaran' },
  hours: { fr: 'Horaires', en: 'Business Hours', id: 'Jam Buka' },
  sections: { fr: 'Sections', en: 'Sections', id: 'Bagian' },
  floorplan: { fr: 'Plan de Salle', en: 'Floor Plan', id: 'Denah Lantai' },
  kds: { fr: 'Stations KDS', en: 'KDS Stations', id: 'Stasiun KDS' },
  history: { fr: 'Historique', en: 'History', id: 'Riwayat' },
};

const SettingsLayout = () => {
  const { data: categories, isLoading } = useSettingsCategories();
  // Default to English
  const lang = 'en';

  // Initialize settings store
  useInitializeSettings();

  const nameKey = 'name_en' as const;

  // Get category name based on language
  const getCategoryName = (category: { name_fr: string; name_en: string; name_id: string }) => {
    return category[nameKey] || category.name_en;
  };

  // Get extra tab name
  const getExtraTabName = (code: string) => {
    const names = EXTRA_TAB_NAMES[code];
    if (!names) return code;
    return names.en;
  };

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <h1 className="settings-page__title">Settings</h1>
      </header>

      <div className="settings-grid">
        {/* Navigation */}
        <nav className="settings-nav">
          {/* Dynamic categories from database */}
          {isLoading ? (
            <div className="settings-nav__loading">
              <div className="spinner" />
            </div>
          ) : (
            <>
              {categories?.map((category) => (
                <NavLink
                  key={category.code}
                  to={`/settings/${category.code}`}
                  className={({ isActive }) =>
                    `settings-nav__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="settings-nav__icon">
                    {CATEGORY_ICONS[category.code] || <Settings2 size={18} />}
                  </span>
                  {getCategoryName(category)}
                </NavLink>
              ))}

              {/* Divider */}
              <div className="settings-nav__divider" />

              {/* Extra static tabs */}
              {EXTRA_TABS.map((tab) => (
                <NavLink
                  key={tab.code}
                  to={`/settings/${tab.path}`}
                  className={({ isActive }) =>
                    `settings-nav__item ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="settings-nav__icon">{tab.icon}</span>
                  {getExtraTabName(tab.code)}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Content */}
        <div className="settings-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
