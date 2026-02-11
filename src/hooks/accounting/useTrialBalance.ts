/**
 * useTrialBalance Hook (Epic 9 - Story 9.6)
 * Per-account summary with equilibrium check
 *
 * Optimized: Uses get_trial_balance_data RPC (now exists) which performs
 * a single aggregation query instead of fetching all lines + client-side grouping.
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ITrialBalanceRow } from '@/types/accounting'

interface ITrialBalanceParams {
  endDate?: string
}

export function useTrialBalance({ endDate }: ITrialBalanceParams = {}) {
  return useQuery({
    queryKey: ['accounting', 'trial-balance', endDate],
    queryFn: async (): Promise<{
      rows: ITrialBalanceRow[]
      totalDebit: number
      totalCredit: number
      isBalanced: boolean
    }> => {
      const dateFilter = endDate || new Date().toISOString().split('T')[0]

      // Single RPC call does the aggregation server-side
      const { data, error } = await supabase.rpc('get_trial_balance_data', {
        p_end_date: dateFilter,
      })
      if (error) throw error

      const rows = (data ?? []) as ITrialBalanceRow[]
      const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit_total), 0)
      const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit_total), 0)

      return {
        rows,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      }
    },
  })
}
