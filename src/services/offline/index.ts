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
