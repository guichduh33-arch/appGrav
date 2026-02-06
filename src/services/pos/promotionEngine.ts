/**
 * Promotion Engine
 * Story 6.5 - Automatic Promotion Application
 *
 * Pure evaluation engine that calculates applicable promotions for cart items.
 * No side effects - takes inputs and returns computed discounts.
 *
 * Performance target: < 50ms for full cart evaluation.
 *
 * @see Story 6.5: AC1-4
 * @see Story 6.4: Promotions Offline Cache (data source)
 */

import type { CartItem } from '@/stores/cartStore'
import type {
  IOfflinePromotion,
  IOfflinePromotionProduct,
  IOfflinePromotionFreeProduct,
} from '@/types/offline'

// =====================================================
// Types
// =====================================================

/**
 * Discount applied to a specific cart item by a promotion
 */
export interface IItemPromotionDiscount {
  /** Cart item ID receiving the discount */
  itemId: string
  /** Promotion that generated this discount */
  promotionId: string
  /** Promotion display name */
  promotionName: string
  /** Promotion code */
  promotionCode: string
  /** Discount amount in IDR for this item (total, not per-unit) */
  discountAmount: number
  /** Type of discount applied */
  discountType: IOfflinePromotion['promotion_type']
  /** Description for display (e.g., "10% off", "Buy 2 Get 1") */
  description: string
}

/**
 * Result of evaluating all promotions against the cart
 */
export interface IPromotionEvaluationResult {
  /** Discounts applied per cart item */
  itemDiscounts: IItemPromotionDiscount[]
  /** Total promotion discount amount across all items */
  totalDiscount: number
  /** Summary of applied promotions for display */
  appliedPromotions: Array<{
    promotionId: string
    promotionName: string
    promotionCode: string
    totalDiscount: number
  }>
}

// =====================================================
// Main Evaluation Function
// =====================================================

/**
 * Evaluate all active promotions against the current cart
 *
 * For each eligible item, finds applicable promotions and selects the best one
 * (highest discount) unless promotions are stackable.
 *
 * @param cartItems - Current cart items
 * @param promotions - Valid promotions (already filtered by date/time/day)
 * @param promotionProducts - Product/category associations for each promotion
 * @param freeProducts - Free products for buy_x_get_y promotions
 * @returns Evaluation result with per-item discounts and totals
 */
export function evaluatePromotions(
  cartItems: CartItem[],
  promotions: IOfflinePromotion[],
  promotionProducts: IOfflinePromotionProduct[],
  freeProducts: IOfflinePromotionFreeProduct[]
): IPromotionEvaluationResult {
  if (cartItems.length === 0 || promotions.length === 0) {
    return { itemDiscounts: [], totalDiscount: 0, appliedPromotions: [] }
  }

  // Build lookup maps for performance
  const promoProductMap = buildPromoProductMap(promotionProducts)
  const freeProductMap = buildFreeProductMap(freeProducts)
  const promosWithoutTargets = getGlobalPromotions(promotions, promotionProducts)

  // Cart-level total for min_purchase_amount checks
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  // Collect all candidate discounts per item
  const allItemDiscounts: IItemPromotionDiscount[] = []

  for (const item of cartItems) {
    // Skip combos (promotions don't apply to combos)
    if (item.type === 'combo') continue

    const productId = item.product?.id
    const categoryId = item.product?.category_id
    if (!productId) continue

    // Find applicable promotions for this item
    const applicablePromos = findApplicablePromotions(
      productId,
      categoryId ?? null,
      promotions,
      promoProductMap,
      promosWithoutTargets
    )

    // Evaluate each applicable promotion
    const candidates: IItemPromotionDiscount[] = []

    for (const promo of applicablePromos) {
      // Check min_purchase_amount
      if (promo.min_purchase_amount && cartSubtotal < promo.min_purchase_amount) {
        continue
      }

      // Check min_quantity
      if (promo.min_quantity && item.quantity < promo.min_quantity) {
        continue
      }

      const discount = calculateDiscount(item, promo, freeProductMap)
      if (discount && discount.discountAmount > 0) {
        candidates.push(discount)
      }
    }

    if (candidates.length === 0) continue

    // Select best discount(s) for this item
    const selected = selectBestDiscounts(candidates, promotions)
    allItemDiscounts.push(...selected)
  }

  // Build summary
  const totalDiscount = allItemDiscounts.reduce((sum, d) => sum + d.discountAmount, 0)
  const appliedPromotions = buildAppliedPromotionsSummary(allItemDiscounts)

  return {
    itemDiscounts: allItemDiscounts,
    totalDiscount,
    appliedPromotions,
  }
}

