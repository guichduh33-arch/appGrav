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
import { toast } from 'sonner'
import {
    usePermissionsMatrix,
    useSavePermissions,
    type IPermission as Permission,
} from '@/hooks/usePermissionsData'
import { cn } from '@/lib/utils'

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
    // React Query hooks
    const { data: matrixData, isLoading: loading } = usePermissionsMatrix()
    const savePermissionsMutation = useSavePermissions()

    const roles = matrixData?.roles ?? []
    const permissions = (matrixData?.permissions ?? []) as Permission[]

    const [rolePermissions, setRolePermissions] = useState<Map<string, Set<string>>>(new Map())
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(MODULE_ORDER))
    const [searchTerm, setSearchTerm] = useState('')
    const [hasChanges, setHasChanges] = useState(false)
    const [originalRolePermissions, setOriginalRolePermissions] = useState<Map<string, Set<string>>>(new Map())

    // Sync hook data into local state for editing
    useEffect(() => {
        if (matrixData?.rolePermissions) {
            const cloned = new Map([...matrixData.rolePermissions].map(([k, v]) => [k, new Set(v)]))
            setRolePermissions(cloned)
            setOriginalRolePermissions(new Map([...matrixData.rolePermissions].map(([k, v]) => [k, new Set(v)])))
            setHasChanges(false)
        }
    }, [matrixData])

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

    const saving = savePermissionsMutation.isPending

    const handleSave = async () => {
        try {
            await savePermissionsMutation.mutateAsync({
                roles,
                current: rolePermissions,
                original: originalRolePermissions,
            })
            setOriginalRolePermissions(new Map([...rolePermissions].map(([k, v]) => [k, new Set(v)])))
            setHasChanges(false)
            toast.success('Permissions saved')
        } catch (error) {
            console.error('Error saving permissions:', error)
            toast.error('Error saving')
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
            <div className="p-5 flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-400">
                <RefreshCw className="animate-spin" size={32} />
                <span>Loading permissions...</span>
            </div>
        )
    }

    return (
        <div className="p-5 max-w-full">
            <header className="flex justify-between items-start mb-6 flex-wrap gap-4 max-md:flex-col">
                <div>
                    <h1 className="flex items-center gap-2.5 text-2xl font-semibold m-0 text-gray-900">
                        <Shield size={24} /> Permissions Management
                    </h1>
                    <p className="text-gray-500 mt-1 ml-[34px]">Configure access for each role</p>
                </div>
                <div className="flex gap-3 max-md:w-full max-md:[&>button]:flex-1 max-md:[&>button]:justify-center">
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

            <div className="flex items-center gap-2.5 py-2.5 px-4 bg-white border border-gray-200 rounded-[10px] mb-5 max-w-[400px] [&>svg]:text-gray-400">
                <Search size={18} />
                <input
                    type="text"
                    className="flex-1 border-none outline-none text-[0.95rem]"
                    placeholder="Search for a permission..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
                <table className="w-full border-collapse min-w-[800px] [&_th]:py-3 [&_th]:px-4 [&_th]:text-left [&_th]:border-b [&_th]:border-gray-200 [&_td]:py-3 [&_td]:px-4 [&_td]:border-b [&_td]:border-gray-200">
                    <thead>
                        <tr>
                            <th className="min-w-[280px] bg-gray-50 font-semibold text-[0.85rem] text-gray-700 sticky top-0 z-10">Permission</th>
                            {roles.map(role => (
                                <th key={role.id} className="min-w-[120px] !text-center bg-gray-50 font-semibold text-[0.85rem] text-gray-700 sticky top-0 z-10">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span>{getLocalizedName(role)}</span>
                                        <span className="text-[0.7rem] font-normal text-gray-400 font-mono">{role.code}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredModules.map(module => (
                            <>
                                <tr key={module} className="bg-gray-100 hover:bg-gray-200">
                                    <td
                                        className="flex items-center gap-2 cursor-pointer font-medium"
                                        onClick={() => toggleModule(module)}
                                    >
                                        {expandedModules.has(module) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                        <strong>{getModuleLabel(module)}</strong>
                                        <span className="text-gray-400 font-normal text-[0.85rem]">
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
                                            <td key={role.id} className="!text-center">
                                                <button
                                                    className={cn(
                                                        'w-8 h-8 border-none rounded-md cursor-pointer inline-flex items-center justify-center transition-all duration-200 hover:scale-110',
                                                        allGranted && 'bg-emerald-500 text-white',
                                                        noneGranted && 'bg-gray-200 text-gray-400',
                                                        !allGranted && !noneGranted && 'bg-amber-400 text-amber-900 text-xs font-semibold'
                                                    )}
                                                    onClick={() => toggleAllForRole(role.id, module, !allGranted)}
                                                    title={allGranted ? 'Remove all' : 'Grant all'}
                                                >
                                                    {allGranted ? (
                                                        <Check size={16} />
                                                    ) : noneGranted ? (
                                                        <X size={16} />
                                                    ) : (
                                                        <span>{grantedCount}</span>
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
                                        <tr key={perm.id} className="hover:bg-gray-50">
                                            <td className="!pl-10">
                                                <span className="block text-gray-700">{getLocalizedName(perm)}</span>
                                                <span className="block text-xs text-gray-400 font-mono">{perm.code}</span>
                                                {perm.description && (
                                                    <span className="inline-flex items-center ml-1.5 text-gray-400 cursor-help" title={perm.description}>
                                                        <Info size={12} />
                                                    </span>
                                                )}
                                            </td>
                                            {roles.map(role => {
                                                const rolePerms = rolePermissions.get(role.id) || new Set()
                                                const hasPermission = rolePerms.has(perm.id)

                                                return (
                                                    <td key={role.id} className="!text-center">
                                                        <button
                                                            className={cn(
                                                                'w-6 h-6 border-2 border-gray-300 rounded-md bg-white cursor-pointer inline-flex items-center justify-center transition-all duration-200 hover:border-blue-500',
                                                                hasPermission && 'bg-blue-500 border-blue-500 text-white'
                                                            )}
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
