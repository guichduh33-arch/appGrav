import { ArrowLeft, Edit2, Send, CheckCircle, XCircle, WifiOff } from 'lucide-react'
import type { IPODetailHeaderProps } from './types'

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  confirmed: 'Confirmed',
  received: 'Received',
  cancelled: 'Cancelled',
}

export function PODetailHeader({
  purchaseOrder,
  validActions,
  isOnline,
  onBack,
  onEdit,
  onSendToSupplier,
  onConfirmOrder,
  onCancelOrder,
  isSending,
  isConfirming,
}: IPODetailHeaderProps) {
  const getStatusLabel = (status: string) => statusLabels[status] || status

  return (
    <>
      {!isOnline && (
        <div className="po-offline-banner">
          <WifiOff size={20} />
          <span>You are offline. Some actions may be unavailable.</span>
        </div>
      )}

      <div className="po-detail-page__header">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="po-detail-page__title-section">
          <h1 className="po-detail-page__title">{purchaseOrder.po_number}</h1>
          <span className={`status-badge status-badge--${purchaseOrder.status}`}>
            {getStatusLabel(purchaseOrder.status)}
          </span>
        </div>

        <div className="po-detail-page__actions">
          {validActions.includes('send') && (
            <button
              className="btn btn-primary"
              onClick={onSendToSupplier}
              disabled={!isOnline || isSending}
            >
              <Send size={18} />
              Send to supplier
            </button>
          )}

          {validActions.includes('confirm') && (
            <button
              className="btn btn-success"
              onClick={onConfirmOrder}
              disabled={!isOnline || isConfirming}
            >
              <CheckCircle size={18} />
              Confirm order
            </button>
          )}

          {validActions.includes('cancel') && (
            <button className="btn btn-danger" onClick={onCancelOrder} disabled={!isOnline}>
              <XCircle size={18} />
              Cancel order
            </button>
          )}

          <button className="btn btn-secondary" onClick={onEdit} disabled={!isOnline}>
            <Edit2 size={20} />
            Edit
          </button>
        </div>
      </div>
    </>
  )
}
