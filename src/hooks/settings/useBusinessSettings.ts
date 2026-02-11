import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { usePrinterStore, useBusinessHoursStore } from '../../stores/settings'
import { settingsKeys } from './settingsKeys'
import type {
  BusinessHours,
  PrinterConfiguration,
  EmailTemplate,
  ReceiptTemplate,
} from '../../types/settings'

// =====================================================
// Business Hours
// =====================================================

export function useBusinessHours() {
  return useQuery({
    queryKey: settingsKeys.businessHours(),
    queryFn: async (): Promise<BusinessHours[]> => {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_of_week')

      if (error) throw error
      return data || []
    },
  })
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient()
  const updateBusinessHours = useBusinessHoursStore((state) => state.updateBusinessHours)

  return useMutation({
    mutationFn: async ({
      dayOfWeek,
      updates,
    }: {
      dayOfWeek: number
      updates: Partial<BusinessHours>
    }) => {
      const success = await updateBusinessHours(dayOfWeek, updates)
      if (!success) throw new Error('Failed to update business hours')
      return { dayOfWeek, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.businessHours() })
    },
  })
}

// =====================================================
// Printers
// =====================================================

export function usePrinters() {
  return useQuery({
    queryKey: settingsKeys.printers(),
    queryFn: async (): Promise<PrinterConfiguration[]> => {
      const { data, error } = await supabase
        .from('printer_configurations')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    },
  })
}

export function useCreatePrinter() {
  const queryClient = useQueryClient()
  const createPrinter = usePrinterStore((state) => state.createPrinter)

  return useMutation({
    mutationFn: async (printer: Omit<PrinterConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await createPrinter(printer)
      if (!result) throw new Error('Failed to create printer')
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.printers() })
    },
  })
}

export function useUpdatePrinter() {
  const queryClient = useQueryClient()
  const updatePrinter = usePrinterStore((state) => state.updatePrinter)

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<PrinterConfiguration>
    }) => {
      const success = await updatePrinter(id, updates)
      if (!success) throw new Error('Failed to update printer')
      return { id, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.printers() })
    },
  })
}

export function useDeletePrinter() {
  const queryClient = useQueryClient()
  const deletePrinter = usePrinterStore((state) => state.deletePrinter)

  return useMutation({
    mutationFn: async (id: string) => {
      const success = await deletePrinter(id)
      if (!success) throw new Error('Failed to delete printer')
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.printers() })
    },
  })
}

// =====================================================
// Email Templates
// =====================================================

export function useEmailTemplates() {
  return useQuery({
    queryKey: settingsKeys.emailTemplates(),
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('code')

      if (error) throw error
      return data || []
    },
  })
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<EmailTemplate>
    }) => {
      const { error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      return { id, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.emailTemplates() })
    },
  })
}

// =====================================================
// Receipt Templates
// =====================================================

export function useReceiptTemplates() {
  return useQuery({
    queryKey: settingsKeys.receiptTemplates(),
    queryFn: async (): Promise<ReceiptTemplate[]> => {
      const { data, error } = await supabase
        .from('receipt_templates')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    },
  })
}

export function useUpdateReceiptTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<ReceiptTemplate>
    }) => {
      const { error } = await supabase
        .from('receipt_templates')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      return { id, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.receiptTemplates() })
    },
  })
}
