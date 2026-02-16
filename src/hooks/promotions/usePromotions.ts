/**
 * usePromotions - CRUD hook for promotions management
 * Handles online promotions with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { useEffect } from 'react'

// Types derived from database
type PromotionRow = Database['public']['Tables']['promotions']['Row']
type PromotionInsert = Database['public']['Tables']['promotions']['Insert']
type PromotionUpdate = Database['public']['Tables']['promotions']['Update']
type PromotionProductRow = Database['public']['Tables']['promotion_products']['Row']
type PromotionFreeProductRow = Database['public']['Tables']['promotion_free_products']['Row']

// UI-specific types
export interface IPromotionFormData {
  name: string
  description?: string
  type: 'percentage' | 'fixed' | 'buy_x_get_y'
  value: number
  buy_quantity?: number
  get_quantity?: number
  min_purchase?: number
  max_discount?: number
  start_date: string
  end_date?: string
  is_active?: boolean
  applies_to: 'all' | 'category' | 'product'
  applicable_days?: string[]
  start_time?: string
  end_time?: string
  max_uses?: number
  max_uses_per_customer?: number
}

export interface IPromotionFilters {
  isActive?: boolean
  promotionType?: string
  search?: string
  dateRange?: { start: string; end: string }
}

export interface IPromotionWithProducts extends PromotionRow {
  products?: PromotionProductRow[]
  freeProducts?: PromotionFreeProductRow[]
}

const QUERY_KEY = 'promotions'

export function usePromotions(filters?: IPromotionFilters) {
  const queryClient = useQueryClient()

  // READ - List with filters
  const list = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }
      if (filters?.promotionType) {
        query = query.eq('promotion_type', filters.promotionType)
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }
      if (filters?.dateRange) {
        query = query
          .gte('start_date', filters.dateRange.start)
          .lte('start_date', filters.dateRange.end)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PromotionRow[]
    },
  })

  // READ - Active promotions only (for POS)
  const activePromotions = useQuery({
    queryKey: [QUERY_KEY, 'active'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as PromotionRow[]
    },
  })

  // READ - Detail by ID with products
  const getById = (id: string | undefined) =>
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: async () => {
        if (!id) return null

        const [promotionRes, productsRes, freeProductsRes] = await Promise.all([
          supabase.from('promotions').select('*').eq('id', id).single(),
          supabase.from('promotion_products').select('*').eq('promotion_id', id),
          supabase.from('promotion_free_products').select('*').eq('promotion_id', id),
        ])

        if (promotionRes.error) throw promotionRes.error

        return {
          ...promotionRes.data,
          products: productsRes.data ?? [],
          freeProducts: freeProductsRes.data ?? [],
        } as IPromotionWithProducts
      },
      enabled: !!id,
    })

  // CREATE - with optimistic update
  const create = useMutation({
    mutationFn: async (data: PromotionInsert) => {
      const { data: result, error } = await supabase
        .from('promotions')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result as PromotionRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // UPDATE - with optimistic update
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PromotionUpdate }) => {
      const { data: result, error } = await supabase
        .from('promotions')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result as PromotionRow
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, id] })
      const previous = queryClient.getQueryData<PromotionRow>([QUERY_KEY, id])

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

  // TOGGLE ACTIVE
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // DELETE - soft delete by setting is_active = false or hard delete
  const remove = useMutation({
    mutationFn: async (id: string) => {
      // First delete related products
      await supabase.from('promotion_products').delete().eq('promotion_id', id)
      await supabase.from('promotion_free_products').delete().eq('promotion_id', id)

      const { error } = await supabase.from('promotions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })

  // ADD PRODUCT TO PROMOTION
  const addProduct = useMutation({
    mutationFn: async ({
      promotionId,
      productId,
    }: {
      promotionId: string
      productId: string
    }) => {
      const { error } = await supabase
        .from('promotion_products')
        .insert({ promotion_id: promotionId, product_id: productId })

      if (error) throw error
    },
    onSuccess: (_data, { promotionId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, promotionId] })
    },
  })

  // REMOVE PRODUCT FROM PROMOTION
  const removeProduct = useMutation({
    mutationFn: async ({
      promotionId,
      productId,
    }: {
      promotionId: string
      productId: string
    }) => {
      const { error } = await supabase
        .from('promotion_products')
        .delete()
        .eq('promotion_id', promotionId)
        .eq('product_id', productId)

      if (error) throw error
    },
    onSuccess: (_data, { promotionId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, promotionId] })
    },
  })

  // SET FREE PRODUCTS (for buy_x_get_y)
  const setFreeProducts = useMutation({
    mutationFn: async ({
      promotionId,
      productIds,
    }: {
      promotionId: string
      productIds: string[]
    }) => {
      // Delete existing
      await supabase
        .from('promotion_free_products')
        .delete()
        .eq('promotion_id', promotionId)

      // Insert new
      if (productIds.length > 0) {
        const { error } = await supabase.from('promotion_free_products').insert(
          productIds.map((pid) => ({
            promotion_id: promotionId,
            product_id: pid,
          }))
        )
        if (error) throw error
      }
    },
    onSuccess: (_data, { promotionId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, promotionId] })
    },
  })

  // REALTIME subscription
  useEffect(() => {
    const channel = supabase
      .channel('promotions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
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
    activePromotions,
    getById,
    create,
    update,
    toggleActive,
    remove,
    addProduct,
    removeProduct,
    setFreeProducts,
  }
}

export default usePromotions
