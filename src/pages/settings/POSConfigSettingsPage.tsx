import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, ShoppingCart, Shield } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { POS_CONFIG_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import ArrayAmountEditor from '@/components/settings/ArrayAmountEditor';
import DiscountPresetEditor from '@/components/settings/DiscountPresetEditor';
import type { IDiscountPreset } from '@/types/settingsModuleConfig';
import { toast } from 'sonner';

const REFUND_METHOD_OPTIONS = ['same', 'cash', 'card', 'transfer', 'qris', 'edc'];
const ROLE_OPTIONS = ['cashier', 'manager', 'admin', 'barista'];

/** Normalize legacy number[] to IDiscountPreset[] for backward compatibility in settings form */
function normalizePresets(raw: unknown): IDiscountPreset[] {
  if (!Array.isArray(raw)) return POS_CONFIG_DEFAULTS.quickDiscountPercentages;
  return raw.map((item) => {
    if (typeof item === 'number') return { name: `${item}%`, pct: item };
    if (typeof item === 'object' && item !== null && 'pct' in item) {
      const obj = item as { name?: string; pct: number };
      return { name: obj.name || `${obj.pct}%`, pct: obj.pct };
    }
    return null;
  }).filter((p): p is IDiscountPreset => p !== null);
}

type FormValues = Record<string, unknown>;

const POSConfigSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('pos_config');
  const updateMutation = useUpdateSetting();

  const [form, setForm] = useState<FormValues>({});
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    const values: FormValues = {};
    settings.forEach((s) => { values[s.key] = s.value; });
    setForm(values);
    setPending(new Set());
  }, [settings]);

  const update = useCallback((key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setPending((prev) => new Set(prev).add(key));
  }, []);

  const handleSave = async () => {
    if (pending.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    for (const key of pending) {
      try { await updateMutation.mutateAsync({ key, value: form[key] }); }
      catch { errors.push(key); }
    }
    setIsSaving(false);
    if (errors.length === 0) { toast.success('POS settings saved'); setPending(new Set()); }
    else { toast.error(`Error on ${errors.length} setting(s)`); }
  };

  const handleCancel = () => {
    if (!settings) return;
    const values: FormValues = {};
    settings.forEach((s) => { values[s.key] = s.value; });
    setForm(values);
    setPending(new Set());
    toast.success('Changes discarded');
  };

  const getVal = <T,>(key: string, fallback: T): T =>
    (form[key] as T) ?? fallback;

  const toggleInArray = (key: string, item: string, fallback: string[]) => {
    const arr = getVal<string[]>(key, fallback);
    const next = arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
    update(key, next);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
      <div className="animate-spin w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full mr-3" />
      <span>Loading settings...</span>
    </div>
  );

  if (error || !settings) return (
    <div className="flex items-center justify-center gap-3 py-12 text-red-400">
      <AlertCircle size={24} /><span>Error loading settings</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <ShoppingCart size={20} /> POS Configuration
          </h2>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">Configure POS behavior, payment presets, and role requirements.</p>
        </div>
        {pending.size > 0 && (
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors" onClick={handleCancel} disabled={isSaving}>
              <RotateCcw size={16} /> Cancel
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-opacity disabled:opacity-50" onClick={handleSave} disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : `Save (${pending.size})`}
            </button>
          </div>
        )}
      </div>

      {/* Quick Payment Amounts */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Quick Payment Amounts</h3>
        <ArrayAmountEditor values={getVal('pos_config.quick_payment_amounts', POS_CONFIG_DEFAULTS.quickPaymentAmounts)} onChange={(v) => update('pos_config.quick_payment_amounts', v)} formatAs="idr" placeholder="e.g. 50000" min={0} />
      </div>

      {/* Shift Opening Cash Presets */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Shift Opening Cash Presets</h3>
        <ArrayAmountEditor values={getVal('pos_config.shift_opening_cash_presets', POS_CONFIG_DEFAULTS.shiftOpeningCashPresets)} onChange={(v) => update('pos_config.shift_opening_cash_presets', v)} formatAs="idr" placeholder="e.g. 100000" min={0} />
      </div>

      {/* Quick Discount Presets */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-1">Quick Discount Presets</h3>
        <p className="text-[11px] text-[var(--theme-text-muted)] mb-3">Named discount buttons shown in the POS discount modal.</p>
        <DiscountPresetEditor
          values={normalizePresets(getVal<IDiscountPreset[] | number[]>('pos_config.quick_discount_percentages', POS_CONFIG_DEFAULTS.quickDiscountPercentages))}
          onChange={(v) => update('pos_config.quick_discount_percentages', v)}
          maxPct={getVal('pos_config.max_discount_percentage', POS_CONFIG_DEFAULTS.maxDiscountPercentage)}
        />
      </div>

      {/* Max Discount */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Max Discount Percentage</h3>
        <div className="flex items-center justify-between gap-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Maximum discount allowed</label>
          <div className="flex items-center gap-2">
            <input type="number" className="w-20 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white text-right focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none" min={0} max={100} value={getVal('pos_config.max_discount_percentage', POS_CONFIG_DEFAULTS.maxDiscountPercentage)} onChange={(e) => update('pos_config.max_discount_percentage', Number(e.target.value))} />
            <span className="text-xs text-[var(--theme-text-muted)]">%</span>
          </div>
        </div>
      </div>

      {/* Shift Reconciliation Tolerance */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Shift Reconciliation Tolerance</h3>
        <div className="flex items-center justify-between gap-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Acceptable cash difference</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--theme-text-muted)]">IDR</span>
            <input type="number" className="w-28 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white text-right focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none" min={0} value={getVal('pos_config.shift_reconciliation_tolerance', POS_CONFIG_DEFAULTS.shiftReconciliationTolerance)} onChange={(e) => update('pos_config.shift_reconciliation_tolerance', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Refund Methods */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Allowed Refund Methods</h3>
        <div className="flex flex-wrap gap-2">
          {REFUND_METHOD_OPTIONS.map((m) => (
            <label key={m} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white cursor-pointer hover:border-white/20 transition-colors capitalize">
              <input type="checkbox" className="accent-[var(--color-gold)]" checked={getVal<string[]>('pos_config.refund_methods', POS_CONFIG_DEFAULTS.refundMethods).includes(m)} onChange={() => toggleInArray('pos_config.refund_methods', m, POS_CONFIG_DEFAULTS.refundMethods)} />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* Auto-print & KDS */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white mb-3">Order Automation</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm text-white font-medium">Auto-print receipt</label>
            <p className="text-[11px] text-[var(--theme-text-muted)]">Automatically print receipt when order is completed</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!getVal('pos_config.auto_print_receipt', false)}
            onClick={() => update('pos_config.auto_print_receipt', !getVal('pos_config.auto_print_receipt', false))}
            className={`relative w-11 h-6 rounded-full transition-colors ${getVal('pos_config.auto_print_receipt', false) ? 'bg-[var(--color-gold)]' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${getVal('pos_config.auto_print_receipt', false) ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        <div className="border-t border-white/5" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm text-white font-medium">Send to KDS by default</label>
            <p className="text-[11px] text-[var(--theme-text-muted)]">Automatically send items to kitchen display when order is placed</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!getVal('pos_config.send_to_kds', true)}
            onClick={() => update('pos_config.send_to_kds', !getVal('pos_config.send_to_kds', true))}
            className={`relative w-11 h-6 rounded-full transition-colors ${getVal('pos_config.send_to_kds', true) ? 'bg-[var(--color-gold)]' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${getVal('pos_config.send_to_kds', true) ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Required Roles */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Shield size={16} className="text-[var(--color-gold)]" /> Required Roles
        </h3>
        {([
          ['Void', 'pos_config.void_required_roles', POS_CONFIG_DEFAULTS.voidRequiredRoles],
          ['Refund', 'pos_config.refund_required_roles', POS_CONFIG_DEFAULTS.refundRequiredRoles],
          ['Shift', 'pos_config.shift_required_roles', POS_CONFIG_DEFAULTS.shiftRequiredRoles],
        ] as const).map(([label, key, fallback]) => (
          <div key={key} className="mb-4 last:mb-0">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2 block">{label} Required Roles</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((r) => (
                <label key={r} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white cursor-pointer hover:border-white/20 transition-colors capitalize">
                  <input type="checkbox" className="accent-[var(--color-gold)]" checked={getVal<string[]>(key, [...fallback]).includes(r)} onChange={() => toggleInArray(key, r, [...fallback])} />
                  {r}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {pending.size > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle size={16} />
          <span>{pending.size} unsaved change{pending.size > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default POSConfigSettingsPage;
