/**
 * Offline Report Cache Service
 *
 * Provides caching of report data for offline access (7 days)
 * Uses Dexie IndexedDB for persistence
 *
 * @see Story 8.8: Reports Offline Cache
 */

import { db } from '@/lib/db';
import type { IOfflineReportCache, TReportCacheType } from '@/types/offline';
import { subDays, format, parseISO, isAfter } from 'date-fns';

const CACHE_EXPIRY_DAYS = 7;
const DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Cache report data for a specific date
 */
export async function cacheReportData(
  reportType: TReportCacheType,
  reportDate: Date | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<void> {
  const dateStr = typeof reportDate === 'string' ? reportDate : format(reportDate, DATE_FORMAT);

  // Check if entry exists
  const existing = await db.offline_reports_cache
    .where('[report_type+report_date]')
    .equals([reportType, dateStr])
    .first();

  const entry: Omit<IOfflineReportCache, 'id'> = {
    report_type: reportType,
    report_date: dateStr,
    data,
    cached_at: new Date().toISOString(),
  };

  if (existing) {
    // Update existing entry
    await db.offline_reports_cache.update(existing.id!, entry);
  } else {
    // Add new entry
    await db.offline_reports_cache.add(entry as IOfflineReportCache);
  }
}

/**
 * Get cached report data for a date range
 * Returns null if any data is missing
 */
export async function getCachedReport(
  reportType: TReportCacheType,
  dateRange: { from: Date; to: Date }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: Record<string, any>[]; complete: boolean; lastSyncDate: Date | null }> {
  const fromStr = format(dateRange.from, DATE_FORMAT);
  const toStr = format(dateRange.to, DATE_FORMAT);

  const entries = await db.offline_reports_cache
    .where('report_type')
    .equals(reportType)
    .and((entry) => entry.report_date >= fromStr && entry.report_date <= toStr)
    .sortBy('report_date');

  // Check if we have all dates in range
  const dates: string[] = [];
  const current = new Date(dateRange.from);
  while (current <= dateRange.to) {
    dates.push(format(current, DATE_FORMAT));
    current.setDate(current.getDate() + 1);
  }

  const cachedDates = new Set(entries.map((e) => e.report_date));
  const complete = dates.every((d) => cachedDates.has(d));

  // Find latest sync date
  const lastSyncDate = entries.length > 0
    ? entries.reduce((latest, entry) => {
        const entryDate = parseISO(entry.cached_at);
        return !latest || isAfter(entryDate, latest) ? entryDate : latest;
      }, null as Date | null)
    : null;

  return {
    data: entries.map((e) => e.data),
    complete,
    lastSyncDate,
  };
}

/**
 * Get single cached report for a specific date
 */
export async function getCachedReportForDate(
  reportType: TReportCacheType,
  date: Date | string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any> | null> {
  const dateStr = typeof date === 'string' ? date : format(date, DATE_FORMAT);

  const entry = await db.offline_reports_cache
    .where('[report_type+report_date]')
    .equals([reportType, dateStr])
    .first();

  return entry?.data ?? null;
}

/**
 * Cache multiple days of report data at once
 */
export async function cacheReportDataBulk(
  reportType: TReportCacheType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entries: Array<{ date: Date | string; data: Record<string, any> }>
): Promise<void> {
  const now = new Date().toISOString();

  for (const entry of entries) {
    const dateStr = typeof entry.date === 'string' ? entry.date : format(entry.date, DATE_FORMAT);

    const existing = await db.offline_reports_cache
      .where('[report_type+report_date]')
      .equals([reportType, dateStr])
      .first();

    const cacheEntry: Omit<IOfflineReportCache, 'id'> = {
      report_type: reportType,
      report_date: dateStr,
      data: entry.data,
      cached_at: now,
    };

    if (existing) {
      await db.offline_reports_cache.update(existing.id!, cacheEntry);
    } else {
      await db.offline_reports_cache.add(cacheEntry as IOfflineReportCache);
    }
  }
}

/**
 * Purge expired cache entries (older than 7 days)
 */
export async function purgeExpiredCache(): Promise<number> {
  const expiryDate = format(subDays(new Date(), CACHE_EXPIRY_DAYS), DATE_FORMAT);

  const expiredEntries = await db.offline_reports_cache
    .where('report_date')
    .below(expiryDate)
    .toArray();

  if (expiredEntries.length > 0) {
    await db.offline_reports_cache
      .where('report_date')
      .below(expiryDate)
      .delete();
  }

  return expiredEntries.length;
}

/**
 * Get last sync timestamp for a report type
 */
export async function getLastSyncTime(reportType: TReportCacheType): Promise<Date | null> {
  const latestEntry = await db.offline_reports_cache
    .where('report_type')
    .equals(reportType)
    .reverse()
    .sortBy('cached_at');

  if (latestEntry.length === 0) return null;

  return parseISO(latestEntry[0].cached_at);
}

/**
 * Check if cache is stale (older than specified minutes)
 */
export async function isCacheStale(
  reportType: TReportCacheType,
  maxAgeMinutes: number = 30
): Promise<boolean> {
  const lastSync = await getLastSyncTime(reportType);
  if (!lastSync) return true;

  const staleThreshold = subDays(new Date(), maxAgeMinutes / (24 * 60));
  return isAfter(staleThreshold, lastSync);
}

/**
 * Clear all cache for a specific report type
 */
export async function clearReportCache(reportType: TReportCacheType): Promise<void> {
  await db.offline_reports_cache
    .where('report_type')
    .equals(reportType)
    .delete();
}

/**
 * Clear all report cache
 */
export async function clearAllReportCache(): Promise<void> {
  await db.offline_reports_cache.clear();
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  byType: Record<TReportCacheType, number>;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  const allEntries = await db.offline_reports_cache.toArray();

  const byType = {} as Record<TReportCacheType, number>;
  let oldestEntry: Date | null = null;
  let newestEntry: Date | null = null;

  for (const entry of allEntries) {
    byType[entry.report_type] = (byType[entry.report_type] || 0) + 1;

    const entryDate = parseISO(entry.cached_at);
    if (!oldestEntry || isAfter(oldestEntry, entryDate)) {
      oldestEntry = entryDate;
    }
    if (!newestEntry || isAfter(entryDate, newestEntry)) {
      newestEntry = entryDate;
    }
  }

  return {
    totalEntries: allEntries.length,
    byType,
    oldestEntry,
    newestEntry,
  };
}
