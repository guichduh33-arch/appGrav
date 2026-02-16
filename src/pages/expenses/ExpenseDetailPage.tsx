import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react'
import { useExpense, useDeleteExpense } from '@/hooks/expenses'
import { ExpenseStatusBadge } from '@/components/expenses/ExpenseStatusBadge'
import { ExpenseApprovalActions } from '@/components/expenses/ExpenseApprovalActions'

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: expense, isLoading, refetch } = useExpense(id)
  const deleteMutation = useDeleteExpense()

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' IDR'

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--theme-bg-primary)] p-6 text-white/40">Loading...</div>
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-primary)] p-6 text-center py-20">
        <p className="text-white/60">Expense not found</p>
      </div>
    )
  }

  const handleDelete = () => {
    if (!confirm('Delete this expense?')) return
    deleteMutation.mutate(expense.id, { onSuccess: () => navigate('/expenses') })
  }

  const detailRow = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-start py-3 border-b border-white/5">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white text-sm text-right max-w-[60%]">{value}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/expenses')} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Expenses
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{expense.expense_number}</h1>
            <p className="text-white/50 text-sm mt-1">{expense.description}</p>
          </div>
          <ExpenseStatusBadge status={expense.status} />
        </div>

        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 space-y-0">
          {detailRow('Amount', <span className="font-mono font-bold text-lg">{fmt(expense.amount)}</span>)}
          {detailRow('Date', new Date(expense.expense_date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }))}
          {detailRow('Category', `${expense.category_name} (${expense.category_code})`)}
          {detailRow('Payment Method', <span className="capitalize">{expense.payment_method}</span>)}
          {expense.supplier_name && detailRow('Supplier', expense.supplier_name)}
          {expense.notes && detailRow('Notes', expense.notes)}
          {detailRow('Created by', expense.creator_name || 'Unknown')}
          {detailRow('Created at', new Date(expense.created_at).toLocaleString('en-US'))}
          {expense.status === 'approved' && (
            <>
              {detailRow('Approved by', expense.approver_name || 'Unknown')}
              {detailRow('Approved at', expense.approved_at ? new Date(expense.approved_at).toLocaleString('en-US') : '-')}
              {expense.journal_entry_id && detailRow('Journal Entry',
                <Link to="/accounting/journal-entries" className="text-[var(--color-gold)] hover:underline inline-flex items-center gap-1">
                  View <ExternalLink size={12} />
                </Link>
              )}
            </>
          )}
          {expense.status === 'rejected' && expense.rejected_reason && (
            detailRow('Rejection Reason', <span className="text-red-400">{expense.rejected_reason}</span>)
          )}
        </div>

        {/* Actions */}
        {expense.status === 'pending' && (
          <div className="mt-6 space-y-4">
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Approval</h3>
              <ExpenseApprovalActions expenseId={expense.id} onComplete={() => refetch()} />
            </div>
            <div className="flex gap-3">
              <Link
                to={`/expenses/${expense.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                <Edit size={14} />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
