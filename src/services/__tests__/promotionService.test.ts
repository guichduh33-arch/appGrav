/**
 * Tests for Promotion Service & Promotion Engine
 * Sprint 4 - TEST-003
 *
 * Covers:
 * 1. isPromotionValid: date range, active status, usage limits
 * 2. evaluatePromotions: cart evaluation with applicable promotions
 * 3. calculateDiscount - percentage: verify discount amount
 * 4. calculateDiscount - fixed_amount: verify discount
 * 5. calculateDiscount - buy_x_get_y: verify free item calculation
 * 6. calculateDiscount - free_product: verify 100% discount on free item
 * 7. Edge cases: expired, exceeded usage limit, min purchase not met
 * 8. Multiple promotions: best offer selection and stacking
 */

import { describe, it, expect } from 'vitest';
import { isPromotionValid } from '../promotionService';
import { evaluatePromotions } from '../pos/promotionEngine';
import {
  isPromotionValidNow,
  getValidPromotions,
} from '../sync/promotionValidationService';
import type { CartItem } from '@/stores/cartStore';
import type {
  IOfflinePromotion,
  IOfflinePromotionProduct,
  IOfflinePromotionFreeProduct,
} from '@/types/offline';

// =====================================================
// Test Helpers
// =====================================================

/**
 * Create a mock Promotion (database type used by promotionService.ts)
 */
function createDbPromotion(overrides: Record<string, unknown> = {}) {
  return {
    id: 'promo-1',
    code: 'TEST10',
    name: 'Test Promotion',
    description: null,
    promotion_type: 'percentage',
    discount_percentage: 10,
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
    max_uses_total: null,
    max_uses_per_customer: null,
    current_uses: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as any;
}

/**
 * Create a mock IOfflinePromotion (offline type used by promotionEngine)
 */
function makeOfflinePromotion(
  overrides: Partial<IOfflinePromotion> & { id: string; code: string; name: string }
): IOfflinePromotion {
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
  };
}

/**
 * Create a cart item for testing
 */
function makeCartItem(
  overrides: Partial<CartItem> & { id: string; unitPrice: number; quantity: number }
): CartItem {
  const unitPrice = overrides.unitPrice;
  const quantity = overrides.quantity;
  const modifiersTotal = overrides.modifiersTotal ?? 0;
  return {
    type: 'product',
    product: {
      id: overrides.id.replace(/-.*/, ''),
      name: overrides.product?.name ?? 'Test Product',
      sku: 'SKU001',
      retail_price: unitPrice,
      category_id: 'cat-1',
    } as CartItem['product'],
    modifiers: [],
    notes: '',
    totalPrice: (unitPrice + modifiersTotal) * quantity,
    modifiersTotal,
    ...overrides,
  };
}

function makePromoProduct(
  promoId: string,
  productId: string | null,
  categoryId: string | null = null
): IOfflinePromotionProduct {
  return {
    id: `pp-${promoId}-${productId ?? categoryId}`,
    promotion_id: promoId,
    product_id: productId,
    category_id: categoryId,
  };
}

// =====================================================
// 1. isPromotionValid Tests (promotionService.ts)
// =====================================================

