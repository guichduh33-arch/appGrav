/**
 * VATManagementPage - VAT summary + Fiscal Periods (Epic 9 - Stories 9.9 + 9.10)
 */

import { useState } from 'react'
import { Plus, Lock, Unlock, Download } from 'lucide-react'
import { useVATManagement, useFiscalPeriods } from '@/hooks/accounting'
import { VATSummaryCard } from '@/components/accounting/VATSummaryCard'
import { FiscalPeriodModal } from '@/components/accounting/FiscalPeriodModal'
import { generateDJPExport } from '@/services/accounting/vatService'

const PERIOD_STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-yellow-100 text-yellow-700',
  locked: 'bg-gray-100 text-gray-700',
}

export default function VATManagementPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [showPeriodModal, setShowPeriodModal] = useState(false)

  const { data: vatSummary, isLoading: vatLoading } = useVATManagement({ year, month })
  const { periods, lockPeriod, closePeriod, reopenPeriod } = useFiscalPeriods()

  const handleExportDJP = () => {
    if (!vatSummary) return
    const csv = generateDJPExport(year, month, vatSummary)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vat-report-${year}-${String(month).padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm w-24"
          min={2020}
          max={2030}
        />
        <button
          onClick={handleExportDJP}
          disabled={!vatSummary}
          className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 ml-auto disabled:opacity-30"
        >
          <Download size={14} /> Export DJP
        </button>
      </div>

      {/* VAT Summary */}
      <VATSummaryCard
        summary={vatSummary ?? { collected: 0, deductible: 0, payable: 0 }}
        year={year}
        month={month}
        isLoading={vatLoading}
      />

      {/* Fiscal Periods */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Fiscal Periods</h3>
          <button
            onClick={() => setShowPeriodModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={14} /> New Period
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-2 font-medium">Period</th>
                <th className="text-left px-4 py-2 font-medium">Start</th>
                <th className="text-left px-4 py-2 font-medium">End</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">VAT Declaration</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No fiscal periods created yet
                  </td>
                </tr>
              ) : (
                periods.map(period => (
                  <tr key={period.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      {new Date(period.year, period.month - 1).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2">{period.start_date}</td>
                    <td className="px-4 py-2">{period.end_date}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        PERIOD_STATUS_COLORS[period.status] || ''
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {period.vat_declaration_ref || '-'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {period.status === 'open' && (
                          <button
                            onClick={() => closePeriod.mutate(period.id)}
                            className="p-1 hover:bg-yellow-50 rounded text-yellow-600"
                            title="Close period"
                          >
                            <Lock size={14} />
                          </button>
                        )}
                        {period.status === 'closed' && (
                          <>
                            <button
                              onClick={() => lockPeriod.mutate(period.id)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-600"
                              title="Lock period"
                            >
                              <Lock size={14} />
                            </button>
                            <button
                              onClick={() => reopenPeriod.mutate(period.id)}
                              className="p-1 hover:bg-green-50 rounded text-green-600"
                              title="Reopen period"
                            >
                              <Unlock size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPeriodModal && (
        <FiscalPeriodModal onClose={() => setShowPeriodModal(false)} />
      )}
    </div>
  )
}
