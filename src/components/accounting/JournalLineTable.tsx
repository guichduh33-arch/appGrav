/**
 * JournalLineTable - Editable debit/credit lines (Epic 9 - Story 9.4)
 */

import { Trash2 } from 'lucide-react'
import { AccountPicker } from './AccountPicker'
import type { IJournalLineInput } from '@/types/accounting'

interface JournalLineTableProps {
  lines: IJournalLineInput[]
  onUpdateLine: (index: number, updates: Partial<IJournalLineInput>) => void
  onRemoveLine: (index: number) => void
  readOnly?: boolean
}

export function JournalLineTable({
  lines,
  onUpdateLine,
  onRemoveLine,
  readOnly = false,
}: JournalLineTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] w-2/5">Account</th>
            <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] w-1/5">Description</th>
            <th className="text-right px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] w-1/6">Debit</th>
            <th className="text-right px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] w-1/6">Credit</th>
            {!readOnly && <th className="w-10"></th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-sm text-white/80">{line.account_id}</span>
                ) : (
                  <AccountPicker
                    value={line.account_id}
                    onChange={id => onUpdateLine(index, { account_id: id })}
                  />
                )}
              </td>
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-white/80">{line.description}</span>
                ) : (
                  <input
                    type="text"
                    value={line.description || ''}
                    onChange={e => onUpdateLine(index, { description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                    placeholder="Line description"
                  />
                )}
              </td>
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-right block text-emerald-400">{line.debit > 0 ? line.debit.toLocaleString() : ''}</span>
                ) : (
                  <input
                    type="number"
                    value={line.debit || ''}
                    onChange={e => {
                      const val = Number(e.target.value) || 0
                      onUpdateLine(index, { debit: val, credit: val > 0 ? 0 : line.credit })
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-sm text-right text-emerald-400 placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                    placeholder="0"
                    min={0}
                  />
                )}
              </td>
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-right block text-red-400">{line.credit > 0 ? line.credit.toLocaleString() : ''}</span>
                ) : (
                  <input
                    type="number"
                    value={line.credit || ''}
                    onChange={e => {
                      const val = Number(e.target.value) || 0
                      onUpdateLine(index, { credit: val, debit: val > 0 ? 0 : line.debit })
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-sm text-right text-red-400 placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                    placeholder="0"
                    min={0}
                  />
                )}
              </td>
              {!readOnly && (
                <td className="px-1 py-1">
                  <button
                    type="button"
                    onClick={() => onRemoveLine(index)}
                    disabled={lines.length <= 2}
                    className="p-1 hover:bg-red-400/10 rounded text-white/30 hover:text-red-400 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
