/**
 * IncomeStatementPage - Revenue - Expenses = Net Income (Epic 9 - Story 9.8)
 */

import { useState } from 'react'
import { useIncomeStatement } from '@/hooks/accounting'
import { FinancialStatementTable } from '@/components/accounting/FinancialStatementTable'
import { formatIDR } from '@/services/accounting/accountingService'

export default function IncomeStatementPage() {
  const now = new Date()
  const [startDate, setStartDate] = useState(() => `${now.getFullYear()}-01-01`)
  const [endDate, setEndDate] = useState(() => now.toISOString().split('T')[0])
  const { data, isLoading } = useIncomeStatement({ startDate, endDate })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-32 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">From:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
        />
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">To:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none"
        />
      </div>

      {data && (
        <>
          <FinancialStatementTable
            sections={[
              {
                title: 'Revenue',
                accounts: data.revenue.accounts,
                total: data.revenue.total,
                totalLabel: 'Total Revenue',
              },
              {
                title: 'Expenses',
                accounts: data.expenses.accounts,
                total: data.expenses.total,
                totalLabel: 'Total Expenses',
              },
            ]}
          />

          <div className={`mt-4 border-2 rounded-xl px-4 py-3 flex items-center justify-between ${
            data.netIncome >= 0
              ? 'border-emerald-400/30 bg-emerald-400/10'
              : 'border-red-400/30 bg-red-400/10'
          }`}>
            <span className="font-bold text-lg text-white">Net Income</span>
            <span className={`font-bold font-mono text-xl ${
              data.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {formatIDR(data.netIncome)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
