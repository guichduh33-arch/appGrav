/**
 * B2B Credit Service
 * Epic 10: Stories 10.1, 10.2
 *
 * Manages customer credit terms and late payment alerts
 */

import { supabase } from '@/lib/supabase'

export interface ICustomerCredit {
    customer_id: string
    customer_name: string
    credit_limit: number
    credit_balance: number
    available_credit: number
    payment_terms_days: number
    credit_status: 'none' | 'approved' | 'suspended'
}

export interface IOverdueInvoice {
    invoice_id: string
    customer_id: string
    customer_name: string
    invoice_number: string
    due_date: string
    days_overdue: number
    amount: number
    paid_amount: number
    balance_due: number
}

export interface IInvoice {
    id: string
    customer_id: string
    order_id: string | null
    invoice_number: string
    invoice_date: string
    due_date: string
    amount: number
    paid_amount: number
    status: 'pending' | 'partial' | 'paid' | 'overdue'
    notes: string | null
}

// Story 10.1: Get customer credit info
export async function getCustomerCredit(customerId: string): Promise<ICustomerCredit | null> {
    const { data, error } = await supabase
        .from('customers')
        .select('id, name, credit_limit, credit_balance, payment_terms_days, credit_status')
        .eq('id', customerId)
        .single()

    if (error || !data) return null

    return {
        customer_id: data.id,
        customer_name: data.name,
        credit_limit: data.credit_limit || 0,
        credit_balance: data.credit_balance || 0,
        available_credit: (data.credit_limit || 0) - (data.credit_balance || 0),
        payment_terms_days: data.payment_terms_days || 0,
        credit_status: (data.credit_status as 'none' | 'approved' | 'suspended') || 'none'
    }
}

// Story 10.1: Update customer credit terms
export async function updateCustomerCreditTerms(
    customerId: string,
    creditLimit: number,
    paymentTermsDays: number,
    creditStatus: 'none' | 'approved' | 'suspended'
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('customers')
        .update({
            credit_limit: creditLimit,
            payment_terms_days: paymentTermsDays,
            credit_status: creditStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Story 10.1: Add to customer balance (when they use credit)
export async function addToCustomerBalance(
    customerId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    const { data: customer } = await supabase
        .from('customers')
        .select('credit_balance, credit_limit, credit_status')
        .eq('id', customerId)
        .single()

    if (!customer) {
        return { success: false, error: 'Customer not found' }
    }

    if (customer.credit_status !== 'approved') {
        return { success: false, error: 'Customer credit not approved' }
    }

    const newBalance = (customer.credit_balance || 0) + amount
    if (newBalance > (customer.credit_limit || 0)) {
        return { success: false, error: 'Credit limit exceeded' }
    }

    const { error } = await supabase
        .from('customers')
        .update({
            credit_balance: newBalance,
            updated_at: new Date().toISOString()
        })
        .eq('id', customerId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Story 10.2: Get overdue invoices
export async function getOverdueInvoices(): Promise<IOverdueInvoice[]> {
    const { data, error } = await supabase
        .rpc('get_overdue_invoices')

    if (error) {
        console.error('Error fetching overdue invoices:', error)
        return []
    }

    return (data || []) as IOverdueInvoice[]
}

// Story 10.2: Get late payment summary
export async function getLatePaymentSummary(): Promise<{
    totalOverdue: number
    overdueCount: number
    criticalCount: number
    customers: Array<{
        customerId: string
        customerName: string
        overdueAmount: number
        invoiceCount: number
        oldestOverdueDays: number
    }>
}> {
    const overdueInvoices = await getOverdueInvoices()

    if (overdueInvoices.length === 0) {
        return {
            totalOverdue: 0,
            overdueCount: 0,
            criticalCount: 0,
            customers: []
        }
    }

    const customerMap = new Map<string, {
        customerId: string
        customerName: string
        overdueAmount: number
        invoiceCount: number
        oldestOverdueDays: number
    }>()

    let totalOverdue = 0
    let criticalCount = 0

    for (const invoice of overdueInvoices) {
        totalOverdue += invoice.balance_due

        if (invoice.days_overdue > 30) {
            criticalCount++
        }

        const existing = customerMap.get(invoice.customer_id)
        if (existing) {
            existing.overdueAmount += invoice.balance_due
            existing.invoiceCount++
            existing.oldestOverdueDays = Math.max(existing.oldestOverdueDays, invoice.days_overdue)
        } else {
            customerMap.set(invoice.customer_id, {
                customerId: invoice.customer_id,
                customerName: invoice.customer_name,
                overdueAmount: invoice.balance_due,
                invoiceCount: 1,
                oldestOverdueDays: invoice.days_overdue
            })
        }
    }

    return {
        totalOverdue,
        overdueCount: overdueInvoices.length,
        criticalCount,
        customers: Array.from(customerMap.values()).sort(
            (a, b) => b.overdueAmount - a.overdueAmount
        )
    }
}

// Story 10.2: Create invoice for B2B order
export async function createInvoice(
    customerId: string,
    orderId: string | null,
    amount: number,
    dueDate: Date,
    notes?: string
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    // Generate invoice number via thread-safe DB function (S9 audit fix)
    // Uses pg_advisory_xact_lock to prevent duplicate numbers under concurrency
    const { data: invoiceNumber, error: rpcError } = await supabase
        .rpc('generate_next_customer_invoice_number')

    if (rpcError || !invoiceNumber) {
        console.error('Error generating invoice number:', rpcError)
        return { success: false, error: rpcError?.message || 'Failed to generate invoice number' }
    }

    const { data, error } = await supabase
        .from('customer_invoices')
        .insert({
            customer_id: customerId,
            order_id: orderId,
            invoice_number: invoiceNumber as string,
            due_date: dueDate.toISOString(),
            amount: amount,
            status: 'pending',
            notes: notes
        })
        .select('id')
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    // Add to customer balance
    await addToCustomerBalance(customerId, amount)

    return { success: true, invoiceId: data.id }
}

// Story 10.2: Record payment on invoice
export async function recordInvoicePayment(
    invoiceId: string,
    paymentAmount: number
): Promise<{ success: boolean; error?: string }> {
    const { data: invoice } = await supabase
        .from('customer_invoices')
        .select('customer_id, amount, paid_amount')
        .eq('id', invoiceId)
        .single()

    if (!invoice) {
        return { success: false, error: 'Invoice not found' }
    }

    const newPaidAmount = (invoice.paid_amount || 0) + paymentAmount
    const newStatus = newPaidAmount >= invoice.amount ? 'paid' :
        newPaidAmount > 0 ? 'partial' : 'pending'

    const { error } = await supabase
        .from('customer_invoices')
        .update({
            paid_amount: newPaidAmount,
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)

    if (error) {
        return { success: false, error: error.message }
    }

    // Reduce customer balance - calculate the new balance
    const newBalance = Math.max(0, (invoice.amount || 0) - newPaidAmount)
    const { error: balanceError } = await supabase
        .from('customers')
        .update({
            credit_balance: newBalance
        })
        .eq('id', invoice.customer_id)

    if (balanceError) {
        console.error('Error updating customer balance:', balanceError)
    }

    return { success: true }
}
