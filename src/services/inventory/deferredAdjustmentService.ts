/**
 * Deferred Adjustment Service
 *
 * Service for managing deferred adjustment notes when offline.
 * Notes are stored in IndexedDB and can be processed when online.
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 * @see ADR-001: Stock adjustments require online for traceability
 */

import { db } from '@/lib/db';
import type { IDeferredAdjustmentNote, TStockAdjustmentType } from '@/types/offline';

/**
 * Input for creating a deferred adjustment note
 */
export interface ICreateDeferredNoteInput {
  product_id?: string;
  product_name?: string;
  note: string;
  adjustment_type?: TStockAdjustmentType;
  suggested_quantity?: number;
  created_by?: string;
}

/**
 * Add a new deferred adjustment note
 *
 * @param input - Note data to persist
 * @returns The created note with auto-generated id
 *
 * @example
 * ```typescript
 * const note = await addDeferredNote({
 *   product_id: 'abc-123',
 *   product_name: 'Flour',
 *   note: 'Need to add +5 kg (counting error)',
 *   adjustment_type: 'adjustment_in',
 *   suggested_quantity: 5
 * });
 * ```
 */
export async function addDeferredNote(
  input: ICreateDeferredNoteInput
): Promise<IDeferredAdjustmentNote> {
  const note: IDeferredAdjustmentNote = {
    ...input,
    created_at: new Date().toISOString(),
  };

  const id = await db.offline_adjustment_notes.add(note);

  return {
    ...note,
    id: id as number,
  };
}

/**
 * Get all deferred adjustment notes
 * Sorted by creation date (newest first)
 *
 * @returns Array of all pending notes
 *
 * @example
 * ```typescript
 * const notes = await getDeferredNotes();
 * console.log(`${notes.length} notes pending`);
 * ```
 */
export async function getDeferredNotes(): Promise<IDeferredAdjustmentNote[]> {
  const notes = await db.offline_adjustment_notes
    .orderBy('created_at')
    .reverse()
    .toArray();

  return notes;
}

/**
 * Get count of pending deferred adjustment notes
 *
 * @returns Number of pending notes
 *
 * @example
 * ```typescript
 * const count = await getDeferredNotesCount();
 * if (count > 0) {
 *   // Show badge
 * }
 * ```
 */
export async function getDeferredNotesCount(): Promise<number> {
  return db.offline_adjustment_notes.count();
}

/**
 * Delete a deferred adjustment note by ID
 * Used when note has been processed or user wants to discard it
 *
 * @param id - The note ID to delete
 * @returns true if deleted, false if not found
 *
 * @example
 * ```typescript
 * const deleted = await deleteDeferredNote(123);
 * if (deleted) {
 *   toast.success('Note marked as processed');
 * }
 * ```
 */
export async function deleteDeferredNote(id: number): Promise<boolean> {
  // Check if the item exists before deleting
  const existing = await db.offline_adjustment_notes.get(id);
  if (!existing) {
    return false;
  }

  await db.offline_adjustment_notes.delete(id);
  return true;
}

/**
 * Clear all deferred adjustment notes
 * Useful for bulk cleanup or testing
 *
 * @returns Number of notes cleared
 */
export async function clearAllDeferredNotes(): Promise<number> {
  const count = await db.offline_adjustment_notes.count();
  await db.offline_adjustment_notes.clear();
  return count;
}
