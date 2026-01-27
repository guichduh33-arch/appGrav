import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { type TMovementFilterType, QUERY_LIMITS } from '@/constants/inventory'

// Re-export for consumers who import from this hook
export type { TMovementFilterType }

export interface IStockMovement {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  product_unit: string
  product_cost: number
  movement_type: string
  quantity: number
  reason: string | null
  reference_id: string | null
  created_at: string
  staff_name: string | null
}

export interface IStockMovementsFilter {
  type?: TMovementFilterType
  dateFrom?: string
  dateTo?: string
  productId?: string
  limit?: number
}

/**
 * Hook to fetch stock movements with optional filtering
 */
export function useStockMovements(filters: IStockMovementsFilter = {}) {
  const { type = 'all', dateFrom, dateTo, productId, limit = QUERY_LIMITS.STOCK_MOVEMENTS_DEFAULT } = filters

  return useQuery({
    queryKey: ['stock-movements', { type, dateFrom, dateTo, productId, limit }],
    queryFn: async (): Promise<IStockMovement[]> => {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name, sku, unit, cost_price),
          staff:user_profiles!stock_movements_staff_id_fkey(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      // Apply filters
      if (type && type !== 'all') {
        // @ts-expect-error - Filter type is validated at runtime, Supabase types are overly strict
        query = query.eq('movement_type', type)
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }

      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59`)
      }

      if (productId) {
        query = query.eq('product_id', productId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform the data to match IStockMovement interface
      return (data || []).map((m: Record<string, unknown>) => {
        const product = m.product as Record<string, unknown> | null
        const staff = m.staff as Record<string, unknown> | null

        return {
          id: m.id as string,
          product_id: m.product_id as string,
          product_name: product?.name as string || 'Unknown',
          product_sku: product?.sku as string || '',
          product_unit: product?.unit as string || 'pcs',
          product_cost: product?.cost_price as number || 0,
          movement_type: m.movement_type as string,
          quantity: m.quantity as number,
          reason: m.reason as string | null,
          reference_id: m.reference_id as string | null,
          created_at: m.created_at as string,
          staff_name: staff?.display_name as string | null
        }
      })
    }
  })
}

/**
 * Hook to fetch stock movements for a specific product
 */
export function useProductStockMovements(productId: string | null) {
  return useQuery({
    queryKey: ['stock-movements', 'product', productId],
    queryFn: async (): Promise<IStockMovement[]> => {
      if (!productId) return []

      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name, sku, unit, cost_price),
          staff:user_profiles!stock_movements_staff_id_fkey(display_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(QUERY_LIMITS.STOCK_MOVEMENTS_PRODUCT)

      if (error) {
        throw error
      }

      return (data || []).map((m: Record<string, unknown>) => {
        const product = m.product as Record<string, unknown> | null
        const staff = m.staff as Record<string, unknown> | null

        return {
          id: m.id as string,
          product_id: m.product_id as string,
          product_name: product?.name as string || 'Unknown',
          product_sku: product?.sku as string || '',
          product_unit: product?.unit as string || 'pcs',
          product_cost: product?.cost_price as number || 0,
          movement_type: m.movement_type as string,
          quantity: m.quantity as number,
          reason: m.reason as string | null,
          reference_id: m.reference_id as string | null,
          created_at: m.created_at as string,
          staff_name: staff?.display_name as string | null
        }
      })
    },
    enabled: !!productId
  })
}
