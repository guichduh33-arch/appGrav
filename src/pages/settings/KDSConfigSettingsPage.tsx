import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Monitor, Clock, Zap, Film } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { KDS_CONFIG_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';

const SETTING_KEYS = {
  urgencyWarning: 'kds_config.urgency_warning_seconds',
  urgencyCritical: 'kds_config.urgency_critical_seconds',
  autoRemoveDelay: 'kds_config.auto_remove_delay_ms',
  pollInterval: 'kds_config.poll_interval_ms',
  exitAnimation: 'kds_config.exit_animation_duration_ms',
} as const;

const DEFAULTS = {
  [SETTING_KEYS.urgencyWarning]: KDS_CONFIG_DEFAULTS.urgencyWarningSeconds,
  [SETTING_KEYS.urgencyCritical]: KDS_CONFIG_DEFAULTS.urgencyCriticalSeconds,
  [SETTING_KEYS.autoRemoveDelay]: KDS_CONFIG_DEFAULTS.autoRemoveDelayMs,
  [SETTING_KEYS.pollInterval]: KDS_CONFIG_DEFAULTS.pollIntervalMs,
  [SETTING_KEYS.exitAnimation]: KDS_CONFIG_DEFAULTS.exitAnimationDurationMs,
};

function KDSPreviewCard({ label, time, color }: {
  label: string; time: number; color: string;
}) {
  return (
    <div
      className="rounded-lg p-3 bg-white flex flex-col gap-1 min-w-[120px]"
      style={{ border: `3px solid ${color}` }}
    >
      <span className="text-xs font-bold" style={{ color }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800">Order #001</span>
      <span className="text-xs text-gray-500 flex items-center gap-1">
        <Clock size={12} /> {Math.floor(time / 60)}m {time % 60}s
      </span>
    </div>
  );
}

const KDSConfigSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('kds_config');
  const updateMutation = useUpdateSetting();

  const [formValues, setFormValues] = useState<Record<string, number>>(
    () => Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, v]))
  );
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const values: Record<string, number> = {};
      settings.forEach((s) => {
        values[s.key] = (s.value as number) ?? DEFAULTS[s.key as keyof typeof DEFAULTS] ?? 0;
      });
      setFormValues(values);
      setPendingChanges(new Set());
    }
  }, [settings]);

  const handleChange = useCallback((key: string, value: number) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setPendingChanges((prev) => new Set(prev).add(key));
  }, []);

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    try {
      for (const key of pendingChanges) {
        try {
          await updateMutation.mutateAsync({ key, value: formValues[key] });
        } catch { errors.push(key); }
      }
      if (errors.length === 0) {
        toast.success('KDS settings saved');
        setPendingChanges(new Set());
      } else {
        toast.error(`Error saving ${errors.length} setting(s)`);
      }
    } finally { setIsSaving(false); }
  };

  const handleResetAll = () => {
    if (!settings) return;
    const values: Record<string, number> = {};
    settings.forEach((s) => {
      values[s.key] = (s.value as number) ?? DEFAULTS[s.key as keyof typeof DEFAULTS] ?? 0;
    });
    setFormValues(values);
    setPendingChanges(new Set());
    toast.success('Changes discarded');
  };

  if (isLoading) {
    return (
      <div className="settings-section">
        <div className="settings-section__body settings-section__loading">
          <div className="spinner" /><span>Loading settings...</span>
        </div>
      </div>
    );
  }
  if (error || !settings) {
    return (
      <div className="settings-section">
        <div className="settings-section__body settings-section__error">
          <AlertCircle size={24} /><span>Error loading KDS settings</span>
        </div>
      </div>
    );
  }

  const warningS = formValues[SETTING_KEYS.urgencyWarning] ?? 300;
  const criticalS = formValues[SETTING_KEYS.urgencyCritical] ?? 600;

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">
              <Monitor size={20} /> KDS Configuration
            </h2>
            <p className="settings-section__description">
              Configure Kitchen Display System behavior and timing
            </p>
          </div>
          {pendingChanges.size > 0 && (
            <div className="settings-section__actions">
              <button className="btn-secondary" onClick={handleResetAll} disabled={isSaving}>
                <RotateCcw size={16} /> Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveAll} disabled={isSaving}>
                <Save size={16} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle size={18} className="text-rose-400" /> Urgency Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumericField
              label="Warning time"
              hint={`${Math.floor(warningS / 60)}m ${warningS % 60}s`}
              suffix="seconds"
              value={warningS}
              onChange={(v) => handleChange(SETTING_KEYS.urgencyWarning, v)}
            />
            <NumericField
              label="Critical time"
              hint={`${Math.floor(criticalS / 60)}m ${criticalS % 60}s`}
              suffix="seconds"
              value={criticalS}
              onChange={(v) => handleChange(SETTING_KEYS.urgencyCritical, v)}
            />
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Live Preview</p>
              <div className="flex gap-3 flex-wrap">
                <KDSPreviewCard label="Normal" time={0} color="#22c55e" />
                <KDSPreviewCard label="Warning" time={warningS} color="#f59e0b" />
                <KDSPreviewCard label="Critical" time={criticalS} color="#ef4444" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={18} className="text-rose-400" /> Auto-Remove
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumericField
              label="Delay after completion"
              hint={`${((formValues[SETTING_KEYS.autoRemoveDelay] ?? 5000) / 1000).toFixed(1)}s`}
              suffix="ms"
              value={formValues[SETTING_KEYS.autoRemoveDelay] ?? 5000}
              onChange={(v) => handleChange(SETTING_KEYS.autoRemoveDelay, v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap size={18} className="text-rose-400" /> Polling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumericField
              label="Poll interval"
              hint={`${((formValues[SETTING_KEYS.pollInterval] ?? 5000) / 1000).toFixed(1)}s`}
              suffix="ms"
              value={formValues[SETTING_KEYS.pollInterval] ?? 5000}
              onChange={(v) => handleChange(SETTING_KEYS.pollInterval, v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Film size={18} className="text-rose-400" /> Animation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NumericField
              label="Exit animation duration"
              suffix="ms"
              value={formValues[SETTING_KEYS.exitAnimation] ?? 300}
              onChange={(v) => handleChange(SETTING_KEYS.exitAnimation, v)}
            />
          </CardContent>
        </Card>
      </div>

      {pendingChanges.size > 0 && (
        <div className="settings-section__footer">
          <div className="settings-unsaved-notice">
            <AlertCircle size={16} />
            <span>{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
};

function NumericField({ label, hint, suffix, value, onChange }: {
  label: string; hint?: string; suffix?: string; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="form-group--inline">
      <div>
        <label className="form-label">{label}</label>
        {hint && <span className="text-xs text-gray-400 ml-2">= {hint}</span>}
      </div>
      <div className="form-input-group">
        <input
          type="number"
          className="form-input form-input--narrow"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={0}
        />
        {suffix && <span className="form-input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

export default KDSConfigSettingsPage;
