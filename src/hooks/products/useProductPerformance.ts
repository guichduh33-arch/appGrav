/**
 * useProductPerformance Hook
 * Calculates product conversion rate and sales metrics from existing order data
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IProductPerformance {
  unitsSold: number
  totalRevenue: number
  ordersWithProduct: number
  totalOrders: number
  conversionRate: number
}

export function useProductPerformance(productId: string | undefined, days = 30) {
  return useQuery({
    queryKey: ['product-performance', productId, days],
    queryFn: async (): Promise<IProductPerformance> => {
      if (!productId) return { unitsSold: 0, totalRevenue: 0, ordersWithProduct: 0, totalOrders: 0, conversionRate: 0 }

      const since = new Date()
      since.setDate(since.getDate() - days)
      const sinceStr = since.toISOString()

      // Get order items for this product in the period
      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('quantity, unit_price, order_id, order:orders!inner(id, created_at, status)')
        .eq('product_id', productId)
        .gte('orders.created_at', sinceStr)
        .in('orders.status', ['completed', 'new', 'preparing', 'ready'])

      if (itemsErr) throw itemsErr

      const unitsSold = (items ?? []).reduce((sum, i) => sum + (i.quantity ?? 0), 0)
      const totalRevenue = (items ?? []).reduce((sum, i) => sum + (i.quantity ?? 0) * (i.unit_price ?? 0), 0)
      const uniqueOrders = new Set((items ?? []).map(i => i.order_id))
      const ordersWithProduct = uniqueOrders.size

      // Get total orders in the same period
      const { count, error: countErr } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sinceStr)
        .in('status', ['completed', 'new', 'preparing', 'ready'])

      if (countErr) throw countErr

      const totalOrders = count ?? 0
      const conversionRate = totalOrders > 0 ? Math.round((ordersWithProduct / totalOrders) * 1000) / 10 : 0

      return { unitsSold, totalRevenue, ordersWithProduct, totalOrders, conversionRate }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  })
}
