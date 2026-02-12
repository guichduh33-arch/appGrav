/**
 * Hook for fetching users with roles (ARCH-005)
 * Extracted from UsersPage.tsx
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/auth'

export interface IUserWithRoles {
  id: string
  name: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  employee_code: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
  last_login_at: string | null
  created_at: string
  user_roles: Array<{
    id: string
    is_primary: boolean
    role: Role
  }>
}

export function useUsersWithRoles(options?: { showInactive?: boolean }) {
  return useQuery({
    queryKey: ['users-with-roles', options?.showInactive],
    queryFn: async (): Promise<IUserWithRoles[]> => {
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          display_name,
          first_name,
          last_name,
          employee_code,
          phone,
          avatar_url,
          role,
          is_active,
          last_login_at,
          created_at,
          user_roles!user_roles_user_id_fkey (
            id,
            is_primary,
            role:roles (
              id,
              code,
              name_fr,
              name_en,
              name_id,
              hierarchy_level
            )
          )
        `)
        .order('name')

      if (!options?.showInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.returns<IUserWithRoles[]>()
      if (error) throw error
      return data || []
    },
    staleTime: 30_000,
  })
}
