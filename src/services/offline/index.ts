/**
 * Offline Services Index
 *
 * Re-exports all offline-related services for convenient imports.
 */

export { offlineAuthService } from './offlineAuthService';
export { rateLimitService } from './rateLimitService';
export type { IRateLimitCheck } from './rateLimitService';

// Settings cache service (Story 1.5)
export {
  cacheAllSettings,
  getCachedSettings,
  getCachedSetting,
  getLastSettingsSyncAt,
  cacheTaxRates,
  getCachedTaxRates,
  getCachedActiveTaxRates,
  getCachedDefaultTaxRate,
  cachePaymentMethods,
  getCachedPaymentMethods,
  getCachedActivePaymentMethods,
  getCachedDefaultPaymentMethod,
  cacheBusinessHours,
  getCachedBusinessHours,
  cacheAllSettingsData,
  getSyncMeta,
  getAllSyncMeta,
} from './settingsCacheService';

// Products cache service (Story 2.1)
export {
  cacheAllProducts,
  getCachedProducts,
  getCachedProductById,
  searchCachedProducts,
  getLastProductsSyncAt,
  getProductsSyncMeta,
  getCachedProductsCount,
  shouldRefreshProducts,
  shouldRefreshProductsHourly,
  refreshProductsCacheIfNeeded,
  clearProductsCache,
} from './productsCacheService';

// Products cache initialization (Story 2.1)
export {
  initProductsCache,
  stopProductsCacheRefresh,
  isProductsCacheInitialized,
} from './productsCacheInit';

// Categories cache service (Story 2.2)
export {
  cacheAllCategories,
  getCachedCategories,
  getAllCachedCategories,
  getCachedCategoryById,
  getCachedCategoriesCount,
  getLastCategoriesSyncAt,
  getCategoriesSyncMeta,
  shouldRefreshCategories,
  shouldRefreshCategoriesHourly,
  refreshCategoriesCacheIfNeeded,
  clearCategoriesCache,
} from './categoriesCacheService';

// Modifiers cache service (Story 2.3)
export {
  cacheAllModifiers,
  getCachedModifiersForProduct,
  getCachedModifiersForCategory,
  getCachedModifierById,
  getCachedModifiersCount,
  resolveOfflineModifiers,
  groupOfflineModifiers,
  getLastModifiersSyncAt,
  getModifiersSyncMeta,
  shouldRefreshModifiers,
  shouldRefreshModifiersHourly,
  refreshModifiersCacheIfNeeded,
  clearModifiersCache,
} from './modifiersCacheService';

// Production reminder service (Story 2.5)
export {
  saveProductionReminder,
  getProductionReminders,
  getProductionReminderById,
  deleteProductionReminder,
  clearAllProductionReminders,
  getRemindersCount,
  hasReminders,
} from './productionReminderService';

// Orders cache service (Story 3.1)
export {
  generateLocalOrderId,
  isLocalOrderId,
  generateOfflineOrderNumber,
  saveOfflineOrder,
  getOfflineOrders,
  getOfflineOrderById,
  getOfflineOrderByNumber,
  getOfflineOrderItems,
  getOfflineOrderWithItems,
  updateOfflineOrderStatus,
  getOfflineOrdersByStatus,
  getOfflineOrdersBySyncStatus,
  updateOfflineOrderItemStatus,
  markOrderSynced,
  markOrderConflict,
  getPendingSyncOrdersCount,
  getOfflineOrdersCount,
  getOfflineOrdersBySession,
  getOfflineOrdersByCustomer,
  clearOfflineOrders,
  deleteOfflineOrder,
  type TCreateOfflineOrderInput,
  type TCreateOfflineOrderItemInput,
} from './ordersCacheService';

// Cart persistence service (Story 3.2)
export {
  saveCart,
  loadCart,
  clearPersistedCart,
  hasPersistedCart,
  validateAndFilterCartItems,
  CART_PERSISTENCE_KEY,
  type IPersistedCartState,
  type TSaveCartInput,
} from './cartPersistenceService';

// Offline order service (Story 3.3)
export {
  createOfflineOrder,
  convertCartItemToOrderItem,
  calculateTaxAmount,
  type ICartStateForOrder,
} from './offlineOrderService';

// Offline payment service (Story 3.4)
export {
  generateLocalPaymentId,
  isLocalPaymentId,
  calculateChange,
  saveOfflinePayment,
  saveOfflinePayments,
  getPaymentsByOrderId,
  getOfflinePaymentById,
  getOrderPaidAmount,
  getPaymentsBySyncStatus,
  getPendingSyncPaymentsCount,
  markPaymentSynced,
  markPaymentConflict,
  deletePaymentsByOrderId,
  clearOfflinePayments,
  type TCreateOfflinePaymentInput,
} from './offlinePaymentService';

// Offline session service (Story 3.5)
export {
  generateLocalSessionId,
  getActiveSession,
  hasActiveSession,
  openSession,
  closeSession,
  calculateSessionTotals,
  getSessionById,
  getSessionsByUserId,
} from './offlineSessionService';

// Kitchen dispatch service (Story 3.7)
export {
  getCategoryDispatchStation,
  filterItemsByStation,
  addToDispatchQueue,
  updateOrderDispatchStatus,
  dispatchOrderToKitchen,
  markStationDispatched,
  processDispatchQueue,
  getRetryDelay,
  getPendingDispatchCount,
  getFailedDispatchCount,
  getOrderDispatchQueue,
  getPendingDispatchItems,
  clearFailedDispatchItems,
  retryFailedDispatchItems,
} from './kitchenDispatchService';
