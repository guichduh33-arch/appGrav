import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, ShoppingCart, Shield } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { POS_CONFIG_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import ArrayAmountEditor from '@/components/settings/ArrayAmountEditor';
import { toast } from 'sonner';

const REFUND_METHOD_OPTIONS = ['same', 'cash', 'card', 'transfer', 'qris', 'edc'];
const ROLE_OPTIONS = ['cashier', 'manager', 'admin', 'barista'];

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

  if (isLoading) return <div className="settings-section"><div className="settings-section__body settings-section__loading"><div className="spinner" /><span>Loading settings...</span></div></div>;
  if (error || !settings) return <div className="settings-section"><div className="settings-section__body settings-section__error"><AlertCircle size={24} /><span>Error loading settings</span></div></div>;

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title"><ShoppingCart size={20} /> POS Configuration</h2>
            <p className="settings-section__description">Configure POS behavior, payment presets, and role requirements.</p>
          </div>
          {pending.size > 0 && (
            <div className="settings-section__actions">
              <button className="btn-secondary" onClick={handleCancel} disabled={isSaving}><RotateCcw size={16} /> Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={isSaving}><Save size={16} /> {isSaving ? 'Saving...' : `Save (${pending.size})`}</button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {/* Quick Payment Amounts */}
        <div className="settings-group">
          <h3 className="settings-group__title">Quick Payment Amounts</h3>
          <ArrayAmountEditor values={getVal('pos_config.quick_payment_amounts', POS_CONFIG_DEFAULTS.quickPaymentAmounts)} onChange={(v) => update('pos_config.quick_payment_amounts', v)} formatAs="idr" placeholder="e.g. 50000" min={0} />
        </div>

        {/* Shift Opening Cash Presets */}
        <div className="settings-group">
          <h3 className="settings-group__title">Shift Opening Cash Presets</h3>
          <ArrayAmountEditor values={getVal('pos_config.shift_opening_cash_presets', POS_CONFIG_DEFAULTS.shiftOpeningCashPresets)} onChange={(v) => update('pos_config.shift_opening_cash_presets', v)} formatAs="idr" placeholder="e.g. 100000" min={0} />
        </div>

        {/* Quick Discount Percentages */}
        <div className="settings-group">
          <h3 className="settings-group__title">Quick Discount Percentages</h3>
          <ArrayAmountEditor values={getVal('pos_config.quick_discount_percentages', POS_CONFIG_DEFAULTS.quickDiscountPercentages)} onChange={(v) => update('pos_config.quick_discount_percentages', v)} formatAs="percent" placeholder="e.g. 10" min={0} max={100} />
        </div>

        {/* Max Discount */}
        <div className="settings-group">
          <h3 className="settings-group__title">Max Discount Percentage</h3>
          <div className="form-group--inline">
            <label className="form-label">Maximum discount allowed</label>
            <div className="form-input-group">
              <input type="number" className="form-input form-input--narrow" min={0} max={100} value={getVal('pos_config.max_discount_percentage', POS_CONFIG_DEFAULTS.maxDiscountPercentage)} onChange={(e) => update('pos_config.max_discount_percentage', Number(e.target.value))} />
              <span className="form-input-suffix">%</span>
            </div>
          </div>
        </div>

        {/* Shift Reconciliation Tolerance */}
        <div className="settings-group">
          <h3 className="settings-group__title">Shift Reconciliation Tolerance</h3>
          <div className="form-group--inline">
            <label className="form-label">Acceptable cash difference</label>
            <div className="form-input-group">
              <span className="form-input-suffix">IDR</span>
              <input type="number" className="form-input form-input--narrow" min={0} value={getVal('pos_config.shift_reconciliation_tolerance', POS_CONFIG_DEFAULTS.shiftReconciliationTolerance)} onChange={(e) => update('pos_config.shift_reconciliation_tolerance', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Refund Methods */}
        <div className="settings-group">
          <h3 className="settings-group__title">Allowed Refund Methods</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {REFUND_METHOD_OPTIONS.map((m) => (
              <label key={m} className="form-checkbox u-capitalize">
                <input type="checkbox" checked={getVal<string[]>('pos_config.refund_methods', POS_CONFIG_DEFAULTS.refundMethods).includes(m)} onChange={() => toggleInArray('pos_config.refund_methods', m, POS_CONFIG_DEFAULTS.refundMethods)} />
                {m}
              </label>
            ))}
          </div>
        </div>

        {/* Required Roles */}
        <div className="settings-group">
          <h3 className="settings-group__title"><Shield size={16} /> Required Roles</h3>
          {([
            ['Void', 'pos_config.void_required_roles', POS_CONFIG_DEFAULTS.voidRequiredRoles],
            ['Refund', 'pos_config.refund_required_roles', POS_CONFIG_DEFAULTS.refundRequiredRoles],
            ['Shift', 'pos_config.shift_required_roles', POS_CONFIG_DEFAULTS.shiftRequiredRoles],
          ] as const).map(([label, key, fallback]) => (
            <div key={key} style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">{label} Required Roles</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {ROLE_OPTIONS.map((r) => (
                  <label key={r} className="form-checkbox u-capitalize">
                    <input type="checkbox" checked={getVal<string[]>(key, [...fallback]).includes(r)} onChange={() => toggleInArray(key, r, [...fallback])} />
                    {r}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pending.size > 0 && (
        <div className="settings-section__footer">
          <div className="settings-unsaved-notice"><AlertCircle size={16} /><span>{pending.size} unsaved change{pending.size > 1 ? 's' : ''}</span></div>
        </div>
      )}
    </div>
  );
};

export default POSConfigSettingsPage;
