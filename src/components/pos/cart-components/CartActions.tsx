import { memo } from 'react'
import { SendHorizontal, CreditCard } from 'lucide-react'
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
        <div className="p-8 bg-black/20 flex flex-col gap-3 border-t border-[var(--color-gold)]/20">
            <button
                type="button"
                className={cn(
                    'w-full py-3 text-white rounded-lg text-xs font-medium cursor-pointer flex items-center justify-center gap-2 px-3 transition-all duration-200',
                    'border border-white/10 bg-transparent',
                    'hover:enabled:bg-white/5 hover:enabled:border-white/20',
                    hasLockedItems && 'border-warning/50 text-warning',
                    'disabled:text-zinc-500 disabled:cursor-not-allowed disabled:border-zinc-700'
                )}
                onClick={onSendToKitchen}
                disabled={!hasUnlockedItems && itemCount === 0}
            >
                <SendHorizontal size={16} />
                {hasLockedItems ? 'Add to Order' : 'Send to Kitchen'}
            </button>

            <button
                type="button"
                className={cn(
                    'w-full py-4 text-black border-none rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-3 px-4 transition-all duration-200 uppercase tracking-[0.2em]',
                    'bg-[var(--color-gold)] shadow-xl shadow-[var(--color-gold)]/10',
                    'hover:enabled:brightness-110 hover:enabled:shadow-[0_4px_20px_rgba(201,165,92,0.3)]',
                    'active:enabled:scale-[0.98]',
                    'disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:shadow-none'
                )}
                onClick={onCheckout}
                disabled={itemCount === 0}
            >
                <CreditCard size={18} />
                CHECKOUT {itemCount > 0 && <span className="mx-1">·</span>}
                {itemCount > 0 && formatPrice(total)}
            </button>
        </div>
    )
})
