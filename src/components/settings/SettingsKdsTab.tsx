import { ChefHat, Coffee, Monitor, X, RefreshCw } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  dispatch_station: 'barista' | 'kitchen' | 'display' | 'none' | null;
  is_active: boolean;
}

const DISPATCH_STATIONS = [
  { value: 'kitchen', label: 'Hot Kitchen', icon: <ChefHat size={16} />, color: '#EF4444' },
  { value: 'barista', label: 'Barista', icon: <Coffee size={16} />, color: '#8B5CF6' },
  { value: 'display', label: 'Display', icon: <Monitor size={16} />, color: '#10B981' },
  { value: 'none', label: 'No Station', icon: <X size={16} />, color: '#6B7280' },
];

interface SettingsKdsTabProps {
  categories: Category[];
  loadingCategories: boolean;
  savingCategory: string | null;
  onUpdateCategoryStation: (categoryId: string, newStation: string) => void;
}

const SettingsKdsTab = ({
  categories, loadingCategories, savingCategory, onUpdateCategoryStation,
}: SettingsKdsTabProps) => {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-display font-bold text-white mb-1">KDS Station Configuration</h2>
        <p className="text-sm text-[var(--theme-text-muted)]">
          Assign each product category to a specific KDS station
        </p>
      </div>
      <div className="p-6">
        {/* Station Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-white/[0.03] rounded-xl mb-6">
          {DISPATCH_STATIONS.map((station) => (
            <div key={station.value} className="flex items-center gap-2 text-sm text-[var(--theme-text-secondary)]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: station.color }} />
              <span className="flex items-center" style={{ color: station.color }}>
                {station.icon}
              </span>
              <span>{station.label}</span>
            </div>
          ))}
        </div>

        {loadingCategories ? (
          <div className="flex items-center justify-center gap-4 py-12 text-[var(--theme-text-muted)]">
            <RefreshCw size={24} className="animate-spin" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--theme-text-muted)]">
            <ChefHat size={48} className="opacity-30 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No categories found</h3>
            <p>Product categories will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const currentStation = DISPATCH_STATIONS.find(
                (s) => s.value === (category.dispatch_station || 'none')
              );
              return (
                <div key={category.id} className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-black/40 rounded-lg shadow-sm">{category.icon}</span>
                    <span className="font-semibold text-white text-[15px]">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2 max-[600px]:w-full">
                    <select
                      className="px-3.5 py-2 pr-8 border-2 rounded-lg text-sm font-medium bg-black/40 text-white appearance-none cursor-pointer transition-all min-w-[140px] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 disabled:opacity-60 disabled:cursor-not-allowed max-[600px]:w-full"
                      value={category.dispatch_station || 'none'}
                      onChange={(e) => onUpdateCategoryStation(category.id, e.target.value)}
                      aria-label={`Station for ${category.name}`}
                      disabled={savingCategory === category.id}
                      style={{
                        borderColor: currentStation?.color,
                        backgroundColor: `${currentStation?.color}15`,
                      }}
                    >
                      {DISPATCH_STATIONS.map((station) => (
                        <option key={station.value} value={station.value}>
                          {station.label}
                        </option>
                      ))}
                    </select>
                    {savingCategory === category.id && (
                      <RefreshCw size={16} className="animate-spin text-[var(--color-gold)]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsKdsTab;
