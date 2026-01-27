import { useLiveQuery } from 'dexie-react-hooks';
import {
  offlineDb,
  IOfflineProduct,
  IOfflineCategory,
  IOfflineCustomer,
  IOfflineFloorPlanItem,
  ISyncQueueItem
} from '../services/sync/offlineDb';

/**
 * Error fallback for IndexedDB failures
 * Returns empty array to allow graceful degradation
 */
function handleDbError(error: unknown): [] {
  console.error('[useOfflineData] IndexedDB error:', error);
  return [];
}

/**
 * Hook to get all active products from offline storage
 * @returns Array of active products or undefined while loading
 */
export function useOfflineProducts(): IOfflineProduct[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        return await offlineDb.products.filter(p => p.is_active).toArray();
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
export function useOfflineProductsByCategory(categoryId: string | null): IOfflineProduct[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        return categoryId
          ? await offlineDb.products.where('category_id').equals(categoryId).filter(p => p.is_active).toArray()
          : await offlineDb.products.filter(p => p.is_active).toArray();
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
export function useOfflineCategories(): IOfflineCategory[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        const categories = await offlineDb.categories.filter(c => c.is_active).toArray();
        return categories.sort((a, b) => a.display_order - b.display_order);
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
          ? await offlineDb.customers.where('phone').startsWith(searchPhone).toArray()
          : await offlineDb.customers.toArray();
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
        return customerId ? await offlineDb.customers.get(customerId) : undefined;
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
 * @returns Array of floor plan items or undefined while loading
 */
export function useOfflineFloorPlan(): IOfflineFloorPlanItem[] | undefined {
  return useLiveQuery(
    async () => {
      try {
        return await offlineDb.floor_plan_items.toArray();
      } catch (error) {
        return handleDbError(error);
      }
    }
  );
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
        return await offlineDb.sync_queue.where('status').equals('pending').count();
      } catch (error) {
        console.error('[useOfflineData] IndexedDB error:', error);
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
        return await offlineDb.sync_queue.toArray();
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
  products: IOfflineProduct[] | undefined;
  categories: IOfflineCategory[] | undefined;
} {
  const products = useOfflineProducts();
  const categories = useOfflineCategories();

  return { products, categories };
}
