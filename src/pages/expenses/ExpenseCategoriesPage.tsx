import { useState } from 'react'
import { Plus, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useToggleCategoryActive,
} from '@/hooks/expenses'
import type { IExpenseCategory, IExpenseCategoryInsert } from '@/types/expenses'

export default function ExpenseCategoriesPage() {
  const { data: categories, isLoading } = useExpenseCategories()
  const createMutation = useCreateExpenseCategory()
  const updateMutation = useUpdateExpenseCategory()
  const toggleMutation = useToggleCategoryActive()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IExpenseCategory | null>(null)
  const [form, setForm] = useState({ name: '', code: '', sort_order: '0' })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', code: '', sort_order: '0' })
    setShowForm(true)
  }

  const openEdit = (cat: IExpenseCategory) => {
    setEditing(cat)
    setForm({ name: cat.name, code: cat.code, sort_order: cat.sort_order.toString() })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) return

    const input: IExpenseCategoryInsert = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      sort_order: parseInt(form.sort_order) || 0,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...input }, {
        onSuccess: () => { setShowForm(false); setEditing(null) },
      })
    } else {
      createMutation.mutate(input, {
        onSuccess: () => { setShowForm(false) },
      })
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-[var(--color-gold)]/50 focus:outline-none'

  if (isLoading) {
    return <div className="text-center py-12 text-white/40">Loading categories...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-sm">{categories?.length ?? 0} categories</p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-white">{editing ? 'Edit Category' : 'New Category'}</h2>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="e.g. Rent & Utilities" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className={inputClass} placeholder="e.g. RENT" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className={inputClass} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-[var(--color-gold)] text-black rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {editing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-white/50 text-xs uppercase">
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-center">Order</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(cat => (
                <tr key={cat.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-white/70">{cat.code}</td>
                  <td className="px-4 py-3 text-white">{cat.name}</td>
                  <td className="px-4 py-3 text-center text-white/50">{cat.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMutation.mutate({ id: cat.id, is_active: !cat.is_active })}
                      className="transition-colors"
                      title={cat.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {cat.is_active
                        ? <ToggleRight size={20} className="text-emerald-400" />
                        : <ToggleLeft size={20} className="text-white/30" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-white/40 hover:text-[var(--color-gold)] transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
