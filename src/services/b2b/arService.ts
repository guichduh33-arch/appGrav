/**
 * Accounts Receivable Service (Story 6.8)
 *
 * Handles FIFO payment allocation, aging reports, and CSV export
 * for B2B outstanding orders.
 */

import { supabase } from '@/lib/supabase'
import { logError } from '@/utils/logger'

export interface IOutstandingOrder {
    id: string
    order_number: string
    customer_id: string
    customer_name: string
    company_name: string | null
    total: number
    paid_amount: number
    amount_due: number
    due_date: string | null
    order_date: string
    payment_status: string
    days_overdue: number
}

export interface IAgingBucket {
    label: string
    minDays: number
    maxDays: number | null
    orders: IOutstandingOrder[]
    totalDue: number
    count: number
}

export interface IAgingReport {
    buckets: IAgingBucket[]
    totalOutstanding: number
    totalOrders: number
    generatedAt: string
}

export interface IFIFOAllocationResult {
    allocations: Array<{
        orderId: string
        orderNumber: string
        allocatedAmount: number
        newPaidAmount: number
        isFullyPaid: boolean
    }>
    totalAllocated: number
    remainingAmount: number
}

/**
 * Fetch all outstanding B2B orders
 */
export async function getOutstandingOrders(): Promise<IOutstandingOrder[]> {
    const { data, error } = await supabase
        .from('b2b_orders')
        .select(`
            id, order_number, customer_id, total, paid_amount,
            delivery_date, order_date, payment_status,
            customer:customers(name, company_name)
        `)
        .in('payment_status', ['unpaid', 'partial'])
        .neq('status', 'cancelled')
        .order('order_date', { ascending: true })

    if (error) {
        logError('Error fetching outstanding orders:', error)
        return []
    }

    const now = new Date()

    return (data || []).map(order => {
        const dueDate = order.delivery_date ? new Date(order.delivery_date) : null
        const daysOverdue = dueDate ? Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
        const customer = order.customer as { name?: string; company_name?: string } | null

        return {
            id: order.id,
            order_number: order.order_number,
            customer_id: order.customer_id,
            customer_name: customer?.name || 'Unknown',
            company_name: customer?.company_name || null,
            total: order.total || 0,
            paid_amount: order.paid_amount || 0,
            amount_due: (order.total || 0) - (order.paid_amount || 0),
            due_date: order.delivery_date,
            order_date: order.order_date,
            payment_status: order.payment_status || 'unpaid',
            days_overdue: daysOverdue,
        }
    })
}

/**
 * Generate aging report with standard buckets
 */
export async function generateAgingReport(): Promise<IAgingReport> {
    const orders = await getOutstandingOrders()

    const bucketDefs = [
        { label: 'Current (0-30 days)', minDays: 0, maxDays: 30 },
        { label: 'Overdue (31-60 days)', minDays: 31, maxDays: 60 },
        { label: 'Critical (60+ days)', minDays: 61, maxDays: null },
    ]

    const buckets: IAgingBucket[] = bucketDefs.map(def => {
        const bucketOrders = orders.filter(o => {
            if (def.maxDays === null) return o.days_overdue >= def.minDays
            return o.days_overdue >= def.minDays && o.days_overdue <= def.maxDays
        })

        return {
            ...def,
            orders: bucketOrders,
            totalDue: bucketOrders.reduce((sum, o) => sum + o.amount_due, 0),
            count: bucketOrders.length,
        }
    })

    return {
        buckets,
        totalOutstanding: orders.reduce((sum, o) => sum + o.amount_due, 0),
        totalOrders: orders.length,
        generatedAt: new Date().toISOString(),
    }
}

/**
 * Allocate a payment amount across orders using FIFO (oldest first)
 */
