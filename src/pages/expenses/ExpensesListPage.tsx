import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, DollarSign, Clock, FileText, TrendingDown } from 'lucide-react'
import { useExpenses } from '@/hooks/expenses'
import { ExpenseStatusBadge } from '@/components/expenses/ExpenseStatusBadge'
import { ExpenseApprovalActions } from '@/components/expenses/ExpenseApprovalActions'
import type { IExpenseFilters, TExpenseStatus } from '@/types/expenses'
import { EXPENSE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/types/expenses'
import { useExpenseCategories } from '@/hooks/expenses'

export default function ExpensesListPage() {
  const [status, setStatus] = useState<TExpenseStatus | ''>('')
  const [categoryId, setCategoryId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [search, setSearch] = useState('')

  const filters: IExpenseFilters = useMemo(() => ({
    ...(status ? { status: status as TExpenseStatus } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
    ...(paymentMethod ? { payment_method: paymentMethod } : {}),
    ...(search ? { search } : {}),
  }), [status, categoryId, paymentMethod, search])

  const { data: expenses, isLoading } = useExpenses(filters)
  const { activeCategories } = useExpenseCategories()

  const kpis = useMemo(() => {
    if (!expenses) return { total: 0, count: 0, avg: 0, pendingCount: 0 }
    const approved = expenses.filter(e => e.status === 'approved')
    const total = approved.reduce((s, e) => s + e.amount, 0)
    return {
      total,
      count: expenses.length,
      avg: approved.length > 0 ? total / approved.length : 0,
      pendingCount: expenses.filter(e => e.status === 'pending').length,
    }
  }, [expenses])

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' IDR'

  const selectClass =
    'px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-[var(--color-gold)]/50 focus:outline-none'

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Approved Total', value: fmt(kpis.total), icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Expenses', value: kpis.count.toString(), icon: FileText, color: 'text-blue-400' },
          { label: 'Avg Expense', value: fmt(kpis.avg), icon: TrendingDown, color: 'text-purple-400' },
          { label: 'Pending', value: kpis.pendingCount.toString(), icon: Clock, color: 'text-amber-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
              <kpi.icon size={14} className={kpi.color} />
              {kpi.label}
            </div>
            <div className="text-lg font-bold text-white">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[var(--color-gold)]/50 focus:outline-none"
          />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as TExpenseStatus | '')} className={selectClass}>
          <option value="">All statuses</option>
          {EXPENSE_STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {activeCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={selectClass}>
          <option value="">All payments</option>
          {PAYMENT_METHOD_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Link
          to="/expenses/new"
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Expense
        </Link>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-white/40">Loading expenses...</div>
      ) : !expenses?.length ? (
        <div className="text-center py-12 text-white/40">No expenses found</div>
      ) : (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-white/50 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Number</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/expenses/${exp.id}`} className="text-[var(--color-gold)] hover:underline font-mono text-xs">
                        {exp.expense_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {new Date(exp.expense_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-white/80">{exp.category_name}</td>
                    <td className="px-4 py-3 text-white/80 max-w-[200px] truncate">{exp.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-white">{fmt(exp.amount)}</td>
                    <td className="px-4 py-3 text-white/60 capitalize">{exp.payment_method}</td>
                    <td className="px-4 py-3 text-center">
                      <ExpenseStatusBadge status={exp.status} />
                    </td>
                    <td className="px-4 py-3">
                      {exp.status === 'pending' && (
                        <ExpenseApprovalActions expenseId={exp.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
