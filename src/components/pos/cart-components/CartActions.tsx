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
        <div className="p-md bg-zinc-800 flex flex-col gap-2 border-t border-zinc-700">
            <button
                type="button"
                className={cn(
                    'w-full h-[44px] text-white rounded-lg text-sm font-bold cursor-pointer flex items-center justify-center gap-2 px-3 transition-all duration-200',
                    'border border-zinc-600 bg-zinc-700',
                    'hover:enabled:bg-zinc-600 hover:enabled:border-zinc-500',
                    hasLockedItems && 'border-warning/50 text-warning',
                    'disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:border-zinc-600'
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
                    'w-full h-[56px] text-white border-none rounded-lg text-lg font-bold cursor-pointer flex items-center justify-center gap-3 px-4 transition-all duration-200',
                    'bg-gradient-to-r from-gold-dark via-gold to-gold-light',
                    'hover:enabled:shadow-[0_4px_20px_rgba(201,165,92,0.4)] hover:enabled:-translate-y-0.5',
                    'disabled:bg-zinc-600 disabled:bg-none disabled:text-zinc-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none'
                )}
                onClick={onCheckout}
                disabled={itemCount === 0}
            >
                <CreditCard size={20} />
                PAY {itemCount > 0 && <span className="mx-1">·</span>}
                {itemCount > 0 && formatPrice(total)}
            </button>
        </div>
    )
})
