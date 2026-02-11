/**
 * useFiscalPeriods Hook (Epic 9 - Story 9.10)
 * Period CRUD + lock/unlock
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { IFiscalPeriod, IFiscalPeriodInsert } from '@/types/accounting'

const FISCAL_KEY = ['accounting', 'fiscal-periods']

export function useFiscalPeriods() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: FISCAL_KEY,
    queryFn: async (): Promise<IFiscalPeriod[]> => {
      const { data, error } = await supabase
        .from('fiscal_periods')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
      if (error) throw error
      return data as IFiscalPeriod[]
    },
  })

  const createPeriod = useMutation({
    mutationFn: async (input: IFiscalPeriodInsert) => {
      const { data, error } = await supabase
        .from('fiscal_periods')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FISCAL_KEY })
      toast.success('Fiscal period created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create period: ${err.message}`)
    },
  })

  const lockPeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({ status: 'locked' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FISCAL_KEY })
      toast.success('Period locked')
    },
    onError: (err: Error) => {
      toast.error(`Failed to lock period: ${err.message}`)
    },
  })

  const closePeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({ status: 'closed' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FISCAL_KEY })
      toast.success('Period closed')
    },
    onError: (err: Error) => {
      toast.error(`Failed to close period: ${err.message}`)
    },
  })

  const reopenPeriod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fiscal_periods')
        .update({ status: 'open' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FISCAL_KEY })
      toast.success('Period reopened')
    },
    onError: (err: Error) => {
      toast.error(`Failed to reopen period: ${err.message}`)
    },
  })

  return {
    periods: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createPeriod,
    lockPeriod,
    closePeriod,
    reopenPeriod,
  }
}
