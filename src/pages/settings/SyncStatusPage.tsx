/**
 * Sync Status Dashboard Page
 * Story 3.1 - Sync Status Dashboard
 * Story 3.4 - Offline Period History
 *
 * Displays synchronization status, queue management, and offline period history.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, CloudOff, Cloud, CheckCircle, AlertCircle,
  Trash2, RotateCcw, Clock, Activity, History, ChevronDown, ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
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

/**
 * Status colors for sync states
 */
const STATUS_CONFIG = {
  idle: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Cloud,
  },
  syncing: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: RefreshCw,
  },
  complete: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: AlertCircle,
  },
} as const;

/**
 * Type colors for queue items
 */
const TYPE_COLORS: Record<string, string> = {
  order: 'bg-blue-100 text-blue-700',
  payment: 'bg-green-100 text-green-700',
  stock_movement: 'bg-amber-100 text-amber-700',
};

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

  // Use English locale for date formatting
  const getLocale = () => enUS;

  /**
   * Load queue items from IndexedDB
   */
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

  /**
   * Load offline periods from IndexedDB (Story 3.4)
   */
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

  // Load items on mount and refresh
  useEffect(() => {
    loadQueueItems();
    loadOfflinePeriods();
  }, [loadQueueItems, loadOfflinePeriods]);

  // Refresh when sync completes
  useEffect(() => {
    if (syncStatus === 'complete' || syncStatus === 'error') {
      loadQueueItems();
      refreshCounts();
    }
  }, [syncStatus, loadQueueItems, refreshCounts]);

  /**
   * Trigger manual sync
   */
  const handleManualSync = async () => {
    if (!isOnline) {
      return;
    }
    try {
      await runSyncEngine();
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Manual sync error:', error);
    }
  };

  /**
   * Retry a failed item
   */
  const handleRetryItem = async (itemId: string) => {
    try {
      await resetToPending(itemId);
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Retry error:', error);
    }
  };

  /**
   * Remove a failed item
   */
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeSyncQueueItem(itemId);
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Remove error:', error);
    }
  };

  /**
   * Cleanup synced items
   */
  const handleCleanup = async () => {
    try {
      await cleanupSyncedItems();
      await loadQueueItems();
      await refreshCounts();
    } catch (error) {
      logError('[SyncStatusPage] Cleanup error:', error);
    }
  };

  /**
   * Get filtered items based on selected tab
   */
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

  const filteredItems = getFilteredItems();
  const statusConfig = STATUS_CONFIG[syncStatus];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            Sync Status
          </h1>
          <p className="text-gray-500 mt-1">
            Offline transaction monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCleanup}
            disabled={counts.synced === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cleanup synced items"
          >
            <Trash2 className="w-5 h-5" />
            Cleanup
          </button>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing || pendingTotal === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync now"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Current Status */}
        <div className={`rounded-xl border p-4 ${statusConfig.bg} ${statusConfig.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`w-5 h-5 ${statusConfig.text} ${isSyncing ? 'animate-spin' : ''}`} />
            <p className={`text-sm font-medium ${statusConfig.text}`}>
              Status
            </p>
          </div>
          <p className={`text-lg font-bold ${statusConfig.text}`}>
            {syncStatus}
          </p>
        </div>

        {/* Pending Count */}
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudOff className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-600">
              Pending
            </p>
          </div>
          <p className="text-2xl font-bold text-orange-700">{counts.pending}</p>
        </div>

        {/* Failed Count */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-600">
              Failed
            </p>
          </div>
          <p className="text-2xl font-bold text-red-700">{counts.failed}</p>
        </div>

        {/* Last Sync */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-600">
              Last sync
            </p>
          </div>
          <p className="text-sm font-bold text-gray-700">
            {lastSyncAt
              ? format(new Date(lastSyncAt), 'dd/MM HH:mm', { locale: getLocale() })
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Network Warning */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CloudOff className="w-6 h-6 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">
              Offline Mode
            </p>
            <p className="text-sm text-amber-600">
              Synchronization will resume automatically when connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setSelectedTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({counts.pending + counts.syncing})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('failed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'failed'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Failed ({counts.failed})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'all'
              ? 'border-gray-600 text-gray-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({counts.total})
        </button>
      </div>

      {/* Queue Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attempts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Error
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingItems ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    {selectedTab === 'failed'
                      ? 'No failed items'
                      : 'No pending items'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: getLocale() })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        item.status === 'syncing' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'synced' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.attempts}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 max-w-[200px] truncate" title={item.lastError || ''}>
                      {item.lastError || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'failed' && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRetryItem(item.id)}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Retry"
                          >
                            <RotateCcw className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue Info */}
      <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
        <p>
          Queue: {counts.total} / 500 items
        </p>
        <p>
          Synced: {counts.synced}
        </p>
      </div>

      {/* Offline Period History (Story 3.4) */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowHistorySection(!showHistorySection)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Offline History
            </h2>
            {periodStats && (
              <span className="text-sm text-gray-500">
                ({periodStats.totalPeriods} {periodStats.totalPeriods === 1 ? 'period' : 'periods'})
              </span>
            )}
          </div>
          {showHistorySection ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showHistorySection && (
          <div className="mt-4">
            {/* Period Stats Summary */}
            {periodStats && periodStats.totalPeriods > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Total offline duration</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDurationMs(periodStats.totalDurationMs)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Average duration</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDurationMs(periodStats.averageDurationMs)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 mb-1">Transactions synced</p>
                  <p className="text-lg font-semibold text-green-700">
                    {periodStats.totalSynced}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-600 mb-1">Failed</p>
                  <p className="text-lg font-semibold text-red-700">
                    {periodStats.totalFailed}
                  </p>
                </div>
              </div>
            )}

            {/* Period History Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Trans.
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Synced
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Failed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingPeriods ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading...
                        </td>
                      </tr>
                    ) : offlinePeriods.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          No offline periods recorded
                        </td>
                      </tr>
                    ) : (
                      offlinePeriods.map((period) => (
                        <tr key={period.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              {format(new Date(period.start_time), 'dd/MM/yyyy HH:mm', { locale: getLocale() })}
                            </div>
                            {period.end_time && (
                              <div className="text-xs text-gray-500">
                                → {format(new Date(period.end_time), 'HH:mm', { locale: getLocale() })}
                              </div>
                            )}
                            {!period.end_time && (
                              <div className="text-xs text-orange-600 font-medium">
                                In progress...
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {period.duration_ms ? formatDurationMs(period.duration_ms) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                            {period.transactions_created}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${period.transactions_synced > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {period.transactions_synced}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${period.transactions_failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {period.transactions_failed}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format milliseconds to human-readable duration
 */
function formatDurationMs(ms: number): string {
  if (ms === 0) return '0s';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}
