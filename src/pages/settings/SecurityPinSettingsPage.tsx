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
          <Lock size={20} className="text-[var(--color-gold)]" />
          <div>
            <h2 className="text-lg font-bold text-white">Security PIN Settings</h2>
            <p className="text-sm text-[var(--theme-text-muted)]">Configure PIN requirements for offline authentication and sensitive operations.</p>
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
        {/* PIN Length */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">PIN Length</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--theme-text-muted)]">Minimum Length</label>
              <input
                type="number"
                className={`w-full px-3 py-2.5 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors ${
                  validationErrors['security.pin_min_length']
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                }`}
                min={2} max={8}
                value={pinMin}
                onChange={(e) => update('security.pin_min_length', Number(e.target.value))}
              />
              {validationErrors['security.pin_min_length'] && (
                <span className="text-xs text-red-400">{validationErrors['security.pin_min_length']}</span>
              )}
              <span className="text-[11px] text-[var(--theme-text-muted)]">Between 2 and 8 digits</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--theme-text-muted)]">Maximum Length</label>
              <input
                type="number"
                className={`w-full px-3 py-2.5 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors ${
                  validationErrors['security.pin_max_length']
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                }`}
                min={4} max={12}
                value={pinMax}
                onChange={(e) => update('security.pin_max_length', Number(e.target.value))}
              />
              {validationErrors['security.pin_max_length'] && (
                <span className="text-xs text-red-400">{validationErrors['security.pin_max_length']}</span>
              )}
              <span className="text-[11px] text-[var(--theme-text-muted)]">Between 4 and 12 digits</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5" />

        {/* Max Attempts */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Max Attempts</h3>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--theme-text-muted)]">Failed attempts before lockout</span>
            <input
              type="number"
              className={`w-24 px-3 py-1.5 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors text-right ${
                validationErrors['security.pin_max_attempts']
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
              }`}
              min={1} max={10}
              value={getVal('security.pin_max_attempts', SECURITY_PIN_DEFAULTS.pinMaxAttempts)}
              onChange={(e) => update('security.pin_max_attempts', Number(e.target.value))}
            />
          </div>
          {validationErrors['security.pin_max_attempts'] && (
            <span className="text-xs text-red-400">{validationErrors['security.pin_max_attempts']}</span>
          )}
        </div>

        <div className="border-t border-white/5" />

        {/* Cooldown Duration */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Cooldown Duration</h3>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--theme-text-muted)]">Lockout duration after max attempts</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={`w-24 px-3 py-1.5 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors text-right ${
                  validationErrors['security.pin_cooldown_minutes']
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                }`}
                min={1} max={60}
                value={getVal('security.pin_cooldown_minutes', SECURITY_PIN_DEFAULTS.pinCooldownMinutes)}
                onChange={(e) => update('security.pin_cooldown_minutes', Number(e.target.value))}
              />
              <span className="text-xs text-[var(--theme-text-muted)]">minutes</span>
            </div>
          </div>
          {validationErrors['security.pin_cooldown_minutes'] && (
            <span className="text-xs text-red-400">{validationErrors['security.pin_cooldown_minutes']}</span>
          )}
        </div>
      </div>

        <div className="border-t border-white/5" />

        {/* Auto Logout */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Auto Logout</h3>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--theme-text-muted)]">Inactivity timeout before automatic logout</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-24 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors text-right focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
                min={0} max={480}
                value={getVal('security.auto_logout_minutes', 30)}
                onChange={(e) => update('security.auto_logout_minutes', Number(e.target.value))}
              />
              <span className="text-xs text-[var(--theme-text-muted)]">minutes</span>
            </div>
          </div>
          <span className="text-[11px] text-[var(--theme-text-muted)]">Set to 0 to disable auto-logout</span>
        </div>

        <div className="border-t border-white/5" />

        {/* PIN Required Actions */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">PIN Required Actions</h3>
          <p className="text-[11px] text-[var(--theme-text-muted)]">Operations that require manager PIN verification</p>
          <div className="flex flex-wrap gap-2">
            {['void', 'refund', 'discount_over_threshold', 'price_override', 'shift_close', 'delete_order'].map((action) => {
              const current = getVal<string[]>('security.pin_required_actions', ['void', 'refund', 'discount_over_threshold']);
              const checked = current.includes(action);
              return (
                <label key={action} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white cursor-pointer hover:border-white/20 transition-colors capitalize">
                  <input
                    type="checkbox"
                    className="accent-[var(--color-gold)]"
                    checked={checked}
                    onChange={() => {
                      const next = checked ? current.filter(a => a !== action) : [...current, action];
                      update('security.pin_required_actions', next);
                    }}
                  />
                  {action.replace(/_/g, ' ')}
                </label>
              );
            })}
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

export default SecurityPinSettingsPage;
