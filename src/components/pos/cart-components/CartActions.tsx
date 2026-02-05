import { SendHorizontal, CreditCard } from 'lucide-react'

interface CartActionsProps {
    hasLockedItems: boolean
    hasUnlockedItems: boolean
    itemCount: number
    onSendToKitchen?: () => void
    onCheckout: () => void
}

export function CartActions({
    hasLockedItems,
    hasUnlockedItems,
    itemCount,
    onSendToKitchen,
    onCheckout,
}: CartActionsProps) {
    return (
        <div className="pos-cart__buttons">
            <button
                type="button"
                className={`btn ${hasLockedItems ? 'btn-kitchen-add' : 'btn-kitchen'}`}
                onClick={onSendToKitchen}
                disabled={!hasUnlockedItems && itemCount === 0}
            >
                <SendHorizontal size={18} />
                {hasLockedItems ? 'Add to Order' : 'Send to Kitchen'}
            </button>

            <button
                type="button"
                className="btn-checkout"
                onClick={onCheckout}
                disabled={itemCount === 0}
            >
                <CreditCard size={18} />
                CHECKOUT
            </button>
        </div>
    )
}
