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
