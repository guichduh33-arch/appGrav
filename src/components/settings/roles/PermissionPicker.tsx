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

  const permissionGroups = useMemo(
    () => groupPermissionsByModule(permissions),
    [permissions]
  )

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

  const expandAll = useCallback(() => {
    setExpandedModules(new Set(permissionGroups.map((g) => g.module)))
  }, [permissionGroups])

  const collapseAll = useCallback(() => {
    setExpandedModules(new Set())
  }, [])

  return (
    <div>
      {/* Header with expand/collapse controls */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
          Permissions ({selectedPermissions.length})
        </h3>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="text-[var(--color-gold)] hover:underline"
            disabled={disabled}
          >
            Expand all
          </button>
          <span className="text-[var(--theme-text-muted)]">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[var(--color-gold)] hover:underline"
            disabled={disabled}
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Permission groups */}
      <div className="border border-white/10 rounded-xl max-h-[350px] overflow-y-auto">
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
    <div className="border-b border-white/5 last:border-0">
      {/* Module header */}
      <button
        type="button"
        onClick={onToggleModule}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-transparent border-0 cursor-pointer text-left hover:bg-white/[0.02] transition-colors"
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown size={14} className="text-[var(--theme-text-muted)]" />
          ) : (
            <ChevronRight size={14} className="text-[var(--theme-text-muted)]" />
          )}
          <span className="font-medium text-white text-sm">
            {getModuleName(group.module)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--theme-text-muted)]">
            {selectedCount}/{group.permissions.length}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleModulePermissions()
            }}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border-0 cursor-pointer transition-colors ${
              allSelected
                ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                : 'bg-white/5 text-[var(--theme-text-muted)] hover:text-white'
            }`}
            disabled={disabled}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      </button>

      {/* Permission checkboxes */}
      {isExpanded && (
        <div className="bg-black/20 px-4 py-2 space-y-0.5">
          {group.permissions.map((perm) => (
            <label
              key={perm.id}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                disabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:bg-white/[0.03]'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(perm.id)}
                onChange={() => onTogglePermission(perm.id)}
                className="accent-[var(--color-gold)]"
                disabled={disabled}
              />
              <div className="flex-1">
                <span className="text-sm text-white/80">
                  {getPermissionName(perm)}
                </span>
                {perm.is_sensitive && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">
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
