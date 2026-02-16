/**
 * Dexie Database Instance for Offline Support
 *
 * This module provides the IndexedDB wrapper for offline data persistence.
 * All offline tables are prefixed with `offline_` as per ADR-001.
 *
 * @see _bmad-output/planning-artifacts/architecture.md#ADR-001
 */
import Dexie, { type Table } from 'dexie';
import type {
  IOfflineUser,
  ISyncQueueItem,
  ISyncMeta,
  ISyncConflict,
  IOfflineSetting,
  IOfflineTaxRate,
  IOfflinePaymentMethod,
  IOfflineBusinessHours,
  IOfflineProduct,
  IOfflineCategory,
  IOfflineModifier,
  IOfflineRecipe,
  IOfflineOrder,
  IOfflineOrderItem,
  IOfflinePayment,
  IOfflineSession,
  IDispatchQueueItem,
  IOfflineStockLevel,
  IDeferredAdjustmentNote,
  IOfflineCustomer,
  IOfflineCustomerCategory,
  IOfflineProductCategoryPrice,
  IOfflinePromotion,
  IOfflinePromotionProduct,
  IOfflinePromotionFreeProduct,
  IOfflineRateLimit,
  IOfflinePeriod,
  ILegacySyncQueueItem,
  ILegacyOfflineOrder,
  ILegacyOfflineOrderItem,
  IOfflineReportCache,
  IOfflineHeldOrder,
} from '@/types/offline';

/**
 * OfflineDatabase class extending Dexie for AppGrav offline support
 *
 * Table naming convention: offline_{entity}
 * Primary keys: UUID strings (id) or entity-specific keys
 */
export class OfflineDatabase extends Dexie {
  // Auth & User cache (Story 1.1)
  offline_users!: Table<IOfflineUser>;

  // Rate limiting for PIN auth (Story 1.2 - persisted to prevent refresh bypass)
  offline_rate_limits!: Table<IOfflineRateLimit>;

  // Sync queue for pending operations (foundation for Story 3.1)
  offline_sync_queue!: Table<ISyncQueueItem>;

  // Settings cache (Story 1.5)
  offline_settings!: Table<IOfflineSetting>;
  offline_tax_rates!: Table<IOfflineTaxRate>;
  offline_payment_methods!: Table<IOfflinePaymentMethod>;
  offline_business_hours!: Table<IOfflineBusinessHours>;

  // Sync metadata for tracking cache freshness
  offline_sync_meta!: Table<ISyncMeta>;

  // Products cache (Story 2.1)
  offline_products!: Table<IOfflineProduct>;

  // Categories cache (Story 2.2)
  offline_categories!: Table<IOfflineCategory>;

  // Modifiers cache (Story 2.3)
  offline_modifiers!: Table<IOfflineModifier>;

  // Recipes cache (Story 2.4)
  offline_recipes!: Table<IOfflineRecipe>;

  // Orders cache (Story 3.1)
  offline_orders!: Table<IOfflineOrder>;

  // Order items cache (Story 3.1)
  offline_order_items!: Table<IOfflineOrderItem>;

  // Payments cache (Story 3.4)
  offline_payments!: Table<IOfflinePayment>;

  // Sessions cache (Story 3.5)
  offline_sessions!: Table<IOfflineSession>;

  // Dispatch queue for KDS (Story 3.7)
  offline_dispatch_queue!: Table<IDispatchQueueItem>;

  // Stock levels cache (Story 5.1)
  offline_stock_levels!: Table<IOfflineStockLevel>;

  // Deferred adjustment notes (Story 5.3)
  offline_adjustment_notes!: Table<IDeferredAdjustmentNote>;

  // Customers cache (Story 6.1)
  offline_customers!: Table<IOfflineCustomer>;

  // Customer categories cache (Story 6.2)
  offline_customer_categories!: Table<IOfflineCustomerCategory>;

  // Product category prices cache (Story 6.2)
  offline_product_category_prices!: Table<IOfflineProductCategoryPrice>;

  // Promotions cache (Story 6.4)
  offline_promotions!: Table<IOfflinePromotion>;

  // Promotion products cache (Story 6.4)
  offline_promotion_products!: Table<IOfflinePromotionProduct>;

