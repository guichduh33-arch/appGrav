import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../lib/supabase';
import { cacheAllSettingsData } from '../../services/offline/settingsCacheService';
import { useTaxStore } from './taxStore';
import { usePaymentMethodStore } from './paymentMethodStore';
import { useBusinessHoursStore } from './businessHoursStore';
import type {
  SettingsCategory,
  Setting,
  AppearanceSettings,
  LocalizationSettings,
} from '../../types/settings';
import logger from '@/utils/logger';

interface CoreSettingsState {
  categories: SettingsCategory[];
  settings: Record<string, Setting>;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  appearance: AppearanceSettings;
  localization: LocalizationSettings;
  initialize: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSettings: () => Promise<void>;
  loadSettingsByCategory: (categoryCode: string) => Promise<Setting[]>;
  getSetting: <T = unknown>(key: string) => T | null;
  getSettingsByCategory: (categoryCode: string) => Setting[];
  updateSetting: (key: string, value: unknown, reason?: string) => Promise<boolean>;
  updateSettings: (updates: Record<string, unknown>) => Promise<boolean>;
  resetSetting: (key: string) => Promise<boolean>;
  resetCategorySettings: (categoryCode: string) => Promise<number>;
  setAppearance: (updates: Partial<AppearanceSettings>) => void;
  setLocalization: (updates: Partial<LocalizationSettings>) => void;
}

const defaultAppearance: AppearanceSettings = {
  theme: 'light',
  primary_color: '#2563eb',
  sidebar_collapsed: false,
  compact_mode: false,
  pos_layout: 'grid',
  pos_columns: 4,
  show_product_images: true,
};

const defaultLocalization: LocalizationSettings = {
  default_language: 'id',
  timezone: 'Asia/Makassar',
  currency_code: 'IDR',
  currency_symbol: 'Rp',
  currency_position: 'before',
  decimal_separator: ',',
  thousands_separator: '.',
  date_format: 'DD/MM/YYYY',
  time_format: 'HH:mm',
};

function parseSettingValue<T>(value: unknown): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
}

