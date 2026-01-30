/**
 * Dexie Database Instance for Offline Support
 *
 * This module provides the IndexedDB wrapper for offline data persistence.
 * All offline tables are prefixed with `offline_` as per ADR-001.
 *
 * @see _bmad-output/planning-artifacts/architecture.md#ADR-001
 */
import Dexie, { type Table } from 'dexie';
import type { IOfflineUser, ISyncQueueItem } from '@/types/offline';

/**
 * OfflineDatabase class extending Dexie for AppGrav offline support
 *
 * Table naming convention: offline_{entity}
 * Primary keys: UUID strings (id)
 */
export class OfflineDatabase extends Dexie {
  // Auth & User cache (Story 1.1)
  offline_users!: Table<IOfflineUser>;

  // Sync queue for pending operations (foundation for Story 3.1)
  offline_sync_queue!: Table<ISyncQueueItem>;

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
  }
}

// Singleton database instance
export const db = new OfflineDatabase();

// Re-export for convenience
export type { IOfflineUser, ISyncQueueItem };
