/**
 * Sync Status Dashboard Page
 * Story 3.1 - Sync Status Dashboard
 * Story 3.4 - Offline Period History
 *
 * Displays synchronization status, queue management, and offline period history.
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trash2, Activity } from 'lucide-react';
import { useSyncQueue } from '../../hooks/useSyncQueue';
import { useSyncStore } from '../../stores/syncStore';
import { useNetworkStore } from '../../stores/networkStore';
import {
  getSyncQueueItems,
  cleanupSyncedItems,
  resetToPending,
  removeSyncQueueItem,
  type ISyncQueueItem
} from '../../services/sync/syncQueue';
import { runSyncEngine } from '../../services/sync/syncEngine';
import { getOfflinePeriods, getOfflinePeriodStats, type IOfflinePeriod } from '../../services/sync/offlinePeriod';
import { logError } from '@/utils/logger';
import { SyncStatusCards } from './sync-status/SyncStatusCards';
import { SyncQueueTable } from './sync-status/SyncQueueTable';
import { OfflineHistorySection } from './sync-status/OfflineHistorySection';

export default function SyncStatusPage() {
  const { counts, pendingTotal, refreshCounts } = useSyncQueue();
  const { syncStatus, lastSyncAt, isSyncing } = useSyncStore();
  const isOnline = useNetworkStore((state) => state.isOnline);

  const [queueItems, setQueueItems] = useState<ISyncQueueItem[]>([]);
  const [failedItems, setFailedItems] = useState<ISyncQueueItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'failed' | 'all'>('pending');

  // Story 3.4: Offline period history state
  const [offlinePeriods, setOfflinePeriods] = useState<IOfflinePeriod[]>([]);
  const [periodStats, setPeriodStats] = useState<{
    totalPeriods: number;
    totalDurationMs: number;
    averageDurationMs: number;
    totalTransactions: number;
    totalSynced: number;
    totalFailed: number;
  } | null>(null);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);
  const [showHistorySection, setShowHistorySection] = useState(true);

  const loadQueueItems = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const items = await getSyncQueueItems();
      setQueueItems(items);
      setFailedItems(items.filter((item) => item.status === 'failed'));
    } catch (error) {
      logError('[SyncStatusPage] Error loading queue items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  const loadOfflinePeriods = useCallback(async () => {
    setIsLoadingPeriods(true);
    try {
      const [periods, stats] = await Promise.all([
        getOfflinePeriods(20),
        getOfflinePeriodStats()
      ]);
      setOfflinePeriods(periods);
      setPeriodStats(stats);
    } catch (error) {
      logError('[SyncStatusPage] Error loading offline periods:', error);
    } finally {
      setIsLoadingPeriods(false);
    }
  }, []);

  useEffect(() => {
    loadQueueItems();
    loadOfflinePeriods();
  }, [loadQueueItems, loadOfflinePeriods]);

  useEffect(() => {
    if (syncStatus === 'complete' || syncStatus === 'error') {
      loadQueueItems();
      refreshCounts();
    }
  }, [syncStatus, loadQueueItems, refreshCounts]);

  const handleManualSync = async () => {
    if (!isOnline) return;
    try {
      await runSyncEngine();
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Manual sync error:', error);
    }
  };

  const handleRetryItem = async (itemId: string) => {
    try {
      await resetToPending(itemId);
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Retry error:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeSyncQueueItem(itemId);
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Remove error:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      await cleanupSyncedItems();
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Cleanup error:', error);
    }
  };

  const getFilteredItems = () => {
    switch (selectedTab) {
      case 'pending':
        return queueItems.filter((item) => item.status === 'pending' || item.status === 'syncing');
      case 'failed':
        return failedItems;
      case 'all':
      default:
        return queueItems;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-[var(--color-gold)]" />
            Sync Status
          </h1>
          <p className="text-[var(--theme-text-muted)] mt-1">
            Offline transaction monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCleanup}
            disabled={counts.synced === 0}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cleanup synced items"
          >
            <Trash2 className="w-5 h-5" />
            Cleanup
          </button>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing || pendingTotal === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync now"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>

      <SyncStatusCards
        syncStatus={syncStatus}
        isSyncing={isSyncing}
        counts={counts}
        lastSyncAt={lastSyncAt}
        isOnline={isOnline}
      />

      <SyncQueueTable
        items={getFilteredItems()}
        isLoading={isLoadingItems}
        selectedTab={selectedTab}
        counts={counts}
        onTabChange={setSelectedTab}
        onRetry={handleRetryItem}
        onRemove={handleRemoveItem}
      />

      <OfflineHistorySection
        offlinePeriods={offlinePeriods}
        periodStats={periodStats}
        isLoading={isLoadingPeriods}
        isExpanded={showHistorySection}
        onToggle={() => setShowHistorySection(!showHistorySection)}
      />
    </div>
  );
}
