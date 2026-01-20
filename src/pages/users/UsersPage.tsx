import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Power,
  Key,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import type { Role } from '../../types/auth';

interface UserWithRoles {
  id: string;
  name: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  employee_code: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  user_roles: Array<{
    id: string;
    is_primary: boolean;
    role: Role;
  }>;
}

const UsersPage = () => {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const { hasPermission, isAdmin } = usePermissions();

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load users and roles
  useEffect(() => {
    loadData();
  }, [showInactive]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load roles
      const rolesData = await authService.getRoles();
      setRoles(rolesData);

      // Load users with roles
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          name,
          display_name,
          first_name,
          last_name,
          employee_code,
          phone,
          avatar_url,
          role,
          is_active,
          last_login_at,
          created_at,
          user_roles (
            id,
            is_primary,
            role:roles (
              id,
              code,
              name_fr,
              name_en,
              name_id,
              hierarchy_level
            )
          )
        `)
        .order('name');

      if (!showInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers((data as unknown as UserWithRoles[]) || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(t('common.error') || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.display_name?.toLowerCase().includes(searchLower) ||
        user.employee_code?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchQuery);

      // Role filter
      const matchesRole =
        filterRole === 'all' ||
        user.user_roles?.some(ur => ur.role?.code === filterRole);

      // Status filter
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.is_active) ||
        (filterStatus === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const admins = users.filter(u =>
      u.user_roles?.some(ur => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(ur.role?.code || ''))
    ).length;
    const recentlyActive = users.filter(u => {
      if (!u.last_login_at) return false;
      const lastLogin = new Date(u.last_login_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastLogin > dayAgo;
    }).length;

    return { total, active, admins, recentlyActive };
  }, [users]);

  // Get role name based on current language
  const getRoleName = (role: Role | undefined) => {
    if (!role) return '-';
    const lang = i18n.language;
    if (lang === 'fr') return role.name_fr;
    if (lang === 'id') return role.name_id;
    return role.name_en;
  };

  // Get primary role for user
  const getPrimaryRole = (user: UserWithRoles) => {
    const primaryRole = user.user_roles?.find(ur => ur.is_primary);
    return primaryRole?.role;
  };

  // Format last active
  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return t('auth.users.neverLoggedIn') || 'Jamais connecté';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return t('common.online') || 'En ligne';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString();
  };

  // Get initials
  const getInitials = (user: UserWithRoles) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  // Get role badge variant
  const getRoleBadgeVariant = (roleCode: string | undefined) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return 'danger';
      case 'ADMIN':
        return 'danger';
      case 'MANAGER':
        return 'warning';
      case 'CASHIER':
        return 'info';
      case 'BAKER':
      case 'INVENTORY':
        return 'success';
      default:
        return 'neutral';
    }
  };

  // Handle toggle active
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (!currentUser?.id) return;

    try {
      const result = await authService.toggleUserActive(userId, !currentStatus, currentUser.id);

      if (result.success) {
        toast.success(
          currentStatus
            ? (t('auth.users.deactivated') || 'Utilisateur désactivé')
            : (t('auth.users.activated') || 'Utilisateur activé')
        );
        loadData();
      } else {
        toast.error(result.error || 'Erreur');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error(t('common.error') || 'Erreur');
    }
  };

  // Handle delete
  const handleDelete = async (userId: string) => {
    if (!currentUser?.id) return;

    try {
      const result = await authService.deleteUser(userId, currentUser.id);

      if (result.success) {
        toast.success(t('auth.users.deleted') || 'Utilisateur supprimé');
        setShowDeleteConfirm(null);
        loadData();
      } else {
        toast.error(result.error || 'Erreur');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('common.error') || 'Erreur');
    }
  };

  // Open edit modal
  const handleEdit = (user: UserWithRoles) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  // Open create modal
  const handleCreate = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t('auth.users.title') || 'Gestion des Utilisateurs'}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('auth.users.subtitle') || 'Gérez les utilisateurs et leurs accès'}
          </p>
        </div>
        <PermissionGuard permission="users.create">
          <Button leftIcon={<UserPlus size={18} />} onClick={handleCreate}>
            {t('auth.users.createUser') || 'Nouvel Utilisateur'}
          </Button>
        </PermissionGuard>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t('auth.users.totalMembers') || 'Total Membres'}
          value={stats.total}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          label={t('auth.users.active') || 'Actifs'}
          value={stats.active}
          icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          label={t('auth.users.adminsManagers') || 'Admins/Managers'}
          value={stats.admins}
          icon={<Shield className="w-5 h-5 text-orange-600" />}
        />
        <StatCard
          label={t('auth.users.recentlyActive') || 'Actifs 24h'}
          value={stats.recentlyActive}
          icon={<RefreshCw className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search') || 'Rechercher...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            title={t('common.filterByRole') || 'Filtrer par rôle'}
            aria-label={t('common.filterByRole') || 'Filtrer par rôle'}
          >
            <option value="all">{t('common.allRoles') || 'Tous les rôles'}</option>
            {roles.map(role => (
              <option key={role.id} value={role.code}>
                {getRoleName(role)}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          title={t('common.filterByStatus') || 'Filtrer par statut'}
          aria-label={t('common.filterByStatus') || 'Filtrer par statut'}
        >
          <option value="all">{t('common.allStatus') || 'Tous les statuts'}</option>
          <option value="active">{t('auth.users.active') || 'Actif'}</option>
          <option value="inactive">{t('auth.users.inactive') || 'Inactif'}</option>
        </select>

        {/* Show inactive toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          {t('auth.users.showInactive') || 'Afficher inactifs'}
        </label>

        {/* Refresh */}
        <Button variant="ghost" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('table.user') || 'Utilisateur'}
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('auth.users.employeeCode') || 'Code'}
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('auth.users.primaryRole') || 'Rôle'}
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('auth.users.status') || 'Statut'}
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('auth.users.lastLogin') || 'Dernière connexion'}
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('common.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    {t('common.loading') || 'Chargement...'}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    {t('common.noResults') || 'Aucun résultat'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const primaryRole = getPrimaryRole(user);
                  const isSelf = user.id === currentUser?.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50/50 transition-colors ${!user.is_active ? 'opacity-60' : ''}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(user)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {user.display_name || user.name}
                              {isSelf && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  {t('common.you') || 'Vous'}
                                </span>
                              )}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-600">
                          {user.employee_code || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getRoleBadgeVariant(primaryRole?.code)}>
                          {getRoleName(primaryRole)}
                        </Badge>
                        {user.user_roles && user.user_roles.length > 1 && (
                          <span className="ml-2 text-xs text-gray-400">
                            +{user.user_roles.length - 1}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                          />
                          <span className="text-sm text-gray-700">
                            {user.is_active
                              ? (t('auth.users.active') || 'Actif')
                              : (t('auth.users.inactive') || 'Inactif')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatLastActive(user.last_login_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGuard permission="users.update">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(user)}
                              title={t('common.edit') || 'Modifier'}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </PermissionGuard>

                          <PermissionGuard permission="users.update">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggleActive(user.id, user.is_active)}
                              disabled={isSelf}
                              title={user.is_active ? 'Désactiver' : 'Activer'}
                            >
                              {user.is_active ? (
                                <XCircle size={16} className="text-orange-500" />
                              ) : (
                                <Power size={16} className="text-green-500" />
                              )}
                            </Button>
                          </PermissionGuard>

                          <PermissionGuard permission="users.delete">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setShowDeleteConfirm(user.id)}
                              disabled={isSelf || primaryRole?.code === 'SUPER_ADMIN'}
                              title={t('common.delete') || 'Supprimer'}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('auth.users.deleteUser') || 'Supprimer l\'utilisateur'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('auth.users.deleteConfirm') || 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?'}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>
                {t('common.cancel') || 'Annuler'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                {t('common.delete') || 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal - TODO: Implement UserFormModal component */}
      {showUserModal && (
        <UserFormModal
          user={editingUser}
          roles={roles}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            setShowUserModal(false);
            setEditingUser(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Stats Card Component
function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  );
}

// User Form Modal Component
function UserFormModal({
  user,
  roles,
  onClose,
  onSave,
}: {
  user: UserWithRoles | null;
  roles: Role[];
  onClose: () => void;
  onSave: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || '',
    employee_code: user?.employee_code || '',
    phone: user?.phone || '',
    preferred_language: 'id' as 'fr' | 'en' | 'id',
    pin: '',
    role_ids: user?.user_roles?.map(ur => ur.role?.id).filter(Boolean) as string[] || [],
    primary_role_id: user?.user_roles?.find(ur => ur.is_primary)?.role?.id || '',
  });

  const getRoleName = (role: Role) => {
    const lang = i18n.language;
    if (lang === 'fr') return role.name_fr;
    if (lang === 'id') return role.name_id;
    return role.name_en;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setIsLoading(true);

    try {
      if (user) {
        // Update existing user
        const result = await authService.updateUser(
          user.id,
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            display_name: formData.display_name || undefined,
            employee_code: formData.employee_code || undefined,
            phone: formData.phone || undefined,
            role_ids: formData.role_ids,
            primary_role_id: formData.primary_role_id,
          },
          currentUser.id
        );

        if (result.success) {
          toast.success(t('common.saved') || 'Enregistré');
          onSave();
        } else {
          toast.error(result.error || 'Erreur');
        }
      } else {
        // Create new user
        if (!formData.first_name || !formData.last_name || !formData.primary_role_id) {
          toast.error(t('common.requiredFields') || 'Champs requis manquants');
          setIsLoading(false);
          return;
        }

        const result = await authService.createUser(
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            display_name: formData.display_name || undefined,
            employee_code: formData.employee_code || undefined,
            phone: formData.phone || undefined,
            preferred_language: formData.preferred_language,
            pin: formData.pin || undefined,
            role_ids: formData.role_ids.length > 0 ? formData.role_ids : [formData.primary_role_id],
            primary_role_id: formData.primary_role_id,
          },
          currentUser.id
        );

        if (result.success) {
          toast.success(t('auth.users.created') || 'Utilisateur créé');
          onSave();
        } else {
          toast.error(result.error || 'Erreur');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('common.error') || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => {
      const newRoleIds = prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId];

      // If removing primary role, reset it
      if (!newRoleIds.includes(prev.primary_role_id)) {
        return { ...prev, role_ids: newRoleIds, primary_role_id: newRoleIds[0] || '' };
      }

      return { ...prev, role_ids: newRoleIds };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {user
              ? (t('auth.users.editUser') || 'Modifier l\'utilisateur')
              : (t('auth.users.createUser') || 'Nouvel utilisateur')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.profile.firstName') || 'Prénom'} *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('auth.profile.firstName') || 'Prénom'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.profile.lastName') || 'Nom'} *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('auth.profile.lastName') || 'Nom'}
                required
              />
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.profile.displayName') || 'Nom d\'affichage'}
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder={`${formData.first_name} ${formData.last_name}`.trim() || 'Auto'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Employee code & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.users.employeeCode') || 'Code Employé'}
              </label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
                placeholder="EMP-001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.profile.phone') || 'Téléphone'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* PIN (only for new users) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.login.pin') || 'Code PIN'} (4-6 chiffres)
              </label>
              <input
                type="password"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="****"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
              />
            </div>
          )}

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.users.primaryRole') || 'Rôle(s)'} *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {roles.map(role => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.role_ids.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1">{getRoleName(role)}</span>
                  {formData.role_ids.includes(role.id) && (
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="radio"
                        name="primary_role"
                        checked={formData.primary_role_id === role.id}
                        onChange={() => setFormData({ ...formData, primary_role_id: role.id })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Principal
                    </label>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              {t('common.cancel') || 'Annuler'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? (t('common.saving') || 'Enregistrement...')
                : (t('common.save') || 'Enregistrer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UsersPage;
