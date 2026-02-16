import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

/**
 * Partial product type for search results
 */
export interface IProductSearchResult {
    id: string
    sku: string | null
    name: string
    description: string | null
    category_id: string | null
    retail_price: number
    current_stock: number
    unit: string | null
    image_url: string | null
}

/**
 * Search products by name or SKU
 */
export function useProductSearch(query: string) {
    return useQuery({
        queryKey: ['products', 'search', query],
        queryFn: async (): Promise<IProductSearchResult[]> => {
            if (!query.trim()) return []

            const { data, error } = await supabase
                .from('products')
                .select('id, sku, name, description, category_id, retail_price, current_stock, unit, image_url')
                .eq('pos_visible', true)
                .eq('available_for_sale', true)
                .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
                .limit(20)

            if (error) throw error
            return (data ?? []) as IProductSearchResult[]
        },
        enabled: query.length >= 2,
    })
}
