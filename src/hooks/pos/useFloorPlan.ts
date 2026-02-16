/**
 * useFloorPlan - CRUD hook for floor plan management
 * Handles tables, zones, and layout for POS dine-in
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { useEffect } from 'react'

// Types derived from database
type FloorPlanItemRow = Database['public']['Tables']['floor_plan_items']['Row']
type FloorPlanItemInsert = Database['public']['Tables']['floor_plan_items']['Insert']
type FloorPlanItemUpdate = Database['public']['Tables']['floor_plan_items']['Update']

// UI-specific types
export interface IFloorPlanFormData {
  name: string
  type: 'table' | 'bar' | 'counter' | 'zone' | 'decoration'
  capacity?: number
  position_x: number
  position_y: number
  width?: number
  height?: number
  rotation?: number
  shape?: 'square' | 'round' | 'rectangle'
  zone_id?: string
  is_active?: boolean
  metadata?: Record<string, unknown>
}

export interface IFloorPlanFilters {
  itemType?: string
  zone?: string
  isActive?: boolean
}

export interface ITableStatus {
  tableId: string
  tableName: string
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  currentOrderId?: string
  currentOrderTotal?: number
  occupiedSince?: string
  guestCount?: number
}

const QUERY_KEY = 'floor-plan'

export function useFloorPlan(filters?: IFloorPlanFilters) {
  const queryClient = useQueryClient()

  // READ - List all floor plan items
  const list = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('floor_plan_items')
        .select('*')
        .order('name', { ascending: true })

      if (filters?.itemType) {
        query = query.eq('item_type', filters.itemType)
      }
      if (filters?.zone) {
        query = query.eq('zone', filters.zone)
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      const { data, error } = await query
      if (error) throw error
      return data as FloorPlanItemRow[]
    },
  })

  // READ - Tables only (for POS table selection)
  const tables = useQuery({
    queryKey: [QUERY_KEY, 'tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('floor_plan_items')
        .select('*')
        .in('type', ['table', 'bar', 'counter'])
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as FloorPlanItemRow[]
    },
  })

  // READ - Table status (with current orders)
  const tableStatuses = useQuery({
    queryKey: [QUERY_KEY, 'statuses'],
    queryFn: async () => {
      // Get all active tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('floor_plan_items')
        .select('*')
        .in('type', ['table', 'bar', 'counter'])
        .eq('is_active', true)

      if (tablesError) throw tablesError

      // Get active orders with table numbers
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, table_number, total, guest_count, created_at')
        .eq('order_type', 'dine_in')
        .in('status', ['pending', 'preparing', 'ready'])

      if (ordersError) throw ordersError

      // Map table statuses
      const statuses: ITableStatus[] = (tablesData ?? []).map((table) => {
        const activeOrder = (ordersData ?? []).find(
          (o) => o.table_number === table.name
        )

        return {
          tableId: table.id,
          tableName: table.name,
          status: activeOrder ? 'occupied' : 'available',
          currentOrderId: activeOrder?.id,
          currentOrderTotal: activeOrder?.total ?? undefined,
          occupiedSince: activeOrder?.created_at ?? undefined,
          guestCount: activeOrder?.guest_count ?? undefined,
        }
      })

      return statuses
    },
    refetchInterval: 30000, // Refresh every 30s
  })

  // READ - Get by ID
  const getById = (id: string | undefined) =>
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: async () => {
        if (!id) return null

        const { data, error } = await supabase
          .from('floor_plan_items')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        return data as FloorPlanItemRow
      },
      enabled: !!id,
    })

  // CREATE
  const create = useMutation({
    mutationFn: async (data: FloorPlanItemInsert) => {
      const { data: result, error } = await supabase
        .from('floor_plan_items')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result as FloorPlanItemRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // UPDATE
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FloorPlanItemUpdate }) => {
      const { data: result, error } = await supabase
        .from('floor_plan_items')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result as FloorPlanItemRow
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, id] })
      const previous = queryClient.getQueryData<FloorPlanItemRow>([QUERY_KEY, id])

      if (previous) {
        queryClient.setQueryData([QUERY_KEY, id], { ...previous, ...data })
      }

      return { previous }
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, id], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // UPDATE POSITION (optimized for drag & drop)
  const updatePosition = useMutation({
    mutationFn: async ({
      id,
      x,
      y,
      rotation,
    }: {
      id: string
      x: number
      y: number
      rotation?: number
    }) => {
      const updateData: FloorPlanItemUpdate = {
        x_position: x,
        y_position: y,
      }
      if (rotation !== undefined) {
        updateData.rotation = rotation
      }

      const { error } = await supabase
        .from('floor_plan_items')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
    },
    // Optimistic update for smooth drag
    onMutate: async ({ id, x, y, rotation }) => {
      const previous = queryClient.getQueryData<FloorPlanItemRow[]>([QUERY_KEY])

      if (previous) {
        queryClient.setQueryData(
          [QUERY_KEY],
          previous.map((item) =>
            item.id === id
              ? { ...item, position_x: x, position_y: y, rotation: rotation ?? item.rotation }
              : item
          )
        )
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY], context.previous)
      }
    },
  })

  // DELETE
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('floor_plan_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // TOGGLE ACTIVE
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('floor_plan_items')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // BULK UPDATE (for layout saves)
  const bulkUpdate = useMutation({
    mutationFn: async (items: Array<{ id: string; data: FloorPlanItemUpdate }>) => {
      const updates = items.map(({ id, data }) =>
        supabase.from('floor_plan_items').update(data).eq('id', id)
      )

      const results = await Promise.all(updates)
      const errors = results.filter((r) => r.error)

      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} items`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // REALTIME subscription
  useEffect(() => {
    const channel = supabase
      .channel('floor-plan-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'floor_plan_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])

  return {
    list,
    tables,
    tableStatuses,
    getById,
    create,
    update,
    updatePosition,
    remove,
    toggleActive,
    bulkUpdate,
  }
}

export default useFloorPlan
