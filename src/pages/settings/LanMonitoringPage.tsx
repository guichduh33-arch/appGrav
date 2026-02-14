/**
 * LAN Monitoring & Device Management Page
 * Story 7.9 - System Monitoring Dashboard
 * Story 7.8 - LAN Discovery via QR Code
 *
 * Displays connected LAN devices, hub status, QR code for device discovery,
 * and offline period history.
 */

import { useState, useEffect, useCallback } from 'react';
import { Monitor, Clock, RefreshCw } from 'lucide-react';
import { useLanHub } from '@/hooks/lan/useLanHub';
import { useLanDevices } from '@/hooks/useLanDevices';
import { useLanStore } from '@/stores/lanStore';
import { lanHub } from '@/services/lan/lanHub';
import {
  getOfflinePeriods, getOfflinePeriodStats,
  type IOfflinePeriod
} from '@/services/sync/offlinePeriod';
import { cn } from '@/lib/utils';
import { logError } from '@/utils/logger';
import { HubStatusCard } from './lan/HubStatusCard';
import { DevicesPanel } from './lan/DevicesPanel';
import { OfflineHistoryTab } from './lan/OfflineHistoryTab';

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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'offline'>('devices');

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
    if (isRunning) await stop();
    else await start();
  };

  const handleForceRefresh = (targetDeviceId: string) => {
    if (!lanHub.isActive()) return;
    lanHub.broadcast('sync_request', { targetDeviceId });
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white m-0 flex items-center gap-2">
            <Monitor className="w-7 h-7 text-[var(--color-gold)]" />
            LAN Network & Devices
          </h2>
          <p className="text-sm text-[var(--theme-text-muted)] mt-1 mb-0">
            Monitor connected devices and network health
          </p>
        </div>
        <button
          className={cn(
            'flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors',
            refreshing && 'opacity-70'
          )}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Hub Status */}
      <HubStatusCard
        isRunning={isRunning}
        status={status}
        error={error}
        deviceCount={deviceCount}
        onToggle={handleToggleHub}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/5">
        {([
          { key: 'devices' as const, icon: Monitor, label: `Devices (${deviceCount})` },
          { key: 'offline' as const, icon: Clock, label: 'Offline History' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 border-none bg-transparent text-sm font-medium text-[var(--theme-text-muted)] cursor-pointer border-b-2 border-b-transparent -mb-px transition-all duration-150',
              activeTab === key && 'text-[var(--color-gold)] border-b-[var(--color-gold)]'
            )}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'devices' && (
        <DevicesPanel
          devices={devices}
          isLoading={isLoading}
          deviceId={deviceId}
          hubAddress={hubAddress}
          onForceRefresh={handleForceRefresh}
        />
      )}

      {activeTab === 'offline' && (
        <OfflineHistoryTab
          offlinePeriods={offlinePeriods}
          offlineStats={offlineStats}
          isLoading={loadingOffline}
        />
      )}
    </div>
  );
};

export default LanMonitoringPage;
