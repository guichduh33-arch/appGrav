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
import './LanMonitoringPage.css';

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
      console.error('[LanMonitoring] Error loading offline data:', err);
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
    <div className="lan-monitoring">
      {/* Header */}
      <div className="lan-monitoring__header">
        <div className="lan-monitoring__header-info">
          <h2 className="lan-monitoring__title">LAN Network & Devices</h2>
          <p className="lan-monitoring__subtitle">
            Monitor connected devices and network health
          </p>
        </div>
        <div className="lan-monitoring__header-actions">
          <button
            className={`btn-secondary ${refreshing ? 'is-loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Hub Status Card */}
      <div className={`hub-status-card ${isRunning ? 'is-active' : 'is-inactive'}`}>
        <div className="hub-status-card__icon">
          {isRunning ? <Wifi size={24} /> : <WifiOff size={24} />}
        </div>
        <div className="hub-status-card__info">
          <h3 className="hub-status-card__title">
            LAN Hub {isRunning ? 'Active' : 'Inactive'}
          </h3>
          <div className="hub-status-card__meta">
            {isRunning ? (
              <>
                <span>{deviceCount} device{deviceCount !== 1 ? 's' : ''} connected</span>
                <span className="hub-status-card__separator" />
                <span>Uptime: {formatDuration(status.uptime)}</span>
              </>
            ) : (
              <span>Hub is not running. Start it to enable LAN communication.</span>
            )}
          </div>
          {error && (
            <div className="hub-status-card__error">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>
        <div className="hub-status-card__actions">
          <button
            className={`btn-hub-toggle ${isRunning ? 'is-running' : ''}`}
            onClick={handleToggleHub}
          >
            {isRunning ? <PowerOff size={18} /> : <Power size={18} />}
            {isRunning ? 'Stop Hub' : 'Start Hub'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="lan-monitoring__tabs">
        <button
          className={`lan-tab ${activeTab === 'devices' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          <Monitor size={16} />
          Devices ({deviceCount})
        </button>
        <button
          className={`lan-tab ${activeTab === 'offline' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('offline')}
        >
          <Clock size={16} />
          Offline History
        </button>
      </div>

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="lan-monitoring__content">
          <div className="lan-monitoring__grid">
            {/* Devices List */}
            <div className="devices-panel">
              <div className="devices-panel__header">
                <h3>Connected Devices</h3>
              </div>

              {isLoading ? (
                <div className="devices-loading">
                  <RefreshCw size={20} className="spinning" />
                  <span>Loading devices...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="devices-empty">
                  <WifiOff size={40} />
                  <h4>No devices connected</h4>
                  <p>Start the hub and connect devices via QR code or manual IP entry.</p>
                </div>
              ) : (
                <div className="devices-list">
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
            <div className="connection-panel">
              <div className="connection-panel__header">
                <h3>
                  <QrCode size={18} />
                  Device Setup
                </h3>
              </div>

              <div className="qr-section">
                <div className="qr-placeholder">
                  <QrCode size={120} strokeWidth={1} />
                  <p className="qr-placeholder__text">
                    Scan this QR code from a mobile device to connect
                  </p>
                </div>

                <div className="connection-info">
                  <label className="connection-info__label">Hub Address</label>
                  <div className="connection-info__value">
                    <code>{hubAddress || `${window.location.hostname}:3001`}</code>
                    <button
                      className="btn-icon-sm"
                      onClick={handleCopyAddress}
                      title="Copy address"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="connection-info">
                  <label className="connection-info__label">Device ID</label>
                  <div className="connection-info__value">
                    <code>{deviceId || 'Not assigned'}</code>
                  </div>
                </div>

                <div className="connection-info">
                  <label className="connection-info__label">Protocol</label>
                  <div className="connection-info__value">
                    <code>BroadcastChannel + Supabase Realtime</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline History Tab */}
      {activeTab === 'offline' && (
        <div className="lan-monitoring__content">
          {/* Stats Summary */}
          {offlineStats && offlineStats.totalPeriods > 0 && (
            <div className="offline-stats">
              <div className="offline-stat-card">
                <span className="offline-stat-card__value">{offlineStats.totalPeriods}</span>
                <span className="offline-stat-card__label">Total Incidents</span>
              </div>
              <div className="offline-stat-card">
                <span className="offline-stat-card__value">
                  {formatDuration(offlineStats.totalDurationMs)}
                </span>
                <span className="offline-stat-card__label">Total Downtime</span>
              </div>
              <div className="offline-stat-card">
                <span className="offline-stat-card__value">
                  {formatDuration(offlineStats.averageDurationMs)}
                </span>
                <span className="offline-stat-card__label">Avg Duration</span>
              </div>
              <div className="offline-stat-card">
                <span className="offline-stat-card__value">
                  {offlineStats.totalTransactions}
                </span>
                <span className="offline-stat-card__label">Offline Transactions</span>
              </div>
            </div>
          )}

          {/* Offline Periods List */}
          <div className="offline-periods">
            <div className="offline-periods__header">
              <h3>Offline Period Log</h3>
            </div>

            {loadingOffline ? (
              <div className="devices-loading">
                <RefreshCw size={20} className="spinning" />
                <span>Loading history...</span>
              </div>
            ) : offlinePeriods.length === 0 ? (
              <div className="devices-empty">
                <CheckCircle size={40} />
                <h4>No offline periods recorded</h4>
                <p>The system has been continuously online.</p>
              </div>
            ) : (
              <div className="offline-periods__list">
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
  const statusClass =
    device.status === 'online' ? 'is-online' :
    device.status === 'idle' ? 'is-idle' : 'is-offline';

  const lastSeen = device.lastHeartbeat
    ? formatDistanceToNow(new Date(device.lastHeartbeat), { addSuffix: true, locale: enUS })
    : 'Unknown';

  return (
    <div className={`device-card ${statusClass} ${isCurrentDevice ? 'is-current' : ''}`}>
      <div className={`device-card__status-dot ${statusClass}`} />
      <div className="device-card__icon">
        <DeviceIcon type={device.deviceType} size={22} />
      </div>
      <div className="device-card__info">
        <div className="device-card__name">
          {device.deviceName}
          {isCurrentDevice && <span className="device-card__badge">This device</span>}
          {device.isHub && <span className="device-card__badge device-card__badge--hub">Hub</span>}
        </div>
        <div className="device-card__meta">
          <span>{DEVICE_TYPE_LABELS[device.deviceType] || device.deviceType}</span>
          {device.ipAddress && (
            <>
              <span className="device-card__separator" />
              <span>{device.ipAddress}</span>
            </>
          )}
          <span className="device-card__separator" />
          <span>Last seen {lastSeen}</span>
        </div>
      </div>
      {!isCurrentDevice && device.status === 'online' && (
        <button
          className="btn-secondary btn-sm"
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
    <div className={`offline-period-row ${isActive ? 'is-active' : ''}`}>
      <div className="offline-period-row__indicator">
        {isActive ? (
          <Activity size={16} className="pulse" />
        ) : (
          <Clock size={16} />
        )}
      </div>
      <div className="offline-period-row__info">
        <div className="offline-period-row__time">
          {format(startTime, 'MMM d, HH:mm', { locale: enUS })}
          {endTime && (
            <>
              <span className="offline-period-row__arrow">&rarr;</span>
              {format(endTime, 'HH:mm', { locale: enUS })}
            </>
          )}
          {isActive && <span className="offline-period-row__live">Ongoing</span>}
        </div>
        <div className="offline-period-row__meta">
          {period.duration_ms != null && (
            <span>Duration: {formatDuration(period.duration_ms)}</span>
          )}
          {period.transactions_created > 0 && (
            <>
              <span className="offline-period-row__separator" />
              <span>{period.transactions_created} transactions</span>
            </>
          )}
          {period.transactions_synced > 0 && (
            <>
              <span className="offline-period-row__separator" />
              <span className="offline-period-row__synced">
                {period.transactions_synced} synced
              </span>
            </>
          )}
          {period.transactions_failed > 0 && (
            <>
              <span className="offline-period-row__separator" />
              <span className="offline-period-row__failed">
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
