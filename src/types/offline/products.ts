/**
 * Offline Product & Inventory Types
 *
 * Type definitions for offline product/category/modifier/recipe caching including:
 * - Products cache (Story 2.1)
 * - Categories cache (Story 2.2)
 * - Modifiers cache (Story 2.3)
 * - Recipes cache (Story 2.4)
 * - Production reminders (Story 2.5)
 * - Stock levels (Story 5.1)
 * - Stock alerts (Story 5.2)
 * - Deferred adjustment notes (Story 5.3)
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

// =====================================================
// Products Cache Types (Story 2.1)
// =====================================================

/**
 * Cached product for offline POS access
 *
 * Stored in Dexie table: offline_products
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineProduct {
  /** Product UUID (primary key) */
  id: string;

  /** FK to categories.id */
  category_id: string | null;

  /** Stock Keeping Unit */
  sku: string | null;

  /** Product name */
  name: string;

  /** Product type: finished, semi_finished, raw_material */
  product_type: string | null;

  /** Units of measure (e.g., 'pcs', 'kg') */
  unit?: string | null;

  /** Retail price in IDR */
  retail_price: number;

  /** Wholesale price in IDR (for B2B customers) */
  wholesale_price: number | null;

  /** Cost price for margin calculation */
  cost_price: number | null;

  /** Current stock quantity */
  current_stock: number | null;

  /** Minimum stock level for alerts */
  min_stock_level?: number | null;

  /** Product image URL */
  image_url: string | null;

  /** Whether product is active */
  is_active: boolean;

  /** Whether product is visible in POS */
  pos_visible: boolean;

  /** Whether product is available for sale */
  available_for_sale: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/** Cache TTL for products (24 hours in ms) */
export const PRODUCTS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for products when online (1 hour in ms) */
export const PRODUCTS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Categories Cache Types (Story 2.2)
// =====================================================

/**
 * Dispatch station for KDS routing
 * Re-exported from database enums for consistency
 */
export type TDispatchStation = import('../database.generated').Database['public']['Enums']['dispatch_station'];

/**
 * Cached category for offline POS access
 *
 * Stored in Dexie table: offline_categories
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineCategory {
  /** Category UUID (primary key) */
  id: string;

  /** Category name */
  name: string;

  /** Icon identifier (Lucide icon name) */
  icon: string | null;

  /** Color for UI display (hex or named color) */
  color: string | null;

  /** Sort order for display */
  sort_order: number | null;

  /** Dispatch station for KDS routing: barista, kitchen, display, none */
  dispatch_station: TDispatchStation | null;

  /** Whether category is active */
  is_active: boolean;

  /** Whether category is for raw materials (excluded from POS) */
  is_raw_material: boolean;

  /** Whether category is shown in POS */
  show_in_pos?: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string | null;
}

/** Cache TTL for categories (24 hours in ms) - same as products */
export const CATEGORIES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for categories when online (1 hour in ms) - same as products */
export const CATEGORIES_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Modifiers Cache Types (Story 2.3)
// =====================================================

/**
 * Modifier group type: single selection (radio) or multiple (checkbox)
 */
export type TModifierGroupType = 'single' | 'multiple';

/**
 * Cached product modifier for offline POS access
 *
 * Stored in Dexie table: offline_modifiers
 * TTL: 24 hours, refresh every hour when online
 *
 * Modifiers can be linked to either a product OR a category:
 * - Product modifiers: Override category modifiers for specific products
 * - Category modifiers: Default modifiers for all products in that category
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineModifier {
  /** Modifier UUID (primary key) */
  id: string;

  /** FK to products.id (null if category-level modifier) */
  product_id: string | null;

  /** FK to categories.id (null if product-level modifier) */
  category_id: string | null;

  /** Group name for grouping options (e.g., "Size", "Temperature") */
  group_name: string;

  /** Group type: single (radio) or multiple (checkbox) */
  group_type: TModifierGroupType;

  /** Whether selection in this group is required */
  group_required: boolean;

  /** Sort order for the group */
  group_sort_order: number;

  /** Option identifier within the group */
  option_id: string;

  /** Display label for the option */
  option_label: string;

  /** Emoji icon for the option */
  option_icon: string | null;

  /** Price adjustment in IDR (can be negative) */
  price_adjustment: number;

  /** Whether this option is selected by default */
  is_default: boolean;

  /** Sort order for the option within the group */
  option_sort_order: number;

  /** Whether modifier is active */
  is_active: boolean;

  /** ISO 8601 timestamp of creation */
  created_at: string | null;
}

/** Cache TTL for modifiers (24 hours in ms) - same as products */
export const MODIFIERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for modifiers when online (1 hour in ms) - same as products */
export const MODIFIERS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Recipes Cache Types (Story 2.4)
// =====================================================

/**
 * Cached recipe ingredient for offline costing display
 *
 * Stored in Dexie table: offline_recipes
 * TTL: 24 hours, refresh every hour when online
 *
 * Recipes store the ingredient links for a product's cost calculation.
 * Material cost_price comes from the offline_products table.
 *
 * @see ADR-001: Entites Synchronisees Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineRecipe {
  /** Recipe UUID (primary key) */
  id: string;

  /** FK to products.id - The finished/semi-finished product */
  product_id: string;

  /** FK to products.id - The ingredient/material */
  material_id: string;

  /** Quantity of material per 1kg of product */
  quantity: number;

  /** Unit display string (e.g., "kg", "L", "pcs") */
  unit: string | null;

  /** Whether this recipe ingredient is active */
  is_active: boolean;

  /** ISO 8601 timestamp of creation */
  created_at: string | null;

  /** ISO 8601 timestamp of last update */
  updated_at: string | null;
}

