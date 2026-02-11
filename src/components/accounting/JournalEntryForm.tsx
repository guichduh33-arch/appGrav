/**
 * JournalEntryForm - Manual journal entry creation (Epic 9 - Story 9.4)
 */

import { useState } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import { useCreateJournalEntry } from '@/hooks/accounting'
import { useFiscalPeriods } from '@/hooks/accounting'
import { validateJournalEntry } from '@/services/accounting/journalEntryValidation'
import { calculateLineTotals } from '@/services/accounting/accountingService'
import { JournalLineTable } from './JournalLineTable'
import type { IJournalLineInput } from '@/types/accounting'

interface JournalEntryFormProps {
  onClose: () => void
}

const emptyLine = (): IJournalLineInput => ({
  account_id: '',
  debit: 0,
  credit: 0,
  description: '',
})

export function JournalEntryForm({ onClose }: JournalEntryFormProps) {
  const createEntry = useCreateJournalEntry()
  const { periods } = useFiscalPeriods()
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<IJournalLineInput[]>([emptyLine(), emptyLine()])
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([])

  const { totalDebit, totalCredit, difference } = calculateLineTotals(lines)

  const addLine = () => setLines([...lines, emptyLine()])

  const removeLine = (index: number) => {
    if (lines.length <= 2) return
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, updates: Partial<IJournalLineInput>) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...updates } : line)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateJournalEntry(entryDate, description, lines, periods)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    createEntry.mutate(
      { entry_date: entryDate, description, lines },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Journal Entry</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Entry description"
              />
            </div>
          </div>

          <JournalLineTable
            lines={lines}
            onUpdateLine={updateLine}
            onRemoveLine={removeLine}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus size={16} /> Add Line
            </button>

            <div className="flex items-center gap-4 text-sm">
              <span>Debit: <strong>{totalDebit.toLocaleString()}</strong></span>
              <span>Credit: <strong>{totalCredit.toLocaleString()}</strong></span>
              <span className={Math.abs(difference) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                Diff: {difference.toLocaleString()}
              </span>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle size={14} />
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEntry.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createEntry.isPending ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
