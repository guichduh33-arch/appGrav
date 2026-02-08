import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  ITransferWithLocations,
  ITransferItemWithProduct,
  TTransferStatus
} from '@/types/database'

// Cache configuration
const TRANSFERS_STALE_TIME = 30 * 1000 // 30 seconds - transfers change frequently

// ============================================================================
// TYPES
// ============================================================================

export interface ITransferFilters {
  status?: TTransferStatus
  fromDate?: string
  toDate?: string
  fromLocationId?: string
  toLocationId?: string
}

export interface ICreateTransferParams {
  fromLocationId?: string
  toLocationId?: string
  fromSectionId?: string
  toSectionId?: string
  items: Array<{ productId: string; quantity: number }>
  responsiblePerson: string
  transferDate?: string
  notes?: string
  sendDirectly?: boolean
}

export interface IReceiveTransferParams {
  transferId: string
  items: Array<{
    itemId: string
    quantityReceived: number
  }>
  receptionNotes?: string
}

// ============================================================================
// useInternalTransfers - Fetch transfers list with filtering
// ============================================================================

/**
 * Hook to fetch internal transfers with optional filtering
 * Query key: ['internal-transfers', filters]
 */
export function useInternalTransfers(filters?: ITransferFilters) {
  return useQuery({
    queryKey: ['internal-transfers', filters],
    queryFn: async (): Promise<ITransferWithLocations[]> => {
      let query = supabase
        .from('internal_transfers')
        .select(`
          *,
          from_location:stock_locations!internal_transfers_from_location_id_fkey(id, name, code, location_type),
          to_location:stock_locations!internal_transfers_to_location_id_fkey(id, name, code, location_type),
          from_section:sections!internal_transfers_from_section_id_fkey(id, name, code, section_type, icon),
          to_section:sections!internal_transfers_to_section_id_fkey(id, name, code, section_type, icon)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.fromDate) {
        query = query.gte('created_at', filters.fromDate)
      }

      if (filters?.toDate) {
        query = query.lte('created_at', `${filters.toDate}T23:59:59`)
      }

      if (filters?.fromLocationId) {
        query = query.eq('from_location_id', filters.fromLocationId)
      }

      if (filters?.toLocationId) {
        query = query.eq('to_location_id', filters.toLocationId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return (data || []) as ITransferWithLocations[]
    },
    staleTime: TRANSFERS_STALE_TIME,
  })
}

// ============================================================================
// useTransfer - Fetch single transfer with items
// ============================================================================

/**
 * Hook to fetch a single transfer with its items
 */
export function useTransfer(transferId: string | null) {
  return useQuery({
    queryKey: ['internal-transfer', transferId],
    queryFn: async () => {
      if (!transferId) return null

      // Fetch transfer with locations and sections
      const { data: transfer, error: transferError } = await supabase
        .from('internal_transfers')
        .select(`
          *,
          from_location:stock_locations!internal_transfers_from_location_id_fkey(id, name, code, location_type),
          to_location:stock_locations!internal_transfers_to_location_id_fkey(id, name, code, location_type),
          from_section:sections!internal_transfers_from_section_id_fkey(id, name, code, section_type, icon),
          to_section:sections!internal_transfers_to_section_id_fkey(id, name, code, section_type, icon)
        `)
        .eq('id', transferId)
        .single()

      if (transferError) throw transferError

      // Fetch transfer items
      const { data: items, error: itemsError } = await supabase
        .from('transfer_items')
        .select(`
          *,
          product:products(id, name, sku, cost_price)
        `)
        .eq('transfer_id', transferId)

      if (itemsError) throw itemsError

      return {
        ...transfer,
        items: items as ITransferItemWithProduct[]
      } as ITransferWithLocations & { items: ITransferItemWithProduct[] }
    },
    enabled: !!transferId
  })
}

// ============================================================================
// useCreateTransfer - Create new transfer mutation
// ============================================================================

/**
 * Generate unique transfer number: TR-YYYYMMDD-XXXX
 */
function generateTransferNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TR-${date}-${random}`
}

/**
 * Hook to create a new internal transfer
 * Invalidates ['internal-transfers'] query on success
 */
export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: ICreateTransferParams) => {
      const transferNumber = generateTransferNumber()

      // Build insert object - support both location-based and section-based transfers
      const insertData: Record<string, unknown> = {
        transfer_number: transferNumber,
        responsible_person: params.responsiblePerson,
        transfer_date: params.transferDate || new Date().toISOString().slice(0, 10),
        status: params.sendDirectly ? 'pending' : 'draft',
        notes: params.notes || null,
      }

      // Add location IDs if provided (legacy support)
      if (params.fromLocationId) {
        insertData.from_location_id = params.fromLocationId
      }
      if (params.toLocationId) {
        insertData.to_location_id = params.toLocationId
      }

      // Add section IDs if provided (new section-based model)
      if (params.fromSectionId) {
        insertData.from_section_id = params.fromSectionId
      }
      if (params.toSectionId) {
        insertData.to_section_id = params.toSectionId
      }

      // Create transfer header
      const { data: transfer, error: transferError } = await supabase
        .from('internal_transfers')
        .insert(insertData)
        .select()
        .single()

      if (transferError) throw transferError

      // Create transfer items
      if (params.items.length > 0) {
        const itemsToInsert = params.items.map(item => ({
          transfer_id: transfer.id,
          product_id: item.productId,
          quantity_requested: item.quantity,
          quantity_received: 0,
        }))

        const { error: itemsError } = await supabase
          .from('transfer_items')
          .insert(itemsToInsert)

        if (itemsError) throw itemsError
      }

      return transfer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-transfers'] })
    },
  })
}

