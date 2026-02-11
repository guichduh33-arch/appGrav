/**
 * useIncomeStatement Hook (Epic 9 - Story 9.8)
 * Revenue - Expenses = Net Income
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

      // Get all revenue and expense accounts
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('id, code, name, account_type, balance_type')
        .eq('is_active', true)
        .in('account_type', ['revenue', 'expense'])
        .order('code')
      if (accError) throw accError

      // Get period totals for each account
      const balances = await Promise.all(
        (accounts ?? []).map(async (acc) => {
          const { data: lines, error } = await supabase
            .from('journal_entry_lines')
            .select(`
              debit,
              credit,
              journal_entry:journal_entries!inner(entry_date, status)
            `)
            .eq('account_id', acc.id)
            .in('journal_entry.status', ['posted', 'locked'])
            .gte('journal_entry.entry_date', start)
            .lte('journal_entry.entry_date', end)
          if (error) throw error

          let amount = 0
          for (const line of lines ?? []) {
            if (acc.balance_type === 'credit') {
              amount += (Number(line.credit) || 0) - (Number(line.debit) || 0)
            } else {
              amount += (Number(line.debit) || 0) - (Number(line.credit) || 0)
            }
          }

          return { ...acc, amount }
        })
      )

      const buildSection = (
        title: string,
        type: string
      ): IIncomeStatementSection => {
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
