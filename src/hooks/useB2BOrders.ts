import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IB2BOrder {
    id: string
    order_number: string
    customer_id: string
    customer?: {
        name: string
        company_name: string | null
        phone: string | null
    }
    status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'partially_delivered' | 'delivered' | 'cancelled'
    order_date: string
    requested_delivery_date: string | null
    subtotal: number
    discount_amount: number
    tax_amount: number
    total_amount: number
    payment_status: 'unpaid' | 'partial' | 'paid'
    payment_terms: string | null
    due_date: string | null
    amount_paid: number
    amount_due: number
    created_at: string
}

export function useB2BOrders() {
    return useQuery({
        queryKey: ['b2b-orders'],
        queryFn: async (): Promise<IB2BOrder[]> => {
            const { data, error } = await supabase
                .from('b2b_orders')
                .select(`
                    *,
                    customer:customers(name, company_name, phone)
                `)
                .order('order_date', { ascending: false })

            if (error) throw error

            return (data ?? []).map(order => ({
                ...order,
                total_amount: order.total ?? 0,
                amount_paid: order.paid_amount ?? 0,
                amount_due: (order.total ?? 0) - (order.paid_amount ?? 0),
                requested_delivery_date: order.delivery_date,
                payment_status: order.payment_status ?? 'unpaid',
            })) as unknown as IB2BOrder[]
        },
    })
}
