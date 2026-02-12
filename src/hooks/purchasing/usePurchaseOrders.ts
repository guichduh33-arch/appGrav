import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { logError } from '@/utils/logger'

// Cache configuration
const PURCHASE_ORDERS_STALE_TIME = 30 * 1000 // 30 seconds

// ============================================================================
// TYPES
// ============================================================================

export type TPOStatus = 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled' | 'modified'
export type TPaymentStatus = 'unpaid' | 'partially_paid' | 'paid'

export interface IPurchaseOrder {
  id: string
  po_number: string
  supplier_id: string
  supplier?: { name: string }
  status: TPOStatus
  order_date: string
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  subtotal: number
  discount_amount: number
  discount_percentage: number | null
  tax_amount: number
  total_amount: number
  payment_status: TPaymentStatus
  payment_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: IPOItem[]
}

export interface IPOItem {
  id?: string
  purchase_order_id?: string
  product_id: string | null
  product_name: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  discount_amount: number
  discount_percentage: number | null
  tax_rate: number
  line_total: number
}

export interface IPurchaseOrderFilters {
  status?: TPOStatus
  paymentStatus?: TPaymentStatus
  supplierId?: string
  fromDate?: string
  toDate?: string
}

export interface ICreatePurchaseOrderParams {
  supplier_id: string
  expected_delivery_date?: string | null
  notes?: string
  discount_amount?: number
  discount_percentage?: number | null
  items: IPOItem[]
  sendToSupplier?: boolean
}

export interface IUpdatePurchaseOrderParams {
  id: string
  supplier_id: string
  expected_delivery_date?: string | null
  notes?: string
  discount_amount?: number
  discount_percentage?: number | null
  items: IPOItem[]
  status?: TPOStatus
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique PO number: PO-YYYYMM-XXXX
 * Format aligned with epic requirements
 */
export async function generatePONumber(): Promise<string> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

  const { data } = await supabase
    .from('purchase_orders')
    .select('po_number')
    .like('po_number', `PO-${yearMonth}-%`)
    .order('po_number', { ascending: false })
    .limit(1)

  if (!data || data.length === 0) {
    return `PO-${yearMonth}-0001`
  }

  const lastNumber = parseInt(data[0].po_number.split('-')[2])
  return `PO-${yearMonth}-${String(lastNumber + 1).padStart(4, '0')}`
}

/**
 * Calculate line total for a single item
 */
export function calculateLineTotal(item: Partial<IPOItem>): number {
  const quantity = item.quantity || 0
  const unitPrice = item.unit_price || 0
  const discountPercentage = item.discount_percentage
  const discountAmount = item.discount_amount || 0

  const subtotal = quantity * unitPrice
  const discount = discountPercentage
    ? subtotal * (discountPercentage / 100)
    : discountAmount

  return subtotal - discount
}

/**
 * Calculate totals for a purchase order
 */
export function calculatePOTotals(
  items: IPOItem[],
  globalDiscountAmount: number = 0,
  globalDiscountPercentage: number | null = null
): { subtotal: number; tax_amount: number; discount_amount: number; total_amount: number } {
  // Calculate subtotal from line totals
  const subtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0)

  // Calculate global discount
  const orderDiscount = globalDiscountPercentage
    ? subtotal * (globalDiscountPercentage / 100)
    : globalDiscountAmount

  // Calculate tax from each item's line_total and tax_rate
  const taxAmount = items.reduce((sum, item) => {
    const lineTotal = item.line_total || 0
    const taxRate = item.tax_rate || 0
    return sum + (lineTotal * taxRate / 100)
  }, 0)

  // Calculate final total
  const totalAmount = subtotal - orderDiscount + taxAmount

  return {
    subtotal,
    discount_amount: orderDiscount,
    tax_amount: taxAmount,
    total_amount: totalAmount
  }
}

// ============================================================================
// usePurchaseOrders - Fetch purchase orders list with filtering
// ============================================================================

/**
 * Hook to fetch purchase orders with optional filtering
 * Query key: ['purchase-orders', filters]
 */
export function usePurchaseOrders(filters?: IPurchaseOrderFilters) {
  return useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async (): Promise<IPurchaseOrder[]> => {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .order('order_date', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus)
      }

      if (filters?.supplierId) {
        query = query.eq('supplier_id', filters.supplierId)
      }

      if (filters?.fromDate) {
        query = query.gte('order_date', filters.fromDate)
      }

      if (filters?.toDate) {
        query = query.lte('order_date', filters.toDate)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []) as IPurchaseOrder[]
    },
    staleTime: PURCHASE_ORDERS_STALE_TIME,
  })
}

