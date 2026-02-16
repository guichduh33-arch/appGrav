/**
 * useARManagement - Accounts Receivable & Aging Management
 * Tracks unpaid B2B orders, customer balances, and aging buckets
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useEffect, useMemo } from 'react'

// Types for AR Management
export interface IARInvoice {
  id: string
  order_number: string
  customer_id: string
  customer_name: string
  invoice_date: string
  due_date: string
  total: number
  paid_amount: number
  balance: number
  days_overdue: number
  status: 'current' | 'overdue_30' | 'overdue_60' | 'overdue_90' | 'overdue_90_plus'
}

export interface IAgingBucket {
  label: string
  range: string
  count: number
  total: number
  percentage: number
}

export interface ICustomerBalance {
  customer_id: string
  customer_name: string
  customer_phone: string | null
  total_outstanding: number
  oldest_invoice_date: string | null
  invoice_count: number
  credit_limit: number | null
  available_credit: number | null
}

export interface IARFilters {
  customerId?: string
  status?: IARInvoice['status']
  minAmount?: number
  maxDaysOverdue?: number
}

export interface IARSummary {
  total_receivable: number
  current: number
  overdue_1_30: number
  overdue_31_60: number
  overdue_61_90: number
  overdue_90_plus: number
  invoice_count: number
  customer_count: number
}

const QUERY_KEY = 'ar-management'

// Helper: Calculate aging bucket
function getAgingStatus(daysOverdue: number): IARInvoice['status'] {
  if (daysOverdue <= 0) return 'current'
  if (daysOverdue <= 30) return 'overdue_30'
  if (daysOverdue <= 60) return 'overdue_60'
  if (daysOverdue <= 90) return 'overdue_90'
  return 'overdue_90_plus'
}

export function useARManagement(filters?: IARFilters) {
  const queryClient = useQueryClient()

  // READ - Outstanding B2B invoices with aging
  const invoices = useQuery({
    queryKey: [QUERY_KEY, 'invoices', filters],
    queryFn: async () => {
      // Get B2B orders with payment_status not fully paid
      let query = supabase
        .from('b2b_orders')
        .select(
          `
          id,
          order_number,
          customer_id,
          customer:customers(name, phone),
          order_date,
          delivery_date,
          total,
          paid_amount,
          payment_status
        `
        )
        .neq('payment_status', 'paid')
        .order('delivery_date', { ascending: true, nullsFirst: false })

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }
      if (filters?.minAmount) {
        query = query.gte('total', filters.minAmount)
      }

      const { data, error } = await query
      if (error) throw error

      const today = new Date()

      // Transform to IARInvoice
      const arInvoices: IARInvoice[] = (data ?? []).map((order) => {
        // Use delivery_date as due_date, fallback to order_date + 30 days
        const dueDateStr = order.delivery_date ?? order.order_date
        const dueDate = new Date(dueDateStr)
        const daysOverdue = Math.floor(
          (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        const balance = (order.total ?? 0) - (order.paid_amount ?? 0)

        return {
          id: order.id,
          order_number: order.order_number,
          customer_id: order.customer_id,
          customer_name: (order.customer as unknown as { name: string } | null)?.name ?? 'Unknown',
          invoice_date: order.order_date,
          due_date: dueDateStr,
          total: order.total ?? 0,
          paid_amount: order.paid_amount ?? 0,
          balance,
          days_overdue: Math.max(0, daysOverdue),
          status: getAgingStatus(daysOverdue),
        }
      })

      // Apply status filter
      if (filters?.status) {
        return arInvoices.filter((inv) => inv.status === filters.status)
      }
      if (filters?.maxDaysOverdue !== undefined) {
        return arInvoices.filter((inv) => inv.days_overdue <= filters.maxDaysOverdue!)
      }

      return arInvoices
    },
  })

  // READ - Aging buckets summary
  const agingBuckets = useMemo((): IAgingBucket[] => {
    const data = invoices.data ?? []
    const total = data.reduce((sum, inv) => sum + inv.balance, 0)

    const buckets: Record<string, { count: number; total: number }> = {
      current: { count: 0, total: 0 },
      overdue_30: { count: 0, total: 0 },
      overdue_60: { count: 0, total: 0 },
      overdue_90: { count: 0, total: 0 },
      overdue_90_plus: { count: 0, total: 0 },
    }

    for (const inv of data) {
      buckets[inv.status].count++
      buckets[inv.status].total += inv.balance
    }

    return [
      {
        label: 'Current',
        range: '0 days',
        count: buckets.current.count,
        total: buckets.current.total,
        percentage: total > 0 ? (buckets.current.total / total) * 100 : 0,
      },
      {
        label: '1-30 Days',
        range: '1-30 days',
        count: buckets.overdue_30.count,
        total: buckets.overdue_30.total,
        percentage: total > 0 ? (buckets.overdue_30.total / total) * 100 : 0,
      },
      {
        label: '31-60 Days',
        range: '31-60 days',
        count: buckets.overdue_60.count,
        total: buckets.overdue_60.total,
        percentage: total > 0 ? (buckets.overdue_60.total / total) * 100 : 0,
      },
      {
        label: '61-90 Days',
        range: '61-90 days',
        count: buckets.overdue_90.count,
        total: buckets.overdue_90.total,
        percentage: total > 0 ? (buckets.overdue_90.total / total) * 100 : 0,
      },
      {
        label: '90+ Days',
        range: '90+ days',
        count: buckets.overdue_90_plus.count,
        total: buckets.overdue_90_plus.total,
        percentage: total > 0 ? (buckets.overdue_90_plus.total / total) * 100 : 0,
      },
    ]
  }, [invoices.data])

  // READ - AR Summary
  const summary = useMemo((): IARSummary => {
    const data = invoices.data ?? []
    const customerIds = new Set(data.map((inv) => inv.customer_id))

    return {
      total_receivable: data.reduce((sum, inv) => sum + inv.balance, 0),
      current: data.filter((inv) => inv.status === 'current').reduce((sum, inv) => sum + inv.balance, 0),
      overdue_1_30: data.filter((inv) => inv.status === 'overdue_30').reduce((sum, inv) => sum + inv.balance, 0),
      overdue_31_60: data.filter((inv) => inv.status === 'overdue_60').reduce((sum, inv) => sum + inv.balance, 0),
      overdue_61_90: data.filter((inv) => inv.status === 'overdue_90').reduce((sum, inv) => sum + inv.balance, 0),
      overdue_90_plus: data.filter((inv) => inv.status === 'overdue_90_plus').reduce((sum, inv) => sum + inv.balance, 0),
      invoice_count: data.length,
      customer_count: customerIds.size,
    }
  }, [invoices.data])

  // READ - Customer balances
  const customerBalances = useQuery({
    queryKey: [QUERY_KEY, 'customer-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_orders')
        .select(
          `
          customer_id,
          customer:customers(name, phone, credit_limit),
          total,
          paid_amount,
          order_date,
          payment_status
        `
        )
        .neq('payment_status', 'paid')

      if (error) throw error

      // Aggregate by customer
      const balanceMap = new Map<string, ICustomerBalance>()

      for (const order of data ?? []) {
        const customerId = order.customer_id
        const balance = (order.total ?? 0) - (order.paid_amount ?? 0)
        const existing = balanceMap.get(customerId)
        const customer = order.customer as unknown as { name: string; phone: string | null; credit_limit: number | null } | null

        if (existing) {
          existing.total_outstanding += balance
          existing.invoice_count++
          if (!existing.oldest_invoice_date || order.order_date < existing.oldest_invoice_date) {
            existing.oldest_invoice_date = order.order_date
          }
        } else {
          const creditLimit = customer?.credit_limit ?? null
          balanceMap.set(customerId, {
            customer_id: customerId,
            customer_name: customer?.name ?? 'Unknown',
            customer_phone: customer?.phone ?? null,
            total_outstanding: balance,
            oldest_invoice_date: order.order_date,
            invoice_count: 1,
            credit_limit: creditLimit,
            available_credit: creditLimit !== null ? creditLimit - balance : null,
          })
        }
      }

      return Array.from(balanceMap.values()).sort(
        (a, b) => b.total_outstanding - a.total_outstanding
      )
    },
  })

  // RECORD PAYMENT
  const recordPayment = useMutation({
    mutationFn: async ({
      orderId,
      amount,
      paymentMethod,
      reference,
      notes,
    }: {
      orderId: string
      amount: number
      paymentMethod: string
      reference?: string
      notes?: string
    }) => {
      // Get current order
      const { data: order, error: fetchError } = await supabase
        .from('b2b_orders')
        .select('total, paid_amount, customer_id')
        .eq('id', orderId)
        .single()

      if (fetchError) throw fetchError

      const newPaidAmount = (order.paid_amount ?? 0) + amount
      const newStatus =
        newPaidAmount >= (order.total ?? 0) ? 'paid' : 'partial'

      // Update order
      const { error: updateError } = await supabase
        .from('b2b_orders')
        .update({
          paid_amount: newPaidAmount,
          payment_status: newStatus,
        })
        .eq('id', orderId)

      if (updateError) throw updateError

      // Generate payment number (PAY-YYYYMMDD-XXXX)
      const paymentNumber = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // Record payment
      const { error: paymentError } = await supabase.from('b2b_payments').insert({
        payment_number: paymentNumber,
        order_id: orderId,
        customer_id: order.customer_id,
        amount,
        payment_method: paymentMethod as 'cash' | 'card' | 'qris' | 'transfer' | 'credit',
        reference_number: reference,
        notes,
        payment_date: new Date().toISOString().split('T')[0],
      })

      if (paymentError) throw paymentError

      return { orderId, newPaidAmount, newStatus }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // SEND REMINDER (placeholder - would integrate with notification system)
  const sendReminder = useMutation({
    mutationFn: async ({
      customerId,
      invoiceIds,
      message,
    }: {
      customerId: string
      invoiceIds: string[]
      message?: string
    }) => {
      // TODO: Integrate with notification/email system
      console.log('Sending reminder to customer:', customerId, 'for invoices:', invoiceIds)

      // For now, just log the action
      const { error } = await supabase.from('audit_logs').insert({
        action: 'ar_reminder_sent',
        entity_type: 'customer',
        entity_id: customerId,
        new_value: JSON.stringify({ invoiceIds, message }),
      })

      if (error) {
        console.error('Failed to log reminder:', error)
      }

      return { customerId, invoiceIds }
    },
  })

  // REALTIME subscription for B2B payments
  useEffect(() => {
    const channel = supabase
      .channel('ar-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'b2b_orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'b2b_payments' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  return {
    invoices,
    agingBuckets,
    summary,
    customerBalances,
    recordPayment,
    sendReminder,
    isLoading: invoices.isLoading,
    error: invoices.error,
  }
}

export default useARManagement