export const useCoreSettingsStore = create<CoreSettingsState>()(
  persist(
    (set, get) => ({
      categories: [],
      settings: {},
      isLoading: false,
      isInitialized: false,
      error: null,
      appearance: defaultAppearance,
      localization: defaultLocalization,

      initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true, error: null });
        try {
          await Promise.all([
            get().loadCategories(),
            get().loadSettings(),
            useTaxStore.getState().loadTaxRates(),
            usePaymentMethodStore.getState().loadPaymentMethods(),
            useBusinessHoursStore.getState().loadBusinessHours(),
          ]);
          const settings = get().settings;
          const appearance = { ...defaultAppearance };
          const localization = { ...defaultLocalization };
          Object.entries(settings).forEach(([key, setting]) => {
            if (key.startsWith('appearance.')) {
              const propName = key.replace('appearance.', '') as keyof AppearanceSettings;
              (appearance as Record<string, unknown>)[propName] = parseSettingValue(setting.value);
            }
            if (key.startsWith('localization.')) {
              const propName = key.replace('localization.', '') as keyof LocalizationSettings;
              (localization as Record<string, unknown>)[propName] = parseSettingValue(setting.value);
            }
          });
          set({ isLoading: false, isInitialized: true, appearance, localization });
          cacheAllSettingsData()
            .then((result) => {
              if (result.success) {
                logger.debug('[Settings] Offline cache updated at', result.lastSyncAt);
              } else {
                logger.warn('[Settings] Offline cache partial failure:', result.errors);
              }
            })
            .catch((error) => {
              logger.warn('[Settings] Failed to cache settings for offline:', error);
            });
        } catch (error) {
          logger.error('Failed to initialize settings:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load settings',
          });
        }
      },

      loadCategories: async () => {
        const { data, error } = await supabase
          .from('settings_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (error) throw error;
        set({ categories: data || [] });
      },

      loadSettings: async () => {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .order('sort_order');
        if (error) throw error;
        const settingsMap: Record<string, Setting> = {};
        (data || []).forEach((setting) => {
          settingsMap[setting.key] = setting;
        });
        set({ settings: settingsMap });
      },

      loadSettingsByCategory: async (categoryCode: string) => {
        const { data, error } = await supabase
          .rpc('get_settings_by_category', { p_category_code: categoryCode });
        if (error) throw error;
        return (data || []) as Setting[];
      },

      getSetting: <T = unknown>(key: string): T | null => {
        const setting = get().settings[key];
        if (!setting) return null;
        return parseSettingValue<T>(setting.value);
      },

      getSettingsByCategory: (categoryCode: string) => {
        const category = get().categories.find((c) => c.code === categoryCode);
        if (!category) return [];
        return Object.values(get().settings)
          .filter((s) => s.category_id === category.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      },

      updateSetting: async (key: string, value: unknown, reason?: string) => {
        try {
          const { error } = await supabase.rpc('update_setting', {
            p_key: key,
            p_value: value,
            p_reason: reason,
          });
          if (error) throw error;
          const settings = { ...get().settings };
          if (settings[key]) {
            settings[key] = {
              ...settings[key],
              value: value as Setting['value'],
              updated_at: new Date().toISOString(),
            };
            set({ settings });
            if (key.startsWith('appearance.')) {
              const propName = key.replace('appearance.', '') as keyof AppearanceSettings;
              set({ appearance: { ...get().appearance, [propName]: parseSettingValue(value) } });
            }
            if (key.startsWith('localization.')) {
              const propName = key.replace('localization.', '') as keyof LocalizationSettings;
              set({ localization: { ...get().localization, [propName]: parseSettingValue(value) } });
            }
          }
          return true;
        } catch (error) {
          logger.error('Failed to update setting:', error);
          return false;
        }
      },

      updateSettings: async (updates: Record<string, unknown>) => {
        try {
          const { data, error } = await supabase.rpc('update_settings_bulk', {
            p_settings: updates as Record<string, string>,
          });
          if (error) throw error;
          await get().loadSettings();
          return data > 0;
        } catch (error) {
          logger.error('Failed to update settings:', error);
          return false;
        }
      },

      resetSetting: async (key: string) => {
        try {
          const { data, error } = await supabase.rpc('reset_setting', { p_key: key });
          if (error) throw error;
          if (data) await get().loadSettings();
          return data;
        } catch (error) {
          logger.error('Failed to reset setting:', error);
          return false;
        }
      },

      resetCategorySettings: async (categoryCode: string) => {
        try {
          const { data, error } = await supabase.rpc('reset_category_settings', {
            p_category_code: categoryCode,
          });
          if (error) throw error;
          if (data > 0) await get().loadSettings();
          return data;
        } catch (error) {
          logger.error('Failed to reset category settings:', error);
          return 0;
        }
      },

      setAppearance: (updates) => {
        set({ appearance: { ...get().appearance, ...updates } });
        const dbUpdates: Record<string, unknown> = {};
        Object.entries(updates).forEach(([key, value]) => {
          dbUpdates[`appearance.${key}`] = value;
        });
        get().updateSettings(dbUpdates);
      },

      setLocalization: (updates) => {
        set({ localization: { ...get().localization, ...updates } });
        const dbUpdates: Record<string, unknown> = {};
        Object.entries(updates).forEach(([key, value]) => {
          dbUpdates[`localization.${key}`] = value;
        });
        get().updateSettings(dbUpdates);
      },
    }),
    {
      name: 'breakery-settings',
      partialize: (state) => ({
        appearance: state.appearance,
        localization: state.localization,
      }),
    }
  )
);

// Selectors
export const selectTheme = (state: CoreSettingsState) => state.appearance.theme;
export const selectPrimaryColor = (state: CoreSettingsState) => state.appearance.primary_color;
export const selectLanguage = (state: CoreSettingsState) => state.localization.default_language;
export const selectCurrency = (state: CoreSettingsState) => ({
  code: state.localization.currency_code,
  symbol: state.localization.currency_symbol,
  position: state.localization.currency_position,
});
export const selectDateFormat = (state: CoreSettingsState) => state.localization.date_format;
export const selectTimeFormat = (state: CoreSettingsState) => state.localization.time_format;
