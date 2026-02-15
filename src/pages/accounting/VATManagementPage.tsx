/**
 * VATManagementPage - VAT summary + Fiscal Periods (Epic 9 - Stories 9.9 + 9.10)
 */

import { useState } from 'react'
import { Plus, Lock, Unlock, Download, FileText, FileCheck, Loader2 } from 'lucide-react'
import { useVATManagement, useFiscalPeriods } from '@/hooks/accounting'
import { useVatFilings, useCreateVatFiling, useMarkVatFiled } from '@/hooks/accounting/useVatFilings'
import { VATSummaryCard } from '@/components/accounting/VATSummaryCard'
import { FiscalPeriodModal } from '@/components/accounting/FiscalPeriodModal'
import { generateDJPExport, getIndonesianMonthName } from '@/services/accounting/vatService'
import { exportToPDF } from '@/services/reports/pdfExport'
import { formatCurrency } from '@/utils/helpers'
import { toast } from 'sonner'

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
  const [showFileModal, setShowFileModal] = useState(false)
  const [fileRef, setFileRef] = useState('')

  const { data: vatSummary, isLoading: vatLoading } = useVATManagement({ year, month })
  const { periods, lockPeriod, closePeriod, reopenPeriod } = useFiscalPeriods()
  const { data: filings = [], isLoading: filingsLoading } = useVatFilings(year)
  const createFiling = useCreateVatFiling()
  const markFiled = useMarkVatFiled()

  const currentFiling = filings.find(f => f.filing_month === month)

  const handleCreateFiling = async () => {
    if (!vatSummary) return
    try {
      await createFiling.mutateAsync({
        year, month,
        vatCollected: vatSummary.collected,
        vatDeductible: vatSummary.deductible,
        vatPayable: vatSummary.payable,
      })
      toast.success('VAT filing draft created')
    } catch {
      toast.error('Failed to create filing')
    }
  }

  const handleMarkFiled = async () => {
    if (!currentFiling || !fileRef.trim()) return
    try {
      await markFiled.mutateAsync({ filingId: currentFiling.id, referenceNumber: fileRef.trim() })
      toast.success('Filing marked as submitted')
      setShowFileModal(false)
      setFileRef('')
    } catch {
      toast.error('Failed to update filing')
    }
  }

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

  const handleExportPDF = async () => {
    if (!vatSummary) return
    const monthName = getIndonesianMonthName(month)
    interface IVatRow { label: string; amount: number }
    const rows: IVatRow[] = [
      { label: 'PPN Keluaran (Output VAT)', amount: vatSummary.collected },
      { label: 'PPN Masukan (Input VAT)', amount: vatSummary.deductible },
      { label: 'PPN Terutang (Net VAT Payable)', amount: vatSummary.payable },
    ]
    const result = await exportToPDF<IVatRow>(
      rows,
      [
        { key: 'label', header: 'Description', width: 120 },
        { key: 'amount', header: 'Amount (IDR)', align: 'right', format: (v) => {
          const n = Number(v)
          return isNaN(n) ? '' : Math.round(n / 100) * 100 + ' IDR'
        }},
      ],
      {
        filename: `vat-summary-${year}-${String(month).padStart(2, '0')}`,
        title: 'PPN Tax Summary',
        subtitle: `${monthName} ${year} — The Breakery`,
        watermark: { text: 'The Breakery', showDate: true },
        footerText: 'The Breakery — Lombok, Indonesia',
      },
      [
        { label: 'Period', value: `${monthName} ${year}` },
        { label: 'Filing Status', value: currentFiling?.status ?? 'Not filed' },
      ]
    )
    if (!result.success) toast.error(result.error ?? 'PDF export failed')
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
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleExportPDF}
            disabled={!vatSummary}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 disabled:opacity-30 transition-colors"
          >
            <FileText size={14} /> Export PDF
          </button>
          <button
            onClick={handleExportDJP}
            disabled={!vatSummary}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 disabled:opacity-30 transition-colors"
          >
            <Download size={14} /> Export DJP
          </button>
        </div>
      </div>

      {/* VAT Summary */}
      <VATSummaryCard
        summary={vatSummary ?? { collected: 0, deductible: 0, payable: 0 }}
        year={year}
        month={month}
        isLoading={vatLoading}
      />

      {/* VAT Filing Status */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            Filing Status - {new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })} {year}
          </h3>
          {!currentFiling && vatSummary && (
            <button
              onClick={handleCreateFiling}
              disabled={createFiling.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--color-gold)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createFiling.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Draft
            </button>
          )}
        </div>

        {filingsLoading ? (
          <div className="flex items-center gap-2 text-[var(--theme-text-muted)] text-sm py-4">
            <Loader2 size={16} className="animate-spin" /> Loading filings...
          </div>
        ) : currentFiling ? (
          <div className="flex items-center gap-4">
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              currentFiling.status === 'filed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
            }`}>
              {currentFiling.status}
            </span>
            <span className="text-sm text-white/70">
              Collected: {formatCurrency(currentFiling.vat_collected)} | Deductible: {formatCurrency(currentFiling.vat_deductible)} | Payable: {formatCurrency(currentFiling.vat_payable)}
            </span>
            {currentFiling.reference_number && (
              <span className="text-xs text-[var(--theme-text-muted)]">Ref: {currentFiling.reference_number}</span>
            )}
            {currentFiling.status === 'draft' && (
              <button
                onClick={() => setShowFileModal(true)}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm border border-emerald-400/30 text-emerald-400 rounded-xl hover:bg-emerald-400/10 transition-colors"
              >
                <FileCheck size={14} /> Mark as Filed
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--theme-text-muted)]">No filing created for this period yet</p>
        )}
      </div>

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

      {showFileModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowFileModal(false)}>
          <div className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Mark as Filed</h3>
            <label className="block text-sm text-[var(--theme-text-muted)] mb-1">DJP Reference Number</label>
            <input
              type="text"
              value={fileRef}
              onChange={e => setFileRef(e.target.value)}
              placeholder="e.g. NTPN-2024-001"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFileModal(false)} className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleMarkFiled}
                disabled={!fileRef.trim() || markFiled.isPending}
                className="px-4 py-2 text-sm bg-emerald-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {markFiled.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
