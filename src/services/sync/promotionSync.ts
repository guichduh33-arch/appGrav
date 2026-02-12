/**
 * Promotion Sync Service
 * Story 6.4 - Promotions Offline Cache
 *
 * Handles synchronization of promotions between Supabase and IndexedDB.
 * Enables offline promotion validation for POS operations.
 *
 * @see ADR-001: Promotions are READ-ONLY cache
 * @see ADR-003: Cache policy (24h TTL, 1h refresh)
 */

import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';
import {
  db,
  type IOfflinePromotion,
  type IOfflinePromotionProduct,
  type IOfflinePromotionFreeProduct,
} from '@/lib/db';

// Re-export interfaces for consumers
export type { IOfflinePromotion, IOfflinePromotionProduct, IOfflinePromotionFreeProduct };

/**
 * Sync meta entity key for promotions
 */
const SYNC_META_ENTITY = 'promotions';

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
 * Get current date in ISO format (date only, no time)
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Sync all active and valid promotions from Supabase to IndexedDB
 * Uses incremental sync if last sync timestamp exists
 *
 * Fetches related data:
 * - promotion_products (product/category associations)
 * - promotion_free_products (free products for buy_x_get_y)
 *
 * @returns Number of promotions synced
 */
export async function syncPromotionsToOffline(): Promise<number> {
  const lastSync = await getLastSyncTimestamp();
  const today = getTodayDateString();

  // Build query for active and valid promotions
  let query = supabase
    .from('promotions')
    .select(`
      id,
      code,
      name,
      description,
      promotion_type,
      discount_percentage,
      discount_amount,
      buy_quantity,
      get_quantity,
      start_date,
      end_date,
      time_start,
      time_end,
      days_of_week,
      min_purchase_amount,
      min_quantity,
      is_active,
      is_stackable,
      priority,
      updated_at
    `)
    .eq('is_active', true)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('updated_at', { ascending: false });

  // Incremental sync: only get promotions updated since last sync
  if (lastSync) {
    query = query.gt('updated_at', lastSync);
  }

  const { data: promotionsData, error: promotionsError } = await query;

  if (promotionsError) {
    logger.error('[PromotionSync] Error fetching promotions:', promotionsError);
    throw promotionsError;
  }

  // Fetch all promotion_products for active promotions
  const { data: promotionProductsData, error: ppError } = await supabase
    .from('promotion_products')
    .select('id, promotion_id, product_id, category_id');

  if (ppError) {
    logger.error('[PromotionSync] Error fetching promotion_products:', ppError);
    throw ppError;
  }

  // Fetch all promotion_free_products for active promotions
  const { data: freeProductsData, error: fpError } = await supabase
    .from('promotion_free_products')
    .select('id, promotion_id, free_product_id, quantity');

  if (fpError) {
    logger.error('[PromotionSync] Error fetching promotion_free_products:', fpError);
    throw fpError;
  }

  // Transform promotions to offline format
  const offlinePromotions: IOfflinePromotion[] = (promotionsData || []).map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    promotion_type: p.promotion_type as IOfflinePromotion['promotion_type'],
    discount_percentage: p.discount_percentage,
    discount_amount: p.discount_amount,
    buy_quantity: p.buy_quantity,
    get_quantity: p.get_quantity,
    start_date: p.start_date,
    end_date: p.end_date,
    time_start: p.time_start,
    time_end: p.time_end,
    days_of_week: p.days_of_week,
    min_purchase_amount: p.min_purchase_amount,
    min_quantity: p.min_quantity,
    is_active: p.is_active,
    is_stackable: p.is_stackable ?? false,
    priority: p.priority ?? 0,
    updated_at: p.updated_at || new Date().toISOString(),
  }));

  // Transform promotion_products to offline format
  const offlinePromotionProducts: IOfflinePromotionProduct[] = (promotionProductsData || []).map((pp) => ({
    id: pp.id,
    promotion_id: pp.promotion_id,
    product_id: pp.product_id,
    category_id: pp.category_id,
  }));

  // Transform promotion_free_products to offline format
  const offlineFreeProducts: IOfflinePromotionFreeProduct[] = (freeProductsData || []).map((fp) => ({
    id: fp.id,
    promotion_id: fp.promotion_id,
    free_product_id: fp.free_product_id,
    quantity: fp.quantity ?? 1,
  }));

  // Bulk upsert to IndexedDB
  if (offlinePromotions.length > 0) {
    await db.offline_promotions.bulkPut(offlinePromotions);
  }

  // Get ALL cached promotion IDs (not just newly synced)
  // This is needed for incremental sync to properly filter associations
  const allCachedPromotionIds = new Set(
    (await db.offline_promotions.toArray()).map((p) => p.id)
  );

  // Filter associations to only those with promotions in cache
  const activePromotionProducts = offlinePromotionProducts.filter(
    (pp) => allCachedPromotionIds.has(pp.promotion_id)
  );
  const activeFreeProducts = offlineFreeProducts.filter(
    (fp) => allCachedPromotionIds.has(fp.promotion_id)
  );

  // For full sync, replace all associations
  if (!lastSync) {
    await db.offline_promotion_products.clear();
    await db.offline_promotion_free_products.clear();
  }

  if (activePromotionProducts.length > 0) {
    await db.offline_promotion_products.bulkPut(activePromotionProducts);
  }
  if (activeFreeProducts.length > 0) {
    await db.offline_promotion_free_products.bulkPut(activeFreeProducts);
  }

  // Handle cleanup of expired/inactive promotions
  await cleanupExpiredPromotions();

  // Update sync metadata
  const latestTimestamp = offlinePromotions.length > 0
    ? offlinePromotions[0].updated_at
    : new Date().toISOString();
  const totalCount = await db.offline_promotions.count();
  await updateSyncMeta(latestTimestamp, totalCount);

  logger.debug(`[PromotionSync] Synced ${offlinePromotions.length} promotions`);
  return offlinePromotions.length;
}

