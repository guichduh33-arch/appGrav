import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useSettingsStore } from '../../stores/settingsStore'
import { settingsKeys } from './settingsKeys'
import type { PaymentMethod } from '../../types/settings'

/**
 * Fetch all payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: settingsKeys.paymentMethods(),
    queryFn: async (): Promise<PaymentMethod[]> => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order')

      if (error) throw error
      return data || []
    },
  })
}

/**
 * Create a new payment method
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  const createPaymentMethod = useSettingsStore((state) => state.createPaymentMethod)

  return useMutation({
    mutationFn: async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await createPaymentMethod(method)
      if (!result) throw new Error('Failed to create payment method')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() })
    },
  })
}

/**
 * Update a payment method
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()
  const updatePaymentMethod = useSettingsStore((state) => state.updatePaymentMethod)

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentMethod> }) => {
      const success = await updatePaymentMethod(id, updates)
      if (!success) throw new Error('Failed to update payment method')
      return { id, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() })
    },
  })
}

/**
 * Delete a payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  const deletePaymentMethod = useSettingsStore((state) => state.deletePaymentMethod)

  return useMutation({
    mutationFn: async (id: string) => {
      const success = await deletePaymentMethod(id)
      if (!success) throw new Error('Failed to delete payment method')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() })
    },
  })
}
