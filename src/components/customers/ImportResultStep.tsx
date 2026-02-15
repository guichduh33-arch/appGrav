import { CheckCircle } from 'lucide-react'
import type { ICsvImportResult } from '@/services/customers/csvImportService'

interface ImportResultStepProps {
  result: ICsvImportResult
}

export function ImportResultStep({ result }: ImportResultStepProps) {
  return (
    <div className="space-y-5">
      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <span className="text-2xl font-bold text-green-400">{result.imported}</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] mt-1">Imported</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-2xl font-bold text-yellow-400">{result.skipped}</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] mt-1">Skipped</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <span className="text-2xl font-bold text-red-400">{result.errors.length}</span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] mt-1">Errors</span>
        </div>
      </div>

      {/* Error list */}
      {result.errors.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
          <h4 className="text-sm font-bold text-red-400 mb-2">Error Details</h4>
          <ul className="list-none m-0 p-0 space-y-1 max-h-[180px] overflow-y-auto">
            {result.errors.map((err, i) => (
              <li key={i} className="text-xs text-red-300">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {result.imported > 0 && result.errors.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <CheckCircle size={16} />
          All customers imported successfully
        </div>
      )}
    </div>
  )
}
