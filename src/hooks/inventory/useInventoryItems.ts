import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Type that matches what InventoryTable expects
export interface TInventoryItem {
  id: string
  name: string
  sku: string | null
  current_stock: number
  min_stock_level: number
  max_stock_level: number | null
  unit: string | null
  cost_price: number | null
  selling_price: number
  product_type: 'finished' | 'semi_finished' | 'raw_material'
  category_id: string | null
  is_active: boolean
  category: { name: string } | null
}

/**
 * Hook to fetch all inventory items (products with stock info)
 * Returns products with their categories, ordered by name
 */
export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async (): Promise<TInventoryItem[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('name')

      if (error) {
        throw error
      }

      return (data || []) as unknown as TInventoryItem[]
    }
  })
}
