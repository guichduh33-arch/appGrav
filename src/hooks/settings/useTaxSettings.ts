import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useTaxStore } from '../../stores/settings'
import { settingsKeys } from './settingsKeys'
import type { TaxRate } from '../../types/settings'

/**
 * Fetch all tax rates
 */
export function useTaxRates() {
  return useQuery({
    queryKey: settingsKeys.taxRates(),
    queryFn: async (): Promise<TaxRate[]> => {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .order('rate')

      if (error) throw error
      return data || []
    },
  })
}

/**
 * Create a new tax rate
 */
export function useCreateTaxRate() {
  const queryClient = useQueryClient()
  const createTaxRate = useTaxStore((state) => state.createTaxRate)

  return useMutation({
    mutationFn: async (taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await createTaxRate(taxRate)
      if (!result) throw new Error('Failed to create tax rate')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxRates() })
    },
  })
}

/**
 * Update a tax rate
 */
export function useUpdateTaxRate() {
  const queryClient = useQueryClient()
  const updateTaxRate = useTaxStore((state) => state.updateTaxRate)

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaxRate> }) => {
      const success = await updateTaxRate(id, updates)
      if (!success) throw new Error('Failed to update tax rate')
      return { id, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxRates() })
    },
  })
}

/**
 * Delete a tax rate
 */
export function useDeleteTaxRate() {
  const queryClient = useQueryClient()
  const deleteTaxRate = useTaxStore((state) => state.deleteTaxRate)

  return useMutation({
    mutationFn: async (id: string) => {
      const success = await deleteTaxRate(id)
      if (!success) throw new Error('Failed to delete tax rate')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxRates() })
    },
  })
}
