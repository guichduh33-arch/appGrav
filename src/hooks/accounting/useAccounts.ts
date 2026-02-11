/**
 * useAccounts Hook (Epic 9 - Story 9.1)
 * CRUD operations for Chart of Accounts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type {
  IAccount,
  IAccountInsert,
  IAccountUpdate,
  IAccountWithChildren,
} from '@/types/accounting'
import { buildAccountTree } from '@/services/accounting/accountingService'

const ACCOUNTS_KEY = ['accounting', 'accounts']

export function useAccounts() {
  const queryClient = useQueryClient()

  const accountsQuery = useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async (): Promise<IAccount[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('code')
      if (error) throw error
      return data as IAccount[]
    },
  })

  const accountTree = useQuery({
    queryKey: [...ACCOUNTS_KEY, 'tree'],
    queryFn: async (): Promise<IAccountWithChildren[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('code')
      if (error) throw error
      return buildAccountTree(data as IAccount[])
    },
  })

  const createAccount = useMutation({
    mutationFn: async (input: IAccountInsert) => {
      const { data, error } = await supabase
        .from('accounts')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      toast.success('Account created')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create account: ${err.message}`)
    },
  })

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: IAccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      toast.success('Account updated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update account: ${err.message}`)
    },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('accounts')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      toast.success(is_active ? 'Account activated' : 'Account deactivated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update account: ${err.message}`)
    },
  })

  return {
    accounts: accountsQuery.data ?? [],
    accountTree: accountTree.data ?? [],
    isLoading: accountsQuery.isLoading,
    isTreeLoading: accountTree.isLoading,
    error: accountsQuery.error,
    createAccount,
    updateAccount,
    toggleActive,
    refetch: accountsQuery.refetch,
  }
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, id],
    queryFn: async (): Promise<IAccount | null> => {
      if (!id) return null
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as IAccount
    },
    enabled: !!id,
  })
}

export function useActiveAccounts() {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, 'active'],
    queryFn: async (): Promise<IAccount[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true)
        .order('code')
      if (error) throw error
      return data as IAccount[]
    },
  })
}
