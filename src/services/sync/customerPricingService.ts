/**
 * Customer Pricing Service
 * Story 6.2 - Customer Category Pricing Offline
 *
 * Calculates the correct price for a product based on customer category.
 * Mirrors the logic of the database function `get_customer_product_price`.
 *
 * Pricing priority:
 * 1. Custom price (from product_category_prices table)
 * 2. Wholesale price (if category uses wholesale pricing)
 * 3. Discount percentage (applies X% off retail)
 * 4. Retail price (fallback)
 *
 * @see database function: get_customer_product_price(p_product_id, p_customer_category_slug)
 */

import { db } from '@/lib/db';
import type { IOfflineProduct, IOfflineProductCategoryPrice } from '@/lib/db';
import type { TPriceType, ICustomerPriceResult } from '@/types/offline';

// Re-export types for consumers
export type { TPriceType, ICustomerPriceResult };

/**
 * Calculate the price for a product based on customer category
 * Replicates get_customer_product_price database function for offline use
 *
 * @param product The product to price
 * @param categorySlug Customer category slug (e.g., 'retail', 'wholesale', 'vip')
 * @returns Calculated price result with price type and savings
 */
export async function calculateCustomerPrice(
  product: IOfflineProduct,
  categorySlug: string | null
): Promise<ICustomerPriceResult> {
  const retailPrice = product.retail_price || 0;

  // Default result for no category (retail customer)
  if (!categorySlug || categorySlug === 'retail') {
    return {
      price: retailPrice,
      priceType: 'retail',
      savings: 0,
      categoryName: null,
    };
  }

  // Get customer category from offline cache
  const category = await db.offline_customer_categories
    .where('slug')
    .equals(categorySlug)
    .first();

  if (!category || !category.is_active) {
    // Category not found or inactive - return retail price
    return {
      price: retailPrice,
      priceType: 'retail',
      savings: 0,
      categoryName: null,
    };
  }

  // Determine price based on price_modifier_type
  const modifierType = category.price_modifier_type;

  // 1. Custom price - check product_category_prices table first
  if (modifierType === 'custom') {
    const customPrice = await db.offline_product_category_prices
      .where('[product_id+customer_category_id]')
      .equals([product.id, category.id])
      .first();

    if (customPrice && customPrice.is_active && customPrice.price > 0) {
      const savings = retailPrice - customPrice.price;
      return {
        price: customPrice.price,
        priceType: 'custom',
        savings: savings > 0 ? savings : 0,
        categoryName: category.name,
      };
    }
    // No custom price found - fall back to retail
    return {
      price: retailPrice,
      priceType: 'retail',
      savings: 0,
      categoryName: category.name,
    };
  }

  // 2. Wholesale price
  if (modifierType === 'wholesale') {
    const wholesalePrice = product.wholesale_price;
    if (wholesalePrice && wholesalePrice > 0) {
      const savings = retailPrice - wholesalePrice;
      return {
        price: wholesalePrice,
        priceType: 'wholesale',
        savings: savings > 0 ? savings : 0,
        categoryName: category.name,
      };
    }
    // No wholesale price set - fall back to retail
    return {
      price: retailPrice,
      priceType: 'retail',
      savings: 0,
      categoryName: category.name,
    };
  }

  // 3. Discount percentage
  if (modifierType === 'discount_percentage') {
    const discountPct = category.discount_percentage;
    if (discountPct && discountPct > 0) {
      const discountAmount = retailPrice * (discountPct / 100);
      const discountedPrice = Math.round((retailPrice - discountAmount) / 100) * 100; // Round to nearest 100 IDR
      const savings = retailPrice - discountedPrice;
      return {
        price: discountedPrice,
        priceType: 'discount',
        savings: savings > 0 ? savings : 0,
        categoryName: category.name,
      };
    }
  }

  // Default: retail price
  return {
    price: retailPrice,
    priceType: 'retail',
    savings: 0,
    categoryName: category.name,
  };
}

/**
 * Calculate prices for multiple products at once
 * More efficient for batch operations (e.g., product grid)
 *
 * @param products Array of products to price
 * @param categorySlug Customer category slug
 * @returns Map of product ID to price result
 */
