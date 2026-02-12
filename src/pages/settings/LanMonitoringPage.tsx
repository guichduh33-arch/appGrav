/**
 * LAN Monitoring & Device Management Page
 * Story 7.9 - System Monitoring Dashboard
 * Story 7.8 - LAN Discovery via QR Code
 *
 * Displays connected LAN devices, hub status, QR code for device discovery,
 * and offline period history.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Wifi, WifiOff, Monitor, Smartphone,
  RefreshCw, Power, PowerOff, QrCode, Clock, Activity,
  AlertTriangle, CheckCircle, Copy, Check, ChefHat
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useLanHub } from '@/hooks/lan/useLanHub';
import { useLanDevices, type ILanDevice } from '@/hooks/useLanDevices';
import { useLanStore } from '@/stores/lanStore';
import { lanHub } from '@/services/lan/lanHub';
import {
  getOfflinePeriods, getOfflinePeriodStats,
  type IOfflinePeriod
} from '@/services/sync/offlinePeriod';
import { cn } from '@/lib/utils';
import { logError } from '@/utils/logger'

/**
 * Device type icon mapping
 */
function DeviceIcon({ type, size = 20 }: { type: string; size?: number }) {
  switch (type) {
    case 'pos': return <Monitor size={size} />;
    case 'kds': return <ChefHat size={size} />;
    case 'display': return <Monitor size={size} />;
    case 'mobile': return <Smartphone size={size} />;
    default: return <Wifi size={size} />;
  }
}

/**
 * Device type labels
 */
const DEVICE_TYPE_LABELS: Record<string, string> = {
  pos: 'POS Terminal',
  kds: 'Kitchen Display',
  display: 'Customer Display',
  mobile: 'Mobile Server',
};

/**
 * Format duration in ms to human readable
 */
function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  const hours = Math.floor(ms / 3600000);
  const mins = Math.round((ms % 3600000) / 60000);
  return `${hours}h ${mins}min`;
}

