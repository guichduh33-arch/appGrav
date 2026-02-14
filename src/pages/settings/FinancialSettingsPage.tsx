import { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, RotateCcw, AlertCircle, DollarSign } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { FINANCIAL_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';

const ROUNDING_OPTIONS = [100, 500, 1000];
const PAYMENT_METHOD_OPTIONS = ['cash', 'card', 'qris', 'edc', 'transfer'];

type FormValues = Record<string, unknown>;

const FinancialSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('financial');
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

  const getVal = <T,>(key: string, fallback: T): T =>
    (form[key] as T) ?? fallback;

  const toggleMethod = (method: string) => {
    const key = 'financial.reference_required_methods';
    const arr = getVal<string[]>(key, FINANCIAL_DEFAULTS.referenceRequiredMethods);
    const next = arr.includes(method) ? arr.filter((v) => v !== method) : [...arr, method];
    update(key, next);
  };

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    const maxPayment = getVal<number>('financial.max_payment_amount', FINANCIAL_DEFAULTS.maxPaymentAmount);
    if (maxPayment <= 0) errs['financial.max_payment_amount'] = 'Must be greater than 0';
    const rounding = getVal<number>('financial.currency_rounding_unit', FINANCIAL_DEFAULTS.currencyRoundingUnit);
    if (!ROUNDING_OPTIONS.includes(rounding)) errs['financial.currency_rounding_unit'] = 'Must be 100, 500, or 1000';
    return errs;
  }, [form]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const handleSave = async () => {
    if (pending.size === 0 || hasErrors) return;
    setIsSaving(true);
    const errors: string[] = [];
    for (const key of pending) {
      try { await updateMutation.mutateAsync({ key, value: form[key] }); }
      catch { errors.push(key); }
    }
    setIsSaving(false);
    if (errors.length === 0) { toast.success('Financial settings saved'); setPending(new Set()); }
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

  if (isLoading) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
          <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          <span className="text-sm">Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
        <div className="flex items-center justify-center gap-2 py-16 text-red-400">
          <AlertCircle size={24} />
          <span>Error loading settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-[var(--color-gold)]" />
          <div>
            <h2 className="text-lg font-bold text-white">Financial Settings</h2>
            <p className="text-sm text-[var(--theme-text-muted)]">Payment limits, currency rounding, and reference requirements.</p>
          </div>
        </div>
        {pending.size > 0 && (
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm transition-colors" onClick={handleCancel} disabled={isSaving}>
              <RotateCcw size={14} /> Cancel
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50" onClick={handleSave} disabled={isSaving || hasErrors}>
              <Save size={14} /> {isSaving ? 'Saving...' : `Save (${pending.size})`}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-6">
        {/* Max Payment Amount */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Max Payment Amount</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--theme-text-muted)]">Maximum single payment</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[var(--theme-text-muted)]">IDR</span>
              <input
                type="number"
                className={`w-40 px-3 py-2 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors ${
                  validationErrors['financial.max_payment_amount']
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                }`}
                min={1}
                value={getVal('financial.max_payment_amount', FINANCIAL_DEFAULTS.maxPaymentAmount)}
                onChange={(e) => update('financial.max_payment_amount', Number(e.target.value))}
              />
            </div>
          </div>
          {validationErrors['financial.max_payment_amount'] && (
            <span className="text-xs text-red-400">{validationErrors['financial.max_payment_amount']}</span>
          )}
        </div>

        <div className="border-t border-white/5" />

        {/* Currency Rounding Unit */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Currency Rounding Unit</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--theme-text-muted)]">Round amounts to nearest</span>
            <select
              className={`ml-auto w-40 px-3 py-2 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors ${
                validationErrors['financial.currency_rounding_unit']
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
              }`}
              value={getVal('financial.currency_rounding_unit', FINANCIAL_DEFAULTS.currencyRoundingUnit)}
              onChange={(e) => update('financial.currency_rounding_unit', Number(e.target.value))}
            >
              {ROUNDING_OPTIONS.map((v) => (
                <option key={v} value={v}>IDR {v.toLocaleString('id-ID')}</option>
              ))}
            </select>
          </div>
          {validationErrors['financial.currency_rounding_unit'] && (
            <span className="text-xs text-red-400">{validationErrors['financial.currency_rounding_unit']}</span>
          )}
        </div>

        <div className="border-t border-white/5" />

        {/* Rounding Tolerance */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Rounding Tolerance</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--theme-text-muted)]">Max accepted rounding difference</span>
            <input
              type="number"
              className="ml-auto w-40 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
              min={0}
              value={getVal('financial.rounding_tolerance', FINANCIAL_DEFAULTS.roundingTolerance)}
              onChange={(e) => update('financial.rounding_tolerance', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Reference Required Methods */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Reference Required Methods</h3>
          <p className="text-xs text-[var(--theme-text-muted)]">Payment methods that require a reference number.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <label key={m} className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/30 border border-white/5 rounded-lg cursor-pointer hover:border-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={getVal<string[]>('financial.reference_required_methods', FINANCIAL_DEFAULTS.referenceRequiredMethods).includes(m)}
                  onChange={() => toggleMethod(m)}
                  className="accent-[var(--color-gold)]"
                />
                <span className="text-sm text-white capitalize">{m}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Unsaved notice */}
      {pending.size > 0 && (
        <div className="px-6 py-3 border-t border-white/5 bg-[var(--color-gold)]/5">
          <div className="flex items-center gap-2 text-[var(--color-gold)] text-sm">
            <AlertCircle size={16} />
            <span>{pending.size} unsaved change{pending.size > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSettingsPage;
