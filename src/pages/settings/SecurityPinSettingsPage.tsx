import { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, RotateCcw, AlertCircle, Lock } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { SECURITY_PIN_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';

type FormValues = Record<string, unknown>;

const SecurityPinSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('security');
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

  const pinMin = getVal<number>('security.pin_min_length', SECURITY_PIN_DEFAULTS.pinMinLength);
  const pinMax = getVal<number>('security.pin_max_length', SECURITY_PIN_DEFAULTS.pinMaxLength);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (pinMin > pinMax) {
      errs['security.pin_min_length'] = 'Min length cannot exceed max length';
      errs['security.pin_max_length'] = 'Max length must be >= min length';
    }
    if (pinMin < 2 || pinMin > 8) errs['security.pin_min_length'] = 'Must be between 2 and 8';
    if (pinMax < 4 || pinMax > 12) errs['security.pin_max_length'] = 'Must be between 4 and 12';
    const attempts = getVal<number>('security.pin_max_attempts', SECURITY_PIN_DEFAULTS.pinMaxAttempts);
    if (attempts < 1 || attempts > 10) errs['security.pin_max_attempts'] = 'Must be between 1 and 10';
    const cooldown = getVal<number>('security.pin_cooldown_minutes', SECURITY_PIN_DEFAULTS.pinCooldownMinutes);
    if (cooldown < 1 || cooldown > 60) errs['security.pin_cooldown_minutes'] = 'Must be between 1 and 60';
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
    if (errors.length === 0) { toast.success('Security settings saved'); setPending(new Set()); }
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
            <h2 className="settings-section__title"><Lock size={20} /> Security PIN Settings</h2>
            <p className="settings-section__description">Configure PIN requirements for offline authentication and sensitive operations.</p>
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
        {/* PIN Length */}
        <div className="settings-group">
          <h3 className="settings-group__title">PIN Length</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Minimum Length</label>
              <input
                type="number"
                className={`form-input ${validationErrors['security.pin_min_length'] ? 'form-input--error' : ''}`}
                min={2}
                max={8}
                value={pinMin}
                onChange={(e) => update('security.pin_min_length', Number(e.target.value))}
              />
              {validationErrors['security.pin_min_length'] && (
                <span className="form-error">{validationErrors['security.pin_min_length']}</span>
              )}
              <span className="form-hint">Between 2 and 8 digits</span>
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Length</label>
              <input
                type="number"
                className={`form-input ${validationErrors['security.pin_max_length'] ? 'form-input--error' : ''}`}
                min={4}
                max={12}
                value={pinMax}
                onChange={(e) => update('security.pin_max_length', Number(e.target.value))}
              />
              {validationErrors['security.pin_max_length'] && (
                <span className="form-error">{validationErrors['security.pin_max_length']}</span>
              )}
              <span className="form-hint">Between 4 and 12 digits</span>
            </div>
          </div>
        </div>

        {/* Max Attempts */}
        <div className="settings-group">
          <h3 className="settings-group__title">Max Attempts</h3>
          <div className="form-group--inline">
            <label className="form-label">Failed attempts before lockout</label>
            <input
              type="number"
              className={`form-input form-input--narrow ${validationErrors['security.pin_max_attempts'] ? 'form-input--error' : ''}`}
              min={1}
              max={10}
              value={getVal('security.pin_max_attempts', SECURITY_PIN_DEFAULTS.pinMaxAttempts)}
              onChange={(e) => update('security.pin_max_attempts', Number(e.target.value))}
            />
          </div>
          {validationErrors['security.pin_max_attempts'] && (
            <span className="form-error">{validationErrors['security.pin_max_attempts']}</span>
          )}
        </div>

        {/* Cooldown Duration */}
        <div className="settings-group">
          <h3 className="settings-group__title">Cooldown Duration</h3>
          <div className="form-group--inline">
            <label className="form-label">Lockout duration after max attempts</label>
            <div className="form-input-group">
              <input
                type="number"
                className={`form-input form-input--narrow ${validationErrors['security.pin_cooldown_minutes'] ? 'form-input--error' : ''}`}
                min={1}
                max={60}
                value={getVal('security.pin_cooldown_minutes', SECURITY_PIN_DEFAULTS.pinCooldownMinutes)}
                onChange={(e) => update('security.pin_cooldown_minutes', Number(e.target.value))}
              />
              <span className="form-input-suffix">minutes</span>
            </div>
          </div>
          {validationErrors['security.pin_cooldown_minutes'] && (
            <span className="form-error">{validationErrors['security.pin_cooldown_minutes']}</span>
          )}
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

export default SecurityPinSettingsPage;
