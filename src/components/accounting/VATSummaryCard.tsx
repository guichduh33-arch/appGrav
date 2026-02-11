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
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-500">
        VAT Summary - {monthName} {year}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">PPN Keluaran (Output VAT)</p>
          <p className="text-xl font-bold text-blue-700">{formatIDR(summary.collected)}</p>
          <p className="text-xs text-gray-400 mt-1">Collected from sales</p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-1">PPN Masukan (Input VAT)</p>
          <p className="text-xl font-bold text-green-700">{formatIDR(summary.deductible)}</p>
          <p className="text-xs text-gray-400 mt-1">Deductible from purchases</p>
        </div>

        <div className={`border-2 rounded-lg p-4 ${
          summary.payable > 0
            ? 'border-orange-300 bg-orange-50'
            : 'border-green-300 bg-green-50'
        }`}>
          <p className="text-sm text-gray-500 mb-1">PPN Terutang (VAT Payable)</p>
          <p className={`text-xl font-bold ${
            summary.payable > 0 ? 'text-orange-700' : 'text-green-700'
          }`}>
            {formatIDR(summary.payable)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {summary.payable > 0 ? 'Amount due to DJP' : 'Credit balance'}
          </p>
        </div>
      </div>
    </div>
  )
}
