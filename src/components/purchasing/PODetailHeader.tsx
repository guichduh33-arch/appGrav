import { ArrowLeft, Edit2, Send, CheckCircle, XCircle, WifiOff } from 'lucide-react'
import type { IPODetailHeaderProps } from './types'

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  confirmed: 'Confirmed',
  received: 'Received',
  cancelled: 'Cancelled',
}

const statusBadgeClass: Record<string, string> = {
  draft: 'border-[var(--muted-smoke)] text-[var(--muted-smoke)]',
  sent: 'border-blue-400/40 text-blue-400',
  confirmed: 'border-[var(--color-gold)]/40 text-[var(--color-gold)]',
  partially_received: 'border-orange-400/40 text-orange-400',
  received: 'border-emerald-400/40 text-emerald-400',
  cancelled: 'border-red-400/40 text-red-400',
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
  const getBadgeClass = (status: string) => statusBadgeClass[status] || statusBadgeClass.draft

  return (
    <>
      {!isOnline && (
        <div className="flex items-center gap-3 px-5 py-3.5 mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-medium">
          <WifiOff size={18} />
          <span>You are offline. Some actions may be unavailable.</span>
        </div>
      )}

      <div className="flex items-center gap-6 mb-8">
        <button
          className="flex items-center gap-2 text-sm text-[var(--muted-smoke)] hover:text-[var(--color-gold)] transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex-1 flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">{purchaseOrder.po_number}</h1>
          <span className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full border ${getBadgeClass(purchaseOrder.status)}`}>
            {getStatusLabel(purchaseOrder.status)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {validActions.includes('send') && (
            <button
              className="flex items-center gap-2 py-2.5 px-4 bg-[var(--color-gold)] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-[var(--color-gold)]/90 disabled:opacity-40"
              onClick={onSendToSupplier}
              disabled={!isOnline || isSending}
            >
              <Send size={15} />
              Send
            </button>
          )}

          {validActions.includes('confirm') && (
            <button
              className="flex items-center gap-2 py-2.5 px-4 bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-emerald-500/90 disabled:opacity-40"
              onClick={onConfirmOrder}
              disabled={!isOnline || isConfirming}
            >
              <CheckCircle size={15} />
              Confirm
            </button>
          )}

          {validActions.includes('cancel') && (
            <button
              className="flex items-center gap-2 py-2.5 px-4 bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:bg-red-500/90 disabled:opacity-40"
              onClick={onCancelOrder}
              disabled={!isOnline}
            >
              <XCircle size={15} />
              Cancel
            </button>
          )}

          <button
            className="flex items-center gap-2 py-2.5 px-4 bg-transparent border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:border-white/20 disabled:opacity-40"
            onClick={onEdit}
            disabled={!isOnline}
          >
            <Edit2 size={15} />
            Edit
          </button>
        </div>
      </div>
    </>
  )
}
