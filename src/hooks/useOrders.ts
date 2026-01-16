import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

export function useOrders() {
    const queryClient = useQueryClient()
    const { user, sessionId } = useAuthStore()
    const { items, orderType, tableNumber, customerId, customerName, subtotal, discountType, discountValue, discountAmount, total, clearCart } = useCartStore()

    const createOrderMutation = useMutation({
        mutationFn: async (paymentData: { method: any, cashReceived?: number, changeGiven?: number }) => {
            if (!user) throw new Error('Utilisateur non connecté')

            // 1. Create Order
            const orderData = {
                order_number: `ORD-${Date.now()}`, // Will be overwritten by trigger if setup
                order_type: orderType,
                table_number: tableNumber,
                customer_id: customerId,
                customer_name: customerName,
                status: 'completed', // For POS, usually completed immediately on payment
                payment_status: 'paid',
                subtotal: subtotal,
                discount_type: discountType === 'percent' ? 'percentage' : (discountType === 'amount' ? 'fixed' : null),
                discount_value: discountValue,
                discount_amount: discountAmount,
                total: total,
                payment_method: paymentData.method,
                cash_received: paymentData.cashReceived,
                change_given: paymentData.changeGiven,
                staff_id: user.id,
                session_id: sessionId,
                completed_at: new Date().toISOString()
            }

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderData as any)
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create Order Items
            const itemsData = items.map(item => ({
                order_id: (order as any).id,
                product_id: item.product.id,
                product_name: item.product.name,
                product_sku: item.product.sku,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice,
                modifiers: item.modifiers as any,
                modifiers_total: item.modifiersTotal,
                notes: item.notes,
                dispatch_station: (item.product as any).category?.dispatch_station || 'none',
                item_status: 'new'
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsData as any)

            if (itemsError) throw itemsError

            return order
        },
        onSuccess: () => {
            clearCart()
            queryClient.invalidateQueries({ queryKey: ['products'] }) // Refresh stock
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        }
    })

    return {
        createOrder: createOrderMutation.mutateAsync,
        isCreating: createOrderMutation.isPending,
        error: createOrderMutation.error
    }
}
