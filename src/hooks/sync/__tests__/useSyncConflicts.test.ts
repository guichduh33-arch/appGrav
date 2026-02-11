import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncConflicts } from '../useSyncConflicts';
import type { ISyncConflict } from '@/types/offline';

const mockConflicts: ISyncConflict[] = [
  {
    id: 'c1',
    queueItemId: 'q1',
    entityType: 'order',
    entityId: 'e1',
    localData: { name: 'local' },
    serverData: { name: 'server' },
    conflictType: 'version_mismatch',
    detectedAt: '2026-01-01T00:00:00Z',
  },
];

// Mock dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn((_fn, _deps, defaultVal) => defaultVal),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    offline_sync_conflicts: {
      filter: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue(mockConflicts),
        count: vi.fn().mockResolvedValue(0),
      })),
    },
  },
}));

// Mock syncConflictService
vi.mock('@/services/sync/syncConflictService', () => ({
  applyResolution: vi.fn(),
  dismissConflict: vi.fn(),
}));

// Mock syncStore
vi.mock('@/stores/syncStore', () => ({
  useSyncStore: {
    getState: () => ({ setConflictCount: vi.fn() }),
  },
}));

import { useLiveQuery } from 'dexie-react-hooks';
import { applyResolution, dismissConflict } from '@/services/sync/syncConflictService';

describe('useSyncConflicts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no conflicts', () => {
    const { result } = renderHook(() => useSyncConflicts());
    expect(result.current.conflicts).toEqual([]);
    expect(result.current.pendingCount).toBe(0);
  });

  it('returns conflicts from live query', () => {
    vi.mocked(useLiveQuery).mockReturnValue(mockConflicts);

    const { result } = renderHook(() => useSyncConflicts());
    expect(result.current.conflicts).toHaveLength(1);
    expect(result.current.pendingCount).toBe(1);
  });

  it('resolveConflict calls applyResolution', async () => {
    vi.mocked(useLiveQuery).mockReturnValue(mockConflicts);

    const { result } = renderHook(() => useSyncConflicts());

    await act(async () => {
      await result.current.resolveConflict(mockConflicts[0], 'keep_local');
    });

    expect(applyResolution).toHaveBeenCalledWith(mockConflicts[0], 'keep_local');
  });

  it('dismissConflict calls service dismissConflict', async () => {
    const { result } = renderHook(() => useSyncConflicts());

    await act(async () => {
      await result.current.dismissConflict('c1');
    });

    expect(dismissConflict).toHaveBeenCalledWith('c1');
  });
});
