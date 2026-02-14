/**
 * TrialBalancePage - Per-account summary, equilibrium check (Epic 9 - Story 9.6)
 */

import { useState } from 'react'
import { Download, CheckCircle, AlertCircle } from 'lucide-react'
import { useTrialBalance } from '@/hooks/accounting'
import { formatIDR } from '@/services/accounting/accountingService'

export default function TrialBalancePage() {
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const { data, isLoading } = useTrialBalance({ endDate })

  const exportCSV = () => {
    if (!data?.rows.length) return
    const rows = [
      'Code,Account,Type,Debit,Credit',
      ...data.rows.map(r =>
        `${r.account_code},"${r.account_name}",${r.account_type},${r.debit_total},${r.credit_total}`
      ),
      `,,Total,${data.totalDebit},${data.totalCredit}`,
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trial-balance-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">As of:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
        />
        {data?.rows.length ? (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-white/10 rounded-xl text-white hover:border-white/20 ml-auto transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        ) : null}
      </div>

      {/* Balance check */}
      {data && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-xl text-sm font-medium ${
          data.isBalanced
            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
            : 'bg-red-400/10 text-red-400 border border-red-400/20'
        }`}>
          {data.isBalanced ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {data.isBalanced
            ? 'Trial balance is in equilibrium'
            : `Trial balance is NOT balanced (difference: ${formatIDR(data.totalDebit - data.totalCredit)})`}
        </div>
      )}

      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Code</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Account</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Type</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Debit</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Credit</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-white/5">
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-12" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-40" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-24" /></td>
                </tr>
              ))
            ) : data?.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                  No data for this period
                </td>
              </tr>
            ) : (
              data?.rows.map(row => (
                <tr key={row.account_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2 font-mono text-[var(--theme-text-muted)]">{row.account_code}</td>
                  <td className="px-4 py-2 text-white/80">{row.account_name}</td>
                  <td className="px-4 py-2 capitalize text-[var(--theme-text-muted)]">{row.account_type}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-400">
                    {row.debit_total > 0 ? formatIDR(row.debit_total) : ''}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-red-400">
                    {row.credit_total > 0 ? formatIDR(row.credit_total) : ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data && (
            <tfoot>
              <tr className="border-t border-white/10 font-semibold">
                <td colSpan={3} className="px-4 py-2 text-[var(--color-gold)]">Total</td>
                <td className="px-4 py-2 text-right font-mono text-emerald-400">{formatIDR(data.totalDebit)}</td>
                <td className="px-4 py-2 text-right font-mono text-red-400">{formatIDR(data.totalCredit)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
