import type { IPOCancelModalProps } from './types'

export function POCancelModal({
  isOpen,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
  isLoading,
}: IPOCancelModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop is-active" onClick={onClose}>
      <div className="modal is-active" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Confirm cancellation</h2>
        </div>
        <div className="modal__body">
          <p>Are you sure you want to cancel this order?</p>
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label>Reason (optional)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Enter reason for cancellation..."
            />
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            Cancel order
          </button>
        </div>
      </div>
    </div>
  )
}
