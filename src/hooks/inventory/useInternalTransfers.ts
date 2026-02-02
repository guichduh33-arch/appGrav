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
  fromLocationId: string
  toLocationId: string
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
          to_location:stock_locations!internal_transfers_to_location_id_fkey(id, name, code, location_type)
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

      // Fetch transfer with locations
      const { data: transfer, error: transferError } = await supabase
        .from('internal_transfers')
        .select(`
          *,
          from_location:stock_locations!internal_transfers_from_location_id_fkey(id, name, code, location_type),
          to_location:stock_locations!internal_transfers_to_location_id_fkey(id, name, code, location_type)
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

      // Create transfer header
      const { data: transfer, error: transferError } = await supabase
        .from('internal_transfers')
        .insert({
          transfer_number: transferNumber,
          from_location_id: params.fromLocationId,
          to_location_id: params.toLocationId,
          responsible_person: params.responsiblePerson,
          transfer_date: params.transferDate || new Date().toISOString().slice(0, 10),
          status: params.sendDirectly ? 'pending' : 'draft',
          notes: params.notes || null,
        })
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

      // 2. Update each transfer_item with quantity_received
      for (const item of params.items) {
        const { error: itemError } = await supabase
          .from('transfer_items')
          .update({ quantity_received: item.quantityReceived })
          .eq('id', item.itemId)

        if (itemError) throw itemError
      }

      // 3. Create stock_movements for each item
      const stockMovements: Array<{
        product_id: string
        location_id: string
        movement_type: string
        quantity: number
        reference_type: string
        reference_id: string
        notes: string
      }> = []

      for (const item of params.items) {
        const transferItem = transfer.transfer_items.find(
          (ti: { id: string }) => ti.id === item.itemId
        )
        if (!transferItem) continue

        // OUT from source location (negative quantity)
        stockMovements.push({
          product_id: transferItem.product_id,
          location_id: transfer.from_location_id,
          movement_type: 'out',
          quantity: -Math.abs(item.quantityReceived),
          reference_type: 'transfer',
          reference_id: params.transferId,
          notes: `Transfer ${transfer.transfer_number} - OUT`,
        })

        // IN to destination location (positive quantity)
        stockMovements.push({
          product_id: transferItem.product_id,
          location_id: transfer.to_location_id,
          movement_type: 'in',
          quantity: Math.abs(item.quantityReceived),
          reference_type: 'transfer',
          reference_id: params.transferId,
          notes: `Transfer ${transfer.transfer_number} - IN`,
        })
      }

      const { error: movementsError } = await supabase
        .from('stock_movements')
        .insert(stockMovements)

      if (movementsError) throw movementsError

      // 4. Update transfer status to 'received' and append reception notes
      const updatedNotes = params.receptionNotes
        ? `${transfer.notes || ''}\n[Réception]: ${params.receptionNotes}`.trim()
        : transfer.notes

      const { error: statusError } = await supabase
        .from('internal_transfers')
        .update({
          status: 'received',
          approved_at: new Date().toISOString(),
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.transferId)

      if (statusError) throw statusError

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
