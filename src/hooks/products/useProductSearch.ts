import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types/database'

/**
 * Search products by name or SKU
 */
export function useProductSearch(query: string) {
    return useQuery({
        queryKey: ['products', 'search', query],
        queryFn: async (): Promise<Product[]> => {
            if (!query.trim()) return []

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('pos_visible', true)
                .eq('available_for_sale', true)
                .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
                .limit(20)

            if (error) throw error
            return data || []
        },
        enabled: query.length >= 2,
    })
}
