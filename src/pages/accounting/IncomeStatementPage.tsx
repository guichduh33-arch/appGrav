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
        <label className="text-sm text-gray-500">From:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <label className="text-sm text-gray-500">To:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
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

          <div className={`mt-4 border-2 rounded-lg px-4 py-3 flex items-center justify-between ${
            data.netIncome >= 0
              ? 'border-green-300 bg-green-50'
              : 'border-red-300 bg-red-50'
          }`}>
            <span className="font-bold text-lg">Net Income</span>
            <span className={`font-bold font-mono text-xl ${
              data.netIncome >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatIDR(data.netIncome)}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
