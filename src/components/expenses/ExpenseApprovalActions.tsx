import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useApproveExpense, useRejectExpense } from '@/hooks/expenses'

interface Props {
  expenseId: string
  onComplete?: () => void
}

export function ExpenseApprovalActions({ expenseId, onComplete }: Props) {
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const approve = useApproveExpense()
  const reject = useRejectExpense()

  const handleApprove = () => {
    approve.mutate(expenseId, { onSuccess: onComplete })
  }

  const handleReject = () => {
    if (!reason.trim()) return
    reject.mutate({ id: expenseId, reason }, {
      onSuccess: () => {
        setShowReject(false)
        setReason('')
        onComplete?.()
      },
    })
  }

  if (showReject) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Rejection reason..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-red-500/50 focus:outline-none"
          autoFocus
        />
        <button
          onClick={handleReject}
          disabled={!reason.trim() || reject.isPending}
          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 transition-colors"
        >
          Confirm
        </button>
        <button
          onClick={() => { setShowReject(false); setReason('') }}
          className="px-3 py-1.5 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={approve.isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
      >
        <Check size={14} />
        Approve
      </button>
      <button
        onClick={() => setShowReject(true)}
        disabled={reject.isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 disabled:opacity-50 transition-colors"
      >
        <X size={14} />
        Reject
      </button>
    </div>
  )
}
