/**
 * useBalanceSheet Hook (Epic 9 - Story 9.7)
 * Assets = Liabilities + Equity
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

      // Get all active accounts with balances
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('id, code, name, account_type, balance_type')
        .eq('is_active', true)
        .in('account_type', ['asset', 'liability', 'equity'])
        .order('code')
      if (accError) throw accError

      // Get balances for each account
      const balances = await Promise.all(
        (accounts ?? []).map(async (acc) => {
          const { data } = await supabase.rpc('get_account_balance', {
            p_account_id: acc.id,
            p_end_date: dateFilter,
          })
          return { ...acc, amount: Number(data) || 0 }
        })
      )

      // Group by type
      const buildSection = (
        title: string,
        type: TAccountType
      ): IBalanceSheetSection => {
        const accs: IFinancialStatementRow[] = balances
          .filter(a => a.account_type === type && Math.abs(a.amount) >= 0.01)
          .map(a => ({
            account_code: a.code,
            account_name: a.name,
            amount: a.amount,
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
