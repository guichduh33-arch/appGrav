import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, MonitorPlay, Printer, Wifi, WifiOff } from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import {
  DISPLAY_DEFAULTS,
  PRINTING_SERVER_DEFAULTS,
} from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';

const DISPLAY_KEYS = {
  idleTimeout: 'display.idle_timeout_seconds',
  promoRotation: 'display.promo_rotation_interval_seconds',
  readyOrderDuration: 'display.ready_order_visible_duration_minutes',
  broadcastDebounce: 'display.broadcast_debounce_ms',
} as const;

const PRINTING_KEYS = {
  serverUrl: 'printing.server_url',
  requestTimeout: 'printing.request_timeout_ms',
  healthCheckTimeout: 'printing.health_check_timeout_ms',
} as const;

const ALL_DEFAULTS: Record<string, unknown> = {
  [DISPLAY_KEYS.idleTimeout]: DISPLAY_DEFAULTS.idleTimeoutSeconds,
  [DISPLAY_KEYS.promoRotation]: DISPLAY_DEFAULTS.promoRotationIntervalSeconds,
  [DISPLAY_KEYS.readyOrderDuration]: DISPLAY_DEFAULTS.readyOrderVisibleDurationMinutes,
  [DISPLAY_KEYS.broadcastDebounce]: DISPLAY_DEFAULTS.broadcastDebounceMs,
  [PRINTING_KEYS.serverUrl]: PRINTING_SERVER_DEFAULTS.serverUrl,
  [PRINTING_KEYS.requestTimeout]: PRINTING_SERVER_DEFAULTS.requestTimeoutMs,
  [PRINTING_KEYS.healthCheckTimeout]: PRINTING_SERVER_DEFAULTS.healthCheckTimeoutMs,
};

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

function NumberRow({ label, description, suffix, value, onChange }: {
  label: string; description?: string; suffix?: string; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">{label}</label>
        {description && <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input type="number" className="w-24 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white text-right focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none" value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)} min={0} />
        {suffix && <span className="text-xs text-[var(--theme-text-muted)]">{suffix}</span>}
      </div>
    </div>
  );
}

const DisplaySettingsPage = () => {
  const { data: displaySettings, isLoading: loadingDisplay, error: errorDisplay } =
    useSettingsByCategory('display');
  const { data: printingSettings, isLoading: loadingPrinting, error: errorPrinting } =
    useSettingsByCategory('printing');
  const updateMutation = useUpdateSetting();

  const [formValues, setFormValues] = useState<Record<string, unknown>>(
    () => ({ ...ALL_DEFAULTS })
  );
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const values: Record<string, unknown> = { ...ALL_DEFAULTS };
    displaySettings?.forEach((s) => { values[s.key] = s.value ?? ALL_DEFAULTS[s.key]; });
    printingSettings?.forEach((s) => { values[s.key] = s.value ?? ALL_DEFAULTS[s.key]; });
    setFormValues(values);
    setPendingChanges(new Set());
  }, [displaySettings, printingSettings]);

  const handleChange = useCallback((key: string, value: unknown) => {
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
        toast.success('Display settings saved');
        setPendingChanges(new Set());
      } else {
        toast.error(`Error saving ${errors.length} setting(s)`);
      }
    } finally { setIsSaving(false); }
  };

  const handleResetAll = () => {
    const values: Record<string, unknown> = { ...ALL_DEFAULTS };
    displaySettings?.forEach((s) => { values[s.key] = s.value ?? ALL_DEFAULTS[s.key]; });
    printingSettings?.forEach((s) => { values[s.key] = s.value ?? ALL_DEFAULTS[s.key]; });
    setFormValues(values);
    setPendingChanges(new Set());
    toast.success('Changes discarded');
  };

  const handleTestConnection = async () => {
    const serverUrl = String(formValues[PRINTING_KEYS.serverUrl] || '').replace(/\/+$/, '');
    if (!serverUrl) { toast.error('Server URL is required'); return; }
    const timeout = Number(formValues[PRINTING_KEYS.healthCheckTimeout]) || 2000;
    setIsTesting(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(`${serverUrl}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (response.ok) {
        toast.success('Print server is reachable');
      } else {
        toast.error(`Print server returned status ${response.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Connection failed: ${message}`);
    } finally { setIsTesting(false); }
  };

  const isLoading = loadingDisplay || loadingPrinting;
  const hasError = errorDisplay || errorPrinting;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--theme-text-muted)]">
        <div className="animate-spin w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full mr-3" />
        <span>Loading settings...</span>
      </div>
    );
  }
  if (hasError) {
    return (
      <div className="flex items-center justify-center gap-3 py-12 text-red-400">
        <AlertCircle size={24} /><span>Error loading display settings</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <MonitorPlay size={20} /> Display & Print Server
          </h2>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1">
            Customer display timing and print server connection
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

      {/* Customer Display */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <MonitorPlay size={16} className="text-[var(--color-gold)]" /> Customer Display
        </h3>
        <div className="space-y-1">
          <NumberRow label="Idle timeout" description="Time before switching to promo mode" suffix="seconds" value={num(formValues[DISPLAY_KEYS.idleTimeout])} onChange={(v) => handleChange(DISPLAY_KEYS.idleTimeout, v)} />
          <NumberRow label="Promo rotation interval" description="Time between promo slides" suffix="seconds" value={num(formValues[DISPLAY_KEYS.promoRotation])} onChange={(v) => handleChange(DISPLAY_KEYS.promoRotation, v)} />
          <NumberRow label="Ready order visible duration" description="How long completed orders stay visible" suffix="minutes" value={num(formValues[DISPLAY_KEYS.readyOrderDuration])} onChange={(v) => handleChange(DISPLAY_KEYS.readyOrderDuration, v)} />
          <NumberRow label="Broadcast debounce" description="Advanced: cart update debounce" suffix="ms" value={num(formValues[DISPLAY_KEYS.broadcastDebounce])} onChange={(v) => handleChange(DISPLAY_KEYS.broadcastDebounce, v)} />
        </div>
      </div>

      {/* Print Server */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Printer size={16} className="text-[var(--color-gold)]" /> Print Server
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 py-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Server URL</label>
            <input
              type="text"
              className="w-64 h-9 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
              value={String(formValues[PRINTING_KEYS.serverUrl] ?? '')}
              onChange={(e) => handleChange(PRINTING_KEYS.serverUrl, e.target.value)}
              placeholder="http://localhost:3001"
            />
          </div>
          <NumberRow label="Request timeout" suffix="ms" value={num(formValues[PRINTING_KEYS.requestTimeout])} onChange={(v) => handleChange(PRINTING_KEYS.requestTimeout, v)} />
          <NumberRow label="Health check timeout" suffix="ms" value={num(formValues[PRINTING_KEYS.healthCheckTimeout])} onChange={(v) => handleChange(PRINTING_KEYS.healthCheckTimeout, v)} />
          <div className="pt-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Testing...</>
              ) : (
                <>{navigator.onLine ? <Wifi size={16} /> : <WifiOff size={16} />} Test Connection</>
              )}
            </button>
          </div>
        </div>
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

export default DisplaySettingsPage;
