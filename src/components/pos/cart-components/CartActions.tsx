import { memo } from 'react'
import { SendHorizontal, CreditCard, Receipt, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/utils/helpers'

interface CartActionsProps {
    hasLockedItems: boolean
    hasUnlockedItems: boolean
    itemCount: number
    total: number
    onSendToKitchen?: () => void
    onCheckout: () => void
}

export const CartActions = memo(function CartActions({
    hasLockedItems,
    hasUnlockedItems,
    itemCount,
    total,
    onSendToKitchen,
    onCheckout,
}: CartActionsProps) {
    return (
        <div className="p-8 bg-[#161618] flex flex-col gap-3 border-t border-white/5">
            {/* Send to Kitchen */}
            <button
                type="button"
                className={cn(
                    'w-full py-3 text-white rounded-xl text-[10px] uppercase font-bold tracking-[0.15em] cursor-pointer flex items-center justify-center gap-2 px-3 transition-all duration-300',
                    'border border-white/10 bg-transparent',
                    'hover:enabled:bg-white/5 hover:enabled:border-white/20',
                    hasLockedItems && 'border-warning/30 text-warning',
                    'disabled:text-zinc-600 disabled:cursor-not-allowed disabled:border-white/5'
                )}
                onClick={onSendToKitchen}
                disabled={!hasUnlockedItems && itemCount === 0}
            >
                <SendHorizontal size={14} strokeWidth={2.5} />
                {hasLockedItems ? 'Update current order' : 'Send to Kitchen'}
            </button>

            {/* Receipt / Promo utility row */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    className="py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center justify-center gap-2 border border-white/10 bg-transparent text-[#8E8E93] hover:text-white hover:border-white/20 transition-all"
                >
                    <Receipt size={14} />
                    Receipt
                </button>
                <button
                    type="button"
                    className="py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest cursor-pointer flex items-center justify-center gap-2 border border-white/10 bg-transparent text-[#8E8E93] hover:text-white hover:border-white/20 transition-all"
                >
                    <Tag size={14} />
                    Promo
                </button>
            </div>

            {/* Checkout CTA */}
            <button
                type="button"
                className={cn(
                    'w-full py-5 text-black border-none rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-3 px-4 transition-all duration-500 uppercase tracking-[0.25em] relative overflow-hidden',
                    'bg-[var(--color-gold)] shadow-2xl shadow-[var(--color-gold)]/20',
                    'hover:enabled:brightness-110 hover:enabled:-translate-y-0.5',
                    'active:enabled:translate-y-0 active:enabled:scale-[0.98]',
                    'disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed disabled:shadow-none'
                )}
                onClick={onCheckout}
                disabled={itemCount === 0}
            >
                <CreditCard size={16} strokeWidth={2.5} />
                Checkout {itemCount > 0 && <span className="opacity-40">·</span>}
                {itemCount > 0 && formatPrice(total)}
            </button>
        </div>
    )
})
