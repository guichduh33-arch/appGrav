/**
 * Hook for waste records (ARCH-005)
 * Extracted from WastedPage.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IWasteRecord {
  id: string
  product_id: string
  product: { id: string; name: string; sku: string; unit: string; cost_price: number | null } | null
  quantity: number
  reason: string | null
  unit: string | null
  stock_before: number | null
  stock_after: number | null
  staff_id: string | null
  staff_name: string | null
  created_at: string
  unit_cost: number | null
}

export interface IWasteProduct {
  id: string
  name: string
  sku: string
  unit: string | null
  cost_price: number | null
  current_stock: number | null
}

export type TWasteDateFilter = 'today' | 'week' | 'month' | 'all'

export function useWasteRecords(dateFilter: TWasteDateFilter) {
  return useQuery({
    queryKey: ['waste-records', dateFilter],
    queryFn: async (): Promise<IWasteRecord[]> => {
      let query = supabase
        .from('stock_movements')
        .select(`
          id,
          product_id,
          product:products(id, name, sku, unit, cost_price),
          quantity,
          reason,
          unit,
          stock_before,
          stock_after,
          staff_id,
          staff:user_profiles!fk_stock_movements_staff(display_name),
          created_at,
          unit_cost
        `)
        .eq('movement_type', 'waste')
        .order('created_at', { ascending: false })

      const now = new Date()
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        query = query.gte('created_at', today)
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', weekAgo)
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', monthAgo)
      }

      const { data, error } = await query

      if (error) throw error

      type RawWaste = {
        id: string; product_id: string;
        product: IWasteRecord['product'];
        quantity: number; reason?: string | null;
        unit?: string | null; stock_before?: number | null;
        stock_after?: number | null; staff_id?: string | null;
        staff?: { display_name: string } | null;
        created_at: string; unit_cost?: number | null;
      }

      return ((data || []) as unknown as RawWaste[]).map((r) => ({
        id: r.id,
        product_id: r.product_id,
        product: r.product,
        quantity: r.quantity,
        reason: r.reason ?? 'other',
        unit: r.unit ?? r.product?.unit ?? null,
        stock_before: r.stock_before ?? null,
        stock_after: r.stock_after ?? null,
        staff_id: r.staff_id ?? null,
        staff_name: r.staff?.display_name ?? null,
        created_at: r.created_at,
        unit_cost: r.unit_cost ?? r.product?.cost_price ?? null,
      }))
    },
    staleTime: 15_000,
  })
}

export function useWasteProducts() {
  return useQuery({
    queryKey: ['waste-products'],
    queryFn: async (): Promise<IWasteProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, unit, cost_price, current_stock')
        .neq('is_active', false)
        .order('name')

      if (error) throw error
      return (data || []) as IWasteProduct[]
    },
    staleTime: 30_000,
  })
}

export function useCreateWasteRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      productId: string
      quantity: number
      reason: string
      unit: string
      currentStock: number
      costPrice: number
      staffId?: string
    }) => {
      const movementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

      const { error } = await supabase
        .from('stock_movements')
        .insert({
          movement_id: movementId,
          product_id: params.productId,
          movement_type: 'waste',
          quantity: -params.quantity,
          reason: params.reason,
          unit: params.unit,
          stock_before: params.currentStock,
          stock_after: params.currentStock - params.quantity,
          staff_id: params.staffId,
          unit_cost: params.costPrice,
          reference_type: 'manual_waste',
        } as never)

      if (error) throw error

      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: params.currentStock - params.quantity })
        .eq('id', params.productId)

      if (updateError) throw updateError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-records'] })
      queryClient.invalidateQueries({ queryKey: ['waste-products'] })
    },
  })
}