// ============================================================================
// useUpdateTransferStatus - Update transfer status mutation
// ============================================================================

export interface IUpdateTransferStatusParams {
  transferId: string
  status: TTransferStatus
}

/**
 * Hook to update transfer status
 */
export function useUpdateTransferStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ transferId, status }: IUpdateTransferStatusParams) => {
      const { data, error } = await supabase
        .from('internal_transfers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', transferId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, { transferId }) => {
      queryClient.invalidateQueries({ queryKey: ['internal-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['internal-transfer', transferId] })
    },
  })
}

// ============================================================================
// useReceiveTransfer - Receive transfer and generate stock movements
// ============================================================================

/**
 * Hook to receive a transfer and generate stock movements
 * - Updates transfer_items.quantity_received for each item
 * - Creates stock_movements (OUT from source, IN to destination)
 * - Updates internal_transfers.status to 'received'
 * - Invalidates related queries on success
 */
export function useReceiveTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: IReceiveTransferParams) => {
      // 1. Fetch transfer details for locations and items
      const { data: transfer, error: fetchError } = await supabase
        .from('internal_transfers')
        .select(`
          *,
          transfer_items(*)
        `)
        .eq('id', params.transferId)
        .single()

      if (fetchError) throw fetchError
      if (!transfer) throw new Error('Transfer not found')

      // Validate transfer can be received
      if (transfer.status !== 'pending' && transfer.status !== 'in_transit') {
        throw new Error(`Cannot receive transfer with status: ${transfer.status}`)
      }

      // Get current user ID for audit trail (do this early, no DB change)
      const { data: { user } } = await supabase.auth.getUser()

      // Prepare notes before any DB operations
      const updatedNotes = params.receptionNotes
        ? `${transfer.notes || ''}\n[Réception]: ${params.receptionNotes}`.trim()
        : transfer.notes

      // ============================================================
      // TRANSACTION-LIKE OPERATIONS
      // Note: Supabase doesn't support client-side transactions.
      // Operations are ordered to minimize orphan data risk:
      // 1. Update status FIRST (marks intent, idempotent)
      // 2. Update item quantities (reversible)
      // 3. Create stock_movements LAST (most critical)
      // If step 3 fails, transfer is 'received' but movements missing
      // - Detectable via: status='received' but no stock_movements
      // - Recovery: re-run reception or manual adjustment
      // ============================================================

      // 2. Update transfer status to 'received' FIRST (marks intent)
      // Guard: only update if status is still pending/in_transit (optimistic lock)
      const { data: updatedTransfer, error: statusError } = await supabase
        .from('internal_transfers')
        .update({
          status: 'received',
          approved_by: user?.id ?? null,
          approved_at: new Date().toISOString(),
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.transferId)
        .in('status', ['pending', 'in_transit'])
        .select()

      if (statusError) throw statusError
      if (!updatedTransfer || updatedTransfer.length === 0) {
        throw new Error('Transfer has already been received or cancelled by another user. Please refresh the page.')
      }

      // 3. Update each transfer_item with quantity_received
      for (const item of params.items) {
        const { error: itemError } = await supabase
          .from('transfer_items')
          .update({ quantity_received: item.quantityReceived })
          .eq('id', item.itemId)

        if (itemError) {
          // Log error but don't fail completely - status already updated
          console.error(`Failed to update item ${item.itemId}:`, itemError)
          throw itemError
        }
      }

      // 4. Check if stock movements already exist for this transfer (idempotency guard)
      const { data: existingMovements } = await supabase
        .from('stock_movements')
        .select('id')
        .eq('reference_type', 'transfer')
        .eq('reference_id', params.transferId)
        .limit(1)

      if (existingMovements && existingMovements.length > 0) {
        // Movements already created (e.g. from a previous partial attempt) - skip
        return transfer
      }

      // 5. Create stock_movements for each item
      const stockMovements: Array<{
        movement_id: string
        product_id: string
        from_location_id: string | null
        to_location_id: string | null
        movement_type: string
        quantity: number
        reference_type: string
        reference_id: string
        reason: string
        stock_before: number
        stock_after: number
      }> = []

      let movementCounter = 1
      const timestamp = Date.now().toString(36).toUpperCase()

      for (const item of params.items) {
        const transferItem = transfer.transfer_items.find(
          (ti: { id: string }) => ti.id === item.itemId
        )
        if (!transferItem) continue

        // OUT from source location (negative quantity)
        stockMovements.push({
          movement_id: `MV-${timestamp}-${movementCounter++}`,
          product_id: transferItem.product_id,
          from_location_id: transfer.from_location_id,
          to_location_id: null,
          movement_type: 'transfer_out',
          quantity: -Math.abs(item.quantityReceived),
          reference_type: 'transfer',
          reference_id: params.transferId,
          reason: `Transfer ${transfer.transfer_number} - OUT`,
          // TODO: Query actual stock levels for accurate tracking
          stock_before: 0,
          stock_after: 0,
        })

        // IN to destination location (positive quantity)
        stockMovements.push({
          movement_id: `MV-${timestamp}-${movementCounter++}`,
          product_id: transferItem.product_id,
          from_location_id: null,
          to_location_id: transfer.to_location_id,
          movement_type: 'transfer_in',
          quantity: Math.abs(item.quantityReceived),
          reference_type: 'transfer',
          reference_id: params.transferId,
          reason: `Transfer ${transfer.transfer_number} - IN`,
          // TODO: Query actual stock levels for accurate tracking
          stock_before: 0,
          stock_after: 0,
        })
      }

      const { error: movementsError } = await supabase
        .from('stock_movements')
        .insert(stockMovements)

      if (movementsError) {
        // Critical: status is 'received' but movements failed
        // Log for manual recovery, but throw to notify user
        console.error(`CRITICAL: Transfer ${transfer.transfer_number} marked received but stock_movements failed:`, movementsError)
        throw new Error(`Stock movements creation failed. Transfer marked received but inventory not updated. Contact support. Error: ${movementsError.message}`)
      }

      return transfer
    },
    onSuccess: (_, { transferId }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['internal-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['internal-transfer', transferId] })
      queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
    },
  })
}