// =====================================================
// Lookup Helpers
// =====================================================

/**
 * Build a map: promotionId -> array of product/category associations
 */
function buildPromoProductMap(
  promotionProducts: IOfflinePromotionProduct[]
): Map<string, IOfflinePromotionProduct[]> {
  const map = new Map<string, IOfflinePromotionProduct[]>()
  for (const pp of promotionProducts) {
    const existing = map.get(pp.promotion_id) ?? []
    existing.push(pp)
    map.set(pp.promotion_id, existing)
  }
  return map
}

/**
 * Build a map: promotionId -> array of free products
 */
function buildFreeProductMap(
  freeProducts: IOfflinePromotionFreeProduct[]
): Map<string, IOfflinePromotionFreeProduct[]> {
  const map = new Map<string, IOfflinePromotionFreeProduct[]>()
  for (const fp of freeProducts) {
    const existing = map.get(fp.promotion_id) ?? []
    existing.push(fp)
    map.set(fp.promotion_id, existing)
  }
  return map
}

/**
 * Get promotions with no product/category associations (apply to all products)
 */
function getGlobalPromotions(
  promotions: IOfflinePromotion[],
  promotionProducts: IOfflinePromotionProduct[]
): Set<string> {
  const promosWithTargets = new Set(promotionProducts.map(pp => pp.promotion_id))
  const globalIds = new Set<string>()
  for (const promo of promotions) {
    if (!promosWithTargets.has(promo.id)) {
      globalIds.add(promo.id)
    }
  }
  return globalIds
}

// =====================================================
// Promotion Matching
// =====================================================

/**
 * Find all promotions applicable to a specific product
 */
function findApplicablePromotions(
  productId: string,
  categoryId: string | null,
  promotions: IOfflinePromotion[],
  promoProductMap: Map<string, IOfflinePromotionProduct[]>,
  globalPromotionIds: Set<string>
): IOfflinePromotion[] {
  const applicable: IOfflinePromotion[] = []

  for (const promo of promotions) {
    // Global promotions apply to all products
    if (globalPromotionIds.has(promo.id)) {
      applicable.push(promo)
      continue
    }

    // Check product/category associations
    const associations = promoProductMap.get(promo.id)
    if (!associations) continue

    const matches = associations.some(
      a => a.product_id === productId || (categoryId && a.category_id === categoryId)
    )
    if (matches) {
      applicable.push(promo)
    }
  }

  return applicable
}

// =====================================================
// Discount Calculation
// =====================================================

/**
 * Calculate the discount amount for a cart item from a specific promotion
 */
function calculateDiscount(
  item: CartItem,
  promo: IOfflinePromotion,
  _freeProductMap: Map<string, IOfflinePromotionFreeProduct[]>
): IItemPromotionDiscount | null {
  switch (promo.promotion_type) {
    case 'percentage':
      return calculatePercentageDiscount(item, promo)

    case 'fixed_amount':
      return calculateFixedAmountDiscount(item, promo)

    case 'buy_x_get_y':
      return calculateBuyXGetYDiscount(item, promo)

    case 'free_product':
      // free_product promotions add a free item - handled at cart level, not as item discount
      // For now, we skip these (they would need separate cart-level logic to add items)
      return null

    default:
      return null
  }
}

/**
 * Calculate percentage discount
 * e.g., 10% off => discount = totalPrice * 10/100
 */
function calculatePercentageDiscount(
  item: CartItem,
  promo: IOfflinePromotion
): IItemPromotionDiscount | null {
  if (!promo.discount_percentage || promo.discount_percentage <= 0) return null

  const discountAmount = Math.round(item.totalPrice * (promo.discount_percentage / 100))

  return {
    itemId: item.id,
    promotionId: promo.id,
    promotionName: promo.name,
    promotionCode: promo.code,
    discountAmount,
    discountType: 'percentage',
    description: `${promo.discount_percentage}% off`,
  }
}

