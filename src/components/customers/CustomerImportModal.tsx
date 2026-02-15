import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import {
  parseCustomerCsv,
  importCustomerRows,
  type IParsedCustomerRow,
  type ICsvImportResult,
} from '@/services/customers/csvImportService'
import { ImportUploadStep } from './ImportUploadStep'
import { ImportPreviewStep } from './ImportPreviewStep'
import { ImportResultStep } from './ImportResultStep'

interface CustomerImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

type TStep = 'upload' | 'preview' | 'result'

export function CustomerImportModal({ onClose, onSuccess }: CustomerImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<TStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<IParsedCustomerRow[]>([])
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ICsvImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const validCount = rows.filter(r => r.valid).length

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please select a .csv file')
      return
    }
    setFile(f)
    setParseError('')
    setResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseCustomerCsv(e.target?.result as string)
        if (parsed.length === 0) {
          setParseError('No data rows found in CSV')
          return
        }
        setRows(parsed)
        setStep('preview')
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse CSV')
      }
    }
    reader.readAsText(f)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const handleImport = async () => {
    setImporting(true)
    try {
      const res = await importCustomerRows(rows)
      setResult(res)
      setStep('result')
      if (res.imported > 0) onSuccess()
    } catch (err) {
      setResult({
        imported: 0,
        skipped: rows.length,
        errors: [err instanceof Error ? err.message : 'Import failed'],
      })
      setStep('result')
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setRows([])
    setResult(null)
    setParseError('')
    setStep('upload')
    if (fileRef.current) fileRef.current.value = ''
  }

  const invalidCount = rows.filter(r => !r.valid).length

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl w-full max-w-[720px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-display font-bold text-white m-0">
              <FileSpreadsheet size={20} className="text-[var(--color-gold)]" />
              Import Customers
            </h2>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">
              CSV columns: name, phone, email, address, company_name, customer_type
            </p>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--muted-smoke)] hover:bg-white/10 transition-all"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'upload' && (
            <ImportUploadStep
              fileRef={fileRef}
              dragOver={dragOver}
              parseError={parseError}
              onFile={handleFile}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={e => { e.preventDefault(); setDragOver(false) }}
            />
          )}
          {step === 'preview' && (
            <ImportPreviewStep
              rows={rows}
              validCount={validCount}
              invalidCount={invalidCount}
              fileName={file?.name ?? ''}
            />
          )}
          {step === 'result' && result && (
            <ImportResultStep result={result} />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/5 shrink-0">
          {step === 'result' ? (
            <>
              <button
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
                onClick={handleReset}
              >
                Import Another
              </button>
              <button
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all"
                onClick={onClose}
              >
                Done
              </button>
            </>
          ) : step === 'preview' ? (
            <>
              <button
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
                onClick={handleReset}
              >
                Back
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all disabled:opacity-50"
                onClick={handleImport}
                disabled={importing || validCount === 0}
              >
                {importing ? (
                  <><Loader2 size={16} className="animate-spin" /> Importing...</>
                ) : (
                  <><Upload size={16} /> Import {validCount} Customer{validCount !== 1 ? 's' : ''}</>
                )}
              </button>
            </>
          ) : (
            <button
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-transparent border border-white/10 text-white hover:border-white/20 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
