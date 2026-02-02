/**
 * useStockLevelsOffline Hook
 * Story 5.1 - Offline Stock Levels Cache (Read-Only)
 *
 * Provides reactive access to cached stock levels from IndexedDB.
 * Stock data is READ-ONLY per ADR-001 (modifications remain online-only).
 *
 * @see ADR-001: Entités Synchronisées Offline
 */

import { useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNetworkStatus } from './useNetworkStatus';
import { db } from '@/lib/db';
import {
  getStockLevelsFromOffline,
  getStockLevelByProductId,
} from '@/services/sync/stockSync';
import type { IOfflineStockLevel } from '@/types/offline';

/**
 * Stock level status based on quantity vs minimum
 */
export type TStockStatus = 'ok' | 'warning' | 'critical' | 'out_of_stock';

/**
 * Return type for useStockLevelsOffline hook
 */
export interface IUseStockLevelsOfflineReturn {
  /** Array of stock levels from cache */
  stockLevels: IOfflineStockLevel[];

  /** Whether data is currently loading */
  isLoading: boolean;

  /** Whether we're in offline mode */
  isOffline: boolean;

  /** ISO timestamp of last cache sync */
  lastSyncAt: string | null;

  /** Total count of cached stock records */
  cacheCount: number;

  /** Whether any cached stock data exists */
  hasData: boolean;

  /** Get stock level for a specific product */
  getProductStock: (productId: string) => Promise<IOfflineStockLevel | undefined>;

  /** Get stock status for a specific product */
  getStockStatus: (productId: string) => TStockStatus | null;
}

/**
 * Determine stock status based on quantity and minimum level
 * Exported for use in components that need to calculate status directly
 *
 * @param quantity - Current stock quantity
 * @param minLevel - Minimum stock level threshold
 * @returns Stock status: 'out_of_stock', 'critical', 'warning', or 'ok'
 */
export function calculateStockStatus(
  quantity: number,
  minLevel: number
): TStockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity < 5) return 'critical';
  if (quantity < minLevel) return 'warning';
  return 'ok';
}

/**
 * Hook for accessing cached stock levels with live updates
 *
 * @param productIds - Optional array of product IDs to filter
 * @returns Stock levels with loading/offline status
 *
 * @example
 * ```tsx
 * function StockDisplay({ productId }: { productId: string }) {
 *   const { stockLevels, isOffline, lastSyncAt, getStockStatus } = useStockLevelsOffline([productId]);
 *
 *   const status = getStockStatus(productId);
 *
 *   if (isOffline && lastSyncAt) {
 *     return <OfflineBanner syncTime={lastSyncAt} />;
 *   }
 *
 *   return <StockBadge status={status} />;
 * }
 * ```
 */
/**
 * Internal interface for consolidated query result
 */
interface IStockCacheData {
  stockLevels: IOfflineStockLevel[];
  lastSyncAt: string | null;
  cacheCount: number;
  hasData: boolean;
}

/**
 * Sync meta entity name (must match stockSync.ts)
 */
const STOCK_SYNC_META_ENTITY = 'stock_levels';

export function useStockLevelsOffline(
  productIds?: string[]
): IUseStockLevelsOfflineReturn {
  const { isOnline } = useNetworkStatus();

  // Consolidated query: fetch all stock data in a single useLiveQuery
  // This improves performance and ensures atomic updates
  const cacheData = useLiveQuery(
    async (): Promise<IStockCacheData> => {
      try {
        // Parallel fetch for better performance
        const [stockLevels, syncMeta, totalCount] = await Promise.all([
          getStockLevelsFromOffline(productIds),
          db.offline_sync_meta.get(STOCK_SYNC_META_ENTITY),
          db.offline_stock_levels.count(),
        ]);

        return {
          stockLevels,
          lastSyncAt: syncMeta?.lastSyncAt ?? null,
          cacheCount: totalCount,
          hasData: totalCount > 0,
        };
      } catch (error) {
        console.error('[useStockLevelsOffline] Error loading stock cache:', error);
        return {
          stockLevels: [],
          lastSyncAt: null,
          cacheCount: 0,
          hasData: false,
        };
      }
    },
    [productIds?.join(',')],
    // Default value while loading
    {
      stockLevels: [],
      lastSyncAt: null,
      cacheCount: 0,
      hasData: false,
    }
  );

  // Function to get stock for a specific product
  const getProductStock = useCallback(
    async (productId: string): Promise<IOfflineStockLevel | undefined> => {
      return getStockLevelByProductId(productId);
    },
    []
  );

  // Memoized map for quick status lookups
  const stockMap = useMemo(() => {
    if (!cacheData.stockLevels) return new Map<string, IOfflineStockLevel>();
    return new Map(cacheData.stockLevels.map((s) => [s.product_id, s]));
  }, [cacheData.stockLevels]);

  // Function to get stock status
  const getStockStatus = useCallback(
    (productId: string): TStockStatus | null => {
      const stock = stockMap.get(productId);
      if (!stock) return null;
      return calculateStockStatus(stock.quantity, stock.min_stock_level);
    },
    [stockMap]
  );

  return {
    stockLevels: cacheData.stockLevels,
    isLoading: cacheData === undefined,
    isOffline: !isOnline,
    lastSyncAt: cacheData.lastSyncAt,
    cacheCount: cacheData.cacheCount,
    hasData: cacheData.hasData,
    getProductStock,
    getStockStatus,
  };
}

/**
 * Hook for accessing a single product's stock level
 *
 * @param productId - Product ID to get stock for
 * @returns Single stock level with status
 */
export function useProductStockOffline(productId: string | null): {
  stock: IOfflineStockLevel | null;
  status: TStockStatus | null;
  isLoading: boolean;
} {
  const stock = useLiveQuery(
    async () => {
      if (!productId) return null;
      try {
        return (await getStockLevelByProductId(productId)) ?? null;
      } catch (error) {
        console.error('[useProductStockOffline] Error loading stock:', error);
        return null;
      }
    },
    [productId]
  );

  const status = useMemo(() => {
    if (!stock) return null;
    return calculateStockStatus(stock.quantity, stock.min_stock_level);
  }, [stock]);

  return {
    stock: stock ?? null,
    status,
    isLoading: stock === undefined,
  };
}
