/**
 * useProductsOffline Hook (Story 2.1)
 *
 * Provides transparent online/offline access to products.
 * Automatically switches between Supabase (online) and Dexie (offline).
 *
 * Follows patterns established in useSettingsOffline (Story 1.5).
 *
 * @see ADR-001: Entités Synchronisées Offline
 */

import { useMemo, useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { logError } from '@/utils/logger';
import { useNetworkStatus } from './useNetworkStatus';
import { useProducts } from '../products/useProductList';
import {
  getCachedProducts,
  searchCachedProducts,
  getLastProductsSyncAt,
  getProductsSyncMeta,
} from '@/services/offline/productsCacheService';
import type { IOfflineProduct, ISyncMeta } from '@/types/offline';
import type { ProductWithCategory } from '@/types/database';

/**
 * Return type for useProductsOffline hook
 */
export interface IUseProductsOfflineReturn {
  /** Array of products (from Supabase or cache) */
  data: ProductWithCategory[];

  /** Whether data is currently loading */
  isLoading: boolean;

  /** Whether we're in offline mode */
  isOffline: boolean;

  /** Error if any occurred (online mode only) */
  error: Error | null;

  /** ISO timestamp of last cache sync (offline mode info) */
  lastSyncAt: string | null;

  /** Sync metadata for cache status display */
  syncMeta: ISyncMeta | undefined;

  /** Search products by name or SKU */
  searchProducts: (query: string) => Promise<IOfflineProduct[]>;
}

/**
 * Map offline product to ProductWithCategory format
 *
 * Converts IOfflineProduct to the shape expected by existing components.
 * Category is loaded separately, so we set it to null here.
 */
function mapToProductWithCategory(product: IOfflineProduct): ProductWithCategory {
  // The offline cache has a subset of Product fields, so we provide defaults for missing ones
  return {
    id: product.id,
    category_id: product.category_id,
    sku: product.sku,
    name: product.name,
    product_type: product.product_type,
    retail_price: product.retail_price,
    wholesale_price: product.wholesale_price,
    cost_price: product.cost_price,
    image_url: product.image_url,
    is_active: Boolean(product.is_active),
    pos_visible: Boolean(product.pos_visible),
    available_for_sale: Boolean(product.available_for_sale),
    updated_at: product.updated_at,
    // Set nullable fields that aren't in offline cache
    category: null,
    // Include other required Product fields with defaults
    created_at: product.updated_at,
  } as ProductWithCategory;
}

/**
 * Hook for accessing products with automatic online/offline switching
 *
 * @param categoryId - Optional category filter
 * @returns Products data with loading/offline status
 *
 * @example
 * ```tsx
 * function ProductGrid({ categoryId }: { categoryId?: string }) {
 *   const { data, isLoading, isOffline, lastSyncAt } = useProductsOffline(categoryId);
 *
 *   if (isOffline && lastSyncAt) {
 *     return <OfflineBanner syncTime={lastSyncAt} />;
 *   }
 *
 *   return <Grid products={data} />;
 * }
 * ```
 */
export function useProductsOffline(
  categoryId: string | null = null
): IUseProductsOfflineReturn {
  const { isOnline } = useNetworkStatus();
  const [offlineError, setOfflineError] = useState<Error | null>(null);

  // Online: use existing useProducts hook (Supabase via React Query)
  const onlineResult = useProducts(categoryId);

  // Offline: use Dexie with live updates
  const offlineProducts = useLiveQuery(
    async () => {
      if (isOnline) {
        setOfflineError(null);
        return null;
      }
      try {
        setOfflineError(null);
        return await getCachedProducts(categoryId);
      } catch (error) {
        logError('Error loading offline products', error);
        setOfflineError(error instanceof Error ? error : new Error('Failed to load offline products'));
        return [];
      }
    },
    [isOnline, categoryId]
  );

  // Get sync metadata for offline mode
  const syncMeta = useLiveQuery(
    async () => {
      if (isOnline) return undefined;
      try {
        return await getProductsSyncMeta();
      } catch (error) {
        logError('Error loading sync meta', error);
        return undefined;
      }
    },
    [isOnline]
  );

  // Get last sync timestamp
  const lastSyncAt = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await getLastProductsSyncAt();
      } catch (error) {
        logError('Error loading last sync time', error);
        return null;
      }
    },
    [isOnline]
  );

  // Search function that works offline
  const searchProducts = useCallback(
    async (query: string): Promise<IOfflineProduct[]> => {
      return searchCachedProducts(query);
    },
    []
  );

  // Convert offline products to ProductWithCategory format
  const offlineData = useMemo(() => {
    if (!offlineProducts) return [];
    return offlineProducts.map(mapToProductWithCategory);
  }, [offlineProducts]);

  // Determine loading state
  const isLoading = isOnline
    ? onlineResult.isLoading
    : offlineProducts === undefined;

  // Determine data source
  const data = isOnline ? (onlineResult.data ?? []) : offlineData;

  // Error from online mode or offline mode
  const error = isOnline
    ? (onlineResult.error as Error | null)
    : offlineError;

  return {
    data,
    isLoading,
    isOffline: !isOnline,
    error,
    lastSyncAt: lastSyncAt ?? null,
    syncMeta,
    searchProducts,
  };
}

/**
 * Hook variant that returns raw offline products (not mapped)
 *
 * Use this when you need direct access to IOfflineProduct interface,
 * such as for search results or custom rendering.
 */
export function useOfflineProductsRaw(
  categoryId: string | null = null
): {
  products: IOfflineProduct[];
  isLoading: boolean;
  syncMeta: ISyncMeta | undefined;
} {
  const products = useLiveQuery(
    async () => {
      try {
        return await getCachedProducts(categoryId);
      } catch (error) {
        logError('Error loading offline products', error);
        return [];
      }
    },
    [categoryId]
  );

  const syncMeta = useLiveQuery(
    async () => {
      try {
        return await getProductsSyncMeta();
      } catch (error) {
        logError('Error loading sync meta', error);
        return undefined;
      }
    },
    []
  );

  return {
    products: products ?? [],
    isLoading: products === undefined,
    syncMeta,
  };
}
