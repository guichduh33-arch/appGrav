import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { TPOStatus } from './usePurchaseOrders'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Action types that can be logged in purchase_order_history
 */
export type TPOHistoryAction =
  | 'created'
  | 'sent'
  | 'confirmed'
  | 'partially_received'
  | 'received'
  | 'cancelled'
  | 'modified'
  | 'payment_made'
  | 'item_returned'

/**
 * Workflow actions that can be performed on a PO
 */
export type TPOWorkflowAction = 'send' | 'confirm' | 'cancel' | 'receive'

/**
 * Parameters for logging PO history
 */
export interface ILogPOHistoryParams {
  purchaseOrderId: string
  actionType: TPOHistoryAction
  previousStatus?: TPOStatus | null
  newStatus?: TPOStatus | null
  description: string
  metadata?: Record<string, unknown>
}

/**
 * Parameters for cancel mutation
 */
export interface ICancelOrderParams {
  purchaseOrderId: string
  reason?: string
}

// ============================================================================
// WORKFLOW STATE MACHINE
// ============================================================================

/**
 * Valid workflow transitions from each status
 * Returns available actions for the given status
 */
export function getValidTransitions(currentStatus: TPOStatus): TPOWorkflowAction[] {
  switch (currentStatus) {
    case 'draft':
      return ['send', 'cancel']
    case 'sent':
      return ['confirm', 'cancel']
    case 'confirmed':
      return ['receive']
    case 'partially_received':
      return ['receive']
    case 'received':
      return []
    case 'cancelled':
      return []
    case 'modified':
      return ['send', 'cancel']
    default:
      return []
  }
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(
  currentStatus: TPOStatus,
  action: TPOWorkflowAction
): boolean {
  return getValidTransitions(currentStatus).includes(action)
}

// ============================================================================
// EXPORTED HELPER - Log PO History
// ============================================================================

/**
 * Log an action to purchase_order_history
 * Used by workflow mutations and reception operations
 */
export async function logPOHistory(params: ILogPOHistoryParams): Promise<void> {
  const { error } = await supabase
    .from('purchase_order_history')
    .insert({
      purchase_order_id: params.purchaseOrderId,
      action_type: params.actionType,
      previous_status: params.previousStatus ?? null,
      new_status: params.newStatus ?? null,
      description: params.description,
      metadata: params.metadata ?? null,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to log PO history:', error)
    // Don't throw - history logging is secondary to status update
  }
}

/**
 * Exported hook to log PO history (for use by other components)
 */
export function useLogPOHistory() {
  return useMutation({
    mutationFn: logPOHistory,
  })
}

// ============================================================================
// useSendToSupplier - Transition draft → sent
// ============================================================================

/**
 * Hook to send a PO to supplier (draft → sent)
 * Creates history entry with sent_date metadata
 */
export function useSendToSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (purchaseOrderId: string) => {
      // 1. Fetch current status to validate transition
      const { data: po, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('status')
        .eq('id', purchaseOrderId)
        .single()

      if (fetchError) throw fetchError

      const currentStatus = po?.status as TPOStatus

      // 2. Validate transition
      if (!isValidTransition(currentStatus, 'send')) {
        const error = new Error('INVALID_TRANSITION')
        error.name = 'POWorkflowError'
        throw error
      }

      const sentDate = new Date().toISOString()

      // 3. Update status to sent
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'sent',
          updated_at: sentDate,
        })
        .eq('id', purchaseOrderId)
        .select()
        .single()

      if (error) throw error

      // 4. Log history
      await logPOHistory({
        purchaseOrderId,
        actionType: 'sent',
        previousStatus: currentStatus,
        newStatus: 'sent',
        description: 'Bon de commande envoyé au fournisseur',
        metadata: { sent_date: sentDate },
      })

      return data
    },
    onSuccess: (_, purchaseOrderId) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', purchaseOrderId] })
    },
  })
}

// ============================================================================
// useConfirmOrder - Transition sent → confirmed
// ============================================================================

/**
 * Hook to confirm a PO (sent → confirmed)
 * Called when supplier confirms the order
 */
export function useConfirmOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (purchaseOrderId: string) => {
      // 1. Fetch current status to validate transition
      const { data: po, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('status')
        .eq('id', purchaseOrderId)
        .single()

      if (fetchError) throw fetchError

      const currentStatus = po?.status as TPOStatus

      // 2. Validate transition
      if (!isValidTransition(currentStatus, 'confirm')) {
        const error = new Error('INVALID_TRANSITION')
        error.name = 'POWorkflowError'
        throw error
      }

      const confirmedDate = new Date().toISOString()

      // 3. Update status to confirmed
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'confirmed',
          updated_at: confirmedDate,
        })
        .eq('id', purchaseOrderId)
        .select()
        .single()

      if (error) throw error

      // 4. Log history
      await logPOHistory({
        purchaseOrderId,
        actionType: 'confirmed',
        previousStatus: currentStatus,
        newStatus: 'confirmed',
        description: 'Commande confirmée par le fournisseur',
        metadata: { confirmed_date: confirmedDate },
      })

      return data
    },
    onSuccess: (_, purchaseOrderId) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', purchaseOrderId] })
    },
  })
}

// ============================================================================
// useCancelOrder - Transition draft/sent → cancelled
// ============================================================================

/**
 * Hook to cancel a PO (draft/sent → cancelled)
 * Only allowed from draft or sent status
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ purchaseOrderId, reason }: ICancelOrderParams) => {
      // 1. Fetch current status to validate transition
      const { data: po, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('status')
        .eq('id', purchaseOrderId)
        .single()

      if (fetchError) throw fetchError

      const currentStatus = po?.status as TPOStatus

      // 2. Validate transition
      if (!isValidTransition(currentStatus, 'cancel')) {
        const error = new Error('INVALID_TRANSITION')
        error.name = 'POWorkflowError'
        throw error
      }

      const cancelledDate = new Date().toISOString()

      // 3. Update status to cancelled
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'cancelled',
          updated_at: cancelledDate,
        })
        .eq('id', purchaseOrderId)
        .select()
        .single()

      if (error) throw error

      // 4. Log history with optional reason
      await logPOHistory({
        purchaseOrderId,
        actionType: 'cancelled',
        previousStatus: currentStatus,
        newStatus: 'cancelled',
        description: 'Bon de commande annulé',
        metadata: {
          cancelled_at: cancelledDate,
          reason: reason || null,
        },
      })

      return data
    },
    onSuccess: (_, { purchaseOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', purchaseOrderId] })
    },
  })
}