describe('isPromotionValid (online promotionService)', () => {
  describe('active status', () => {
    it('should return valid=false for inactive promotion', () => {
      const promo = createDbPromotion({ is_active: false });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Promotion inactive');
    });

    it('should return valid=true for active promotion with no constraints', () => {
      const promo = createDbPromotion({ is_active: true });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });
  });

  describe('date range validation', () => {
    it('should return valid=false when promotion has not started', () => {
      const promo = createDbPromotion({
        start_date: '2099-01-01T00:00:00Z',
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Promotion not yet started');
    });

    it('should return valid=false when promotion has expired', () => {
      const promo = createDbPromotion({
        end_date: '2020-01-01T00:00:00Z',
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Promotion expired');
    });

    it('should return valid=true when within date range', () => {
      const promo = createDbPromotion({
        start_date: '2020-01-01T00:00:00Z',
        end_date: '2099-12-31T23:59:59Z',
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });

    it('should return valid=true when no date constraints', () => {
      const promo = createDbPromotion({
        start_date: null,
        end_date: null,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });
  });

  describe('day of week validation', () => {
    it('should return valid=false when current day is not in allowed days', () => {
      const currentDay = new Date().getDay();
      // Create an array of days that does NOT include the current day
      const excludedDays = [0, 1, 2, 3, 4, 5, 6].filter(d => d !== currentDay);
      const promo = createDbPromotion({
        days_of_week: excludedDays,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Promotion not valid today');
    });

    it('should return valid=true when current day is in allowed days', () => {
      const currentDay = new Date().getDay();
      const promo = createDbPromotion({
        days_of_week: [currentDay],
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });

    it('should return valid=true when days_of_week is null', () => {
      const promo = createDbPromotion({
        days_of_week: null,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });

    it('should return valid=true when days_of_week is empty', () => {
      const promo = createDbPromotion({
        days_of_week: [],
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });
  });

  describe('usage limits', () => {
    it('should return valid=false when max_uses_total is reached', () => {
      const promo = createDbPromotion({
        max_uses_total: 100,
        current_uses: 100,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Promotion usage limit reached');
    });

    it('should return valid=false when current_uses exceeds max_uses_total', () => {
      const promo = createDbPromotion({
        max_uses_total: 50,
        current_uses: 55,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(false);
    });

    it('should return valid=true when usage is below limit', () => {
      const promo = createDbPromotion({
        max_uses_total: 100,
        current_uses: 50,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });

    it('should return valid=true when no usage limit is set', () => {
      const promo = createDbPromotion({
        max_uses_total: null,
        current_uses: 999,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });
  });

  describe('time range validation', () => {
    it('should return valid=true when no time constraints', () => {
      const promo = createDbPromotion({
        time_start: null,
        time_end: null,
      });
      const result = isPromotionValid(promo);
      expect(result.valid).toBe(true);
    });
  });
});

// =====================================================
// 2. isPromotionValidNow Tests (offline validation)
// =====================================================

describe('isPromotionValidNow (offline validation)', () => {
  it('should return true for active promotion within all constraints', () => {
    const wednesday14h = new Date('2026-02-04T14:00:00');
    const promo = makeOfflinePromotion({
      id: 'p1',
      code: 'VALID',
      name: 'Valid Promo',
      start_date: '2026-02-01',
      end_date: '2026-02-28',
      time_start: '10:00',
      time_end: '18:00',
      days_of_week: [3], // Wednesday
    });
    expect(isPromotionValidNow(promo, wednesday14h)).toBe(true);
  });

  it('should return false for expired promotion', () => {
    const now = new Date('2026-03-15T12:00:00');
    const promo = makeOfflinePromotion({
      id: 'p1',
      code: 'EXPIRED',
      name: 'Expired',
      end_date: '2026-02-28',
    });
    expect(isPromotionValidNow(promo, now)).toBe(false);
  });

  it('should return false for inactive promotion', () => {
    const promo = makeOfflinePromotion({
      id: 'p1',
      code: 'INACTIVE',
      name: 'Inactive',
      is_active: false,
    });
    expect(isPromotionValidNow(promo)).toBe(false);
  });

  it('should filter multiple promotions keeping only valid ones', () => {
    const now = new Date('2026-02-10T14:00:00');
    const promos = [
      makeOfflinePromotion({ id: '1', code: 'ACTIVE', name: 'Active', is_active: true }),
      makeOfflinePromotion({ id: '2', code: 'INACTIVE', name: 'Inactive', is_active: false }),
      makeOfflinePromotion({ id: '3', code: 'EXPIRED', name: 'Expired', end_date: '2026-01-01' }),
    ];
    const valid = getValidPromotions(promos, now);
    expect(valid).toHaveLength(1);
    expect(valid[0].id).toBe('1');
  });
});

// =====================================================
// 3-6. evaluatePromotions & calculateDiscount Tests
// =====================================================

describe('evaluatePromotions - discount calculations', () => {
  describe('percentage discount', () => {
    it('should calculate 20% off correctly', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'SALE20',
        name: '20% Off',
        promotion_type: 'percentage',
        discount_percentage: 20,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      expect(result.totalDiscount).toBe(20000);
      expect(result.itemDiscounts[0].discountType).toBe('percentage');
      expect(result.itemDiscounts[0].description).toBe('20% off');
    });

    it('should handle 100% discount', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'FREE100',
        name: '100% Off',
        promotion_type: 'percentage',
        discount_percentage: 100,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      expect(result.totalDiscount).toBe(50000);
    });

    it('should calculate percentage on total price including quantity', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 25000, quantity: 4 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'SALE10',
        name: '10% Off',
        promotion_type: 'percentage',
        discount_percentage: 10,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      // 25000 * 4 = 100000 * 10% = 10000
      expect(result.totalDiscount).toBe(10000);
    });
  });

  describe('fixed amount discount', () => {
    it('should calculate 10000 IDR off correctly', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'FLAT10K',
        name: '10K Off',
        promotion_type: 'fixed_amount',
        discount_amount: 10000,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      expect(result.totalDiscount).toBe(10000);
      expect(result.itemDiscounts[0].discountType).toBe('fixed_amount');
    });

    it('should multiply fixed discount by quantity', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 3 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'FLAT5K',
        name: '5K Off',
        promotion_type: 'fixed_amount',
        discount_amount: 5000,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      // 5000 * 3 = 15000
      expect(result.totalDiscount).toBe(15000);
    });

    it('should cap fixed discount at item total price', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 2000, quantity: 1 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'BIG',
        name: 'Big Discount',
        promotion_type: 'fixed_amount',
        discount_amount: 50000,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      expect(result.totalDiscount).toBe(2000);
    });
  });

  describe('buy_x_get_y discount', () => {
    it('should apply buy 3 get 1 free correctly', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 20000, quantity: 4 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'B3G1',
        name: 'Buy 3 Get 1 Free',
        promotion_type: 'buy_x_get_y',
        buy_quantity: 3,
        get_quantity: 1,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      // group size = 4, 4/4 = 1 full group, 1 free item = 20000
      expect(result.totalDiscount).toBe(20000);
      expect(result.itemDiscounts[0].description).toBe('Buy 3 Get 1 Free');
    });

    it('should not apply when quantity is insufficient', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 20000, quantity: 3 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'B3G1',
        name: 'Buy 3 Get 1 Free',
        promotion_type: 'buy_x_get_y',
        buy_quantity: 3,
        get_quantity: 1,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      // 3 items < group size of 4, no full groups
      expect(result.totalDiscount).toBe(0);
    });

    it('should handle multiple full groups', () => {
      const items = [makeCartItem({ id: 'p1-123', unitPrice: 15000, quantity: 8 })];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'B3G1',
        name: 'Buy 3 Get 1 Free',
        promotion_type: 'buy_x_get_y',
        buy_quantity: 3,
        get_quantity: 1,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      // 8 / 4 = 2 full groups, 2 free items = 15000 * 2 = 30000
      expect(result.totalDiscount).toBe(30000);
    });

    it('should include modifiers in free item price', () => {
      const items = [
        makeCartItem({ id: 'p1-123', unitPrice: 20000, quantity: 3, modifiersTotal: 3000 }),
      ];
      const promo = makeOfflinePromotion({
        id: 'promo-1',
        code: 'B2G1',
        name: 'Buy 2 Get 1',
        promotion_type: 'buy_x_get_y',
        buy_quantity: 2,
        get_quantity: 1,
      });
      const pp = [makePromoProduct('promo-1', 'p1')];
      const result = evaluatePromotions(items, [promo], pp, []);

      // unitPrice + modifiers = 23000, 1 free = 23000
      expect(result.totalDiscount).toBe(23000);
    });
  });

  describe('free_product discount', () => {
    it('should give 100% discount when cart item is the free product', () => {
      // Scenario: "Buy any croissant, get a cookie free"
      // The croissant triggers the promotion, the cookie gets the discount
      const cookie = makeCartItem({
        id: 'cookie-123',
        unitPrice: 15000,
        quantity: 1,
        product: {
          id: 'cookie',
          name: 'Cookie',
          sku: 'CK001',
          retail_price: 15000,
          category_id: 'cat-pastry',
        } as CartItem['product'],
      });

      const promo = makeOfflinePromotion({
        id: 'promo-fp',
        code: 'FREECOOKIE',
        name: 'Free Cookie',
        promotion_type: 'free_product',
      });

      // The promotion targets the cookie product (the free item is the cookie)
      const pp: IOfflinePromotionProduct[] = [makePromoProduct('promo-fp', 'cookie')];
      const fp: IOfflinePromotionFreeProduct[] = [
        {
          id: 'fp-1',
          promotion_id: 'promo-fp',
          free_product_id: 'cookie',
          quantity: 1,
        },
      ];

      const result = evaluatePromotions([cookie], [promo], pp, fp);

      // Cookie should be 100% free
      expect(result.totalDiscount).toBe(15000);
      expect(result.itemDiscounts).toHaveLength(1);
      expect(result.itemDiscounts[0].discountType).toBe('free_product');
      expect(result.itemDiscounts[0].description).toContain('Cookie');
    });

    it('should cap free quantity at promotion-defined quantity', () => {
      const cookie = makeCartItem({
        id: 'cookie-123',
        unitPrice: 15000,
        quantity: 5, // 5 cookies in cart
        product: {
          id: 'cookie',
          name: 'Cookie',
          sku: 'CK001',
          retail_price: 15000,
          category_id: 'cat-pastry',
        } as CartItem['product'],
      });

      const promo = makeOfflinePromotion({
        id: 'promo-fp',
        code: 'FREECOOKIE',
        name: 'Free Cookie',
        promotion_type: 'free_product',
      });

      const pp: IOfflinePromotionProduct[] = [makePromoProduct('promo-fp', 'cookie')];
      const fp: IOfflinePromotionFreeProduct[] = [
        {
          id: 'fp-1',
          promotion_id: 'promo-fp',
          free_product_id: 'cookie',
          quantity: 2, // Only 2 free cookies
        },
      ];

      const result = evaluatePromotions([cookie], [promo], pp, fp);

      // Only 2 cookies free = 15000 * 2 = 30000
      expect(result.totalDiscount).toBe(30000);
    });

    it('should cap free quantity at cart item quantity', () => {
      const cookie = makeCartItem({
        id: 'cookie-123',
        unitPrice: 15000,
        quantity: 1, // Only 1 cookie in cart
        product: {
          id: 'cookie',
          name: 'Cookie',
          sku: 'CK001',
          retail_price: 15000,
          category_id: 'cat-pastry',
        } as CartItem['product'],
      });

      const promo = makeOfflinePromotion({
        id: 'promo-fp',
        code: 'FREECOOKIE',
        name: 'Free Cookie',
        promotion_type: 'free_product',
      });

      const pp: IOfflinePromotionProduct[] = [makePromoProduct('promo-fp', 'cookie')];
      const fp: IOfflinePromotionFreeProduct[] = [
        {
          id: 'fp-1',
          promotion_id: 'promo-fp',
          free_product_id: 'cookie',
          quantity: 5, // Promotion offers 5 free but only 1 in cart
        },
      ];

      const result = evaluatePromotions([cookie], [promo], pp, fp);

      // Only 1 cookie in cart, so only 1 free = 15000
      expect(result.totalDiscount).toBe(15000);
    });

    it('should not apply when cart item is not a free product', () => {
      const bread = makeCartItem({
        id: 'bread-123',
        unitPrice: 25000,
        quantity: 1,
        product: {
          id: 'bread',
          name: 'Bread',
          sku: 'BR001',
          retail_price: 25000,
          category_id: 'cat-bread',
        } as CartItem['product'],
      });

      const promo = makeOfflinePromotion({
        id: 'promo-fp',
        code: 'FREECOOKIE',
        name: 'Free Cookie',
        promotion_type: 'free_product',
      });

      // Promo targets bread but free product is cookie
      const pp: IOfflinePromotionProduct[] = [makePromoProduct('promo-fp', 'bread')];
      const fp: IOfflinePromotionFreeProduct[] = [
        {
          id: 'fp-1',
          promotion_id: 'promo-fp',
          free_product_id: 'cookie', // Cookie is the free product, not bread
          quantity: 1,
        },
      ];

      const result = evaluatePromotions([bread], [promo], pp, fp);

      // Bread is not the free product, no discount
      expect(result.totalDiscount).toBe(0);
    });

    it('should include modifiers in free product discount', () => {
      const cookie = makeCartItem({
        id: 'cookie-123',
        unitPrice: 15000,
        quantity: 1,
        modifiersTotal: 3000,
        product: {
          id: 'cookie',
          name: 'Cookie',
          sku: 'CK001',
          retail_price: 15000,
          category_id: 'cat-pastry',
        } as CartItem['product'],
      });

      const promo = makeOfflinePromotion({
        id: 'promo-fp',
        code: 'FREECOOKIE',
        name: 'Free Cookie',
        promotion_type: 'free_product',
      });

      const pp: IOfflinePromotionProduct[] = [makePromoProduct('promo-fp', 'cookie')];
      const fp: IOfflinePromotionFreeProduct[] = [
        {
          id: 'fp-1',
          promotion_id: 'promo-fp',
          free_product_id: 'cookie',
          quantity: 1,
        },
      ];

      const result = evaluatePromotions([cookie], [promo], pp, fp);

      // Free = unitPrice + modifiers = 15000 + 3000 = 18000
      expect(result.totalDiscount).toBe(18000);
    });
  });
});

// =====================================================
// 7. Edge Cases
// =====================================================

describe('evaluatePromotions - edge cases', () => {
  it('should return empty result for empty cart', () => {
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'SALE10',
      name: '10% Off',
      promotion_type: 'percentage',
      discount_percentage: 10,
    });
    const result = evaluatePromotions([], [promo], [], []);
    expect(result.totalDiscount).toBe(0);
    expect(result.itemDiscounts).toHaveLength(0);
    expect(result.appliedPromotions).toHaveLength(0);
  });

  it('should return empty result when no promotions', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
    const result = evaluatePromotions(items, [], [], []);
    expect(result.totalDiscount).toBe(0);
  });

  it('should not apply when min_purchase_amount is not met', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 30000, quantity: 1 })];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'MIN100',
      name: 'Min 100K',
      promotion_type: 'percentage',
      discount_percentage: 20,
      min_purchase_amount: 100000,
    });
    const result = evaluatePromotions(items, [promo], [], []);
    expect(result.totalDiscount).toBe(0);
  });

  it('should apply when min_purchase_amount is met', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 120000, quantity: 1 })];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'MIN100',
      name: 'Min 100K',
      promotion_type: 'percentage',
      discount_percentage: 20,
      min_purchase_amount: 100000,
    });
    // Global promotion (no product associations)
    const result = evaluatePromotions(items, [promo], [], []);
    expect(result.totalDiscount).toBe(24000); // 120000 * 20%
  });

  it('should not apply when min_quantity is not met', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'MIN3',
      name: 'Min 3 Items',
      promotion_type: 'percentage',
      discount_percentage: 10,
      min_quantity: 3,
    });
    const pp = [makePromoProduct('promo-1', 'p1')];
    const result = evaluatePromotions(items, [promo], pp, []);
    expect(result.totalDiscount).toBe(0);
  });

  it('should skip combo items in cart', () => {
    const comboItem: CartItem = {
      id: 'combo-1-123',
      type: 'combo',
      combo: { id: 'combo-1', name: 'Lunch Combo' } as CartItem['combo'],
      quantity: 1,
      unitPrice: 80000,
      modifiers: [],
      comboSelections: [],
      modifiersTotal: 0,
      notes: '',
      totalPrice: 80000,
    };
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'ALL10',
      name: '10% All',
      promotion_type: 'percentage',
      discount_percentage: 10,
    });
    const result = evaluatePromotions([comboItem], [promo], [], []);
    expect(result.totalDiscount).toBe(0);
  });

  it('should ignore promotions with null or zero discount_percentage', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'ZERO',
      name: 'Zero Discount',
      promotion_type: 'percentage',
      discount_percentage: null,
    });
    const result = evaluatePromotions(items, [promo], [], []);
    expect(result.totalDiscount).toBe(0);
  });

  it('should ignore promotions with null or zero discount_amount', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'ZERO',
      name: 'Zero Fixed',
      promotion_type: 'fixed_amount',
      discount_amount: null,
    });
    const result = evaluatePromotions(items, [promo], [], []);
    expect(result.totalDiscount).toBe(0);
  });

  it('should handle unknown promotion_type gracefully', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 })];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'UNKNOWN',
      name: 'Unknown Type',
      promotion_type: 'some_future_type' as any,
    });
    const result = evaluatePromotions(items, [promo], [], []);
    expect(result.totalDiscount).toBe(0);
  });
});

