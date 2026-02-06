/**
 * Tests for Promotion Engine
 * Story 6.5 - Automatic Promotion Application
 */

import { describe, it, expect } from 'vitest'
import {
  evaluatePromotions,
} from '../promotionEngine'
import type { CartItem } from '@/stores/cartStore'
import type {
  IOfflinePromotion,
  IOfflinePromotionProduct,
  IOfflinePromotionFreeProduct,
} from '@/types/offline'

// =====================================================
// Test Helpers
// =====================================================

function makeCartItem(overrides: Partial<CartItem> & { id: string; unitPrice: number; quantity: number }): CartItem {
  const unitPrice = overrides.unitPrice
  const quantity = overrides.quantity
  const modifiersTotal = overrides.modifiersTotal ?? 0
  return {
    type: 'product',
    product: {
      id: overrides.id.replace(/-.*/, ''),
      name: 'Test Product',
      sku: 'SKU001',
      retail_price: unitPrice,
      category_id: 'cat-1',
    } as CartItem['product'],
    modifiers: [],
    notes: '',
    totalPrice: (unitPrice + modifiersTotal) * quantity,
    modifiersTotal,
    ...overrides,
  }
}

function makePromotion(overrides: Partial<IOfflinePromotion> & { id: string; code: string; name: string }): IOfflinePromotion {
  return {
    description: null,
    promotion_type: 'percentage',
    discount_percentage: null,
    discount_amount: null,
    buy_quantity: null,
    get_quantity: null,
    start_date: null,
    end_date: null,
    time_start: null,
    time_end: null,
    days_of_week: null,
    min_purchase_amount: null,
    min_quantity: null,
    is_active: true,
    is_stackable: false,
    priority: 0,
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makePromoProduct(promoId: string, productId: string | null, categoryId: string | null = null): IOfflinePromotionProduct {
  return {
    id: `pp-${promoId}-${productId ?? categoryId}`,
    promotion_id: promoId,
    product_id: productId,
    category_id: categoryId,
  }
}

// =====================================================
// Tests
// =====================================================

describe('evaluatePromotions', () => {
  describe('empty inputs', () => {
    it('returns empty result for empty cart', () => {
      const result = evaluatePromotions([], [], [], [])
      expect(result.totalDiscount).toBe(0)
      expect(result.itemDiscounts).toHaveLength(0)
      expect(result.appliedPromotions).toHaveLength(0)
    })

    it('returns empty result for cart with no promotions', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })]
      const result = evaluatePromotions(items, [], [], [])
      expect(result.totalDiscount).toBe(0)
    })

    it('returns empty result when no promotions match any items', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })]
      const promo = makePromotion({ id: 'promo-1', code: 'SALE10', name: '10% Off', promotion_type: 'percentage', discount_percentage: 10 })
      // Promo targets product p2, but cart has p1
      const pp = [makePromoProduct('promo-1', 'p2')]
      const result = evaluatePromotions(items, [promo], pp, [])
      expect(result.totalDiscount).toBe(0)
    })
  })

  describe('percentage discount', () => {
    it('applies percentage discount to matching product', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'SALE10', name: '10% Off',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      expect(result.totalDiscount).toBe(10000)
      expect(result.itemDiscounts).toHaveLength(1)
      expect(result.itemDiscounts[0].discountAmount).toBe(10000)
      expect(result.itemDiscounts[0].description).toBe('10% off')
    })

    it('applies percentage discount considering quantity', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 3 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'SALE20', name: '20% Off',
        promotion_type: 'percentage', discount_percentage: 20,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // 50000 * 3 = 150000 * 20% = 30000
      expect(result.totalDiscount).toBe(30000)
    })

    it('ignores promotion with zero discount_percentage', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'ZERO', name: 'Zero',
        promotion_type: 'percentage', discount_percentage: 0,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])
      expect(result.totalDiscount).toBe(0)
    })
  })

  describe('fixed amount discount', () => {
    it('applies fixed amount discount per unit', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 2 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'FLAT5K', name: '5K Off',
        promotion_type: 'fixed_amount', discount_amount: 5000,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // 5000 * 2 = 10000
      expect(result.totalDiscount).toBe(10000)
    })

    it('caps fixed amount at item total price', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 3000, quantity: 1 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'BIG', name: 'Big Discount',
        promotion_type: 'fixed_amount', discount_amount: 50000,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      expect(result.totalDiscount).toBe(3000) // Capped at item total
    })
  })

  describe('buy X get Y discount', () => {
    it('applies buy 2 get 1 free correctly', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 3 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'B2G1', name: 'Buy 2 Get 1',
        promotion_type: 'buy_x_get_y', buy_quantity: 2, get_quantity: 1,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // 3 items = 1 full group of (2+1), 1 free item = 30000
      expect(result.totalDiscount).toBe(30000)
      expect(result.itemDiscounts[0].description).toBe('Buy 2 Get 1 Free')
    })

    it('handles multiple full groups', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 20000, quantity: 6 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'B2G1', name: 'Buy 2 Get 1',
        promotion_type: 'buy_x_get_y', buy_quantity: 2, get_quantity: 1,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // 6 items = 2 full groups of (2+1), 2 free items = 20000 * 2
      expect(result.totalDiscount).toBe(40000)
    })

    it('does not apply when quantity is below threshold', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 2 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'B2G1', name: 'Buy 2 Get 1',
        promotion_type: 'buy_x_get_y', buy_quantity: 2, get_quantity: 1,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // 2 items < 3 (group size), no full groups
      expect(result.totalDiscount).toBe(0)
    })

    it('handles buy 1 get 1 free', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 25000, quantity: 4 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'B1G1', name: 'BOGO',
        promotion_type: 'buy_x_get_y', buy_quantity: 1, get_quantity: 1,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // 4 items = 2 full groups of (1+1), 2 free items = 25000 * 2
      expect(result.totalDiscount).toBe(50000)
    })

    it('considers modifiers in unit price for buy_x_get_y', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 20000, quantity: 3, modifiersTotal: 5000 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'B2G1', name: 'Buy 2 Get 1',
        promotion_type: 'buy_x_get_y', buy_quantity: 2, get_quantity: 1,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      // unitPrice + modifiersTotal = 25000, 1 free = 25000
      expect(result.totalDiscount).toBe(25000)
    })
  })

  describe('global promotions (no product/category associations)', () => {
    it('applies global promotion to all products', () => {
      const items = [
        makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 }),
        makeCartItem({ id: 'p2-456', unitPrice: 30000, quantity: 2 }),
      ]
      const promo = makePromotion({
        id: 'promo-1', code: 'ALL10', name: '10% All',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      // No promotion_products = global
      const result = evaluatePromotions(items, [promo], [], [])

      // p1: 50000 * 10% = 5000, p2: 60000 * 10% = 6000
      expect(result.totalDiscount).toBe(11000)
      expect(result.itemDiscounts).toHaveLength(2)
    })
  })

  describe('category-based promotions', () => {
    it('applies promotion by category', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 40000, quantity: 1 })]
      // p1 belongs to cat-1 (set in makeCartItem)
      const promo = makePromotion({
        id: 'promo-1', code: 'CAT10', name: 'Category 10%',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      const pp = [makePromoProduct('promo-1', null, 'cat-1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      expect(result.totalDiscount).toBe(4000)
    })
  })

  describe('min_quantity threshold', () => {
    it('applies when quantity meets threshold', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 3 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'MIN3', name: 'Min 3 Required',
        promotion_type: 'percentage', discount_percentage: 15, min_quantity: 3,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      expect(result.totalDiscount).toBe(22500) // 150000 * 15%
    })

    it('does not apply when quantity below threshold', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 2 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'MIN3', name: 'Min 3 Required',
        promotion_type: 'percentage', discount_percentage: 15, min_quantity: 3,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const result = evaluatePromotions(items, [promo], pp, [])

      expect(result.totalDiscount).toBe(0)
    })
  })

  describe('min_purchase_amount threshold', () => {
    it('applies when cart subtotal meets threshold', () => {
      const items = [
        makeCartItem({ id: 'p1-123', unitPrice: 80000, quantity: 1 }),
        makeCartItem({ id: 'p2-456', unitPrice: 30000, quantity: 1 }),
      ]
      const promo = makePromotion({
        id: 'promo-1', code: 'MIN100K', name: 'Min 100K',
        promotion_type: 'percentage', discount_percentage: 10, min_purchase_amount: 100000,
      })
      // Global promo
      const result = evaluatePromotions(items, [promo], [], [])

      // 80000 + 30000 = 110000 >= 100000, apply 10% to each
      expect(result.totalDiscount).toBe(11000)
    })

    it('does not apply when cart subtotal below threshold', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'MIN100K', name: 'Min 100K',
        promotion_type: 'percentage', discount_percentage: 10, min_purchase_amount: 100000,
      })
      const result = evaluatePromotions(items, [promo], [], [])

      expect(result.totalDiscount).toBe(0)
    })
  })

  describe('best offer selection (AC3)', () => {
    it('selects highest discount when multiple non-stackable promos apply', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })]
      const promo10 = makePromotion({
        id: 'promo-10', code: 'SALE10', name: '10% Off',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      const promo20 = makePromotion({
        id: 'promo-20', code: 'SALE20', name: '20% Off',
        promotion_type: 'percentage', discount_percentage: 20,
      })
      // Both target p1
      const pp = [
        makePromoProduct('promo-10', 'p1'),
        makePromoProduct('promo-20', 'p1'),
      ]
      const result = evaluatePromotions(items, [promo10, promo20], pp, [])

      // Only the 20% should apply (best offer)
      expect(result.totalDiscount).toBe(20000)
      expect(result.itemDiscounts).toHaveLength(1)
      expect(result.itemDiscounts[0].promotionCode).toBe('SALE20')
    })

    it('stacks stackable promotions with best non-stackable', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })]
      const promoNonStack = makePromotion({
        id: 'promo-ns', code: 'MAIN', name: 'Main 10%',
        promotion_type: 'percentage', discount_percentage: 10, is_stackable: false,
      })
      const promoStack = makePromotion({
        id: 'promo-s', code: 'EXTRA', name: 'Extra 5K',
        promotion_type: 'fixed_amount', discount_amount: 5000, is_stackable: true,
      })
      const pp = [
        makePromoProduct('promo-ns', 'p1'),
        makePromoProduct('promo-s', 'p1'),
      ]
      const result = evaluatePromotions(items, [promoNonStack, promoStack], pp, [])

      // 10% of 100000 = 10000 + 5000 stackable = 15000
      expect(result.totalDiscount).toBe(15000)
      expect(result.itemDiscounts).toHaveLength(2)
    })
  })

  describe('combo items exclusion', () => {
    it('does not apply promotions to combo items', () => {
      const items: CartItem[] = [{
        id: 'combo-1-123',
        type: 'combo',
        combo: { id: 'combo-1', name: 'Combo Deal' } as CartItem['combo'],
        quantity: 1,
        unitPrice: 80000,
        modifiers: [],
        comboSelections: [],
        modifiersTotal: 0,
        notes: '',
        totalPrice: 80000,
      }]
      const promo = makePromotion({
        id: 'promo-1', code: 'ALL10', name: '10% All',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      const result = evaluatePromotions(items, [promo], [], [])

      expect(result.totalDiscount).toBe(0)
    })
  })

  describe('multiple items with different promotions', () => {
    it('applies different promotions to different items', () => {
      const items = [
        makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 }),
        makeCartItem({ id: 'p2-456', unitPrice: 40000, quantity: 1 }),
      ]
      const promo1 = makePromotion({
        id: 'promo-1', code: 'P1SALE', name: 'P1 10%',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      const promo2 = makePromotion({
        id: 'promo-2', code: 'P2FLAT', name: 'P2 Flat 3K',
        promotion_type: 'fixed_amount', discount_amount: 3000,
      })
      const pp = [
        makePromoProduct('promo-1', 'p1'),
        makePromoProduct('promo-2', 'p2'),
      ]
      const result = evaluatePromotions(items, [promo1, promo2], pp, [])

      // p1: 50000 * 10% = 5000, p2: 3000
      expect(result.totalDiscount).toBe(8000)
      expect(result.appliedPromotions).toHaveLength(2)
    })
  })

  describe('appliedPromotions summary', () => {
    it('groups discounts by promotion in summary', () => {
      const items = [
        makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 }),
        makeCartItem({ id: 'p2-456', unitPrice: 60000, quantity: 1 }),
      ]
      const promo = makePromotion({
        id: 'promo-1', code: 'ALL10', name: '10% All',
        promotion_type: 'percentage', discount_percentage: 10,
      })
      // Global promo
      const result = evaluatePromotions(items, [promo], [], [])

      expect(result.appliedPromotions).toHaveLength(1)
      expect(result.appliedPromotions[0].promotionName).toBe('10% All')
      expect(result.appliedPromotions[0].totalDiscount).toBe(11000) // 5000 + 6000
    })
  })

  describe('real-time reactivity (AC4)', () => {
    it('discount changes when quantity reaches buy_x_get_y threshold', () => {
      const promo = makePromotion({
        id: 'promo-1', code: 'B2G1', name: 'Buy 2 Get 1',
        promotion_type: 'buy_x_get_y', buy_quantity: 2, get_quantity: 1,
      })
      const pp = [makePromoProduct('promo-1', 'p1')]

      // Quantity 2: no discount (below group size of 3)
      const items2 = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 2 })]
      const result2 = evaluatePromotions(items2, [promo], pp, [])
      expect(result2.totalDiscount).toBe(0)

      // Quantity 3: discount activates
      const items3 = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 3 })]
      const result3 = evaluatePromotions(items3, [promo], pp, [])
      expect(result3.totalDiscount).toBe(30000)

      // Quantity 4: same discount (only 1 full group)
      const items4 = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 4 })]
      const result4 = evaluatePromotions(items4, [promo], pp, [])
      expect(result4.totalDiscount).toBe(30000)

      // Quantity 6: 2 full groups
      const items6 = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 6 })]
      const result6 = evaluatePromotions(items6, [promo], pp, [])
      expect(result6.totalDiscount).toBe(60000)
    })
  })

  describe('free_product type', () => {
    it('does not generate item-level discount for free_product type', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })]
      const promo = makePromotion({
        id: 'promo-1', code: 'FREE', name: 'Free Product',
        promotion_type: 'free_product',
      })
      const pp = [makePromoProduct('promo-1', 'p1')]
      const fp: IOfflinePromotionFreeProduct[] = [{
        id: 'fp-1', promotion_id: 'promo-1', free_product_id: 'p3', quantity: 1,
      }]
      const result = evaluatePromotions(items, [promo], pp, fp)

      // free_product is not handled as item discount
      expect(result.totalDiscount).toBe(0)
    })
  })
})
