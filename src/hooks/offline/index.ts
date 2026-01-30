/**
 * Offline Hooks Index
 *
 * Re-exports all offline-related hooks for convenient imports.
 */

export { useOfflineAuth } from './useOfflineAuth';
export type { IOfflineAuthError, IUseOfflineAuthReturn } from './useOfflineAuth';

export { useNetworkStatus } from './useNetworkStatus';
export type { IUseNetworkStatusReturn } from './useNetworkStatus';

export { useOfflinePermissions } from './useOfflinePermissions';
export type { IUseOfflinePermissionsReturn } from './useOfflinePermissions';
