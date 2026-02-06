/**
 * B2B POS Order Service (Story 6.7)
 *
 * Bridges POS orders to B2B orders when store credit payment is used.
 * Creates a b2b_orders record and updates customer credit balance.
 */

import { supabase } from '@/lib/supabase'
import { addToCustomerBalance } from './creditService'
import type { CartItem } from '@/stores/cartStore'

export interface IB2BPosOrderInput {
    customerId: string
    customerName: string
    items: CartItem[]
    subtotal: number
    discountAmount: number
    total: number
    orderNotes: string
    createdBy: string
    posOrderId?: string // Link to the POS order to prevent double-counting in reports
}

export interface IB2BPosOrderResult {
    success: boolean
    orderId?: string
    orderNumber?: string
    error?: string
}

/**
 * Generate next B2B order number with timestamp suffix to avoid race conditions.
 * Two terminals creating orders simultaneously will get unique numbers.
 */
async function getNextOrderNumber(): Promise<string> {
    const { data } = await supabase
        .from('b2b_orders')
        .select('order_number')
        .like('order_number', 'B2B-%')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    let nextNum = 1
    if (data?.order_number) {
        const match = data.order_number.match(/B2B-(\d+)/)
        if (match) {
            nextNum = parseInt(match[1]) + 1
        }
    }

    // Add a short random suffix to prevent collisions between concurrent terminals
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `B2B-${String(nextNum).padStart(5, '0')}-${suffix}`
}

/**
 * Create a B2B order from POS cart using store credit
 */
export async function createB2BPosOrder(input: IB2BPosOrderInput): Promise<IB2BPosOrderResult> {
    try {
        // Check customer credit
        const { data: customer } = await supabase
            .from('customers')
            .select('credit_limit, credit_balance, credit_status, payment_terms_days')
            .eq('id', input.customerId)
            .single()

        if (!customer) {
            return { success: false, error: 'Customer not found' }
        }

        if (customer.credit_status !== 'approved') {
            return { success: false, error: 'Customer credit not approved. Contact manager.' }
        }

        const availableCredit = (customer.credit_limit || 0) - (customer.credit_balance || 0)
        if (input.total > availableCredit) {
            return {
                success: false,
                error: `Insufficient credit. Available: Rp ${availableCredit.toLocaleString()}, Required: Rp ${input.total.toLocaleString()}`
            }
        }

        const orderNumber = await getNextOrderNumber()
        const paymentTermsDays = customer.payment_terms_days || 30
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + paymentTermsDays)

        // Create B2B order
        const { data: order, error: orderError } = await supabase
            .from('b2b_orders')
            .insert({
                order_number: orderNumber,
                customer_id: input.customerId,
                order_date: new Date().toISOString(),
                status: 'confirmed',
                subtotal: input.subtotal,
                discount_amount: input.discountAmount,
                tax_rate: 0.10,
                tax_amount: Math.round(input.total * 10 / 110),
                total: input.total,
                paid_amount: 0,
                amount_due: input.total,
                payment_status: 'unpaid',
                payment_method: 'credit',
                delivery_date: dueDate.toISOString(),
                notes: input.posOrderId
                    ? `POS Credit Order (ref: ${input.posOrderId})`
                    : input.orderNotes || `POS order - Store Credit`,
                created_by: input.createdBy,
            })
            .select('id, order_number')
            .single()

        if (orderError) {
            return { success: false, error: orderError.message }
        }

        // Create B2B order items
        const orderItems = input.items.map(item => ({
            order_id: order.id,
            product_id: item.type === 'combo' ? null : item.product?.id || null,
            product_name: item.type === 'combo' ? item.combo?.name || 'Combo' : item.product?.name || 'Unknown',
            product_sku: item.type === 'combo' ? null : item.product?.sku || null,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            discount_percent: 0,
            discount_amount: 0,
            total: item.totalPrice,
            notes: item.notes || null,
        }))

        const { error: itemsError } = await supabase
            .from('b2b_order_items')
            .insert(orderItems)

        if (itemsError) {
            console.error('Error creating B2B order items:', itemsError)
        }

        // Update customer credit balance
        const creditResult = await addToCustomerBalance(input.customerId, input.total)
        if (!creditResult.success) {
            console.error('Error updating credit balance:', creditResult.error)
        }

        return {
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
        }
    } catch (err) {
        console.error('Error creating B2B POS order:', err)
        return { success: false, error: 'Failed to create B2B order' }
    }
}

/**
 * Check if customer has sufficient credit for the given amount
 */
export async function checkCustomerCredit(customerId: string, amount: number): Promise<{
    hasCredit: boolean
    availableCredit: number
    creditStatus: string
}> {
    const { data: customer } = await supabase
        .from('customers')
        .select('credit_limit, credit_balance, credit_status')
        .eq('id', customerId)
        .single()

    if (!customer) {
        return { hasCredit: false, availableCredit: 0, creditStatus: 'none' }
    }

    const availableCredit = (customer.credit_limit || 0) - (customer.credit_balance || 0)

    return {
        hasCredit: customer.credit_status === 'approved' && availableCredit >= amount,
        availableCredit,
        creditStatus: customer.credit_status || 'none',
    }
}
