/**
 * JournalEntryForm - Manual journal entry creation (Epic 9 - Story 9.4)
 */

import { useState, useRef } from 'react'
import { X, Plus, AlertCircle, Paperclip, Trash2 } from 'lucide-react'
import { useCreateJournalEntry } from '@/hooks/accounting'
import { useFiscalPeriods } from '@/hooks/accounting'
import { validateJournalEntry } from '@/services/accounting/journalEntryValidation'
import { calculateLineTotals } from '@/services/accounting/accountingService'
import { supabase } from '@/lib/supabase'
import { JournalLineTable } from './JournalLineTable'
import type { IJournalLineInput } from '@/types/accounting'

interface JournalEntryFormProps {
  onClose: () => void
}

const emptyLine = (): IJournalLineInput => ({
  account_id: '',
  debit: 0,
  credit: 0,
  description: '',
})

export function JournalEntryForm({ onClose }: JournalEntryFormProps) {
  const createEntry = useCreateJournalEntry()
  const { periods } = useFiscalPeriods()
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<IJournalLineInput[]>([emptyLine(), emptyLine()])
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([])
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { totalDebit, totalCredit, difference } = calculateLineTotals(lines)

  const addLine = () => setLines([...lines, emptyLine()])

  const removeLine = (index: number) => {
    if (lines.length <= 2) return
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, updates: Partial<IJournalLineInput>) => {
    setLines(lines.map((line, i) => (i === index ? { ...line, ...updates } : line)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateJournalEntry(entryDate, description, lines, periods)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    let attachment_url: string | null = null

    if (attachmentFile) {
      const ext = attachmentFile.name.split('.').pop()
      const path = `journal-attachments/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, attachmentFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
        attachment_url = urlData.publicUrl
      }
    }

    createEntry.mutate(
      { entry_date: entryDate, description, lines, attachment_url },
      { onSuccess: () => onClose() }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">New Journal Entry</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                placeholder="Entry description"
              />
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Attachment</label>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
              onChange={e => { if (e.target.files?.[0]) setAttachmentFile(e.target.files[0]) }} />
            {attachmentFile ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white">
                <Paperclip size={14} className="text-[var(--color-gold)]" />
                <span className="flex-1 truncate">{attachmentFile.name}</span>
                <button type="button" onClick={() => { setAttachmentFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-dashed border-white/10 rounded-xl text-sm text-[var(--theme-text-muted)] hover:border-[var(--color-gold)]/30 hover:text-white transition-all">
                <Paperclip size={14} /> Attach receipt or invoice (PDF, image)
              </button>
            )}
          </div>

          <JournalLineTable
            lines={lines}
            onUpdateLine={updateLine}
            onRemoveLine={removeLine}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-sm text-[var(--color-gold)] hover:brightness-125 transition-all"
            >
              <Plus size={16} /> Add Line
            </button>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/70">Debit: <strong className="text-emerald-400">{totalDebit.toLocaleString()}</strong></span>
              <span className="text-white/70">Credit: <strong className="text-red-400">{totalCredit.toLocaleString()}</strong></span>
              <span className={Math.abs(difference) < 0.01 ? 'text-emerald-400' : 'text-red-400'}>
                Diff: {difference.toLocaleString()}
              </span>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3 space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={14} />
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEntry.isPending}
              className="px-4 py-2 text-sm bg-[var(--color-gold)] text-black font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {createEntry.isPending ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
