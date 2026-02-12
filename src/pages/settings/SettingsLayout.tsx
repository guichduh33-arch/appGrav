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
  payments: { fr: 'Méthodes de Paiement', en: 'Payment Methods', id: 'Metode Pembayaran' },
  hours: { fr: 'Horaires', en: 'Business Hours', id: 'Jam Buka' },
  categories: { fr: 'Catégories', en: 'Categories', id: 'Kategori' },
  sections: { fr: 'Sections', en: 'Sections', id: 'Bagian' },
  floorplan: { fr: 'Plan de Salle', en: 'Floor Plan', id: 'Denah Lantai' },
  kds: { fr: 'Stations KDS', en: 'KDS Stations', id: 'Stasiun KDS' },
  history: { fr: 'Historique', en: 'History', id: 'Riwayat' },
  lan: { fr: 'Réseau LAN', en: 'LAN Network', id: 'Jaringan LAN' },
};

const SettingsLayout = () => {
  const { data: categories, isLoading } = useSettingsCategories();

  // Initialize settings store
  useInitializeSettings();

  // Language is hardcoded to English (i18n suspended per CLAUDE.md)
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
    <div className="p-lg h-full overflow-y-auto bg-cream">
      <header className="flex items-center justify-between mb-lg">
        <h1 className="font-display text-4xl font-bold text-espresso">Settings</h1>
      </header>

      <div className="grid grid-cols-[250px_1fr] gap-lg max-[900px]:grid-cols-1">
        {/* Navigation */}
        <nav className="bg-white rounded-lg shadow p-sm h-fit">
          {/* Dynamic categories from database */}
          {isLoading ? (
            <div className="flex justify-center p-lg">
              <div className="w-6 h-6 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {categories?.map((category) => (
                <NavLink
                  key={category.code}
                  to={`/settings/${category.code}`}
                  className={({ isActive }) =>
                    cn(
                      'w-full flex items-center gap-sm p-md bg-transparent border-none rounded-md text-sm font-medium text-smoke cursor-pointer text-left transition-all duration-fast ease-standard hover:bg-cream hover:text-espresso',
                      isActive && 'bg-[var(--color-rose-poudre)] text-white hover:bg-[var(--color-rose-poudre)] hover:text-white'
                    )
                  }
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {CATEGORY_ICONS[category.code] || <Settings2 size={18} />}
                  </span>
                  {getCategoryName(category)}
                </NavLink>
              ))}

              {/* Divider */}
              <div className="h-px bg-border my-sm" />

              {/* Extra static tabs */}
              {EXTRA_TABS.map((tab) => (
                <NavLink
                  key={tab.code}
                  to={`/settings/${tab.path}`}
                  className={({ isActive }) =>
                    cn(
                      'w-full flex items-center gap-sm p-md bg-transparent border-none rounded-md text-sm font-medium text-smoke cursor-pointer text-left transition-all duration-fast ease-standard hover:bg-cream hover:text-espresso',
                      isActive && 'bg-[var(--color-rose-poudre)] text-white hover:bg-[var(--color-rose-poudre)] hover:text-white'
                    )
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
        <div className="flex flex-col gap-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
