/**
 * Hook for managing establishment sections (ARCH-005)
 * Extracted from SettingsPage.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ISettingsSection {
  id: string
  name: string
  code: string
  description: string | null
  section_type: 'warehouse' | 'production' | 'sales' | null
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export function useSettingsSections() {
  return useQuery({
    queryKey: ['settings-sections'],
    queryFn: async (): Promise<ISettingsSection[]> => {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error

      return (data || []).map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code || '',
        description: s.description || null,
        section_type: s.section_type as ISettingsSection['section_type'],
        icon: s.icon || null,
        is_active: s.is_active ?? true,
        sort_order: s.sort_order ?? 0,
        created_at: s.created_at,
      }))
    },
    staleTime: 30_000,
  })
}

export function useSaveSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id?: string
      name: string
      code: string
      description: string | null
      section_type: string
      icon: string | null
    }) => {
      const sectionData = {
        name: params.name,
        code: params.code,
        description: params.description,
        section_type: params.section_type,
        icon: params.icon,
        is_active: true,
      }

      if (params.id) {
        const { error } = await supabase
          .from('sections')
          .update(sectionData)
          .eq('id', params.id)
        if (error) throw error
      } else {
        const { data: maxSortData } = await supabase
          .from('sections')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1)

        const nextSortOrder = (maxSortData?.[0]?.sort_order ?? 0) + 1

        const { error } = await supabase
          .from('sections')
          .insert({ ...sectionData, sort_order: nextSortOrder })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-sections'] })
    },
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sectionId: string) => {
      // Check if products are linked
      const { count: productCount, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('section_id', sectionId)

      if (countError) throw countError

      if (productCount && productCount > 0) {
        throw new Error(`PRODUCTS_LINKED:${productCount}`)
      }

      // Check if stock records exist
      const { count: stockCount, error: stockError } = await supabase
        .from('section_stock')
        .select('id', { count: 'exact', head: true })
        .eq('section_id', sectionId)

      if (stockError) throw stockError

      if (stockCount && stockCount > 0) {
        throw new Error(`STOCK_LINKED:${stockCount}`)
      }

      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-sections'] })
    },
  })
}

export function useKdsCategories() {
  return useQuery({
    queryKey: ['kds-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon, dispatch_station, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      return (data || []).map(c => ({
        ...c,
        icon: c.icon || '',
        is_active: c.is_active ?? true,
      }))
    },
    staleTime: 30_000,
  })
}
