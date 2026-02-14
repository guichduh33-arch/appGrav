import { cn } from '@/lib/utils'
import { Percent, Save, Send } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

interface Totals {
    subtotal: number
    discountAmount: number
    taxAmount: number
    total: number
}

interface B2BOrderFormSidebarProps {
    totals: Totals
    discountType: '' | 'percentage' | 'fixed'
    discountValue: number
    taxRate: number
    saving: boolean
    onDiscountTypeChange: (type: '' | 'percentage' | 'fixed') => void
    onDiscountValueChange: (value: number) => void
    onSaveDraft: () => void
    onConfirm: () => void
}

export default function B2BOrderFormSidebar({
    totals,
    discountType,
    discountValue,
    taxRate,
    saving,
    onDiscountTypeChange,
    onDiscountValueChange,
    onSaveDraft,
    onConfirm,
}: B2BOrderFormSidebarProps) {
    return (
        <div className="sticky top-6 max-md:static">
            <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Summary</h3>

                <div className="flex justify-between items-center py-2.5 text-sm text-[var(--theme-text-muted)]">
                    <span>Subtotal</span>
                    <span className="text-white">{formatCurrency(totals.subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="flex flex-col gap-2.5 py-2.5">
                    <div className="flex gap-2">
                        <button
                            className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs font-medium text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
                                discountType === 'percentage' && 'bg-[var(--color-gold)] border-[var(--color-gold)] text-black'
                            )}
                            onClick={() => onDiscountTypeChange('percentage')}
                        >
                            <Percent size={14} />
                            %
                        </button>
                        <button
                            className={cn(
                                'inline-flex items-center gap-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs font-medium text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
                                discountType === 'fixed' && 'bg-[var(--color-gold)] border-[var(--color-gold)] text-black'
                            )}
                            onClick={() => onDiscountTypeChange('fixed')}
                        >
                            Fixed
                        </button>
                        {discountType && (
                            <button
                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs font-medium text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-red-500/50 hover:text-red-400"
                                onClick={() => {
                                    onDiscountTypeChange('')
                                    onDiscountValueChange(0)
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    {discountType && (
                        <input
                            type="number"
                            min="0"
                            value={discountValue}
                            onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
                            placeholder={discountType === 'percentage' ? '% discount' : 'Amount'}
                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                        />
                    )}
                </div>

                {totals.discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2.5 text-sm text-emerald-400">
                        <span>Discount</span>
                        <span>-{formatCurrency(totals.discountAmount)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center py-2.5 text-sm text-[var(--theme-text-muted)]">
                    <span>Tax ({taxRate}%)</span>
                    <span className="text-white">{formatCurrency(totals.taxAmount)}</span>
                </div>

                <div className="h-px bg-white/5 my-4"></div>

                <div className="flex justify-between items-center text-xl font-bold text-[var(--color-gold)] py-2.5">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total)}</span>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <button
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20 disabled:opacity-50"
                        onClick={onSaveDraft}
                        disabled={saving}
                    >
                        <Save size={18} />
                        Save Draft
                    </button>
                    <button
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110 disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={saving}
                    >
                        <Send size={18} />
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    )
}
