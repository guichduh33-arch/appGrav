import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type {
  SettingsCategory,
  Setting,
  TaxRate,
  PaymentMethod,
  BusinessHours,
  PrinterConfiguration,
  AppearanceSettings,
  LocalizationSettings,
} from '../types/settings';

// =====================================================
// State Interface
// =====================================================

interface SettingsState {
  // Data
  categories: SettingsCategory[];
  settings: Record<string, Setting>;
  taxRates: TaxRate[];
  paymentMethods: PaymentMethod[];
  businessHours: BusinessHours[];
  printers: PrinterConfiguration[];

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Cached computed settings (for quick access)
  appearance: AppearanceSettings;
  localization: LocalizationSettings;

  // Actions
  initialize: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSettings: () => Promise<void>;
  loadSettingsByCategory: (categoryCode: string) => Promise<Setting[]>;
  loadTaxRates: () => Promise<void>;
  loadPaymentMethods: () => Promise<void>;
  loadBusinessHours: () => Promise<void>;
  loadPrinters: () => Promise<void>;

  // Getters
  getSetting: <T = unknown>(key: string) => T | null;
  getSettingsByCategory: (categoryCode: string) => Setting[];
  getDefaultTaxRate: () => TaxRate | null;
  getDefaultPaymentMethod: () => PaymentMethod | null;
  getActivePaymentMethods: () => PaymentMethod[];
  getActiveTaxRates: () => TaxRate[];

  // Mutations
  updateSetting: (key: string, value: unknown, reason?: string) => Promise<boolean>;
  updateSettings: (updates: Record<string, unknown>) => Promise<boolean>;
  resetSetting: (key: string) => Promise<boolean>;
  resetCategorySettings: (categoryCode: string) => Promise<number>;

  // Tax rates
  createTaxRate: (taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>) => Promise<TaxRate | null>;
  updateTaxRate: (id: string, updates: Partial<TaxRate>) => Promise<boolean>;
  deleteTaxRate: (id: string) => Promise<boolean>;

  // Payment methods
  createPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => Promise<PaymentMethod | null>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<boolean>;
  deletePaymentMethod: (id: string) => Promise<boolean>;

  // Business hours
  updateBusinessHours: (dayOfWeek: number, updates: Partial<BusinessHours>) => Promise<boolean>;

  // Printers
  createPrinter: (printer: Omit<PrinterConfiguration, 'id' | 'created_at' | 'updated_at'>) => Promise<PrinterConfiguration | null>;
  updatePrinter: (id: string, updates: Partial<PrinterConfiguration>) => Promise<boolean>;
  deletePrinter: (id: string) => Promise<boolean>;

  // Local appearance settings (immediate effect)
  setAppearance: (updates: Partial<AppearanceSettings>) => void;
  setLocalization: (updates: Partial<LocalizationSettings>) => void;
}

// =====================================================
// Default Values
// =====================================================

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

// =====================================================
// Helper: Parse setting value from JSONB
// =====================================================

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

