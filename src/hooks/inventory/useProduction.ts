/**
 * useProduction - CRUD hook for production records
 * Handles bakery production tracking and recipe-based deductions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { useEffect } from 'react'

// Types derived from database
type ProductionRecordRow = Database['public']['Tables']['production_records']['Row']
type ProductionRecordInsert = Database['public']['Tables']['production_records']['Insert']

// UI-specific types
export interface IProductionFormData {
  product_id: string
  quantity: number
  batch_number?: string
  notes?: string
  produced_by?: string
  production_date?: string
}

export interface IProductionFilters {
  productId?: string
  dateRange?: { start: string; end: string }
  producedBy?: string
  limit?: number
}

export interface IProductionWithProduct extends ProductionRecordRow {
  product?: {
    id: string
    name: string
    sku: string | null
  }
  user?: {
    id: string
    full_name: string | null
  }
}

export interface IProductionSummary {
  product_id: string
  product_name: string
  total_quantity: number
  record_count: number
  last_production: string
}

const QUERY_KEY = 'production'

export function useProduction(filters?: IProductionFilters) {
  const queryClient = useQueryClient()

  // READ - List with filters and product info
  const list = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('production_records')
        .select(
          `
          *,
          product:products(id, name, sku),
          user:user_profiles(id, full_name)
        `
        )
        .order('production_date', { ascending: false })

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId)
      }
      if (filters?.producedBy) {
        query = query.eq('staff_id', filters.producedBy)
      }
      if (filters?.dateRange) {
        query = query
          .gte('production_date', filters.dateRange.start)
          .lte('production_date', filters.dateRange.end)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as IProductionWithProduct[]
    },
  })

  // READ - Today's production
  const todayProduction = useQuery({
    queryKey: [QUERY_KEY, 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('production_records')
        .select(
          `
          *,
          product:products(id, name, sku)
        `
        )
        .gte('production_date', today)
        .order('production_date', { ascending: false })

      if (error) throw error
      return data as IProductionWithProduct[]
    },
  })

  // READ - Production summary by product (for analytics)
  const summary = useQuery({
    queryKey: [QUERY_KEY, 'summary', filters?.dateRange],
    queryFn: async () => {
      const startDate = filters?.dateRange?.start ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const endDate = filters?.dateRange?.end ?? new Date().toISOString()

      const { data, error } = await supabase
        .from('production_records')
        .select(
          `
          product_id,
          quantity,
          production_date,
          product:products(name)
        `
        )
        .gte('production_date', startDate)
        .lte('production_date', endDate)

      if (error) throw error

      // Aggregate by product
      const summaryMap = new Map<string, IProductionSummary>()

      for (const record of data ?? []) {
        const existing = summaryMap.get(record.product_id)
        const productName = (record.product as unknown as { name: string } | null)?.name ?? 'Unknown'

        if (existing) {
          existing.total_quantity += record.quantity
          existing.record_count += 1
          if (record.production_date > existing.last_production) {
            existing.last_production = record.production_date
          }
        } else {
          summaryMap.set(record.product_id, {
            product_id: record.product_id,
            product_name: productName,
            total_quantity: record.quantity,
            record_count: 1,
            last_production: record.production_date,
          })
        }
      }

      return Array.from(summaryMap.values()).sort(
        (a, b) => b.total_quantity - a.total_quantity
      )
    },
  })

  // READ - Get by ID
  const getById = (id: string | undefined) =>
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: async () => {
        if (!id) return null

        const { data, error } = await supabase
          .from('production_records')
          .select(
            `
            *,
            product:products(id, name, sku),
            user:user_profiles!production_records_produced_by_fkey(id, full_name)
          `
          )
          .eq('id', id)
          .single()

        if (error) throw error
        return data as IProductionWithProduct
      },
      enabled: !!id,
    })

  // CREATE - Record production with recipe deduction
  const create = useMutation({
    mutationFn: async (data: IProductionFormData) => {
      // Generate production ID
      const productionId = `PROD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // 1. Insert production record
      const insertData: ProductionRecordInsert = {
        production_id: productionId,
        product_id: data.product_id,
        quantity_produced: data.quantity,
        notes: data.notes,
        staff_id: data.produced_by,
        production_date: data.production_date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
      }

      const { data: result, error } = await supabase
        .from('production_records')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      // Note: Stock movements would require movement_id, stock_before, stock_after
      // This should be handled by a database trigger or more complex logic
      // For now, we just log that production was recorded

      // 3. Deduct ingredients based on recipe (if exists)
      const { data: recipe } = await supabase
        .from('recipes')
        .select('ingredient_id, quantity')
        .eq('product_id', data.product_id)

      if (recipe && recipe.length > 0) {
        const ingredientMovements = recipe.map((r) => ({
          product_id: r.ingredient_id,
          movement_type: 'ingredient' as const,
          quantity: r.quantity * data.quantity, // Scale by production quantity
          reference_id: result.id,
          reference_type: 'production',
          notes: `Used in production of ${data.batch_number ?? result.id}`,
        }))

        const { error: ingredientError } = await supabase
          .from('stock_movements')
          .insert(ingredientMovements)

        if (ingredientError) {
          console.error('Failed to deduct ingredients:', ingredientError)
        }
      }

      return result as ProductionRecordRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  // UPDATE (limited - mainly for notes/batch_number)
  const update = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: { notes?: string; batch_number?: string }
    }) => {
      const { data: result, error } = await supabase
        .from('production_records')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result as ProductionRecordRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // DELETE (with stock reversal)
  const remove = useMutation({
    mutationFn: async (id: string) => {
      // Get production record first
      const { data: record, error: fetchError } = await supabase
        .from('production_records')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Delete related stock movements
      const { error: stockError } = await supabase
        .from('stock_movements')
        .delete()
        .eq('reference_id', id)
        .eq('reference_type', 'production')

      if (stockError) {
        console.error('Failed to delete stock movements:', stockError)
      }

      // Delete production record
      const { error } = await supabase.from('production_records').delete().eq('id', id)
      if (error) throw error

      return record
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })

  // REALTIME subscription
  useEffect(() => {
    const channel = supabase
      .channel('production-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'production_records' },
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
    todayProduction,
    summary,
    getById,
    create,
    update,
    remove,
  }
}

export default useProduction
