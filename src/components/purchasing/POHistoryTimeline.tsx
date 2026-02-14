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

const statusBadgeClass: Record<string, string> = {
  draft: 'border-[var(--muted-smoke)]/40 text-[var(--muted-smoke)]',
  sent: 'border-blue-400/40 text-blue-400',
  confirmed: 'border-[var(--color-gold)]/40 text-[var(--color-gold)]',
  partially_received: 'border-orange-400/40 text-orange-400',
  received: 'border-emerald-400/40 text-emerald-400',
  cancelled: 'border-red-400/40 text-red-400',
}

export function POHistoryTimeline({ history }: IPOHistoryTimelineProps) {
  const getStatusLabel = (status: string) => statusLabels[status] || status
  const getBadgeClass = (status: string) => statusBadgeClass[status] || statusBadgeClass.draft

  const getReturnReasonLabel = (reason: string): string => {
    return returnReasonLabels[reason] || reason
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return <Plus size={14} />
      case 'sent':
        return <Send size={14} />
      case 'confirmed':
        return <CheckCircle size={14} />
      case 'received':
      case 'partially_received':
        return <Package size={14} />
      case 'cancelled':
        return <XCircle size={14} />
      case 'payment_made':
        return <CreditCard size={14} />
      case 'item_returned':
        return <Undo2 size={14} />
      case 'modified':
        return <Edit2 size={14} />
      default:
        return <FileText size={14} />
    }
  }

  const getActionColor = (actionType: string): string => {
    switch (actionType) {
      case 'created':
      case 'sent':
      case 'modified':
        return 'border-blue-400 text-blue-400 bg-blue-500/10'
      case 'confirmed':
      case 'partially_received':
        return 'border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10'
      case 'received':
      case 'payment_made':
        return 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
      case 'cancelled':
      case 'item_returned':
        return 'border-red-400 text-red-400 bg-red-500/10'
      default:
        return 'border-white/20 text-[var(--muted-smoke)] bg-white/5'
    }
  }

  const getActionLabel = (actionType: string): string => {
    return actionLabels[actionType] || actionType
  }

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-6 pb-4 border-b border-white/5">
        History
      </h2>
      <div className="relative pl-10">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-5 bottom-5 w-0.5 bg-white/10"></div>

        <div className="flex flex-col">
          {history.map((entry) => (
            <div key={entry.id} className="relative pb-6 last:pb-0">
              <div className={`absolute -left-10 flex items-center justify-center w-8 h-8 rounded-full border-2 z-10 ${getActionColor(entry.action_type)}`}>
                {getActionIcon(entry.action_type)}
              </div>
              <div className="p-4 bg-black/20 rounded-lg">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{getActionLabel(entry.action_type)}</span>
                  {entry.previous_status && entry.new_status && (
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest rounded-full border ${getBadgeClass(entry.previous_status)}`}>
                        {getStatusLabel(entry.previous_status)}
                      </span>
                      <span className="text-[var(--muted-smoke)] text-xs">-&gt;</span>
                      <span className={`px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest rounded-full border ${getBadgeClass(entry.new_status)}`}>
                        {getStatusLabel(entry.new_status)}
                      </span>
                    </div>
                  )}
                </div>

                {entry.metadata && (
                  <div className="mt-2 p-3 bg-[var(--onyx-surface)] rounded-lg border border-white/5 text-xs text-[var(--stone-text)] space-y-1.5">
                    {entry.metadata.items_added && entry.metadata.items_added.length > 0 && (
                      <div>
                        <span className="font-semibold text-[var(--muted-smoke)]">Items added: </span>
                        <ul className="mt-1 ml-4 list-disc">
                          {entry.metadata.items_added.map((item, i) => (
                            <li key={i}>{item.quantity}x {item.name} @ {formatCurrency(item.unit_price)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.metadata.items_removed && entry.metadata.items_removed.length > 0 && (
                      <div>
                        <span className="font-semibold text-[var(--muted-smoke)]">Items removed: </span>
                        <ul className="mt-1 ml-4 list-disc">
                          {entry.metadata.items_removed.map((item, i) => (
                            <li key={i}>{item.quantity}x {item.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.metadata.items_modified && entry.metadata.items_modified.length > 0 && (
                      <div>
                        <span className="font-semibold text-[var(--muted-smoke)]">Modifications: </span>
                        <ul className="mt-1 ml-4 list-disc">
                          {entry.metadata.items_modified.map((item, i) => (
                            <li key={i}>{item.name}: {item.field} {item.old_value} -&gt; {item.new_value}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.metadata.quantity_received && entry.metadata.product_name && (
                      <div>
                        <span className="font-semibold text-[var(--muted-smoke)]">Reception: </span>
                        <span>{entry.metadata.quantity_received} {entry.metadata.product_name}</span>
                      </div>
                    )}

                    {entry.metadata.return_quantity && entry.metadata.product_name && (
                      <div>
                        <span className="font-semibold text-[var(--muted-smoke)]">Return: </span>
                        <span>
                          {entry.metadata.return_quantity} {entry.metadata.product_name}
                          {entry.metadata.return_reason && (
                            <span className="italic text-[var(--muted-smoke)]">
                              {' '}({getReturnReasonLabel(entry.metadata.return_reason)})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {entry.metadata.payment_amount && (
                      <div>
                        <span className="font-semibold text-[var(--muted-smoke)]">Amount: </span>
                        <span>{formatCurrency(entry.metadata.payment_amount)}</span>
                        {entry.metadata.payment_method && (
                          <span className="italic text-[var(--muted-smoke)]"> ({entry.metadata.payment_method})</span>
                        )}
                      </div>
                    )}

                    {entry.metadata.old_total !== undefined &&
                      entry.metadata.new_total !== undefined && (
                        <div>
                          <span className="font-semibold text-[var(--muted-smoke)]">Total change: </span>
                          <span>{formatCurrency(entry.metadata.old_total)} -&gt; {formatCurrency(entry.metadata.new_total)}</span>
                        </div>
                      )}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-[var(--muted-smoke)]">
                    {new Date(entry.created_at).toLocaleString('fr-FR')}
                  </span>
                  {entry.changed_by_name && (
                    <span className="text-[10px] text-[var(--color-gold)] font-medium">by {entry.changed_by_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
