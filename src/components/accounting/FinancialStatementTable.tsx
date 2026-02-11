/**
 * FinancialStatementTable - Reusable for Balance Sheet and Income Statement (Epic 9)
 */

import { formatIDR } from '@/services/accounting/accountingService'
import type { IFinancialStatementRow } from '@/types/accounting'

interface FinancialStatementSectionProps {
  title: string
  accounts: IFinancialStatementRow[]
  total: number
  totalLabel?: string
}

export function FinancialStatementSection({
  title,
  accounts,
  total,
  totalLabel,
}: FinancialStatementSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 font-semibold text-sm border-b">
        {title}
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y">
          {accounts.map(acc => (
            <tr key={acc.account_code} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-gray-500 w-20">{acc.account_code}</td>
              <td className="px-4 py-2">{acc.account_name}</td>
              <td className="px-4 py-2 text-right font-mono">{formatIDR(acc.amount)}</td>
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-center text-gray-400">
                No data
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-semibold border-t">
            <td colSpan={2} className="px-4 py-2">{totalLabel || `Total ${title}`}</td>
            <td className="px-4 py-2 text-right font-mono">{formatIDR(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

interface FinancialStatementTableProps {
  sections: FinancialStatementSectionProps[]
  grandTotal?: { label: string; amount: number }
  balanceCheck?: { label: string; isBalanced: boolean }
}

export function FinancialStatementTable({
  sections,
  grandTotal,
  balanceCheck,
}: FinancialStatementTableProps) {
  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <FinancialStatementSection key={i} {...section} />
      ))}

      {grandTotal && (
        <div className="border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between bg-gray-50">
          <span className="font-bold">{grandTotal.label}</span>
          <span className="font-bold font-mono text-lg">{formatIDR(grandTotal.amount)}</span>
        </div>
      )}

      {balanceCheck && (
        <div className={`rounded-lg px-4 py-2 text-sm font-medium ${
          balanceCheck.isBalanced
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {balanceCheck.isBalanced
            ? `${balanceCheck.label}: Balanced`
            : `${balanceCheck.label}: NOT Balanced - check entries`}
        </div>
      )}
    </div>
  )
}
