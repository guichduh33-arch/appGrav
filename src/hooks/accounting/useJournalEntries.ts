/**
 * useJournalEntries Hook (Epic 9 - Story 9.4)
 * List, detail, and create manual journal entries
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type {
  IJournalEntry,
  IJournalEntryWithLines,
  IJournalEntryInsert,
  IJournalEntryLineWithAccount,
  TJournalReferenceType,
} from '@/types/accounting'

const JOURNAL_KEY = ['accounting', 'journal-entries']

interface IJournalFilters {
  startDate?: string
  endDate?: string
  referenceType?: TJournalReferenceType
  status?: string
  search?: string
}

export function useJournalEntries(filters?: IJournalFilters) {
  const [page, setPage] = useState(0)
  const pageSize = 50

  const query = useQuery({
    queryKey: [...JOURNAL_KEY, filters, page],
    queryFn: async (): Promise<{ entries: IJournalEntry[]; count: number }> => {
      let q = supabase
        .from('journal_entries')
        .select('*', { count: 'exact' })
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (filters?.startDate) {
        q = q.gte('entry_date', filters.startDate)
      }
      if (filters?.endDate) {
        q = q.lte('entry_date', filters.endDate)
      }
      if (filters?.referenceType) {
        q = q.eq('reference_type', filters.referenceType)
      }
      if (filters?.status) {
        q = q.eq('status', filters.status)
      }
      if (filters?.search) {
        q = q.or(`description.ilike.%${filters.search}%,entry_number.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await q
      if (error) throw error
      return { entries: data as IJournalEntry[], count: count ?? 0 }
    },
  })

  return {
    entries: query.data?.entries ?? [],
    totalCount: query.data?.count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    page,
    setPage,
    pageSize,
    totalPages: Math.ceil((query.data?.count ?? 0) / pageSize),
  }
}

export function useJournalEntry(id: string | undefined) {
  return useQuery({
    queryKey: [...JOURNAL_KEY, id],
    queryFn: async (): Promise<IJournalEntryWithLines | null> => {
      if (!id) return null

      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .single()
      if (entryError) throw entryError

      const { data: lines, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`
          *,
          account:accounts(id, code, name)
        `)
        .eq('journal_entry_id', id)
        .order('debit', { ascending: false })
      if (linesError) throw linesError

      return {
        ...(entry as IJournalEntry),
        lines: (lines ?? []) as IJournalEntryLineWithAccount[],
      }
    },
    enabled: !!id,
  })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: IJournalEntryInsert) => {
      const totalDebit = input.lines.reduce((sum, l) => sum + (l.debit || 0), 0)
      const totalCredit = input.lines.reduce((sum, l) => sum + (l.credit || 0), 0)

      // Generate entry number via RPC
      const { data: entryNumber, error: seqError } = await supabase
        .rpc('next_journal_entry_number', { p_prefix: 'MN' })
      if (seqError) throw seqError

      // Create header
      const { data: entry, error: headerError } = await supabase
        .from('journal_entries')
        .insert({
          entry_number: entryNumber,
          entry_date: input.entry_date,
          description: input.description,
          reference_type: input.reference_type || 'manual',
          attachment_url: input.attachment_url || null,
          status: 'draft',
          total_debit: totalDebit,
          total_credit: totalCredit,
        })
        .select()
        .single()
      if (headerError) throw headerError

      // Create lines
      const linesToInsert = input.lines.map(line => ({
        journal_entry_id: entry.id,
        account_id: line.account_id,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description || null,
      }))

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(linesToInsert)
      if (linesError) throw linesError

      return entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEY })
      toast.success('Journal entry created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create entry: ${err.message}`)
    },
  })
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('journal_entries')
        .update({ status: 'posted' })
        .eq('id', id)
        .eq('status', 'draft')
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEY })
      toast.success('Journal entry posted')
    },
    onError: (err: Error) => {
      toast.error(`Failed to post entry: ${err.message}`)
    },
  })
}
