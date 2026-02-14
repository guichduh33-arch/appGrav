import { Tag } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'

interface ComboFormPricePreviewProps {
    minPrice: number
    maxPrice: number
}

export default function ComboFormPricePreview({ minPrice, maxPrice }: ComboFormPricePreviewProps) {
    return (
        <div className="bg-[var(--onyx-surface)] rounded-xl p-8 border border-[var(--color-gold)]/20 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="font-display font-bold text-[var(--color-gold)] uppercase tracking-widest text-[0.7rem] mb-6 flex items-center gap-2">
                <Tag size={14} /> Price Preview
            </h3>
            <div className="grid grid-cols-2 gap-8 max-md:grid-cols-1">
                <div className="flex flex-col gap-1">
                    <span className="text-[var(--theme-text-muted)] text-[0.65rem] uppercase tracking-widest font-bold">Minimum Price</span>
                    <span className="text-3xl font-display font-bold text-white">{formatCurrency(minPrice)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[var(--theme-text-muted)] text-[0.65rem] uppercase tracking-widest font-bold">Maximum Price</span>
                    <span className="text-3xl font-display font-bold text-[var(--color-gold)]">{formatCurrency(maxPrice)}</span>
                </div>
            </div>
        </div>
    )
}
