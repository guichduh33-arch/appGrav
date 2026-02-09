import { Shield, Users, Key, Edit2, Trash2 } from 'lucide-react'
import type { RoleWithDetails } from '@/hooks/settings/useRoles'
import { getRoleName, getHierarchyLabel } from '@/hooks/settings/useRoles'

interface RoleCardProps {
  role: RoleWithDetails
  onEdit: (role: RoleWithDetails) => void
  onDelete: (role: RoleWithDetails) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function RoleCard({
  role,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: RoleCardProps) {
  const permCount = role.permissions?.length || 0
  const hierarchy = getHierarchyLabel(role.hierarchy_level || 0)
  const canDeleteRole = canDelete && !role.is_system && (role.user_count || 0) === 0

  return (
    <div className="section-item flex-col items-stretch p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-rose-poudre)] text-white">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-brun-chocolat)] m-0 text-base">
              {getRoleName(role)}
            </h3>
            <span className="font-mono text-xs text-[var(--color-gris-chaud)]">
              {role.code}
            </span>
          </div>
        </div>
        {role.is_system && (
          <span className="section-badge section-badge--sales">System</span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--color-gris-chaud)] mb-4 leading-normal">
        {role.description || 'No description'}
      </p>

      {/* Stats */}
      <div className="flex gap-6 mb-4 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-gris-chaud)] text-sm">
          <Users size={16} />
          <span>
            {role.user_count || 0} user{(role.user_count || 0) !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--color-gris-chaud)] text-sm">
          <Key size={16} />
          <span>
            {permCount} permission{permCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Hierarchy Badge + Actions */}
      <div className="flex items-center justify-between">
        <span className={`section-badge ${hierarchy.color}`}>
          Level {role.hierarchy_level} - {hierarchy.label}
        </span>

        <div className="flex gap-2">
          {canEdit && (
            <button
              className="btn-icon"
              onClick={() => onEdit(role)}
              title="Edit role"
            >
              <Edit2 size={16} />
            </button>
          )}
          {canDeleteRole && (
            <button
              className="btn-icon btn-icon--danger"
              onClick={() => onDelete(role)}
              title="Delete role"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoleCard
