import { useState, useEffect, useMemo } from 'react';
import {
  UserPlus, Users, CheckCircle2, Shield, Search, RefreshCw, Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import { authService } from '../../services/authService';
import { toast } from 'sonner';
import { useUsersWithRoles, type IUserWithRoles } from '@/hooks/useUsers';
import type { Role } from '../../types/auth';
import { getRoleName } from './usersPageHelpers';
import { StatCard } from './StatCard';
import { UserTableRow } from './UserTableRow';
import { UserFormModal } from './UserFormModal';

const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const { isAdmin } = usePermissions();
  void isAdmin; // Suppress unused variable warning

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUserWithRoles | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // React Query hooks
  const { data: users = [], isLoading, refetch: refetchUsers } = useUsersWithRoles({ showInactive });

  // Load roles via authService (still needed for the form modal and filter dropdown)
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => {
    authService.getRoles().then(r => setRoles(r)).catch(() => {});
  }, []);

  const loadData = () => {
    refetchUsers();
    authService.getRoles().then(r => setRoles(r)).catch(() => {});
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.display_name?.toLowerCase().includes(searchLower) ||
        user.employee_code?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchQuery);
      const matchesRole = filterRole === 'all' ||
        user.user_roles?.some(ur => ur.role?.code === filterRole);
      const matchesStatus = filterStatus === 'all' ||
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
      return lastLogin > new Date(Date.now() - 24 * 60 * 60 * 1000);
    }).length;
    return { total, active, admins, recentlyActive };
  }, [users]);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const result = await authService.toggleUserActiveDirect(userId, !currentStatus);
      if (result.success) {
        toast.success(currentStatus ? 'User deactivated' : 'User activated');
        loadData();
      } else {
        toast.error(result.error || 'Error');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Error');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const result = await authService.deleteUserDirect(userId);
      if (result.success) {
        toast.success('User deleted');
        setShowDeleteConfirm(null);
        loadData();
      } else {
        toast.error(result.error || 'Error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error');
    }
  };

  const handleEdit = (user: IUserWithRoles) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const closeModal = () => { setShowUserModal(false); setEditingUser(null); };
  const handleSave = () => { closeModal(); loadData(); };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 m-0">User Management</h1>
          <p className="text-gray-500 mt-1">Manage users and their access</p>
        </div>
        <PermissionGuard permission="users.create">
          <Button onClick={handleCreate}>
            <UserPlus size={18} />
            New User
          </Button>
        </PermissionGuard>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Members" value={stats.total} icon={<Users size={24} />} variant="blue" />
        <StatCard label="Active" value={stats.active} icon={<CheckCircle2 size={24} />} variant="green" />
        <StatCard label="Admins/Managers" value={stats.admins} icon={<Shield size={24} />} variant="orange" />
        <StatCard label="Active 24h" value={stats.recentlyActive} icon={<Clock size={24} />} variant="purple" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 border border-gray-200 rounded-lg text-sm bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="py-2.5 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
          title="Filter by role"
          aria-label="Filter by role"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="all">All roles</option>
          {roles.map(role => (
            <option key={role.id} value={role.code}>{getRoleName(role)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="py-2.5 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
          title="Filter by status"
          aria-label="Filter by status"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          Show inactive
        </label>
        <button
          type="button"
          className="p-2.5 border border-gray-200 rounded-lg bg-white cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={loadData}
          disabled={isLoading}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Last login</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-16 px-8 text-center text-gray-500">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300 animate-spin" />
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 px-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  No results
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentUser?.id}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onDeleteConfirm={setShowDeleteConfirm}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete user</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete
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
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default UsersPage;
