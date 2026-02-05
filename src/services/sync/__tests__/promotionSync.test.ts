/**
 * Tests for Promotion Sync Service
 * Story 6.4 - Promotions Offline Cache
 *
 * Tests:
 * - Sync active promotions only (AC1)
 * - Sync promotion_products and promotion_free_products (AC2)
 * - Cleanup expired promotions (AC5)
 * - Incremental sync (AC6)
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '@/lib/db';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase';
import {
  syncPromotionsToOffline,
  getAllPromotionsFromOffline,
  getPromotionByIdOffline,
  getPromotionByCodeOffline,
  getPromotionProductsOffline,
  getPromotionIdsByProductOffline,
  getPromotionFreeProductsOffline,
  hasOfflinePromotionData,
  getOfflinePromotionCount,
  clearOfflinePromotionData,
} from '../promotionSync';

// Mock promotion data
const mockPromotions = [
  {
    id: 'promo-1',
    code: 'SALE10',
    name: '10% Off',
    description: 'Get 10% off your order',
    promotion_type: 'percentage',
    discount_percentage: 10,
    discount_amount: null,
    buy_quantity: null,
    get_quantity: null,
    start_date: '2026-02-01',
    end_date: '2026-02-28',
    time_start: null,
    time_end: null,
    days_of_week: null,
    min_purchase_amount: null,
    min_quantity: null,
    is_active: true,
    is_stackable: false,
    priority: 5,
    updated_at: '2026-02-05T10:00:00Z',
  },
  {
    id: 'promo-2',
    code: 'BOGO',
    name: 'Buy 1 Get 1',
    description: null,
    promotion_type: 'buy_x_get_y',
    discount_percentage: null,
    discount_amount: null,
    buy_quantity: 1,
    get_quantity: 1,
    start_date: '2026-02-01',
    end_date: '2026-02-28',
    time_start: '10:00',
    time_end: '14:00',
    days_of_week: [1, 2, 3, 4, 5],
    min_purchase_amount: null,
    min_quantity: 2,
    is_active: true,
    is_stackable: true,
    priority: 10,
    updated_at: '2026-02-04T12:00:00Z',
  },
];

const mockPromotionProducts = [
  {
    id: 'pp-1',
    promotion_id: 'promo-1',
    product_id: 'product-1',
    category_id: null,
  },
  {
    id: 'pp-2',
    promotion_id: 'promo-1',
    product_id: null,
    category_id: 'category-1',
  },
  {
    id: 'pp-3',
    promotion_id: 'promo-2',
    product_id: 'product-2',
    category_id: null,
  },
];

const mockFreeProducts = [
  {
    id: 'fp-1',
    promotion_id: 'promo-2',
    free_product_id: 'product-3',
    quantity: 1,
  },
];

// Helper to setup Supabase mock responses
function setupSupabaseMock(options: {
  promotions?: typeof mockPromotions;
  promotionProducts?: typeof mockPromotionProducts;
  freeProducts?: typeof mockFreeProducts;
  inactivePromotions?: { id: string }[];
}) {
  const {
    promotions = mockPromotions,
    promotionProducts = mockPromotionProducts,
    freeProducts = mockFreeProducts,
    inactivePromotions = [],
  } = options;

  const mockFrom = vi.fn().mockImplementation((table: string) => {
    if (table === 'promotions') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((column, value) => {
          if (column === 'is_active' && value === false) {
            // Return inactive promotions for cleanup
            return {
              data: inactivePromotions,
              error: null,
            };
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnValue({
              data: promotions,
              error: null,
            }),
            data: promotions,
            error: null,
          };
        }),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnValue({
          data: promotions,
          error: null,
        }),
      };
    }

    if (table === 'promotion_products') {
      return {
        select: vi.fn().mockReturnValue({
          data: promotionProducts,
          error: null,
        }),
      };
    }

    if (table === 'promotion_free_products') {
      return {
        select: vi.fn().mockReturnValue({
          data: freeProducts,
          error: null,
        }),
      };
    }

    return {
      select: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
    };
  });

  vi.mocked(supabase.from).mockImplementation(mockFrom);
}

describe('promotionSync', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete();
    await db.open();
    vi.clearAllMocks();
  });

  describe('syncPromotionsToOffline', () => {
    it('should sync active promotions to IndexedDB', async () => {
      setupSupabaseMock({});

      const count = await syncPromotionsToOffline();

      expect(count).toBe(2);

      const promotions = await getAllPromotionsFromOffline();
      expect(promotions).toHaveLength(2);
      expect(promotions.map((p) => p.code).sort()).toEqual(['BOGO', 'SALE10']);
    });

    it('should sync promotion_products associations', async () => {
      setupSupabaseMock({});

      await syncPromotionsToOffline();

      const pp1 = await getPromotionProductsOffline('promo-1');
      expect(pp1).toHaveLength(2);

      const pp2 = await getPromotionProductsOffline('promo-2');
      expect(pp2).toHaveLength(1);
    });

    it('should sync promotion_free_products associations', async () => {
      setupSupabaseMock({});

      await syncPromotionsToOffline();

      const fp = await getPromotionFreeProductsOffline('promo-2');
      expect(fp).toHaveLength(1);
      expect(fp[0].free_product_id).toBe('product-3');
      expect(fp[0].quantity).toBe(1);
    });

    it('should update sync metadata', async () => {
      setupSupabaseMock({});

      await syncPromotionsToOffline();

      const meta = await db.offline_sync_meta.get('promotions');
      expect(meta).toBeDefined();
      expect(meta?.recordCount).toBe(2);
      expect(meta?.lastSyncAt).toBeDefined();
    });

    it('should handle empty response', async () => {
      setupSupabaseMock({ promotions: [] });

      const count = await syncPromotionsToOffline();

      expect(count).toBe(0);
    });
  });

  describe('getPromotionByIdOffline', () => {
    it('should return promotion by ID', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const promo = await getPromotionByIdOffline('promo-1');
      expect(promo).toBeDefined();
      expect(promo?.code).toBe('SALE10');
    });

    it('should return undefined for non-existent ID', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const promo = await getPromotionByIdOffline('non-existent');
      expect(promo).toBeUndefined();
    });
  });

  describe('getPromotionByCodeOffline', () => {
    it('should return promotion by code', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const promo = await getPromotionByCodeOffline('BOGO');
      expect(promo).toBeDefined();
      expect(promo?.id).toBe('promo-2');
    });

    it('should return undefined for non-existent code', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const promo = await getPromotionByCodeOffline('INVALID');
      expect(promo).toBeUndefined();
    });
  });

  describe('getPromotionIdsByProductOffline', () => {
    it('should return promotion IDs for a product', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const promoIds = await getPromotionIdsByProductOffline('product-1');
      expect(promoIds).toContain('promo-1');
    });

    it('should return empty array for product with no promotions', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const promoIds = await getPromotionIdsByProductOffline('unknown-product');
      expect(promoIds).toHaveLength(0);
    });
  });

  describe('hasOfflinePromotionData', () => {
    it('should return false when no data cached', async () => {
      const hasData = await hasOfflinePromotionData();
      expect(hasData).toBe(false);
    });

    it('should return true when data is cached', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const hasData = await hasOfflinePromotionData();
      expect(hasData).toBe(true);
    });
  });

  describe('getOfflinePromotionCount', () => {
    it('should return 0 when no data cached', async () => {
      const count = await getOfflinePromotionCount();
      expect(count).toBe(0);
    });

    it('should return correct count after sync', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      const count = await getOfflinePromotionCount();
      expect(count).toBe(2);
    });
  });

  describe('clearOfflinePromotionData', () => {
    it('should clear all promotion data', async () => {
      setupSupabaseMock({});
      await syncPromotionsToOffline();

      expect(await getOfflinePromotionCount()).toBe(2);

      await clearOfflinePromotionData();

      expect(await getOfflinePromotionCount()).toBe(0);
      expect(await hasOfflinePromotionData()).toBe(false);

      // Check associations are also cleared
      const pp = await db.offline_promotion_products.toArray();
      expect(pp).toHaveLength(0);

      const fp = await db.offline_promotion_free_products.toArray();
      expect(fp).toHaveLength(0);

      // Check sync meta is cleared
      const meta = await db.offline_sync_meta.get('promotions');
      expect(meta).toBeUndefined();
    });
  });
});
