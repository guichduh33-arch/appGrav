/**
 * Deferred Notes Panel Component
 *
 * Displays a list of pending deferred adjustment notes.
 * Allows user to mark notes as processed or create adjustments.
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 * @see AC4: Liste des Notes d'Ajustement Différées
 */
import { useState } from 'react';
import { X, CheckCircle, StickyNote, Trash2, Package } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { deleteDeferredNote } from '@/services/inventory/deferredAdjustmentService';
import { useNetworkStatus } from '@/hooks/offline/useNetworkStatus';
import type { IDeferredAdjustmentNote } from '@/types/offline';

interface DeferredNotesPanelProps {
  onClose: () => void;
  /** Callback when user wants to create adjustment from a note */
  onCreateAdjustment?: (note: IDeferredAdjustmentNote) => void;
}

export default function DeferredNotesPanel({
  onClose,
  onCreateAdjustment,
}: DeferredNotesPanelProps) {
  const { isOnline } = useNetworkStatus();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Live query to get all deferred notes (sorted newest first)
  const notes = useLiveQuery(
    () => db.offline_adjustment_notes.orderBy('created_at').reverse().toArray(),
    [],
    []
  );

  const handleMarkAsProcessed = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDeferredNote(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateAdjustment = (note: IDeferredAdjustmentNote) => {
    onCreateAdjustment?.(note);
    onClose();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="modal-backdrop is-active"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-lg is-active">
        <div className="modal__header">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-500" />
            <h3 className="modal__title">
              Pending Notes
            </h3>
            <span className="badge badge-amber">{notes.length}</span>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal__body">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending notes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-muted/50 rounded-lg p-4 border border-muted"
                >
                  {/* Header with product and date */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.product_name ? (
                        <>
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{note.product_name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">
                          General adjustment
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.created_at)}
                    </span>
                  </div>

                  {/* Note content */}
                  <p className="text-sm mb-3 whitespace-pre-wrap">{note.note}</p>

                  {/* Suggested adjustment info */}
                  {(note.adjustment_type || note.suggested_quantity) && (
                    <div className="text-xs text-muted-foreground mb-3">
                      {note.adjustment_type && (
                        <span className="mr-3">
                          Type: {note.adjustment_type}
                        </span>
                      )}
                      {note.suggested_quantity && (
                        <span>Qty: {note.suggested_quantity}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <button
                      className="btn btn-sm btn-ghost text-red-500"
                      onClick={() => note.id !== undefined && handleMarkAsProcessed(note.id)}
                      disabled={deletingId === note.id || note.id === undefined}
                      title="Delete"
                    >
                      {deletingId === note.id ? (
                        <span className="animate-spin">...</span>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </button>

                    {isOnline && note.product_id && onCreateAdjustment && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleCreateAdjustment(note)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Create adjustment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
