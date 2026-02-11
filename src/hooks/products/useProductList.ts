import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ProductWithCategory } from '../../types/database'
import { MOCK_PRODUCTS } from '../../data/mockProducts'

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
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
            } catch (err) {
                console.error('Error loading products:', err)
                if (categoryId) {
                    return MOCK_PRODUCTS.filter(p => p.category_id === categoryId) as ProductWithCategory[]
                }
                return MOCK_PRODUCTS as ProductWithCategory[]
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

export interface IProductListItem {
    id: string
    name: string
    sku: string
}

/**
 * Lightweight product list for filters/dropdowns (id, name, sku only).
 */
export function useProductListSimple() {
    return useQuery({
        queryKey: ['products-list-simple'],
        queryFn: async (): Promise<IProductListItem[]> => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku')
                .order('name')

            if (error) throw error
            return data ?? []
        },
    })
}