/**
 * Remove expired or inactive promotions from cache
 * Also removes associated promotion_products and promotion_free_products
 */
async function cleanupExpiredPromotions(): Promise<void> {
  const today = getTodayDateString();

  // Find expired promotions in local cache
  // Expired = end_date < today OR is_active = false
  const allPromotions = await db.offline_promotions.toArray();
  const expiredIds: string[] = [];

  for (const promo of allPromotions) {
    // Check if end_date passed
    if (promo.end_date && promo.end_date < today) {
      expiredIds.push(promo.id);
      continue;
    }
    // Check if marked inactive (unlikely but possible via incremental sync edge case)
    if (!promo.is_active) {
      expiredIds.push(promo.id);
    }
  }

  if (expiredIds.length === 0) {
    return;
  }

  // Also query server for any promotions that became inactive
  const { data: inactivePromotions } = await supabase
    .from('promotions')
    .select('id')
    .eq('is_active', false);

  if (inactivePromotions && inactivePromotions.length > 0) {
    const inactiveIds = inactivePromotions.map((p) => p.id);
    // Check which inactive promotions exist in our cache
    const existingInactive = await db.offline_promotions
      .where('id')
      .anyOf(inactiveIds)
      .primaryKeys();

    expiredIds.push(...existingInactive);
  }

  // Deduplicate
  const uniqueExpiredIds = [...new Set(expiredIds)];

  if (uniqueExpiredIds.length === 0) {
    return;
  }

  // Delete promotions
  await db.offline_promotions.bulkDelete(uniqueExpiredIds);

  // Delete associated promotion_products
  for (const promotionId of uniqueExpiredIds) {
    await db.offline_promotion_products
      .where('promotion_id')
      .equals(promotionId)
      .delete();
  }

  // Delete associated promotion_free_products
  for (const promotionId of uniqueExpiredIds) {
    await db.offline_promotion_free_products
      .where('promotion_id')
      .equals(promotionId)
      .delete();
  }

  logger.debug(`[PromotionSync] Removed ${uniqueExpiredIds.length} expired/inactive promotions from cache`);
}

/**
 * Get all promotions from IndexedDB for offline use
 *
 * @returns Array of offline promotions
 */
export async function getAllPromotionsFromOffline(): Promise<IOfflinePromotion[]> {
  return db.offline_promotions.toArray();
}

/**
 * Get promotion by ID from IndexedDB
 *
 * @param promotionId Promotion ID to lookup
 * @returns Promotion or undefined if not found
 */
export async function getPromotionByIdOffline(
  promotionId: string
): Promise<IOfflinePromotion | undefined> {
  return db.offline_promotions.get(promotionId);
}

/**
 * Get promotion by code from IndexedDB
 *
 * @param code Promotion code to search
 * @returns Promotion or undefined if not found
 */
export async function getPromotionByCodeOffline(
  code: string
): Promise<IOfflinePromotion | undefined> {
  return db.offline_promotions.where('code').equals(code).first();
}

/**
 * Get promotion_products for a specific promotion
 *
 * @param promotionId Promotion ID
 * @returns Array of promotion-product associations
 */
export async function getPromotionProductsOffline(
  promotionId: string
): Promise<IOfflinePromotionProduct[]> {
  return db.offline_promotion_products.where('promotion_id').equals(promotionId).toArray();
}

/**
 * Get promotions that target a specific product
 *
 * @param productId Product ID
 * @returns Array of promotion IDs that apply to this product
 */
export async function getPromotionIdsByProductOffline(
  productId: string
): Promise<string[]> {
  const associations = await db.offline_promotion_products
    .where('product_id')
    .equals(productId)
    .toArray();
  return associations.map((a) => a.promotion_id);
}

/**
 * Get promotions that target a specific category
 *
 * @param categoryId Category ID
 * @returns Array of promotion IDs that apply to this category
 */
export async function getPromotionIdsByCategoryOffline(
  categoryId: string
): Promise<string[]> {
  const associations = await db.offline_promotion_products
    .where('category_id')
    .equals(categoryId)
    .toArray();
  return associations.map((a) => a.promotion_id);
}

/**
 * Get free products for a specific promotion
 *
 * @param promotionId Promotion ID
 * @returns Array of free product associations
 */
export async function getPromotionFreeProductsOffline(
  promotionId: string
): Promise<IOfflinePromotionFreeProduct[]> {
  return db.offline_promotion_free_products.where('promotion_id').equals(promotionId).toArray();
}

/**
 * Check if offline promotion data exists
 *
 * @returns true if promotions are cached locally
 */
export async function hasOfflinePromotionData(): Promise<boolean> {
  const count = await db.offline_promotions.count();
  return count > 0;
}

/**
 * Get count of cached promotions
 *
 * @returns Number of promotions in offline DB
 */
export async function getOfflinePromotionCount(): Promise<number> {
  return db.offline_promotions.count();
}

/**
 * Get last sync metadata for promotions
 *
 * @returns Sync metadata or null if never synced
 */
export async function getPromotionsSyncMeta(): Promise<{
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
 * Clear all offline promotion data
 * Use with caution - typically only for debugging or reset
 */
export async function clearOfflinePromotionData(): Promise<void> {
  await db.offline_promotions.clear();
  await db.offline_promotion_products.clear();
  await db.offline_promotion_free_products.clear();
  await db.offline_sync_meta.delete(SYNC_META_ENTITY);
  logger.debug('[PromotionSync] Cleared all offline promotion data');
}
