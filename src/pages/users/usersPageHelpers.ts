import type { IUserWithRoles } from '@/hooks/useUsers';
import type { Role } from '../../types/auth';

/** Get English role name */
export const getRoleName = (role: Role | undefined): string => {
  if (!role) return '-';
  return role.name_en;
};

/** Get primary role for a user */
export const getPrimaryRole = (user: IUserWithRoles): Role | undefined => {
  const primaryRole = user.user_roles?.find(ur => ur.is_primary);
  return primaryRole?.role;
};

/** Format a date string as a relative time label */
export const formatLastActive = (dateString: string | null): string => {
  if (!dateString) return 'Never logged in';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return 'Online';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

/** Get user initials from name */
export const getInitials = (user: IUserWithRoles): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  return user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
};

/** Map role code to badge variant */
export const getRoleBadgeVariant = (
  roleCode: string | undefined
): 'danger' | 'warning' | 'info' | 'success' | 'neutral' => {
  switch (roleCode) {
    case 'SUPER_ADMIN':
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