// ============================================================================
// usePurchaseOrder - Fetch single purchase order with items
// ============================================================================

/**
 * Hook to fetch a single purchase order with its items
 */
export function usePurchaseOrder(purchaseOrderId: string | null) {
  return useQuery({
    queryKey: ['purchase-order', purchaseOrderId],
    queryFn: async () => {
      if (!purchaseOrderId) return null

      // Fetch PO with supplier
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .eq('id', purchaseOrderId)
        .single()

      if (poError) throw poError

      // Fetch PO items
      const { data: items, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', purchaseOrderId)

      if (itemsError) throw itemsError

      return {
        ...po,
        items: (items || []) as IPOItem[]
      } as IPurchaseOrder
    },
    enabled: !!purchaseOrderId
  })
}

// ============================================================================
// useCreatePurchaseOrder - Create new purchase order mutation
// ============================================================================

/**
 * Hook to create a new purchase order
 * Invalidates ['purchase-orders'] query on success
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: ICreatePurchaseOrderParams) => {
      // ============================================================
      // TRANSACTION-LIKE OPERATIONS
      // Note: Supabase doesn't support client-side transactions.
      // If items insertion fails after PO creation, the PO exists but has no items.
      // Recovery: User can edit the PO to add items, or delete the draft PO.
      // ============================================================

      // 1. Generate PO number (no DB change yet)
      const poNumber = await generatePONumber()

      // 2. Calculate totals (no DB change)
      const totals = calculatePOTotals(
        params.items,
        params.discount_amount || 0,
        params.discount_percentage || null
      )

      // 3. Create PO header FIRST
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          po_number: poNumber,
          supplier_id: params.supplier_id,
          status: params.sendToSupplier ? 'sent' : 'draft',
          order_date: new Date().toISOString().slice(0, 10),
          expected_delivery_date: params.expected_delivery_date || null,
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          discount_percentage: params.discount_percentage || null,
          tax_amount: totals.tax_amount,
          total_amount: totals.total_amount,
          payment_status: 'unpaid',
          notes: params.notes || null,
        })
        .select()
        .single()

      if (poError) throw poError

      // 4. Create PO items
      if (params.items.length > 0) {
        const itemsToInsert = params.items.map(item => ({
          purchase_order_id: po.id,
          product_id: item.product_id,
          product_name: item.product_name,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          discount_percentage: item.discount_percentage || null,
          tax_rate: item.tax_rate || 10,
          line_total: item.line_total,
        }))

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert)

        if (itemsError) {
          // Log for debugging - PO created but items failed
          logError(`PO ${poNumber} created but items insertion failed`, itemsError)
          throw new Error(`ITEMS_INSERTION_FAILED: PO ${poNumber} created but items failed. Please edit the PO to add items.`)
        }
      }

      return po as IPurchaseOrder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

// ============================================================================
// useUpdatePurchaseOrder - Update existing purchase order mutation
// ============================================================================

/**
 * Hook to update an existing purchase order
 * Invalidates both list and single PO queries on success
 */
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: IUpdatePurchaseOrderParams) => {
      // ============================================================
      // TRANSACTION-LIKE OPERATIONS
      // Note: Supabase doesn't support client-side transactions.
      // Order: Header update → Delete old items → Insert new items
      // If item operations fail, header is updated but items may be incomplete.
      // Recovery: User can retry the update operation.
      // ============================================================

      // 1. Calculate totals (no DB change)
      const totals = calculatePOTotals(
        params.items,
        params.discount_amount || 0,
        params.discount_percentage || null
      )

      // 2. Update PO header FIRST (marks intent)
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .update({
          supplier_id: params.supplier_id,
          expected_delivery_date: params.expected_delivery_date || null,
          subtotal: totals.subtotal,
          discount_amount: totals.discount_amount,
          discount_percentage: params.discount_percentage || null,
          tax_amount: totals.tax_amount,
          total_amount: totals.total_amount,
          notes: params.notes || null,
          status: params.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single()

      if (poError) throw poError

      // 3. Delete old items
      const { error: deleteError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', params.id)

      if (deleteError) {
        logError(`PO ${params.id} header updated but old items deletion failed`, deleteError)
        throw new Error(`ITEMS_DELETE_FAILED: PO header updated but items cleanup failed. Please retry.`)
      }

      // 4. Insert new items
      if (params.items.length > 0) {
        const itemsToInsert = params.items.map(item => ({
          purchase_order_id: params.id,
          product_id: item.product_id,
          product_name: item.product_name,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          discount_percentage: item.discount_percentage || null,
          tax_rate: item.tax_rate || 10,
          line_total: item.line_total,
        }))

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert)

        if (itemsError) {
          logError(`PO ${params.id} items insertion failed after delete:`, itemsError)
          throw new Error(`ITEMS_INSERT_FAILED: PO header updated and old items deleted, but new items failed. Please add items manually.`)
        }
      }

      return po as IPurchaseOrder
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] })
    },
  })
}

