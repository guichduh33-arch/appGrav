import { memo } from 'react'
import type { ProductCombo } from '../../types/database'
import { formatPrice } from '../../utils/helpers'

interface ComboGridProps {
    combos: ProductCombo[]
    onComboClick: (combo: ProductCombo) => void
    isLoading?: boolean
}

export default memo(function ComboGrid({ combos, onComboClick, isLoading }: ComboGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-8 w-full pb-xl">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-[200px] bg-[var(--color-gray-100)] rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (combos.length === 0) return null

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-8 w-full pb-xl">
            {combos.map((combo) => (
                <button
                    key={combo.id}
                    className="relative flex flex-col bg-[var(--color-gray-700)] border border-primary rounded-xl p-0 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden h-full text-left hover:-translate-y-1 hover:shadow-lg hover:bg-[var(--color-gray-600)] active:scale-[0.98]"
                    onClick={() => onComboClick(combo)}
                >
                    <div className="absolute top-2 right-2 py-[3px] px-2 bg-primary text-white text-[10px] font-bold rounded-full z-[2] pointer-events-none uppercase tracking-[0.5px]">
                        Combo
                    </div>
                    <div className="w-full h-[80px] bg-[var(--color-gray-800)] flex items-center justify-center overflow-hidden shrink-0">
                        <span className="text-[28px] block">
                            🎁
                        </span>
                    </div>
                    <div className="px-4 pt-4 pb-1 text-[1.3rem] font-bold text-white leading-tight line-clamp-3 flex-1">
                        {combo.name}
                    </div>
                    <div className="px-4 pt-1 pb-4 text-base font-bold text-primary-light">
                        {formatPrice(combo.combo_price)}
                    </div>
                </button>
            ))}
        </div>
    )
})
