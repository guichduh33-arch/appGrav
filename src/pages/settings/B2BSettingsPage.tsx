import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Building2, Info, Clock, List, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { B2B_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import type { IAgingBucket } from '@/types/settingsModuleConfig';
import { toast } from 'sonner';

const TERM_OPTIONS = [
  { label: 'COD (Cash on Delivery)', value: 0, code: 'cod' },
  { label: 'Net 15', value: 15, code: 'net15' },
  { label: 'Net 30', value: 30, code: 'net30' },
  { label: 'Net 60', value: 60, code: 'net60' },
];

interface ILocalState {
  defaultPaymentTermsDays: number;
  paymentTermOptions: string[];
  criticalOverdueThresholdDays: number;
  agingBuckets: IAgingBucket[];
}

const KEY_MAP: Record<keyof ILocalState, string> = {
  defaultPaymentTermsDays: 'b2b.default_payment_terms_days',
  paymentTermOptions: 'b2b.payment_term_options',
  criticalOverdueThresholdDays: 'b2b.critical_overdue_threshold_days',
  agingBuckets: 'b2b.aging_buckets',
};

const buildDefaults = (): ILocalState => ({
  defaultPaymentTermsDays: B2B_DEFAULTS.defaultPaymentTermsDays,
  paymentTermOptions: [...B2B_DEFAULTS.paymentTermOptions],
  criticalOverdueThresholdDays: B2B_DEFAULTS.criticalOverdueThresholdDays,
  agingBuckets: B2B_DEFAULTS.agingBuckets.map((b) => ({ ...b })),
});

const validateBuckets = (buckets: IAgingBucket[]): string | null => {
  for (let i = 0; i < buckets.length; i++) {
    const b = buckets[i];
    if (b.max !== null && b.min > b.max) return `Bucket "${b.label}": min (${b.min}) > max (${b.max})`;
    if (i > 0) {
      const prev = buckets[i - 1];
      const expectedMin = (prev.max ?? prev.min) + 1;
      if (b.min !== expectedMin) return `Gap or overlap between "${prev.label}" and "${b.label}" (expected min ${expectedMin}, got ${b.min})`;
    }
  }
  return null;
};

const B2BSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('b2b');
  const updateSetting = useUpdateSetting();
  const [form, setForm] = useState<ILocalState>(buildDefaults);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [newTerm, setNewTerm] = useState('');

  const initFromSettings = useCallback(() => {
    if (!settings) return buildDefaults();
    const get = <T,>(key: string, fallback: T): T => {
      const s = settings.find((x) => x.key === key);
      return s ? (s.value as T) : fallback;
    };
    return {
      defaultPaymentTermsDays: get<number>('b2b.default_payment_terms_days', B2B_DEFAULTS.defaultPaymentTermsDays),
      paymentTermOptions: get<string[]>('b2b.payment_term_options', B2B_DEFAULTS.paymentTermOptions),
      criticalOverdueThresholdDays: get<number>('b2b.critical_overdue_threshold_days', B2B_DEFAULTS.criticalOverdueThresholdDays),
      agingBuckets: get<IAgingBucket[]>('b2b.aging_buckets', B2B_DEFAULTS.agingBuckets).map((b) => ({ ...b })),
    };
  }, [settings]);

  useEffect(() => {
    if (settings) { setForm(initFromSettings()); setPendingChanges(new Set()); }
  }, [settings, initFromSettings]);

  const markDirty = (field: keyof ILocalState) => setPendingChanges((prev) => new Set(prev).add(field));

  const handleSaveAll = async () => {
    const bucketError = validateBuckets(form.agingBuckets);
    if (bucketError) { toast.error(bucketError); return; }
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    for (const field of pendingChanges) {
      const key = KEY_MAP[field as keyof ILocalState];
      const value = form[field as keyof ILocalState];
      try { await updateSetting.mutateAsync({ key, value }); }
      catch { errors.push(key); }
    }
    setIsSaving(false);
    if (errors.length === 0) { toast.success('B2B settings saved'); setPendingChanges(new Set()); }
    else toast.error(`Failed to save ${errors.length} setting(s)`);
  };

  const handleCancel = () => {
    setForm(initFromSettings());
    setPendingChanges(new Set());
    toast.success('Changes discarded');
  };

  const addTerm = () => {
    const trimmed = newTerm.trim().toLowerCase();
    if (!trimmed || form.paymentTermOptions.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, paymentTermOptions: [...prev.paymentTermOptions, trimmed] }));
    markDirty('paymentTermOptions');
    setNewTerm('');
  };

  const removeTerm = (term: string) => {
    setForm((prev) => ({ ...prev, paymentTermOptions: prev.paymentTermOptions.filter((t) => t !== term) }));
    markDirty('paymentTermOptions');
  };

  const updateBucket = (idx: number, field: keyof IAgingBucket, raw: string) => {
    setForm((prev) => {
      const buckets = prev.agingBuckets.map((b) => ({ ...b }));
      if (field === 'label') buckets[idx].label = raw;
      else if (field === 'min') buckets[idx].min = parseInt(raw, 10) || 0;
      else if (field === 'max') buckets[idx].max = raw === '' ? null : (parseInt(raw, 10) || 0);
      return { ...prev, agingBuckets: buckets };
    });
    markDirty('agingBuckets');
  };

  const addBucket = () => {
    const last = form.agingBuckets[form.agingBuckets.length - 1];
    const newMin = last ? (last.max ?? last.min) + 1 : 0;
    setForm((prev) => ({ ...prev, agingBuckets: [...prev.agingBuckets, { label: 'New Bucket', min: newMin, max: null }] }));
    markDirty('agingBuckets');
  };

  const removeBucket = (idx: number) => {
    if (form.agingBuckets.length <= 1) return;
    setForm((prev) => ({ ...prev, agingBuckets: prev.agingBuckets.filter((_, i) => i !== idx) }));
    markDirty('agingBuckets');
  };

  const bucketWarning = validateBuckets(form.agingBuckets);

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
    <TooltipProvider>
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-[var(--color-gold)]" />
            <div>
              <h2 className="text-lg font-bold text-white">B2B Settings</h2>
              <p className="text-sm text-[var(--theme-text-muted)]">Payment terms, overdue thresholds, and aging report configuration</p>
            </div>
          </div>
          {pendingChanges.size > 0 && (
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm transition-colors" onClick={handleCancel} disabled={isSaving}>
                <RotateCcw size={14} /> Cancel
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50" onClick={handleSaveAll} disabled={isSaving}>
                <Save size={14} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Default Payment Terms */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clock size={16} className="text-[var(--color-gold)]" /> Default Payment Terms
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">Default terms applied to new B2B orders</p>
            </div>
            <div className="px-5 py-4">
              <select className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" value={form.defaultPaymentTermsDays} onChange={(e) => { setForm((prev) => ({ ...prev, defaultPaymentTermsDays: parseInt(e.target.value, 10) })); markDirty('defaultPaymentTermsDays'); }}>
                {TERM_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* Available Payment Terms */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <List size={16} className="text-[var(--color-gold)]" /> Available Payment Terms
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">Terms selectable when creating B2B orders</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {form.paymentTermOptions.map((term) => (
                  <span key={term} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
                    {term}
                    <button className="p-0.5 text-[var(--theme-text-muted)] hover:text-red-400 transition-colors" onClick={() => removeTerm(term)} title="Remove">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" placeholder="e.g. net45" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTerm()} />
                <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm transition-colors" onClick={addTerm}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Critical Overdue Threshold */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle size={16} className="text-[var(--color-gold)]" /> Critical Overdue Threshold
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">Days past due before an invoice is flagged as critical</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white/80">Threshold</span>
                  <Tooltip>
                    <TooltipTrigger asChild><span className="cursor-help"><Info size={12} className="text-[var(--theme-text-muted)]" /></span></TooltipTrigger>
                    <TooltipContent><p>Invoices overdue by this many days are marked critical</p></TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-24 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 text-right" min={1} value={form.criticalOverdueThresholdDays} onChange={(e) => { setForm((prev) => ({ ...prev, criticalOverdueThresholdDays: parseInt(e.target.value, 10) || 0 })); markDirty('criticalOverdueThresholdDays'); }} />
                  <span className="text-xs text-[var(--theme-text-muted)]">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aging Report Buckets */}
          <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <List size={16} className="text-[var(--color-gold)]" /> Aging Report Buckets
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">Date ranges for the accounts receivable aging report</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {bucketWarning && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
                  <AlertTriangle size={14} />
                  <span>{bucketWarning}</span>
                </div>
              )}
              <div className="space-y-2">
                {form.agingBuckets.map((bucket, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
                    <input type="text" className="flex-1 max-w-[160px] px-2 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20" placeholder="Label" value={bucket.label} onChange={(e) => updateBucket(idx, 'label', e.target.value)} />
                    <input type="number" className="w-20 px-2 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 text-center" placeholder="Min" min={0} value={bucket.min} onChange={(e) => updateBucket(idx, 'min', e.target.value)} />
                    <span className="text-xs text-[var(--theme-text-muted)]">-</span>
                    <input type="number" className="w-20 px-2 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 text-center" placeholder="Max" value={bucket.max ?? ''} onChange={(e) => updateBucket(idx, 'max', e.target.value)} />
                    <span className="text-xs text-[var(--theme-text-muted)]">days</span>
                    <button className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30" onClick={() => removeBucket(idx)} disabled={form.agingBuckets.length <= 1} title="Remove bucket">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--theme-text-muted)] hover:text-white transition-colors" onClick={addBucket}>
                <Plus size={14} /> Add Bucket
              </button>
            </div>
          </div>
        </div>

        {/* Unsaved notice */}
        {pendingChanges.size > 0 && (
          <div className="px-6 py-3 border-t border-white/5 bg-[var(--color-gold)]/5">
            <div className="flex items-center gap-2 text-[var(--color-gold)] text-sm">
              <AlertCircle size={16} />
              <span>{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default B2BSettingsPage;