const LanMonitoringPage = () => {
  const { isRunning, status, start, stop, error } = useLanHub();
  const { devices, isLoading, refresh, deviceCount } = useLanDevices();
  const hubAddress = useLanStore((s) => s.hubAddress);
  const deviceId = useLanStore((s) => s.deviceId);

  const [offlinePeriods, setOfflinePeriods] = useState<IOfflinePeriod[]>([]);
  const [offlineStats, setOfflineStats] = useState<{
    totalPeriods: number;
    totalDurationMs: number;
    averageDurationMs: number;
    totalTransactions: number;
    totalSynced: number;
    totalFailed: number;
  } | null>(null);
  const [loadingOffline, setLoadingOffline] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'offline'>('devices');

  // Load offline periods
  const loadOfflineData = useCallback(async () => {
    setLoadingOffline(true);
    try {
      const [periods, stats] = await Promise.all([
        getOfflinePeriods(20),
        getOfflinePeriodStats(),
      ]);
      setOfflinePeriods(periods);
      setOfflineStats(stats);
    } catch (err) {
      logError('[LanMonitoring] Error loading offline data:', err);
    } finally {
      setLoadingOffline(false);
    }
  }, []);

  useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadOfflineData()]);
    setRefreshing(false);
  };

  const handleToggleHub = async () => {
    if (isRunning) {
      await stop();
    } else {
      await start();
    }
  };

  const handleForceRefresh = async (targetDeviceId: string) => {
    if (!lanHub.isActive()) return;
    lanHub.broadcast('sync_request', { targetDeviceId });
  };

  const handleCopyAddress = () => {
    const address = hubAddress || `${window.location.hostname}:3001`;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-brun-chocolat)] m-0">LAN Network & Devices</h2>
          <p className="text-sm text-[var(--color-gris-chaud)] mt-0.5 mb-0">
            Monitor connected devices and network health
          </p>
        </div>
        <div>
          <button
            className={cn('btn-secondary flex items-center gap-2', refreshing && 'opacity-70')}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Hub Status Card */}
      <div className={cn(
        'flex items-center gap-4 px-6 py-4 rounded-lg border transition-all duration-200',
        isRunning ? 'bg-[#ecfdf5] border-[#a7f3d0]' : 'bg-[#fef2f2] border-[#fecaca]'
      )}>
        <div className={cn(
          'flex items-center justify-center w-12 h-12 rounded-md shrink-0',
          isRunning ? 'bg-[#d1fae5] text-[#059669]' : 'bg-[#fee2e2] text-[#dc2626]'
        )}>
          {isRunning ? <Wifi size={24} /> : <WifiOff size={24} />}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold m-0 text-[var(--color-brun-chocolat)]">
            LAN Hub {isRunning ? 'Active' : 'Inactive'}
          </h3>
          <div className="text-sm text-[var(--color-gris-chaud)] mt-0.5 flex items-center gap-1">
            {isRunning ? (
              <>
                <span>{deviceCount} device{deviceCount !== 1 ? 's' : ''} connected</span>
                <span className="after:content-['\2022'] after:text-[var(--color-gris-chaud)] after:opacity-50" />
                <span>Uptime: {formatDuration(status.uptime)}</span>
              </>
            ) : (
              <span>Hub is not running. Start it to enable LAN communication.</span>
            )}
          </div>
          {error && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#dc2626]">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>
        <div className="shrink-0">
          <button
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-md border text-sm font-medium cursor-pointer transition-all duration-150 hover:opacity-90 hover:-translate-y-px',
              isRunning
                ? 'bg-white border-[#dc2626] text-[#dc2626]'
                : 'bg-[#059669] border-[#059669] text-white'
            )}
            onClick={handleToggleHub}
          >
            {isRunning ? <PowerOff size={18} /> : <Power size={18} />}
            {isRunning ? 'Stop Hub' : 'Start Hub'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 border-none bg-transparent text-sm font-medium text-[var(--color-gris-chaud)] cursor-pointer border-b-2 border-b-transparent -mb-px transition-all duration-150',
            activeTab === 'devices' && 'text-[var(--color-brun-chocolat)] border-b-[var(--color-brun-chocolat)]'
          )}
          onClick={() => setActiveTab('devices')}
        >
          <Monitor size={16} />
          Devices ({deviceCount})
        </button>
        <button
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 border-none bg-transparent text-sm font-medium text-[var(--color-gris-chaud)] cursor-pointer border-b-2 border-b-transparent -mb-px transition-all duration-150',
            activeTab === 'offline' && 'text-[var(--color-brun-chocolat)] border-b-[var(--color-brun-chocolat)]'
          )}
          onClick={() => setActiveTab('offline')}
        >
          <Clock size={16} />
          Offline History
        </button>
      </div>

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_320px] gap-4 max-[900px]:grid-cols-1">
            {/* Devices List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)] m-0 flex items-center gap-2">Connected Devices</h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-[var(--color-gris-chaud)] text-sm">
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Loading devices...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-[var(--color-gris-chaud)]">
                  <WifiOff size={40} />
                  <h4 className="text-base font-semibold text-[var(--color-brun-chocolat)] m-0">No devices connected</h4>
                  <p className="text-sm m-0 max-w-[280px]">Start the hub and connect devices via QR code or manual IP entry.</p>
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {devices.map((device) => (
                    <DeviceCard
                      key={device.deviceId}
                      device={device}
                      isCurrentDevice={device.deviceId === deviceId}
                      onForceRefresh={() => handleForceRefresh(device.deviceId)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* QR Code & Connection Info */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)] m-0 flex items-center gap-2">
                  <QrCode size={18} />
                  Device Setup
                </h3>
              </div>

              <div className="px-6 py-4 flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2 p-6 bg-gray-50 rounded-md border-2 border-dashed border-gray-200 text-[var(--color-gris-chaud)]">
                  <QrCode size={120} strokeWidth={1} />
                  <p className="text-xs text-center text-[var(--color-gris-chaud)] m-0">
                    Scan this QR code from a mobile device to connect
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gris-chaud)]">Hub Address</label>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded-sm text-[var(--color-brun-chocolat)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{hubAddress || `${window.location.hostname}:3001`}</code>
                    <button
                      className="flex items-center justify-center w-7 h-7 rounded-sm border border-gray-200 bg-white text-[var(--color-gris-chaud)] cursor-pointer transition-all duration-150 shrink-0 hover:bg-gray-100 hover:text-[var(--color-brun-chocolat)]"
                      onClick={handleCopyAddress}
                      title="Copy address"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gris-chaud)]">Device ID</label>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded-sm text-[var(--color-brun-chocolat)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{deviceId || 'Not assigned'}</code>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gris-chaud)]">Protocol</label>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded-sm text-[var(--color-brun-chocolat)] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">BroadcastChannel + Supabase Realtime</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline History Tab */}
      {activeTab === 'offline' && (
        <div className="flex flex-col gap-4">
          {/* Stats Summary */}
          {offlineStats && offlineStats.totalPeriods > 0 && (
            <div className="grid grid-cols-4 gap-2 max-[700px]:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-1">
                <span className="text-xl font-bold text-[var(--color-brun-chocolat)]">{offlineStats.totalPeriods}</span>
                <span className="text-xs text-[var(--color-gris-chaud)] uppercase tracking-wide">Total Incidents</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-1">
                <span className="text-xl font-bold text-[var(--color-brun-chocolat)]">
                  {formatDuration(offlineStats.totalDurationMs)}
                </span>
                <span className="text-xs text-[var(--color-gris-chaud)] uppercase tracking-wide">Total Downtime</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-1">
                <span className="text-xl font-bold text-[var(--color-brun-chocolat)]">
                  {formatDuration(offlineStats.averageDurationMs)}
                </span>
                <span className="text-xs text-[var(--color-gris-chaud)] uppercase tracking-wide">Avg Duration</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-1">
                <span className="text-xl font-bold text-[var(--color-brun-chocolat)]">
                  {offlineStats.totalTransactions}
                </span>
                <span className="text-xs text-[var(--color-gris-chaud)] uppercase tracking-wide">Offline Transactions</span>
              </div>
            </div>
          )}

          {/* Offline Periods List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-[var(--color-brun-chocolat)] m-0 flex items-center gap-2">Offline Period Log</h3>
            </div>

            {loadingOffline ? (
              <div className="flex items-center justify-center gap-2 py-8 text-[var(--color-gris-chaud)] text-sm">
                <RefreshCw size={20} className="animate-spin" />
                <span>Loading history...</span>
              </div>
            ) : offlinePeriods.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-[var(--color-gris-chaud)]">
                <CheckCircle size={40} />
                <h4 className="text-base font-semibold text-[var(--color-brun-chocolat)] m-0">No offline periods recorded</h4>
                <p className="text-sm m-0 max-w-[280px]">The system has been continuously online.</p>
              </div>
            ) : (
              <div className="p-2 flex flex-col">
                {offlinePeriods.map((period) => (
                  <OfflinePeriodRow key={period.id} period={period} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Device Card Component
 */
function DeviceCard({
  device,
  isCurrentDevice,
  onForceRefresh,
}: {
  device: ILanDevice;
  isCurrentDevice: boolean;
  onForceRefresh: () => void;
}) {
  const lastSeen = device.lastHeartbeat
    ? formatDistanceToNow(new Date(device.lastHeartbeat), { addSuffix: true, locale: enUS })
    : 'Unknown';

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-150 relative hover:bg-gray-50',
      isCurrentDevice && 'bg-[#eff6ff]'
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full shrink-0',
        device.status === 'online' && 'bg-[#10b981] shadow-[0_0_4px_rgba(16,185,129,0.5)]',
        device.status === 'idle' && 'bg-[#f59e0b]',
        device.status !== 'online' && device.status !== 'idle' && 'bg-[#9ca3af]'
      )} />
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-sm shrink-0',
        device.status === 'online' ? 'bg-[#d1fae5] text-[#059669]' : 'bg-gray-100 text-[var(--color-gris-chaud)]'
      )}>
        <DeviceIcon type={device.deviceType} size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--color-brun-chocolat)] flex items-center gap-1.5">
          {device.deviceName}
          {isCurrentDevice && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-[#dbeafe] text-[#2563eb]">This device</span>}
          {device.isHub && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-[#d1fae5] text-[#059669]">Hub</span>}
        </div>
        <div className="text-xs text-[var(--color-gris-chaud)] flex items-center gap-1 flex-wrap">
          <span>{DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}</span>
          {device.ipAddress && (
            <>
              <span className="after:content-['\2022'] after:opacity-40" />
              <span>{device.ipAddress}</span>
            </>
          )}
          <span className="after:content-['\2022'] after:opacity-40" />
          <span>Last seen {lastSeen}</span>
        </div>
      </div>
      {!isCurrentDevice && device.status === 'online' && (
        <button
          className="btn-secondary !px-2 !py-1 !text-xs"
          onClick={onForceRefresh}
          title="Force device to re-fetch data"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Offline Period Row Component
 */
function OfflinePeriodRow({ period }: { period: IOfflinePeriod }) {
  const startTime = new Date(period.start_time);
  const endTime = period.end_time ? new Date(period.end_time) : null;
  const isActive = !period.end_time;

  return (
    <div className={cn(
      'flex items-start gap-2 px-4 py-2 rounded-md transition-colors duration-150 hover:bg-gray-50',
      isActive && 'bg-[#fef3c7]'
    )}>
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5',
        isActive ? 'bg-[#fde68a] text-[#d97706]' : 'bg-gray-100 text-[var(--color-gris-chaud)]'
      )}>
        {isActive ? (
          <Activity size={16} className="animate-pulse" />
        ) : (
          <Clock size={16} />
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-[var(--color-brun-chocolat)] flex items-center gap-1.5">
          {format(startTime, 'MMM d, HH:mm', { locale: enUS })}
          {endTime && (
            <>
              <span className="text-[var(--color-gris-chaud)] opacity-50">&rarr;</span>
              {format(endTime, 'HH:mm', { locale: enUS })}
            </>
          )}
          {isActive && <span className="text-[10px] font-medium px-1.5 py-px rounded-full bg-[#fde68a] text-[#92400e] animate-pulse">Ongoing</span>}
        </div>
        <div className="text-xs text-[var(--color-gris-chaud)] flex items-center gap-1 flex-wrap mt-0.5">
          {period.duration_ms != null && (
            <span>Duration: {formatDuration(period.duration_ms)}</span>
          )}
          {period.transactions_created > 0 && (
            <>
              <span className="after:content-['\2022'] after:opacity-40" />
              <span>{period.transactions_created} transactions</span>
            </>
          )}
          {period.transactions_synced > 0 && (
            <>
              <span className="after:content-['\2022'] after:opacity-40" />
              <span className="text-[#059669]">
                {period.transactions_synced} synced
              </span>
            </>
          )}
          {period.transactions_failed > 0 && (
            <>
              <span className="after:content-['\2022'] after:opacity-40" />
              <span className="text-[#dc2626]">
                {period.transactions_failed} failed
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LanMonitoringPage;
