import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import type { Insertable } from '../types/database'
import logger from '@/utils/logger'

export function useOrders() {
    const queryClient = useQueryClient()
    const { user, sessionId } = useAuthStore()
    const { items, orderType, tableNumber, customerId, customerName, subtotal, discountType, discountValue, discountAmount, total, clearCart } = useCartStore()

    const createOrderMutation = useMutation({
        mutationFn: async (paymentData: { method: string, cashReceived?: number, changeGiven?: number }) => {
            if (!user) throw new Error('Utilisateur non connecté')

            // 1. Create Order
            const orderData = {
                order_number: `ORD-${Date.now()}`, // Will be overwritten by trigger if setup
                order_type: orderType,
                table_number: tableNumber,
                customer_id: customerId,
                customer_name: customerName,
                status: 'new', // Start as 'new' for KDS workflow (new → preparing → ready → served)
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
                .insert(orderData as Insertable<'orders'>)
                .select()
                .single()

            if (orderError) {
                logger.error('Supabase Order Error:', orderError)
                throw orderError
            }

            // 2. Create Order Items
            const itemsData = items.map(item => ({
                order_id: order.id,
                product_id: item.product?.id || item.combo?.id,
                product_name: item.product?.name || item.combo?.name || 'Unknown',
                product_sku: item.product?.sku || `COMBO-${item.combo?.id?.slice(0, 8) || 'UNKNOWN'}`,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total_price: item.totalPrice,
                modifiers: item.modifiers,
                modifiers_total: item.modifiersTotal,
                notes: item.notes,
                selected_variants: item.selectedVariants ? { variants: item.selectedVariants } : null,
                dispatch_station: (item.product as { category?: { dispatch_station?: string } })?.category?.dispatch_station || 'none',
                item_status: 'new' as const
            })) as unknown as Insertable<'order_items'>[]

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsData)

            if (itemsError) {
                logger.error('Supabase Items Error:', itemsError)
                throw itemsError
            }

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