export function allocatePaymentFIFO(
    orders: IOutstandingOrder[],
    paymentAmount: number
): IFIFOAllocationResult {
    // Sort by order date (oldest first)
    const sortedOrders = [...orders].sort(
        (a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
    )

    let remaining = paymentAmount
    const allocations: IFIFOAllocationResult['allocations'] = []

    for (const order of sortedOrders) {
        if (remaining <= 0) break

        const allocatedAmount = Math.min(remaining, order.amount_due)
        const newPaidAmount = order.paid_amount + allocatedAmount
        const isFullyPaid = newPaidAmount >= order.total

        allocations.push({
            orderId: order.id,
            orderNumber: order.order_number,
            allocatedAmount,
            newPaidAmount,
            isFullyPaid,
        })

        remaining -= allocatedAmount
    }

    return {
        allocations,
        totalAllocated: paymentAmount - remaining,
        remainingAmount: Math.max(0, remaining),
    }
}

/**
 * Apply FIFO payment allocations to orders in database
 */
export async function applyFIFOPayment(
    customerId: string,
    paymentAmount: number,
    paymentMethod: string,
    reference: string | null,
    createdBy: string
): Promise<{ success: boolean; error?: string; allocations?: IFIFOAllocationResult }> {
    // Get customer's outstanding orders
    const allOrders = await getOutstandingOrders()
    const customerOrders = allOrders.filter(o => o.customer_id === customerId)

    if (customerOrders.length === 0) {
        return { success: false, error: 'No outstanding orders for this customer' }
    }

    const result = allocatePaymentFIFO(customerOrders, paymentAmount)

    if (result.allocations.length === 0) {
        return { success: false, error: 'No allocations could be made' }
    }

    // Apply each allocation — stop on first error to prevent inconsistent state
    const appliedAllocations: typeof result.allocations = []

    for (const allocation of result.allocations) {
        // Update order paid_amount and payment_status
        const newStatus = allocation.isFullyPaid ? 'paid' : 'partial'
        const { error: updateError } = await supabase
            .from('b2b_orders')
            .update({
                paid_amount: allocation.newPaidAmount,
                payment_status: newStatus,
                ...(allocation.isFullyPaid ? { paid_at: new Date().toISOString() } : {}),
            })
            .eq('id', allocation.orderId)

        if (updateError) {
            logError(`Error updating order ${allocation.orderNumber}:`, updateError)
            return {
                success: false,
                error: `Failed to update order ${allocation.orderNumber}: ${updateError.message}. ${appliedAllocations.length} allocation(s) were already applied.`,
            }
        }

        // Create payment record
        const { error: paymentError } = await supabase
            .from('b2b_payments')
            .insert({
                order_id: allocation.orderId,
                customer_id: customerId,
                payment_date: new Date().toISOString(),
                payment_method: paymentMethod,
                amount: allocation.allocatedAmount,
                reference_number: reference,
                status: 'completed',
                created_by: createdBy,
            })

        if (paymentError) {
            logError(`Error creating payment for ${allocation.orderNumber}:`, paymentError)
            return {
                success: false,
                error: `Failed to record payment for ${allocation.orderNumber}: ${paymentError.message}. Order was updated but payment record missing.`,
            }
        }

        appliedAllocations.push(allocation)
    }

    // Reduce customer credit balance
    const { data: customer } = await supabase
        .from('customers')
        .select('credit_balance')
        .eq('id', customerId)
        .single()

    if (customer) {
        const totalApplied = appliedAllocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
        const newBalance = Math.max(0, (customer.credit_balance || 0) - totalApplied)
        const { error: balanceError } = await supabase
            .from('customers')
            .update({ credit_balance: newBalance })
            .eq('id', customerId)

        if (balanceError) {
            logError('Error updating credit balance:', balanceError)
            return {
                success: false,
                error: `Payments applied but credit balance update failed: ${balanceError.message}`,
            }
        }
    }

    return { success: true, allocations: result }
}

/**
 * Export outstanding orders as CSV string
 */
export function exportOutstandingCSV(orders: IOutstandingOrder[]): string {
    const headers = [
        'Order Number',
        'Customer',
        'Company',
        'Order Date',
        'Due Date',
        'Total',
        'Paid',
        'Amount Due',
        'Days Overdue',
        'Status',
    ]

    const rows = orders.map(o => [
        o.order_number,
        o.customer_name,
        o.company_name || '',
        o.order_date ? new Date(o.order_date).toLocaleDateString() : '',
        o.due_date ? new Date(o.due_date).toLocaleDateString() : '',
        o.total.toString(),
        o.paid_amount.toString(),
        o.amount_due.toString(),
        o.days_overdue.toString(),
        o.payment_status,
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return csvContent
}

/**
 * Trigger CSV download in browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}