  // Promotion free products cache (Story 6.4)
  offline_promotion_free_products!: Table<IOfflinePromotionFreeProduct>;

  // Offline periods tracking (Story 3.3, 3.4)
  offline_periods!: Table<IOfflinePeriod>;

  // Legacy sync queue for backward compatibility (Story 3.x migration)
  offline_legacy_sync_queue!: Table<ILegacySyncQueueItem>;

  // Legacy orders for backward compatibility (orderSync.ts)
  offline_legacy_orders!: Table<ILegacyOfflineOrder>;

  // Reports cache for offline access (Story 8.8)
  offline_reports_cache!: Table<IOfflineReportCache>;

  // Sync conflicts for conflict resolution UI (Sprint 3)
  offline_sync_conflicts!: Table<ISyncConflict>;

  // Held orders (Story: Held Orders Persistence)
  offline_held_orders!: Table<IOfflineHeldOrder>;

  constructor() {
    super('appgrav-offline');

    // Version 1: Initial schema with auth and sync queue
    this.version(1).stores({
      // offline_users: User credentials cache for offline PIN auth
      // Indexes: id (primary), cached_at (for expiration queries)
      offline_users: 'id, cached_at',

      // offline_sync_queue: Pending operations to sync when online
      // Indexes: ++id (auto-increment), entity, status, created_at
      offline_sync_queue: '++id, entity, status, created_at',
    });

    // Version 2: Settings cache (Story 1.5)
    this.version(2).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',

      // NEW: Settings cache
      // Indexes: key (primary), category_id, updated_at
      offline_settings: 'key, category_id, updated_at',

      // NEW: Tax rates cache
      // Indexes: id (primary), is_active, is_default, [is_active+is_default] compound
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',

      // NEW: Payment methods cache
      // Indexes: id (primary), is_active, is_default, sort_order, [is_active+is_default] compound
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',

      // NEW: Business hours cache
      // Indexes: day_of_week (primary)
      offline_business_hours: 'day_of_week',

      // NEW: Sync metadata for tracking cache freshness
      // Indexes: entity (primary)
      offline_sync_meta: 'entity',
    });

    // Version 3: Products cache (Story 2.1)
    this.version(3).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',

      // NEW: Products cache (Story 2.1)
      // Indexes: id (primary), category_id, sku, name, is_active, pos_visible,
      // [is_active+pos_visible+available_for_sale] compound for POS queries
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
    });

    // Version 4: Categories cache (Story 2.2)
    this.version(4).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',

      // NEW: Categories cache (Story 2.2)
      // Indexes: id (primary), name, sort_order, is_active, dispatch_station
      // Compound index [is_active+is_raw_material] for efficient POS queries
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
    });

    // Version 5: Modifiers cache (Story 2.3)
    this.version(5).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',

      // NEW: Modifiers cache (Story 2.3)
      // Indexes: id (primary), product_id, category_id, group_name, is_active
      // Compound indexes for efficient queries by product or category
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
    });

    // Version 6: Recipes cache (Story 2.4)
    this.version(6).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',

      // NEW: Recipes cache (Story 2.4)
      // Indexes: id (primary), product_id, material_id, is_active
      // Compound index [is_active+product_id] for efficient costing queries
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
    });

    // Version 7: Orders cache (Story 3.1)
    this.version(7).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',

      // NEW: Orders cache (Story 3.1)
      // Indexes: id (primary), order_number (unique display), status, order_type,
      // customer_id, session_id, created_at, sync_status
      // Compound index [status+created_at] for common order queries
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, [status+created_at]',

      // NEW: Order items cache (Story 3.1)
      // Indexes: id (primary), order_id (FK), product_id, item_status
      offline_order_items: 'id, order_id, product_id, item_status',
    });

    // Version 8: Payments cache (Story 3.4)
    this.version(8).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',

      // NEW: Payments cache (Story 3.4)
      // Indexes: id (primary), order_id (FK), method, sync_status, created_at
      offline_payments: 'id, order_id, method, sync_status, created_at',
    });

    // Version 9: Sessions cache (Story 3.5)
    this.version(9).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',

      // NEW: Sessions cache (Story 3.5)
      // Indexes: id (primary), user_id, status, opened_at, sync_status
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
    });

    // Version 10: Kitchen Dispatch Queue (Story 3.7)
    this.version(10).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      // Updated: Added dispatch_status index for Story 3.7
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',

      // NEW: Dispatch queue for KDS (Story 3.7)
      // Indexes: ++id (auto-increment), order_id, station, status, created_at
      // Compound index [status+station] for processing queue by station
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
    });

    // Version 11: Stock Levels Cache (Story 5.1)
    this.version(11).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',

      // NEW: Stock levels cache (Story 5.1)
      // Indexes: id (primary = product_id), product_id, location_id, quantity
      // Compound index [product_id+location_id] for multi-location queries (future)
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
    });

    // Version 12: Deferred Adjustment Notes (Story 5.3)
    this.version(12).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',

      // NEW: Deferred adjustment notes (Story 5.3)
      // Indexes: ++id (auto-increment), product_id, created_at
      // Used to store adjustment intentions when offline
      offline_adjustment_notes: '++id, product_id, created_at',
    });

    // Version 13: Customers cache (Story 6.1)
    this.version(13).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',

      // NEW: Customers cache (Story 6.1)
      // Indexes: id (primary), phone, email, name for search
      // category_slug and loyalty_tier for filtering
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
    });

    // Version 14: Customer Category Pricing (Story 6.2)
    this.version(14).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',

      // NEW: Customer categories cache (Story 6.2)
      // Indexes: id (primary), slug (for lookups), is_active
      offline_customer_categories: 'id, slug, is_active',

      // NEW: Product category prices cache (Story 6.2)
      // Compound index [product_id+customer_category_id] for fast price lookup
      // Individual indexes for batch operations
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
    });

    // Version 15: Promotions cache (Story 6.4)
    this.version(15).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
      offline_customer_categories: 'id, slug, is_active',
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',

      // NEW: Promotions cache (Story 6.4)
      // Indexes: id (primary), code (unique), is_active, start_date, end_date, priority
      // Compound index [is_active+start_date+end_date] for validity queries
      offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',

      // NEW: Promotion target products/categories (Story 6.4)
      // Compound indexes for looking up promotions by product or category
      offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',

      // NEW: Promotion free products for buy_x_get_y (Story 6.4)
      // Index by promotion_id for fetching free products for a promotion
      offline_promotion_free_products: 'id, promotion_id, free_product_id',
    });

    // Version 16: Rate Limiting Persistence (Story 1.2 security fix)
    this.version(16).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
      offline_customer_categories: 'id, slug, is_active',
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
      offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',
      offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',
      offline_promotion_free_products: 'id, promotion_id, free_product_id',

      // NEW: Rate limiting persistence (Story 1.2 security fix)
      // Prevents brute-force bypass via page refresh
      // Indexes: id (primary = user_id), last_attempt for cleanup
      offline_rate_limits: 'id, last_attempt',
    });

    // Version 17: Offline Periods & Legacy Sync Queue (Story 3.3, 3.4 migration)
    this.version(17).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
      offline_customer_categories: 'id, slug, is_active',
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
      offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',
      offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',
      offline_promotion_free_products: 'id, promotion_id, free_product_id',
      offline_rate_limits: 'id, last_attempt',

      // NEW: Offline periods tracking (Story 3.3, 3.4)
      // Indexes: id (primary), start_time, end_time for range queries
      offline_periods: 'id, start_time, end_time',

      // NEW: Legacy sync queue for backward compatibility
      // Indexes: id (primary), type, status, createdAt for FIFO processing
      offline_legacy_sync_queue: 'id, type, status, createdAt',

      // NEW: Legacy orders for orderSync.ts backward compatibility
      // Indexes: id (primary), order_number, created_at, synced for queries
      offline_legacy_orders: 'id, order_number, created_at, synced, payment_status',
    });

    // Version 18: Reports Offline Cache (Story 8.8)
    this.version(18).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
      offline_customer_categories: 'id, slug, is_active',
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
      offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',
      offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',
      offline_promotion_free_products: 'id, promotion_id, free_product_id',
      offline_rate_limits: 'id, last_attempt',
      offline_periods: 'id, start_time, end_time',
      offline_legacy_sync_queue: 'id, type, status, createdAt',
      offline_legacy_orders: 'id, order_number, created_at, synced, payment_status',

      // NEW: Reports offline cache (Story 8.8)
      // Indexes: ++id (auto), report_type, report_date, [report_type+report_date] for unique lookups
      offline_reports_cache: '++id, report_type, report_date, [report_type+report_date], cached_at',
    });

    // Version 19: Sync Priority + Conflicts (Sprint 3 - Offline Improvements)
    this.version(19).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
      offline_customer_categories: 'id, slug, is_active',
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
      offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',
      offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',
      offline_promotion_free_products: 'id, promotion_id, free_product_id',
      offline_rate_limits: 'id, last_attempt',
      offline_periods: 'id, start_time, end_time',
      // UPDATED: Added priority index for priority-based sync ordering
      offline_legacy_sync_queue: 'id, type, status, createdAt, priority',
      offline_legacy_orders: 'id, order_number, created_at, synced, payment_status',
      offline_reports_cache: '++id, report_type, report_date, [report_type+report_date], cached_at',

      // NEW: Sync conflicts for conflict resolution UI
      // Indexes: &id (primary), entityType, resolvedAt
      offline_sync_conflicts: '&id, entityType, resolvedAt',
    });

    // Version 20: Held Orders Persistence
    this.version(20).stores({
      // Preserve existing tables
      offline_users: 'id, cached_at',
      offline_sync_queue: '++id, entity, status, created_at',
      offline_settings: 'key, category_id, updated_at',
      offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
      offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
      offline_business_hours: 'day_of_week',
      offline_sync_meta: 'entity',
      offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
      offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
      offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
      offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
      offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
      offline_order_items: 'id, order_id, product_id, item_status',
      offline_payments: 'id, order_id, method, sync_status, created_at',
      offline_sessions: 'id, user_id, status, opened_at, sync_status',
      offline_dispatch_queue: '++id, order_id, station, status, created_at, [status+station]',
      offline_stock_levels: 'id, product_id, location_id, quantity, [product_id+location_id]',
      offline_adjustment_notes: '++id, product_id, created_at',
      offline_customers: 'id, phone, email, name, category_slug, loyalty_tier, updated_at',
      offline_customer_categories: 'id, slug, is_active',
      offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
      offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',
      offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',
      offline_promotion_free_products: 'id, promotion_id, free_product_id',
      offline_rate_limits: 'id, last_attempt',
      offline_periods: 'id, start_time, end_time',
      offline_legacy_sync_queue: 'id, type, status, createdAt, priority',
      offline_legacy_orders: 'id, order_number, created_at, synced, payment_status',
      offline_reports_cache: '++id, report_type, report_date, [report_type+report_date], cached_at',
      offline_sync_conflicts: '&id, entityType, resolvedAt',

      // NEW: Held orders table
      // Indexes: &id (primary), order_number, terminal_id, session_id, created_at
      offline_held_orders: '&id, order_number, terminal_id, session_id, created_at',
    });
  }
}

// Singleton database instance
export const db = new OfflineDatabase();

// Re-export for convenience
export type {
  IOfflineUser,
  ISyncQueueItem,
  ISyncMeta,
  ISyncConflict,
  IOfflineSetting,
  IOfflineTaxRate,
  IOfflinePaymentMethod,
  IOfflineBusinessHours,
  IOfflineProduct,
  IOfflineCategory,
  IOfflineModifier,
  IOfflineRecipe,
  IOfflineOrder,
  IOfflineOrderItem,
  IOfflinePayment,
  IOfflineSession,
  IDispatchQueueItem,
  IOfflineStockLevel,
  IDeferredAdjustmentNote,
  IOfflineCustomer,
  IOfflineCustomerCategory,
  IOfflineProductCategoryPrice,
  IOfflinePromotion,
  IOfflinePromotionProduct,
  IOfflinePromotionFreeProduct,
  IOfflineRateLimit,
  IOfflinePeriod,
  ILegacySyncQueueItem,
  ILegacyOfflineOrder,
  ILegacyOfflineOrderItem,
  IOfflineReportCache,
  IOfflineHeldOrder,
};
