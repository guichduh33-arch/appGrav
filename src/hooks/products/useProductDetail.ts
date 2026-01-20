import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

/**
 * Fetch single product with its modifiers
 */
export function useProductWithModifiers(productId: string) {
    return useQuery({
        queryKey: ['product', productId, 'modifiers'],
        queryFn: async () => {
            // Get product
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq('id', productId)
                .single()

            if (productError || !product) {
                throw productError || new Error('Product not found')
            }

            const p = product as any

            // Get modifiers (by product_id or category_id)
            const { data: modifiers, error: modifiersError } = await supabase
                .from('product_modifiers')
                .select('*')
                .eq('is_active', true)
                .or(`product_id.eq.${productId},category_id.eq.${p.category_id}`)
                .order('group_sort_order')
                .order('option_sort_order')

            if (modifiersError) throw modifiersError

            return {
                product,
                modifiers: modifiers || [],
            }
        },
        enabled: !!productId,
    })
}

/**
 * Fetch single product by ID
 */
export function useProduct(productId: string) {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq('id', productId)
                .single()

            if (error) throw error
            return data
        },
        enabled: !!productId,
    })
}
