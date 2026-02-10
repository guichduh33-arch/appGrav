/**
 * Offline Customer Types
 *
 * Type definitions for offline customer management including:
 * - Customer cache (Story 6.1)
 * - Customer category pricing (Story 6.2)
 * - Promotions cache (Story 6.4)
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

// =====================================================
// Customers Cache Types (Story 6.1)
// =====================================================

/**
 * Cached customer for offline POS access
 *
 * Stored in Dexie table: offline_customers
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineCustomer {
  /** Customer UUID (primary key) */
  id: string;

  /** Phone number for search and identification */
  phone: string | null;

  /** Customer name */
  name: string;

  /** Email address */
  email: string | null;

  /** Customer category slug: 'retail', 'wholesale', 'discount_percentage', 'custom' */
  category_slug: string | null;

  /** Current loyalty tier name: 'Bronze', 'Silver', 'Gold', 'Platinum' */
  loyalty_tier: string | null;

  /** Current loyalty points balance */
  points_balance: number;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/** Cache TTL for customers (24 hours in ms) */
export const CUSTOMERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for customers when online (1 hour in ms) */
export const CUSTOMERS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Customer Category Pricing Types (Story 6.2)
// =====================================================

/**
 * Price type applied to cart item
 * Indicates which pricing strategy was used
 */
export type TPriceType = 'retail' | 'wholesale' | 'discount' | 'custom';

/**
 * Cached customer category for offline pricing calculation
 *
 * Stored in Dexie table: offline_customer_categories
 * Used to determine pricing logic for customers
 *
 * @see Story 6.2: Customer Category Pricing Offline
 * @see ADR-001: Entites Synchronisees Offline
 */
export interface IOfflineCustomerCategory {
  /** Category UUID (primary key) */
  id: string;

  /** Category slug: 'retail', 'wholesale', 'discount_percentage', 'custom' */
  slug: string;

  /** Display name */
  name: string;

  /** Price modifier type (same as slug for now) */
  price_modifier_type: string;

  /** Discount percentage for 'discount_percentage' type (null for other types) */
  discount_percentage: number | null;

  /** Whether category is active */
  is_active: boolean;
}

/**
 * Cached product-specific price for a customer category
 * Used when category has price_modifier_type = 'custom'
 *
 * Stored in Dexie table: offline_product_category_prices
 * Only prices where is_active = true are cached
 *
 * @see Story 6.2: Customer Category Pricing Offline
 */
export interface IOfflineProductCategoryPrice {
  /** Price entry UUID (primary key) */
  id: string;

  /** Product UUID */
  product_id: string;

  /** Customer category UUID */
  customer_category_id: string;

  /** Custom price for this product/category combination (IDR) */
  price: number;

  /** Whether this price is active */
  is_active: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Result of customer pricing calculation
 * Returned by getCustomerProductPriceOffline
 */
export interface ICustomerPriceResult {
  /** Calculated price in IDR */
  price: number;

  /** Type of pricing applied */
  priceType: TPriceType;

  /** Savings compared to retail price (IDR) */
  savings: number;

  /** Category name for display (null if retail) */
  categoryName: string | null;
}

/** Cache TTL for customer categories (24 hours in ms) */
export const CUSTOMER_CATEGORIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Cache TTL for product category prices (24 hours in ms) */
export const PRODUCT_CATEGORY_PRICES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// =====================================================
// Promotions Cache Types (Story 6.4)
// =====================================================

/**
 * Promotion type for offline evaluation
 */
export type TPromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product';

/**
 * Cached promotion for offline use
 *
 * Stored in Dexie table: offline_promotions
 * TTL: 24 hours, refresh every hour when online
 *
 * @see Story 6.4: Promotions Offline Cache
 * @see ADR-001: Promotions are READ-ONLY cache
 */
export interface IOfflinePromotion {
  /** Promotion UUID (primary key) */
  id: string;

  /** Unique promotion code */
  code: string;

  /** Promotion display name */
  name: string;

  /** Optional description */
  description: string | null;

  /** Promotion type: percentage, fixed_amount, buy_x_get_y, free_product */
  promotion_type: TPromotionType;

  /** Discount percentage for 'percentage' type (e.g., 10 for 10%) */
  discount_percentage: number | null;

  /** Discount amount for 'fixed_amount' type (IDR) */
  discount_amount: number | null;

  /** Buy quantity for 'buy_x_get_y' type */
  buy_quantity: number | null;

  /** Get quantity for 'buy_x_get_y' type */
  get_quantity: number | null;

  /** Start date (ISO date string) - null means no start restriction */
  start_date: string | null;

  /** End date (ISO date string) - null means no end restriction */
  end_date: string | null;

  /** Start time restriction (HH:MM format) */
  time_start: string | null;

  /** End time restriction (HH:MM format) */
  time_end: string | null;

  /** Days of week restriction (0=Sunday, 6=Saturday), null means all days */
  days_of_week: number[] | null;

  /** Minimum purchase amount to activate (IDR) */
  min_purchase_amount: number | null;

  /** Minimum product quantity to activate */
  min_quantity: number | null;

  /** Whether promotion is active */
  is_active: boolean;

  /** Whether promotion can stack with others */
  is_stackable: boolean;

  /** Priority for conflict resolution (higher = applied first) */
  priority: number;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Promotion-product association for targeted promotions
 *
 * Stored in Dexie table: offline_promotion_products
 * Links promotions to specific products or categories
 *
 * @see Story 6.4: Promotions Offline Cache
 */
export interface IOfflinePromotionProduct {
  /** Association UUID (primary key) */
  id: string;

  /** FK to promotions.id */
  promotion_id: string;

  /** FK to products.id - specific product, OR null if category */
  product_id: string | null;

  /** FK to categories.id - entire category, OR null if specific product */
  category_id: string | null;
}

/**
 * Free product for buy_x_get_y and free_product promotions
 *
 * Stored in Dexie table: offline_promotion_free_products
 * Defines what products are given free with a promotion
 *
 * @see Story 6.4: Promotions Offline Cache
 */
export interface IOfflinePromotionFreeProduct {
  /** Association UUID (primary key) */
  id: string;

  /** FK to promotions.id */
  promotion_id: string;

  /** FK to products.id - the free product given */
  free_product_id: string;

  /** Quantity of free product given */
  quantity: number;
}

/** Cache TTL for promotions (24 hours in ms) */
export const PROMOTIONS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for promotions when online (1 hour in ms) */
export const PROMOTIONS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
