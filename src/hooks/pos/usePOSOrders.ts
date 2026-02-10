import { useCallback } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'

export interface IUsePOSOrdersReturn {
    handleSendToKitchen: (hasOpenShift: boolean, onNoShift: () => void) => void
    handleRestoreHeldOrder: (heldOrderId: string, onSuccess?: () => void) => void
}

/**
 * Hook to manage POS order operations (send to kitchen, hold, restore)
 * Extracts order logic from POSMainPage for better separation of concerns
 */
export function usePOSOrders(): IUsePOSOrdersReturn {
    const {
        items,
        itemCount,
        clearCart,
        activeOrderId,
        activeOrderNumber,
        restoreCartState,
        subtotal,
        discountAmount,
        total,
        orderType,
        tableNumber,
        customerId,
        customerName,
    } = useCartStore()

    const {
        restoreHeldOrder,
        sendToKitchenAsHeldOrder,
        holdOrder,
    } = useOrderStore()

    // Handle send to kitchen - creates or updates a held order and clears the cart
    const handleSendToKitchen = useCallback((
        hasOpenShift: boolean,
        onNoShift: () => void
    ) => {
        if (!hasOpenShift) {
            onNoShift()
            return
        }
        if (itemCount === 0) {
            toast.error('No items to send')
            return
        }

        if (activeOrderId) {
            // Update existing kitchen order (handles cases where order was restored/removed)
            const heldOrder = holdOrder(
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total,
                'En cuisine',
                activeOrderNumber || undefined,
                activeOrderId,
                true, // sentToKitchen
                items.map(i => i.id) // lock all items
            )
            toast.success(`Order ${heldOrder.orderNumber} updated successfully!`)
        } else {
            // Create new kitchen order
            const heldOrder = sendToKitchenAsHeldOrder(
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total
            )
            toast.success(`Order ${heldOrder.orderNumber} sent to kitchen!`)
        }

        // Clear the cart after sending
        clearCart()
    }, [
        itemCount,
        activeOrderId,
        activeOrderNumber,
        items,
        subtotal,
        discountAmount,
        total,
        orderType,
        tableNumber,
        customerId,
        customerName,
        holdOrder,
        sendToKitchenAsHeldOrder,
        clearCart,
    ])

    // Handle restore held order
    const handleRestoreHeldOrder = useCallback((
        heldOrderId: string,
        onSuccess?: () => void
    ) => {
        const heldOrder = restoreHeldOrder(heldOrderId)
        if (heldOrder) {
            // Restore items to cart with full state (including locks and active order ID)
            restoreCartState(
                heldOrder.items,
                heldOrder.lockedItemIds || [],
                heldOrder.sentToKitchen ? heldOrder.id : null,
                heldOrder.orderNumber
            )

            onSuccess?.()
            toast.success(`Order ${heldOrder.orderNumber} restored`)
        }
    }, [restoreHeldOrder, restoreCartState])

    return {
        handleSendToKitchen,
        handleRestoreHeldOrder,
    }
}
