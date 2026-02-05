/**
 * Permissions Management Page
 * Epic 10: Story 10.8
 *
 * Granular permissions UI for role management
 */

import { useState, useEffect } from 'react'
import {
    Shield, ChevronDown, ChevronRight, Check, X,
    Save, RefreshCw, Search, Info
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import './PermissionsPage.css'

interface Role {
    id: string
    code: string
    name_fr: string
    name_en: string
    name_id: string
    hierarchy_level: number
}

interface Permission {
    id: string
    code: string
    name_fr: string
    name_en: string
    name_id: string
    module: string
    description: string | null
}

interface RolePermission {
    role_id: string
    permission_id: string
}

// Group permissions by module
const MODULE_ORDER = [
    'sales',
    'products',
    'inventory',
    'customers',
    'reports',
    'users',
    'settings'
]

const MODULE_LABELS: Record<string, { fr: string; en: string; id: string }> = {
    sales: { fr: 'Ventes', en: 'Sales', id: 'Penjualan' },
    products: { fr: 'Produits', en: 'Products', id: 'Produk' },
    inventory: { fr: 'Inventaire', en: 'Inventory', id: 'Inventaris' },
    customers: { fr: 'Clients', en: 'Customers', id: 'Pelanggan' },
    reports: { fr: 'Rapports', en: 'Reports', id: 'Laporan' },
    users: { fr: 'Utilisateurs', en: 'Users', id: 'Pengguna' },
    settings: { fr: 'Paramètres', en: 'Settings', id: 'Pengaturan' }
}

export default function PermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [rolePermissions, setRolePermissions] = useState<Map<string, Set<string>>>(new Map())
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(MODULE_ORDER))
    const [searchTerm, setSearchTerm] = useState('')
    const [hasChanges, setHasChanges] = useState(false)
    const [originalRolePermissions, setOriginalRolePermissions] = useState<Map<string, Set<string>>>(new Map())

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [rolesRes, permsRes, rolePermsRes] = await Promise.all([
                supabase.from('roles').select('*').order('hierarchy_level'),
                supabase.from('permissions').select('*').order('module, code'),
                supabase.from('role_permissions').select('role_id, permission_id')
            ])

            if (rolesRes.data) setRoles(rolesRes.data as Role[])
            if (permsRes.data) setPermissions(permsRes.data)

            if (rolePermsRes.data) {
                const permMap = new Map<string, Set<string>>()
                for (const rp of rolePermsRes.data as RolePermission[]) {
                    if (!permMap.has(rp.role_id)) {
                        permMap.set(rp.role_id, new Set())
                    }
                    permMap.get(rp.role_id)!.add(rp.permission_id)
                }
                setRolePermissions(permMap)
                setOriginalRolePermissions(new Map([...permMap].map(([k, v]) => [k, new Set(v)])))
            }
        } catch (error) {
            console.error('Error loading permissions:', error)
            toast.error('Loading error')
        } finally {
            setLoading(false)
        }
    }

    const getLocalizedName = (item: { name_fr: string; name_en: string; name_id: string }) => {
        return item.name_en
    }

    const getModuleLabel = (module: string) => {
        const labels = MODULE_LABELS[module]
        if (!labels) return module
        return labels.en
    }

    const togglePermission = (roleId: string, permissionId: string) => {
        setRolePermissions(prev => {
            const newMap = new Map(prev)
            if (!newMap.has(roleId)) {
                newMap.set(roleId, new Set())
            }
            const rolePerms = new Set(newMap.get(roleId)!)
            if (rolePerms.has(permissionId)) {
                rolePerms.delete(permissionId)
            } else {
                rolePerms.add(permissionId)
            }
            newMap.set(roleId, rolePerms)
            return newMap
        })
        setHasChanges(true)
    }

    const toggleModule = (module: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev)
            if (newSet.has(module)) {
                newSet.delete(module)
            } else {
                newSet.add(module)
            }
            return newSet
        })
    }

    const toggleAllForRole = (roleId: string, module: string, grant: boolean) => {
        const modulePerms = permissions.filter(p => p.module === module)
        setRolePermissions(prev => {
            const newMap = new Map(prev)
            if (!newMap.has(roleId)) {
                newMap.set(roleId, new Set())
            }
            const rolePerms = new Set(newMap.get(roleId)!)
            for (const perm of modulePerms) {
                if (grant) {
                    rolePerms.add(perm.id)
                } else {
                    rolePerms.delete(perm.id)
                }
            }
            newMap.set(roleId, rolePerms)
            return newMap
        })
        setHasChanges(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Find changes
            const toInsert: RolePermission[] = []
            const toDelete: RolePermission[] = []

            for (const role of roles) {
                const current = rolePermissions.get(role.id) || new Set()
                const original = originalRolePermissions.get(role.id) || new Set()

                // New permissions to add
                for (const permId of current) {
                    if (!original.has(permId)) {
                        toInsert.push({ role_id: role.id, permission_id: permId })
                    }
                }

                // Permissions to remove
                for (const permId of original) {
                    if (!current.has(permId)) {
                        toDelete.push({ role_id: role.id, permission_id: permId })
                    }
                }
            }

            // Delete removed permissions
            for (const rp of toDelete) {
                await supabase
                    .from('role_permissions')
                    .delete()
                    .eq('role_id', rp.role_id)
                    .eq('permission_id', rp.permission_id)
            }

            // Insert new permissions
            if (toInsert.length > 0) {
                await supabase.from('role_permissions').insert(toInsert)
            }

            setOriginalRolePermissions(new Map([...rolePermissions].map(([k, v]) => [k, new Set(v)])))
            setHasChanges(false)
            toast.success('Permissions saved')
        } catch (error) {
            console.error('Error saving permissions:', error)
            toast.error('Error saving')
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        setRolePermissions(new Map([...originalRolePermissions].map(([k, v]) => [k, new Set(v)])))
        setHasChanges(false)
    }

    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = []
        }
        acc[perm.module].push(perm)
        return acc
    }, {} as Record<string, Permission[]>)

    const filteredModules = MODULE_ORDER.filter(module => {
        if (!searchTerm) return groupedPermissions[module]?.length > 0
        return groupedPermissions[module]?.some(p =>
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLocalizedName(p).toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    if (loading) {
        return (
            <div className="permissions-page loading">
                <RefreshCw className="spin" size={32} />
                <span>Loading permissions...</span>
            </div>
        )
    }

    return (
        <div className="permissions-page">
            <header className="permissions-page__header">
                <div>
                    <h1><Shield size={24} /> Permissions Management</h1>
                    <p>Configure access for each role</p>
                </div>
                <div className="permissions-page__actions">
                    {hasChanges && (
                        <button className="btn btn-secondary" onClick={handleReset}>
                            <X size={18} />
                            Cancel
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            <div className="permissions-page__search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Search for a permission..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="permissions-table-wrapper">
                <table className="permissions-table">
                    <thead>
                        <tr>
                            <th className="permission-col">Permission</th>
                            {roles.map(role => (
                                <th key={role.id} className="role-col">
                                    <div className="role-header">
                                        <span>{getLocalizedName(role)}</span>
                                        <span className="role-code">{role.code}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredModules.map(module => (
                            <>
                                <tr key={module} className="module-row">
                                    <td
                                        className="module-cell"
                                        onClick={() => toggleModule(module)}
                                    >
                                        {expandedModules.has(module) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                        <strong>{getModuleLabel(module)}</strong>
                                        <span className="permission-count">
                                            ({groupedPermissions[module]?.length || 0})
                                        </span>
                                    </td>
                                    {roles.map(role => {
                                        const modulePerms = groupedPermissions[module] || []
                                        const rolePerms = rolePermissions.get(role.id) || new Set()
                                        const grantedCount = modulePerms.filter(p => rolePerms.has(p.id)).length
                                        const allGranted = grantedCount === modulePerms.length
                                        const noneGranted = grantedCount === 0

                                        return (
                                            <td key={role.id} className="module-toggle-cell">
                                                <button
                                                    className={`module-toggle ${allGranted ? 'all' : noneGranted ? 'none' : 'partial'}`}
                                                    onClick={() => toggleAllForRole(role.id, module, !allGranted)}
                                                    title={allGranted ? 'Remove all' : 'Grant all'}
                                                >
                                                    {allGranted ? (
                                                        <Check size={16} />
                                                    ) : noneGranted ? (
                                                        <X size={16} />
                                                    ) : (
                                                        <span className="partial-indicator">{grantedCount}</span>
                                                    )}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                                {expandedModules.has(module) && groupedPermissions[module]?.map(perm => {
                                    if (searchTerm && !perm.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                        !getLocalizedName(perm).toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return null
                                    }

                                    return (
                                        <tr key={perm.id} className="permission-row">
                                            <td className="permission-cell">
                                                <span className="permission-name">{getLocalizedName(perm)}</span>
                                                <span className="permission-code">{perm.code}</span>
                                                {perm.description && (
                                                    <span className="permission-desc" title={perm.description}>
                                                        <Info size={12} />
                                                    </span>
                                                )}
                                            </td>
                                            {roles.map(role => {
                                                const rolePerms = rolePermissions.get(role.id) || new Set()
                                                const hasPermission = rolePerms.has(perm.id)

                                                return (
                                                    <td key={role.id} className="checkbox-cell">
                                                        <button
                                                            className={`permission-checkbox ${hasPermission ? 'checked' : ''}`}
                                                            onClick={() => togglePermission(role.id, perm.id)}
                                                        >
                                                            {hasPermission && <Check size={14} />}
                                                        </button>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
