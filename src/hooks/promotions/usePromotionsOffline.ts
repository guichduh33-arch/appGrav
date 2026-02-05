/**
 * Promotions Offline Hook
 * Story 6.4 - Promotions Offline Cache
 *
 * Provides reactive access to cached promotions with automatic validation.
 * Uses Dexie's useLiveQuery for real-time updates.
 *
 * @see Story 6.4: AC1-4 - Offline promotion access
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db, type IOfflinePromotion, type IOfflinePromotionProduct, type IOfflinePromotionFreeProduct } from '@/lib/db';
import { isPromotionValidNow, getValidPromotions, sortPromotionsByPriority } from '@/services/sync/promotionValidationService';

// Re-export types for consumers
export type { IOfflinePromotion, IOfflinePromotionProduct, IOfflinePromotionFreeProduct };

/**
 * Hook to get all valid (active and within constraints) promotions
 *
 * Automatically filters out expired, inactive, or time-constrained promotions.
 * Updates reactively when IndexedDB changes.
 *
 * @returns Object with promotions, loading state, and metadata
 *
 * @example
 * ```tsx
 * function PromotionList() {
 *   const { promotions, isLoading, count } = usePromotionsOffline();
 *
 *   if (isLoading) return <Spinner />;
 *   return <ul>{promotions.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
 * }
 * ```
 */
export function usePromotionsOffline() {
  const allPromotions = useLiveQuery(
    () => db.offline_promotions.toArray(),
    [],
    [] as IOfflinePromotion[]
  );

  // Filter to only currently valid promotions
  const validPromotions = getValidPromotions(allPromotions);
  const sortedPromotions = sortPromotionsByPriority(validPromotions);

  return {
    /** All valid promotions, sorted by priority */
    promotions: sortedPromotions,
    /** All promotions including expired (for debugging) */
    allPromotions,
    /** Whether data is still loading */
    isLoading: allPromotions === undefined,
    /** Count of valid promotions */
    count: sortedPromotions.length,
    /** Count of all cached promotions */
    totalCached: allPromotions.length,
  };
}

/**
 * Hook to get promotion-product associations for a specific promotion
 *
 * @param promotionId - Promotion ID to get products for
 * @returns Array of promotion-product associations
 *
 * @example
 * ```tsx
 * const products = usePromotionProductsOffline(selectedPromotion.id);
 * ```
 */
export function usePromotionProductsOffline(
  promotionId: string | null | undefined
): IOfflinePromotionProduct[] {
  const products = useLiveQuery(
    () => {
      if (!promotionId) return [];
      return db.offline_promotion_products
        .where('promotion_id')
        .equals(promotionId)
        .toArray();
    },
    [promotionId],
    [] as IOfflinePromotionProduct[]
  );

  return products;
}

/**
 * Hook to get free products for a specific promotion
 *
 * @param promotionId - Promotion ID to get free products for
 * @returns Array of free product associations
 */
export function usePromotionFreeProductsOffline(
  promotionId: string | null | undefined
): IOfflinePromotionFreeProduct[] {
  const freeProducts = useLiveQuery(
    () => {
      if (!promotionId) return [];
      return db.offline_promotion_free_products
        .where('promotion_id')
        .equals(promotionId)
        .toArray();
    },
    [promotionId],
    [] as IOfflinePromotionFreeProduct[]
  );

  return freeProducts;
}

/**
 * Get valid promotions applicable to a specific product
 *
 * Checks both direct product associations and category associations.
 * Filters to only currently valid promotions.
 *
 * @param productId - Product ID to find promotions for
 * @param categoryId - Product's category ID (for category-level promotions)
 * @returns Array of valid promotions applicable to this product
 */
export async function getPromotionsByProductId(
  productId: string,
  categoryId: string | null = null
): Promise<IOfflinePromotion[]> {
  // Get all promotion IDs that target this product directly
  const productAssociations = await db.offline_promotion_products
    .where('product_id')
    .equals(productId)
    .toArray();

  const promotionIds = new Set(productAssociations.map((a) => a.promotion_id));

  // Also get promotions that target the product's category
  if (categoryId) {
    const categoryAssociations = await db.offline_promotion_products
      .where('category_id')
      .equals(categoryId)
      .toArray();

    categoryAssociations.forEach((a) => promotionIds.add(a.promotion_id));
  }

  // Get promotions without any specific product/category (global promotions)
  const allAssociations = await db.offline_promotion_products.toArray();
  const promotionIdsWithAssociations = new Set(allAssociations.map((a) => a.promotion_id));

  // Get all promotions that have no associations (apply to all products)
  const allPromotions = await db.offline_promotions.toArray();
  const globalPromotions = allPromotions.filter((p) => !promotionIdsWithAssociations.has(p.id));
  globalPromotions.forEach((p) => promotionIds.add(p.id));

  // Fetch all relevant promotions
  const promotions = await db.offline_promotions
    .where('id')
    .anyOf([...promotionIds])
    .toArray();

  // Filter to only valid promotions and sort by priority
  const validPromotions = getValidPromotions(promotions);
  return sortPromotionsByPriority(validPromotions);
}

/**
 * Hook wrapper for getPromotionsByProductId
 *
 * @param productId - Product ID
 * @param categoryId - Product's category ID
 * @returns Object with promotions and loading state
 */
export function usePromotionsByProductOffline(
  productId: string | null | undefined,
  categoryId: string | null = null
) {
  const promotions = useLiveQuery(
    async () => {
      if (!productId) return [];
      return getPromotionsByProductId(productId, categoryId);
    },
    [productId, categoryId],
    [] as IOfflinePromotion[]
  );

  return {
    promotions,
    isLoading: promotions === undefined,
    count: promotions.length,
  };
}

/**
 * Check if a specific promotion is currently valid
 *
 * @param promotionId - Promotion ID to check
 * @returns Object with validity status and promotion data
 */
export function usePromotionValidityOffline(promotionId: string | null | undefined) {
  const promotion = useLiveQuery(
    () => {
      if (!promotionId) return undefined;
      return db.offline_promotions.get(promotionId);
    },
    [promotionId],
    undefined as IOfflinePromotion | undefined
  );

  const isValid = promotion ? isPromotionValidNow(promotion) : false;

  return {
    promotion: promotion ?? null,
    isValid,
    isLoading: promotion === undefined,
  };
}

/**
 * Get sync metadata for promotions
 *
 * @returns Sync metadata including last sync time
 */
export function usePromotionsSyncMeta() {
  const meta = useLiveQuery(
    () => db.offline_sync_meta.get('promotions'),
    [],
    null
  );

  return {
    lastSyncAt: meta?.lastSyncAt ?? null,
    recordCount: meta?.recordCount ?? 0,
    isLoading: meta === undefined,
  };
}
