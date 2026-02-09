import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Permission } from '@/types/auth'
import type { PermissionGroup } from '@/hooks/settings/useRoles'
import { groupPermissionsByModule, getModuleName, getPermissionName } from '@/hooks/settings/useRoles'

interface PermissionPickerProps {
  permissions: Permission[]
  selectedPermissions: string[]
  onChange: (permissionIds: string[]) => void
  disabled?: boolean
  initialExpandAll?: boolean
}

export function PermissionPicker({
  permissions,
  selectedPermissions,
  onChange,
  disabled = false,
  initialExpandAll = false,
}: PermissionPickerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => initialExpandAll ? new Set(permissions.map((p) => p.module)) : new Set()
  )

  // Group permissions by module
  const permissionGroups = useMemo(
    () => groupPermissionsByModule(permissions),
    [permissions]
  )

  // Toggle module expansion
  const toggleModule = useCallback((module: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(module)) {
        newSet.delete(module)
      } else {
        newSet.add(module)
      }
      return newSet
    })
  }, [])

  // Toggle single permission
  const togglePermission = useCallback(
    (permId: string) => {
      if (disabled) return
      const newSelected = selectedPermissions.includes(permId)
        ? selectedPermissions.filter((id) => id !== permId)
        : [...selectedPermissions, permId]
      onChange(newSelected)
    },
    [selectedPermissions, onChange, disabled]
  )

  // Toggle all permissions in a module
  const toggleModulePermissions = useCallback(
    (module: string) => {
      if (disabled) return
      const modulePerms = permissions
        .filter((p) => p.module === module)
        .map((p) => p.id)
      const allSelected = modulePerms.every((id) =>
        selectedPermissions.includes(id)
      )

      const newSelected = allSelected
        ? selectedPermissions.filter((id) => !modulePerms.includes(id))
        : [...new Set([...selectedPermissions, ...modulePerms])]

      onChange(newSelected)
    },
    [permissions, selectedPermissions, onChange, disabled]
  )

  // Expand all modules
  const expandAll = useCallback(() => {
    setExpandedModules(new Set(permissionGroups.map((g) => g.module)))
  }, [permissionGroups])

  // Collapse all modules
  const collapseAll = useCallback(() => {
    setExpandedModules(new Set())
  }, [])

  return (
    <div>
      {/* Header with expand/collapse controls */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[var(--color-brun-chocolat)]">
          Permissions ({selectedPermissions.length})
        </h3>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="text-[var(--color-rose-poudre)] hover:underline"
            disabled={disabled}
          >
            Expand all
          </button>
          <span className="text-[var(--color-gris-chaud)]">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[var(--color-rose-poudre)] hover:underline"
            disabled={disabled}
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Permission groups */}
      <div className="border border-[var(--color-border)] rounded-lg max-h-[350px] overflow-y-auto">
        {permissionGroups.map((group) => (
          <PermissionGroupSection
            key={group.module}
            group={group}
            isExpanded={expandedModules.has(group.module)}
            selectedPermissions={selectedPermissions}
            onToggleModule={() => toggleModule(group.module)}
            onToggleModulePermissions={() => toggleModulePermissions(group.module)}
            onTogglePermission={togglePermission}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

interface PermissionGroupSectionProps {
  group: PermissionGroup
  isExpanded: boolean
  selectedPermissions: string[]
  onToggleModule: () => void
  onToggleModulePermissions: () => void
  onTogglePermission: (permId: string) => void
  disabled?: boolean
}

function PermissionGroupSection({
  group,
  isExpanded,
  selectedPermissions,
  onToggleModule,
  onToggleModulePermissions,
  onTogglePermission,
  disabled = false,
}: PermissionGroupSectionProps) {
  const selectedCount = group.permissions.filter((p) =>
    selectedPermissions.includes(p.id)
  ).length
  const allSelected = selectedCount === group.permissions.length

  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      {/* Module header */}
      <button
        type="button"
        onClick={onToggleModule}
        className="w-full flex items-center justify-between px-4 py-2 bg-transparent border-0 cursor-pointer text-left hover:bg-gray-50 transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown size={16} color="var(--color-gris-chaud)" />
          ) : (
            <ChevronRight size={16} color="var(--color-gris-chaud)" />
          )}
          <span className="font-medium text-[var(--color-brun-chocolat)]">
            {getModuleName(group.module)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-gris-chaud)]">
            {selectedCount}/{group.permissions.length}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleModulePermissions()
            }}
            className={`section-badge cursor-pointer border-0 ${
              allSelected ? 'section-badge--sales' : ''
            }`}
            disabled={disabled}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      </button>

      {/* Permission checkboxes */}
      {isExpanded && (
        <div className="bg-[var(--color-blanc-creme)] px-4 py-2 space-y-1">
          {group.permissions.map((perm) => (
            <label
              key={perm.id}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                disabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:bg-black/5'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(perm.id)}
                onChange={() => onTogglePermission(perm.id)}
                className="accent-[var(--color-rose-poudre)]"
                disabled={disabled}
              />
              <div className="flex-1">
                <span className="text-sm text-[var(--color-brun-chocolat)]">
                  {getPermissionName(perm)}
                </span>
                {perm.is_sensitive && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-600 rounded">
                    Sensitive
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default PermissionPicker
