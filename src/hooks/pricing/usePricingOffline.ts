/**
 * usePricingOffline Hook
 * Story 6.2 - Customer Category Pricing Offline
 *
 * Provides offline-capable customer pricing calculations.
 * Uses IndexedDB cache for customer categories and custom prices.
 *
 * @example
 * const { getProductPrice, isLoading } = usePricingOffline();
 * const priceResult = await getProductPrice(product, 'wholesale');
 */

import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { IOfflineProduct } from '@/lib/db';
import type { TPriceType, ICustomerPriceResult } from '@/types/offline';
import { useCartStore } from '@/stores/cartStore';
import {
  calculateCustomerPrice,
  calculateCustomerPricesBatch,
  categoryHasSpecialPricing,
} from '@/services/sync/customerPricingService';
import { logError } from '@/utils/logger'

export interface UsePricingOfflineResult {
  /**
   * Calculate price for a single product based on customer category
   */
  getProductPrice: (
    product: IOfflineProduct,
    categorySlug: string | null
  ) => Promise<ICustomerPriceResult>;

  /**
   * Calculate prices for multiple products (batch operation)
   */
  getProductPricesBatch: (
    products: IOfflineProduct[],
    categorySlug: string | null
  ) => Promise<Map<string, ICustomerPriceResult>>;

  /**
   * Check if a category has any special pricing
   */
  hasSpecialPricing: (categorySlug: string | null) => Promise<boolean>;

  /**
   * Get all customer categories from offline cache
   */
  customerCategories: ReturnType<typeof useLiveQuery>;

  /**
   * Loading state for initial data fetch
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: Error | null;
}

/**
 * Hook for offline-capable customer pricing calculations
 */
export function usePricingOffline(): UsePricingOfflineResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Live query for customer categories
  const customerCategories = useLiveQuery(
    () => db.offline_customer_categories.where('is_active').equals(1).toArray(),
    []
  );

  /**
   * Calculate price for a single product
   */
  const getProductPrice = useCallback(
    async (
      product: IOfflineProduct,
      categorySlug: string | null
    ): Promise<ICustomerPriceResult> => {
      try {
        setError(null);
        return await calculateCustomerPrice(product, categorySlug);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        // Return retail price as fallback
        return {
          price: product.retail_price || 0,
          priceType: 'retail' as TPriceType,
          savings: 0,
          categoryName: null,
        };
      }
    },
    []
  );

  /**
   * Calculate prices for multiple products (more efficient for grids)
   */
  const getProductPricesBatch = useCallback(
    async (
      products: IOfflineProduct[],
      categorySlug: string | null
    ): Promise<Map<string, ICustomerPriceResult>> => {
      try {
        setIsLoading(true);
        setError(null);
        return await calculateCustomerPricesBatch(products, categorySlug);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        // Return retail prices as fallback
        const fallbackMap = new Map<string, ICustomerPriceResult>();
        for (const product of products) {
          fallbackMap.set(product.id, {
            price: product.retail_price || 0,
            priceType: 'retail' as TPriceType,
            savings: 0,
            categoryName: null,
          });
        }
        return fallbackMap;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Check if a category has special pricing configured
   */
  const hasSpecialPricing = useCallback(
    async (categorySlug: string | null): Promise<boolean> => {
      try {
        return await categoryHasSpecialPricing(categorySlug);
      } catch (err) {
        logError('[usePricingOffline] Error checking special pricing:', err);
        return false;
      }
    },
    []
  );

  return {
    getProductPrice,
    getProductPricesBatch,
    hasSpecialPricing,
    customerCategories,
    isLoading,
    error,
  };
}

/**
 * Hook for getting a customer's category slug from their ID
 * Useful for POS when selecting a customer
 */
export function useCustomerCategorySlug(customerId: string | null) {
  const customer = useLiveQuery(
    () => (customerId ? db.offline_customers.get(customerId) : undefined),
    [customerId]
  );

  return {
    categorySlug: customer?.category_slug ?? null,
    customerName: customer?.name ?? null,
    isLoading: customerId !== null && customer === undefined,
  };
}

/**
 * Hook for getting price info for the current cart customer
 * Combines cart state with pricing calculations
 */
export function useCartCustomerPricing() {
  // Connect directly to cartStore's customerCategorySlug
  const customerCategorySlug = useCartStore((state) => state.customerCategorySlug);

  return {
    categorySlug: customerCategorySlug,
    hasSpecialPricing: customerCategorySlug !== null && customerCategorySlug !== 'retail',
  };
}

export type { TPriceType, ICustomerPriceResult };
