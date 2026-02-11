import { useState, useEffect, useCallback } from 'react';
import {
  Save, RotateCcw, AlertCircle, AlertTriangle, RefreshCw,
  Repeat, Database, Wifi, Zap, Shield, BatteryLow,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { SYNC_ADVANCED_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';

const K = {
  startupDelay: 'sync_advanced.startup_delay_ms',
  bgInterval: 'sync_advanced.background_interval_ms',
  itemDelay: 'sync_advanced.item_process_delay_ms',
  retryBackoff: 'sync_advanced.retry_backoff_delays_ms',
  maxRetries: 'sync_advanced.max_retries',
  maxQueue: 'sync_advanced.max_queue_size',
  cacheTtlDefault: 'sync_advanced.cache_ttl_default_hours',
  cacheTtlOrders: 'sync_advanced.cache_ttl_orders_hours',
  cacheRefresh: 'sync_advanced.cache_refresh_interval_hours',
  lanHeartbeat: 'sync_advanced.lan_heartbeat_interval_ms',
  lanStale: 'sync_advanced.lan_stale_timeout_ms',
  lanMaxReconnect: 'sync_advanced.lan_max_reconnect_attempts',
  lanReconnectBase: 'sync_advanced.lan_reconnect_backoff_base_ms',
  lanReconnectMax: 'sync_advanced.lan_reconnect_backoff_max_ms',
} as const;

const DEFAULTS: Record<string, unknown> = {
  [K.startupDelay]: SYNC_ADVANCED_DEFAULTS.startupDelayMs,
  [K.bgInterval]: SYNC_ADVANCED_DEFAULTS.backgroundIntervalMs,
  [K.itemDelay]: SYNC_ADVANCED_DEFAULTS.itemProcessDelayMs,
  [K.retryBackoff]: SYNC_ADVANCED_DEFAULTS.retryBackoffDelaysMs,
  [K.maxRetries]: SYNC_ADVANCED_DEFAULTS.maxRetries,
  [K.maxQueue]: SYNC_ADVANCED_DEFAULTS.maxQueueSize,
  [K.cacheTtlDefault]: SYNC_ADVANCED_DEFAULTS.cacheTtlDefaultHours,
  [K.cacheTtlOrders]: SYNC_ADVANCED_DEFAULTS.cacheTtlOrdersHours,
  [K.cacheRefresh]: SYNC_ADVANCED_DEFAULTS.cacheRefreshIntervalHours,
  [K.lanHeartbeat]: SYNC_ADVANCED_DEFAULTS.lanHeartbeatIntervalMs,
  [K.lanStale]: SYNC_ADVANCED_DEFAULTS.lanStaleTimeoutMs,
  [K.lanMaxReconnect]: SYNC_ADVANCED_DEFAULTS.lanMaxReconnectAttempts,
  [K.lanReconnectBase]: SYNC_ADVANCED_DEFAULTS.lanReconnectBackoffBaseMs,
  [K.lanReconnectMax]: SYNC_ADVANCED_DEFAULTS.lanReconnectBackoffMaxMs,
};

interface Preset {
  label: string; icon: React.ReactNode;
  values: Record<string, unknown>;
}

const PRESETS: Preset[] = [
  {
    label: 'Stable Connection', icon: <Wifi size={14} />,
    values: {
      [K.startupDelay]: 5000, [K.bgInterval]: 30000, [K.itemDelay]: 100,
      [K.retryBackoff]: [5000, 10000, 30000, 60000, 300000], [K.maxRetries]: 5,
      [K.maxQueue]: 500, [K.cacheTtlDefault]: 24, [K.cacheTtlOrders]: 168,
      [K.cacheRefresh]: 1, [K.lanHeartbeat]: 30000, [K.lanStale]: 120000,
      [K.lanMaxReconnect]: 10, [K.lanReconnectBase]: 1000, [K.lanReconnectMax]: 60000,
    },
  },
  {
    label: 'Unstable Connection', icon: <Shield size={14} />,
    values: {
      [K.startupDelay]: 8000, [K.bgInterval]: 60000, [K.itemDelay]: 200,
      [K.retryBackoff]: [10000, 30000, 60000, 120000, 600000], [K.maxRetries]: 8,
      [K.maxQueue]: 1000, [K.cacheTtlDefault]: 48, [K.cacheTtlOrders]: 336,
      [K.cacheRefresh]: 2, [K.lanHeartbeat]: 60000, [K.lanStale]: 300000,
      [K.lanMaxReconnect]: 20, [K.lanReconnectBase]: 2000, [K.lanReconnectMax]: 120000,
    },
  },
  {
    label: 'Battery Saver', icon: <BatteryLow size={14} />,
    values: {
      [K.startupDelay]: 15000, [K.bgInterval]: 120000, [K.itemDelay]: 500,
      [K.retryBackoff]: [30000, 60000, 120000, 300000, 600000], [K.maxRetries]: 3,
      [K.maxQueue]: 200, [K.cacheTtlDefault]: 72, [K.cacheTtlOrders]: 336,
      [K.cacheRefresh]: 4, [K.lanHeartbeat]: 120000, [K.lanStale]: 600000,
      [K.lanMaxReconnect]: 5, [K.lanReconnectBase]: 5000, [K.lanReconnectMax]: 300000,
    },
  },
];

const SyncAdvancedSettingsPage = () => {
  const { data: settings, isLoading, error } = useSettingsByCategory('sync_advanced');
  const updateMutation = useUpdateSetting();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({ ...DEFAULTS });
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      const v: Record<string, unknown> = { ...DEFAULTS };
      settings.forEach((s) => { v[s.key] = s.value ?? DEFAULTS[s.key]; });
      setFormValues(v);
      setPendingChanges(new Set());
    }
  }, [settings]);

  const handleChange = useCallback((key: string, value: unknown) => {
    setFormValues((p) => ({ ...p, [key]: value }));
    setPendingChanges((p) => new Set(p).add(key));
  }, []);

  const applyPreset = (preset: Preset) => {
    const next = { ...formValues, ...preset.values };
    setFormValues(next);
    const keys = Object.keys(preset.values);
    setPendingChanges((p) => { const s = new Set(p); keys.forEach((k) => s.add(k)); return s; });
    toast.success(`Preset "${preset.label}" applied`);
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    const errors: string[] = [];
    try {
      for (const key of pendingChanges) {
        try { await updateMutation.mutateAsync({ key, value: formValues[key] }); }
        catch { errors.push(key); }
      }
      if (errors.length === 0) {
        toast.success('Sync settings saved');
        setPendingChanges(new Set());
      } else { toast.error(`Error saving ${errors.length} setting(s)`); }
    } finally { setIsSaving(false); }
  };

  const handleResetAll = () => {
    if (!settings) return;
    const v: Record<string, unknown> = { ...DEFAULTS };
    settings.forEach((s) => { v[s.key] = s.value ?? DEFAULTS[s.key]; });
    setFormValues(v);
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
          <AlertCircle size={24} /><span>Error loading sync settings</span>
        </div>
      </div>
    );
  }

  const n = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
  const msToS = (v: unknown) => `${(n(v) / 1000).toFixed(1)}s`;
  const backoff = Array.isArray(formValues[K.retryBackoff])
    ? (formValues[K.retryBackoff] as number[]) : SYNC_ADVANCED_DEFAULTS.retryBackoffDelaysMs;

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__header-content">
          <div>
            <h2 className="settings-section__title">
              <RefreshCw size={20} /> Sync Advanced Settings
            </h2>
            <p className="settings-section__description">
              Fine-tune synchronization, caching, and LAN parameters
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
        <div className="settings-section__readonly-notice">
          <AlertTriangle size={16} />
          <span>
            These settings are for technical administrators. Incorrect values may affect
            performance and sync reliability.
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button key={p.label} className="btn-secondary" onClick={() => applyPreset(p)}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw size={18} className="text-rose-400" /> Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <NF label="Startup delay" hint={msToS(formValues[K.startupDelay])} suffix="ms"
              value={n(formValues[K.startupDelay])} onChange={(v) => handleChange(K.startupDelay, v)} />
            <NF label="Background interval" hint={msToS(formValues[K.bgInterval])} suffix="ms"
              value={n(formValues[K.bgInterval])} onChange={(v) => handleChange(K.bgInterval, v)} />
            <NF label="Item process delay" suffix="ms"
              value={n(formValues[K.itemDelay])} onChange={(v) => handleChange(K.itemDelay, v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Repeat size={18} className="text-rose-400" /> Retry Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="form-group--inline">
              <label className="form-label">Backoff delays (ms, comma-separated)</label>
              <input type="text" className="form-input" style={{ maxWidth: 320 }}
                value={backoff.join(', ')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0);
                  handleChange(K.retryBackoff, arr);
                }}
              />
            </div>
            <NF label="Max retries" value={n(formValues[K.maxRetries])}
              onChange={(v) => handleChange(K.maxRetries, v)} />
            <NF label="Max queue size" value={n(formValues[K.maxQueue])}
              onChange={(v) => handleChange(K.maxQueue, v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database size={18} className="text-rose-400" /> Cache TTL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <NF label="Default cache TTL" suffix="hours"
              value={n(formValues[K.cacheTtlDefault])} onChange={(v) => handleChange(K.cacheTtlDefault, v)} />
            <NF label="Orders cache TTL" suffix="hours"
              value={n(formValues[K.cacheTtlOrders])} onChange={(v) => handleChange(K.cacheTtlOrders, v)} />
            <NF label="Cache refresh interval" suffix="hours"
              value={n(formValues[K.cacheRefresh])} onChange={(v) => handleChange(K.cacheRefresh, v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap size={18} className="text-rose-400" /> LAN Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <NF label="Heartbeat interval" hint={msToS(formValues[K.lanHeartbeat])} suffix="ms"
              value={n(formValues[K.lanHeartbeat])} onChange={(v) => handleChange(K.lanHeartbeat, v)} />
            <NF label="Stale timeout" hint={msToS(formValues[K.lanStale])} suffix="ms"
              value={n(formValues[K.lanStale])} onChange={(v) => handleChange(K.lanStale, v)} />
            <NF label="Max reconnect attempts"
              value={n(formValues[K.lanMaxReconnect])} onChange={(v) => handleChange(K.lanMaxReconnect, v)} />
            <NF label="Reconnect backoff base" suffix="ms"
              value={n(formValues[K.lanReconnectBase])} onChange={(v) => handleChange(K.lanReconnectBase, v)} />
            <NF label="Reconnect backoff max" suffix="ms"
              value={n(formValues[K.lanReconnectMax])} onChange={(v) => handleChange(K.lanReconnectMax, v)} />
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

function NF({ label, hint, suffix, value, onChange }: {
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
        <input type="number" className="form-input form-input--narrow" value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)} min={0} />
        {suffix && <span className="form-input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

export default SyncAdvancedSettingsPage;
