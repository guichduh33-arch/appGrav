import { Save } from 'lucide-react';

interface SettingsSecurityTabProps {
  autoLogout: boolean;
  onToggleAutoLogout: () => void;
}

const SettingsSecurityTab = ({ autoLogout, onToggleAutoLogout }: SettingsSecurityTabProps) => {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-display font-bold text-white mb-1">Security</h2>
        <p className="text-sm text-[var(--theme-text-muted)]">
          Security options and access control
        </p>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Auto Logout</span>
            <span className="text-xs text-[var(--theme-text-muted)] mt-0.5">
              Disconnect after 30 minutes of inactivity
            </span>
          </div>
          <div
            className={`relative w-12 h-7 rounded-[14px] cursor-pointer transition-all duration-150
              ${autoLogout ? 'bg-[var(--color-gold)]' : 'bg-white/10'}
              after:content-[""] after:absolute after:top-[3px] after:left-[3px] after:w-[22px] after:h-[22px] after:rounded-full after:bg-white after:shadow-sm after:transition-all after:duration-150
              ${autoLogout ? 'after:left-[23px]' : ''}`}
            onClick={onToggleAutoLogout}
          />
        </div>

        <div className="mt-6 mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2" htmlFor="manager-pin">Manager PIN Code</label>
          <input
            id="manager-pin"
            type="password"
            className="w-full max-w-[200px] h-12 px-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
            placeholder="****"
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-white/5">
          <button className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-all hover:brightness-110">
            <Save size={18} />
            Change PIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurityTab;
