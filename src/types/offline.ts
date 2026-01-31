/**
 * Offline Types for AppGrav
 *
 * Type definitions for offline-first functionality including:
 * - User credential caching (Story 1.1)
 * - Sync queue management (foundation for Story 3.1)
 * - Error handling for offline operations
 *
 * Naming conventions:
 * - Interfaces: I{Name}
 * - Types: T{Name}
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

import type { Role, EffectivePermission } from './auth';

// =====================================================
// User Cache Types (Story 1.1)
// =====================================================

/**
 * Cached user data for offline PIN authentication
 *
 * Stored in Dexie table: offline_users
 * TTL: 24 hours from cached_at
 *
 * @see ADR-004: PIN Verification Offline
 * @see ADR-005: Permissions Offline
 */
export interface IOfflineUser {
  /** User UUID (primary key) */
  id: string;

  /** Bcrypt hash from server - NEVER store plaintext PIN */
  pin_hash: string;

  /** Cached user roles for permission checks */
  roles: Role[];

  /** Cached effective permissions with is_granted flags */
  permissions: EffectivePermission[];

  /** Display name for UI (nullable) */
  display_name: string | null;

  /** User's preferred language */
  preferred_language: 'fr' | 'en' | 'id';

  /** ISO 8601 timestamp of when data was cached */
  cached_at: string;
}

// =====================================================
// Offline Auth Types (Story 1.2)
// =====================================================

/**
 * Error codes for offline authentication
 * Used to return generic errors without revealing cache state
 */
export type TOfflineAuthError =
  | 'INVALID_PIN'       // PIN verification failed (also used for cache miss - security)
  | 'CACHE_EXPIRED'     // Cache older than 24h - online login required
  | 'RATE_LIMITED';     // Too many failed attempts

/**
 * Result of offline PIN verification
 * @see offlineAuthService.verifyPinOffline()
 */
export interface IOfflineAuthResult {
  /** Whether authentication succeeded */
  success: boolean;

  /** Error code if authentication failed */
  error?: TOfflineAuthError;

  /** Cached user data if authentication succeeded */
  user?: IOfflineUser;

  /** Seconds to wait if rate limited */
  waitSeconds?: number;
}

// =====================================================
// Sync Queue Types (Foundation for Story 3.1)
// =====================================================

/**
 * Entity types that can be synced offline
 * Defined in ADR-001
 */
export type TSyncEntity =
  | 'orders'
  | 'order_items'
  | 'pos_sessions'
  | 'customers'
  | 'products'
  | 'categories';

/**
 * CRUD actions for sync queue
 */
export type TSyncAction = 'create' | 'update' | 'delete';

/**
 * Sync queue item status
 */
export type TSyncStatus = 'pending' | 'syncing' | 'failed' | 'completed';

/**
 * Sync queue item structure
 *
 * Stored in Dexie table: offline_sync_queue
 * Processed FIFO when online
 *
 * @see ADR-002: Stratégie de Synchronisation
 */
export interface ISyncQueueItem {
  /** Auto-increment ID (Dexie) */
  id?: number;

  /** Target entity type */
  entity: TSyncEntity;

  /** CRUD action to perform */
  action: TSyncAction;

  /** UUID of the entity being synced */
  entityId: string;

  /** Full payload for the operation */
  payload: Record<string, unknown>;

  /** ISO 8601 timestamp when queued */
  created_at: string;

  /** Current sync status */
  status: TSyncStatus;

  /** Number of sync attempts */
  retries: number;

  /** Last error message if failed */
  lastError?: string;
}

// =====================================================
// Error Types
// =====================================================

/**
 * Error codes for offline operations
 * Used with OfflineError class
 */
export type TOfflineErrorCode =
  | 'SYNC_FAILED'       // Server sync operation failed
  | 'QUEUE_FULL'        // Sync queue reached capacity
  | 'STORAGE_FULL'      // IndexedDB quota exceeded
  | 'CONFLICT'          // Data conflict detected during sync
  | 'AUTH_EXPIRED'      // Offline session expired (24h TTL)
  | 'LAN_UNREACHABLE'   // LAN hub not reachable
  | 'CACHE_MISS';       // Requested data not in offline cache

