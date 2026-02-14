import { DollarSign, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'

interface PricingSectionProps {
    salePrice: number
    wholesalePrice: number
    costPrice: number
    errors: Record<string, string>
    onChange: (updates: { sale_price?: number; wholesale_price?: number; cost_price?: number }) => void
}

const INPUT_CLASS = "w-full py-3 pl-10 pr-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none transition-all focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
const LABEL_CLASS = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"

export default function PricingSection({ salePrice, wholesalePrice, costPrice, errors, onChange }: PricingSectionProps) {
    const margin = costPrice > 0 && salePrice > 0
        ? ((salePrice - costPrice) / salePrice) * 100
        : 0

    return (
        <section className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-white/5 text-white">
                <DollarSign size={20} className="text-[var(--color-gold)]" /> Price
            </h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Retail price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-sm">Rp</span>
                        <input
                            type="number"
                            value={salePrice}
                            onChange={e => onChange({ sale_price: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="100"
                            className={cn(INPUT_CLASS, errors.sale_price && 'border-red-500/50')}
                        />
                    </div>
                    <small className="text-[var(--theme-text-muted)] text-xs mt-1">{formatCurrency(salePrice)}</small>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Wholesale price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-sm">Rp</span>
                        <input
                            type="number"
                            value={wholesalePrice}
                            onChange={e => onChange({ wholesale_price: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="100"
                            className={INPUT_CLASS}
                        />
                    </div>
                    <small className="text-[var(--theme-text-muted)] text-xs mt-1">{formatCurrency(wholesalePrice)}</small>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL_CLASS}>Cost price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-sm">Rp</span>
                        <input
                            type="number"
                            value={costPrice}
                            onChange={e => onChange({ cost_price: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="100"
                            className={cn(INPUT_CLASS, errors.cost_price && 'border-red-500/50')}
                        />
                    </div>
                    <small className="text-[var(--theme-text-muted)] text-xs mt-1">{formatCurrency(costPrice)}</small>
                </div>
            </div>

            {costPrice > 0 && salePrice > 0 && (
                <div className="flex items-center gap-3 px-5 py-4 mt-6 bg-emerald-500/10 rounded-xl text-emerald-400 font-medium border border-emerald-500/20">
                    <Tag size={18} className="text-emerald-400" />
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">Margin: {margin.toFixed(1)}%</span>
                        <span className="text-[var(--theme-text-muted)] text-sm">
                            ({formatCurrency(salePrice - costPrice)})
                        </span>
                    </div>
                </div>
            )}
        </section>
    )
}