// ============================================================================
// useDeletePurchaseOrder - Delete purchase order mutation
// ============================================================================

/**
 * Hook to delete a purchase order (only draft status allowed)
 * Invalidates ['purchase-orders'] query on success
 */
export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (purchaseOrderId: string) => {
      // First check if the PO is in draft status
      const { data: po, error: fetchError } = await supabase
        .from('purchase_orders')
        .select('status')
        .eq('id', purchaseOrderId)
        .single()

      if (fetchError) throw fetchError

      if (po.status !== 'draft') {
        // Use error code for i18n handling in calling component
        const error = new Error('DELETE_NOT_DRAFT')
        error.name = 'POValidationError'
        throw error
      }

      // Delete items first (foreign key constraint)
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', purchaseOrderId)

      if (itemsError) throw itemsError

      // Delete PO
      const { error: poError } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', purchaseOrderId)

      if (poError) throw poError

      return { id: purchaseOrderId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
  })
}

// ============================================================================
// useUpdatePurchaseOrderStatus - Update status mutation with history logging
// ============================================================================

export interface IUpdatePOStatusParams {
  purchaseOrderId: string
  status: TPOStatus
  previousStatus?: TPOStatus | null
  description?: string
  metadata?: Record<string, unknown>
}

/**
 * Map status to action_type for history logging
 */
function getActionTypeFromStatus(status: TPOStatus): string {
  switch (status) {
    case 'sent': return 'sent'
    case 'confirmed': return 'confirmed'
    case 'partially_received': return 'partially_received'
    case 'received': return 'received'
    case 'cancelled': return 'cancelled'
    case 'modified': return 'modified'
    default: return 'modified'
  }
}

/**
 * Get default description for status change
 */
function getDefaultDescription(status: TPOStatus): string {
  switch (status) {
    case 'sent': return 'Bon de commande envoyé au fournisseur'
    case 'confirmed': return 'Commande confirmée par le fournisseur'
    case 'partially_received': return 'Réception partielle enregistrée'
    case 'received': return 'Réception complète enregistrée'
    case 'cancelled': return 'Bon de commande annulé'
    case 'modified': return 'Bon de commande modifié'
    default: return `Statut modifié vers ${status}`
  }
}

/**
 * Hook to update purchase order status
 * Now automatically logs status change to purchase_order_history
 */
export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      purchaseOrderId,
      status,
      previousStatus,
      description,
      metadata,
    }: IUpdatePOStatusParams) => {
      const now = new Date().toISOString()
      const updateData: Record<string, unknown> = {
        status,
        updated_at: now,
      }

      // Set actual_delivery_date when status is received
      if (status === 'received') {
        updateData.actual_delivery_date = now.slice(0, 10)
      }

      // 1. If previousStatus not provided, fetch current status
      let prevStatus = previousStatus
      if (prevStatus === undefined) {
        const { data: currentPO, error: fetchError } = await supabase
          .from('purchase_orders')
          .select('status')
          .eq('id', purchaseOrderId)
          .single()

        if (fetchError) throw fetchError
        prevStatus = currentPO?.status as TPOStatus
      }

      // 2. Update status
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', purchaseOrderId)
        .select()
        .single()

      if (error) throw error

      // 3. Log to history
      const historyError = await supabase
        .from('purchase_order_history')
        .insert({
          purchase_order_id: purchaseOrderId,
          action_type: getActionTypeFromStatus(status),
          previous_status: prevStatus ?? null,
          new_status: status,
          description: description || getDefaultDescription(status),
          metadata: {
            ...metadata,
            updated_at: now,
          },
          created_at: now,
        })

      if (historyError.error) {
        logError('Failed to log PO history:', historyError.error)
        // Don't throw - history logging is secondary to status update
      }

      return data as IPurchaseOrder
    },
    onSuccess: (_, { purchaseOrderId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', purchaseOrderId] })
    },
  })
}
