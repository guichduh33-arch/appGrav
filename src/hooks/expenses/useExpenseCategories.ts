import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type {
  IExpenseCategory,
  IExpenseCategoryInsert,
  IExpenseCategoryUpdate,
  IExpenseCategoryWithChildren,
} from '@/types/expenses'
import { buildCategoryTree, flattenCategoryTree } from '@/services/expenses/expenseService'

const QUERY_KEY = ['expense-categories']

export function useExpenseCategories() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<IExpenseCategory[]> => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data ?? []
    },
  })

  const tree: IExpenseCategoryWithChildren[] = query.data
    ? buildCategoryTree(query.data)
    : []

  const flatList = flattenCategoryTree(tree)

  const activeCategories = (query.data ?? []).filter(c => c.is_active)

  return { ...query, tree, flatList, activeCategories }
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: IExpenseCategoryInsert) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Category created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create category: ${err.message}`)
    },
  })
}

export function useUpdateExpenseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: IExpenseCategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Category updated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update category: ${err.message}`)
    },
  })
}

export function useToggleCategoryActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('expense_categories')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, { is_active }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(is_active ? 'Category activated' : 'Category deactivated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to toggle category: ${err.message}`)
    },
  })
}
