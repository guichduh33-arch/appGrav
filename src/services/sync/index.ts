/**
 * Sync Services Index
 *
 * Re-exports sync-related utilities and types.
 *
 * @migration Uses db.ts (unified schema) instead of legacy offlineDb.ts
 */

// Unified offline database
export { db } from '@/lib/db';

// Type exports from official types
export type {
  IOfflineProduct,
  IOfflineCategory,
  IOfflineModifier,
  IOfflineCustomer,
  ILegacySyncQueueItem,
  TLegacySyncQueueType,
  TLegacySyncQueueStatus,
  IOfflinePeriod,
  ILegacyOfflineOrder,
  ILegacyOfflineOrderItem,
} from '@/types/offline';

// Legacy type aliases for backward compatibility
export type {
  ISyncQueueItem,
  TSyncQueueType,
  TSyncQueueStatus,
} from './syncQueue';

// Sync queue utilities
export {
  addToSyncQueue,
  getSyncQueueItems,
  updateSyncQueueItem,
  removeSyncQueueItem,
  getPendingSyncCount,
  clearSyncQueue,
} from './syncQueue';

// Order sync utilities
export {
  saveOrderOffline,
  getOfflineOrders,
  getAllOfflineOrders,
  getOfflineOrderById,
  markOrderSynced,
  getPendingOrdersCount,
  hasPendingOfflineOrders,
  type IOfflineOrder,
  type IOfflineOrderItem,
} from './orderSync';

// Offline period tracking
export {
  startOfflinePeriod,
  endOfflinePeriod,
  getCurrentOfflinePeriod,
  updatePeriodSyncStats,
  getOfflinePeriods,
  getOfflinePeriodsInRange,
  getOfflinePeriodById,
  cleanupOldPeriods,
  getOfflinePeriodStats,
} from './offlinePeriod';

// Product sync utilities
export {
  syncProductsToOffline,
  getProductsFromOffline,
  syncCategoriesToOffline,
  getCategoriesFromOffline,
  syncModifiersToOffline,
  getModifiersFromOffline,
  syncAllProductData,
  hasOfflineProductData,
  clearOfflineProductData,
} from './productSync';

/**
 * @deprecated Use db from @/lib/db instead
 * This export is kept for backward compatibility only.
 */
export { db as offlineDb } from '@/lib/db';
