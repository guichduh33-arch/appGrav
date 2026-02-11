/**
 * FiscalPeriodModal - Create/lock fiscal period (Epic 9 - Story 9.10)
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { useFiscalPeriods } from '@/hooks/accounting'

interface FiscalPeriodModalProps {
  onClose: () => void
}

export function FiscalPeriodModal({ onClose }: FiscalPeriodModalProps) {
  const { createPeriod } = useFiscalPeriods()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    createPeriod.mutate(
      { year, month, start_date: startDate, end_date: endDate },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Fiscal Period</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
                min={2020}
                max={2030}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPeriod.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
