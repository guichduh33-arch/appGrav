// usePermissions Hook
// Provides permission checking utilities for the current user

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { PermissionCode, PermissionModule, RoleCode } from '@/types/auth';

export function usePermissions() {
  const { permissions, roles, user } = useAuthStore();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (code: PermissionCode): boolean => {
      const perm = permissions.find(p => p.permission_code === code);
      return perm?.is_granted ?? false;
    },
    [permissions]
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (codes: PermissionCode[]): boolean => {
      return codes.some(code => hasPermission(code));
    },
    [hasPermission]
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (codes: PermissionCode[]): boolean => {
      return codes.every(code => hasPermission(code));
    },
    [hasPermission]
  );

  /**
   * Check if user can access a specific module (has at least one permission in that module)
   */
  const canAccessModule = useCallback(
    (module: PermissionModule): boolean => {
      return permissions.some(
        p => p.permission_module === module && p.is_granted
      );
    },
    [permissions]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleCode: RoleCode): boolean => {
      return roles.some(r => r.code === roleCode);
    },
    [roles]
  );

  /**
   * Check if user has ANY of the specified roles
   */
  const hasAnyRole = useCallback(
    (roleCodes: RoleCode[]): boolean => {
      return roleCodes.some(code => hasRole(code));
    },
    [hasRole]
  );

  /**
   * Check if user is an admin (SUPER_ADMIN or ADMIN)
   */
  const isAdmin = useMemo(() => {
    return roles.some(r => ['SUPER_ADMIN', 'ADMIN'].includes(r.code));
  }, [roles]);

  /**
   * Check if user is a super admin
   */
  const isSuperAdmin = useMemo(() => {
    return roles.some(r => r.code === 'SUPER_ADMIN');
  }, [roles]);

  /**
   * Check if user is a manager or higher
   */
  const isManagerOrAbove = useMemo(() => {
    return roles.some(r => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code));
  }, [roles]);

  /**
   * Get the user's primary role
   */
  const primaryRole = useMemo(() => {
    // Find the role with highest hierarchy level
    if (roles.length === 0) return null;
    return roles.reduce((highest, current) =>
      (current.hierarchy_level || 0) > (highest.hierarchy_level || 0) ? current : highest
    );
  }, [roles]);

  /**
   * Get all permissions for a specific module
   */
  const getModulePermissions = useCallback(
    (module: PermissionModule) => {
      return permissions.filter(p => p.permission_module === module);
    },
    [permissions]
  );

  /**
   * Get all granted permissions for a specific module
   */
  const getGrantedModulePermissions = useCallback(
    (module: PermissionModule) => {
      return permissions.filter(p => p.permission_module === module && p.is_granted);
    },
    [permissions]
  );

  /**
   * Check if a permission is sensitive (requires extra confirmation)
   */
  const isSensitivePermission = useCallback(
    (code: PermissionCode): boolean => {
      const perm = permissions.find(p => p.permission_code === code);
      return perm?.is_sensitive ?? false;
    },
    [permissions]
  );

  /**
   * Get all modules the user can access
   */
  const accessibleModules = useMemo(() => {
    const modules = new Set<PermissionModule>();
    for (const perm of permissions) {
      if (perm.is_granted) {
        modules.add(perm.permission_module as PermissionModule);
      }
    }
    return Array.from(modules);
  }, [permissions]);

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isSensitivePermission,

    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isManagerOrAbove,
    primaryRole,

    // Data access
    permissions,
    roles,
    user,
    accessibleModules,
    getModulePermissions,
    getGrantedModulePermissions,
  };
}

export default usePermissions;
