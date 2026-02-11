/**
 * useIncomeStatement Hook (Epic 9 - Story 9.8)
 * Revenue - Expenses = Net Income
 *
 * Optimized: Uses get_income_statement_data RPC to fetch all account
 * period totals in a single query instead of N separate queries per account.
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { IIncomeStatementSection, IFinancialStatementRow } from '@/types/accounting'

interface IIncomeStatementParams {
  startDate?: string
  endDate?: string
}

export function useIncomeStatement({ startDate, endDate }: IIncomeStatementParams = {}) {
  return useQuery({
    queryKey: ['accounting', 'income-statement', startDate, endDate],
    queryFn: async () => {
      const end = endDate || new Date().toISOString().split('T')[0]
      const start = startDate || `${end.substring(0, 4)}-01-01`

      // Single RPC call replaces N separate journal_entry_lines queries
      const { data, error } = await supabase.rpc('get_income_statement_data', {
        p_start_date: start,
        p_end_date: end,
      })
      if (error) throw error

      const balances = (data ?? []) as Array<{
        account_id: string
        account_code: string
        account_name: string
        account_type: string
        balance_type: string
        amount: number
      }>

      const buildSection = (
        title: string,
        type: string
      ): IIncomeStatementSection => {
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

      const revenue = buildSection('Revenue', 'revenue')
      const expenses = buildSection('Expenses', 'expense')
      const netIncome = revenue.total - expenses.total

      return {
        revenue,
        expenses,
        netIncome,
        startDate: start,
        endDate: end,
      }
    },
  })
}
