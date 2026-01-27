import Dexie, { Table } from 'dexie';

/**
 * Sync queue item type
 */
export type TSyncQueueType = 'order' | 'payment' | 'stock_movement';

/**
 * Sync queue status
 */
export type TSyncQueueStatus = 'pending' | 'syncing' | 'failed' | 'synced';

/**
 * Offline product interface
 * Mirrors essential fields from products table for offline POS operations
 */
export interface IOfflineProduct {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  price: number;
  is_active: boolean;
  image_url: string | null;
  updated_at: string; // ISO 8601
}

/**
 * Offline category interface
 * Mirrors essential fields from categories table
 */
export interface IOfflineCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

/**
 * Offline product modifier interface
 * Mirrors essential fields from product_modifiers table
 */
export interface IOfflineProductModifier {
  id: string;
  product_id: string;
  name: string;
  price_adjustment: number;
}

/**
 * Offline customer interface
 * Mirrors essential fields from customers table for offline lookup
 */
export interface IOfflineCustomer {
  id: string;
  phone: string | null;
  name: string;
  email: string | null;
  loyalty_points: number;
  customer_category_slug: string | null;
  updated_at: string; // ISO 8601
}

/**
 * Offline floor plan item interface
 * Mirrors essential fields from floor_plan_items table
 */
export interface IOfflineFloorPlanItem {
  id: string;
  table_number: number;
  label: string;
  capacity: number;
  position_x: number;
  position_y: number;
}

/**
 * Sync queue item interface
 * Stores transactions waiting to be synchronized with Supabase
 */
export interface ISyncQueueItem {
  id: string;
  type: TSyncQueueType;
  payload: object;
  status: TSyncQueueStatus;
  createdAt: string; // ISO 8601
  attempts: number;
  lastError: string | null;
}

/**
 * Offline order item interface
 * Stores items within an offline order
 */
export interface IOfflineOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers: Array<{
    id: string;
    name: string;
    price_adjustment: number;
  }>;
}

/**
 * Offline order interface
 * Stores orders created during offline mode
 */
export interface IOfflineOrder {
  id: string;
  order_number: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  table_number: string | null;
  customer_id: string | null;
  customer_name: string | null;
  items: IOfflineOrderItem[];
  subtotal: number;
  discount_amount: number;
  discount_type: string | null;
  discount_value: number | null;
  tax_amount: number;
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid';
  notes: string;
  created_at: string; // ISO 8601
  created_offline: boolean;
  synced: boolean;
  synced_at: string | null;
  pos_terminal_id: string | null;
}

/**
 * Offline period interface
 * Tracks when the system was offline for reporting (Story 3.3, 3.4)
 */
export interface IOfflinePeriod {
  id: string;
  start_time: string; // ISO 8601
  end_time: string | null; // ISO 8601, null if still offline
  duration_ms: number | null;
  transactions_created: number;
  transactions_synced: number;
  transactions_failed: number;
  sync_report_generated: boolean;
}

/**
 * Dexie database for offline storage
 *
 * Schema version history:
 * v1: Initial schema with products, categories, modifiers, customers, floor_plan, sync_queue
 *
 * Index format: 'primaryKey, index1, index2, ...'
 * - First field is always the primary key
 * - Additional fields are indexed for queries
 */
export class AppGravOfflineDb extends Dexie {
  products!: Table<IOfflineProduct, string>;
  categories!: Table<IOfflineCategory, string>;
  product_modifiers!: Table<IOfflineProductModifier, string>;
  customers!: Table<IOfflineCustomer, string>;
  floor_plan_items!: Table<IOfflineFloorPlanItem, string>;
  sync_queue!: Table<ISyncQueueItem, string>;
  offline_orders!: Table<IOfflineOrder, string>;
  offline_periods!: Table<IOfflinePeriod, string>;

  constructor() {
    super('AppGravOffline');

    this.version(1).stores({
      products: 'id, category_id, name, is_active, updated_at',
      categories: 'id, name, is_active, display_order',
      product_modifiers: 'id, product_id',
      customers: 'id, phone, name, updated_at',
      floor_plan_items: 'id, table_number',
      sync_queue: 'id, type, status, createdAt'
    });

    // Version 2: Add offline_orders table for Story 2.2
    this.version(2).stores({
      products: 'id, category_id, name, is_active, updated_at',
      categories: 'id, name, is_active, display_order',
      product_modifiers: 'id, product_id',
      customers: 'id, phone, name, updated_at',
      floor_plan_items: 'id, table_number',
      sync_queue: 'id, type, status, createdAt',
      offline_orders: 'id, order_number, created_at, synced, payment_status'
    });

    // Version 3: Add offline_periods table for Story 3.3, 3.4
    this.version(3).stores({
      products: 'id, category_id, name, is_active, updated_at',
      categories: 'id, name, is_active, display_order',
      product_modifiers: 'id, product_id',
      customers: 'id, phone, name, updated_at',
      floor_plan_items: 'id, table_number',
      sync_queue: 'id, type, status, createdAt',
      offline_orders: 'id, order_number, created_at, synced, payment_status',
      offline_periods: 'id, start_time, end_time'
    });
  }
}

/**
 * Singleton instance of the offline database
 * Use this throughout the application for offline data access
 */
export const offlineDb = new AppGravOfflineDb();
