/**
 * Deferred Notes Badge Component
 *
 * Displays a badge with the count of pending deferred adjustment notes.
 * Clicking opens the DeferredNotesPanel.
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 * @see AC4: Liste des Notes d'Ajustement Différées
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StickyNote } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import DeferredNotesPanel from './DeferredNotesPanel';

interface DeferredNotesBadgeProps {
  className?: string;
}

export default function DeferredNotesBadge({ className = '' }: DeferredNotesBadgeProps) {
  const { t } = useTranslation();
  const [showPanel, setShowPanel] = useState(false);

  // Live query to get count of deferred notes
  const notesCount = useLiveQuery(
    () => db.offline_adjustment_notes.count(),
    [],
    0
  );

  // Don't render if no notes
  if (notesCount === 0) {
    return null;
  }

  return (
    <>
      <button
        className={`btn btn-ghost btn-sm flex items-center gap-2 ${className}`}
        onClick={() => setShowPanel(true)}
        title={t('inventory.adjustment.offline.deferredNotesCount', {
          count: notesCount,
          defaultValue: '{{count}} note(s) d\'ajustement en attente',
        })}
      >
        <div className="relative">
          <StickyNote className="h-5 w-5 text-amber-500" />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {notesCount > 9 ? '9+' : notesCount}
          </span>
        </div>
        <span className="hidden sm:inline text-sm">
          {t('inventory.adjustment.offline.deferredNotes', 'Notes en attente')}
        </span>
      </button>

      {showPanel && (
        <DeferredNotesPanel onClose={() => setShowPanel(false)} />
      )}
    </>
  );
}