// =====================================================
// Store Implementation
// =====================================================

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      categories: [],
      settings: {},
      taxRates: [],
      paymentMethods: [],
      businessHours: [],
      printers: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      appearance: defaultAppearance,
      localization: defaultLocalization,

      // =====================================================
      // Initialize - Load all settings data
      // =====================================================

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });

        try {
          await Promise.all([
            get().loadCategories(),
            get().loadSettings(),
            get().loadTaxRates(),
            get().loadPaymentMethods(),
            get().loadBusinessHours(),
          ]);

          // Extract appearance and localization from loaded settings
          const settings = get().settings;
          const appearance = { ...defaultAppearance };
          const localization = { ...defaultLocalization };

          // Parse appearance settings
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

          set({
            isLoading: false,
            isInitialized: true,
            appearance,
            localization,
          });
        } catch (error) {
          console.error('Failed to initialize settings:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load settings',
          });
        }
      },

      // =====================================================
      // Load Functions
      // =====================================================

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

      loadTaxRates: async () => {
        const { data, error } = await supabase
          .from('tax_rates')
          .select('*')
          .order('rate');

        if (error) throw error;
        set({ taxRates: data || [] });
      },

      loadPaymentMethods: async () => {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .order('sort_order');

        if (error) throw error;
        set({ paymentMethods: data || [] });
      },

      loadBusinessHours: async () => {
        const { data, error } = await supabase
          .from('business_hours')
          .select('*')
          .order('day_of_week');

        if (error) throw error;
        set({ businessHours: data || [] });
      },

      loadPrinters: async () => {
        const { data, error } = await supabase
          .from('printer_configurations')
          .select('*')
          .order('name');

        if (error) throw error;
        set({ printers: data || [] });
      },

      // =====================================================
      // Getters
      // =====================================================

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

      getDefaultTaxRate: () => {
        return get().taxRates.find((t) => t.is_default && t.is_active) || null;
      },

      getDefaultPaymentMethod: () => {
        return get().paymentMethods.find((p) => p.is_default && p.is_active) || null;
      },

      getActivePaymentMethods: () => {
        return get().paymentMethods.filter((p) => p.is_active);
      },

      getActiveTaxRates: () => {
        return get().taxRates.filter((t) => t.is_active);
      },

      // =====================================================
      // Settings Mutations
      // =====================================================

      updateSetting: async (key: string, value: unknown, reason?: string) => {
        try {
          const { error } = await supabase.rpc('update_setting', {
            p_key: key,
            p_value: JSON.stringify(value),
            p_reason: reason ?? null,
          });

          if (error) throw error;

          // Update local state
          const settings = { ...get().settings };
          if (settings[key]) {
            settings[key] = {
              ...settings[key],
              value: value as Setting['value'],
              updated_at: new Date().toISOString(),
            };
            set({ settings });

            // Update cached appearance/localization if relevant
            if (key.startsWith('appearance.')) {
              const propName = key.replace('appearance.', '') as keyof AppearanceSettings;
              set({
                appearance: {
                  ...get().appearance,
                  [propName]: parseSettingValue(value),
                },
              });
            }
            if (key.startsWith('localization.')) {
              const propName = key.replace('localization.', '') as keyof LocalizationSettings;
              set({
                localization: {
                  ...get().localization,
                  [propName]: parseSettingValue(value),
                },
              });
            }
          }

          return true;
        } catch (error) {
          console.error('Failed to update setting:', error);
          return false;
        }
      },

      updateSettings: async (updates: Record<string, unknown>) => {
        try {
          const { data, error } = await supabase.rpc('update_settings_bulk', {
            p_settings: updates as Record<string, string>,
          });

          if (error) throw error;

          // Reload settings to get fresh data
          await get().loadSettings();

          return data > 0;
        } catch (error) {
          console.error('Failed to update settings:', error);
          return false;
        }
      },

      resetSetting: async (key: string) => {
        try {
          const { data, error } = await supabase.rpc('reset_setting', {
            p_key: key,
          });

          if (error) throw error;

          if (data) {
            await get().loadSettings();
          }

          return data;
        } catch (error) {
          console.error('Failed to reset setting:', error);
          return false;
        }
      },

      resetCategorySettings: async (categoryCode: string) => {
        try {
          const { data, error } = await supabase.rpc('reset_category_settings', {
            p_category_code: categoryCode,
          });

          if (error) throw error;

          if (data > 0) {
            await get().loadSettings();
          }

          return data;
        } catch (error) {
          console.error('Failed to reset category settings:', error);
          return 0;
        }
      },

      // =====================================================
      // Tax Rates CRUD
      // =====================================================

      createTaxRate: async (taxRate) => {
        try {
          const { data, error } = await supabase
            .from('tax_rates')
            .insert(taxRate)
            .select()
            .single();

          if (error) throw error;

          set({ taxRates: [...get().taxRates, data] });
          return data;
        } catch (error) {
          console.error('Failed to create tax rate:', error);
          return null;
        }
      },

      updateTaxRate: async (id, updates) => {
        try {
          const { error } = await supabase
            .from('tax_rates')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          set({
            taxRates: get().taxRates.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          });
          return true;
        } catch (error) {
          console.error('Failed to update tax rate:', error);
          return false;
        }
      },

      deleteTaxRate: async (id) => {
        try {
          const { error } = await supabase
            .from('tax_rates')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set({ taxRates: get().taxRates.filter((t) => t.id !== id) });
          return true;
        } catch (error) {
          console.error('Failed to delete tax rate:', error);
          return false;
        }
      },

      // =====================================================
      // Payment Methods CRUD
      // =====================================================

      createPaymentMethod: async (method) => {
        try {
          const { data, error } = await supabase
            .from('payment_methods')
            .insert(method)
            .select()
            .single();

          if (error) throw error;

          set({ paymentMethods: [...get().paymentMethods, data] });
          return data;
        } catch (error) {
          console.error('Failed to create payment method:', error);
          return null;
        }
      },

      updatePaymentMethod: async (id, updates) => {
        try {
          const { error } = await supabase
            .from('payment_methods')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          set({
            paymentMethods: get().paymentMethods.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          });
          return true;
        } catch (error) {
          console.error('Failed to update payment method:', error);
          return false;
        }
      },

      deletePaymentMethod: async (id) => {
        try {
          const { error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set({ paymentMethods: get().paymentMethods.filter((p) => p.id !== id) });
          return true;
        } catch (error) {
          console.error('Failed to delete payment method:', error);
          return false;
        }
      },

      // =====================================================
      // Business Hours
      // =====================================================

      updateBusinessHours: async (dayOfWeek, updates) => {
        try {
          const { error } = await supabase
            .from('business_hours')
            .update(updates)
            .eq('day_of_week', dayOfWeek);

          if (error) throw error;

          set({
            businessHours: get().businessHours.map((h) =>
              h.day_of_week === dayOfWeek ? { ...h, ...updates } : h
            ),
          });
          return true;
        } catch (error) {
          console.error('Failed to update business hours:', error);
          return false;
        }
      },

      // =====================================================
      // Printers CRUD
      // =====================================================

      createPrinter: async (printer) => {
        try {
          const { data, error } = await supabase
            .from('printer_configurations')
            .insert(printer)
            .select()
            .single();

          if (error) throw error;

          set({ printers: [...get().printers, data] });
          return data;
        } catch (error) {
          console.error('Failed to create printer:', error);
          return null;
        }
      },

      updatePrinter: async (id, updates) => {
        try {
          const { error } = await supabase
            .from('printer_configurations')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          set({
            printers: get().printers.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          });
          return true;
        } catch (error) {
          console.error('Failed to update printer:', error);
          return false;
        }
      },

      deletePrinter: async (id) => {
        try {
          const { error } = await supabase
            .from('printer_configurations')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set({ printers: get().printers.filter((p) => p.id !== id) });
          return true;
        } catch (error) {
          console.error('Failed to delete printer:', error);
          return false;
        }
      },

      // =====================================================
      // Local Settings (immediate effect, synced to DB)
      // =====================================================

      setAppearance: (updates) => {
        const newAppearance = { ...get().appearance, ...updates };
        set({ appearance: newAppearance });

        // Sync to database in background
        Object.entries(updates).forEach(([key, value]) => {
          get().updateSetting(`appearance.${key}`, value);
        });
      },

      setLocalization: (updates) => {
        const newLocalization = { ...get().localization, ...updates };
        set({ localization: newLocalization });

        // Sync to database in background
        Object.entries(updates).forEach(([key, value]) => {
          get().updateSetting(`localization.${key}`, value);
        });
      },
    }),
    {
      name: 'breakery-settings',
      // Only persist appearance and localization for immediate app startup
      partialize: (state) => ({
        appearance: state.appearance,
        localization: state.localization,
      }),
    }
  )
);

// =====================================================
// Selectors
// =====================================================

export const selectTheme = (state: SettingsState) => state.appearance.theme;
export const selectPrimaryColor = (state: SettingsState) => state.appearance.primary_color;
export const selectLanguage = (state: SettingsState) => state.localization.default_language;
export const selectCurrency = (state: SettingsState) => ({
  code: state.localization.currency_code,
  symbol: state.localization.currency_symbol,
  position: state.localization.currency_position,
});
export const selectDateFormat = (state: SettingsState) => state.localization.date_format;
export const selectTimeFormat = (state: SettingsState) => state.localization.time_format;
