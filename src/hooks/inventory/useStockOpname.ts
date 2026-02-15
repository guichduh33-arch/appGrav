/**
 * Hook for stock opname (inventory counts) (ARCH-005)
 * Extracted from StockOpnameList.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InventoryCount, ISection, StockLocation } from '@/types/database'

export interface IInventoryCountWithSection extends InventoryCount {
  section?: ISection | null
  location?: StockLocation | null
}

export function useInventoryCounts() {
  return useQuery({
    queryKey: ['inventory-counts'],
    queryFn: async (): Promise<IInventoryCountWithSection[]> => {
      const { data, error } = await supabase
        .from('inventory_counts')
        .select('*, section:sections(*), location:stock_locations(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as IInventoryCountWithSection[]
    },
    staleTime: 15_000,
  })
}

export interface ICreateInventoryCountParams {
  sectionId: string
  locationId?: string | null
}

export function useCreateInventoryCount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: string | ICreateInventoryCountParams) => {
      // Support both legacy string param and new object param
      const sectionId = typeof params === 'string' ? params : params.sectionId
      const locationId = typeof params === 'string' ? null : (params.locationId ?? null)

      const countNumber = `INV-${Date.now()}`
      const { data, error } = await supabase
        .from('inventory_counts')
        .insert({
          count_number: countNumber,
          notes: 'New inventory',
          status: 'draft' as const,
          section_id: sectionId,
          location_id: locationId,
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
