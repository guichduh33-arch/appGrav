/**
 * Products Cache Service (Story 2.1)
 *
 * Manages offline caching of products for POS operations.
 * Follows patterns established in settingsCacheService (Story 1.5).
 *
 * Cache Policy (ADR-003):
 * - TTL: 24 hours max
 * - Refresh: At startup + every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */

import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IOfflineProduct, ISyncMeta } from '@/types/offline';
import {
  PRODUCTS_CACHE_TTL_MS,
  PRODUCTS_REFRESH_INTERVAL_MS,
} from '@/types/offline';

// =====================================================
// Cache Operations
// =====================================================

/**
 * Cache all active products from Supabase to IndexedDB
 *
 * Fetches products with all fields needed for POS operations
 * and stores them in offline_products table.
 *
 * @throws Error if Supabase query fails
 */
export async function cacheAllProducts(): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, category_id, sku, name, product_type, retail_price, wholesale_price, cost_price, current_stock, image_url, is_active, pos_visible, available_for_sale, updated_at'
    )
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from products query');
  }

  // Clear existing cache and replace with fresh data
  await db.offline_products.clear();
  await db.offline_products.bulkAdd(data as IOfflineProduct[]);

  // Update sync metadata
  await db.offline_sync_meta.put({
    entity: 'products',
    lastSyncAt: new Date().toISOString(),
    recordCount: data.length,
  });
}

// =====================================================
// Read Operations
// =====================================================

/**
 * Get cached products filtered for POS display
 *
 * Returns only products that are:
 * - Active (is_active = true)
 * - Visible in POS (pos_visible = true)
 * - Available for sale (available_for_sale = true)
 *
 * Optionally filtered by category.
 *
 * Note: Dexie stores booleans as 0/1 in indexes, so we use equals([1, 1, 1])
 *
 * @param categoryId - Optional category filter
 * @returns Array of products matching criteria
 */
export async function getCachedProducts(
  categoryId?: string | null
): Promise<IOfflineProduct[]> {
  try {
    // Get all products and filter in memory
    // This is more reliable than compound index which has issues with boolean storage
    // Performance is still good for typical product counts (< 1000)
    const allProducts = await db.offline_products.toArray();

    // Filter for POS-visible, active, available products
    // Use Boolean() coercion because Dexie may store booleans as 0/1
    const products = allProducts.filter(
      (p) =>
        Boolean(p.is_active) &&
        Boolean(p.pos_visible) &&
        Boolean(p.available_for_sale)
    );

    // Apply category filter if provided
    if (categoryId) {
      return products.filter((p) => p.category_id === categoryId);
    }

    return products;
  } catch (error) {
    console.error('Error reading cached products:', error);
    return [];
  }
}

/**
 * Get a single cached product by ID
 *
 * @param id - Product UUID
 * @returns Product or undefined if not found
 */
export async function getCachedProductById(
  id: string
): Promise<IOfflineProduct | undefined> {
  try {
    return await db.offline_products.get(id);
  } catch (error) {
    console.error('Error reading cached product:', error);
    return undefined;
  }
}

/**
 * Search cached products by name or SKU
 *
 * Case-insensitive search that matches partial strings.
 * Only searches within POS-visible, active, available products.
 *
 * @param searchQuery - Search term to match against name/sku
 * @returns Array of matching products
 */
export async function searchCachedProducts(
  searchQuery: string
): Promise<IOfflineProduct[]> {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return getCachedProducts();
  }

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const allProducts = await getCachedProducts();

  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      (p.sku && p.sku.toLowerCase().includes(normalizedQuery))
  );
}

// =====================================================
// Sync Metadata Operations
// =====================================================

/**
 * Get the timestamp of the last products sync
 *
 * @returns ISO 8601 timestamp or null if never synced
 */
export async function getLastProductsSyncAt(): Promise<string | null> {
  try {
    const meta = await db.offline_sync_meta.get('products');
    return meta?.lastSyncAt ?? null;
  } catch (error) {
    console.error('Error reading products sync meta:', error);
    return null;
  }
}

/**
 * Get full sync metadata for products
 *
 * @returns Sync metadata or undefined if not synced
 */
export async function getProductsSyncMeta(): Promise<ISyncMeta | undefined> {
  try {
    return await db.offline_sync_meta.get('products');
  } catch (error) {
    console.error('Error reading products sync meta:', error);
    return undefined;
  }
}

/**
 * Get the count of cached products
 *
 * @returns Number of products in cache
 */
export async function getCachedProductsCount(): Promise<number> {
  try {
    return await db.offline_products.count();
  } catch (error) {
    console.error('Error counting cached products:', error);
    return 0;
  }
}

// =====================================================
// Cache Refresh Logic
// =====================================================

/**
 * Check if products cache needs refresh due to TTL expiration (24h)
 *
 * @returns true if cache is stale or doesn't exist
 */
export async function shouldRefreshProducts(): Promise<boolean> {
  const meta = await getProductsSyncMeta();
  if (!meta) return true;

  const lastSync = new Date(meta.lastSyncAt).getTime();
  const now = Date.now();

  return now - lastSync >= PRODUCTS_CACHE_TTL_MS;
}

/**
 * Check if products cache should be refreshed due to hourly interval
 *
 * @returns true if more than 1 hour since last sync
 */
export async function shouldRefreshProductsHourly(): Promise<boolean> {
  const meta = await getProductsSyncMeta();
  if (!meta) return true;

  const lastSync = new Date(meta.lastSyncAt).getTime();
  const now = Date.now();

  return now - lastSync >= PRODUCTS_REFRESH_INTERVAL_MS;
}

/**
 * Refresh products cache if needed (respects TTL/interval)
 *
 * Call at app startup or periodically when online.
 *
 * @param force - If true, refresh regardless of TTL
 * @returns true if cache was refreshed, false if skipped
 */
export async function refreshProductsCacheIfNeeded(
  force = false
): Promise<boolean> {
  if (!force) {
    const needsRefresh = await shouldRefreshProducts();
    if (!needsRefresh) {
      return false;
    }
  }

  await cacheAllProducts();
  return true;
}

/**
 * Clear the products cache
 *
 * Use when logging out or resetting app state.
 */
export async function clearProductsCache(): Promise<void> {
  await db.offline_products.clear();
  await db.offline_sync_meta.delete('products');
}
