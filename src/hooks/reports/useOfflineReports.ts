/**
 * Hook for accessing reports with offline support
 *
 * Online: Fetches from Supabase and caches to Dexie
 * Offline: Returns cached data from Dexie
 *
 * @see Story 8.8: Reports Offline Cache
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { TReportCacheType } from '@/types/offline';
import {
  cacheReportData,
  getCachedReport,
  getLastSyncTime,
  isCacheStale,
  purgeExpiredCache,
} from '@/services/reports/offlineReportCache';
import { differenceInDays } from 'date-fns';
import { useEffect, useState, useCallback, useMemo } from 'react';

const CACHE_DAYS_LIMIT = 7;

export interface UseOfflineReportsOptions<T> {
  /** Report type for caching */
  reportType: TReportCacheType;
  /** Date range for the report */
  dateRange: { from: Date; to: Date };
  /** Query key for React Query */
  queryKey: unknown[];
  /** Function to fetch data online */
  queryFn: () => Promise<T>;
  /** Function to extract date from data item (for caching by date) */
  getDateFromItem?: (item: T extends Array<infer U> ? U : T) => Date | string;
  /** Whether to enable the query */
  enabled?: boolean;
  /** Stale time in milliseconds */
  staleTime?: number;
}

export interface UseOfflineReportsResult<T> {
  /** Query result from React Query */
  query: UseQueryResult<T, Error>;
  /** Whether the app is offline */
  isOffline: boolean;
  /** Last sync date for this report type */
  lastSyncDate: Date | null;
  /** Whether the cache is stale */
  isCacheStale: boolean;
  /** Whether the date range exceeds cache limit (7 days) */
  isDateRangeExceedsCache: boolean;
  /** Whether data is being synced in background */
  isSyncing: boolean;
}

/**
 * Hook for fetching reports with offline support
 *
 * - When online: Fetches from server, caches results
 * - When offline: Returns cached data from Dexie
 * - Automatically purges expired cache entries
 */
export function useOfflineReports<T>({
  reportType,
  dateRange,
  queryKey,
  queryFn,
  getDateFromItem,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes default
}: UseOfflineReportsOptions<T>): UseOfflineReportsResult<T> {
  const { isOnline } = useNetworkStatus();
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [cacheStale, setCacheStale] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Calculate if date range exceeds cache limit
  const isDateRangeExceedsCache = useMemo(() => {
    const days = differenceInDays(dateRange.to, dateRange.from);
    return days > CACHE_DAYS_LIMIT;
  }, [dateRange]);

  // Fetch last sync time on mount
  useEffect(() => {
    getLastSyncTime(reportType).then(setLastSyncDate);
    isCacheStale(reportType, 30).then(setCacheStale);
  }, [reportType]);

  // Purge expired cache on mount
  useEffect(() => {
    purgeExpiredCache().catch(console.error);
  }, []);

  // Offline query function - returns cached data
  const offlineQueryFn = useCallback(async (): Promise<T> => {
    const cached = await getCachedReport(reportType, dateRange);

    if (cached.data.length === 0) {
      throw new Error('No cached data available for this date range');
    }

    // For array data, return all cached items
    // For object data, return the first item
    if (Array.isArray(cached.data[0])) {
      return cached.data.flat() as unknown as T;
    }

    return cached.data as unknown as T;
  }, [reportType, dateRange]);

  // Online query function - fetches and caches
  const onlineQueryFn = useCallback(async (): Promise<T> => {
    setIsSyncing(true);

    try {
      const data = await queryFn();

      // Cache the data
      if (getDateFromItem && Array.isArray(data)) {
        // Cache each item by its date
        for (const item of data) {
          const itemDate = getDateFromItem(item as T extends Array<infer U> ? U : T);
          await cacheReportData(reportType, itemDate, item as Record<string, unknown>);
        }
      } else {
        // Cache as a single entry for today's date
        await cacheReportData(reportType, new Date(), data as unknown as Record<string, unknown>);
      }

      // Update last sync time
      setLastSyncDate(new Date());
      setCacheStale(false);

      return data;
    } finally {
      setIsSyncing(false);
    }
  }, [queryFn, reportType, getDateFromItem]);

  // Main query
  const query = useQuery<T, Error>({
    queryKey: [...queryKey, isOnline ? 'online' : 'offline'],
    queryFn: isOnline ? onlineQueryFn : offlineQueryFn,
    enabled: enabled && (isOnline || !isDateRangeExceedsCache),
    staleTime: isOnline ? staleTime : Infinity, // Never stale when offline
    retry: isOnline ? 3 : 0, // Don't retry offline
  });

  return {
    query,
    isOffline: !isOnline,
    lastSyncDate,
    isCacheStale: cacheStale,
    isDateRangeExceedsCache,
    isSyncing,
  };
}

/**
 * Simplified hook for snapshot reports (single fetch, not date-based)
 * Good for stock alerts, inventory valuation, etc.
 */
export function useOfflineSnapshot<T>({
  reportType,
  queryKey,
  queryFn,
  enabled = true,
}: {
  reportType: TReportCacheType;
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}): UseOfflineReportsResult<T> {
  const { isOnline } = useNetworkStatus();
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getLastSyncTime(reportType).then(setLastSyncDate);
  }, [reportType]);

  const offlineQueryFn = useCallback(async (): Promise<T> => {
    const cached = await getCachedReport(reportType, {
      from: new Date(),
      to: new Date(),
    });

    if (cached.data.length === 0) {
      throw new Error('No cached data available');
    }

    return cached.data[0] as unknown as T;
  }, [reportType]);

  const onlineQueryFn = useCallback(async (): Promise<T> => {
    setIsSyncing(true);

    try {
      const data = await queryFn();
      await cacheReportData(reportType, new Date(), data as unknown as Record<string, unknown>);
      setLastSyncDate(new Date());
      return data;
    } finally {
      setIsSyncing(false);
    }
  }, [queryFn, reportType]);

  const query = useQuery<T, Error>({
    queryKey: [...queryKey, isOnline ? 'online' : 'offline'],
    queryFn: isOnline ? onlineQueryFn : offlineQueryFn,
    enabled,
    staleTime: isOnline ? 5 * 60 * 1000 : Infinity,
    retry: isOnline ? 3 : 0,
  });

  return {
    query,
    isOffline: !isOnline,
    lastSyncDate,
    isCacheStale: false,
    isDateRangeExceedsCache: false,
    isSyncing,
  };
}
