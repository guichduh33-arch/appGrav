/**
 * Sync Conflict Service
 * Sprint 3 - Offline Improvements
 *
 * Detects, stores, and resolves sync conflicts in IndexedDB.
 * Integrates with detectConflictType() from syncQueueHelpers.
 */

import { db } from '@/lib/db';
import type {
  ISyncConflict,
  TSyncConflictResolution,
  ILegacySyncQueueItem,
} from '@/types/offline';
import { detectConflictType } from './syncQueueHelpers';
import logger from '@/utils/logger';

/**
 * Detect a conflict from a sync error and queue item.
 * Returns an ISyncConflict if a conflict is detected, null otherwise.
 */
export function detectConflict(
  item: ILegacySyncQueueItem,
  error: unknown,
  serverData?: Record<string, unknown>
): ISyncConflict | null {
  const conflictType = detectConflictType(error);
  if (!conflictType) return null;

  return {
    id: crypto.randomUUID(),
    queueItemId: item.id,
    entityType: item.type,
    entityId: item.entityId ?? item.id,
    localData: item.payload,
    serverData: serverData ?? {},
    conflictType,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Store a conflict in IndexedDB for later resolution.
 */
export async function storeConflict(conflict: ISyncConflict): Promise<void> {
  await db.offline_sync_conflicts.add(conflict);
  logger.debug(
    `[SyncConflict] Stored conflict ${conflict.id} for ${conflict.entityType}:${conflict.entityId}`
  );
}

/**
 * Get all unresolved conflicts.
 */
export async function getPendingConflicts(): Promise<ISyncConflict[]> {
  return db.offline_sync_conflicts
    .filter((c) => !c.resolvedAt)
    .toArray();
}

/**
 * Get count of unresolved conflicts.
 */
export async function getPendingConflictCount(): Promise<number> {
  return db.offline_sync_conflicts
    .filter((c) => !c.resolvedAt)
    .count();
}

/**
 * Resolve a conflict with the given resolution strategy.
 */
export async function resolveConflict(
  conflictId: string,
  resolution: TSyncConflictResolution
): Promise<void> {
  await db.offline_sync_conflicts.update(conflictId, {
    resolvedAt: new Date().toISOString(),
    resolution,
  });
  logger.debug(`[SyncConflict] Resolved ${conflictId} with ${resolution}`);
}

/**
 * Apply a conflict resolution:
 * - keep_local: re-queue the local item for sync (force overwrite)
 * - keep_server: discard the local item
 * - skip: mark as resolved without action
 */
export async function applyResolution(
  conflict: ISyncConflict,
  resolution: TSyncConflictResolution
): Promise<void> {
  switch (resolution) {
    case 'keep_local': {
      // Reset the queue item to pending so it retries
      const item = await db.offline_legacy_sync_queue.get(conflict.queueItemId);
      if (item) {
        await db.offline_legacy_sync_queue.update(conflict.queueItemId, {
          status: 'pending',
          attempts: 0,
          lastError: null,
        });
      }
      break;
    }
    case 'keep_server':
    case 'skip': {
      // Remove the queue item since we're accepting server state
      await db.offline_legacy_sync_queue.delete(conflict.queueItemId);
      break;
    }
    case 'merge': {
      // Merge is complex - for now treat as keep_local
      const mergeItem = await db.offline_legacy_sync_queue.get(conflict.queueItemId);
      if (mergeItem) {
        await db.offline_legacy_sync_queue.update(conflict.queueItemId, {
          status: 'pending',
          attempts: 0,
          lastError: null,
        });
      }
      break;
    }
  }

  await resolveConflict(conflict.id, resolution);
}

/**
 * Dismiss (delete) a resolved conflict from the store.
 */
export async function dismissConflict(conflictId: string): Promise<void> {
  await db.offline_sync_conflicts.delete(conflictId);
}

export const syncConflictService = {
  detectConflict,
  storeConflict,
  getPendingConflicts,
  getPendingConflictCount,
  resolveConflict,
  applyResolution,
  dismissConflict,
};
