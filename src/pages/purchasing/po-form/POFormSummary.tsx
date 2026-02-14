import { Save, Send, Percent } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'

interface IPOFormSummaryProps {
  totals: {
    subtotal: number
    orderDiscount: number
    tax: number
    total: number
  }
  isOnline: boolean
  isSaving: boolean
  onSaveDraft: () => void
  onSaveAndSend: () => void
  onOpenDiscount: () => void
}

export function POFormSummary({
  totals,
  isOnline,
  isSaving,
  onSaveDraft,
  onSaveAndSend,
  onOpenDiscount,
}: IPOFormSummaryProps) {
  return (
    <div className="sticky top-6 max-lg:static">
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-6">
          Summary
        </h3>

        <div className="flex justify-between items-center py-2.5 text-sm text-[var(--theme-text-secondary)]">
          <span>Subtotal</span>
          <span className="font-medium text-white">{formatCurrency(totals.subtotal)}</span>
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 my-2 bg-transparent border border-dashed border-white/10 rounded-xl text-[var(--color-gold)] text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--color-gold)]/5 hover:border-[var(--color-gold)]/30 disabled:opacity-40"
          onClick={onOpenDiscount}
          disabled={!isOnline}
        >
          <Percent size={14} />
          Add Discount
        </button>

        {totals.orderDiscount > 0 && (
          <div className="flex justify-between items-center py-2.5 text-sm text-emerald-400">
            <span>Discount</span>
            <span>-{formatCurrency(totals.orderDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center py-2.5 text-sm text-[var(--theme-text-secondary)]">
          <span>Tax</span>
          <span className="font-medium text-white">{formatCurrency(totals.tax)}</span>
        </div>

        <div className="h-px bg-white/10 my-3"></div>

        <div className="flex justify-between items-center py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-smoke)]">
            Order Total
          </span>
          <span className="text-2xl font-bold text-[var(--color-gold)]">
            {formatCurrency(totals.total)}
          </span>
        </div>

        <div className="flex flex-col gap-3 mt-5">
          <button
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-transparent border border-white/10 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all hover:border-white/20 disabled:opacity-40"
            onClick={onSaveDraft}
            disabled={isSaving || !isOnline}
          >
            <Save size={16} />
            Save as Draft
          </button>
          <button
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black font-bold text-sm uppercase tracking-widest rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-40"
            onClick={onSaveAndSend}
            disabled={isSaving || !isOnline}
          >
            <Send size={16} />
            Send Order Request
          </button>
        </div>
      </div>
    </div>
  )
}
