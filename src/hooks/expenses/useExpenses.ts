import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import type {
  IExpenseWithRelations,
  IExpenseInsert,
  IExpenseUpdate,
  IExpenseFilters,
  TExpenseStatus,
} from '@/types/expenses'

const QUERY_KEY = ['expenses']

export function useExpenses(filters?: IExpenseFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: async (): Promise<IExpenseWithRelations[]> => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories!category_id(name, code),
          supplier:suppliers!supplier_id(company_name),
          creator:user_profiles!created_by(display_name),
          approver:user_profiles!approved_by(display_name)
        `)
        .order('expense_date', { ascending: false })
        .limit(200)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }
      if (filters?.from) {
        query = query.gte('expense_date', filters.from.toISOString().split('T')[0])
      }
      if (filters?.to) {
        query = query.lte('expense_date', filters.to.toISOString().split('T')[0])
      }
      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      return (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        category_name: (row.category as Record<string, string> | null)?.name ?? '',
        category_code: (row.category as Record<string, string> | null)?.code ?? '',
        supplier_name: (row.supplier as Record<string, string> | null)?.company_name ?? null,
        creator_name: (row.creator as Record<string, string> | null)?.display_name ?? null,
        approver_name: (row.approver as Record<string, string> | null)?.display_name ?? null,
      })) as IExpenseWithRelations[]
    },
  })
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: ['expense', id],
    enabled: !!id,
    queryFn: async (): Promise<IExpenseWithRelations> => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories!category_id(name, code),
          supplier:suppliers!supplier_id(company_name),
          creator:user_profiles!created_by(display_name),
          approver:user_profiles!approved_by(display_name)
        `)
        .eq('id', id!)
        .single()

      if (error) throw error

      const row = data as Record<string, unknown>
      return {
        ...row,
        category_name: (row.category as Record<string, string> | null)?.name ?? '',
        category_code: (row.category as Record<string, string> | null)?.code ?? '',
        supplier_name: (row.supplier as Record<string, string> | null)?.company_name ?? null,
        creator_name: (row.creator as Record<string, string> | null)?.display_name ?? null,
        approver_name: (row.approver as Record<string, string> | null)?.display_name ?? null,
      } as IExpenseWithRelations
    },
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async (input: IExpenseInsert) => {
      // Get next expense number via RPC
      const { data: numData, error: numErr } = await supabase.rpc('next_expense_number')
      if (numErr) throw numErr

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...input,
          expense_number: numData as string,
          created_by: user!.id,
          status: 'pending' as TExpenseStatus,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Expense created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create expense: ${err.message}`)
    },
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: IExpenseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Expense updated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update expense: ${err.message}`)
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('status', 'pending')

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Expense deleted')
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete expense: ${err.message}`)
    },
  })
}

export function useApproveExpense() {
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'approved' as TExpenseStatus,
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Expense approved — journal entry created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to approve: ${err.message}`)
    },
  })
}

export function useRejectExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected' as TExpenseStatus,
          rejected_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Expense rejected')
    },
    onError: (err: Error) => {
      toast.error(`Failed to reject: ${err.message}`)
    },
  })
}
