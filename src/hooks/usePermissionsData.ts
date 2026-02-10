/**
 * Hook for fetching permissions matrix data (ARCH-005)
 * Extracted from PermissionsPage.tsx
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface IPermissionRole {
  id: string
  code: string
  name_fr: string
  name_en: string
  name_id: string
  hierarchy_level: number
}

export interface IPermission {
  id: string
  code: string
  name_fr: string
  name_en: string
  name_id: string
  module: string
  description: string | null
}

export interface IRolePermission {
  role_id: string
  permission_id: string
}

export function usePermissionsMatrix() {
  return useQuery({
    queryKey: ['permissions-matrix'],
    queryFn: async () => {
      const [rolesRes, permsRes, rolePermsRes] = await Promise.all([
        supabase.from('roles').select('*').order('hierarchy_level'),
        supabase.from('permissions').select('*').order('module, code'),
        supabase.from('role_permissions').select('role_id, permission_id'),
      ])

      if (rolesRes.error) throw rolesRes.error
      if (permsRes.error) throw permsRes.error
      if (rolePermsRes.error) throw rolePermsRes.error

      const permMap = new Map<string, Set<string>>()
      for (const rp of (rolePermsRes.data || []) as IRolePermission[]) {
        if (!permMap.has(rp.role_id)) {
          permMap.set(rp.role_id, new Set())
        }
        permMap.get(rp.role_id)!.add(rp.permission_id)
      }

      return {
        roles: (rolesRes.data || []) as IPermissionRole[],
        permissions: permsRes.data || [] as IPermission[],
        rolePermissions: permMap,
      }
    },
    staleTime: 30_000,
  })
}

export function useSavePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      roles: IPermissionRole[]
      current: Map<string, Set<string>>
      original: Map<string, Set<string>>
    }) => {
      const toInsert: IRolePermission[] = []
      const toDelete: IRolePermission[] = []

      for (const role of params.roles) {
        const current = params.current.get(role.id) || new Set()
        const original = params.original.get(role.id) || new Set()

        for (const permId of current) {
          if (!original.has(permId)) {
            toInsert.push({ role_id: role.id, permission_id: permId })
          }
        }
        for (const permId of original) {
          if (!current.has(permId)) {
            toDelete.push({ role_id: role.id, permission_id: permId })
          }
        }
      }

      for (const rp of toDelete) {
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', rp.role_id)
          .eq('permission_id', rp.permission_id)
      }

      if (toInsert.length > 0) {
        await supabase.from('role_permissions').insert(toInsert)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions-matrix'] })
    },
  })
}
