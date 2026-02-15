/**
 * Customer Pricing Service Tests
 * Story 6.2 - Customer Category Pricing Offline
 *
 * Tests the offline customer pricing calculation logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateCustomerPrice,
  calculateCustomerPricesBatch,
  categoryHasSpecialPricing,
} from '../customerPricingService';
import { db } from '@/lib/db';
import type { IOfflineProduct, IOfflineCustomerCategory, IOfflineProductCategoryPrice } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    offline_customer_categories: {
      where: vi.fn(),
    },
    offline_product_category_prices: {
      where: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('customerPricingService', () => {
  // Test product
  const mockProduct: IOfflineProduct = {
    id: 'product-1',
    name: 'Croissant',
    sku: 'CRO-001',
    retail_price: 25000,
    wholesale_price: 20000,
    category_id: 'cat-1',
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    product_type: 'finished',
    image_url: null,
    cost_price: 10000,
    track_inventory: true,
    current_stock: null,
    updated_at: '2024-01-01T00:00:00Z',
  };

  // Test categories
  const wholesaleCategory: IOfflineCustomerCategory = {
    id: 'cat-wholesale',
    slug: 'wholesale',
    name: 'Wholesale',
    price_modifier_type: 'wholesale',
    discount_percentage: null,
    is_active: true,
  };

  const discountCategory: IOfflineCustomerCategory = {
    id: 'cat-vip',
    slug: 'vip',
    name: 'VIP',
    price_modifier_type: 'discount_percentage',
    discount_percentage: 10,
    is_active: true,
  };

  const customCategory: IOfflineCustomerCategory = {
    id: 'cat-custom',
    slug: 'custom',
    name: 'Custom',
    price_modifier_type: 'custom',
    discount_percentage: null,
    is_active: true,
  };

  const customPrice: IOfflineProductCategoryPrice = {
    id: 'price-1',
    product_id: 'product-1',
    customer_category_id: 'cat-custom',
    price: 22000,
    is_active: true,
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCustomerPrice', () => {
    it('should return retail price for null category', async () => {
      const result = await calculateCustomerPrice(mockProduct, null);

      expect(result).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    });

    it('should return retail price for "retail" category', async () => {
      const result = await calculateCustomerPrice(mockProduct, 'retail');

      expect(result).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    });

    it('should return wholesale price for wholesale category', async () => {
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(wholesaleCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await calculateCustomerPrice(mockProduct, 'wholesale');

      expect(result).toEqual({
        price: 20000,
        priceType: 'wholesale',
        savings: 5000,
        categoryName: 'Wholesale',
      });
    });

    it('should return discounted price for discount_percentage category', async () => {
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(discountCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await calculateCustomerPrice(mockProduct, 'vip');

      // 25000 - 10% = 22500, rounded to nearest 100 = 22500
      expect(result).toEqual({
        price: 22500,
        priceType: 'discount',
        savings: 2500,
        categoryName: 'VIP',
      });
    });

    it('should return custom price for custom category', async () => {
      const categoryWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(customCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(categoryWhereMock);

      const priceWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(customPrice),
        }),
      });
      (db.offline_product_category_prices.where as ReturnType<typeof vi.fn>).mockImplementation(priceWhereMock);

      const result = await calculateCustomerPrice(mockProduct, 'custom');

      expect(result).toEqual({
        price: 22000,
        priceType: 'custom',
        savings: 3000,
        categoryName: 'Custom',
      });
    });

    it('should return retail price when category not found', async () => {
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await calculateCustomerPrice(mockProduct, 'unknown');

      expect(result).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    });

    it('should return retail price when category is inactive', async () => {
      const inactiveCategory = { ...wholesaleCategory, is_active: false };
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(inactiveCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await calculateCustomerPrice(mockProduct, 'wholesale');

      expect(result).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    });

    it('should return retail price when wholesale price is null', async () => {
      const productWithoutWholesale = { ...mockProduct, wholesale_price: null };
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(wholesaleCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await calculateCustomerPrice(productWithoutWholesale, 'wholesale');

      expect(result).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: 'Wholesale',
      });
    });

    it('should return retail price when custom price not found', async () => {
      const categoryWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(customCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(categoryWhereMock);

      const priceWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      });
      (db.offline_product_category_prices.where as ReturnType<typeof vi.fn>).mockImplementation(priceWhereMock);

      const result = await calculateCustomerPrice(mockProduct, 'custom');

      expect(result).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: 'Custom',
      });
    });
  });

  describe('calculateCustomerPricesBatch', () => {
    const products: IOfflineProduct[] = [
      mockProduct,
      {
        ...mockProduct,
        id: 'product-2',
        name: 'Pain au Chocolat',
        retail_price: 30000,
        wholesale_price: 25000,
        current_stock: null,
      },
    ];

    it('should return retail prices for null category', async () => {
      const results = await calculateCustomerPricesBatch(products, null);

      expect(results.get('product-1')).toEqual({
        price: 25000,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
      expect(results.get('product-2')).toEqual({
        price: 30000,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    });

    it('should return wholesale prices for wholesale category', async () => {
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(wholesaleCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const results = await calculateCustomerPricesBatch(products, 'wholesale');

      expect(results.get('product-1')).toEqual({
        price: 20000,
        priceType: 'wholesale',
        savings: 5000,
        categoryName: 'Wholesale',
      });
      expect(results.get('product-2')).toEqual({
        price: 25000,
        priceType: 'wholesale',
        savings: 5000,
        categoryName: 'Wholesale',
      });
    });
  });

  describe('categoryHasSpecialPricing', () => {
    it('should return false for null category', async () => {
      const result = await categoryHasSpecialPricing(null);
      expect(result).toBe(false);
    });

    it('should return false for retail category', async () => {
      const result = await categoryHasSpecialPricing('retail');
      expect(result).toBe(false);
    });

    it('should return true for wholesale category', async () => {
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(wholesaleCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await categoryHasSpecialPricing('wholesale');
      expect(result).toBe(true);
    });

    it('should return true for discount category', async () => {
      const whereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(discountCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(whereMock);

      const result = await categoryHasSpecialPricing('vip');
      expect(result).toBe(true);
    });

    it('should return true for custom category with prices', async () => {
      const categoryWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(customCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(categoryWhereMock);

      const priceWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue(5),
        }),
      });
      (db.offline_product_category_prices.where as ReturnType<typeof vi.fn>).mockImplementation(priceWhereMock);

      const result = await categoryHasSpecialPricing('custom');
      expect(result).toBe(true);
    });

    it('should return false for custom category without prices', async () => {
      const categoryWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(customCategory),
        }),
      });
      (db.offline_customer_categories.where as ReturnType<typeof vi.fn>).mockImplementation(categoryWhereMock);

      const priceWhereMock = vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          count: vi.fn().mockResolvedValue(0),
        }),
      });
      (db.offline_product_category_prices.where as ReturnType<typeof vi.fn>).mockImplementation(priceWhereMock);

      const result = await categoryHasSpecialPricing('custom');
      expect(result).toBe(false);
    });
  });
});
