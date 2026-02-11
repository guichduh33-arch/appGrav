import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Building2, Info, Clock, List, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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

  if (isLoading) return <div className="settings-section"><div className="settings-section__body settings-section__loading"><div className="spinner" /><span>Loading settings...</span></div></div>;
  if (error || !settings) return <div className="settings-section"><div className="settings-section__body settings-section__error"><AlertCircle size={24} /><span>Error loading settings</span></div></div>;

  return (
    <TooltipProvider>
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title"><Building2 size={20} /> B2B Settings</h2>
              <p className="settings-section__description">Payment terms, overdue thresholds, and aging report configuration</p>
            </div>
            {pendingChanges.size > 0 && (
              <div className="settings-section__actions">
                <button className="btn-secondary" onClick={handleCancel} disabled={isSaving}><RotateCcw size={16} /> Cancel</button>
                <button className="btn-primary" onClick={handleSaveAll} disabled={isSaving}><Save size={16} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}</button>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Default Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Clock size={18} className="text-rose-400" /> Default Payment Terms</CardTitle>
              <CardDescription>Default terms applied to new B2B orders</CardDescription>
            </CardHeader>
            <CardContent>
              <select className="form-input form-select" value={form.defaultPaymentTermsDays} onChange={(e) => { setForm((prev) => ({ ...prev, defaultPaymentTermsDays: parseInt(e.target.value, 10) })); markDirty('defaultPaymentTermsDays'); }}>
                {TERM_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </CardContent>
          </Card>

          {/* Available Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><List size={18} className="text-rose-400" /> Available Payment Terms</CardTitle>
              <CardDescription>Terms selectable when creating B2B orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {form.paymentTermOptions.map((term) => (
                  <span key={term} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: 'var(--color-blanc-creme)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500 }}>
                    {term}
                    <button className="btn-ghost btn-ghost--danger btn-ghost--small" onClick={() => removeTerm(term)} title="Remove"><Trash2 size={12} /></button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" className="form-input" style={{ flex: 1 }} placeholder="e.g. net45" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTerm()} />
                <button className="btn-secondary" onClick={addTerm}><Plus size={16} /> Add</button>
              </div>
            </CardContent>
          </Card>

          {/* Critical Overdue Threshold */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle size={18} className="text-rose-400" /> Critical Overdue Threshold</CardTitle>
              <CardDescription>Days past due before an invoice is flagged as critical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="form-group--inline">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Threshold</label>
                  <Tooltip>
                    <TooltipTrigger asChild><span style={{ cursor: 'help' }}><Info size={14} className="text-gray-400" /></span></TooltipTrigger>
                    <TooltipContent><p>Invoices overdue by this many days are marked critical</p></TooltipContent>
                  </Tooltip>
                </div>
                <div className="form-input-group">
                  <input type="number" className="form-input form-input--narrow" min={1} value={form.criticalOverdueThresholdDays} onChange={(e) => { setForm((prev) => ({ ...prev, criticalOverdueThresholdDays: parseInt(e.target.value, 10) || 0 })); markDirty('criticalOverdueThresholdDays'); }} />
                  <span className="form-input-suffix">days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aging Report Buckets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><List size={18} className="text-rose-400" /> Aging Report Buckets</CardTitle>
              <CardDescription>Date ranges for the accounts receivable aging report</CardDescription>
            </CardHeader>
            <CardContent>
              {bucketWarning && (
                <div className="settings-section__readonly-notice" style={{ marginBottom: '1rem' }}>
                  <AlertTriangle size={16} /><span>{bucketWarning}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {form.agingBuckets.map((bucket, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--color-blanc-creme)', borderRadius: 'var(--radius-md)' }}>
                    <input type="text" className="form-input" style={{ flex: 1, maxWidth: 160 }} placeholder="Label" value={bucket.label} onChange={(e) => updateBucket(idx, 'label', e.target.value)} />
                    <input type="number" className="form-input form-input--narrow" placeholder="Min" min={0} value={bucket.min} onChange={(e) => updateBucket(idx, 'min', e.target.value)} />
                    <span className="form-input-suffix">-</span>
                    <input type="number" className="form-input form-input--narrow" placeholder="Max (empty=no limit)" value={bucket.max ?? ''} onChange={(e) => updateBucket(idx, 'max', e.target.value)} />
                    <span className="form-input-suffix">days</span>
                    <button className="btn-icon btn-icon--danger" onClick={() => removeBucket(idx)} disabled={form.agingBuckets.length <= 1} title="Remove bucket"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <button className="btn-ghost" style={{ marginTop: '0.75rem' }} onClick={addBucket}><Plus size={16} /> Add Bucket</button>
            </CardContent>
          </Card>
        </div>

        {pendingChanges.size > 0 && (
          <div className="settings-section__footer">
            <div className="settings-unsaved-notice"><AlertCircle size={16} /><span>{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span></div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default B2BSettingsPage;
