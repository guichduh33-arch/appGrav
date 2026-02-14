/**
 * GeneralLedgerPage - Account movements with progressive balance (Epic 9 - Story 9.5)
 */

import { useState } from 'react'
import { Download } from 'lucide-react'
import { AccountPicker } from '@/components/accounting/AccountPicker'
import { useGeneralLedger } from '@/hooks/accounting'
import { formatIDR } from '@/services/accounting/accountingService'

export default function GeneralLedgerPage() {
  const [accountId, setAccountId] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const { data, isLoading } = useGeneralLedger({ accountId: accountId || undefined, startDate, endDate })

  const exportCSV = () => {
    if (!data?.entries.length) return
    const rows = [
      'Date,Entry #,Description,Debit,Credit,Balance',
      ...data.entries.map(e =>
        `${e.date},${e.entry_number},"${e.description}",${e.debit},${e.credit},${e.balance}`
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `general-ledger-${startDate}-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <AccountPicker
          value={accountId}
          onChange={setAccountId}
          placeholder="Select account..."
          className="w-80"
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
        />
        {data?.entries.length ? (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-white/10 rounded-xl text-white hover:border-white/20 ml-auto transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        ) : null}
      </div>

      {!accountId ? (
        <div className="text-center py-12 text-[var(--theme-text-muted)]">
          Select an account to view its ledger
        </div>
      ) : isLoading ? (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-8 text-center text-[var(--theme-text-muted)]">Loading...</div>
      ) : (
        <>
          {/* Opening balance */}
          <div className="flex justify-between items-center mb-2 px-4 py-2 bg-[var(--onyx-surface)] border border-white/5 rounded-xl text-sm">
            <span className="font-medium text-white/80">Opening Balance</span>
            <span className="font-mono text-white">{formatIDR(data?.openingBalance ?? 0)}</span>
          </div>

          <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Entry #</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Description</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Debit</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Credit</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Balance</th>
                </tr>
              </thead>
              <tbody>
                {data?.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                      No movements in this period
                    </td>
                  </tr>
                ) : (
                  data?.entries.map((entry, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2 text-white/80">{entry.date}</td>
                      <td className="px-4 py-2 font-mono text-xs text-[var(--color-gold)]">{entry.entry_number}</td>
                      <td className="px-4 py-2 max-w-xs truncate text-white/80">{entry.description}</td>
                      <td className="px-4 py-2 text-right font-mono text-emerald-400">
                        {entry.debit > 0 ? formatIDR(entry.debit) : ''}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-red-400">
                        {entry.credit > 0 ? formatIDR(entry.credit) : ''}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-medium text-[var(--color-gold)]">
                        {formatIDR(entry.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Closing balance */}
          <div className="flex justify-between items-center mt-2 px-4 py-2 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 rounded-xl text-sm font-medium">
            <span className="text-white">Closing Balance</span>
            <span className="font-mono text-[var(--color-gold)]">{formatIDR(data?.closingBalance ?? 0)}</span>
          </div>
        </>
      )}
    </div>
  )
}
