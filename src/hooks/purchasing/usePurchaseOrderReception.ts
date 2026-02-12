import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TPOStatus } from './usePurchaseOrders'
import { logPOHistory } from './usePurchaseOrderWorkflow'
import { logError } from '@/utils/logger'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parameters for receiving a PO item
 */
export interface IReceivePOItemParams {
  purchaseOrderId: string
  itemId: string
  quantityReceived: number
}

/**
 * Result of a reception operation
 */
export interface IReceivePOItemResult {
  itemId: string
  quantityReceived: number
  delta: number
  newPOStatus: TPOStatus
  stockMovementCreated: boolean
}

/**
 * PO Item data for reception calculations
 */
interface IPOItemData {
  id: string
  product_id: string | null
  product_name: string
  quantity: number
  quantity_received: number
  unit_price: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the reception status based on all items
 * @param items - Array of PO items with quantity and quantity_received
 * @returns 'received' if all complete, 'partially_received' otherwise
 */
export function calculateReceptionStatus(
  items: Array<{ quantity: number; quantity_received: number }>
): 'received' | 'partially_received' {
  const allReceived = items.every(
    (item) => (item.quantity_received || 0) >= (item.quantity || 0)
  )
  return allReceived ? 'received' : 'partially_received'
}

// logPOHistory is imported from usePurchaseOrderWorkflow.ts to avoid duplication

// ============================================================================
// VALID STATUSES FOR RECEPTION
// ============================================================================

const RECEPTION_VALID_STATUSES: TPOStatus[] = ['confirmed', 'partially_received']

/**
 * Check if reception is allowed for the given PO status
 */
export function canReceiveItems(status: TPOStatus): boolean {
  return RECEPTION_VALID_STATUSES.includes(status)
}

// ============================================================================
// useReceivePOItem - Main reception mutation
// ============================================================================

/**
 * Hook to receive items from a purchase order
 * Handles:
 * - Validation of PO status (must be confirmed or partially_received)
 * - Update of quantity_received in purchase_order_items
 * - Creation of stock movement if product_id exists
 * - Update of products.current_stock
 * - Logging to purchase_order_history
 * - Automatic PO status update (partially_received or received)
 */
export function useReceivePOItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: IReceivePOItemParams): Promise<IReceivePOItemResult> => {
      const { purchaseOrderId, itemId, quantityReceived } = params

      // 1. Validate PO status
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select('status, po_number')
        .eq('id', purchaseOrderId)
        .single()

      if (poError) throw poError
      if (!po) throw new Error('PO_NOT_FOUND')

      const currentStatus = po.status as TPOStatus
      if (!canReceiveItems(currentStatus)) {
        const error = new Error('INVALID_PO_STATUS')
        error.name = 'POReceptionError'
        throw error
      }

      // 2. Get current item data
      const { data: item, error: itemError } = await supabase
        .from('purchase_order_items')
        .select('id, product_id, product_name, quantity, quantity_received, unit_price')
        .eq('id', itemId)
        .single()

      if (itemError) throw itemError
      if (!item) throw new Error('ITEM_NOT_FOUND')

      const typedItem = item as IPOItemData
      const previousReceived = typedItem.quantity_received || 0
      const delta = quantityReceived - previousReceived

      let stockMovementCreated = false

      // 3. Update stock if delta != 0 and product_id exists
      if (delta !== 0 && typedItem.product_id) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('current_stock')
          .eq('id', typedItem.product_id)
          .single()

        if (productError) {
          logError('Error fetching product:', productError)
        } else if (product) {
          const currentStock = product.current_stock || 0
          const newStock = currentStock + delta

          // Create stock movement
          const movementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
          const { error: movementError } = await supabase.from('stock_movements').insert({
            movement_id: movementId,
            product_id: typedItem.product_id,
            movement_type: 'stock_in',
            quantity: delta,
            stock_before: currentStock,
            stock_after: newStock,
            unit_cost: typedItem.unit_price,
            reference_type: 'purchase_order',
            reference_id: purchaseOrderId,
            reason: `Réception PO ${po.po_number || ''}`,
            notes: `${typedItem.product_name} - ${delta > 0 ? '+' : ''}${delta}`,
          })

          if (movementError) {
            logError('Error creating stock movement:', movementError)
            throw movementError
          }

          // Update product stock
          const { error: stockUpdateError } = await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', typedItem.product_id)

          if (stockUpdateError) {
            logError('Error updating product stock:', stockUpdateError)
            throw stockUpdateError
          }

          stockMovementCreated = true
        }
      }

      // 4. Update item quantity_received
      const { error: updateError } = await supabase
        .from('purchase_order_items')
        .update({ quantity_received: quantityReceived })
        .eq('id', itemId)

      if (updateError) throw updateError

      // 5. Log history if delta != 0
      if (delta !== 0) {
        await logPOHistory({
          purchaseOrderId,
          actionType: 'partially_received',
          previousStatus: currentStatus,
          newStatus: null, // Will be set after status calculation
          description:
            delta > 0
              ? `Réception de ${delta} unité(s) de ${typedItem.product_name}`
              : `Ajustement réception: ${typedItem.product_name} (${previousReceived} → ${quantityReceived})`,
          metadata: {
            product_name: typedItem.product_name,
            quantity_received: delta > 0 ? delta : quantityReceived,
            previous_received: previousReceived,
            new_received: quantityReceived,
            total_ordered: typedItem.quantity,
          },
        })
      }

      // 6. Calculate and update PO status
      const { data: allItems, error: allItemsError } = await supabase
        .from('purchase_order_items')
        .select('quantity, quantity_received')
        .eq('purchase_order_id', purchaseOrderId)

      if (allItemsError) throw allItemsError

      // Update the item we just changed in the array for accurate calculation
      const itemsForCalculation = (allItems || []).map((i) =>
        i === item ? { ...i, quantity_received: quantityReceived } : i
      ) as Array<{ quantity: number; quantity_received: number }>

      const newPOStatus = calculateReceptionStatus(itemsForCalculation)

      // Update PO status
      const updateData: Record<string, unknown> = { status: newPOStatus }
      if (newPOStatus === 'received') {
        updateData.actual_delivery_date = new Date().toISOString()
      }

      const { error: poUpdateError } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', purchaseOrderId)

      if (poUpdateError) throw poUpdateError

      return {
        itemId,
        quantityReceived,
        delta,
        newPOStatus,
        stockMovementCreated,
      }
    },
    onSuccess: (_result, params) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', params.purchaseOrderId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
    },
  })
}

// ============================================================================
// useUpdatePOReceptionStatus - Standalone status update
// ============================================================================

/**
 * Hook to recalculate and update PO status based on all items
 * Useful for batch operations or manual status recalculation
 */
export function useUpdatePOReceptionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (purchaseOrderId: string): Promise<TPOStatus> => {
      // Get all items for this PO
      const { data: items, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('quantity, quantity_received')
        .eq('purchase_order_id', purchaseOrderId)

      if (itemsError) throw itemsError

      const typedItems = (items || []) as Array<{ quantity: number; quantity_received: number }>
      const newStatus = calculateReceptionStatus(typedItems)

      // Update PO status
      const updateData: Record<string, unknown> = { status: newStatus }
      if (newStatus === 'received') {
        updateData.actual_delivery_date = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', purchaseOrderId)

      if (updateError) throw updateError

      return newStatus
    },
    onSuccess: (_, purchaseOrderId) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', purchaseOrderId] })
    },
  })
}
