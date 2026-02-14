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
    <div className="bg-black/20 border border-white/5 rounded-xl p-5 flex flex-col hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white m-0 text-base">
              {getRoleName(role)}
            </h3>
            <span className="font-mono text-[11px] text-[var(--theme-text-muted)]">
              {role.code}
            </span>
          </div>
        </div>
        {role.is_system && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-sky-500/10 text-sky-400">
            System
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--theme-text-muted)] mb-4 leading-relaxed">
        {role.description || 'No description'}
      </p>

      {/* Stats */}
      <div className="flex gap-5 mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-[var(--theme-text-muted)] text-sm">
          <Users size={14} />
          <span>
            {role.user_count || 0} user{(role.user_count || 0) !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--theme-text-muted)] text-sm">
          <Key size={14} />
          <span>
            {permCount} permission{permCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Hierarchy Badge + Actions */}
      <div className="flex items-center justify-between mt-auto">
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
          (role.hierarchy_level || 0) >= 90
            ? 'bg-red-500/10 text-red-400'
            : (role.hierarchy_level || 0) >= 70
            ? 'bg-amber-500/10 text-amber-400'
            : (role.hierarchy_level || 0) >= 40
            ? 'bg-sky-500/10 text-sky-400'
            : 'bg-white/5 text-[var(--theme-text-muted)]'
        }`}>
          Level {role.hierarchy_level} - {hierarchy.label}
        </span>

        <div className="flex gap-1.5">
          {canEdit && (
            <button
              className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => onEdit(role)}
              title="Edit role"
            >
              <Edit2 size={14} />
            </button>
          )}
          {canDeleteRole && (
            <button
              className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={() => onDelete(role)}
              title="Delete role"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RoleCard
