import {
  Plus,
  Send,
  CheckCircle,
  Package,
  XCircle,
  CreditCard,
  Undo2,
  Edit2,
  FileText,
} from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import type { IPOHistoryTimelineProps } from './types'

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  confirmed: 'Confirmed',
  received: 'Received',
  cancelled: 'Cancelled',
}

const returnReasonLabels: Record<string, string> = {
  damaged: 'Damaged',
  wrong_item: 'Wrong item',
  quality_issue: 'Quality issue',
  excess_quantity: 'Excess quantity',
  other: 'Other',
}

const actionLabels: Record<string, string> = {
  created: 'Order created',
  sent: 'Sent to supplier',
  confirmed: 'Order confirmed',
  received: 'Order received',
  partially_received: 'Partially received',
  cancelled: 'Order cancelled',
  payment_made: 'Payment made',
  item_returned: 'Item returned',
  modified: 'Order modified',
}

export function POHistoryTimeline({ history }: IPOHistoryTimelineProps) {
  const getStatusLabel = (status: string) => statusLabels[status] || status

  const getReturnReasonLabel = (reason: string): string => {
    return returnReasonLabels[reason] || reason
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return <Plus size={16} />
      case 'sent':
        return <Send size={16} />
      case 'confirmed':
        return <CheckCircle size={16} />
      case 'received':
      case 'partially_received':
        return <Package size={16} />
      case 'cancelled':
        return <XCircle size={16} />
      case 'payment_made':
        return <CreditCard size={16} />
      case 'item_returned':
        return <Undo2 size={16} />
      case 'modified':
        return <Edit2 size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const getActionColor = (actionType: string): string => {
    switch (actionType) {
      case 'created':
      case 'sent':
      case 'modified':
        return 'history-icon--info'
      case 'confirmed':
      case 'partially_received':
        return 'history-icon--warning'
      case 'received':
      case 'payment_made':
        return 'history-icon--success'
      case 'cancelled':
      case 'item_returned':
        return 'history-icon--danger'
      default:
        return ''
    }
  }

  const getActionLabel = (actionType: string): string => {
    return actionLabels[actionType] || actionType
  }

  return (
    <div className="po-detail-card">
      <h2>History</h2>
      <div className="po-history-timeline">
        {history.map((entry) => (
          <div key={entry.id} className="po-history-item">
            <div className={`po-history-item__icon ${getActionColor(entry.action_type)}`}>
              {getActionIcon(entry.action_type)}
            </div>
            <div className="po-history-item__content">
              <div className="po-history-item__header">
                <span className="po-history-item__action">{getActionLabel(entry.action_type)}</span>
                {entry.previous_status && entry.new_status && (
                  <div className="po-history-item__status-change">
                    <span className={`status-badge status-badge--${entry.previous_status}`}>
                      {getStatusLabel(entry.previous_status)}
                    </span>
                    <span className="po-history-arrow">→</span>
                    <span className={`status-badge status-badge--${entry.new_status}`}>
                      {getStatusLabel(entry.new_status)}
                    </span>
                  </div>
                )}
              </div>

              {entry.metadata && (
                <div className="po-history-item__details">
                  {entry.metadata.items_added && entry.metadata.items_added.length > 0 && (
                    <div className="po-history-detail">
                      <span className="po-history-detail__label">
                        Items added:
                      </span>
                      <ul className="po-history-detail__list">
                        {entry.metadata.items_added.map((item, i) => (
                          <li key={i}>
                            {item.quantity}x {item.name} @ {formatCurrency(item.unit_price)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.metadata.items_removed && entry.metadata.items_removed.length > 0 && (
                    <div className="po-history-detail">
                      <span className="po-history-detail__label">
                        Items removed:
                      </span>
                      <ul className="po-history-detail__list">
                        {entry.metadata.items_removed.map((item, i) => (
                          <li key={i}>
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.metadata.items_modified && entry.metadata.items_modified.length > 0 && (
                    <div className="po-history-detail">
                      <span className="po-history-detail__label">
                        Modifications:
                      </span>
                      <ul className="po-history-detail__list">
                        {entry.metadata.items_modified.map((item, i) => (
                          <li key={i}>
                            {item.name}: {item.field} {item.old_value} → {item.new_value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {entry.metadata.quantity_received && entry.metadata.product_name && (
                    <div className="po-history-detail">
                      <span className="po-history-detail__label">
                        Reception:
                      </span>
                      <span>
                        {entry.metadata.quantity_received} {entry.metadata.product_name}
                      </span>
                    </div>
                  )}

                  {entry.metadata.return_quantity && entry.metadata.product_name && (
                    <div className="po-history-detail">
                      <span className="po-history-detail__label">
                        Return:
                      </span>
                      <span>
                        {entry.metadata.return_quantity} {entry.metadata.product_name}
                        {entry.metadata.return_reason && (
                          <span className="po-history-detail__reason">
                            ({getReturnReasonLabel(entry.metadata.return_reason)})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {entry.metadata.payment_amount && (
                    <div className="po-history-detail">
                      <span className="po-history-detail__label">
                        Amount:
                      </span>
                      <span>{formatCurrency(entry.metadata.payment_amount)}</span>
                      {entry.metadata.payment_method && (
                        <span className="po-history-detail__method">
                          ({entry.metadata.payment_method})
                        </span>
                      )}
                    </div>
                  )}

                  {entry.metadata.old_total !== undefined &&
                    entry.metadata.new_total !== undefined && (
                      <div className="po-history-detail">
                        <span className="po-history-detail__label">
                          Total change:
                        </span>
                        <span>
                          {formatCurrency(entry.metadata.old_total)} →{' '}
                          {formatCurrency(entry.metadata.new_total)}
                        </span>
                      </div>
                    )}
                </div>
              )}

              <div className="po-history-item__footer">
                <span className="po-history-item__date">
                  {new Date(entry.created_at).toLocaleString('fr-FR')}
                </span>
                {entry.changed_by_name && (
                  <span className="po-history-item__user">by {entry.changed_by_name}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
