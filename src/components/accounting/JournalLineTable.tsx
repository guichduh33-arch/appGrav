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
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left px-3 py-2 font-medium w-2/5">Account</th>
            <th className="text-left px-3 py-2 font-medium w-1/5">Description</th>
            <th className="text-right px-3 py-2 font-medium w-1/6">Debit</th>
            <th className="text-right px-3 py-2 font-medium w-1/6">Credit</th>
            {!readOnly && <th className="w-10"></th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {lines.map((line, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-sm">{line.account_id}</span>
                ) : (
                  <AccountPicker
                    value={line.account_id}
                    onChange={id => onUpdateLine(index, { account_id: id })}
                  />
                )}
              </td>
              <td className="px-2 py-1">
                {readOnly ? (
                  <span>{line.description}</span>
                ) : (
                  <input
                    type="text"
                    value={line.description || ''}
                    onChange={e => onUpdateLine(index, { description: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                    placeholder="Line description"
                  />
                )}
              </td>
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-right block">{line.debit > 0 ? line.debit.toLocaleString() : ''}</span>
                ) : (
                  <input
                    type="number"
                    value={line.debit || ''}
                    onChange={e => {
                      const val = Number(e.target.value) || 0
                      onUpdateLine(index, { debit: val, credit: val > 0 ? 0 : line.credit })
                    }}
                    className="w-full border rounded px-2 py-1.5 text-sm text-right"
                    placeholder="0"
                    min={0}
                  />
                )}
              </td>
              <td className="px-2 py-1">
                {readOnly ? (
                  <span className="text-right block">{line.credit > 0 ? line.credit.toLocaleString() : ''}</span>
                ) : (
                  <input
                    type="number"
                    value={line.credit || ''}
                    onChange={e => {
                      const val = Number(e.target.value) || 0
                      onUpdateLine(index, { credit: val, debit: val > 0 ? 0 : line.debit })
                    }}
                    className="w-full border rounded px-2 py-1.5 text-sm text-right"
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
                    className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 disabled:opacity-30"
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
