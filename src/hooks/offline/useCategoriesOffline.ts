/**
 * useCategoriesOffline Hook (Story 2.2)
 *
 * Provides transparent online/offline access to product categories.
 * When online, uses the existing useCategories hook with Supabase.
 * When offline, uses Dexie cache with live updates.
 *
 * @see ADR-001: Entités Synchronisées Offline
 */

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNetworkStatus } from './useNetworkStatus';
import { useCategories } from '../products/useCategories';
import {
  getCachedCategories,
  getCachedCategoryById,
  getLastCategoriesSyncAt,
} from '@/services/offline/categoriesCacheService';
import type { IOfflineCategory } from '@/types/offline';
import type { Category } from '@/types/database';

/**
 * Convert offline category to match online Category type
 * Shared utility for consistent mapping across hooks
 */
function mapOfflineToCategory(c: IOfflineCategory): Category {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    sort_order: c.sort_order,
    dispatch_station: c.dispatch_station,
    is_active: c.is_active,
    is_raw_material: c.is_raw_material,
    updated_at: c.updated_at,
    created_at: null, // Not cached
  };
}

/**
 * Return type for useCategoriesOffline hook
 */
export interface IUseCategoriesOfflineResult {
  /** Categories data (online or offline) */
  data: Category[] | undefined;
  /** Loading state */
  isLoading: boolean;
  /** Whether currently operating in offline mode */
  isOffline: boolean;
  /** Error from online query (null when offline) */
  error: Error | null;
  /** Timestamp of last cache sync (offline mode) */
  lastSyncAt: string | null;
}

/**
 * Hook for accessing categories with offline support
 *
 * Automatically switches between online (Supabase) and offline (Dexie)
 * data sources based on network status.
 *
 * @example
 * ```tsx
 * const { data: categories, isOffline, isLoading } = useCategoriesOffline();
 *
 * if (isLoading) return <Spinner />;
 *
 * return (
 *   <CategoryGrid
 *     categories={categories}
 *     showOfflineBadge={isOffline}
 *   />
 * );
 * ```
 */
export function useCategoriesOffline(): IUseCategoriesOfflineResult {
  const { isOnline } = useNetworkStatus();
  const onlineResult = useCategories();

  // Offline: use Dexie with live updates
  const offlineCategories = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await getCachedCategories();
      } catch (error) {
        console.error('[useCategoriesOffline] Error loading offline categories:', error);
        return [];
      }
    },
    [isOnline]
  );

  // Get last sync timestamp for offline mode
  const lastSyncAt = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await getLastCategoriesSyncAt();
      } catch {
        return null;
      }
    },
    [isOnline]
  );

  if (isOnline) {
    return {
      data: onlineResult.data,
      isLoading: onlineResult.isLoading,
      isOffline: false,
      error: onlineResult.error as Error | null,
      lastSyncAt: null,
    };
  }

  return {
    data: offlineCategories?.map(mapOfflineToCategory),
    isLoading: offlineCategories === undefined,
    isOffline: true,
    error: null,
    lastSyncAt: lastSyncAt ?? null,
  };
}

/**
 * Hook for accessing raw offline categories data
 *
 * Returns IOfflineCategory[] instead of Category[] for direct
 * access to cached data without type conversion.
 *
 * @example
 * ```tsx
 * const { categories, isLoading, lastSyncAt } = useOfflineCategoriesRaw();
 * ```
 */
export function useOfflineCategoriesRaw(): {
  categories: IOfflineCategory[] | undefined;
  isLoading: boolean;
  lastSyncAt: string | null;
} {
  const categories = useLiveQuery(async () => {
    try {
      return await getCachedCategories();
    } catch (error) {
      console.error('[useOfflineCategoriesRaw] Error:', error);
      return [];
    }
  });

  const lastSyncAt = useLiveQuery(async () => {
    try {
      return await getLastCategoriesSyncAt();
    } catch {
      return null;
    }
  });

  return {
    categories,
    isLoading: categories === undefined,
    lastSyncAt: lastSyncAt ?? null,
  };
}

/**
 * Hook for getting a single category by ID with offline support
 *
 * Works in both online and offline modes:
 * - Online: Uses useCategories and filters by ID client-side
 * - Offline: Fetches directly from Dexie cache
 *
 * @param categoryId - Category UUID
 */
export function useCategoryOffline(categoryId: string | null): {
  category: Category | undefined;
  isLoading: boolean;
  isOffline: boolean;
} {
  const { isOnline } = useNetworkStatus();
  const onlineResult = useCategories();

  // Offline: fetch from Dexie
  const offlineCategory = useLiveQuery(
    async () => {
      if (isOnline || !categoryId) return null;
      try {
        return await getCachedCategoryById(categoryId);
      } catch (error) {
        console.error('[useCategoryOffline] Error:', error);
        return undefined;
      }
    },
    [isOnline, categoryId]
  );

  // Online: find category in the fetched list
  const onlineCategory = useMemo(() => {
    if (!isOnline || !categoryId || !onlineResult.data) return undefined;
    return onlineResult.data.find((c) => c.id === categoryId);
  }, [isOnline, categoryId, onlineResult.data]);

  if (!categoryId) {
    return {
      category: undefined,
      isLoading: false,
      isOffline: !isOnline,
    };
  }

  if (isOnline) {
    return {
      category: onlineCategory,
      isLoading: onlineResult.isLoading,
      isOffline: false,
    };
  }

  return {
    category: offlineCategory ? mapOfflineToCategory(offlineCategory) : undefined,
    isLoading: offlineCategory === undefined,
    isOffline: true,
  };
}
