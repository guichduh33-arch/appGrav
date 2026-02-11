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

  if (isLoading) return <div className="settings-section"><div className="settings-section__body settings-section__loading"><div className="spinner" /><span>Loading settings...</span></div></div>;
  if (error || !settings) return <div className="settings-section"><div className="settings-section__body settings-section__error"><AlertCircle size={24} /><span>Error loading settings</span></div></div>;

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title"><DollarSign size={20} /> Financial Settings</h2>
            <p className="settings-section__description">Payment limits, currency rounding, and reference requirements.</p>
          </div>
          {pending.size > 0 && (
            <div className="settings-section__actions">
              <button className="btn-secondary" onClick={handleCancel} disabled={isSaving}><RotateCcw size={16} /> Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={isSaving || hasErrors}><Save size={16} /> {isSaving ? 'Saving...' : `Save (${pending.size})`}</button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {/* Max Payment Amount */}
        <div className="settings-group">
          <h3 className="settings-group__title">Max Payment Amount</h3>
          <div className="form-group--inline">
            <label className="form-label">Maximum single payment</label>
            <div className="form-input-group">
              <span className="form-input-suffix">IDR</span>
              <input
                type="number"
                className={`form-input form-input--narrow ${validationErrors['financial.max_payment_amount'] ? 'form-input--error' : ''}`}
                min={1}
                value={getVal('financial.max_payment_amount', FINANCIAL_DEFAULTS.maxPaymentAmount)}
                onChange={(e) => update('financial.max_payment_amount', Number(e.target.value))}
              />
            </div>
          </div>
          {validationErrors['financial.max_payment_amount'] && (
            <span className="form-error">{validationErrors['financial.max_payment_amount']}</span>
          )}
        </div>

        {/* Currency Rounding Unit */}
        <div className="settings-group">
          <h3 className="settings-group__title">Currency Rounding Unit</h3>
          <div className="form-group--inline">
            <label className="form-label">Round amounts to nearest</label>
            <select
              className={`form-input form-select form-input--narrow ${validationErrors['financial.currency_rounding_unit'] ? 'form-input--error' : ''}`}
              value={getVal('financial.currency_rounding_unit', FINANCIAL_DEFAULTS.currencyRoundingUnit)}
              onChange={(e) => update('financial.currency_rounding_unit', Number(e.target.value))}
            >
              {ROUNDING_OPTIONS.map((v) => (
                <option key={v} value={v}>IDR {v.toLocaleString('id-ID')}</option>
              ))}
            </select>
          </div>
          {validationErrors['financial.currency_rounding_unit'] && (
            <span className="form-error">{validationErrors['financial.currency_rounding_unit']}</span>
          )}
        </div>

        {/* Rounding Tolerance */}
        <div className="settings-group">
          <h3 className="settings-group__title">Rounding Tolerance</h3>
          <div className="form-group--inline">
            <label className="form-label">Max accepted rounding difference</label>
            <div className="form-input-group">
              <input
                type="number"
                className="form-input form-input--narrow"
                min={0}
                value={getVal('financial.rounding_tolerance', FINANCIAL_DEFAULTS.roundingTolerance)}
                onChange={(e) => update('financial.rounding_tolerance', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Reference Required Methods */}
        <div className="settings-group">
          <h3 className="settings-group__title">Reference Required Methods</h3>
          <p className="form-hint" style={{ marginBottom: 'var(--space-sm)' }}>Payment methods that require a reference number.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {PAYMENT_METHOD_OPTIONS.map((m) => (
              <label key={m} className="form-checkbox u-capitalize">
                <input
                  type="checkbox"
                  checked={getVal<string[]>('financial.reference_required_methods', FINANCIAL_DEFAULTS.referenceRequiredMethods).includes(m)}
                  onChange={() => toggleMethod(m)}
                />
                {m}
              </label>
            ))}
          </div>
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

export default FinancialSettingsPage;
