/**
 * Hook for suppliers CRUD (ARCH-005)
 * Extracted from SuppliersPage.tsx
 * Note: useSuppliers (read-only) already exists. This adds create/update/delete mutations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ISupplierFormData {
  name: string
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  country?: string | null
  tax_id?: string | null
  payment_terms?: string | null
  category?: string | null
  notes?: string | null
  is_active?: boolean
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: ISupplierFormData) => {
      const insertData = {
        ...formData,
        name: formData.name || 'New supplier',
      }
      const { error } = await supabase
        .from('suppliers')
        .insert([insertData] as never)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ISupplierFormData }) => {
      const { error } = await supabase
        .from('suppliers')
        .update(data as never)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}

export function useToggleSupplierActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}
