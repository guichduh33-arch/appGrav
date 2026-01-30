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
  Power,
  XCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import type { Role } from '../../types/auth';
import './UsersPage.css';

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
  const { isAdmin } = usePermissions();
  void isAdmin; // Suppress unused variable warning

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

  // Handle toggle active - use direct method
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await authService.toggleUserActiveDirect(userId, !currentStatus);

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

  // Handle delete - use direct method
  const handleDelete = async (userId: string) => {
    try {
      const result = await authService.deleteUserDirect(userId);

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
    <div className="users-page">
      {/* Header */}
      <header className="users-page__header">
        <div>
          <h1 className="users-page__title">
            {t('auth.users.title') || 'Gestion des Utilisateurs'}
          </h1>
          <p className="users-page__subtitle">
            {t('auth.users.subtitle') || 'Gérez les utilisateurs et leurs accès'}
          </p>
        </div>
        <PermissionGuard permission="users.create">
          <Button onClick={handleCreate}>
            <UserPlus size={18} />
            {t('auth.users.createUser') || 'Nouvel Utilisateur'}
          </Button>
        </PermissionGuard>
      </header>

      {/* Stats Cards */}
      <div className="users-stats-grid">
        <StatCard
          label={t('auth.users.totalMembers') || 'Total Membres'}
          value={stats.total}
          icon={<Users size={24} />}
          variant="blue"
        />
        <StatCard
          label={t('auth.users.active') || 'Actifs'}
          value={stats.active}
          icon={<CheckCircle2 size={24} />}
          variant="green"
        />
        <StatCard
          label={t('auth.users.adminsManagers') || 'Admins/Managers'}
          value={stats.admins}
          icon={<Shield size={24} />}
          variant="orange"
        />
        <StatCard
          label={t('auth.users.recentlyActive') || 'Actifs 24h'}
          value={stats.recentlyActive}
          icon={<Clock size={24} />}
          variant="purple"
        />
      </div>

      {/* Filters */}
      <div className="users-filters">
        {/* Search */}
        <div className="users-filters__search">
          <Search className="users-filters__search-icon" size={16} />
          <input
            type="text"
            placeholder={t('common.search') || 'Rechercher...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="users-filters__search-input"
          />
        </div>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="users-filters__select"
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

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="users-filters__select"
          title={t('common.filterByStatus') || 'Filtrer par statut'}
          aria-label={t('common.filterByStatus') || 'Filtrer par statut'}
        >
          <option value="all">{t('common.allStatus') || 'Tous les statuts'}</option>
          <option value="active">{t('auth.users.active') || 'Actif'}</option>
          <option value="inactive">{t('auth.users.inactive') || 'Inactif'}</option>
        </select>

        {/* Show inactive toggle */}
        <label className="users-filters__checkbox">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          {t('auth.users.showInactive') || 'Afficher inactifs'}
        </label>

        {/* Refresh */}
        <button
          type="button"
          className="users-filters__refresh"
          onClick={loadData}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('table.user') || 'Utilisateur'}</th>
              <th>{t('auth.users.employeeCode') || 'Code'}</th>
              <th>{t('auth.users.primaryRole') || 'Rôle'}</th>
              <th>{t('auth.users.status') || 'Statut'}</th>
              <th>{t('auth.users.lastLogin') || 'Dernière connexion'}</th>
              <th>{t('common.actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="users-empty">
                  <RefreshCw className="users-empty__icon animate-spin" />
                  {t('common.loading') || 'Chargement...'}
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="users-empty">
                  <Users className="users-empty__icon" />
                  {t('common.noResults') || 'Aucun résultat'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const primaryRole = getPrimaryRole(user);
                const isSelf = user.id === currentUser?.id;

                return (
                  <tr key={user.id} className={!user.is_active ? 'row-inactive' : ''}>
                    <td>
                      <div className="user-cell">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="user-cell__avatar"
                          />
                        ) : (
                          <div className="user-cell__avatar-placeholder">
                            {getInitials(user)}
                          </div>
                        )}
                        <div className="user-cell__info">
                          <div className="user-cell__name">
                            {user.display_name || user.name}
                            {isSelf && (
                              <span className="user-cell__badge">
                                {t('common.you') || 'Vous'}
                              </span>
                            )}
                          </div>
                          {user.phone && (
                            <div className="user-cell__phone">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="employee-code">
                        {user.employee_code || '-'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={getRoleBadgeVariant(primaryRole?.code)}>
                        {getRoleName(primaryRole)}
                      </Badge>
                      {user.user_roles && user.user_roles.length > 1 && (
                        <span className="extra-roles">
                          +{user.user_roles.length - 1}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-cell__dot ${user.is_active ? 'status-cell__dot--active' : 'status-cell__dot--inactive'}`} />
                        <span className="status-cell__text">
                          {user.is_active
                            ? (t('auth.users.active') || 'Actif')
                            : (t('auth.users.inactive') || 'Inactif')}
                        </span>
                      </div>
                    </td>
                    <td className="last-login">
                      {formatLastActive(user.last_login_at)}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <PermissionGuard permission="users.update">
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => handleEdit(user)}
                            title={t('common.edit') || 'Modifier'}
                          >
                            <Edit2 size={16} />
                          </button>
                        </PermissionGuard>

                        <PermissionGuard permission="users.update">
                          <button
                            type="button"
                            className={`action-btn ${user.is_active ? 'action-btn--deactivate' : 'action-btn--activate'}`}
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            disabled={isSelf}
                            title={user.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {user.is_active ? (
                              <XCircle size={16} />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>
                        </PermissionGuard>

                        <PermissionGuard permission="users.delete">
                          <button
                            type="button"
                            className="action-btn action-btn--danger"
                            onClick={() => setShowDeleteConfirm(user.id)}
                            disabled={isSelf || primaryRole?.code === 'SUPER_ADMIN'}
                            title={t('common.delete') || 'Supprimer'}
                          >
                            <Trash2 size={16} />
                          </button>
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
                variant="primary"
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                {t('common.delete') || 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
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
function StatCard({
  label,
  value,
  icon,
  variant = 'blue'
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'blue' | 'green' | 'orange' | 'purple';
}) {
  return (
    <div className="stat-card">
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
      <div className={`stat-card__icon stat-card__icon--${variant}`}>{icon}</div>
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

  // Safely extract role_ids with error handling
  let initialRoleIds: string[] = [];
  let initialPrimaryRoleId = '';
  if (user?.user_roles && Array.isArray(user.user_roles)) {
    initialRoleIds = user.user_roles
      .map(ur => ur.role?.id)
      .filter((id): id is string => Boolean(id));
    const primaryRole = user.user_roles.find(ur => ur.is_primary);
    initialPrimaryRoleId = primaryRole?.role?.id || '';
  }

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || '',
    employee_code: user?.employee_code || '',
    phone: user?.phone || '',
    preferred_language: 'id' as 'fr' | 'en' | 'id',
    pin: '',
    role_ids: initialRoleIds,
    primary_role_id: initialPrimaryRoleId,
  });

  // Safety check - if roles is not available, show loading state
  if (!roles || roles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Chargement des rôles...
          </h2>
          <p className="text-gray-600 mb-4">
            Les rôles ne sont pas encore disponibles. Veuillez patienter ou rafraîchir la page.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const getRoleName = (role: Role) => {
    const lang = i18n.language;
    if (lang === 'fr') return role.name_fr;
    if (lang === 'id') return role.name_id;
    return role.name_en;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);

    try {
      if (user) {
        // Update existing user
        const result = await authService.updateUserDirect(
          user.id,
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            display_name: formData.display_name || undefined,
            employee_code: formData.employee_code || undefined,
            phone: formData.phone || undefined,
            role_ids: formData.role_ids,
            primary_role_id: formData.primary_role_id,
          }
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

        const result = await authService.createUserDirect({
          first_name: formData.first_name,
          last_name: formData.last_name,
          display_name: formData.display_name || undefined,
          employee_code: formData.employee_code || undefined,
          phone: formData.phone || undefined,
          preferred_language: formData.preferred_language,
          pin: formData.pin || undefined,
          role_ids: formData.role_ids.length > 0 ? formData.role_ids : [formData.primary_role_id],
          primary_role_id: formData.primary_role_id,
        });

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
