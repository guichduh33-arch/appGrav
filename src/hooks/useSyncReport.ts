/**
 * useSyncReport Hook
 * Story 3.3 - Post-Offline Sync Report
 *
 * Manages displaying the sync report modal after coming back online.
 * Listens for sync completion and shows report with offline period stats.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSyncStore } from '../stores/syncStore';
import { useNetworkStore } from '../stores/networkStore';
import {
  getOfflinePeriods,
  updatePeriodSyncStats,
  type IOfflinePeriod,
} from '../services/sync/offlinePeriod';
import { db } from '@/lib/db';

interface ISyncReportState {
  /** Whether to show the report modal */
  showReport: boolean;
  /** The offline period to display in the report */
  period: IOfflinePeriod | null;
  /** Dismiss the report */
  dismissReport: () => void;
  /** Retry failed transactions */
  retryFailed: () => Promise<void>;
}

/**
 * Hook for managing the post-offline sync report
 *
 * Automatically detects when:
 * 1. System was offline and created transactions
 * 2. System came back online
 * 3. Sync has completed
 *
 * Then displays a report with the offline period statistics.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { showReport, period, dismissReport, retryFailed } = useSyncReport();
 *
 *   return (
 *     <>
 *       <MainContent />
 *       {showReport && period && (
 *         <PostOfflineSyncReport
 *           period={period}
 *           onClose={dismissReport}
 *           onRetryFailed={retryFailed}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
export function useSyncReport(): ISyncReportState {
  const [showReport, setShowReport] = useState(false);
  const [period, setPeriod] = useState<IOfflinePeriod | null>(null);

  const isSyncing = useSyncStore((state) => state.isSyncing);
  const isOnline = useNetworkStore((state) => state.isOnline);

  // Track if we were syncing (to detect sync completion)
  const [wasSyncing, setWasSyncing] = useState(false);

  // Check for completed offline periods after sync
  useEffect(() => {
    // Detect sync completion: was syncing, now not syncing, and online
    if (wasSyncing && !isSyncing && isOnline) {
      checkForCompletedPeriod();
    }
    setWasSyncing(isSyncing);
  }, [isSyncing, isOnline, wasSyncing]);

  /**
   * Check if there's a recently completed offline period that needs a report
   */
  const checkForCompletedPeriod = useCallback(async () => {
    try {
      // Get the most recent completed period that hasn't had a report shown
      const periods = await getOfflinePeriods(5);
      const unreportedPeriod = periods.find(
        (p) => p.end_time !== null && !p.sync_report_generated && p.transactions_created > 0
      );

      if (unreportedPeriod) {
        // Count synced and failed transactions from this period
        const syncedCount = await db.offline_legacy_sync_queue
          .where('status')
          .equals('synced')
          .count();

        const failedCount = await db.offline_legacy_sync_queue
          .where('status')
          .equals('failed')
          .count();

        // Update period with sync stats
        await updatePeriodSyncStats(
          unreportedPeriod.id,
          Math.min(syncedCount, unreportedPeriod.transactions_created),
          failedCount
        );

        // Refresh the period data
        const updatedPeriods = await getOfflinePeriods(5);
        const updatedPeriod = updatedPeriods.find((p) => p.id === unreportedPeriod.id);

        if (updatedPeriod) {
          setPeriod(updatedPeriod);
          setShowReport(true);
        }
      }
    } catch (error) {
      console.error('[useSyncReport] Error checking for completed period:', error);
    }
  }, []);

  /**
   * Dismiss the report modal
   */
  const dismissReport = useCallback(() => {
    setShowReport(false);
    setPeriod(null);
  }, []);

  /**
   * Retry failed transactions
   */
  const retryFailed = useCallback(async () => {
    try {
      // Reset failed items to pending
      const failedItems = await db.offline_legacy_sync_queue
        .where('status')
        .equals('failed')
        .toArray();

      for (const item of failedItems) {
        await db.offline_legacy_sync_queue.update(item.id, {
          status: 'pending',
          attempts: 0,
          lastError: null,
        });
      }

      // Trigger sync
      const { startSyncWithDelay } = await import('../services/sync/syncEngine');
      startSyncWithDelay();

      // Close the report
      dismissReport();
    } catch (error) {
      console.error('[useSyncReport] Error retrying failed:', error);
    }
  }, [dismissReport]);

  return {
    showReport,
    period,
    dismissReport,
    retryFailed,
  };
}
