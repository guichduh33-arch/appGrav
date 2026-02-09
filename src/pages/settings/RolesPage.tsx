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

import './SettingsPage.css'

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
        console.error('Error deleting role:', error)
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
        console.error('Error saving role:', error)
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
      <div className="settings-page">
        <div className="settings-section">
          <div className="settings-section__body settings-section__loading">
            <div className="spinner" />
            <span>Loading roles...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (rolesError) {
    return (
      <div className="settings-page">
        <div className="settings-section">
          <div className="settings-section__body">
            <div className="text-red-600 text-center py-8">
              Failed to load roles. Please try again.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      {/* Offline Warning */}
      {!isOnline && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-amber-500/10 rounded-lg text-amber-600 text-sm">
          <WifiOff size={18} />
          <span>You are offline. Role management is read-only until you reconnect.</span>
        </div>
      )}

      {/* Header */}
      <header className="settings-page__header">
        <div className="flex items-center gap-4">
          <Link to="/settings/security" className="btn-icon" title="Back to settings">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="settings-page__title">Role Management</h1>
            <p className="text-[var(--color-gris-chaud)] text-sm mt-1">
              Configure roles and their access permissions
            </p>
          </div>
        </div>
        <PermissionGuard permission="users.roles">
          <button
            type="button"
            className="btn-primary"
            onClick={handleCreate}
            disabled={!isOnline}
          >
            <Plus size={18} />
            New Role
          </button>
        </PermissionGuard>
      </header>

      {/* Roles Grid */}
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title">System Roles</h2>
              <p className="settings-section__description">
                {roles.length} role{roles.length !== 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>

        <div className="settings-section__body">
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
            <div className="text-center py-12 text-[var(--color-gris-chaud)]">
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
