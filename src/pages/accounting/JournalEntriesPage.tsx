/**
 * JournalEntriesPage - List + create manual entries (Epic 9 - Story 9.4)
 */

import { useState } from 'react'
import { Plus, Eye, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useJournalEntries, useJournalEntry, usePostJournalEntry } from '@/hooks/accounting'
import { JournalEntryForm } from '@/components/accounting/JournalEntryForm'
import { formatIDR } from '@/services/accounting/accountingService'
import type { TJournalReferenceType } from '@/types/accounting'

const REF_TYPE_COLORS: Record<string, string> = {
  sale: 'bg-green-100 text-green-700',
  purchase: 'bg-blue-100 text-blue-700',
  manual: 'bg-gray-100 text-gray-700',
  void: 'bg-red-100 text-red-700',
  refund: 'bg-orange-100 text-orange-700',
  adjustment: 'bg-purple-100 text-purple-700',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  posted: 'bg-green-100 text-green-700',
  locked: 'bg-gray-100 text-gray-700',
}

export default function JournalEntriesPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string>()
  const [filterType, setFilterType] = useState<TJournalReferenceType | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { entries, totalCount, isLoading, page, setPage, totalPages } = useJournalEntries({
    referenceType: filterType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

  const { data: detail } = useJournalEntry(selectedId)
  const postEntry = usePostJournalEntry()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{totalCount} entries</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as TJournalReferenceType | '')}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All Types</option>
          <option value="sale">Sales</option>
          <option value="purchase">Purchases</option>
          <option value="manual">Manual</option>
          <option value="void">Void</option>
          <option value="refund">Refund</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
          placeholder="End date"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-2 font-medium">Entry #</th>
              <th className="text-left px-4 py-2 font-medium">Date</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
              <th className="text-left px-4 py-2 font-medium">Type</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-right px-4 py-2 font-medium">Amount</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-48" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-24" /></td>
                  <td />
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No journal entries found
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedId(entry.id)}>
                  <td className="px-4 py-2 font-mono text-xs">{entry.entry_number}</td>
                  <td className="px-4 py-2">{entry.entry_date}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{entry.description}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${REF_TYPE_COLORS[entry.reference_type] || ''}`}>
                      {entry.reference_type}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[entry.status] || ''}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{formatIDR(entry.total_debit)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-200 rounded" title="View">
                        <Eye size={14} />
                      </button>
                      {entry.status === 'draft' && (
                        <button
                          onClick={e => { e.stopPropagation(); postEntry.mutate(entry.id) }}
                          className="p-1 hover:bg-green-100 rounded text-green-600"
                          title="Post"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1 border rounded disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 border rounded disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail drawer */}
      {selectedId && detail && (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-xl border-l z-40 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{detail.entry_number}</h3>
            <button onClick={() => setSelectedId(undefined)} className="p-1 hover:bg-gray-100 rounded">
              &times;
            </button>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span>{detail.entry_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${REF_TYPE_COLORS[detail.reference_type]}`}>
                {detail.reference_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[detail.status]}`}>
                {detail.status}
              </span>
            </div>
            <p className="text-gray-700">{detail.description}</p>

            <table className="w-full text-sm border rounded-lg overflow-hidden mt-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-medium">Account</th>
                  <th className="text-right px-3 py-2 font-medium">Debit</th>
                  <th className="text-right px-3 py-2 font-medium">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {detail.lines.map(line => (
                  <tr key={line.id}>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-gray-500">{line.account?.code}</span>{' '}
                      {line.account?.name}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {line.debit > 0 ? formatIDR(line.debit) : ''}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {line.credit > 0 ? formatIDR(line.credit) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right font-mono">{formatIDR(detail.total_debit)}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatIDR(detail.total_credit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {showForm && <JournalEntryForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
