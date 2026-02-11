/**
 * useTrialBalance Hook (Epic 9 - Story 9.6)
 * Per-account summary with equilibrium check
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

      const { data, error } = await supabase.rpc('get_trial_balance_data', {
        p_end_date: dateFilter,
      }).throwOnError()

      // If RPC doesn't exist, fallback to manual calculation
      if (error || !data) {
        return await calculateTrialBalanceManually(dateFilter)
      }

      const rows = data as ITrialBalanceRow[]
      const totalDebit = rows.reduce((sum, r) => sum + r.debit_total, 0)
      const totalCredit = rows.reduce((sum, r) => sum + r.credit_total, 0)

      return {
        rows,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      }
    },
  })
}

async function calculateTrialBalanceManually(endDate: string) {
  // Get all active accounts
  const { data: accounts, error: accError } = await supabase
    .from('accounts')
    .select('id, code, name, account_type, balance_type')
    .eq('is_active', true)
    .order('code')
  if (accError) throw accError

  // Get all posted journal lines up to end date
  const { data: lines, error: lineError } = await supabase
    .from('journal_entry_lines')
    .select(`
      account_id,
      debit,
      credit,
      journal_entry:journal_entries!inner(entry_date, status)
    `)
    .in('journal_entry.status', ['posted', 'locked'])
    .lte('journal_entry.entry_date', endDate)
  if (lineError) throw lineError

  // Aggregate by account
  const totals = new Map<string, { debit: number; credit: number }>()
  for (const line of lines ?? []) {
    const existing = totals.get(line.account_id) || { debit: 0, credit: 0 }
    existing.debit += Number(line.debit) || 0
    existing.credit += Number(line.credit) || 0
    totals.set(line.account_id, existing)
  }

  const rows: ITrialBalanceRow[] = (accounts ?? [])
    .map(acc => {
      const t = totals.get(acc.id) || { debit: 0, credit: 0 }
      const netDebit = t.debit - t.credit
      return {
        account_id: acc.id,
        account_code: acc.code,
        account_name: acc.name,
        account_type: acc.account_type,
        debit_total: netDebit > 0 ? netDebit : 0,
        credit_total: netDebit < 0 ? -netDebit : 0,
      }
    })
    .filter(r => r.debit_total !== 0 || r.credit_total !== 0)

  const totalDebit = rows.reduce((sum, r) => sum + r.debit_total, 0)
  const totalCredit = rows.reduce((sum, r) => sum + r.credit_total, 0)

  return {
    rows,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
  }
}
