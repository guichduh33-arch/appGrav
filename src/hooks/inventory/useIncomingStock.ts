/**
 * Hook for incoming stock (purchase orders with items) (ARCH-005)
 * Extracted from IncomingStockPage.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IIncomingPurchaseOrder {
  id: string
  po_number: string
  supplier: { id: string; name: string } | null
  status: string
  order_date: string
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  total_amount: number
  notes: string | null
  purchase_order_items: {
    id: string
    product: { id: string; name: string; sku: string } | null
    quantity: number
    quantity_received: number
    unit_price: number
    qc_passed: boolean | null
  }[]
}

export function useIncomingStock() {
  return useQuery({
    queryKey: ['incoming-stock'],
    queryFn: async (): Promise<IIncomingPurchaseOrder[]> => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          supplier:suppliers(id, name),
          status,
          order_date,
          expected_delivery_date,
          actual_delivery_date,
          total_amount,
          notes,
          purchase_order_items(
            id,
            product:products(id, name, sku),
            quantity,
            quantity_received,
            unit_price,
            qc_passed
          )
        `)
        .order('order_date', { ascending: false })
        .returns<IIncomingPurchaseOrder[]>()

      if (error) throw error
      return data ?? []
    },
    staleTime: 15_000,
  })
}

/**
 * Mutation to toggle qc_passed on a purchase_order_item
 */
export function useToggleQCPassed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, qcPassed }: { itemId: string; qcPassed: boolean | null }) => {
      const { error } = await supabase
        .from('purchase_order_items')
        .update({ qc_passed: qcPassed })
        .eq('id', itemId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incoming-stock'] })
    },
  })
}
