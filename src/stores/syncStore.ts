/**
 * Sync Store
 * Story 2.5 - Sync Queue Management
 *
 * Zustand store for managing sync state across the application.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TSyncStatus = 'idle' | 'syncing' | 'error' | 'complete';

interface ISyncState {
  /** Current sync status */
  syncStatus: TSyncStatus;
  /** Last successful sync timestamp */
  lastSyncAt: Date | null;
  /** Number of pending items in queue */
  pendingCount: number;
  /** Number of failed items */
  failedCount: number;
  /** Last error message */
  lastError: string | null;
  /** Is sync currently running */
  isSyncing: boolean;

  // Actions
  setSyncStatus: (status: TSyncStatus) => void;
  setLastSyncAt: (date: Date | null) => void;
  setPendingCount: (count: number) => void;
  setFailedCount: (count: number) => void;
  setLastError: (error: string | null) => void;
  setIsSyncing: (syncing: boolean) => void;
  startSync: () => void;
  completeSync: (synced: number, failed: number) => void;
  failSync: (error: string) => void;
  reset: () => void;
}

export const useSyncStore = create<ISyncState>()(
  persist(
    (set) => ({
      syncStatus: 'idle',
      lastSyncAt: null,
      pendingCount: 0,
      failedCount: 0,
      lastError: null,
      isSyncing: false,

      setSyncStatus: (status) => set({ syncStatus: status }),

      setLastSyncAt: (date) => set({ lastSyncAt: date }),

      setPendingCount: (count) => set({ pendingCount: count }),

      setFailedCount: (count) => set({ failedCount: count }),

      setLastError: (error) => set({ lastError: error }),

      setIsSyncing: (syncing) => set({ isSyncing: syncing }),

      startSync: () =>
        set({
          syncStatus: 'syncing',
          isSyncing: true,
          lastError: null,
        }),

      completeSync: (_synced, failed) =>
        set({
          syncStatus: failed > 0 ? 'error' : 'complete',
          isSyncing: false,
          lastSyncAt: new Date(),
          failedCount: failed,
          lastError: failed > 0 ? `${failed} items failed to sync` : null,
        }),

      failSync: (error) =>
        set({
          syncStatus: 'error',
          isSyncing: false,
          lastError: error,
        }),

      reset: () =>
        set({
          syncStatus: 'idle',
          lastSyncAt: null,
          pendingCount: 0,
          failedCount: 0,
          lastError: null,
          isSyncing: false,
        }),
    }),
    {
      name: 'breakery-sync',
      partialize: (state) => ({
        lastSyncAt: state.lastSyncAt,
        pendingCount: state.pendingCount,
        failedCount: state.failedCount,
      }),
    }
  )
);
