import { Upload, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportUploadStepProps {
  fileRef: React.RefObject<HTMLInputElement | null>
  dragOver: boolean
  parseError: string
  onFile: (f: File) => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
}

export function ImportUploadStep({
  fileRef, dragOver, parseError, onFile, onDrop, onDragOver, onDragLeave,
}: ImportUploadStepProps) {
  return (
    <>
      <div
        className={cn(
          'flex flex-col items-center justify-center py-14 px-8 border-2 border-dashed rounded-xl cursor-pointer transition-all',
          'border-white/10 hover:border-[var(--color-gold)]/40',
          dragOver && 'border-[var(--color-gold)] bg-[var(--color-gold)]/5',
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <Upload size={40} className="text-[var(--muted-smoke)] mb-3" />
        <p className="text-sm font-medium text-white m-0">
          Drag and drop a CSV file here
        </p>
        <p className="text-xs text-[var(--theme-text-muted)] mt-1 m-0">
          or click to browse
        </p>
      </div>
      {parseError && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {parseError}
        </div>
      )}
    </>
  )
}
