import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, Monitor, Clock, Zap, Film } from 'lucide-react';
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
      className="rounded-xl p-3 bg-white/5 flex flex-col gap-1 min-w-[120px]"
      style={{ border: `2px solid ${color}` }}
    >
      <span className="text-xs font-bold" style={{ color }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-white">Order #001</span>
      <span className="text-xs text-[var(--theme-text-muted)] flex items-center gap-1">
        <Clock size={12} /> {Math.floor(time / 60)}m {time % 60}s
      </span>
    </div>
  );
}

function NumericField({ label, hint, suffix, value, onChange }: {
  label: string; hint?: string; suffix?: string; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</label>
        {hint && <span className="text-xs text-[var(--theme-text-muted)] ml-2">= {hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-24 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white text-right focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={0}
        />
        {suffix && <span className="text-xs text-[var(--theme-text-muted)]">{suffix}</span>}
      </div>
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
      <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
        <div className="animate-spin w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full mr-3" />
        <span>Loading settings...</span>
      </div>
    );
  }
  if (error || !settings) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-red-400">
        <AlertCircle size={24} /><span>Error loading KDS settings</span>
      </div>
    );
  }

  const warningS = formValues[SETTING_KEYS.urgencyWarning] ?? 300;
  const criticalS = formValues[SETTING_KEYS.urgencyCritical] ?? 600;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Monitor size={20} /> KDS Configuration
          </h2>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            Configure Kitchen Display System behavior and timing
          </p>
        </div>
        {pendingChanges.size > 0 && (
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors" onClick={handleResetAll} disabled={isSaving}>
              <RotateCcw size={16} /> Cancel
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-opacity disabled:opacity-50" onClick={handleSaveAll} disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
            </button>
          </div>
        )}
      </div>

      {/* Urgency Thresholds */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-red-400" /> Urgency Thresholds
        </h3>
        <div className="space-y-1">
          <NumericField label="Warning time" hint={`${Math.floor(warningS / 60)}m ${warningS % 60}s`} suffix="seconds" value={warningS} onChange={(v) => handleChange(SETTING_KEYS.urgencyWarning, v)} />
          <NumericField label="Critical time" hint={`${Math.floor(criticalS / 60)}m ${criticalS % 60}s`} suffix="seconds" value={criticalS} onChange={(v) => handleChange(SETTING_KEYS.urgencyCritical, v)} />
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-3">Live Preview</p>
          <div className="flex gap-3 flex-wrap">
            <KDSPreviewCard label="Normal" time={0} color="#22c55e" />
            <KDSPreviewCard label="Warning" time={warningS} color="#f59e0b" />
            <KDSPreviewCard label="Critical" time={criticalS} color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Auto-Remove */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Clock size={16} className="text-[var(--color-gold)]" /> Auto-Remove
        </h3>
        <NumericField label="Delay after completion" hint={`${((formValues[SETTING_KEYS.autoRemoveDelay] ?? 5000) / 1000).toFixed(1)}s`} suffix="ms" value={formValues[SETTING_KEYS.autoRemoveDelay] ?? 5000} onChange={(v) => handleChange(SETTING_KEYS.autoRemoveDelay, v)} />
      </div>

      {/* Polling */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Zap size={16} className="text-[var(--color-gold)]" /> Polling
        </h3>
        <NumericField label="Poll interval" hint={`${((formValues[SETTING_KEYS.pollInterval] ?? 5000) / 1000).toFixed(1)}s`} suffix="ms" value={formValues[SETTING_KEYS.pollInterval] ?? 5000} onChange={(v) => handleChange(SETTING_KEYS.pollInterval, v)} />
      </div>

      {/* Animation */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Film size={16} className="text-[var(--color-gold)]" /> Animation
        </h3>
        <NumericField label="Exit animation duration" suffix="ms" value={formValues[SETTING_KEYS.exitAnimation] ?? 300} onChange={(v) => handleChange(SETTING_KEYS.exitAnimation, v)} />
      </div>

      {pendingChanges.size > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle size={16} />
          <span>{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default KDSConfigSettingsPage;
