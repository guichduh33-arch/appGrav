import type { IPOReturnModalProps } from './types'

export function POReturnModal({
  isOpen,
  item,
  formState,
  onFormChange,
  onSubmit,
  onClose,
}: IPOReturnModalProps) {
  if (!isOpen || !item) {
    return null
  }

  const maxReturnQuantity =
    parseFloat(item.quantity_received.toString()) - parseFloat(item.quantity_returned.toString())

  return (
    <div className="modal-backdrop is-active" onClick={onClose}>
      <div className="modal is-active" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Item return</h2>
          <p className="modal__subtitle">{item.product_name}</p>
        </div>
        <div className="modal__body">
          <div className="form-group">
            <label>Quantity to return *</label>
            <input
              type="number"
              min="0"
              max={maxReturnQuantity}
              step="0.01"
              value={formState.quantity}
              onChange={(e) =>
                onFormChange({ ...formState, quantity: parseFloat(e.target.value) || 0 })
              }
            />
            <small>
              Max: {maxReturnQuantity.toFixed(2)}
            </small>
          </div>

          <div className="form-group">
            <label>Reason *</label>
            <select
              value={formState.reason}
              onChange={(e) => onFormChange({ ...formState, reason: e.target.value })}
            >
              <option value="damaged">Damaged</option>
              <option value="wrong_item">Wrong item</option>
              <option value="quality_issue">Quality issue</option>
              <option value="excess_quantity">Excess quantity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Details</label>
            <textarea
              rows={3}
              value={formState.reason_details}
              onChange={(e) => onFormChange({ ...formState, reason_details: e.target.value })}
              placeholder="Enter additional details..."
            />
          </div>

          <div className="form-group">
            <label>Refund amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.refund_amount}
              onChange={(e) =>
                onFormChange({ ...formState, refund_amount: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
