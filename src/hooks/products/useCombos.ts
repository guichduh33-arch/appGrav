import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ProductCombo } from '../../types/database'
import { logError } from '@/utils/logger'

/**
 * Fetch active combos available at POS
 */
export function usePOSCombos() {
    return useQuery({
        queryKey: ['pos-combos'],
        queryFn: async (): Promise<ProductCombo[]> => {
            const { data, error } = await supabase
                .from('product_combos')
                .select('*')
                .eq('is_active', true)
                .eq('available_at_pos', true)
                .order('sort_order', { ascending: true })

            if (error) {
                logError('Error fetching POS combos:', error)
                return []
            }

            return data || []
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
