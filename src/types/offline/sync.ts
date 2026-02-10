/**
 * Offline Sync Types
 *
 * Type definitions for sync queue management including:
 * - Sync queue items (Story 3.1)
 * - Legacy sync queue (backward compatibility)
 * - Sync metadata
 * - Offline periods (Story 3.3, 3.4)
 *
 * @see _bmad-output/planning-artifacts/architecture.md#Naming-Patterns
 */

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
  | 'payments'      // Story 3.4
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
 * @see ADR-002: Strategie de Synchronisation
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

/** Maximum retry attempts for sync queue items */
export const SYNC_MAX_RETRIES = 3;

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
// Legacy Sync Queue Types (for migration compatibility)
// =====================================================

/**
 * Legacy sync queue type identifiers
 * Used by services/sync/* for order sync operations
 */
export type TLegacySyncQueueType = 'order' | 'payment' | 'stock_movement' | 'product' | 'category' | 'product_category_price';

/**
 * Legacy sync queue status
 */
export type TLegacySyncQueueStatus = 'pending' | 'syncing' | 'failed' | 'synced';

/**
 * Legacy sync queue item structure
 * Used by sync services for backward compatibility
 *
 * @see services/sync/syncQueue.ts
 */
export interface ILegacySyncQueueItem {
  /** Unique sync item UUID */
  id: string;

  /** Type of transaction */
  type: TLegacySyncQueueType;

  /** UUID of the entity being synced (optional for legacy) */
  entityId?: string;

  /** CRUD action: create, update, delete (optional for legacy) */
  action?: 'create' | 'update' | 'delete';

  /** Transaction payload data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;

  /** Current sync status */
  status: TLegacySyncQueueStatus;

  /** ISO 8601 timestamp when created */
  createdAt: string;

  /** Number of sync attempts */
  attempts: number;

  /** Last error message if failed */
  lastError: string | null;

  /** ISO 8601 timestamp of the last sync attempt (for backoff calculation) */
  lastAttemptAt?: string | null;
}

// =====================================================
// Offline Period Types (Story 3.3, 3.4)
// =====================================================

/**
 * Offline period tracking for sync reports
 *
 * Stored in Dexie table: offline_periods
 * Tracks when the system was offline for reporting
 *
 * @see Story 3.3: Post-Offline Sync Report
 * @see Story 3.4: Offline Period History
 */
export interface IOfflinePeriod {
  /** Unique period UUID (primary key) */
  id: string;

  /** ISO 8601 timestamp when offline period started */
  start_time: string;

  /** ISO 8601 timestamp when offline period ended, null if still offline */
  end_time: string | null;

  /** Duration in milliseconds, null if still offline */
  duration_ms: number | null;

  /** Number of transactions created during this period */
  transactions_created: number;

  /** Number of transactions successfully synced */
  transactions_synced: number;

  /** Number of transactions that failed to sync */
  transactions_failed: number;

  /** Whether the sync report has been generated/shown */
  sync_report_generated: boolean;
}
