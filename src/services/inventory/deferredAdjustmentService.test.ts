/**
 * Tests for Deferred Adjustment Service
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import {
  addDeferredNote,
  getDeferredNotes,
  getDeferredNotesCount,
  deleteDeferredNote,
  clearAllDeferredNotes,
} from './deferredAdjustmentService';

describe('deferredAdjustmentService', () => {
  beforeEach(async () => {
    // Clear the table before each test
    await db.offline_adjustment_notes.clear();
  });

  afterEach(async () => {
    // Clean up after tests
    await db.offline_adjustment_notes.clear();
  });

  describe('addDeferredNote', () => {
    it('should add a note with minimal data', async () => {
      const note = await addDeferredNote({
        note: 'Need to adjust flour stock',
      });

      expect(note.id).toBeDefined();
      expect(note.note).toBe('Need to adjust flour stock');
      expect(note.created_at).toBeDefined();
    });

    it('should add a note with full product context', async () => {
      const note = await addDeferredNote({
        product_id: 'product-123',
        product_name: 'Flour - All Purpose',
        note: 'Add +5 kg - counting error during inventory',
        adjustment_type: 'adjustment_in',
        suggested_quantity: 5,
        created_by: 'user-456',
      });

      expect(note.id).toBeDefined();
      expect(note.product_id).toBe('product-123');
      expect(note.product_name).toBe('Flour - All Purpose');
      expect(note.note).toBe('Add +5 kg - counting error during inventory');
      expect(note.adjustment_type).toBe('adjustment_in');
      expect(note.suggested_quantity).toBe(5);
      expect(note.created_by).toBe('user-456');
    });

    it('should persist note to IndexedDB', async () => {
      await addDeferredNote({
        note: 'Test note',
      });

      const count = await db.offline_adjustment_notes.count();
      expect(count).toBe(1);
    });

    it('should auto-generate created_at timestamp', async () => {
      const before = new Date().toISOString();
      const note = await addDeferredNote({ note: 'Test' });
      const after = new Date().toISOString();

      expect(note.created_at >= before).toBe(true);
      expect(note.created_at <= after).toBe(true);
    });
  });

  describe('getDeferredNotes', () => {
    it('should return empty array when no notes exist', async () => {
      const notes = await getDeferredNotes();
      expect(notes).toEqual([]);
    });

    it('should return all notes', async () => {
      await addDeferredNote({ note: 'Note 1' });
      await addDeferredNote({ note: 'Note 2' });
      await addDeferredNote({ note: 'Note 3' });

      const notes = await getDeferredNotes();
      expect(notes).toHaveLength(3);
    });

    it('should return notes sorted by created_at descending (newest first)', async () => {
      // Add notes with explicit timestamps to control order
      // We'll add them directly to the db to control created_at values
      await db.offline_adjustment_notes.add({
        note: 'First note',
        created_at: '2024-01-01T10:00:00Z',
      });

      await db.offline_adjustment_notes.add({
        note: 'Second note',
        created_at: '2024-01-01T10:01:00Z',
      });

      await db.offline_adjustment_notes.add({
        note: 'Third note',
        created_at: '2024-01-01T10:02:00Z',
      });

      const notes = await getDeferredNotes();

      expect(notes[0].note).toBe('Third note');
      expect(notes[1].note).toBe('Second note');
      expect(notes[2].note).toBe('First note');
    });
  });

  describe('getDeferredNotesCount', () => {
    it('should return 0 when no notes exist', async () => {
      const count = await getDeferredNotesCount();
      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      await addDeferredNote({ note: 'Note 1' });
      await addDeferredNote({ note: 'Note 2' });

      const count = await getDeferredNotesCount();
      expect(count).toBe(2);
    });
  });

  describe('deleteDeferredNote', () => {
    it('should delete an existing note', async () => {
      const note = await addDeferredNote({ note: 'To be deleted' });

      const deleted = await deleteDeferredNote(note.id!);

      expect(deleted).toBe(true);
      const count = await getDeferredNotesCount();
      expect(count).toBe(0);
    });

    it('should return false for non-existent ID', async () => {
      // Now we check existence before deleting
      const deleted = await deleteDeferredNote(999999);
      expect(deleted).toBe(false);
    });

    it('should only delete the specified note', async () => {
      const note1 = await addDeferredNote({ note: 'Keep this' });
      const note2 = await addDeferredNote({ note: 'Delete this' });
      const note3 = await addDeferredNote({ note: 'Keep this too' });

      await deleteDeferredNote(note2.id!);

      const notes = await getDeferredNotes();
      expect(notes).toHaveLength(2);
      expect(notes.find(n => n.id === note1.id)).toBeDefined();
      expect(notes.find(n => n.id === note2.id)).toBeUndefined();
      expect(notes.find(n => n.id === note3.id)).toBeDefined();
    });
  });

  describe('clearAllDeferredNotes', () => {
    it('should clear all notes and return count', async () => {
      await addDeferredNote({ note: 'Note 1' });
      await addDeferredNote({ note: 'Note 2' });
      await addDeferredNote({ note: 'Note 3' });

      const clearedCount = await clearAllDeferredNotes();

      expect(clearedCount).toBe(3);
      const remaining = await getDeferredNotesCount();
      expect(remaining).toBe(0);
    });

    it('should return 0 when no notes exist', async () => {
      const clearedCount = await clearAllDeferredNotes();
      expect(clearedCount).toBe(0);
    });
  });
});
