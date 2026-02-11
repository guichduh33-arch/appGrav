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
        <label className="text-sm text-gray-500">As of:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        {data?.rows.length ? (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 ml-auto"
          >
            <Download size={14} /> Export CSV
          </button>
        ) : null}
      </div>

      {/* Balance check */}
      {data && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
          data.isBalanced
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {data.isBalanced ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {data.isBalanced
            ? 'Trial balance is in equilibrium'
            : `Trial balance is NOT balanced (difference: ${formatIDR(data.totalDebit - data.totalCredit)})`}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-2 font-medium">Code</th>
              <th className="text-left px-4 py-2 font-medium">Account</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-right px-4 py-2 font-medium">Debit</th>
              <th className="text-right px-4 py-2 font-medium">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-12" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-40" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                </tr>
              ))
            ) : data?.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No data for this period
                </td>
              </tr>
            ) : (
              data?.rows.map(row => (
                <tr key={row.account_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-gray-500">{row.account_code}</td>
                  <td className="px-4 py-2">{row.account_name}</td>
                  <td className="px-4 py-2 capitalize text-gray-500">{row.account_type}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.debit_total > 0 ? formatIDR(row.debit_total) : ''}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {row.credit_total > 0 ? formatIDR(row.credit_total) : ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold border-t">
                <td colSpan={3} className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right font-mono">{formatIDR(data.totalDebit)}</td>
                <td className="px-4 py-2 text-right font-mono">{formatIDR(data.totalCredit)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
