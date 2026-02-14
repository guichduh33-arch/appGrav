import {
  Package,
  Factory,
  Users,
  ShoppingBag,
  Gift,
  ChefHat,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  useModuleSettings,
  useUpdateModuleSetting,
} from '../../hooks/settings';
import type { ModuleSettings } from '../../types/settings';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}

function ModuleCard({ icon, title, description, enabled, onToggle, children }: ModuleCardProps) {
  return (
    <div className={`bg-[var(--onyx-surface)] border rounded-xl p-5 transition-all ${enabled ? 'border-[var(--color-gold)]/30' : 'border-white/5 opacity-70'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${enabled ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'bg-white/5 text-[var(--theme-text-muted)]'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{description}</p>
        </div>
        <button
          className={`shrink-0 transition-colors ${enabled ? 'text-[var(--color-gold)]' : 'text-[var(--theme-text-muted)]'}`}
          onClick={() => onToggle(!enabled)}
          aria-label={enabled ? 'Disable' : 'Enable'}
        >
          {enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </button>
      </div>
      {enabled && children && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">{children}</div>
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function NumberInput({ label, value, onChange, min, max, step = 1, suffix }: NumberInputProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-24 h-8 px-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white text-right focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="text-xs text-[var(--theme-text-muted)]">{suffix}</span>}
      </div>
    </div>
  );
}

export default function ModuleSettingsSection() {
  const { data: settings, isLoading } = useModuleSettings();
  const updateSetting = useUpdateModuleSetting();

  const handleUpdate = (module: keyof ModuleSettings, key: string, value: unknown) => {
    updateSetting.mutate({ module, key, value });
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Package size={20} />
            Modules
          </h2>
        </div>
        <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
          <RefreshCw size={24} className="animate-spin mr-3" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Package size={20} />
          Modules
        </h2>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1">
          Enable or disable application modules
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Production Module */}
        <ModuleCard
          icon={<Factory size={24} />}
          title="Production"
          description="Production and recipe management"
          enabled={settings.production.enabled}
          onToggle={(v) => handleUpdate('production', 'enabled', v)}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Auto consume stock</span>
            <div
              className={`w-10 h-6 rounded-full cursor-pointer transition-all relative shrink-0 after:content-[""] after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:shadow-sm after:transition-all ${settings.production.auto_consume_stock ? 'bg-[var(--color-gold)] after:left-[19px]' : 'bg-white/10'}`}
              onClick={() => handleUpdate('production', 'auto_consume_stock', !settings.production.auto_consume_stock)}
            />
          </div>
        </ModuleCard>

        {/* B2B Module */}
        <ModuleCard
          icon={<Users size={24} />}
          title="B2B / Wholesale"
          description="Wholesale orders and business customers"
          enabled={settings.b2b.enabled}
          onToggle={(v) => handleUpdate('b2b', 'enabled', v)}
        >
          <NumberInput
            label="Minimum order"
            value={settings.b2b.min_order_amount}
            onChange={(v) => handleUpdate('b2b', 'min_order_amount', v)}
            min={0}
            step={10000}
            suffix="Rp"
          />
          <NumberInput
            label="Payment terms"
            value={settings.b2b.default_payment_terms}
            onChange={(v) => handleUpdate('b2b', 'default_payment_terms', v)}
            min={0}
            max={90}
            suffix="days"
          />
        </ModuleCard>

        {/* Purchasing Module */}
        <ModuleCard
          icon={<ShoppingBag size={24} />}
          title="Purchasing"
          description="Purchase orders and supplier management"
          enabled={settings.purchasing.enabled}
          onToggle={(v) => handleUpdate('purchasing', 'enabled', v)}
        >
          <NumberInput
            label="Auto reorder threshold"
            value={settings.purchasing.auto_reorder_threshold}
            onChange={(v) => handleUpdate('purchasing', 'auto_reorder_threshold', v)}
            min={0}
            suffix="units"
          />
        </ModuleCard>

        {/* Loyalty Module */}
        <ModuleCard
          icon={<Gift size={24} />}
          title="Loyalty"
          description="Points program and rewards"
          enabled={settings.loyalty.enabled}
          onToggle={(v) => handleUpdate('loyalty', 'enabled', v)}
        >
          <NumberInput
            label="Points per Rp"
            value={settings.loyalty.points_per_idr}
            onChange={(v) => handleUpdate('loyalty', 'points_per_idr', v)}
            min={100}
            step={100}
            suffix="Rp"
          />
          <NumberInput
            label="Points expiry"
            value={settings.loyalty.points_expiry_days}
            onChange={(v) => handleUpdate('loyalty', 'points_expiry_days', v)}
            min={30}
            max={730}
            suffix="days"
          />
        </ModuleCard>

        {/* KDS Module */}
        <ModuleCard
          icon={<ChefHat size={24} />}
          title="KDS"
          description="Kitchen display and order management"
          enabled={settings.kds.enabled}
          onToggle={(v) => handleUpdate('kds', 'enabled', v)}
        >
          <NumberInput
            label="Auto acknowledge delay"
            value={settings.kds.auto_acknowledge_delay}
            onChange={(v) => handleUpdate('kds', 'auto_acknowledge_delay', v)}
            min={0}
            max={60}
            suffix="sec"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">New order sound</span>
            <div
              className={`w-10 h-6 rounded-full cursor-pointer transition-all relative shrink-0 after:content-[""] after:absolute after:top-[3px] after:left-[3px] after:w-[18px] after:h-[18px] after:rounded-full after:bg-white after:shadow-sm after:transition-all ${settings.kds.sound_new_order ? 'bg-[var(--color-gold)] after:left-[19px]' : 'bg-white/10'}`}
              onClick={() => handleUpdate('kds', 'sound_new_order', !settings.kds.sound_new_order)}
            />
          </div>
        </ModuleCard>
      </div>
    </div>
  );
}
