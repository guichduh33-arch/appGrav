import { Save } from 'lucide-react';

interface SettingsGeneralTabProps {
  settings: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    timezone: string;
    currency: string;
    autoLogout: boolean;
  };
  onSettingsChange: (settings: SettingsGeneralTabProps['settings']) => void;
}

const SettingsGeneralTab = ({ settings, onSettingsChange }: SettingsGeneralTabProps) => {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-display font-bold text-white mb-1">Store Information</h2>
        <p className="text-sm text-[var(--theme-text-muted)]">
          General settings for your establishment
        </p>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2" htmlFor="store-name">Store Name</label>
          <input
            id="store-name"
            type="text"
            className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
            value={settings.storeName}
            onChange={(e) => onSettingsChange({ ...settings, storeName: e.target.value })}
          />
        </div>
        <div className="mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2" htmlFor="store-address">Address</label>
          <input
            id="store-address"
            type="text"
            className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
            value={settings.storeAddress}
            onChange={(e) => onSettingsChange({ ...settings, storeAddress: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2" htmlFor="store-phone">Phone</label>
            <input
              id="store-phone"
              type="tel"
              className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
              value={settings.storePhone}
              onChange={(e) => onSettingsChange({ ...settings, storePhone: e.target.value })}
            />
          </div>
          <div className="mb-6">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2" htmlFor="store-timezone">Timezone</label>
            <select
              id="store-timezone"
              className="w-full h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all appearance-none cursor-pointer"
              value={settings.timezone}
              onChange={(e) => onSettingsChange({ ...settings, timezone: e.target.value })}
              aria-label="Timezone"
            >
              <option value="Asia/Jakarta">Jakarta (WIB)</option>
              <option value="Asia/Makassar">Makassar (WITA)</option>
              <option value="Asia/Jayapura">Jayapura (WIT)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6">
          <button className="px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-all">Cancel</button>
          <button className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110">
            <Save size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsGeneralTab;
