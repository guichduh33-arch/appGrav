/**
 * Hook for fetching raw material products (ARCH-005)
 * Extracted from PurchaseOrderFormPage.tsx
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IRawMaterial {
  id: string
  name: string
  sku: string
  cost_price: number | null
  unit: string | null
  product_type?: string | null
}

export function useRawMaterials() {
  return useQuery({
    queryKey: ['raw-materials'],
    queryFn: async (): Promise<IRawMaterial[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, cost_price, product_type, unit')
        .neq('is_active', false)
        .order('name')

      if (error) throw error

      // Filter raw materials in JavaScript (consistent with original implementation)
      if (data && data.length > 0) {
        const filtered = data.filter(p => p.product_type === 'raw_material')
        return filtered as IRawMaterial[]
      }

      return (data || []) as IRawMaterial[]
    },
    staleTime: 30_000,
  })
}
