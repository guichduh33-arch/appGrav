import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IProductPriceChange {
    id: string
    product_id: string
    field_changed: string
    old_value: number | null
    new_value: number | null
    changed_by: string | null
    changed_at: string
}

export function useProductPriceHistory(productId: string | undefined) {
    return useQuery({
        queryKey: ['product-price-history', productId],
        queryFn: async () => {
            if (!productId) return []

            const { data, error } = await supabase
                .from('product_price_history')
                .select('*')
                .eq('product_id', productId)
                .order('changed_at', { ascending: false })
                .limit(50)

            if (error) throw error
            return (data ?? []) as IProductPriceChange[]
        },
        enabled: !!productId,
    })
}
