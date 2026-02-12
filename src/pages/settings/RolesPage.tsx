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

  // Open modal for creating a new role
  const handleCreate = useCallback(() => {
    if (!isOnline) {
      toast.error('Cannot create roles while offline')
      return
    }
    setSelectedRole(null)
    setShowModal(true)
  }, [isOnline])

  // Open modal for editing a role
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

  // Delete a role with confirmation
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

      if (!confirm(`Delete role "${getRoleName(role)}"?`)) {
        return
      }

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

  // Save role (create or update)
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
        throw error // Re-throw to prevent modal from closing
      }
    },
    [selectedRole, createRole, updateRole]
  )

  // Close modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setSelectedRole(null)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-lg h-full overflow-y-auto bg-cream">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col items-center justify-center p-2xl text-center text-smoke gap-md">
            <div className="w-6 h-6 border-3 border-border border-t-[var(--color-rose-poudre)] rounded-full animate-spin" />
            <span>Loading roles...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (rolesError) {
    return (
      <div className="p-lg h-full overflow-y-auto bg-cream">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-lg">
            <div className="text-red-600 text-center py-8">
              Failed to load roles. Please try again.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-lg h-full overflow-y-auto bg-cream">
      {/* Offline Warning */}
      {!isOnline && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-amber-500/10 rounded-lg text-amber-600 text-sm">
          <WifiOff size={18} />
          <span>You are offline. Role management is read-only until you reconnect.</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-lg">
        <div className="flex items-center gap-4">
          <Link
            to="/settings/security"
            className="w-9 h-9 flex items-center justify-center bg-white border border-border rounded-sm text-smoke cursor-pointer transition-all duration-fast ease-standard hover:border-[var(--color-rose-poudre)] hover:text-[var(--color-rose-poudre)]"
            title="Back to settings"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-4xl font-bold text-espresso">Role Management</h1>
            <p className="text-smoke text-sm mt-1">
              Configure roles and their access permissions
            </p>
          </div>
        </div>
        <PermissionGuard permission="users.roles">
          <button
            type="button"
            className="inline-flex items-center gap-xs py-sm px-lg bg-[var(--color-rose-poudre)] text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-all duration-fast ease-standard hover:opacity-90"
            onClick={handleCreate}
            disabled={!isOnline}
          >
            <Plus size={18} />
            New Role
          </button>
        </PermissionGuard>
      </header>

      {/* Roles Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-lg border-b border-border">
          <div className="flex items-start justify-between gap-md">
            <div>
              <h2 className="flex items-center gap-sm text-lg font-semibold text-espresso mb-xs">System Roles</h2>
              <p className="text-sm text-smoke">
                {roles.length} role{roles.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>

        <div className="p-lg">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
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
            <div className="text-center py-12 text-smoke">
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
