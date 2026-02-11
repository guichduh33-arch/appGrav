import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectConflict,
  storeConflict,
  getPendingConflicts,
  resolveConflict,
  applyResolution,
  dismissConflict,
} from '../syncConflictService';
import type { ILegacySyncQueueItem, ISyncConflict } from '@/types/offline';

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    offline_sync_conflicts: {
      add: vi.fn(),
      filter: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      })),
      update: vi.fn(),
      delete: vi.fn(),
    },
    offline_legacy_sync_queue: {
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { debug: vi.fn() },
}));

import { db } from '@/lib/db';

function makeQueueItem(type = 'order'): ILegacySyncQueueItem {
  return {
    id: 'item-123',
    type: type as ILegacySyncQueueItem['type'],
    entityId: 'entity-456',
    payload: { some: 'data' },
    status: 'pending',
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
  };
}

describe('syncConflictService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectConflict', () => {
    it('returns null for non-conflict errors', () => {
      const item = makeQueueItem();
      const result = detectConflict(item, new Error('Network timeout'));
      expect(result).toBeNull();
    });

    it('detects duplicate key conflict', () => {
      const item = makeQueueItem();
      const error = new Error('duplicate key value violates unique constraint');
      const result = detectConflict(item, error);

      expect(result).not.toBeNull();
      expect(result!.conflictType).toBe('duplicate');
      expect(result!.queueItemId).toBe('item-123');
      expect(result!.entityType).toBe('order');
    });

    it('detects FK violation conflict', () => {
      const item = makeQueueItem();
      const error = new Error('violates foreign key constraint');
      const result = detectConflict(item, error);

      expect(result).not.toBeNull();
      expect(result!.conflictType).toBe('fk_violation');
    });

    it('detects version mismatch conflict', () => {
      const item = makeQueueItem();
      const error = new Error('updated_at does not match');
      const result = detectConflict(item, error);

      expect(result).not.toBeNull();
      expect(result!.conflictType).toBe('version_mismatch');
    });

    it('detects deleted entity conflict', () => {
      const item = makeQueueItem();
      const error = new Error('entity does not exist');
      const result = detectConflict(item, error);

      expect(result).not.toBeNull();
      expect(result!.conflictType).toBe('deleted');
    });

    it('includes server data in conflict', () => {
      const item = makeQueueItem();
      const error = new Error('duplicate key');
      const serverData = { id: 'server-1', name: 'existing' };
      const result = detectConflict(item, error, serverData);

      expect(result!.serverData).toEqual(serverData);
    });
  });

  describe('storeConflict', () => {
    it('adds conflict to IndexedDB', async () => {
      const conflict: ISyncConflict = {
        id: 'conflict-1',
        queueItemId: 'item-1',
        entityType: 'order',
        entityId: 'entity-1',
        localData: {},
        serverData: {},
        conflictType: 'duplicate',
        detectedAt: new Date().toISOString(),
      };

      await storeConflict(conflict);
      expect(db.offline_sync_conflicts.add).toHaveBeenCalledWith(conflict);
    });
  });

  describe('getPendingConflicts', () => {
    it('returns unresolved conflicts', async () => {
      const result = await getPendingConflicts();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('resolveConflict', () => {
    it('updates conflict with resolution and timestamp', async () => {
      await resolveConflict('conflict-1', 'keep_local');
      expect(db.offline_sync_conflicts.update).toHaveBeenCalledWith(
        'conflict-1',
        expect.objectContaining({ resolution: 'keep_local' })
      );
    });
  });

  describe('applyResolution', () => {
    const conflict: ISyncConflict = {
      id: 'conflict-1',
      queueItemId: 'item-1',
      entityType: 'order',
      entityId: 'entity-1',
      localData: { name: 'local' },
      serverData: { name: 'server' },
      conflictType: 'version_mismatch',
      detectedAt: new Date().toISOString(),
    };

    it('keep_local resets queue item to pending', async () => {
      vi.mocked(db.offline_legacy_sync_queue.get).mockResolvedValue({
        id: 'item-1',
        type: 'order',
        payload: {},
        status: 'failed',
        createdAt: '',
        attempts: 3,
        lastError: 'conflict',
      });

      await applyResolution(conflict, 'keep_local');

      expect(db.offline_legacy_sync_queue.update).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ status: 'pending', attempts: 0 })
      );
    });

    it('keep_server deletes the queue item', async () => {
      await applyResolution(conflict, 'keep_server');
      expect(db.offline_legacy_sync_queue.delete).toHaveBeenCalledWith('item-1');
    });

    it('skip deletes the queue item', async () => {
      await applyResolution(conflict, 'skip');
      expect(db.offline_legacy_sync_queue.delete).toHaveBeenCalledWith('item-1');
    });
  });

  describe('dismissConflict', () => {
    it('deletes conflict from IndexedDB', async () => {
      await dismissConflict('conflict-1');
      expect(db.offline_sync_conflicts.delete).toHaveBeenCalledWith('conflict-1');
    });
  });
});
