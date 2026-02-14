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
  Wifi,
  Tags,
  Banknote,
  PackageSearch,
  Heart,
  Building,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { useSettingsCategories, useInitializeSettings } from '../../hooks/settings';
import { cn } from '@/lib/utils';

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
  pos_config: <ShoppingCart size={18} />,
  financial: <Banknote size={18} />,
  inventory_config: <PackageSearch size={18} />,
  loyalty: <Heart size={18} />,
  b2b: <Building size={18} />,
  kds_config: <ChefHat size={18} />,
  display: <Monitor size={18} />,
  sync_advanced: <RefreshCw size={18} />,
};

// Additional static tabs not in categories
const EXTRA_TABS = [
  { code: 'payments', path: 'payments', icon: <Wallet size={18} /> },
  { code: 'hours', path: 'hours', icon: <Clock size={18} /> },
  { code: 'categories', path: 'categories', icon: <Tags size={18} /> },
  { code: 'sections', path: 'sections', icon: <Layers size={18} /> },
  { code: 'floorplan', path: 'floorplan', icon: <Grid size={18} /> },
  { code: 'kds', path: 'kds', icon: <ChefHat size={18} /> },
  { code: 'history', path: 'history', icon: <History size={18} /> },
  { code: 'lan', path: 'lan', icon: <Wifi size={18} /> },
];

const EXTRA_TAB_NAMES: Record<string, { fr: string; en: string; id: string }> = {
  payments: { fr: 'Methodes de Paiement', en: 'Payment Methods', id: 'Metode Pembayaran' },
  hours: { fr: 'Horaires', en: 'Business Hours', id: 'Jam Buka' },
  categories: { fr: 'Categories', en: 'Categories', id: 'Kategori' },
  sections: { fr: 'Sections', en: 'Sections', id: 'Bagian' },
  floorplan: { fr: 'Plan de Salle', en: 'Floor Plan', id: 'Denah Lantai' },
  kds: { fr: 'Stations KDS', en: 'KDS Stations', id: 'Stasiun KDS' },
  history: { fr: 'Historique', en: 'History', id: 'Riwayat' },
  lan: { fr: 'Reseau LAN', en: 'LAN Network', id: 'Jaringan LAN' },
};

const NAV_BASE = 'w-full flex items-center gap-3 px-3 py-2.5 bg-transparent border-none rounded-lg text-sm font-medium text-[var(--theme-text-secondary)] cursor-pointer text-left transition-all duration-150 hover:bg-white/5 hover:text-white';
const NAV_ACTIVE = 'bg-[var(--color-gold)]/10 !text-[var(--color-gold)] border-r-2 border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 hover:!text-[var(--color-gold)]';

const SettingsLayout = () => {
  const { data: categories, isLoading } = useSettingsCategories();
  useInitializeSettings();

  const nameKey = 'name_en' as const;

  const getCategoryName = (category: { name_fr: string; name_en: string; name_id: string }) => {
    return category[nameKey] || category.name_en;
  };

  const getExtraTabName = (code: string) => {
    const names = EXTRA_TAB_NAMES[code];
    if (!names) return code;
    return names.en;
  };

  return (
    <div className="p-6 h-full overflow-y-auto min-h-screen bg-[var(--theme-bg-primary)] text-white">
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl font-bold text-white">Settings</h1>
      </header>

      <div className="grid grid-cols-[250px_1fr] gap-6 max-[900px]:grid-cols-1">
        {/* Navigation */}
        <nav className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-2 h-fit">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="w-6 h-6 border-[3px] border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {categories?.map((category) => (
                <NavLink
                  key={category.code}
                  to={`/settings/${category.code}`}
                  className={({ isActive }) =>
                    cn(NAV_BASE, isActive && NAV_ACTIVE)
                  }
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {CATEGORY_ICONS[category.code] || <Settings2 size={18} />}
                  </span>
                  {getCategoryName(category)}
                </NavLink>
              ))}

              {/* Divider */}
              <div className="h-px bg-white/5 my-2" />

              {/* Extra static tabs */}
              {EXTRA_TABS.map((tab) => (
                <NavLink
                  key={tab.code}
                  to={`/settings/${tab.path}`}
                  className={({ isActive }) =>
                    cn(NAV_BASE, isActive && NAV_ACTIVE)
                  }
                >
                  <span className="w-5 h-5 flex items-center justify-center">{tab.icon}</span>
                  {getExtraTabName(tab.code)}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
