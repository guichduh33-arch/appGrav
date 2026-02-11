/**
 * useGeneralLedger Hook (Epic 9 - Story 9.5)
 * Account movements with progressive balance
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { IGeneralLedgerEntry, TBalanceType } from '@/types/accounting'

interface IGeneralLedgerParams {
  accountId: string | undefined
  startDate?: string
  endDate?: string
}

export function useGeneralLedger({ accountId, startDate, endDate }: IGeneralLedgerParams) {
  return useQuery({
    queryKey: ['accounting', 'general-ledger', accountId, startDate, endDate],
    queryFn: async (): Promise<{
      entries: IGeneralLedgerEntry[]
      openingBalance: number
      closingBalance: number
    }> => {
      if (!accountId) return { entries: [], openingBalance: 0, closingBalance: 0 }

      // Get account balance type
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance_type')
        .eq('id', accountId)
        .single()
      if (accError) throw accError
      const balanceType = account.balance_type as TBalanceType

      // Calculate opening balance (before start date)
      let openingBalance = 0
      if (startDate) {
        const { data: obData, error: obError } = await supabase
          .rpc('get_account_balance', {
            p_account_id: accountId,
            p_end_date: new Date(new Date(startDate).getTime() - 86400000).toISOString().split('T')[0],
          })
        if (obError) throw obError
        openingBalance = obData ?? 0
      }

      // Fetch journal lines for this account in date range
      let q = supabase
        .from('journal_entry_lines')
        .select(`
          debit,
          credit,
          description,
          journal_entry:journal_entries!inner(
            entry_number,
            entry_date,
            description,
            status
          )
        `)
        .eq('account_id', accountId)
        .in('journal_entry.status', ['posted', 'locked'])
        .order('journal_entry(entry_date)', { ascending: true })

      if (startDate) {
        q = q.gte('journal_entry.entry_date', startDate)
      }
      if (endDate) {
        q = q.lte('journal_entry.entry_date', endDate)
      }

      const { data, error } = await q
      if (error) throw error

      // Build progressive balance
      let runningBalance = openingBalance
      const entries: IGeneralLedgerEntry[] = (data ?? []).map((line: Record<string, unknown>) => {
        const je = line.journal_entry as Record<string, unknown>
        const debit = Number(line.debit) || 0
        const credit = Number(line.credit) || 0

        // For debit-normal accounts: balance += debit - credit
        // For credit-normal accounts: balance += credit - debit
        if (balanceType === 'debit') {
          runningBalance += debit - credit
        } else {
          runningBalance += credit - debit
        }

        return {
          date: je.entry_date as string,
          entry_number: je.entry_number as string,
          description: (line.description as string) || (je.description as string),
          debit,
          credit,
          balance: runningBalance,
        }
      })

      return {
        entries,
        openingBalance,
        closingBalance: runningBalance,
      }
    },
    enabled: !!accountId,
  })
}