export async function calculateCustomerPricesBatch(
  products: IOfflineProduct[],
  categorySlug: string | null
): Promise<Map<string, ICustomerPriceResult>> {
  const results = new Map<string, ICustomerPriceResult>();

  // No category - all products get retail price
  if (!categorySlug || categorySlug === 'retail') {
    for (const product of products) {
      results.set(product.id, {
        price: product.retail_price || 0,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    }
    return results;
  }

  // Get customer category
  const category = await db.offline_customer_categories
    .where('slug')
    .equals(categorySlug)
    .first();

  if (!category || !category.is_active) {
    // Category not found - all retail
    for (const product of products) {
      results.set(product.id, {
        price: product.retail_price || 0,
        priceType: 'retail',
        savings: 0,
        categoryName: null,
      });
    }
    return results;
  }

  const modifierType = category.price_modifier_type;

  // For custom pricing, batch fetch all custom prices for this category
  const customPricesMap = new Map<string, IOfflineProductCategoryPrice>();
  if (modifierType === 'custom') {
    const customPrices = await db.offline_product_category_prices
      .where('customer_category_id')
      .equals(category.id)
      .filter((p) => p.is_active)
      .toArray();

    for (const cp of customPrices) {
      customPricesMap.set(cp.product_id, cp);
    }
  }

  // Calculate price for each product
  for (const product of products) {
    const retailPrice = product.retail_price || 0;

    if (modifierType === 'custom') {
      const customPrice = customPricesMap.get(product.id);
      if (customPrice && customPrice.price > 0) {
        const savings = retailPrice - customPrice.price;
        results.set(product.id, {
          price: customPrice.price,
          priceType: 'custom',
          savings: savings > 0 ? savings : 0,
          categoryName: category.name,
        });
      } else {
        results.set(product.id, {
          price: retailPrice,
          priceType: 'retail',
          savings: 0,
          categoryName: category.name,
        });
      }
    } else if (modifierType === 'wholesale') {
      const wholesalePrice = product.wholesale_price;
      if (wholesalePrice && wholesalePrice > 0) {
        const savings = retailPrice - wholesalePrice;
        results.set(product.id, {
          price: wholesalePrice,
          priceType: 'wholesale',
          savings: savings > 0 ? savings : 0,
          categoryName: category.name,
        });
      } else {
        results.set(product.id, {
          price: retailPrice,
          priceType: 'retail',
          savings: 0,
          categoryName: category.name,
        });
      }
    } else if (modifierType === 'discount_percentage') {
      const discountPct = category.discount_percentage;
      if (discountPct && discountPct > 0) {
        const discountAmount = retailPrice * (discountPct / 100);
        const discountedPrice = Math.round((retailPrice - discountAmount) / 100) * 100;
        const savings = retailPrice - discountedPrice;
        results.set(product.id, {
          price: discountedPrice,
          priceType: 'discount',
          savings: savings > 0 ? savings : 0,
          categoryName: category.name,
        });
      } else {
        results.set(product.id, {
          price: retailPrice,
          priceType: 'retail',
          savings: 0,
          categoryName: category.name,
        });
      }
    } else {
      // Unknown modifier type - default to retail
      results.set(product.id, {
        price: retailPrice,
        priceType: 'retail',
        savings: 0,
        categoryName: category.name,
      });
    }
  }

  return results;
}

/**
 * Get the price display info for a single product
 * Convenience function for UI components
 *
 * @param productId Product ID
 * @param categorySlug Customer category slug
 * @returns Price result or null if product not found
 */
export async function getProductPriceForCustomer(
  productId: string,
  categorySlug: string | null
): Promise<ICustomerPriceResult | null> {
  const product = await db.offline_products.get(productId);
  if (!product) return null;

  return calculateCustomerPrice(product, categorySlug);
}

/**
 * Check if a customer category has any special pricing configured
 *
 * @param categorySlug Customer category slug
 * @returns true if category has non-retail pricing
 */
export async function categoryHasSpecialPricing(
  categorySlug: string | null
): Promise<boolean> {
  if (!categorySlug || categorySlug === 'retail') return false;

  const category = await db.offline_customer_categories
    .where('slug')
    .equals(categorySlug)
    .first();

  if (!category || !category.is_active) return false;

  // Check if modifier type is anything other than retail
  const modifierType = category.price_modifier_type;
  if (modifierType === 'wholesale' || modifierType === 'discount_percentage') {
    return true;
  }

  if (modifierType === 'custom') {
    // Check if there are any custom prices for this category
    const count = await db.offline_product_category_prices
      .where('customer_category_id')
      .equals(category.id)
      .count();
    return count > 0;
  }

  return false;
}
