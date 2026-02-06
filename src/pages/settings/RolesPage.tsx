import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Plus, Edit2, Trash2, X, Save, Users, Key,
  ChevronDown, ChevronRight, RefreshCw, AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import './SettingsPage.css';

interface Role {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description?: string;
  is_sensitive: boolean;
}

interface RoleWithPermissions extends Role {
  permissions?: string[];
  user_count?: number;
}

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

const MODULE_LABELS: Record<string, { fr: string; en: string; id: string }> = {
  sales: { fr: 'Ventes', en: 'Sales', id: 'Penjualan' },
  inventory: { fr: 'Inventaire', en: 'Inventory', id: 'Inventaris' },
  products: { fr: 'Produits', en: 'Products', id: 'Produk' },
  customers: { fr: 'Clients', en: 'Customers', id: 'Pelanggan' },
  reports: { fr: 'Rapports', en: 'Reports', id: 'Laporan' },
  users: { fr: 'Utilisateurs', en: 'Users', id: 'Pengguna' },
  settings: { fr: 'Paramètres', en: 'Settings', id: 'Pengaturan' },
  production: { fr: 'Production', en: 'Production', id: 'Produksi' },
  purchases: { fr: 'Achats', en: 'Purchases', id: 'Pembelian' },
  pos: { fr: 'Caisse', en: 'POS', id: 'Kasir' },
  kds: { fr: 'Cuisine', en: 'Kitchen', id: 'Dapur' },
};

