/**
 * Stock Reservation Service
 * Epic 10: Story 10.3
 *
 * Manages stock reservations for B2B orders
 */

import { supabase, untypedRpc } from '@/lib/supabase'
import { logError } from '@/utils/logger'

export interface IStockReservation {
    id: string
    product_id: string
    product_name?: string
    customer_id: string
    customer_name?: string
    order_id: string | null
    b2b_order_id: string | null
    quantity: number
    reserved_until: string
    status: 'active' | 'fulfilled' | 'cancelled' | 'expired'
    notes: string | null
    created_at: string
}

// Story 10.3: Get active reservations
export async function getActiveReservations(productId?: string): Promise<IStockReservation[]> {
    let query = supabase
        .from('stock_reservations')
        .select(`
            *,
            product:products(name),
            customer:customers(name)
        `)
        .eq('status', 'active')
        .gt('reserved_until', new Date().toISOString())
        .order('reserved_until', { ascending: true })

    if (productId) {
        query = query.eq('product_id', productId)
    }

    const { data, error } = await query

    if (error) {
        logError('Error fetching reservations:', error)
        return []
    }

    return (data || []).map((r: Record<string, unknown>) => ({
        ...r,
        product_name: (r.product as Record<string, string>)?.name,
        customer_name: (r.customer as Record<string, string>)?.name
    })) as IStockReservation[]
}

// Story 10.3: Get available stock (minus reservations)
export async function getAvailableStock(productId: string): Promise<number> {
    // Try to use RPC if available, otherwise calculate manually
    const { data: rpcData, error: rpcError } = await untypedRpc('get_available_stock', { p_product_id: productId }) as { data: number | null; error: unknown }

    if (!rpcError && rpcData !== null) {
        return rpcData
    }

    // Fallback: get current_stock and subtract active reservations
    const { data: product } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', productId)
        .single()

    const currentStock = product?.current_stock || 0

    // Get active reservations for this product
    const { data: reservations } = await supabase
        .from('stock_reservations')
        .select('quantity')
        .eq('product_id', productId)
        .eq('status', 'active')
        .gt('reserved_until', new Date().toISOString())

    const reservedQty = (reservations || []).reduce((sum, r) => sum + r.quantity, 0)

    return Math.max(0, currentStock - reservedQty)
}

// Story 10.3: Create stock reservation
export async function createReservation(params: {
    productId: string
    customerId: string
    quantity: number
    reservedUntil: Date
    orderId?: string
    b2bOrderId?: string
    notes?: string
}): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    // Check available stock
    const availableStock = await getAvailableStock(params.productId)

    if (params.quantity > availableStock) {
        return {
            success: false,
            error: `Stock insuffisant. Disponible: ${availableStock}`
        }
    }

    const { data, error } = await supabase
        .from('stock_reservations')
        .insert({
            product_id: params.productId,
            customer_id: params.customerId,
            order_id: params.orderId || null,
            b2b_order_id: params.b2bOrderId || null,
            quantity: params.quantity,
            reserved_until: params.reservedUntil.toISOString(),
            status: 'active',
            notes: params.notes || null,
            created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, reservationId: data.id }
}

// Story 10.3: Fulfill reservation (when order is completed)
export async function fulfillReservation(
    reservationId: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('stock_reservations')
        .update({ status: 'fulfilled' })
        .eq('id', reservationId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Story 10.3: Cancel reservation
export async function cancelReservation(
    reservationId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('stock_reservations')
        .update({
            status: 'cancelled',
            notes: reason || 'Cancelled'
        })
        .eq('id', reservationId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Story 10.3: Expire old reservations (run periodically)
export async function expireOldReservations(): Promise<number> {
    const { data, error } = await supabase
        .from('stock_reservations')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('reserved_until', new Date().toISOString())
        .select('id')

    if (error) {
        logError('Error expiring reservations:', error)
        return 0
    }

    return data?.length || 0
}

// Story 10.3: Get reservation summary for a customer
export async function getCustomerReservations(
    customerId: string
): Promise<{
    activeCount: number
    totalReserved: number
    reservations: IStockReservation[]
}> {
    const reservations = await getActiveReservations()
    const customerReservations = reservations.filter(r => r.customer_id === customerId)

    return {
        activeCount: customerReservations.length,
        totalReserved: customerReservations.reduce((sum, r) => sum + r.quantity, 0),
        reservations: customerReservations
    }
}
