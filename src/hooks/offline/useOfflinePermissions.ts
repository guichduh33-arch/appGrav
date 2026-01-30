/**
 * useOfflinePermissions Hook
 *
 * Provides permission checking functionality for offline mode.
 * Mirrors the API of usePermissions for consistency.
 *
 * Story 1.3: Offline Permissions Cache
 *
 * @see src/hooks/usePermissions.ts for online version
 * @see ADR-005: Permissions Offline
 */

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { isSensitivePermissionCode } from '@/constants/sensitivePermissions';
import type { PermissionCode, PermissionModule, RoleCode, EffectivePermission, Role } from '@/types/auth';
import type { UserProfile } from '@/types/database';

/**
 * Return type for useOfflinePermissions hook
 */
export interface IUseOfflinePermissionsReturn {
  // Permission checks
  hasPermission: (code: PermissionCode) => boolean;
  hasAnyPermission: (codes: PermissionCode[]) => boolean;
  hasAllPermissions: (codes: PermissionCode[]) => boolean;
  isSensitivePermission: (code: PermissionCode) => boolean;
  requiresManagerConfirmation: (code: PermissionCode) => boolean;
  canAccessModule: (module: PermissionModule) => boolean;

  // Role checks
  hasRole: (roleCode: RoleCode) => boolean;
  hasAnyRole: (roleCodes: RoleCode[]) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isManagerOrAbove: boolean;

  // Session state
  isOfflineSession: boolean;

  // Raw data access
  permissions: EffectivePermission[];
  roles: Role[];
  user: UserProfile | null;
}

/**
 * Hook for checking permissions in offline mode
 *
 * Uses cached permissions from authStore when in offline session.
 * When offline, authStore contains permissions loaded from IndexedDB cache
 * via setOfflineSession().
 *
 * @returns Permission checking utilities and session state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasPermission, isOfflineSession, requiresManagerConfirmation } = useOfflinePermissions();
 *
 *   const handleVoid = () => {
 *     if (!hasPermission('sales.void')) {
 *       toast.error('Permission denied');
 *       return;
 *     }
 *
 *     if (requiresManagerConfirmation('sales.void')) {
 *       // Show manager PIN dialog
 *       return;
 *     }
 *
 *     // Proceed with void
 *   };
 * }
 * ```
 */
export function useOfflinePermissions(): IUseOfflinePermissionsReturn {
  const { permissions, roles, user, isOfflineSession } = useAuthStore();

  /**
   * Check if user has a specific permission (from cache)
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
   * Check if a permission is sensitive (requires manager PIN offline)
   */
  const isSensitivePermission = useCallback(
    (code: PermissionCode): boolean => {
      return isSensitivePermissionCode(code);
    },
    []
  );

  /**
   * Check if permission requires manager confirmation offline
   *
   * Returns true if:
   * 1. User is in offline session AND
   * 2. Permission is marked as sensitive
   *
   * This is the key function for determining when to show
   * the manager PIN confirmation dialog.
   */
  const requiresManagerConfirmation = useCallback(
    (code: PermissionCode): boolean => {
      return isOfflineSession && isSensitivePermissionCode(code);
    },
    [isOfflineSession]
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
   * Check if user can access a specific module
   * (has at least one granted permission in that module)
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
   * Check if user is manager or above
   *
   * Used to determine if user can approve sensitive actions offline.
   */
  const isManagerOrAbove = useMemo(() => {
    return roles.some(r => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code));
  }, [roles]);

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSensitivePermission,
    requiresManagerConfirmation,
    canAccessModule,

    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isManagerOrAbove,

    // Session state
    isOfflineSession,

    // Raw data access
    permissions,
    roles,
    user,
  };
}

export default useOfflinePermissions;
