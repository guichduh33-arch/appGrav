import { useState, useEffect, useCallback } from 'react';
import {
  Save, RotateCcw, AlertCircle, AlertTriangle, RefreshCw,
  Repeat, Database, Wifi, Zap, Shield, BatteryLow,
} from 'lucide-react';
import { useSettingsByCategory, useUpdateSetting } from '@/hooks/settings';
import { SYNC_ADVANCED_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings';
import { toast } from 'sonner';
import { SyncSettingsCard, NumericField } from './sync-advanced/SyncSettingsCard';

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
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center gap-2 py-20 text-[var(--theme-text-muted)]">
        <RefreshCw size={24} className="animate-spin" />
        <span>Loading settings...</span>
      </div>
    );
  }
  if (error || !settings) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center gap-2 py-20 text-red-400">
        <AlertCircle size={24} />
        <span>Error loading sync settings</span>
      </div>
    );
  }

  const n = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
  const msToS = (v: unknown) => `${(n(v) / 1000).toFixed(1)}s`;
  const backoff = Array.isArray(formValues[K.retryBackoff])
    ? (formValues[K.retryBackoff] as number[]) : SYNC_ADVANCED_DEFAULTS.retryBackoffDelaysMs;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-[var(--color-gold)]" />
            Sync Advanced Settings
          </h1>
          <p className="text-[var(--theme-text-muted)] mt-1">
            Fine-tune synchronization, caching, and LAN parameters
          </p>
        </div>
        {pendingChanges.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors"
              onClick={handleResetAll}
              disabled={isSaving}
            >
              <RotateCcw size={16} /> Cancel
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : `Save (${pendingChanges.size})`}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <span className="text-sm text-amber-300">
            These settings are for technical administrators. Incorrect values may affect
            performance and sync reliability.
          </span>
        </div>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors text-sm"
              onClick={() => applyPreset(p)}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Synchronization */}
        <SyncSettingsCard icon={<RefreshCw size={18} className="text-[var(--color-gold)]" />} title="Synchronization">
          <NumericField label="Startup delay" hint={msToS(formValues[K.startupDelay])} suffix="ms"
            value={n(formValues[K.startupDelay])} onChange={(v) => handleChange(K.startupDelay, v)} />
          <NumericField label="Background interval" hint={msToS(formValues[K.bgInterval])} suffix="ms"
            value={n(formValues[K.bgInterval])} onChange={(v) => handleChange(K.bgInterval, v)} />
          <NumericField label="Item process delay" suffix="ms"
            value={n(formValues[K.itemDelay])} onChange={(v) => handleChange(K.itemDelay, v)} />
        </SyncSettingsCard>

        {/* Retry Strategy */}
        <SyncSettingsCard icon={<Repeat size={18} className="text-[var(--color-gold)]" />} title="Retry Strategy">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-[var(--theme-text-secondary)]">Backoff delays (ms, comma-separated)</label>
            <input
              type="text"
              className="bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 px-3 py-1.5 text-sm w-72"
              value={backoff.join(', ')}
              onChange={(e) => {
                const arr = e.target.value.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0);
                handleChange(K.retryBackoff, arr);
              }}
            />
          </div>
          <NumericField label="Max retries" value={n(formValues[K.maxRetries])}
            onChange={(v) => handleChange(K.maxRetries, v)} />
          <NumericField label="Max queue size" value={n(formValues[K.maxQueue])}
            onChange={(v) => handleChange(K.maxQueue, v)} />
        </SyncSettingsCard>

        {/* Cache TTL */}
        <SyncSettingsCard icon={<Database size={18} className="text-[var(--color-gold)]" />} title="Cache TTL">
          <NumericField label="Default cache TTL" suffix="hours"
            value={n(formValues[K.cacheTtlDefault])} onChange={(v) => handleChange(K.cacheTtlDefault, v)} />
          <NumericField label="Orders cache TTL" suffix="hours"
            value={n(formValues[K.cacheTtlOrders])} onChange={(v) => handleChange(K.cacheTtlOrders, v)} />
          <NumericField label="Cache refresh interval" suffix="hours"
            value={n(formValues[K.cacheRefresh])} onChange={(v) => handleChange(K.cacheRefresh, v)} />
        </SyncSettingsCard>

        {/* LAN Network */}
        <SyncSettingsCard icon={<Zap size={18} className="text-[var(--color-gold)]" />} title="LAN Network">
          <NumericField label="Heartbeat interval" hint={msToS(formValues[K.lanHeartbeat])} suffix="ms"
            value={n(formValues[K.lanHeartbeat])} onChange={(v) => handleChange(K.lanHeartbeat, v)} />
          <NumericField label="Stale timeout" hint={msToS(formValues[K.lanStale])} suffix="ms"
            value={n(formValues[K.lanStale])} onChange={(v) => handleChange(K.lanStale, v)} />
          <NumericField label="Max reconnect attempts"
            value={n(formValues[K.lanMaxReconnect])} onChange={(v) => handleChange(K.lanMaxReconnect, v)} />
          <NumericField label="Reconnect backoff base" suffix="ms"
            value={n(formValues[K.lanReconnectBase])} onChange={(v) => handleChange(K.lanReconnectBase, v)} />
          <NumericField label="Reconnect backoff max" suffix="ms"
            value={n(formValues[K.lanReconnectMax])} onChange={(v) => handleChange(K.lanReconnectMax, v)} />
        </SyncSettingsCard>
      </div>

      {/* Unsaved notice */}
      {pendingChanges.size > 0 && (
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-400" />
          <span className="text-sm text-amber-300">{pendingChanges.size} unsaved change{pendingChanges.size > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default SyncAdvancedSettingsPage;
