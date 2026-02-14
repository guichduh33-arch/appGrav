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
  sale: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  purchase: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
  manual: 'bg-white/5 text-white/60 border border-white/10',
  void: 'bg-red-400/10 text-red-400 border border-red-400/20',
  refund: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  adjustment: 'bg-purple-400/10 text-purple-400 border border-purple-400/20',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  posted: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  locked: 'bg-white/5 text-white/60 border border-white/10',
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
        <p className="text-sm text-[var(--theme-text-muted)]">{totalCount} entries</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-[var(--color-gold)] text-black font-bold rounded-xl hover:brightness-110 transition-all"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as TJournalReferenceType | '')}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
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
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          placeholder="End date"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Entry #</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Description</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Type</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Status</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Amount</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-white/5">
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-48" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-3 bg-white/10 rounded w-24" /></td>
                  <td />
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                  No journal entries found
                </td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => setSelectedId(entry.id)}>
                  <td className="px-4 py-2 font-mono text-xs text-[var(--color-gold)]">{entry.entry_number}</td>
                  <td className="px-4 py-2 text-white/80">{entry.entry_date}</td>
                  <td className="px-4 py-2 max-w-xs truncate text-white/80">{entry.description}</td>
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
                  <td className="px-4 py-2 text-right font-mono text-white">{formatIDR(entry.total_debit)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                      {entry.status === 'draft' && (
                        <button
                          onClick={e => { e.stopPropagation(); postEntry.mutate(entry.id) }}
                          className="p-1 hover:bg-emerald-400/10 rounded text-emerald-400"
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
            className="p-1 border border-white/10 rounded-xl text-white/60 hover:border-white/20 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-[var(--theme-text-muted)]">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 border border-white/10 rounded-xl text-white/60 hover:border-white/20 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail drawer */}
      {selectedId && detail && (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-[var(--theme-bg-secondary)] border-l border-white/10 z-40 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className="font-semibold text-[var(--color-gold)]">{detail.entry_number}</h3>
            <button onClick={() => setSelectedId(undefined)} className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors">
              &times;
            </button>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--theme-text-muted)]">Date</span>
              <span className="text-white">{detail.entry_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--theme-text-muted)]">Type</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${REF_TYPE_COLORS[detail.reference_type]}`}>
                {detail.reference_type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--theme-text-muted)]">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[detail.status]}`}>
                {detail.status}
              </span>
            </div>
            <p className="text-white/70">{detail.description}</p>

            <table className="w-full text-sm bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden mt-4">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Account</th>
                  <th className="text-right px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Debit</th>
                  <th className="text-right px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Credit</th>
                </tr>
              </thead>
              <tbody>
                {detail.lines.map(line => (
                  <tr key={line.id} className="border-b border-white/5">
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-[var(--theme-text-muted)]">{line.account?.code}</span>{' '}
                      <span className="text-white/80">{line.account?.name}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-400">
                      {line.debit > 0 ? formatIDR(line.debit) : ''}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-red-400">
                      {line.credit > 0 ? formatIDR(line.credit) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 font-semibold">
                  <td className="px-3 py-2 text-white">Total</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-400">{formatIDR(detail.total_debit)}</td>
                  <td className="px-3 py-2 text-right font-mono text-red-400">{formatIDR(detail.total_credit)}</td>
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
