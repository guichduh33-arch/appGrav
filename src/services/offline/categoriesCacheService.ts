/**
 * Categories Cache Service (Story 2.2)
 *
 * Provides offline caching functionality for product categories.
 * Categories are cached at startup and refreshed hourly when online.
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IOfflineCategory, ISyncMeta } from '@/types/offline';
import {
  CATEGORIES_CACHE_TTL_MS,
  CATEGORIES_REFRESH_INTERVAL_MS,
} from '@/types/offline';

/**
 * Cache all categories from Supabase to Dexie
 *
 * Fetches all categories (including inactive) for offline access.
 * Active/raw_material filtering is done at read time.
 *
 * @throws Error if Supabase query fails
 */
export async function cacheAllCategories(): Promise<void> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, color, sort_order, dispatch_station, is_active, is_raw_material, updated_at');

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from categories query');
  }

  // Clear existing cache and add new data
  await db.offline_categories.clear();
  await db.offline_categories.bulkAdd(data as IOfflineCategory[]);

  // Update sync metadata
  await db.offline_sync_meta.put({
    entity: 'categories',
    lastSyncAt: new Date().toISOString(),
    recordCount: data.length,
  });

  console.log(`[CategoriesCache] Cached ${data.length} categories`);
}

/**
 * Get all cached categories filtered for POS display
 *
 * Returns only active, non-raw-material categories sorted by sort_order.
 * This matches the behavior of the online useCategories hook.
 *
 * @returns Array of categories filtered and sorted
 */
export async function getCachedCategories(): Promise<IOfflineCategory[]> {
  const categories = await db.offline_categories.toArray();

  // Filter: is_active = true AND is_raw_material = false
  // Note: Dexie stores booleans as 0/1, use Boolean() for coercion
  return categories
    .filter((c) => Boolean(c.is_active) && !c.is_raw_material)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/**
 * Get all cached categories without filtering
 *
 * Returns all categories in cache, including inactive and raw materials.
 * Sorted by sort_order.
 *
 * @returns Array of all cached categories
 */
export async function getAllCachedCategories(): Promise<IOfflineCategory[]> {
  const categories = await db.offline_categories.toArray();
  return categories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/**
 * Get a single cached category by ID
 *
 * @param id - Category UUID
 * @returns Category if found, undefined otherwise
 */
export async function getCachedCategoryById(
  id: string
): Promise<IOfflineCategory | undefined> {
  return db.offline_categories.get(id);
}

/**
 * Get cached categories count
 *
 * @returns Total number of categories in cache
 */
export async function getCachedCategoriesCount(): Promise<number> {
  return db.offline_categories.count();
}

/**
 * Get timestamp of last categories sync
 *
 * @returns ISO 8601 timestamp or null if never synced
 */
export async function getLastCategoriesSyncAt(): Promise<string | null> {
  const meta = await db.offline_sync_meta.get('categories');
  return meta?.lastSyncAt ?? null;
}

/**
 * Get full sync metadata for categories
 *
 * @returns Sync metadata or undefined if never synced
 */
export async function getCategoriesSyncMeta(): Promise<ISyncMeta | undefined> {
  return db.offline_sync_meta.get('categories');
}

/**
 * Check if categories cache needs refresh (24h TTL)
 *
 * @returns true if cache is stale or doesn't exist
 */
export async function shouldRefreshCategories(): Promise<boolean> {
  const meta = await db.offline_sync_meta.get('categories');

  if (!meta) {
    return true; // Never synced
  }

  const lastSync = new Date(meta.lastSyncAt);
  const now = new Date();
  const elapsed = now.getTime() - lastSync.getTime();

  return elapsed >= CATEGORIES_CACHE_TTL_MS;
}

/**
 * Check if categories cache needs hourly refresh
 *
 * @returns true if more than 1 hour since last sync
 */
export async function shouldRefreshCategoriesHourly(): Promise<boolean> {
  const meta = await db.offline_sync_meta.get('categories');

  if (!meta) {
    return true; // Never synced
  }

  const lastSync = new Date(meta.lastSyncAt);
  const now = new Date();
  const elapsed = now.getTime() - lastSync.getTime();

  return elapsed >= CATEGORIES_REFRESH_INTERVAL_MS;
}

/**
 * Refresh categories cache if needed
 *
 * @param force - Force refresh even if cache is fresh
 * @returns true if cache was refreshed
 */
export async function refreshCategoriesCacheIfNeeded(
  force = false
): Promise<boolean> {
  const needsRefresh = force || (await shouldRefreshCategories());

  if (needsRefresh) {
    await cacheAllCategories();
    return true;
  }

  return false;
}

/**
 * Clear categories cache
 *
 * Removes all categories from IndexedDB and clears sync metadata.
 */
export async function clearCategoriesCache(): Promise<void> {
  await db.offline_categories.clear();
  await db.offline_sync_meta.delete('categories');
  console.log('[CategoriesCache] Cache cleared');
}
