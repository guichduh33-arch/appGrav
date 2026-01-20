// PermissionGuard Component
// Conditionally renders children based on user permissions

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionCode, RoleCode } from '@/types/auth';

interface PermissionGuardProps {
  /** Single permission to check */
  permission?: PermissionCode;
  /** Multiple permissions to check */
  permissions?: PermissionCode[];
  /** If true, ALL permissions are required. If false (default), ANY permission grants access */
  requireAll?: boolean;
  /** Required role(s) - alternative to permission-based check */
  role?: RoleCode;
  roles?: RoleCode[];
  /** What to render if access is denied. If null, nothing is rendered */
  fallback?: ReactNode;
  /** If true, shows a styled "Access Denied" message instead of fallback */
  showAccessDenied?: boolean;
  /** Children to render if access is granted */
  children: ReactNode;
}

/**
 * PermissionGuard - Protects content based on user permissions or roles
 *
 * @example
 * // Single permission
 * <PermissionGuard permission="sales.void">
 *   <VoidButton />
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (any)
 * <PermissionGuard permissions={['sales.void', 'sales.refund']}>
 *   <SensitiveActions />
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (all required)
 * <PermissionGuard permissions={['inventory.view', 'inventory.update']} requireAll>
 *   <InventoryEditor />
 * </PermissionGuard>
 *
 * @example
 * // Role-based
 * <PermissionGuard role="MANAGER">
 *   <ManagerDashboard />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  role,
  roles = [],
  fallback = null,
  showAccessDenied = false,
  children,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, permissions: userPermissions, user } = usePermissions();

  // Build list of all permissions to check
  const allPerms = permission ? [permission, ...permissions] : permissions;
  const allRoles = role ? [role, ...roles] : roles;

  let hasAccess = false;

  // Check permissions if specified
  if (allPerms.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(allPerms) : hasAnyPermission(allPerms);
  }

  // Check roles if specified (and no permission access yet)
  if (!hasAccess && allRoles.length > 0) {
    hasAccess = hasAnyRole(allRoles);
  }

  // If no permissions or roles specified, grant access
  if (allPerms.length === 0 && allRoles.length === 0) {
    hasAccess = true;
  }

  // Fallback: If no permissions loaded but user has legacy admin/manager role, grant access for users.* permissions
  if (!hasAccess && userPermissions.length === 0 && user?.role) {
    const legacyRole = (user.role as string).toLowerCase();
    if (['admin', 'manager', 'super_admin'].includes(legacyRole)) {
      // Admin/manager gets access to user management permissions
      const userManagementPerms = ['users.create', 'users.update', 'users.delete', 'users.view', 'users.roles', 'users.permissions'];
      if (allPerms.some(p => userManagementPerms.includes(p))) {
        hasAccess = true;
      }
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showAccessDenied) {
    return <AccessDeniedMessage />;
  }

  return <>{fallback}</>;
}

/**
 * RouteGuard - For protecting entire routes/pages
 * Shows full-page access denied message
 */
export function RouteGuard({
  permission,
  permissions,
  requireAll,
  role,
  roles,
  children,
}: Omit<PermissionGuardProps, 'fallback' | 'showAccessDenied'>) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      role={role}
      roles={roles}
      fallback={<AccessDeniedPage />}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Small inline "Access Denied" message
 */
function AccessDeniedMessage() {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg">
      <Lock className="w-4 h-4" />
      <span>{t('auth.errors.noPermission')}</span>
    </div>
  );
}

/**
 * Full-page "Access Denied" component
 */
function AccessDeniedPage() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.errors.accessDenied')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('auth.errors.noPermission')}
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
        >
          {t('common.back') || 'Go Back'}
        </button>
      </div>
    </div>
  );
}

/**
 * AdminOnly - Shortcut for content only visible to admins
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * ManagerOnly - Shortcut for content only visible to managers and above
 */
export function ManagerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isManagerOrAbove } = usePermissions();

  if (!isManagerOrAbove) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default PermissionGuard;
