/**
 * usePermissionsUnified Hook
 *
 * Unified hook that works seamlessly in both online and offline modes.
 * Extends usePermissions with offline-specific utilities.
 *
 * Story 1.3: Offline Permissions Cache
 *
 * Key insight: When setOfflineSession() is called from Story 1.2,
 * authStore is populated with cached permissions. Therefore,
 * usePermissions already works correctly in both modes!
 *
 * This hook adds:
 * - isOfflineSession flag for UI indicators
 * - requiresManagerConfirmation() for sensitive action handling
 *
 * @see src/hooks/usePermissions.ts - Base permission hook
 * @see src/hooks/offline/useOfflinePermissions.ts - Offline-specific utilities
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from './usePermissions';
import { isSensitivePermissionCode } from '@/constants/sensitivePermissions';
import type { PermissionCode } from '@/types/auth';

/**
 * Return type for usePermissionsUnified hook
 *
 * Extends the base usePermissions return type with offline-specific utilities.
 */
export interface IUsePermissionsUnifiedReturn extends ReturnType<typeof usePermissions> {
  /** Whether user is in offline session mode */
  isOfflineSession: boolean;

  /**
   * Check if a permission requires manager confirmation
   * Returns true only when offline AND permission is sensitive
   */
  requiresManagerConfirmation: (code: PermissionCode) => boolean;
}

/**
 * Unified hook that automatically uses the correct permission source
 * based on session mode (online/offline).
 *
 * This hook provides the same API as usePermissions but automatically
 * handles offline mode detection and adds offline-specific utilities.
 *
 * **When to use this hook:**
 * - Components that need to work in both online and offline modes
 * - Components that handle sensitive actions (void, refund, discount)
 * - When you need to show offline indicators
 *
 * **When to use usePermissions instead:**
 * - Components that only work online
 * - Simple permission checks without offline considerations
 *
 * @returns All usePermissions utilities plus offline-specific features
 *
 * @example
 * ```tsx
 * function VoidButton({ orderId }: { orderId: string }) {
 *   const {
 *     hasPermission,
 *     isOfflineSession,
 *     requiresManagerConfirmation
 *   } = usePermissionsUnified();
 *
 *   const handleVoid = async () => {
 *     // Check base permission
 *     if (!hasPermission('sales.void')) {
 *       toast.error(t('permissions.denied'));
 *       return;
 *     }
 *
 *     // Check if manager confirmation is needed (offline + sensitive)
 *     if (requiresManagerConfirmation('sales.void')) {
 *       const approved = await showManagerPinDialog();
 *       if (!approved) return;
 *     }
 *
 *     // Proceed with void
 *     await voidOrder(orderId);
 *   };
 *
 *   return (
 *     <Button onClick={handleVoid} disabled={!hasPermission('sales.void')}>
 *       {isOfflineSession && <OfflineIcon />}
 *       Void Order
 *     </Button>
 *   );
 * }
 * ```
 */
export function usePermissionsUnified(): IUsePermissionsUnifiedReturn {
  const { isOfflineSession } = useAuthStore();

  // Get all base permission utilities
  // Since authStore contains permissions from cache when offline,
  // usePermissions already works correctly in both modes!
  const basePermissions = usePermissions();

  /**
   * Check if permission requires manager confirmation offline
   *
   * Returns true if:
   * 1. User is in offline session AND
   * 2. Permission is marked as sensitive
   *
   * Use this to determine when to show the manager PIN confirmation dialog.
   */
  const requiresManagerConfirmation = useCallback(
    (code: PermissionCode): boolean => {
      return isOfflineSession && isSensitivePermissionCode(code);
    },
    [isOfflineSession]
  );

  return {
    ...basePermissions,
    // Add offline-specific utilities
    isOfflineSession,
    requiresManagerConfirmation,
  };
}

export default usePermissionsUnified;
