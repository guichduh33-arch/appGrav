/**
 * useCartPriceRecalculation Hook
 * Story 6.2 - Customer Category Pricing Offline
 *
 * Handles automatic cart price recalculation when customer changes.
 * Should be used in the POS layout to watch for customer changes.
 *
 * @example
 * // In POS layout component
 * useCartPriceRecalculation();
 */

import { useEffect, useRef, useCallback } from 'react';
import { useCartStore, type CartItem } from '@/stores/cartStore';
import { calculateCustomerPrice } from '@/services/sync/customerPricingService';
import type { IOfflineProduct } from '@/lib/db';
import type { TPriceType } from '@/types/offline';

/**
 * Hook that automatically recalculates cart prices when customer category changes
 */
export function useCartPriceRecalculation(): void {
  const customerCategorySlug = useCartStore((state) => state.customerCategorySlug);
  const items = useCartStore((state) => state.items);
  const recalculateAllPrices = useCartStore((state) => state.recalculateAllPrices);

  // Track the previous category to detect changes
  const prevCategoryRef = useRef<string | null>(customerCategorySlug);

  // Price calculator function for the store
  const priceCalculator = useCallback(
    async (
      item: CartItem
    ): Promise<{ price: number; priceType: TPriceType; savings: number }> => {
      if (!item.product) {
        // Combo or item without product - return current price
        return {
          price: item.unitPrice,
          priceType: (item.appliedPriceType || 'retail') as TPriceType,
          savings: 0,
        };
      }

      // Convert CartItem product to IOfflineProduct format
      const offlineProduct: IOfflineProduct = {
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku || null,
        retail_price: item.product.retail_price || 0,
        wholesale_price: item.product.wholesale_price || null,
        category_id: item.product.category_id || null,
        is_active: item.product.is_active ?? true,
        pos_visible: item.product.pos_visible ?? true,
        available_for_sale: item.product.available_for_sale ?? true,
        product_type: item.product.product_type || 'finished',
        image_url: item.product.image_url || null,
        cost_price: item.product.cost_price || null,
        updated_at: item.product.updated_at || new Date().toISOString(),
      };

      const result = await calculateCustomerPrice(offlineProduct, customerCategorySlug);
      return {
        price: result.price,
        priceType: result.priceType,
        savings: result.savings,
      };
    },
    [customerCategorySlug]
  );

  // Effect to recalculate prices when category changes
  useEffect(() => {
    const prevCategory = prevCategoryRef.current;

    // Only recalculate if category actually changed and there are items
    if (prevCategory !== customerCategorySlug && items.length > 0) {
      console.log(
        `[CartPriceRecalculation] Customer category changed from ${prevCategory} to ${customerCategorySlug}, recalculating prices...`
      );

      // Recalculate all product prices
      recalculateAllPrices(priceCalculator).then(() => {
        console.log('[CartPriceRecalculation] Price recalculation complete');
      });
    }

    // Update ref for next comparison
    prevCategoryRef.current = customerCategorySlug;
  }, [customerCategorySlug, items.length, recalculateAllPrices, priceCalculator]);
}

/**
 * Hook to manually trigger price recalculation
 * Useful for refreshing prices after sync or manual trigger
 */
export function useManualPriceRecalculation() {
  const customerCategorySlug = useCartStore((state) => state.customerCategorySlug);
  const recalculateAllPrices = useCartStore((state) => state.recalculateAllPrices);

  const recalculate = useCallback(async () => {
    const priceCalculator = async (
      item: CartItem
    ): Promise<{ price: number; priceType: TPriceType; savings: number }> => {
      if (!item.product) {
        return {
          price: item.unitPrice,
          priceType: (item.appliedPriceType || 'retail') as TPriceType,
          savings: 0,
        };
      }

      const offlineProduct: IOfflineProduct = {
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku || null,
        retail_price: item.product.retail_price || 0,
        wholesale_price: item.product.wholesale_price || null,
        category_id: item.product.category_id || null,
        is_active: item.product.is_active ?? true,
        pos_visible: item.product.pos_visible ?? true,
        available_for_sale: item.product.available_for_sale ?? true,
        product_type: item.product.product_type || 'finished',
        image_url: item.product.image_url || null,
        cost_price: item.product.cost_price || null,
        updated_at: item.product.updated_at || new Date().toISOString(),
      };

      const result = await calculateCustomerPrice(offlineProduct, customerCategorySlug);
      return {
        price: result.price,
        priceType: result.priceType,
        savings: result.savings,
      };
    };

    await recalculateAllPrices(priceCalculator);
  }, [customerCategorySlug, recalculateAllPrices]);

  return { recalculate };
}

/**
 * Get total savings across all cart items
 */
export function useCartSavings() {
  const items = useCartStore((state) => state.items);

  const totalSavings = items.reduce((sum, item) => sum + (item.savingsAmount || 0), 0);
  const hasSpecialPricing = items.some(
    (item) => item.appliedPriceType && item.appliedPriceType !== 'retail'
  );

  return {
    totalSavings,
    hasSpecialPricing,
    itemsWithSavings: items.filter((item) => (item.savingsAmount || 0) > 0).length,
  };
}
