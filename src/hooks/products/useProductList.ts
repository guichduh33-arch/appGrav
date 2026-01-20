import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ProductWithCategory } from '../../types/database'
import { MOCK_PRODUCTS } from '../useProducts'

/**
 * Fetch products list, optionally filtered by category
 * Falls back to mock data if Supabase returns empty
 */
export function useProducts(categoryId: string | null = null) {
    return useQuery({
        queryKey: ['products', categoryId],
        queryFn: async (): Promise<ProductWithCategory[]> => {
            try {
                let query = supabase
                    .from('products')
                    .select('*, category:categories(*)')
                    .eq('pos_visible', true)
                    .eq('available_for_sale', true)
                    .eq('is_active', true)
                    .order('name')

                if (categoryId) {
                    query = query.eq('category_id', categoryId)
                }

                const { data, error } = await query

                if (error) throw error
                if (data && data.length > 0) return data as ProductWithCategory[]

                console.warn('No products from Supabase, using mock')
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId)
                }
                return MOCK_PRODUCTS
            } catch (err) {
                console.error('Error loading products:', err)
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId)
                }
                return MOCK_PRODUCTS
            }
        },
    })
}

/**
 * Alias for useProducts - used by some components
 */
export function useProductList(categoryId: string | null = null) {
    return useProducts(categoryId)
}
