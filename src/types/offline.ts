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
