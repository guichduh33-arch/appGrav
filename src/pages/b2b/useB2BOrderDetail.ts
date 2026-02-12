import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { B2BOrder, OrderItem, Payment, Delivery, HistoryEntry, PaymentFormData } from './b2bOrderDetailTypes'

const DEFAULT_PAYMENT_FORM: PaymentFormData = {
    amount: 0,
    payment_method: 'transfer',
    reference_number: '',
    notes: ''
}

export function useB2BOrderDetail(id: string | undefined) {
    const [order, setOrder] = useState<B2BOrder | null>(null)
    const [items, setItems] = useState<OrderItem[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [deliveries, setDeliveries] = useState<Delivery[]>([])
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [loading, setLoading] = useState(true)

    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentForm, setPaymentForm] = useState<PaymentFormData>(DEFAULT_PAYMENT_FORM)

    useEffect(() => {
        if (id) {
            fetchOrder()
            fetchItems()
            fetchPayments()
            fetchDeliveries()
            fetchHistory()
        }
    }, [id])

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_orders')
                .select(`
                    *,
                    customer:customers(id, name, company_name, phone, email, address)
                `)
                .eq('id', id!)
                .single()

            if (error) throw error
            if (data) {
                const dbTaxRate = data.tax_rate ?? 0.1
                const displayTaxRate = dbTaxRate < 1 ? dbTaxRate * 100 : dbTaxRate

                const mappedOrder = {
                    ...data,
                    total_amount: data.total ?? data.total_amount ?? 0,
                    amount_paid: data.paid_amount ?? data.amount_paid ?? 0,
                    amount_due: (data.total ?? data.total_amount ?? 0) - (data.paid_amount ?? data.amount_paid ?? 0),
                    requested_delivery_date: data.delivery_date,
                    actual_delivery_date: data.delivered_at,
                    discount_type: data.discount_percent ? 'percentage' : null,
                    discount_value: data.discount_percent ?? 0,
                    payment_status: data.payment_status ?? 'unpaid',
                    tax_rate: displayTaxRate,
                } as B2BOrder
                setOrder(mappedOrder)
            }
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchItems = async () => {
        try {
            const { data: itemsWithReturns, error: itemsError } = await supabase
                .from('b2b_order_items')
                .select('*')
                .eq('order_id', id!)
                .order('created_at')

            if (itemsError) throw itemsError
            if (itemsWithReturns) {
                const mappedItems = itemsWithReturns.map(item => {
                    const discPct = (item as unknown as { discount_percent?: number }).discount_percent ?? 0
                    const lineTotal = (item as unknown as { total?: number }).total ?? 0
                    return {
                        id: item.id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        product_sku: item.product_sku,
                        quantity: item.quantity,
                        unit: 'pcs',
                        unit_price: item.unit_price,
                        discount_percentage: discPct,
                        discount_amount: (item.unit_price * item.quantity * discPct) / 100,
                        line_total: lineTotal,
                        quantity_delivered: 0,
                        quantity_remaining: item.quantity,
                    }
                })
                setItems(mappedItems)
            }
        } catch (error) {
            console.error('Error fetching items:', error)
        }
    }

    const fetchPayments = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_payments')
                .select('*')
                .eq('order_id', id!)
                .returns<Payment[]>()
                .order('payment_date', { ascending: false })

            if (error) throw error
            if (data) setPayments(data)
        } catch (error) {
            console.error('Error fetching payments:', error)
        }
    }

    const fetchDeliveries = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_deliveries')
                .select('*')
                .eq('order_id', id!)
                .returns<Delivery[]>()
                .order('scheduled_date', { ascending: false })

            if (error) {
                setDeliveries([])
                return
            }
            if (data) setDeliveries(data)
        } catch (error) {
            console.error('Error fetching deliveries:', error)
            setDeliveries([])
        }
    }

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('b2b_order_history')
                .select('*')
                .eq('order_id', id!)
                .returns<HistoryEntry[]>()
                .order('created_at', { ascending: false })

            if (error) {
                setHistory([])
                return
            }
            if (data) setHistory(data)
        } catch (error) {
            console.error('Error fetching history:', error)
            setHistory([])
        }
    }

    const updateOrderStatus = async (newStatus: string) => {
        if (!order) return
        try {
            const updateData: Record<string, unknown> = { status: newStatus }
            if (newStatus === 'delivered') {
                updateData.delivered_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('b2b_orders')
                .update(updateData)
                .eq('id', order.id)

            if (error) throw error
            fetchOrder()
            fetchHistory()
        } catch (error) {
            console.error('Error updating status:', error)
            alert(`Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const handleAddPayment = async () => {
        if (!order) {
            alert('Error: Order not loaded')
            return
        }
        if (paymentForm.amount <= 0) {
            alert('Error: Amount must be greater than 0')
            return
        }

        try {
            const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

            const { error } = await supabase
                .from('b2b_payments')
                .insert({
                    order_id: order.id,
                    customer_id: order.customer_id,
                    amount: paymentForm.amount,
                    payment_method: paymentForm.payment_method,
                    payment_number: paymentNumber,
                    reference_number: paymentForm.reference_number || null,
                    notes: paymentForm.notes || null
                })
                .select()

            if (error) throw error

            setShowPaymentModal(false)
            setPaymentForm(DEFAULT_PAYMENT_FORM)
            fetchOrder()
            fetchPayments()
            fetchHistory()
        } catch (error) {
            console.error('Error adding payment:', error)
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    const openPaymentModal = () => {
        if (order) {
            setPaymentForm(prev => ({ ...prev, amount: order.amount_due }))
            setShowPaymentModal(true)
        }
    }

    return {
        order,
        items,
        payments,
        deliveries,
        history,
        loading,
        showPaymentModal,
        paymentForm,
        setPaymentForm,
        setShowPaymentModal,
        updateOrderStatus,
        handleAddPayment,
        openPaymentModal,
    }
}
