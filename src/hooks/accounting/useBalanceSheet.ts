/**
 * useBalanceSheet Hook (Epic 9 - Story 9.7)
 * Assets = Liabilities + Equity
 *
 * Optimized: Uses get_balance_sheet_data RPC to fetch all account balances
 * in a single query instead of N separate get_account_balance calls.
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  IBalanceSheetSection,
  IFinancialStatementRow,
  TAccountType,
} from '@/types/accounting'

interface IBalanceSheetParams {
  endDate?: string
}

export function useBalanceSheet({ endDate }: IBalanceSheetParams = {}) {
  return useQuery({
    queryKey: ['accounting', 'balance-sheet', endDate],
    queryFn: async () => {
      const dateFilter = endDate || new Date().toISOString().split('T')[0]

      // Single RPC call replaces N separate get_account_balance calls
      const { data, error } = await supabase.rpc('get_balance_sheet_data', {
        p_end_date: dateFilter,
      })
      if (error) throw error

      const balances = (data ?? []) as Array<{
        account_id: string
        account_code: string
        account_name: string
        account_type: TAccountType
        balance_type: string
        amount: number
      }>

      // Group by type
      const buildSection = (
        title: string,
        type: TAccountType
      ): IBalanceSheetSection => {
        const accs: IFinancialStatementRow[] = balances
          .filter(a => a.account_type === type && Math.abs(Number(a.amount)) >= 0.01)
          .map(a => ({
            account_code: a.account_code,
            account_name: a.account_name,
            amount: Number(a.amount),
          }))
        return {
          title,
          accounts: accs,
          total: accs.reduce((sum, a) => sum + a.amount, 0),
        }
      }

      const assets = buildSection('Assets', 'asset')
      const liabilities = buildSection('Liabilities', 'liability')
      const equity = buildSection('Equity', 'equity')

      const totalLiabilitiesAndEquity = liabilities.total + equity.total
      const isBalanced = Math.abs(assets.total - totalLiabilitiesAndEquity) < 0.01

      return {
        assets,
        liabilities,
        equity,
        totalLiabilitiesAndEquity,
        isBalanced,
        date: dateFilter,
      }
    },
  })
}
