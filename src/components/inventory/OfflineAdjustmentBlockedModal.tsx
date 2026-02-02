/**
 * Offline Adjustment Blocked Modal
 *
 * Displayed when user tries to make a stock adjustment while offline.
 * Explains that adjustments require online connection and allows
 * user to save a note for later processing.
 *
 * @see Story 5.3: Stock Adjustment (Online-Only)
 * @see AC2: Blocage Ajustement Offline avec Message Explicatif
 * @see AC3: Note d'Ajustement pour Plus Tard
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, WifiOff, StickyNote } from 'lucide-react';
import { addDeferredNote } from '@/services/inventory/deferredAdjustmentService';
import './StockAdjustmentModal.css';

interface OfflineAdjustmentBlockedModalProps {
  /** Product context - optional if user is making general adjustment */
  product?: {
    id: string;
    name: string;
  };
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback after note is saved successfully */
  onNoteSaved?: () => void;
}

export default function OfflineAdjustmentBlockedModal({
  product,
  onClose,
  onNoteSaved,
}: OfflineAdjustmentBlockedModalProps) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveNote = async () => {
    if (!note.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await addDeferredNote({
        product_id: product?.id,
        product_name: product?.name,
        note: note.trim(),
      });
      onNoteSaved?.();
      onClose();
    } catch (error) {
      console.error('Failed to save deferred note:', error);
      // Show error to user and keep modal open so they can retry or copy their note
      setSaveError(
        t('inventory.adjustment.offline.saveError', 'Erreur lors de la sauvegarde. Veuillez réessayer.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop is-active"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-md is-active">
        <div className="modal__header">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-amber-500" />
            <h3 className="modal__title">
              {t('inventory.adjustment.offline.title', 'Mode Hors-Ligne')}
            </h3>
          </div>
          <button
            className="modal__close"
            onClick={onClose}
            title={t('common.close', 'Fermer')}
            aria-label={t('common.close', 'Fermer')}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal__body">
          {/* Explanation message */}
          <p className="text-muted-foreground mb-4">
            {t(
              'inventory.adjustment.offline.message',
              'Les ajustements de stock nécessitent une connexion internet pour garantir la traçabilité.'
            )}
          </p>

          {/* Product context */}
          {product && (
            <div className="bg-muted/50 rounded-md p-3 mb-4">
              <p className="text-sm font-medium">
                {t('inventory.adjustment.offline.product', 'Produit')}: {product.name}
              </p>
            </div>
          )}

          {/* Note for later */}
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <StickyNote size={16} />
              {t('inventory.adjustment.offline.noteLabel', 'Noter pour plus tard (optionnel)')}
            </label>
            <textarea
              className="form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t(
                'inventory.adjustment.offline.notePlaceholder',
                'Ex: Ajuster +5 pcs (erreur de comptage)...'
              )}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'inventory.adjustment.offline.noteHint',
                'Cette note sera sauvegardée localement. Vous pourrez la traiter quand vous serez de nouveau en ligne.'
              )}
            </p>
          </div>

          {/* Error message */}
          {saveError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mt-4">
              {saveError}
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn-ghost" onClick={onClose}>
            {t('common.close', 'Fermer')}
          </button>
          {note.trim() && (
            <button
              className="btn btn-primary"
              onClick={handleSaveNote}
              disabled={isSaving}
            >
              {isSaving
                ? t('common.saving', 'Enregistrement...')
                : t('inventory.adjustment.offline.saveNote', 'Enregistrer la note')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
