/**
 * VATSummaryCard - KPI card for VAT: collected, deductible, payable (Epic 9 - Story 9.9)
 */

import { formatIDR } from '@/services/accounting/accountingService'
import type { IVATSummary } from '@/types/accounting'

interface VATSummaryCardProps {
  summary: IVATSummary
  year: number
  month: number
  isLoading?: boolean
}

export function VATSummaryCard({ summary, year, month, isLoading }: VATSummaryCardProps) {
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' })

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-24 mb-2" />
            <div className="h-8 bg-white/10 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
        VAT Summary - {monthName} {year}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">PPN Keluaran (Output VAT)</p>
          <p className="text-xl font-bold text-[var(--color-gold)]">{formatIDR(summary.collected)}</p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">Collected from sales</p>
        </div>

        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">PPN Masukan (Input VAT)</p>
          <p className="text-xl font-bold text-emerald-400">{formatIDR(summary.deductible)}</p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">Deductible from purchases</p>
        </div>

        <div className={`border-2 rounded-xl p-4 ${
          summary.payable > 0
            ? 'border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5'
            : 'border-emerald-400/30 bg-emerald-400/5'
        }`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">PPN Terutang (VAT Payable)</p>
          <p className={`text-xl font-bold ${
            summary.payable > 0 ? 'text-[var(--color-gold)]' : 'text-emerald-400'
          }`}>
            {formatIDR(summary.payable)}
          </p>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1">
            {summary.payable > 0 ? 'Amount due to DJP' : 'Credit balance'}
          </p>
        </div>
      </div>
    </div>
  )
}
