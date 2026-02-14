import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeft, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

// Hooks
import {
  useRoles,
  usePermissionsList,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  getRoleName,
} from '@/hooks/settings/useRoles'
import type { RoleWithDetails, RoleFormInput } from '@/hooks/settings/useRoles'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { usePermissions } from '@/hooks/usePermissions'

// Components
import { RouteGuard, PermissionGuard } from '@/components/auth/PermissionGuard'
import { RoleCard, RoleModal } from '@/components/settings/roles'
import { logError } from '@/utils/logger'

function RolesPageContent() {
  const { isOnline } = useNetworkStatus()
  const { isAdmin } = usePermissions()

  // Data queries
  const { data: roles = [], isLoading: isLoadingRoles, error: rolesError } = useRoles()
  const { data: permissions = [], isLoading: isLoadingPerms } = usePermissionsList()

  // Mutations
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleWithDetails | null>(null)

  const isLoading = isLoadingRoles || isLoadingPerms
  const isSaving = createRole.isPending || updateRole.isPending

  const handleCreate = useCallback(() => {
    if (!isOnline) {
      toast.error('Cannot create roles while offline')
      return
    }
    setSelectedRole(null)
    setShowModal(true)
  }, [isOnline])

  const handleEdit = useCallback(
    (role: RoleWithDetails) => {
      if (!isOnline) {
        toast.error('Cannot edit roles while offline')
        return
      }
      setSelectedRole(role)
      setShowModal(true)
    },
    [isOnline]
  )

  const handleDelete = useCallback(
    async (role: RoleWithDetails) => {
      if (!isOnline) {
        toast.error('Cannot delete roles while offline')
        return
      }
      if (role.is_system) {
        toast.error('Cannot delete a system role')
        return
      }
      if ((role.user_count || 0) > 0) {
        toast.error('Cannot delete a role that is assigned to users')
        return
      }
      if (!confirm(`Delete role "${getRoleName(role)}"?`)) return

      try {
        await deleteRole.mutateAsync(role.id)
        toast.success('Role deleted successfully')
      } catch (error) {
        logError('Error deleting role:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to delete role')
      }
    },
    [isOnline, deleteRole]
  )

  const handleSave = useCallback(
    async (input: RoleFormInput) => {
      try {
        if (selectedRole) {
          await updateRole.mutateAsync({ id: selectedRole.id, input })
          toast.success('Role updated successfully')
        } else {
          await createRole.mutateAsync(input)
          toast.success('Role created successfully')
        }
        setShowModal(false)
        setSelectedRole(null)
      } catch (error) {
        logError('Error saving role:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to save role')
        throw error
      }
    },
    [selectedRole, createRole, updateRole]
  )

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setSelectedRole(null)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
          <div className="flex flex-col items-center justify-center py-16 text-[var(--theme-text-muted)] gap-3">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
            <span className="text-sm">Loading roles...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (rolesError) {
    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
          <div className="flex items-center justify-center py-16 text-red-400">
            Failed to load roles. Please try again.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Offline Warning */}
      {!isOnline && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          <WifiOff size={18} />
          <span>You are offline. Role management is read-only until you reconnect.</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/settings/security"
            className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            title="Back to settings"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Role Management</h1>
            <p className="text-[var(--theme-text-muted)] text-sm mt-0.5">
              Configure roles and their access permissions
            </p>
          </div>
        </div>
        <PermissionGuard permission="users.roles">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50"
            onClick={handleCreate}
            disabled={!isOnline}
          >
            <Plus size={18} />
            New Role
          </button>
        </PermissionGuard>
      </header>

      {/* Roles Grid */}
      <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">System Roles</h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
            {roles.length} role{roles.length !== 1 ? 's' : ''} configured
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canEdit={isOnline && isAdmin}
                canDelete={isOnline && isAdmin}
              />
            ))}
          </div>

          {roles.length === 0 && (
            <div className="text-center py-12 text-[var(--theme-text-muted)]">
              No roles configured yet. Create your first role to get started.
            </div>
          )}
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        role={selectedRole}
        permissions={permissions}
        isSaving={isSaving}
      />
    </div>
  )
}

// Wrap with RouteGuard for page-level permission check
export default function RolesPage() {
  return (
    <RouteGuard permission="users.view">
      <RolesPageContent />
    </RouteGuard>
  )
}
