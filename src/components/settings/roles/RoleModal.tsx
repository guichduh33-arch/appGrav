import { useState, useEffect } from 'react'
import { X, Save, RefreshCw, AlertTriangle } from 'lucide-react'
import { PermissionPicker } from './PermissionPicker'
import type { Permission } from '@/types/auth'
import type { RoleWithDetails, RoleFormInput } from '@/hooks/settings/useRoles'
import { getHierarchyLabel, getRoleName } from '@/hooks/settings/useRoles'

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (input: RoleFormInput) => Promise<void>
  role?: RoleWithDetails | null
  permissions: Permission[]
  isSaving?: boolean
}

export function RoleModal({
  isOpen,
  onClose,
  onSave,
  role,
  permissions,
  isSaving = false,
}: RoleModalProps) {
  const [formData, setFormData] = useState<RoleFormInput>({
    code: '',
    name: '',
    description: '',
    hierarchy_level: 50,
    is_system: false,
    permission_ids: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        code: role.code,
        name: role.name_en || role.name_fr || '',
        description: role.description || '',
        hierarchy_level: role.hierarchy_level || 50,
        is_system: role.is_system || false,
        permission_ids: role.permissions || [],
      })
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        hierarchy_level: 50,
        is_system: false,
        permission_ids: [],
      })
    }
    setErrors({})
  }, [role, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required'
    } else if (!/^[A-Z_]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = 'Code must contain only letters and underscores'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.hierarchy_level < 0 || formData.hierarchy_level > 100) {
      newErrors.hierarchy_level = 'Level must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSave(formData)
  }

  const handlePermissionsChange = (permissionIds: string[]) => {
    setFormData((prev) => ({ ...prev, permission_ids: permissionIds }))
  }

  if (!isOpen) return null

  const isEditing = !!role
  const isSystemRole = role?.is_system || false
  const hierarchyInfo = getHierarchyLabel(formData.hierarchy_level)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[800px] bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? `Edit Role: ${getRoleName(role)}` : 'New Role'}
          </h2>
          <button
            type="button"
            className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {isSystemRole && (
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 text-amber-400 text-sm">
              <AlertTriangle size={18} />
              <span>System role - limited modification allowed</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* Left: Role Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                Role Information
              </h3>

              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--theme-text-muted)]">Code *</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 bg-black/40 border rounded-xl text-white font-mono text-sm outline-none transition-colors ${
                    errors.code
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                  }`}
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="MANAGER"
                  disabled={isSystemRole}
                />
                {errors.code && (
                  <p className="text-xs text-red-400">{errors.code}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--theme-text-muted)]">Name *</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 bg-black/40 border rounded-xl text-white text-sm outline-none transition-colors ${
                    errors.name
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-white/10 focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20'
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Manager"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--theme-text-muted)]">Description</label>
                <textarea
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none transition-colors focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Role description..."
                  rows={3}
                />
              </div>

              {/* Hierarchy Level */}
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--theme-text-muted)]">Hierarchy Level</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.hierarchy_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hierarchy_level: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 accent-[var(--color-gold)]"
                    disabled={isSystemRole}
                    title="Hierarchy level"
                    aria-label="Hierarchy level"
                  />
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full min-w-[50px] text-center ${
                    formData.hierarchy_level >= 90
                      ? 'bg-red-500/10 text-red-400'
                      : formData.hierarchy_level >= 70
                      ? 'bg-amber-500/10 text-amber-400'
                      : formData.hierarchy_level >= 40
                      ? 'bg-sky-500/10 text-sky-400'
                      : 'bg-white/5 text-[var(--theme-text-muted)]'
                  }`}>
                    {formData.hierarchy_level}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--theme-text-muted)]">
                  {hierarchyInfo.label} - Higher level = more authority
                </p>
                {errors.hierarchy_level && (
                  <p className="text-xs text-red-400">{errors.hierarchy_level}</p>
                )}
              </div>
            </div>

            {/* Right: Permissions */}
            <div>
              <PermissionPicker
                permissions={permissions}
                selectedPermissions={formData.permission_ids}
                onChange={handlePermissionsChange}
                initialExpandAll={isEditing}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 shrink-0">
          <button
            type="button"
            className="px-4 py-2 bg-transparent border border-white/10 text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:opacity-90 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditing ? 'Update Role' : 'Create Role'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleModal
