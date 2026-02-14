interface B2BOrderFormNotesProps {
    notes: string
    internalNotes: string
    onNotesChange: (value: string) => void
    onInternalNotesChange: (value: string) => void
}

const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none resize-none'
const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]'

export default function B2BOrderFormNotes({
    notes,
    internalNotes,
    onNotesChange,
    onInternalNotesChange,
}: B2BOrderFormNotesProps) {
    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Notes</h2>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>Notes (visible on purchase order)</label>
                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="Notes for the customer..."
                        className={inputClass}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Internal notes</label>
                    <textarea
                        rows={3}
                        value={internalNotes}
                        onChange={(e) => onInternalNotesChange(e.target.value)}
                        placeholder="Internal notes (not visible to customer)..."
                        className={inputClass}
                    />
                </div>
            </div>
        </div>
    )
}
