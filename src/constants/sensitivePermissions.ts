/**
 * Sensitive Permissions Constants
 *
 * Defines permission codes that require additional verification when executed offline.
 * These actions have significant business impact and require human oversight.
 *
 * Story 1.3: Offline Permissions Cache
 *
 * @see ADR-005: Permissions Offline
 * @see _bmad-output/planning-artifacts/architecture.md
 */

import type { PermissionCode } from '@/types/auth';

/**
 * Permission codes that require additional verification (manager PIN)
 * when executed offline.
 *
 * These actions have significant business impact and require
 * human oversight even when the system is offline.
 *
 * Categories:
 * - Sales: void, refund, discount (financial impact)
 * - Inventory: adjust, delete (stock integrity)
 * - Users: roles (access control)
 * - Settings: update (system configuration)
 */
export const SENSITIVE_PERMISSION_CODES: PermissionCode[] = [
  // Sales sensitive actions - direct financial impact
  'sales.void',        // Void an order - removes revenue record
  'sales.refund',      // Process refund - money goes back to customer
  'sales.discount',    // Apply discount (especially > 20%)

  // Inventory sensitive actions - stock integrity
  'inventory.adjust',  // Adjust stock levels - can mask theft/loss
  'inventory.delete',  // Delete stock records - audit trail impact

  // Admin sensitive actions - access control
  'users.roles',       // Modify user roles - privilege escalation risk

  // Settings sensitive actions - system configuration
  'settings.update',   // Modify system settings - affects all users
];

/**
 * Check if a permission code is considered sensitive
 *
 * Sensitive permissions require manager PIN confirmation when executed offline.
 * This provides an additional layer of security for high-impact actions.
 *
 * @param code - Permission code to check
 * @returns true if the permission is sensitive, false otherwise
 *
 * @example
 * ```ts
 * import { isSensitivePermissionCode } from '@/constants/sensitivePermissions';
 *
 * if (isOfflineSession && isSensitivePermissionCode('sales.void')) {
 *   // Request manager PIN before proceeding
 *   await requestManagerPinConfirmation();
 * }
 * ```
 */
export function isSensitivePermissionCode(code: string): boolean {
  return SENSITIVE_PERMISSION_CODES.includes(code as PermissionCode);
}

/**
 * Discount threshold that requires manager approval
 *
 * Discounts above this percentage require sensitive permission check,
 * even if the user has the `sales.discount` permission.
 *
 * @default 20 (percent)
 */
export const DISCOUNT_MANAGER_THRESHOLD = 20;

/**
 * Get all sensitive permission codes for a specific module
 *
 * @param module - Module prefix (e.g., 'sales', 'inventory')
 * @returns Array of sensitive permission codes for that module
 *
 * @example
 * ```ts
 * const salesSensitive = getSensitivePermissionsForModule('sales');
 * // ['sales.void', 'sales.refund', 'sales.discount']
 * ```
 */
export function getSensitivePermissionsForModule(module: string): PermissionCode[] {
  return SENSITIVE_PERMISSION_CODES.filter(code => code.startsWith(`${module}.`));
}
