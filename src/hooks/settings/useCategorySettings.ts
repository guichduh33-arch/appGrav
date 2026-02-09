import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../types/database'

// Query keys for category settings
export const categorySettingsKeys = {
  all: ['categorySettings'] as const,
  list: () => [...categorySettingsKeys.all, 'list'] as const,
  detail: (id: string) => [...categorySettingsKeys.all, 'detail', id] as const,
}

export type CategoryFormData = {
  name: string
  color: string | null
  dispatch_station: 'barista' | 'kitchen' | 'display' | 'none'
  show_in_pos: boolean
  is_raw_material: boolean
  is_active: boolean
}

/**
 * Fetch all categories (no filtering - for management)
 */
export function useCategoryList() {
  return useQuery({
    queryKey: categorySettingsKeys.list(),
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    },
  })
}

/**
 * Get product count per category
 */
export function useCategoryProductCounts() {
  return useQuery({
    queryKey: [...categorySettingsKeys.all, 'productCounts'] as const,
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id')
        .not('category_id', 'is', null)

      if (error) throw error

      const counts: Record<string, number> = {}
      data?.forEach(product => {
        if (product.category_id) {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1
        }
      })
      return counts
    },
  })
}

/**
 * Create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (category: CategoryFormData): Promise<Category> => {
      // Get max sort_order to append new category at the end
      const { data: maxData } = await supabase
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const nextSortOrder = (maxData?.sort_order ?? 0) + 1

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          color: category.color,
          dispatch_station: category.dispatch_station,
          show_in_pos: category.show_in_pos,
          is_raw_material: category.is_raw_material,
          is_active: category.is_active,
          sort_order: nextSortOrder,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorySettingsKeys.list() })
      // Also invalidate POS categories cache
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/**
 * Update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CategoryFormData> }): Promise<Category> => {
      console.log('[useUpdateCategory] Updating category:', id, updates)

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          color: updates.color,
          dispatch_station: updates.dispatch_station,
          show_in_pos: updates.show_in_pos,
          is_raw_material: updates.is_raw_material,
          is_active: updates.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()

      console.log('[useUpdateCategory] Response:', { data, error })

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Category not found or no changes applied')
      }
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorySettingsKeys.list() })
      // Also invalidate POS categories cache
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/**
 * Delete a category (only if no products are linked)
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Check if category has products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id)

      if (countError) throw countError

      if (count && count > 0) {
        throw new Error(`Cannot delete category: ${count} product(s) are still linked to it`)
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorySettingsKeys.list() })
      // Also invalidate POS categories cache
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/**
 * Reorder categories (batch update sort_order)
 */
export function useReorderCategories() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderedIds: string[]): Promise<void> => {
      // Update each category's sort_order based on position in array
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index,
        updated_at: new Date().toISOString(),
      }))

      // Batch update using upsert
      const { error } = await supabase
        .from('categories')
        .upsert(updates, { onConflict: 'id' })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorySettingsKeys.list() })
      // Also invalidate POS categories cache
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
