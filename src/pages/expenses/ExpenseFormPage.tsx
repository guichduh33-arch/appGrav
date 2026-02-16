import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useExpense, useCreateExpense, useUpdateExpense } from '@/hooks/expenses'
import { ExpenseCategoryPicker } from '@/components/expenses/ExpenseCategoryPicker'
import { PAYMENT_METHOD_OPTIONS } from '@/types/expenses'
import { validateExpense } from '@/services/expenses/expenseService'

export default function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing, isLoading: loadingExisting } = useExpense(id)
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const [form, setForm] = useState({
    category_id: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    supplier_id: '',
    notes: '',
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        category_id: existing.category_id,
        description: existing.description,
        amount: existing.amount.toString(),
        expense_date: existing.expense_date.split('T')[0],
        payment_method: existing.payment_method,
        supplier_id: existing.supplier_id || '',
        notes: existing.notes || '',
      })
    }
  }, [existing, isEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const input = {
      category_id: form.category_id,
      description: form.description.trim(),
      amount: parseFloat(form.amount) || 0,
      expense_date: form.expense_date,
      payment_method: form.payment_method,
      supplier_id: form.supplier_id || null,
      notes: form.notes.trim() || null,
    }

    const validation = validateExpense(input)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors([])

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, ...input },
        { onSuccess: () => navigate(`/expenses/${id}`) }
      )
    } else {
      createMutation.mutate(input, {
        onSuccess: () => navigate('/expenses'),
      })
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors'
  const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

  if (isEdit && loadingExisting) {
    return <div className="min-h-screen bg-[var(--theme-bg-primary)] p-6 text-white/40">Loading...</div>
  }

  if (isEdit && existing?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-primary)] p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-white/60">Only pending expenses can be edited.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[var(--color-gold)] hover:underline text-sm">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Expense' : 'New Expense'}</h1>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-red-400">{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <ExpenseCategoryPicker
                value={form.category_id}
                onChange={v => setForm(f => ({ ...f, category_id: v }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                value={form.expense_date}
                onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Monthly electricity bill"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Amount (IDR) *</label>
              <input
                type="number"
                min="0"
                step="100"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Payment Method *</label>
              <select
                value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className={inputClass}
              >
                {PAYMENT_METHOD_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-gold)] text-black rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save size={16} />
              {isEdit ? 'Save Changes' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
