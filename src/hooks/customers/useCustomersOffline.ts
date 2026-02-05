/**
 * useCustomersOffline Hook
 * Story 6.1 - Customers Offline Cache
 *
 * Provides reactive access to offline customer cache using Dexie's useLiveQuery.
 * Supports search, lookup, and sync metadata display.
 *
 * @see ADR-001: Customers are READ-ONLY cache
 * @see ADR-003: Cache policy (24h TTL, 1h refresh)
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type IOfflineCustomer } from '@/lib/db';
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus';
import { CUSTOMERS_CACHE_TTL_MS } from '@/types/offline';

// Re-export for convenience
export type { IOfflineCustomer };

/**
 * Return type for useSearchCustomersOffline hook
 */
export interface IUseSearchCustomersOfflineReturn {
  /** Matching customers from cache */
  customers: IOfflineCustomer[];
  /** Whether the query is still loading */
  isLoading: boolean;
  /** Whether we're currently offline */
  isOffline: boolean;
}

/**
 * Search customers from offline cache
 * Falls back to empty array if no matches
 *
 * @param searchTerm - Term to search by name, phone, or email
 * @returns Reactive customer list with loading and offline state
 *
 * @example
 * ```tsx
 * const { customers, isLoading, isOffline } = useSearchCustomersOffline(searchTerm);
 *
 * if (isLoading) return <Spinner />;
 * if (isOffline) return <OfflineBadge />;
 * return <CustomerList customers={customers} />;
 * ```
 */
export function useSearchCustomersOffline(searchTerm: string): IUseSearchCustomersOfflineReturn {
  const { isOnline } = useNetworkStatus();

  const customers = useLiveQuery(
    async () => {
      if (!searchTerm.trim()) {
        // Return recent customers (first 10 alphabetically)
        return db.offline_customers.orderBy('name').limit(10).toArray();
      }

      const term = searchTerm.toLowerCase();
      const all = await db.offline_customers.toArray();

      return all.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone?.includes(term) ||
          c.email?.toLowerCase().includes(term)
      );
    },
    [searchTerm]
  );

  return {
    customers: customers ?? [],
    isLoading: customers === undefined,
    isOffline: !isOnline,
  };
}

/**
 * Return type for useCustomerByIdOffline hook
 */
export interface IUseCustomerByIdOfflineReturn {
  /** Customer from cache or undefined */
  customer: IOfflineCustomer | undefined;
  /** Whether the query is still loading */
  isLoading: boolean;
  /** Whether we're currently offline */
  isOffline: boolean;
}

/**
 * Get a single customer by ID from offline cache
 *
 * @param customerId - Customer UUID to lookup
 * @returns Reactive customer with loading and offline state
 *
 * @example
 * ```tsx
 * const { customer, isLoading } = useCustomerByIdOffline(customerId);
 *
 * if (isLoading) return <Spinner />;
 * if (!customer) return <NotFound />;
 * return <CustomerCard customer={customer} />;
 * ```
 */
export function useCustomerByIdOffline(
  customerId: string | null | undefined
): IUseCustomerByIdOfflineReturn {
  const { isOnline } = useNetworkStatus();

  const customer = useLiveQuery(
    async () => {
      if (!customerId) return undefined;
      return db.offline_customers.get(customerId);
    },
    [customerId]
  );

  return {
    customer,
    isLoading: customer === undefined && customerId !== null && customerId !== undefined,
    isOffline: !isOnline,
  };
}

/**
 * Return type for useCustomersLastSync hook
 */
export interface IUseCustomersLastSyncReturn {
  /** ISO 8601 timestamp of last sync, or null if never synced */
  lastSyncAt: string | null;
  /** Number of customers in cache */
  recordCount: number;
  /** Whether cache data is considered stale (older than 24h) */
  isStale: boolean;
  /** Human-readable age string for display */
  ageDisplay: string | null;
}

/**
 * Get last sync timestamp and metadata for customers cache
 * Useful for displaying cache freshness indicator
 *
 * @returns Sync metadata with stale detection
 *
 * @example
 * ```tsx
 * const { lastSyncAt, isStale, ageDisplay } = useCustomersLastSync();
 *
 * if (isStale) {
 *   return <StaleWarning date={ageDisplay} />;
 * }
 * ```
 */
export function useCustomersLastSync(): IUseCustomersLastSyncReturn {
  const meta = useLiveQuery(() => db.offline_sync_meta.get('customers'));

  const lastSyncAt = meta?.lastSyncAt ?? null;
  const recordCount = meta?.recordCount ?? 0;

  // Calculate staleness (older than TTL)
  let isStale = false;
  let ageDisplay: string | null = null;

  if (lastSyncAt) {
    const lastSyncTime = new Date(lastSyncAt).getTime();
    const elapsed = Date.now() - lastSyncTime;
    isStale = elapsed > CUSTOMERS_CACHE_TTL_MS;

    // Format age for display
    const lastSyncDate = new Date(lastSyncAt);
    ageDisplay = lastSyncDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return {
    lastSyncAt,
    recordCount,
    isStale,
    ageDisplay,
  };
}

/**
 * Return type for useOfflineCustomerCount hook
 */
export interface IUseOfflineCustomerCountReturn {
  /** Number of customers in cache */
  count: number;
  /** Whether the query is still loading */
  isLoading: boolean;
}

/**
 * Get count of customers in offline cache
 * Useful for sync status display
 *
 * @returns Reactive customer count
 */
export function useOfflineCustomerCount(): IUseOfflineCustomerCountReturn {
  const count = useLiveQuery(() => db.offline_customers.count());

  return {
    count: count ?? 0,
    isLoading: count === undefined,
  };
}
