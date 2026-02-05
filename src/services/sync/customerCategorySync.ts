/**
 * Customer Category Sync Service
 * Story 6.2 - Customer Category Pricing Offline
 *
 * Handles synchronization of customer categories between Supabase and IndexedDB.
 * Enables offline price calculation based on customer category.
 *
 * @see ADR-001: Customer categories are READ-ONLY cache
 * @see ADR-003: Cache policy (24h TTL)
 */

import { supabase } from '@/lib/supabase';
import { db, type IOfflineCustomerCategory } from '@/lib/db';

// Re-export interface for consumers
export type { IOfflineCustomerCategory };

/**
 * Sync meta entity key for customer categories
 */
const SYNC_META_ENTITY = 'customer_categories';

/**
 * Get last sync timestamp from offline_sync_meta
 */
async function getLastSyncTimestamp(): Promise<string | null> {
  const meta = await db.offline_sync_meta.get(SYNC_META_ENTITY);
  return meta?.lastSyncAt ?? null;
}

/**
 * Update sync metadata in offline_sync_meta
 */
async function updateSyncMeta(timestamp: string, recordCount: number): Promise<void> {
  await db.offline_sync_meta.put({
    entity: SYNC_META_ENTITY,
    lastSyncAt: timestamp,
    recordCount,
  });
}

/**
 * Sync all customer categories from Supabase to IndexedDB
 * Uses incremental sync if last sync timestamp exists
 *
 * @returns Number of categories synced
 */
export async function syncCustomerCategoriesToOffline(): Promise<number> {
  const lastSync = await getLastSyncTimestamp();

  let query = supabase
    .from('customer_categories')
    .select(`
      id,
      slug,
      name,
      price_modifier_type,
      discount_percentage,
      is_active,
      updated_at
    `)
    .order('updated_at', { ascending: false });

  // Incremental sync: only get categories updated since last sync
  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data: categoriesData, error: categoriesError } = await query;

  if (categoriesError) {
    console.error('[CustomerCategorySync] Error fetching customer categories:', categoriesError);
    throw categoriesError;
  }

  if (!categoriesData || categoriesData.length === 0) {
    console.log('[CustomerCategorySync] No new customer categories to sync');
    return 0;
  }

  // Transform to offline format
  const offlineCategories: IOfflineCustomerCategory[] = categoriesData.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    price_modifier_type: c.price_modifier_type,
    discount_percentage: c.discount_percentage,
    is_active: c.is_active ?? true,
  }));

  // Bulk upsert to IndexedDB
  await db.offline_customer_categories.bulkPut(offlineCategories);

  // Handle inactive categories removal on incremental sync
  if (lastSync) {
    const { data: inactiveCategories } = await supabase
      .from('customer_categories')
      .select('id')
      .eq('is_active', false)
      .gt('updated_at', lastSync);

    if (inactiveCategories && inactiveCategories.length > 0) {
      const inactiveIds = inactiveCategories.map((c) => c.id);
      await db.offline_customer_categories.bulkDelete(inactiveIds);
      console.log(`[CustomerCategorySync] Removed ${inactiveIds.length} inactive categories from cache`);
    }
  }

  // Update sync metadata
  const latestTimestamp = categoriesData[0].updated_at || new Date().toISOString();
  const totalCount = await db.offline_customer_categories.count();
  await updateSyncMeta(latestTimestamp, totalCount);

  console.log(`[CustomerCategorySync] Synced ${offlineCategories.length} customer categories`);
  return offlineCategories.length;
}

/**
 * Get all customer categories from IndexedDB for offline use
 *
 * @returns Array of offline customer categories
 */
export async function getAllCustomerCategoriesFromOffline(): Promise<IOfflineCustomerCategory[]> {
  return db.offline_customer_categories.toArray();
}

/**
 * Get active customer categories from IndexedDB
 *
 * @returns Array of active customer categories
 */
export async function getActiveCustomerCategoriesFromOffline(): Promise<IOfflineCustomerCategory[]> {
  return db.offline_customer_categories.where('is_active').equals(1).toArray();
}

/**
 * Get customer category by slug from IndexedDB
 *
 * @param slug Category slug to lookup
 * @returns Customer category or undefined if not found
 */
export async function getCustomerCategoryBySlugOffline(
  slug: string
): Promise<IOfflineCustomerCategory | undefined> {
  return db.offline_customer_categories.where('slug').equals(slug).first();
}

/**
 * Get customer category by ID from IndexedDB
 *
 * @param categoryId Category ID to lookup
 * @returns Customer category or undefined if not found
 */
export async function getCustomerCategoryByIdOffline(
  categoryId: string
): Promise<IOfflineCustomerCategory | undefined> {
  return db.offline_customer_categories.get(categoryId);
}

/**
 * Check if offline customer category data exists
 *
 * @returns true if customer categories are cached locally
 */
export async function hasOfflineCustomerCategoryData(): Promise<boolean> {
  const count = await db.offline_customer_categories.count();
  return count > 0;
}

/**
 * Get count of cached customer categories
 *
 * @returns Number of customer categories in offline DB
 */
export async function getOfflineCustomerCategoryCount(): Promise<number> {
  return db.offline_customer_categories.count();
}

/**
 * Get last sync metadata for customer categories
 *
 * @returns Sync metadata or null if never synced
 */
export async function getCustomerCategoriesSyncMeta(): Promise<{
  lastSyncAt: string | null;
  recordCount: number;
} | null> {
  const meta = await db.offline_sync_meta.get(SYNC_META_ENTITY);
  if (!meta) return null;

  return {
    lastSyncAt: meta.lastSyncAt,
    recordCount: meta.recordCount,
  };
}

/**
 * Clear all offline customer category data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineCustomerCategoryData(): Promise<void> {
  await db.offline_customer_categories.clear();
  await db.offline_sync_meta.delete(SYNC_META_ENTITY);
  console.log('[CustomerCategorySync] Cleared all offline customer category data');
}
