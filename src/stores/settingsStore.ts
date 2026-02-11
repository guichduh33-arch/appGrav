// Backward-compatible facade - prefer importing from '@/stores/settings' directly
export {
  useCoreSettingsStore as useSettingsStore,
  selectTheme,
  selectPrimaryColor,
  selectLanguage,
  selectCurrency,
  selectDateFormat,
  selectTimeFormat,
} from './settings';

export {
  useTaxStore,
  usePaymentMethodStore,
  useBusinessHoursStore,
  usePrinterStore,
} from './settings';