// =====================================================
// 8. Multiple Promotions (Best Offer & Stacking)
// =====================================================

describe('evaluatePromotions - multiple promotions', () => {
  it('should select best non-stackable promotion (highest discount)', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })];
    const promo5 = makeOfflinePromotion({
      id: 'promo-5',
      code: 'SALE5',
      name: '5% Off',
      promotion_type: 'percentage',
      discount_percentage: 5,
      is_stackable: false,
    });
    const promo15 = makeOfflinePromotion({
      id: 'promo-15',
      code: 'SALE15',
      name: '15% Off',
      promotion_type: 'percentage',
      discount_percentage: 15,
      is_stackable: false,
    });
    const promo10 = makeOfflinePromotion({
      id: 'promo-10',
      code: 'SALE10',
      name: '10% Off',
      promotion_type: 'percentage',
      discount_percentage: 10,
      is_stackable: false,
    });
    const pp = [
      makePromoProduct('promo-5', 'p1'),
      makePromoProduct('promo-15', 'p1'),
      makePromoProduct('promo-10', 'p1'),
    ];

    const result = evaluatePromotions(items, [promo5, promo15, promo10], pp, []);

    // Should pick the 15% (highest)
    expect(result.totalDiscount).toBe(15000);
    expect(result.itemDiscounts).toHaveLength(1);
    expect(result.itemDiscounts[0].promotionCode).toBe('SALE15');
  });

  it('should stack stackable promotions with best non-stackable', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })];
    const promoMain = makeOfflinePromotion({
      id: 'promo-main',
      code: 'MAIN',
      name: 'Main 10%',
      promotion_type: 'percentage',
      discount_percentage: 10,
      is_stackable: false,
    });
    const promoBonus = makeOfflinePromotion({
      id: 'promo-bonus',
      code: 'BONUS',
      name: 'Bonus 2K',
      promotion_type: 'fixed_amount',
      discount_amount: 2000,
      is_stackable: true,
    });
    const pp = [
      makePromoProduct('promo-main', 'p1'),
      makePromoProduct('promo-bonus', 'p1'),
    ];

    const result = evaluatePromotions(items, [promoMain, promoBonus], pp, []);

    // 10% of 100000 = 10000 + 2000 stacked = 12000
    expect(result.totalDiscount).toBe(12000);
    expect(result.itemDiscounts).toHaveLength(2);
  });

  it('should apply all stackable promotions when no non-stackable exists', () => {
    const items = [makeCartItem({ id: 'p1-123', unitPrice: 100000, quantity: 1 })];
    const promo1 = makeOfflinePromotion({
      id: 'promo-1',
      code: 'STACK1',
      name: 'Stack 5%',
      promotion_type: 'percentage',
      discount_percentage: 5,
      is_stackable: true,
    });
    const promo2 = makeOfflinePromotion({
      id: 'promo-2',
      code: 'STACK2',
      name: 'Stack 3K',
      promotion_type: 'fixed_amount',
      discount_amount: 3000,
      is_stackable: true,
    });
    const pp = [
      makePromoProduct('promo-1', 'p1'),
      makePromoProduct('promo-2', 'p1'),
    ];

    const result = evaluatePromotions(items, [promo1, promo2], pp, []);

    // 5% of 100000 = 5000 + 3000 = 8000
    expect(result.totalDiscount).toBe(8000);
    expect(result.itemDiscounts).toHaveLength(2);
  });

  it('should apply different promotions to different items', () => {
    const items = [
      makeCartItem({ id: 'p1-123', unitPrice: 50000, quantity: 1 }),
      makeCartItem({ id: 'p2-456', unitPrice: 40000, quantity: 1 }),
    ];
    const promo1 = makeOfflinePromotion({
      id: 'promo-1',
      code: 'P1DEAL',
      name: 'P1 15%',
      promotion_type: 'percentage',
      discount_percentage: 15,
    });
    const promo2 = makeOfflinePromotion({
      id: 'promo-2',
      code: 'P2DEAL',
      name: 'P2 5K Off',
      promotion_type: 'fixed_amount',
      discount_amount: 5000,
    });
    const pp = [
      makePromoProduct('promo-1', 'p1'),
      makePromoProduct('promo-2', 'p2'),
    ];

    const result = evaluatePromotions(items, [promo1, promo2], pp, []);

    // p1: 50000 * 15% = 7500, p2: 5000
    expect(result.totalDiscount).toBe(12500);
    expect(result.appliedPromotions).toHaveLength(2);
  });

  it('should build correct appliedPromotions summary', () => {
    const items = [
      makeCartItem({ id: 'p1-123', unitPrice: 60000, quantity: 1 }),
      makeCartItem({ id: 'p2-456', unitPrice: 40000, quantity: 1 }),
    ];
    const promo = makeOfflinePromotion({
      id: 'promo-1',
      code: 'ALL5',
      name: '5% on Everything',
      promotion_type: 'percentage',
      discount_percentage: 5,
    });
    // Global promotion
    const result = evaluatePromotions(items, [promo], [], []);

    expect(result.appliedPromotions).toHaveLength(1);
    expect(result.appliedPromotions[0].promotionId).toBe('promo-1');
    expect(result.appliedPromotions[0].promotionName).toBe('5% on Everything');
    expect(result.appliedPromotions[0].promotionCode).toBe('ALL5');
    // 60000 * 5% = 3000 + 40000 * 5% = 2000 = 5000
    expect(result.appliedPromotions[0].totalDiscount).toBe(5000);
  });
});