/**
 * Calculate fixed amount discount
 * e.g., IDR 5,000 off per item => discount = min(5000 * quantity, totalPrice)
 */
function calculateFixedAmountDiscount(
  item: CartItem,
  promo: IOfflinePromotion
): IItemPromotionDiscount | null {
  if (!promo.discount_amount || promo.discount_amount <= 0) return null

  // Apply fixed discount per unit, capped at item total
  const discountAmount = Math.min(
    Math.round(promo.discount_amount * item.quantity),
    item.totalPrice
  )

  return {
    itemId: item.id,
    promotionId: promo.id,
    promotionName: promo.name,
    promotionCode: promo.code,
    discountAmount,
    discountType: 'fixed_amount',
    description: `IDR ${promo.discount_amount.toLocaleString()} off`,
  }
}

/**
 * Calculate buy X get Y discount
 * e.g., Buy 2 Get 1 Free => every 3rd item is free
 *
 * Logic: For every (buy_quantity + get_quantity) items,
 * get_quantity items are free (cheapest in the group).
 * Discount = get_quantity * unitPrice * number_of_full_groups
 */
function calculateBuyXGetYDiscount(
  item: CartItem,
  promo: IOfflinePromotion
): IItemPromotionDiscount | null {
  const buyQty = promo.buy_quantity
  const getQty = promo.get_quantity
  if (!buyQty || !getQty || buyQty <= 0 || getQty <= 0) return null

  const groupSize = buyQty + getQty
  const fullGroups = Math.floor(item.quantity / groupSize)

  if (fullGroups <= 0) return null

  // Free items = get_quantity * full_groups, each at the unit price
  const unitPrice = item.unitPrice + item.modifiersTotal
  const freeItemCount = getQty * fullGroups
  const discountAmount = Math.round(unitPrice * freeItemCount)

  return {
    itemId: item.id,
    promotionId: promo.id,
    promotionName: promo.name,
    promotionCode: promo.code,
    discountAmount,
    discountType: 'buy_x_get_y',
    description: `Buy ${buyQty} Get ${getQty} Free`,
  }
}

// =====================================================
// Best Offer Selection
// =====================================================

/**
 * Select the best discount(s) for a cart item
 *
 * - If no promotions are stackable, picks the one with highest discount
 * - If some are stackable, stacks them with the best non-stackable
 */
function selectBestDiscounts(
  candidates: IItemPromotionDiscount[],
  promotions: IOfflinePromotion[]
): IItemPromotionDiscount[] {
  if (candidates.length <= 1) return candidates

  // Build a quick lookup for is_stackable
  const promoMap = new Map(promotions.map(p => [p.id, p]))

  const stackable = candidates.filter(c => promoMap.get(c.promotionId)?.is_stackable)
  const nonStackable = candidates.filter(c => !promoMap.get(c.promotionId)?.is_stackable)

  // Best non-stackable promotion (highest discount)
  const bestNonStackable = nonStackable.length > 0
    ? nonStackable.reduce((best, curr) => curr.discountAmount > best.discountAmount ? curr : best)
    : null

  // If no stackable promotions, just return the best non-stackable
  if (stackable.length === 0) {
    return bestNonStackable ? [bestNonStackable] : []
  }

  // If no non-stackable, return all stackable
  if (!bestNonStackable) {
    return stackable
  }

  // Stack: best non-stackable + all stackable
  return [bestNonStackable, ...stackable]
}

// =====================================================
// Summary Builder
// =====================================================

/**
 * Build a summary of applied promotions (grouped by promotion)
 */
function buildAppliedPromotionsSummary(
  discounts: IItemPromotionDiscount[]
): IPromotionEvaluationResult['appliedPromotions'] {
  const map = new Map<string, { promotionId: string; promotionName: string; promotionCode: string; totalDiscount: number }>()

  for (const d of discounts) {
    const existing = map.get(d.promotionId)
    if (existing) {
      existing.totalDiscount += d.discountAmount
    } else {
      map.set(d.promotionId, {
        promotionId: d.promotionId,
        promotionName: d.promotionName,
        promotionCode: d.promotionCode,
        totalDiscount: d.discountAmount,
      })
    }
  }

  return Array.from(map.values())
}