/**
 * Recipe with joined material data for costing display
 * Used when rendering the CostingTab offline
 */
export interface IOfflineRecipeWithMaterial extends IOfflineRecipe {
  material: {
    id: string;
    name: string;
    sku: string | null;
    unit: string | null;
    cost_price: number | null;
    current_stock?: number;
  } | null;
}

/** Cache TTL for recipes (24 hours in ms) - same as products */
export const RECIPES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for recipes when online (1 hour in ms) - same as products */
export const RECIPES_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Production Reminders Types (Story 2.5)
// =====================================================

/**
 * Production item stored in a reminder
 * Mirrors the ProductionItem interface from useProduction
 */
export interface IProductionReminderItem {
  productId: string;
  name: string;
  category: string;
  icon: string;
  unit: string;
  quantity: number;
  wasted: number;
  wasteReason: string;
}

/**
 * Production reminder for offline mode
 *
 * Stored in localStorage (not Dexie) because:
 * - Simple structure, no complex queries needed
 * - Expected < 10 reminders at any time
 * - localStorage is simpler for this use case
 *
 * @see Story 2.5: Production Records (Online-Only with Deferred Sync)
 */
export interface IProductionReminder {
  /** UUID of the reminder */
  id: string;

  /** FK to sections.id */
  sectionId: string;

  /** Section name for display */
  sectionName: string;

  /** Intended production date (ISO 8601) */
  productionDate: string;

  /** Items to produce */
  items: IProductionReminderItem[];

  /** ISO 8601 timestamp when reminder was created */
  createdAt: string;

  /** Optional note from user */
  note?: string;
}

/** localStorage key for production reminders */
export const PRODUCTION_REMINDERS_STORAGE_KEY = 'offline_production_reminders';

// =====================================================
// Stock Levels Cache Types (Story 5.1)
// =====================================================

/**
 * Cached stock level for offline inventory access
 *
 * Stored in Dexie table: offline_stock_levels
 * TTL: 24 hours, refresh every hour when online
 * Mode: READ-ONLY (modifications online-only per ADR-001)
 *
 * @see Epic 5: Stock & Approvisionnement
 */
export interface IOfflineStockLevel {
  /** Primary key = product_id (single location for MVP) */
  id: string;

  /** FK to products.id */
  product_id: string;

  /** FK to locations.id - null for single location MVP */
  location_id: string | null;

  /** Current stock quantity */
  quantity: number;

  /** Minimum stock level for alerts */
  min_stock_level: number;

  /** ISO 8601 timestamp of last stock update */
  last_updated: string;
}

/** Cache TTL for stock levels (24 hours in ms) */
export const STOCK_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Refresh interval for stock when online (1 hour in ms) */
export const STOCK_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

// =====================================================
// Stock Alerts Types (Story 5.2)
// =====================================================

/**
 * Stock alert level for display
 * Note: TStockStatus is exported from useStockLevelsOffline hook
 * This type alias ensures consistency
 */
export type TStockAlertLevel = 'ok' | 'warning' | 'critical' | 'out_of_stock';

/** Threshold for considering stock data stale (1 hour in ms) */
export const STALE_DATA_THRESHOLD_MS = 60 * 60 * 1000;

/**
 * Check if cached data is considered stale
 * Data is stale if more than STALE_DATA_THRESHOLD_MS has elapsed since last sync
 *
 * @param lastSyncAt - ISO 8601 timestamp of last sync, or null if never synced
 * @returns true if data is stale or never synced
 *
 * @example
 * ```typescript
 * const { lastSyncAt } = useStockLevelsOffline();
 * if (isDataStale(lastSyncAt)) {
 *   // Show stale data warning
 * }
 * ```
 */
export function isDataStale(lastSyncAt: string | null): boolean {
  if (!lastSyncAt) return true;

  const lastSyncTime = new Date(lastSyncAt).getTime();
  const elapsed = Date.now() - lastSyncTime;

  return elapsed > STALE_DATA_THRESHOLD_MS;
}

// =====================================================
// Deferred Adjustment Notes Types (Story 5.3)
// =====================================================

/**
 * Type of stock adjustment for deferred notes
 * Matches the existing stock adjustment types
 */
export type TStockAdjustmentType = 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out';

/**
 * Deferred adjustment note for offline mode
 *
 * Stored in Dexie table: offline_adjustment_notes
 * Used when user tries to make stock adjustment while offline
 * Notes are persisted locally and can be processed when online
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 * @see ADR-001: Stock adjustments are online-only for traceability
 */
export interface IDeferredAdjustmentNote {
  /** Auto-increment ID (Dexie) */
  id?: number;

  /** FK to products.id (optional - note may not be linked to specific product) */
  product_id?: string;

  /** Product name for display (denormalized for offline access) */
  product_name?: string;

  /** Free-form note text describing the intended adjustment */
  note: string;

  /** Suggested adjustment type (optional) */
  adjustment_type?: TStockAdjustmentType;

  /** Suggested quantity to adjust (optional) */
  suggested_quantity?: number;

  /** ISO 8601 timestamp when note was created */
  created_at: string;

  /** User ID who created the note (if available offline) */
  created_by?: string;
}