/**
 * Custom error class for offline operations
 * Includes recovery hints and error codes
 */
export class OfflineError extends Error {
  constructor(
    message: string,
    public code: TOfflineErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'OfflineError';
  }
}

// =====================================================
// Cache Meta Types
// =====================================================

/**
 * Sync metadata for tracking entity cache freshness
 * Stored in Dexie table: offline_sync_meta
 */
export interface ISyncMeta {
  /** Entity name (e.g., 'products', 'customers') */
  entity: string;

  /** ISO 8601 timestamp of last successful sync */
  lastSyncAt: string;

  /** Number of records in cache */
  recordCount: number;
}

// =====================================================
// Constants
// =====================================================

/** Cache TTL for offline user credentials (24 hours in ms) */
export const OFFLINE_USER_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Maximum retry attempts for sync queue items */
export const SYNC_MAX_RETRIES = 3;

// =====================================================
// Settings Cache Types (Story 1.5)
// =====================================================

/**
 * IMPORTANT: Dexie/IndexedDB Boolean Storage
 *
 * IndexedDB stores boolean values as 0 (false) or 1 (true) when used in indexes.
 * This means:
 * - Queries must use `.equals(1)` instead of `.equals(true)`
 * - Values read back may be 0/1 instead of true/false
 * - Type definitions use `boolean` for API compatibility, but runtime values may be numbers
 * - Converter functions (toTaxRate, toPaymentMethod, etc.) use Boolean() to coerce values
 */

/**
 * Cached setting for offline access
 *
 * Stored in Dexie table: offline_settings
 * TTL: Unlimited (settings rarely change)
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-003: Politique de Cache
 */
export interface IOfflineSetting {
  /** Setting key (primary key) */
  key: string;

  /** JSONB value from settings table */
  value: unknown;

  /** FK to settings_categories.id */
  category_id: string;

  /** Value type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'file' */
  value_type: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Cached tax rate for offline access
 *
 * Stored in Dexie table: offline_tax_rates
 */
export interface IOfflineTaxRate {
  /** Tax rate UUID (primary key) */
  id: string;

  /** Tax rate name */
  name: string;

  /** Tax rate percentage (e.g., 10 for 10%) */
  rate: number;

  /** Whether this is the default tax rate */
  is_default: boolean;

  /** Whether this tax rate is active */
  is_active: boolean;

  /** ISO 8601 timestamp of creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Cached payment method for offline access
 *
 * Stored in Dexie table: offline_payment_methods
 */
export interface IOfflinePaymentMethod {
  /** Payment method UUID (primary key) */
  id: string;

  /** Payment method name */
  name: string;

  /** Payment type: 'cash' | 'card' | 'transfer' | 'ewallet' | 'other' */
  type: string;

  /** Whether this is the default payment method */
  is_default: boolean;

  /** Whether this payment method is active */
  is_active: boolean;

  /** Sort order for display */
  sort_order: number;

  /** ISO 8601 timestamp of creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;
}

/**
 * Cached business hours for offline access
 *
 * Stored in Dexie table: offline_business_hours
 */
export interface IOfflineBusinessHours {
  /** Day of week (0 = Sunday, 6 = Saturday) */
  day_of_week: number;

  /** Opening time (HH:mm format) */
  open_time: string | null;

  /** Closing time (HH:mm format) */
  close_time: string | null;

  /** Whether the business is open this day */
  is_open: boolean;
}

// =====================================================
// Products Cache Types (Story 2.1)
// =====================================================

/**
 * Cached product for offline POS access
 *
 * Stored in Dexie table: offline_products
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
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

  /** Retail price in IDR */
  retail_price: number;

  /** Wholesale price in IDR (for B2B customers) */
  wholesale_price: number | null;

  /** Cost price for margin calculation */
  cost_price: number | null;

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
export type TDispatchStation = import('./database.generated').Database['public']['Enums']['dispatch_station'];

/**
 * Cached category for offline POS access
 *
 * Stored in Dexie table: offline_categories
 * TTL: 24 hours, refresh every hour when online
 *
 * @see ADR-001: Entités Synchronisées Offline
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
 * @see ADR-001: Entités Synchronisées Offline
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
 * @see ADR-001: Entités Synchronisées Offline
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
