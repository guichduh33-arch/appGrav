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
  open: 'bg-emerald-400/10 text-emerald-400',
  closed: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
  locked: 'bg-white/5 text-[var(--theme-text-muted)]',
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
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
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
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white w-24 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
          min={2020}
          max={2030}
        />
        <button
          onClick={handleExportDJP}
          disabled={!vatSummary}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 ml-auto disabled:opacity-30 transition-colors"
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
          <h3 className="text-lg font-semibold text-white">Fiscal Periods</h3>
          <button
            onClick={() => setShowPeriodModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> New Period
          </button>
        </div>

        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Period</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Start</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">End</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Status</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">VAT Declaration</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                    No fiscal periods created yet
                  </td>
                </tr>
              ) : (
                periods.map(period => (
                  <tr key={period.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-2 font-medium text-white">
                      {new Date(period.year, period.month - 1).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-2 text-white/70">{period.start_date}</td>
                    <td className="px-4 py-2 text-white/70">{period.end_date}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        PERIOD_STATUS_COLORS[period.status] || ''
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[var(--theme-text-muted)]">
                      {period.vat_declaration_ref || '-'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {period.status === 'open' && (
                          <button
                            onClick={() => closePeriod.mutate(period.id)}
                            className="p-1 hover:bg-[var(--color-gold)]/10 rounded-lg text-[var(--color-gold)] transition-colors"
                            title="Close period"
                          >
                            <Lock size={14} />
                          </button>
                        )}
                        {period.status === 'closed' && (
                          <>
                            <button
                              onClick={() => lockPeriod.mutate(period.id)}
                              className="p-1 hover:bg-white/10 rounded-lg text-[var(--theme-text-muted)] transition-colors"
                              title="Lock period"
                            >
                              <Lock size={14} />
                            </button>
                            <button
                              onClick={() => reopenPeriod.mutate(period.id)}
                              className="p-1 hover:bg-emerald-400/10 rounded-lg text-emerald-400 transition-colors"
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
