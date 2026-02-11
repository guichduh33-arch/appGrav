/**
 * useSyncConflicts Hook
 * Sprint 3 - Offline Improvements
 *
 * Provides reactive access to sync conflicts stored in IndexedDB.
 * Uses Dexie's useLiveQuery for automatic re-renders on data change.
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { ISyncConflict, TSyncConflictResolution } from '@/types/offline';
import { applyResolution, dismissConflict } from '@/services/sync/syncConflictService';
import { useSyncStore } from '@/stores/syncStore';
import { useCallback } from 'react';

export function useSyncConflicts() {
  const conflicts = useLiveQuery(
    () => db.offline_sync_conflicts.filter((c) => !c.resolvedAt).toArray(),
    [],
    [] as ISyncConflict[]
  );

  const pendingCount = conflicts.length;

  const resolve = useCallback(
    async (conflict: ISyncConflict, resolution: TSyncConflictResolution) => {
      await applyResolution(conflict, resolution);
      // Update store count
      const remaining = await db.offline_sync_conflicts.filter((c) => !c.resolvedAt).count();
      useSyncStore.getState().setConflictCount(remaining);
    },
    []
  );

  const dismiss = useCallback(
    async (conflictId: string) => {
      await dismissConflict(conflictId);
      const remaining = await db.offline_sync_conflicts.filter((c) => !c.resolvedAt).count();
      useSyncStore.getState().setConflictCount(remaining);
    },
    []
  );

  return {
    conflicts,
    pendingCount,
    resolveConflict: resolve,
    dismissConflict: dismiss,
  };
}
