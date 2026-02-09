import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { settingsKeys } from './settingsKeys'
import type { Role, Permission } from '../../types/auth'

// Extended role type with computed fields
export interface RoleWithDetails extends Role {
  permissions: string[] // Permission IDs
  user_count: number
}

// Form input for create/update
export interface RoleFormInput {
  code: string
  name: string
  description?: string
  hierarchy_level: number
  is_system?: boolean
  permission_ids: string[]
}

// Permission group for UI display
export interface PermissionGroup {
  module: string
  permissions: Permission[]
}

// Module labels for display
export const MODULE_LABELS: Record<string, string> = {
  sales: 'Sales',
  inventory: 'Inventory',
  products: 'Products',
  customers: 'Customers',
  reports: 'Reports',
  users: 'Users',
  settings: 'Settings',
  production: 'Production',
  purchases: 'Purchases',
  pos: 'POS',
  kds: 'Kitchen',
  admin: 'Admin',
}

/**
 * Fetch all roles with user count and permission IDs
 */
export function useRoles() {
  return useQuery({
    queryKey: settingsKeys.roles(),
    queryFn: async (): Promise<RoleWithDetails[]> => {
      // Fetch roles with user count
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          *,
          user_roles(count)
        `)
        .order('hierarchy_level', { ascending: false })

      if (rolesError) throw rolesError

      // Fetch role permissions
      const { data: rolePermsData, error: rolePermsError } = await supabase
        .from('role_permissions')
        .select('role_id, permission_id')

      if (rolePermsError) throw rolePermsError

      // Map permissions to roles
      type RoleRow = Role & { user_roles?: { count: number }[] }
      const rawRoles = (rolesData || []) as unknown as RoleRow[]
      const rolePerms = (rolePermsData || []) as { role_id: string; permission_id: string }[]

      return rawRoles.map((role) => ({
        ...role,
        permissions: rolePerms
          .filter((rp) => rp.role_id === role.id)
          .map((rp) => rp.permission_id),
        user_count: role.user_roles?.[0]?.count || 0,
      }))
    },
  })
}

/**
 * Fetch a single role by ID
 */
export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: settingsKeys.role(id || ''),
    queryFn: async (): Promise<RoleWithDetails | null> => {
      if (!id) return null

      const { data: role, error } = await supabase
        .from('roles')
        .select(`
          *,
          user_roles(count)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      const { data: perms } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', id)

      return {
        ...role,
        permissions: (perms || []).map((p) => p.permission_id),
        user_count: (role as { user_roles?: { count: number }[] }).user_roles?.[0]?.count || 0,
      } as RoleWithDetails
    },
    enabled: !!id,
  })
}

/**
 * Fetch all permissions grouped by module
 */
export function usePermissionsList() {
  return useQuery({
    queryKey: settingsKeys.permissions(),
    queryFn: async (): Promise<Permission[]> => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module, code')

      if (error) throw error

      // Ensure all fields have defaults
      return (data || []).map((p) => ({
        ...p,
        action: p.action || p.code.split('.').pop() || '',
        is_sensitive: p.is_sensitive ?? false,
      })) as Permission[]
    },
  })
}

/**
 * Group permissions by module for UI display
 */
export function groupPermissionsByModule(permissions: Permission[]): PermissionGroup[] {
  const groups: PermissionGroup[] = []

  for (const perm of permissions) {
    const existing = groups.find((g) => g.module === perm.module)
    if (existing) {
      existing.permissions.push(perm)
    } else {
      groups.push({ module: perm.module, permissions: [perm] })
    }
  }

  return groups
}

/**
 * Create a new role with permissions (transaction-based)
 */
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RoleFormInput) => {
      // Create role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          code: input.code.toUpperCase(),
          name_fr: input.name,
          name_en: input.name,
          name_id: input.name,
          description: input.description || null,
          hierarchy_level: input.hierarchy_level,
          is_system: input.is_system || false,
          is_active: true,
        })
        .select('id')
        .single()

      if (roleError) throw roleError

      // Add permissions if any
      if (input.permission_ids.length > 0) {
        const permissionInserts = input.permission_ids.map((permId) => ({
          role_id: role.id,
          permission_id: permId,
        }))

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts)

        if (permError) throw permError
      }

      return role.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() })
    },
  })
}

/**
 * Update a role and its permissions (transaction-based)
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RoleFormInput }) => {
      // Update role
      const { error: roleError } = await supabase
        .from('roles')
        .update({
          code: input.code.toUpperCase(),
          name_fr: input.name,
          name_en: input.name,
          name_id: input.name,
          description: input.description || null,
          hierarchy_level: input.hierarchy_level,
          is_system: input.is_system || false,
        })
        .eq('id', id)

      if (roleError) throw roleError

      // Replace permissions: delete all then insert new
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id)

      if (deleteError) throw deleteError

      if (input.permission_ids.length > 0) {
        const permissionInserts = input.permission_ids.map((permId) => ({
          role_id: id,
          permission_id: permId,
        }))

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts)

        if (permError) throw permError
      }

      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() })
      queryClient.invalidateQueries({ queryKey: settingsKeys.role(id) })
    },
  })
}

/**
 * Delete a role and its permissions
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete permissions first (foreign key constraint)
      const { error: permError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id)

      if (permError) throw permError

      // Delete role
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)

      if (roleError) throw roleError

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.roles() })
    },
  })
}

/**
 * Get hierarchy level label and color
 */
export function getHierarchyLabel(level: number): { label: string; color: string } {
  if (level >= 90) return { label: 'Super Admin', color: 'section-badge--warehouse' }
  if (level >= 70) return { label: 'Admin', color: 'section-badge--production' }
  if (level >= 50) return { label: 'Manager', color: 'section-badge--sales' }
  if (level >= 30) return { label: 'Employee', color: 'section-badge' }
  return { label: 'Viewer', color: 'section-badge' }
}

/**
 * Get role display name (English)
 */
export function getRoleName(role: Role): string {
  return role.name_en || role.name_fr || role.code
}

/**
 * Get permission display name (English)
 */
export function getPermissionName(perm: Permission): string {
  return perm.name_en || perm.name_fr || perm.code
}

/**
 * Get module display name
 */
export function getModuleName(module: string): string {
  return MODULE_LABELS[module] || module
}