export default function RolesPage() {
  // Use English
  const lang = 'en' as const;

  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name_fr: '',
    name_en: '',
    name_id: '',
    description: '',
    hierarchy_level: 50,
    is_system: false,
    selectedPermissions: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load roles with user count
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select(`
          *,
          user_roles(count)
        `)
        .order('hierarchy_level', { ascending: false });

      if (rolesError) throw rolesError;

      // Load role permissions
      const { data: rolePermsData, error: rolePermsError } = await supabase
        .from('role_permissions')
        .select('role_id, permission_id');

      if (rolePermsError) throw rolePermsError;

      // Load all permissions
      const { data: permsData, error: permsError } = await supabase
        .from('permissions')
        .select('*')
        .order('module, code');

      if (permsError) throw permsError;

      // Define inline types for Supabase results
      type RoleRow = Role & { user_roles?: { count: number }[] };
      type RolePermRow = { role_id: string; permission_id: string };
      type PermissionRow = Partial<Permission> & { id: string; code: string; module: string };

      // Cast through unknown to handle Supabase type mismatches
      const rawRoles = rolesData as unknown as RoleRow[];
      const rawRolePerms = rolePermsData as unknown as RolePermRow[];
      const rawPerms = permsData as unknown as PermissionRow[];

      // Map permissions to roles
      const rolesWithPerms = (rawRoles || []).map((role) => ({
        ...role,
        permissions: (rawRolePerms || [])
          .filter((rp) => rp.role_id === role.id)
          .map((rp) => rp.permission_id),
        user_count: role.user_roles?.[0]?.count || 0,
      }));

      setRoles(rolesWithPerms as RoleWithPermissions[]);
      // Map permissions to include missing fields
      const mappedPerms = (rawPerms || []).map((p) => ({
        ...p,
        action: p.action || p.code.split('.').pop() || '',
        is_sensitive: p.is_sensitive ?? false,
      }));
      setPermissions(mappedPerms as Permission[]);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error loading');
    } finally {
      setIsLoading(false);
    }
  };

  // Group permissions by module
  const permissionGroups: PermissionGroup[] = permissions.reduce((acc, perm) => {
    const existing = acc.find(g => g.module === perm.module);
    if (existing) {
      existing.permissions.push(perm);
    } else {
      acc.push({ module: perm.module, permissions: [perm] });
    }
    return acc;
  }, [] as PermissionGroup[]);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const openCreateModal = () => {
    setSelectedRole(null);
    setFormData({
      code: '',
      name_fr: '',
      name_en: '',
      name_id: '',
      description: '',
      hierarchy_level: 50,
      is_system: false,
      selectedPermissions: [],
    });
    setExpandedModules(new Set());
    setShowModal(true);
  };

  const openEditModal = (role: RoleWithPermissions) => {
    setSelectedRole(role);
    setFormData({
      code: role.code,
      name_fr: role.name_fr || '',
      name_en: role.name_en || '',
      name_id: role.name_id || '',
      description: role.description || '',
      hierarchy_level: role.hierarchy_level || 50,
      is_system: role.is_system || false,
      selectedPermissions: role.permissions || [],
    });
    setExpandedModules(new Set(permissionGroups.map(g => g.module)));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name_fr.trim()) {
      toast.error('Le code et le nom sont requis');
      return;
    }

    setIsSaving(true);
    try {
      const roleData = {
        code: formData.code.toUpperCase(),
        name_fr: formData.name_fr,
        name_en: formData.name_en || formData.name_fr,
        name_id: formData.name_id || formData.name_fr,
        description: formData.description,
        hierarchy_level: formData.hierarchy_level,
        is_system: formData.is_system,
      };

      let roleId: string;

      if (selectedRole) {
        const { error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', selectedRole.id);

        if (error) throw error;
        roleId = selectedRole.id;
      } else {
        const { data, error } = await supabase
          .from('roles')
          .insert(roleData)
          .select('id')
          .single();

        if (error) throw error;
        roleId = data.id;
      }

      // Update permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (formData.selectedPermissions.length > 0) {
        const permissionInserts = formData.selectedPermissions.map(permId => ({
          role_id: roleId,
          permission_id: permId,
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts);

        if (permError) throw permError;
      }

      toast.success(selectedRole ? 'Rôle mis à jour' : 'Rôle créé');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role: RoleWithPermissions) => {
    if (role.is_system) {
      toast.error('Cannot delete a system role');
      return;
    }

    if ((role.user_count || 0) > 0) {
      toast.error('Ce rôle est assigné à des utilisateurs');
      return;
    }

    if (!confirm(`Delete role "${getRoleName(role)}"?`)) {
      return;
    }

    try {
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id);

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', role.id);

      if (error) throw error;

      toast.success('Rôle supprimé');
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error instanceof Error ? error.message : 'Error deleting');
    }
  };

  const getRoleName = (role: Role) => {
    const nameKey = `name_${lang}` as keyof Role;
    return (role[nameKey] as string) || role.name_fr || role.code;
  };

  const getPermissionName = (perm: Permission) => {
    const nameKey = `name_${lang}` as keyof Permission;
    return (perm[nameKey] as string) || perm.name_fr || perm.code;
  };

  const getModuleName = (module: string) => {
    const labels = MODULE_LABELS[module];
    if (!labels) return module;
    return labels[lang] || labels.fr || module;
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permId)
        ? prev.selectedPermissions.filter(id => id !== permId)
        : [...prev.selectedPermissions, permId],
    }));
  };

  const toggleModulePermissions = (module: string) => {
    const modulePerms = permissions.filter(p => p.module === module).map(p => p.id);
    const allSelected = modulePerms.every(id => formData.selectedPermissions.includes(id));

    setFormData(prev => ({
      ...prev,
      selectedPermissions: allSelected
        ? prev.selectedPermissions.filter(id => !modulePerms.includes(id))
        : [...new Set([...prev.selectedPermissions, ...modulePerms])],
    }));
  };

  const getHierarchyLabel = (level: number) => {
    if (level >= 90) return { label: 'Super Admin', color: 'section-badge--warehouse' };
    if (level >= 70) return { label: 'Admin', color: 'section-badge--production' };
    if (level >= 50) return { label: 'Manager', color: 'section-badge--sales' };
    if (level >= 30) return { label: 'Employé', color: 'section-badge' };
    return { label: 'Lecteur', color: 'section-badge' };
  };

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
    );
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-page__header">
        <div className="flex items-center gap-4">
          <Link
            to="/settings/security"
            className="btn-icon"
            title="Back to settings"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="settings-page__title">Role Management</h1>
            <p className="text-[var(--color-gris-chaud)] text-sm mt-1">
              Configure roles and their access permissions
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          New Role
        </button>
      </header>

      {/* Roles Grid */}
      <div className="settings-section">
        <div className="settings-section__header">
          <div className="settings-section__header-content">
            <div>
              <h2 className="settings-section__title">System Roles</h2>
              <p className="settings-section__description">
                {roles.length} role{roles.length > 1 ? 's' : ''} configured
              </p>
            </div>
          </div>
        </div>

        <div className="settings-section__body">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            {roles.map(role => {
              const permCount = role.permissions?.length || 0;
              const hierarchy = getHierarchyLabel(role.hierarchy_level || 0);

              return (
                <div
                  key={role.id}
                  className="section-item flex-col items-stretch p-6"
                >
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
                      <span className="section-badge section-badge--sales">
                        Système
                      </span>
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
                      <span>{role.user_count || 0} user{(role.user_count || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--color-gris-chaud)] text-sm">
                      <Key size={16} />
                      <span>{permCount} permission{permCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Hierarchy Badge + Actions */}
                  <div className="flex items-center justify-between">
                    <span className={`section-badge ${hierarchy.color}`}>
                      Niveau {role.hierarchy_level} - {hierarchy.label}
                    </span>

                    <div className="flex gap-2">
                      <button
                        className="btn-icon"
                        onClick={() => openEditModal(role)}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      {!role.is_system && (role.user_count || 0) === 0 && (
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={() => handleDelete(role)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="settings-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="settings-modal max-w-[800px]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="settings-modal__header">
              <h2 className="settings-modal__title">
                {selectedRole ? 'Modifier le rôle' : 'Nouveau rôle'}
              </h2>
              <button
                type="button"
                className="settings-modal__close"
                onClick={() => setShowModal(false)}
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="settings-modal__body max-h-[60vh] overflow-y-auto">
              {selectedRole?.is_system && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg mb-6 text-amber-600 text-sm">
                  <AlertTriangle size={18} />
                  <span>Rôle système - modification limitée</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                {/* Left: Role Info */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-brun-chocolat)] mb-4">
                    Informations du rôle
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className="form-input form-input--mono"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="MANAGER"
                      disabled={selectedRole?.is_system}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nom (Français) *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name_fr}
                      onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                      placeholder="Gérant"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nom (English)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        placeholder="Manager"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nama (Indonesia)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.name_id}
                        onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                        placeholder="Manajer"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input form-textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Role description..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Niveau hiérarchique</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.hierarchy_level}
                        onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) })}
                        className="flex-1"
                        disabled={selectedRole?.is_system}
                        title="Niveau hiérarchique"
                        aria-label="Niveau hiérarchique"
                      />
                      <span
                        className={`section-badge ${getHierarchyLabel(formData.hierarchy_level).color} min-w-[50px] text-center`}
                      >
                        {formData.hierarchy_level}
                      </span>
                    </div>
                    <p className="form-hint">
                      Plus le niveau est élevé, plus le rôle a d'autorité
                    </p>
                  </div>
                </div>

                {/* Right: Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-brun-chocolat)] mb-4">
                    Permissions ({formData.selectedPermissions.length})
                  </h3>

                  <div className="border border-[var(--color-border)] rounded-lg max-h-[350px] overflow-y-auto">
                    {permissionGroups.map(group => {
                      const isExpanded = expandedModules.has(group.module);
                      const selectedCount = group.permissions.filter(p =>
                        formData.selectedPermissions.includes(p.id)
                      ).length;
                      const allSelected = selectedCount === group.permissions.length;

                      return (
                        <div key={group.module} className="border-b border-[var(--color-border)] last:border-0">
                          <button
                            type="button"
                            onClick={() => toggleModule(group.module)}
                            className="w-full flex items-center justify-between px-4 py-2 bg-transparent border-0 cursor-pointer text-left hover:bg-gray-50 transition-colors"
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
                                  e.stopPropagation();
                                  toggleModulePermissions(group.module);
                                }}
                                className={`section-badge cursor-pointer border-0 ${allSelected ? 'section-badge--sales' : ''}`}
                              >
                                {allSelected ? 'Tout désél.' : 'Tout sél.'}
                              </button>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="bg-[var(--color-blanc-creme)] px-4 py-2 space-y-1">
                              {group.permissions.map(perm => (
                                <label
                                  key={perm.id}
                                  className="flex items-center gap-2 px-2 py-1 cursor-pointer rounded hover:bg-black/5 transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.selectedPermissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                    className="accent-[var(--color-rose-poudre)]"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm text-[var(--color-brun-chocolat)]">
                                      {getPermissionName(perm)}
                                    </span>
                                    {perm.is_sensitive && (
                                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-600 rounded">
                                        Sensible
                                      </span>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="settings-modal__footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
