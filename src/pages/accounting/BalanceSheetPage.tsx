/**
 * BalanceSheetPage - Assets = Liabilities + Equity (Epic 9 - Story 9.7)
 */

import { useState } from 'react'
import { useBalanceSheet } from '@/hooks/accounting'
import { FinancialStatementTable } from '@/components/accounting/FinancialStatementTable'

export default function BalanceSheetPage() {
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const { data, isLoading } = useBalanceSheet({ endDate })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
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
      </div>

      {data && (
        <FinancialStatementTable
          sections={[
            {
              title: 'Assets',
              accounts: data.assets.accounts,
              total: data.assets.total,
              totalLabel: 'Total Assets',
            },
            {
              title: 'Liabilities',
              accounts: data.liabilities.accounts,
              total: data.liabilities.total,
              totalLabel: 'Total Liabilities',
            },
            {
              title: 'Equity',
              accounts: data.equity.accounts,
              total: data.equity.total,
              totalLabel: 'Total Equity',
            },
          ]}
          grandTotal={{
            label: 'Total Liabilities + Equity',
            amount: data.totalLiabilitiesAndEquity,
          }}
          balanceCheck={{
            label: 'Assets = Liabilities + Equity',
            isBalanced: data.isBalanced,
          }}
        />
      )}
    </div>
  )
}
