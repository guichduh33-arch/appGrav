/**
 * Hook for stock opname (inventory counts) (ARCH-005)
 * Extracted from StockOpnameList.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InventoryCount, ISection } from '@/types/database'

export interface IInventoryCountWithSection extends InventoryCount {
  section?: ISection | null
}

export function useInventoryCounts() {
  return useQuery({
    queryKey: ['inventory-counts'],
    queryFn: async (): Promise<IInventoryCountWithSection[]> => {
      const { data, error } = await supabase
        .from('inventory_counts')
        .select('*, section:sections(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as IInventoryCountWithSection[]
    },
    staleTime: 15_000,
  })
}

export function useCreateInventoryCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sectionId: string) => {
      const countNumber = `INV-${Date.now()}`
      const { data, error } = await supabase
        .from('inventory_counts')
        .insert({
          count_number: countNumber,
          notes: 'New inventory',
          status: 'draft' as const,
          section_id: sectionId,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-counts'] })
    },
  })
}
