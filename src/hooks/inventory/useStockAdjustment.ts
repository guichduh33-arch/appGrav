import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import logger from '@/utils/logger'

// Local type definition to avoid import issues
interface ISupplier {
  id: string
  name: string
  is_active: boolean
}

export type TStockAdjustmentType = 'purchase' | 'stock_in' | 'waste' | 'adjustment_in' | 'adjustment_out' | 'transfer'

export interface IStockAdjustmentParams {
  productId: string
  type: TStockAdjustmentType
  quantity: number
  reason: string
  notes?: string
  supplierId?: string
}

/**
 * Hook to fetch active suppliers
 */
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<ISupplier[]> => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name')
        .returns<ISupplier[]>()

      if (error) {
        throw error
      }

      return data || []
    }
  })
}

/**
 * Hook to perform stock adjustments (mutations)
 * Creates a stock movement record and invalidates relevant caches
 */
export function useStockAdjustment() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      productId,
      type,
      quantity,
      reason,
      notes,
      supplierId
    }: IStockAdjustmentParams) => {
      if (!user) {
        throw new Error('User must be logged in to perform stock adjustments')
      }

      // Ensure quantity sign is correct based on movement type
      // Outgoing movements (waste, adjustment_out) should be negative
      const isOutgoing = type === 'waste' || type === 'adjustment_out'
      const signedQuantity = isOutgoing ? -Math.abs(quantity) : Math.abs(quantity)

      const movementData = {
        product_id: productId,
        movement_type: type,
        quantity: signedQuantity,
        reason: reason,
        notes: notes || null,
        created_by: user.id,
        supplier_id: supplierId || null
      }

      const { data, error } = await supabase
        .from('stock_movements')
        .insert(movementData)
        .select('id, movement_id, product_id, movement_type, quantity, reason, reference_id, stock_before, stock_after, unit, notes, created_by, supplier_id, created_at')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
    },
    onError: (error: Error) => {
      logger.error('[useStockAdjustment] Stock adjustment failed:', error.message)
    }
  })
}
