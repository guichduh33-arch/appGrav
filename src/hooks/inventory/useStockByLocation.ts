/**
 * Hook for stock by location data (ARCH-005)
 * Extracted from StockByLocationPage.tsx
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IStockBalance {
  product_id: string
  product_name: string
  sku: string
  location_id: string
  location_name: string
  location_code: string
  location_type: string
  current_stock: number
  stock_unit: string
  stock_value: number
}

export interface IStockLocation {
  id: string
  name: string
  code: string
  location_type: string
}

export function useStockLocations() {
  return useQuery({
    queryKey: ['stock-locations'],
    queryFn: async (): Promise<IStockLocation[]> => {
      const { data } = await supabase
        .from('stock_locations')
        .select('*')
        .neq('is_active', false)
        .order('name')

      return (data || []) as IStockLocation[]
    },
    staleTime: 60_000,
  })
}

export function useStockBalances() {
  return useQuery({
    queryKey: ['stock-balances'],
    queryFn: async (): Promise<IStockBalance[]> => {
      const { data, error } = await supabase
        .from('stock_balances')
        .select('*')
        .order('location_name')
        .order('product_name')
        .returns<IStockBalance[]>()

      if (error) throw error
      return data ?? []
    },
    staleTime: 15_000,
  })
}
