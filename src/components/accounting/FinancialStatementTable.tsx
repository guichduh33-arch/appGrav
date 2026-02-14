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
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
          {title}
        </span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {accounts.map(acc => (
            <tr key={acc.account_code} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="px-4 py-2 font-mono text-[var(--theme-text-muted)] w-20">{acc.account_code}</td>
              <td className="px-4 py-2 text-white">{acc.account_name}</td>
              <td className="px-4 py-2 text-right font-mono text-white">{formatIDR(acc.amount)}</td>
            </tr>
          ))}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-3 text-center text-[var(--theme-text-muted)]">
                No data
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-black/20 border-t-2 border-[var(--color-gold)]">
            <td colSpan={2} className="px-4 py-2 font-bold text-white">{totalLabel || `Total ${title}`}</td>
            <td className="px-4 py-2 text-right font-mono font-bold text-[var(--color-gold)]">{formatIDR(total)}</td>
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
        <div className="bg-black/20 border-2 border-[var(--color-gold)] rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-white">{grandTotal.label}</span>
          <span className="font-bold font-mono text-lg text-[var(--color-gold)]">{formatIDR(grandTotal.amount)}</span>
        </div>
      )}

      {balanceCheck && (
        <div className={`rounded-xl px-4 py-2 text-sm font-medium ${
          balanceCheck.isBalanced
            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
            : 'bg-red-400/10 text-red-400 border border-red-400/20'
        }`}>
          {balanceCheck.isBalanced
            ? `${balanceCheck.label}: Balanced`
            : `${balanceCheck.label}: NOT Balanced - check entries`}
        </div>
      )}
    </div>
  )
}
