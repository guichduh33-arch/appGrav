// Settings hooks - modular exports
export { settingsKeys } from './settingsKeys'

// Core settings functionality
export {
  useInitializeSettings,
  useSettingsCategories,
  useSettingsByCategory,
  useSetting,
  useUpdateSetting,
  useResetSetting,
  useSettingsHistory,
  useSettingValue,
  useAppearance,
  useLocalization,
  useSetAppearance,
  useSetLocalization,
} from './useSettingsCore'

// Tax settings
export {
  useTaxRates,
  useCreateTaxRate,
  useUpdateTaxRate,
  useDeleteTaxRate,
} from './useTaxSettings'

// Payment settings
export {
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from './usePaymentSettings'

// Business settings (hours, printers, templates)
export {
  useBusinessHours,
  useUpdateBusinessHours,
  usePrinters,
  useCreatePrinter,
  useUpdatePrinter,
  useDeletePrinter,
  useEmailTemplates,
  useUpdateEmailTemplate,
  useReceiptTemplates,
  useUpdateReceiptTemplate,
} from './useBusinessSettings'

// POS advanced settings
export {
  usePOSAdvancedSettings,
  useUpdatePOSAdvancedSetting,
} from './usePOSAdvancedSettings'

// Module settings
export {
  useModuleSettings,
  useUpdateModuleSetting,
  useIsModuleEnabled,
} from './useModuleSettings'

// Notification settings
export {
  useNotificationSettings,
  useUpdateNotificationSetting,
  useSendTestEmail,
} from './useNotificationSettings'

// Terminal settings
export {
  useTerminalSettings,
  useUpdateTerminalSettings,
  useTerminalSettingOverrides,
  useSetTerminalSettingOverride,
} from './useTerminalSettings'

// Settings profiles
export {
  useSettingsProfiles,
  useSettingsProfile,
  useCreateSettingsProfile,
  useUpdateSettingsProfile,
  useDeleteSettingsProfile,
  useApplySettingsProfile,
} from './useSettingsProfiles'

// Sound assets
export {
  useSoundAssets,
  useSoundAssetsByCategory,
} from './useSoundAssets'

// Module config settings (Epic 10)
export {
  usePOSConfigSettings,
  useFinancialSettings,
  useInventoryConfigSettings,
  useLoyaltySettings,
  useB2BSettings,
  useKDSConfigSettings,
  useDisplaySettings,
  useSyncAdvancedSettings,
  useSecurityPinSettings,
  usePrintingServerSettings,
  POS_CONFIG_DEFAULTS,
  FINANCIAL_DEFAULTS,
  INVENTORY_CONFIG_DEFAULTS,
  LOYALTY_DEFAULTS,
  B2B_DEFAULTS,
  KDS_CONFIG_DEFAULTS,
  DISPLAY_DEFAULTS,
  SYNC_ADVANCED_DEFAULTS,
  SECURITY_PIN_DEFAULTS,
  PRINTING_SERVER_DEFAULTS,
} from './useModuleConfigSettings'
