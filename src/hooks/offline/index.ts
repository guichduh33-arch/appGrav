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

export { useSettingsOffline } from './useSettingsOffline';

export { useProductsOffline, useOfflineProductsRaw } from './useProductsOffline';
export type { IUseProductsOfflineReturn } from './useProductsOffline';

export {
  useCategoriesOffline,
  useOfflineCategoriesRaw,
  useCategoryOffline,
} from './useCategoriesOffline';
export type { IUseCategoriesOfflineResult } from './useCategoriesOffline';

export {
  useModifiersOffline,
  useOfflineModifiersRaw,
  useProductModifiersOffline,
  useCategoryModifiersOffline,
} from './useModifiersOffline';

export {
  useRecipesOffline,
  useOfflineRecipesRaw,
} from './useRecipesOffline';
export type { IUseRecipesOfflineReturn } from './useRecipesOffline';
