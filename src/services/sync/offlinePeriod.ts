/**
 * Offline Period Service
 * Story 3.3, 3.4 - Post-Offline Sync Report & Offline Period History
 *
 * Tracks offline periods for reporting and history.
 *
 * @migration Uses db.ts (unified schema) instead of legacy offlineDb.ts
 */

import { db } from '@/lib/db';
import logger from '@/utils/logger';
import type { IOfflinePeriod } from '@/types/offline';

// Re-export interface for consumers
export type { IOfflinePeriod };

/**
 * Start tracking an offline period
 * Called when the system goes offline
 */
export async function startOfflinePeriod(): Promise<string> {
  const period: IOfflinePeriod = {
    id: crypto.randomUUID(),
    start_time: new Date().toISOString(),
    end_time: null,
    duration_ms: null,
    transactions_created: 0,
    transactions_synced: 0,
    transactions_failed: 0,
    sync_report_generated: false,
  };

  await db.offline_periods.add(period);
  logger.debug(`[OfflinePeriod] Started tracking period: ${period.id}`);
  return period.id;
}

/**
 * End an offline period
 * Called when the system comes back online
 */
export async function endOfflinePeriod(periodId: string): Promise<IOfflinePeriod | null> {
  const period = await db.offline_periods.get(periodId);
  if (!period) {
    console.warn(`[OfflinePeriod] Period ${periodId} not found`);
    return null;
  }

  const endTime = new Date();
  const startTime = new Date(period.start_time);
  const durationMs = endTime.getTime() - startTime.getTime();

  // Count transactions created during this period
  const offlineOrders = await db.offline_legacy_orders
    .where('created_at')
    .between(period.start_time, endTime.toISOString())
    .count();

  await db.offline_periods.update(periodId, {
    end_time: endTime.toISOString(),
    duration_ms: durationMs,
    transactions_created: offlineOrders,
  });

  const updatedPeriod = await db.offline_periods.get(periodId);
  logger.debug(`[OfflinePeriod] Ended period ${periodId}, duration: ${Math.round(durationMs / 1000)}s`);
  return updatedPeriod || null;
}

/**
 * Get the current active offline period (if any)
 */
export async function getCurrentOfflinePeriod(): Promise<IOfflinePeriod | null> {
  const periods = await db.offline_periods
    .where('end_time')
    .equals(null as unknown as string)
    .toArray();

  return periods.length > 0 ? periods[0] : null;
}

/**
 * Update sync statistics for a period after sync completes
 */
export async function updatePeriodSyncStats(
  periodId: string,
  syncedCount: number,
  failedCount: number
): Promise<void> {
  await db.offline_periods.update(periodId, {
    transactions_synced: syncedCount,
    transactions_failed: failedCount,
    sync_report_generated: true,
  });
  logger.debug(`[OfflinePeriod] Updated sync stats for ${periodId}: ${syncedCount} synced, ${failedCount} failed`);
}

/**
 * Get all offline periods, sorted by most recent first
 */
export async function getOfflinePeriods(limit = 50): Promise<IOfflinePeriod[]> {
  return db.offline_periods
    .orderBy('start_time')
    .reverse()
    .limit(limit)
    .toArray();
}

/**
 * Get offline periods within a date range
 */
export async function getOfflinePeriodsInRange(
  startDate: Date,
  endDate: Date
): Promise<IOfflinePeriod[]> {
  return db.offline_periods
    .where('start_time')
    .between(startDate.toISOString(), endDate.toISOString())
    .reverse()
    .toArray();
}

/**
 * Get a specific offline period by ID
 */
export async function getOfflinePeriodById(periodId: string): Promise<IOfflinePeriod | undefined> {
  return db.offline_periods.get(periodId);
}

/**
 * Delete old offline periods (cleanup)
 * Keeps the last N periods
 */
export async function cleanupOldPeriods(keepCount = 100): Promise<number> {
  const allPeriods = await db.offline_periods
    .orderBy('start_time')
    .reverse()
    .toArray();

  if (allPeriods.length <= keepCount) {
    return 0;
  }

  const periodsToDelete = allPeriods.slice(keepCount);
  const ids = periodsToDelete.map((p) => p.id);
  await db.offline_periods.bulkDelete(ids);

  logger.debug(`[OfflinePeriod] Cleaned up ${ids.length} old periods`);
  return ids.length;
}

/**
 * Get summary statistics for offline periods
 */
export async function getOfflinePeriodStats(): Promise<{
  totalPeriods: number;
  totalDurationMs: number;
  averageDurationMs: number;
  totalTransactions: number;
  totalSynced: number;
  totalFailed: number;
}> {
  const periods = await db.offline_periods.toArray();
  const completedPeriods = periods.filter((p) => p.end_time !== null);

  const totalDurationMs = completedPeriods.reduce((sum, p) => sum + (p.duration_ms || 0), 0);
  const totalTransactions = periods.reduce((sum, p) => sum + p.transactions_created, 0);
  const totalSynced = periods.reduce((sum, p) => sum + p.transactions_synced, 0);
  const totalFailed = periods.reduce((sum, p) => sum + p.transactions_failed, 0);

  return {
    totalPeriods: periods.length,
    totalDurationMs,
    averageDurationMs: completedPeriods.length > 0 ? totalDurationMs / completedPeriods.length : 0,
    totalTransactions,
    totalSynced,
    totalFailed,
  };
}
