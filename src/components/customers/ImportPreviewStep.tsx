import { FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IParsedCustomerRow } from '@/services/customers/csvImportService'

interface ImportPreviewStepProps {
  rows: IParsedCustomerRow[]
  validCount: number
  invalidCount: number
  fileName: string
}

const thClass =
  'px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] border-b border-white/5'

export function ImportPreviewStep({ rows, validCount, invalidCount, fileName }: ImportPreviewStepProps) {
  const preview = rows.slice(0, 100)

  return (
    <>
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <span className="text-xs text-[var(--theme-text-muted)]">
          <FileSpreadsheet size={14} className="inline mr-1 -mt-0.5" />
          {fileName} -- {rows.length} row{rows.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-3 text-xs">
          <span className="text-green-400">{validCount} valid</span>
          {invalidCount > 0 && (
            <span className="text-red-400">{invalidCount} invalid</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/5 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-white/[0.03]">
              <th className={thClass}>#</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Error</th>
            </tr>
          </thead>
          <tbody>
            {preview.map(r => (
              <tr
                key={r.row}
                className={cn(
                  'border-b border-white/5 last:border-b-0',
                  !r.valid && 'bg-red-500/5',
                )}
              >
                <td className="px-3 py-2 text-[var(--theme-text-muted)] tabular-nums">{r.row}</td>
                <td className="px-3 py-2">
                  {r.valid
                    ? <CheckCircle size={14} className="text-green-400" />
                    : <AlertTriangle size={14} className="text-red-400" />}
                </td>
                <td className="px-3 py-2 text-white font-medium max-w-[160px] truncate">{r.name || '--'}</td>
                <td className="px-3 py-2 text-[var(--muted-smoke)] max-w-[120px] truncate">{r.phone || '--'}</td>
                <td className="px-3 py-2 text-[var(--muted-smoke)] max-w-[160px] truncate">{r.email || '--'}</td>
                <td className="px-3 py-2 text-[var(--muted-smoke)]">{r.customer_type}</td>
                <td className="px-3 py-2 text-red-400 text-xs max-w-[180px] truncate">{r.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 100 && (
        <p className="text-xs text-[var(--theme-text-muted)] mt-2">
          Showing first 100 of {rows.length} rows
        </p>
      )}
    </>
  )
}
