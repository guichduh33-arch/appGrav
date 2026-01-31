/**
 * Offline Modifiers Hook
 *
 * Provides transparent access to product modifiers whether online or offline.
 * When online, delegates to useProductModifiersForPOS for fresh data.
 * When offline, reads from IndexedDB cache via modifiersCacheService.
 *
 * @see Story 2.3: Product Modifiers Offline Cache
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { useNetworkStatus } from '../useNetworkStatus';
import { useProductModifiersForPOS } from '../products/useProductModifiers';
import {
  resolveOfflineModifiers,
  getLastModifiersSyncAt,
  groupOfflineModifiers,
  getCachedModifiersForProduct,
  getCachedModifiersForCategory,
} from '@/services/offline/modifiersCacheService';
import { db } from '@/lib/db';

// =====================================================
// Main Hook: useModifiersOffline
// =====================================================

/**
 * Hook for accessing product modifiers with offline support.
 *
 * Features:
 * - Transparent online/offline switching
 * - Returns same ModifierGroup[] format as online hook
 * - Handles product > category inheritance
 * - Provides cache timestamp for staleness indicators
 *
 * @param productId - The product UUID (optional)
 * @param categoryId - The category UUID (optional)
 * @returns Object with modifierGroups, loading state, offline indicator
 */
export function useModifiersOffline(
  productId: string | undefined,
  categoryId: string | null | undefined
) {
  const { isOnline } = useNetworkStatus();
  const onlineResult = useProductModifiersForPOS(productId, categoryId);

  // Offline: use Dexie with live updates
  const offlineModifiers = useLiveQuery(
    async () => {
      // Skip if online - we'll use onlineResult instead
      if (isOnline) return null;

      try {
        return await resolveOfflineModifiers(productId, categoryId ?? undefined);
      } catch (error) {
        console.error('[useModifiersOffline] Error loading offline modifiers:', error);
        return [];
      }
    },
    [isOnline, productId, categoryId]
  );

  // Get last sync timestamp for offline mode
  const lastSyncAt = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await getLastModifiersSyncAt();
      } catch (error) {
        console.error('[useModifiersOffline] Error getting sync timestamp:', error);
        return null;
      }
    },
    [isOnline]
  );

  return {
    /** Resolved modifier groups (product + inherited category) */
    modifierGroups: isOnline
      ? (onlineResult.data ?? [])
      : (offlineModifiers ?? []),

    /** Whether data is still loading */
    isLoading: isOnline
      ? onlineResult.isLoading
      : offlineModifiers === undefined,

    /** Whether currently in offline mode */
    isOffline: !isOnline,

    /** Error from online query (null when offline) */
    error: isOnline ? onlineResult.error : null,

    /** Last sync timestamp (ISO 8601) - only available offline */
    lastSyncAt,

    /** Whether online query is fetching */
    isFetching: isOnline ? onlineResult.isFetching : false,
  };
}

// =====================================================
// Raw Data Hook: useOfflineModifiersRaw
// =====================================================

/**
 * Hook for accessing raw offline modifier data without resolution.
 *
 * This hook provides direct access to IOfflineModifier[] from IndexedDB
 * without applying the product > category inheritance logic.
 *
 * Useful for debugging or when you need the raw cached data.
 *
 * @returns Object with raw modifiers, count, and loading state
 */
export function useOfflineModifiersRaw() {
  const { isOnline } = useNetworkStatus();

  const modifiers = useLiveQuery(
    async () => {
      try {
        return await db.offline_modifiers.toArray();
      } catch (error) {
        console.error('[useOfflineModifiersRaw] Error loading modifiers:', error);
        return [];
      }
    },
    []
  );

  const syncMeta = useLiveQuery(
    async () => {
      try {
        return await db.offline_sync_meta.get('modifiers');
      } catch (error) {
        console.error('[useOfflineModifiersRaw] Error loading sync meta:', error);
        return null;
      }
    },
    []
  );

  return {
    /** All cached modifiers (raw IOfflineModifier[]) */
    modifiers: modifiers ?? [],

    /** Number of cached modifiers */
    count: modifiers?.length ?? 0,

    /** Whether data is still loading */
    isLoading: modifiers === undefined,

    /** Whether currently online */
    isOnline,

    /** Sync metadata */
    syncMeta: syncMeta ?? null,
  };
}

// =====================================================
// Product-Specific Hook: useProductModifiersOffline
// =====================================================

/**
 * Hook for accessing modifiers for a specific product (offline-aware).
 *
 * Returns only product-specific modifiers (not category).
 * Use useModifiersOffline for resolved modifiers with inheritance.
 *
 * @param productId - The product UUID
 * @returns Object with product modifiers and loading state
 */
export function useProductModifiersOffline(productId: string | undefined) {
  const { isOnline } = useNetworkStatus();

  const modifiers = useLiveQuery(
    async () => {
      if (!productId) return [];
      try {
        const raw = await getCachedModifiersForProduct(productId);
        return groupOfflineModifiers(raw, false);
      } catch (error) {
        console.error('[useProductModifiersOffline] Error:', error);
        return [];
      }
    },
    [productId]
  );

  return {
    /** Product-specific modifier groups */
    modifierGroups: modifiers ?? [],

    /** Whether data is still loading */
    isLoading: modifiers === undefined,

    /** Whether currently online */
    isOnline,
  };
}

// =====================================================
// Category-Specific Hook: useCategoryModifiersOffline
// =====================================================

/**
 * Hook for accessing modifiers for a specific category (offline-aware).
 *
 * Returns only category-level modifiers.
 * Use useModifiersOffline for resolved modifiers with inheritance.
 *
 * @param categoryId - The category UUID
 * @returns Object with category modifiers and loading state
 */
export function useCategoryModifiersOffline(categoryId: string | undefined) {
  const { isOnline } = useNetworkStatus();

  const modifiers = useLiveQuery(
    async () => {
      if (!categoryId) return [];
      try {
        const raw = await getCachedModifiersForCategory(categoryId);
        return groupOfflineModifiers(raw, true);
      } catch (error) {
        console.error('[useCategoryModifiersOffline] Error:', error);
        return [];
      }
    },
    [categoryId]
  );

  return {
    /** Category modifier groups */
    modifierGroups: modifiers ?? [],

    /** Whether data is still loading */
    isLoading: modifiers === undefined,

    /** Whether currently online */
    isOnline,
  };
}
