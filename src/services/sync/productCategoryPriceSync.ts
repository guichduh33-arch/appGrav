/**
 * Product Category Price Sync Service
 * Story 6.2 - Customer Category Pricing Offline
 *
 * Handles synchronization of product category prices between Supabase and IndexedDB.
 * Enables offline price calculation for custom category pricing.
 *
 * @see ADR-001: Product category prices are READ-ONLY cache
 * @see ADR-003: Cache policy (24h TTL)
 */

import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';
import { db, type IOfflineProductCategoryPrice } from '@/lib/db';

// Re-export interface for consumers
export type { IOfflineProductCategoryPrice };

/**
 * Sync meta entity key for product category prices
 */
const SYNC_META_ENTITY = 'product_category_prices';

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
 * Sync all product category prices from Supabase to IndexedDB
 * Uses incremental sync if last sync timestamp exists
 *
 * @returns Number of prices synced
 */
export async function syncProductCategoryPricesToOffline(): Promise<number> {
  const lastSync = await getLastSyncTimestamp();

  let query = supabase
    .from('product_category_prices')
    .select(`
      id,
      product_id,
      customer_category_id,
      price,
      is_active,
      updated_at
    `)
    .order('updated_at', { ascending: false });

  // Incremental sync: only get prices updated since last sync
  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data: pricesData, error: pricesError } = await query;

  if (pricesError) {
    console.error('[ProductCategoryPriceSync] Error fetching product category prices:', pricesError);
    throw pricesError;
  }

  if (!pricesData || pricesData.length === 0) {
    logger.debug('[ProductCategoryPriceSync] No new product category prices to sync');
    return 0;
  }

  // Transform to offline format
  const offlinePrices: IOfflineProductCategoryPrice[] = pricesData.map((p) => ({
    id: p.id,
    product_id: p.product_id,
    customer_category_id: p.customer_category_id,
    price: p.price,
    is_active: p.is_active ?? true,
    updated_at: p.updated_at || new Date().toISOString(),
  }));

  // Bulk upsert to IndexedDB
  await db.offline_product_category_prices.bulkPut(offlinePrices);

  // Handle inactive prices removal on incremental sync
  if (lastSync) {
    const { data: inactivePrices } = await supabase
      .from('product_category_prices')
      .select('id')
      .eq('is_active', false)
      .gt('updated_at', lastSync);

    if (inactivePrices && inactivePrices.length > 0) {
      const inactiveIds = inactivePrices.map((p) => p.id);
      await db.offline_product_category_prices.bulkDelete(inactiveIds);
      logger.debug(`[ProductCategoryPriceSync] Removed ${inactiveIds.length} inactive prices from cache`);
    }
  }

  // Update sync metadata
  const latestTimestamp = pricesData[0].updated_at || new Date().toISOString();
  const totalCount = await db.offline_product_category_prices.count();
  await updateSyncMeta(latestTimestamp, totalCount);

  logger.debug(`[ProductCategoryPriceSync] Synced ${offlinePrices.length} product category prices`);
  return offlinePrices.length;
}

/**
 * Get all product category prices from IndexedDB for offline use
 *
 * @returns Array of offline product category prices
 */
export async function getAllProductCategoryPricesFromOffline(): Promise<IOfflineProductCategoryPrice[]> {
  return db.offline_product_category_prices.toArray();
}

/**
 * Get custom price for a specific product and customer category
 * Uses compound index [product_id+customer_category_id]
 *
 * @param productId Product ID
 * @param customerCategoryId Customer category ID
 * @returns Custom price or undefined if not found
 */
export async function getProductCategoryPriceOffline(
  productId: string,
  customerCategoryId: string
): Promise<IOfflineProductCategoryPrice | undefined> {
  return db.offline_product_category_prices
    .where('[product_id+customer_category_id]')
    .equals([productId, customerCategoryId])
    .first();
}

/**
 * Get all custom prices for a specific product
 *
 * @param productId Product ID
 * @returns Array of custom prices for this product
 */
export async function getProductPricesForAllCategoriesOffline(
  productId: string
): Promise<IOfflineProductCategoryPrice[]> {
  return db.offline_product_category_prices
    .where('product_id')
    .equals(productId)
    .filter((p) => p.is_active)
    .toArray();
}

/**
 * Get all custom prices for a specific customer category
 *
 * @param customerCategoryId Customer category ID
 * @returns Array of custom prices for this category
 */
export async function getCategoryPricesForAllProductsOffline(
  customerCategoryId: string
): Promise<IOfflineProductCategoryPrice[]> {
  return db.offline_product_category_prices
    .where('customer_category_id')
    .equals(customerCategoryId)
    .filter((p) => p.is_active)
    .toArray();
}

/**
 * Check if offline product category price data exists
 *
 * @returns true if prices are cached locally
 */
export async function hasOfflineProductCategoryPriceData(): Promise<boolean> {
  const count = await db.offline_product_category_prices.count();
  return count > 0;
}

/**
 * Get count of cached product category prices
 *
 * @returns Number of prices in offline DB
 */
export async function getOfflineProductCategoryPriceCount(): Promise<number> {
  return db.offline_product_category_prices.count();
}

/**
 * Get last sync metadata for product category prices
 *
 * @returns Sync metadata or null if never synced
 */
export async function getProductCategoryPricesSyncMeta(): Promise<{
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
 * Clear all offline product category price data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflineProductCategoryPriceData(): Promise<void> {
  await db.offline_product_category_prices.clear();
  await db.offline_sync_meta.delete(SYNC_META_ENTITY);
  logger.debug('[ProductCategoryPriceSync] Cleared all offline product category price data');
}
