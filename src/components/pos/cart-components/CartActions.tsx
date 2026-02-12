import { memo } from 'react'
import { SendHorizontal, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CartActionsProps {
    hasLockedItems: boolean
    hasUnlockedItems: boolean
    itemCount: number
    onSendToKitchen?: () => void
    onCheckout: () => void
}

export const CartActions = memo(function CartActions({
    hasLockedItems,
    hasUnlockedItems,
    itemCount,
    onSendToKitchen,
    onCheckout,
}: CartActionsProps) {
    return (
        <div className="p-md bg-zinc-800 grid grid-cols-2 gap-2 border-t border-zinc-700">
            <button
                type="button"
                className={cn(
                    'w-full h-[52px] text-white border-none rounded-lg text-base font-bold cursor-pointer flex items-center justify-center gap-2 p-2 transition-all duration-200',
                    hasLockedItems ? 'bg-warning' : 'bg-success',
                    'hover:enabled:-translate-y-0.5 hover:enabled:shadow-md',
                    'disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:translate-y-0'
                )}
                onClick={onSendToKitchen}
                disabled={!hasUnlockedItems && itemCount === 0}
            >
                <SendHorizontal size={18} />
                {hasLockedItems ? 'Add to Order' : 'Send to Kitchen'}
            </button>

            <button
                type="button"
                className={cn(
                    'w-full h-[52px] bg-gold text-white border-none rounded-lg text-base font-bold cursor-pointer flex items-center justify-center gap-2 p-2 transition-all duration-200',
                    'hover:enabled:bg-gold-light hover:enabled:-translate-y-0.5 hover:enabled:shadow-md',
                    'disabled:bg-zinc-600 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:translate-y-0'
                )}
                onClick={onCheckout}
                disabled={itemCount === 0}
            >
                <CreditCard size={18} />
                CHECKOUT
            </button>
        </div>
    )
})
