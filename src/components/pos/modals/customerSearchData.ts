import { supabase } from '../../../lib/supabase'
import { searchCustomersOffline } from '../../../services/sync/customerSync'
import {
    ICustomerSearchCustomer,
    IOrderHistoryItem,
    IFrequentProduct,
    transformOfflineCustomer,
} from './customerSearchTypes'

const CUSTOMER_SELECT = `
    *,
    category:customer_categories(name, slug, color, price_modifier_type, discount_percentage)
`

/** Fetch the 10 most recently visited customers */
export async function fetchRecentCustomers(
    isOnline: boolean
): Promise<ICustomerSearchCustomer[]> {
    if (!isOnline) {
        const offlineCustomers = await searchCustomersOffline('')
        return offlineCustomers.slice(0, 10).map(transformOfflineCustomer)
    }

    try {
        const { data } = await supabase
            .from('customers')
            .select(CUSTOMER_SELECT)
            .eq('is_active', true)
            .order('last_visit_at', { ascending: false, nullsFirst: false })
            .limit(10)
            .returns<ICustomerSearchCustomer[]>()

        return data ?? []
    } catch (error) {
        console.error('Error fetching customers:', error)
        // Fallback to offline
        const offlineCustomers = await searchCustomersOffline('')
        return offlineCustomers.slice(0, 10).map(transformOfflineCustomer)
    }
}

/** Search customers by term with abort signal support */
export async function searchCustomers(
    term: string,
    isOnline: boolean,
    signal?: AbortSignal
): Promise<ICustomerSearchCustomer[]> {
    if (!isOnline) {
        const offlineCustomers = await searchCustomersOffline(term)
        return offlineCustomers.map(transformOfflineCustomer)
    }

    try {
        let query = supabase
            .from('customers')
            .select(CUSTOMER_SELECT)
            .eq('is_active', true)
            .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%,membership_number.ilike.%${term}%`)
            .limit(20)

        if (signal) {
            query = query.abortSignal(signal)
        }

        const { data, error } = await query.returns<ICustomerSearchCustomer[]>()
        if (error) throw error
        return data ?? []
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw error

        console.error('Error searching customers:', error)
        const offlineCustomers = await searchCustomersOffline(term)
        return offlineCustomers.map(transformOfflineCustomer)
    }
}

/** Load favorite customers by IDs */
export async function loadFavoriteCustomers(
    favoriteIds: string[]
): Promise<ICustomerSearchCustomer[]> {
    if (favoriteIds.length === 0) return []

    const { data } = await supabase
        .from('customers')
        .select(CUSTOMER_SELECT)
        .in('id', favoriteIds)
        .eq('is_active', true)
        .returns<ICustomerSearchCustomer[]>()

    return data ?? []
}

/** Load customer order history and frequent products (Story 7.4, 7.5) */
export async function loadCustomerHistory(
    customerId: string
): Promise<{ orderHistory: IOrderHistoryItem[]; frequentProducts: IFrequentProduct[] }> {
    let orderHistory: IOrderHistoryItem[] = []
    let frequentProducts: IFrequentProduct[] = []

    // Fetch recent orders
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id, order_number, created_at, total,
            order_items (id, product_id, quantity, unit_price, products (name))
        `)
        .eq('customer_id', customerId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10)

    if (orders) {
        orderHistory = orders.map(order => ({
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at ?? new Date().toISOString(),
            total: order.total ?? 0,
            items: (order.order_items || []).map((item: Record<string, unknown>) => ({
                id: item.id as string,
                product_id: (item.product_id as string) ?? '',
                product_name: Array.isArray(item.products)
                    ? (item.products[0] as Record<string, unknown>)?.name as string
                    : (item.products as Record<string, unknown>)?.name as string || 'Unknown',
                quantity: item.quantity as number,
                unit_price: item.unit_price as number
            }))
        }))
    }

    // Calculate frequent products (Story 7.5)
    const { data: frequentData } = await supabase
        .from('order_items')
        .select(`
            product_id, quantity,
            orders!inner (customer_id, created_at),
            products (name)
        `)
        .eq('orders.customer_id', customerId)
        .order('orders.created_at', { ascending: false })
        .limit(100)

    if (frequentData) {
        const productMap = new Map<string, { name: string; count: number; lastOrdered: string }>()
        frequentData.forEach((item: Record<string, unknown>) => {
            if (!item.product_id) return
            const productId = item.product_id as string
            const existing = productMap.get(productId)
            const productName = Array.isArray(item.products)
                ? (item.products[0] as Record<string, unknown>)?.name as string
                : (item.products as Record<string, unknown>)?.name as string || 'Unknown'
            const orderDate = Array.isArray(item.orders)
                ? (item.orders[0] as Record<string, unknown>)?.created_at as string
                : (item.orders as Record<string, unknown>)?.created_at as string
            if (existing) {
                existing.count += item.quantity as number
            } else {
                productMap.set(productId, {
                    name: productName,
                    count: item.quantity as number,
                    lastOrdered: orderDate ?? new Date().toISOString()
                })
            }
        })

        frequentProducts = Array.from(productMap.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([pid, data]) => ({
                product_id: pid,
                product_name: data.name,
                times_ordered: data.count,
                last_ordered: data.lastOrdered
            }))
    }

    return { orderHistory, frequentProducts }
}

/** Fetch active customer categories */
export async function fetchCategories() {
    const { data } = await supabase
        .from('customer_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
    return data ?? []
}
