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
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        {data?.entries.length ? (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 ml-auto"
          >
            <Download size={14} /> Export CSV
          </button>
        ) : null}
      </div>

      {!accountId ? (
        <div className="text-center py-12 text-gray-400">
          Select an account to view its ledger
        </div>
      ) : isLoading ? (
        <div className="border rounded-lg p-8 text-center text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Opening balance */}
          <div className="flex justify-between items-center mb-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium">Opening Balance</span>
            <span className="font-mono">{formatIDR(data?.openingBalance ?? 0)}</span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Entry #</th>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                  <th className="text-right px-4 py-2 font-medium">Debit</th>
                  <th className="text-right px-4 py-2 font-medium">Credit</th>
                  <th className="text-right px-4 py-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No movements in this period
                    </td>
                  </tr>
                ) : (
                  data?.entries.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{entry.date}</td>
                      <td className="px-4 py-2 font-mono text-xs">{entry.entry_number}</td>
                      <td className="px-4 py-2 max-w-xs truncate">{entry.description}</td>
                      <td className="px-4 py-2 text-right font-mono">
                        {entry.debit > 0 ? formatIDR(entry.debit) : ''}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {entry.credit > 0 ? formatIDR(entry.credit) : ''}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-medium">
                        {formatIDR(entry.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Closing balance */}
          <div className="flex justify-between items-center mt-2 px-4 py-2 bg-blue-50 rounded-lg text-sm font-medium">
            <span>Closing Balance</span>
            <span className="font-mono text-blue-700">{formatIDR(data?.closingBalance ?? 0)}</span>
          </div>
        </>
      )}
    </div>
  )
}
