import { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, AlertCircle, MonitorPlay, Printer, Wifi, WifiOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
      <div className="settings-section">
        <div className="settings-section__body settings-section__loading">
          <div className="spinner" /><span>Loading settings...</span>
        </div>
      </div>
    );
  }
  if (hasError) {
    return (
      <div className="settings-section">
        <div className="settings-section__body settings-section__error">
          <AlertCircle size={24} /><span>Error loading display settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">
              <MonitorPlay size={20} /> Display & Print Server
            </h2>
            <p className="settings-section__description">
              Customer display timing and print server connection
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
              <MonitorPlay size={18} className="text-rose-400" /> Customer Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <NumberRow label="Idle timeout" description="Time before switching to promo mode"
              suffix="seconds" value={num(formValues[DISPLAY_KEYS.idleTimeout])}
              onChange={(v) => handleChange(DISPLAY_KEYS.idleTimeout, v)} />
            <NumberRow label="Promo rotation interval" description="Time between promo slides"
              suffix="seconds" value={num(formValues[DISPLAY_KEYS.promoRotation])}
              onChange={(v) => handleChange(DISPLAY_KEYS.promoRotation, v)} />
            <NumberRow label="Ready order visible duration" description="How long completed orders stay visible"
              suffix="minutes" value={num(formValues[DISPLAY_KEYS.readyOrderDuration])}
              onChange={(v) => handleChange(DISPLAY_KEYS.readyOrderDuration, v)} />
            <NumberRow label="Broadcast debounce" description="Advanced: cart update debounce"
              suffix="ms" value={num(formValues[DISPLAY_KEYS.broadcastDebounce])}
              onChange={(v) => handleChange(DISPLAY_KEYS.broadcastDebounce, v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Printer size={18} className="text-rose-400" /> Print Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="form-group--inline">
              <label className="form-label">Server URL</label>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: 280 }}
                value={String(formValues[PRINTING_KEYS.serverUrl] ?? '')}
                onChange={(e) => handleChange(PRINTING_KEYS.serverUrl, e.target.value)}
                placeholder="http://localhost:3001"
              />
            </div>
            <NumberRow label="Request timeout" suffix="ms"
              value={num(formValues[PRINTING_KEYS.requestTimeout])}
              onChange={(v) => handleChange(PRINTING_KEYS.requestTimeout, v)} />
            <NumberRow label="Health check timeout" suffix="ms"
              value={num(formValues[PRINTING_KEYS.healthCheckTimeout])}
              onChange={(v) => handleChange(PRINTING_KEYS.healthCheckTimeout, v)} />
            <div className="mt-3">
              <button
                className="btn-secondary"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <><div className="spinner" style={{ width: 14, height: 14 }} /> Testing...</>
                ) : (
                  <>{navigator.onLine ? <Wifi size={16} /> : <WifiOff size={16} />} Test Connection</>
                )}
              </button>
            </div>
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

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

function NumberRow({ label, description, suffix, value, onChange }: {
  label: string; description?: string; suffix?: string; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="form-group--inline">
      <div>
        <label className="form-label">{label}</label>
        {description && <p className="form-hint" style={{ marginTop: 0 }}>{description}</p>}
      </div>
      <div className="form-input-group">
        <input type="number" className="form-input form-input--narrow" value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)} min={0} />
        {suffix && <span className="form-input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

export default DisplaySettingsPage;
