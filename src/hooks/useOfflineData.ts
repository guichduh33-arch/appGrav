/**
 * useOfflineData Hooks
 *
 * Provides React hooks for accessing offline cached data with live updates.
 *
 * @migration Uses db.ts (unified schema) instead of legacy offlineDb.ts
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type {
  IOfflineCustomer,
  ILegacySyncQueueItem,
} from '@/types/offline';
import logger from '@/utils/logger';

// Legacy type aliases for backward compatibility
type ISyncQueueItem = ILegacySyncQueueItem;

/**
 * Legacy product interface for this hook (maps from official IOfflineProduct)
 */
interface ILegacyProduct {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  price: number;
  is_active: boolean;
  image_url: string | null;
  updated_at: string;
}

/**
 * Legacy category interface for this hook
 */
interface ILegacyCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

/**
 * Legacy floor plan item interface
 * @deprecated Floor plan items not in official schema
 */
interface ILegacyFloorPlanItem {
  id: string;
  table_number: number;
  label: string;
  capacity: number;
  position_x: number;
  position_y: number;
}

// Re-export legacy interfaces
export type { ILegacyProduct as IOfflineProduct };
export type { ILegacyCategory as IOfflineCategory };
export type { IOfflineCustomer };
export type { ILegacyFloorPlanItem as IOfflineFloorPlanItem };
export type { ISyncQueueItem };

/**
 * Error fallback for IndexedDB failures
 * Returns empty array to allow graceful degradation
 */
function handleDbError(error: unknown): [] {
  logger.error('[useOfflineData] IndexedDB error:', error);
  return [];
}

/**
 * Hook to get all active products from offline storage
 * @returns Array of active products or undefined while loading
 */
export function useOfflineProducts(): ILegacyProduct[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        const products = await db.offline_products.filter(p => Boolean(p.is_active)).toArray();
        // Map to legacy format
        return products.map(p => ({
          id: p.id,
          category_id: p.category_id,
          name: p.name,
          sku: p.sku,
          price: p.retail_price,
          is_active: Boolean(p.is_active),
          image_url: p.image_url,
          updated_at: p.updated_at,
        }));
      } catch (error) {
        return handleDbError(error);
      }
    }
  );
}

/**
 * Hook to get products by category from offline storage
 * @param categoryId - Category ID to filter by (null returns all)
 * @returns Array of products in category or undefined while loading
 */
export function useOfflineProductsByCategory(categoryId: string | null): ILegacyProduct[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        let products;
        if (categoryId) {
          products = await db.offline_products
            .where('category_id')
            .equals(categoryId)
            .filter(p => Boolean(p.is_active))
            .toArray();
        } else {
          products = await db.offline_products
            .filter(p => Boolean(p.is_active))
            .toArray();
        }
        // Map to legacy format
        return products.map(p => ({
          id: p.id,
          category_id: p.category_id,
          name: p.name,
          sku: p.sku,
          price: p.retail_price,
          is_active: Boolean(p.is_active),
          image_url: p.image_url,
          updated_at: p.updated_at,
        }));
      } catch (error) {
        return handleDbError(error);
      }
    },
    [categoryId]
  );
}

/**
 * Hook to get all active categories from offline storage
 * @returns Array of active categories sorted by display_order, or undefined while loading
 */
export function useOfflineCategories(): ILegacyCategory[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        const categories = await db.offline_categories.filter(c => Boolean(c.is_active)).toArray();
        // Map to legacy format and sort
        return categories
          .map(c => ({
            id: c.id,
            name: c.name,
            display_order: c.sort_order ?? 0,
            is_active: Boolean(c.is_active),
          }))
          .sort((a, b) => a.display_order - b.display_order);
      } catch (error) {
        return handleDbError(error);
      }
    }
  );
}

/**
 * Hook to search customers by phone from offline storage
 * @param searchPhone - Phone number prefix to search (optional)
 * @returns Array of matching customers or undefined while loading
 */
export function useOfflineCustomers(searchPhone?: string): IOfflineCustomer[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        return searchPhone
          ? await db.offline_customers.where('phone').startsWith(searchPhone).toArray()
          : await db.offline_customers.toArray();
      } catch (error) {
        return handleDbError(error);
      }
    },
    [searchPhone]
  );
}

/**
 * Hook to get a single customer by ID from offline storage
 * @param customerId - Customer ID to lookup
 * @returns Customer or undefined if not found/loading
 */
export function useOfflineCustomerById(customerId: string | null): IOfflineCustomer | undefined {
  return useLiveQuery(
    async () => {
      try {
        return customerId ? await db.offline_customers.get(customerId) : undefined;
      } catch (error) {
        handleDbError(error);
        return undefined;
      }
    },
    [customerId]
  );
}

/**
 * Hook to get floor plan items from offline storage
 * @deprecated Floor plan items not supported in unified schema - returns empty array
 * @returns Empty array (feature deprecated)
 */
export function useOfflineFloorPlan(): ILegacyFloorPlanItem[] | undefined {
  logger.warn('[useOfflineData] useOfflineFloorPlan is deprecated - floor plan items not in unified schema');
  return [];
}

/**
 * Hook to get pending sync queue count
 * Used for displaying pending transaction counter (FR5)
 * @returns Count of pending items or 0 on error
 */
export function useOfflineSyncQueueCount(): number | undefined {
  return useLiveQuery(
    async () => {
      try {
        return await db.offline_legacy_sync_queue.where('status').equals('pending').count();
      } catch (error) {
        logger.error('[useOfflineData] IndexedDB error:', error);
        return 0;
      }
    }
  );
}

/**
 * Hook to get all sync queue items
 * Used for manager sync status dashboard (FR25)
 * @returns Array of sync queue items or undefined while loading
 */
export function useOfflineSyncQueue(): ISyncQueueItem[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        return await db.offline_legacy_sync_queue.toArray();
      } catch (error) {
        return handleDbError(error);
      }
    }
  );
}

/**
 * Combined hook for offline data - products and categories
 * Used by mobile catalog page
 * @returns Object with products and categories arrays
 */
export function useOfflineData(): {
  products: ILegacyProduct[] | undefined;
  categories: ILegacyCategory[] | undefined;
} {
  const products = useOfflineProducts();
  const categories = useOfflineCategories();

  return { products, categories };
}
