import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types/database'
import { MOCK_CATEGORIES } from '../../data/mockCategories'

/**
 * Fetch all active product categories
 * Falls back to mock data if Supabase returns empty
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async (): Promise<Category[]> => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('show_in_pos', true)
                    .eq('is_active', true)
                    .order('sort_order')

                if (error) throw error
                if (data && data.length > 0) return data

                console.warn('No categories from Supabase, using mock')
                return MOCK_CATEGORIES
            } catch (err) {
                console.error('Error loading categories:', err)
                return MOCK_CATEGORIES
            }
        },
    })
}
