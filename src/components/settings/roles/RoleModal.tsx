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
    <div className="settings-modal-overlay" onClick={onClose}>
      <div
        className="settings-modal max-w-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="settings-modal__header">
          <h2 className="settings-modal__title">
            {isEditing ? `Edit Role: ${getRoleName(role)}` : 'New Role'}
          </h2>
          <button
            type="button"
            className="settings-modal__close"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="settings-modal__body max-h-[60vh] overflow-y-auto">
          {isSystemRole && (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg mb-6 text-amber-600 text-sm">
              <AlertTriangle size={18} />
              <span>System role - limited modification allowed</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            {/* Left: Role Info */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-brun-chocolat)] mb-4">
                Role Information
              </h3>

              {/* Code */}
              <div className="form-group">
                <label className="form-label">Code *</label>
                <input
                  type="text"
                  className={`form-input form-input--mono ${
                    errors.code ? 'form-input--error' : ''
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
                  <p className="form-error">{errors.code}</p>
                )}
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className={`form-input ${
                    errors.name ? 'form-input--error' : ''
                  }`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Manager"
                />
                {errors.name && (
                  <p className="form-error">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Role description..."
                  rows={3}
                />
              </div>

              {/* Hierarchy Level */}
              <div className="form-group">
                <label className="form-label">Hierarchy Level</label>
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
                    className="flex-1"
                    disabled={isSystemRole}
                    title="Hierarchy level"
                    aria-label="Hierarchy level"
                  />
                  <span
                    className={`section-badge ${hierarchyInfo.color} min-w-[50px] text-center`}
                  >
                    {formData.hierarchy_level}
                  </span>
                </div>
                <p className="form-hint">
                  {hierarchyInfo.label} - Higher level = more authority
                </p>
                {errors.hierarchy_level && (
                  <p className="form-error">{errors.hierarchy_level}</p>
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
        <div className="settings-modal__footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="spinning" />
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
