import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSettingsStore } from '../stores/settingsStore';
import type {
  SettingsCategory,
  Setting,
  SettingHistory,
  TaxRate,
  PaymentMethod,
  BusinessHours,
  PrinterConfiguration,
  EmailTemplate,
  ReceiptTemplate,
  POSAdvancedSettings,
  ModuleSettings,
  TerminalSettings,
  NotificationSettings,
} from '../types/settings';
import type { ITerminalSetting, ISettingsProfile, ISoundAsset } from '../types/database';
import type { Json } from '../types/database.generated';

// Helper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untypedFrom = (table: string) => supabase.from(table as any);

// =====================================================
// Query Keys
// =====================================================

export const settingsKeys = {
  all: ['settings'] as const,
  categories: () => [...settingsKeys.all, 'categories'] as const,
  settings: () => [...settingsKeys.all, 'list'] as const,
  settingsByCategory: (code: string) => [...settingsKeys.settings(), code] as const,
  setting: (key: string) => [...settingsKeys.all, 'detail', key] as const,
  history: (settingId?: string) => [...settingsKeys.all, 'history', settingId] as const,
  taxRates: () => [...settingsKeys.all, 'taxRates'] as const,
  paymentMethods: () => [...settingsKeys.all, 'paymentMethods'] as const,
  businessHours: () => [...settingsKeys.all, 'businessHours'] as const,
  printers: () => [...settingsKeys.all, 'printers'] as const,
  emailTemplates: () => [...settingsKeys.all, 'emailTemplates'] as const,
  receiptTemplates: () => [...settingsKeys.all, 'receiptTemplates'] as const,
  // New settings keys
  posAdvanced: () => [...settingsKeys.all, 'posAdvanced'] as const,
  modules: () => [...settingsKeys.all, 'modules'] as const,
  terminalSettings: (terminalId: string) => [...settingsKeys.all, 'terminal', terminalId] as const,
  profiles: () => [...settingsKeys.all, 'profiles'] as const,
  profile: (id: string) => [...settingsKeys.profiles(), id] as const,
  soundAssets: () => [...settingsKeys.all, 'soundAssets'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
};

// =====================================================
// Initialize Settings (call once at app start)
// =====================================================

export function useInitializeSettings() {
  const initialize = useSettingsStore((state) => state.initialize);
  const isInitialized = useSettingsStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return isInitialized;
}

// =====================================================
// Categories
// =====================================================

export function useSettingsCategories() {
  return useQuery({
    queryKey: settingsKeys.categories(),
    queryFn: async (): Promise<SettingsCategory[]> => {
      const { data, error } = await supabase
        .from('settings_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =====================================================
// Settings by Category
// =====================================================

export function useSettingsByCategory(categoryCode: string) {
  return useQuery({
    queryKey: settingsKeys.settingsByCategory(categoryCode),
    queryFn: async (): Promise<Setting[]> => {
      const { data, error } = await supabase
        .from('settings')
        .select(`
          *,
          category:settings_categories!inner(code)
        `)
        .eq('settings_categories.code', categoryCode)
        .order('sort_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryCode,
  });
}

// =====================================================
// Single Setting
// =====================================================

export function useSetting(key: string) {
  const storeValue = useSettingsStore((state) => state.getSetting(key));

  return useQuery({
    queryKey: settingsKeys.setting(key),
    queryFn: async (): Promise<Setting | null> => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    initialData: storeValue ? { key, value: storeValue } as Setting : undefined,
    enabled: !!key,
  });
}

// =====================================================
// Update Setting Mutation
// =====================================================

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const updateStoreSetting = useSettingsStore((state) => state.updateSetting);

  return useMutation({
    mutationFn: async ({
      key,
      value,
      reason,
    }: {
      key: string;
      value: unknown;
      reason?: string;
    }) => {
      const success = await updateStoreSetting(key, value, reason);
      if (!success) throw new Error('Failed to update setting');
      return { key, value };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.setting(data.key) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

// =====================================================
// Reset Setting Mutation
// =====================================================

export function useResetSetting() {
  const queryClient = useQueryClient();
  const resetStoreSetting = useSettingsStore((state) => state.resetSetting);

  return useMutation({
    mutationFn: async (key: string) => {
      const success = await resetStoreSetting(key);
      if (!success) throw new Error('Failed to reset setting');
      return key;
    },
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.setting(key) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.settings() });
    },
  });
}

// =====================================================
// Settings History
// =====================================================

export function useSettingsHistory(settingId?: string) {
  return useQuery({
    queryKey: settingsKeys.history(settingId),
    queryFn: async (): Promise<SettingHistory[]> => {
      let query = supabase
        .from('settings_history')
        .select(`
          *,
          setting:settings(key, name_fr, name_en, name_id),
          user:user_profiles(display_name, first_name, last_name)
        `)
        .order('changed_at', { ascending: false })
        .limit(100);

      if (settingId) {
        query = query.eq('setting_id', settingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

// =====================================================
// Tax Rates
// =====================================================

export function useTaxRates() {
  return useQuery({
    queryKey: settingsKeys.taxRates(),
    queryFn: async (): Promise<TaxRate[]> => {
      const { data, error } = await supabase
        .from('tax_rates')
        .select('*')
        .order('rate');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient();
  const createTaxRate = useSettingsStore((state) => state.createTaxRate);

  return useMutation({
    mutationFn: async (taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await createTaxRate(taxRate);
      if (!result) throw new Error('Failed to create tax rate');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxRates() });
    },
  });
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient();
  const updateTaxRate = useSettingsStore((state) => state.updateTaxRate);

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TaxRate> }) => {
      const success = await updateTaxRate(id, updates);
      if (!success) throw new Error('Failed to update tax rate');
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxRates() });
    },
  });
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient();
  const deleteTaxRate = useSettingsStore((state) => state.deleteTaxRate);

  return useMutation({
    mutationFn: async (id: string) => {
      const success = await deleteTaxRate(id);
      if (!success) throw new Error('Failed to delete tax rate');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.taxRates() });
    },
  });
}

// =====================================================
// Payment Methods
// =====================================================

export function usePaymentMethods() {
  return useQuery({
    queryKey: settingsKeys.paymentMethods(),
    queryFn: async (): Promise<PaymentMethod[]> => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  const createPaymentMethod = useSettingsStore((state) => state.createPaymentMethod);

  return useMutation({
    mutationFn: async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await createPaymentMethod(method);
      if (!result) throw new Error('Failed to create payment method');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  const updatePaymentMethod = useSettingsStore((state) => state.updatePaymentMethod);

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentMethod> }) => {
      const success = await updatePaymentMethod(id, updates);
      if (!success) throw new Error('Failed to update payment method');
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  const deletePaymentMethod = useSettingsStore((state) => state.deletePaymentMethod);

  return useMutation({
    mutationFn: async (id: string) => {
      const success = await deletePaymentMethod(id);
      if (!success) throw new Error('Failed to delete payment method');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.paymentMethods() });
    },
  });
}

// =====================================================
// Business Hours
// =====================================================

export function useBusinessHours() {
  return useQuery({
    queryKey: settingsKeys.businessHours(),
    queryFn: async (): Promise<BusinessHours[]> => {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();
  const updateBusinessHours = useSettingsStore((state) => state.updateBusinessHours);

  return useMutation({
    mutationFn: async ({
      dayOfWeek,
      updates,
    }: {
      dayOfWeek: number;
      updates: Partial<BusinessHours>;
    }) => {
      const success = await updateBusinessHours(dayOfWeek, updates);
      if (!success) throw new Error('Failed to update business hours');
      return { dayOfWeek, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.businessHours() });
    },
  });
}

// =====================================================
// Printers
// =====================================================

export function usePrinters() {
  return useQuery({
    queryKey: settingsKeys.printers(),
    queryFn: async (): Promise<PrinterConfiguration[]> => {
      const { data, error } = await supabase
        .from('printer_configurations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreatePrinter() {
  const queryClient = useQueryClient();
  const createPrinter = useSettingsStore((state) => state.createPrinter);

  return useMutation({
    mutationFn: async (printer: Omit<PrinterConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await createPrinter(printer);
      if (!result) throw new Error('Failed to create printer');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.printers() });
    },
  });
}

export function useUpdatePrinter() {
  const queryClient = useQueryClient();
  const updatePrinter = useSettingsStore((state) => state.updatePrinter);

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PrinterConfiguration>;
    }) => {
      const success = await updatePrinter(id, updates);
      if (!success) throw new Error('Failed to update printer');
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.printers() });
    },
  });
}

export function useDeletePrinter() {
  const queryClient = useQueryClient();
  const deletePrinter = useSettingsStore((state) => state.deletePrinter);

  return useMutation({
    mutationFn: async (id: string) => {
      const success = await deletePrinter(id);
      if (!success) throw new Error('Failed to delete printer');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.printers() });
    },
  });
}

// =====================================================
// Email Templates
// =====================================================

export function useEmailTemplates() {
  return useQuery({
    queryKey: settingsKeys.emailTemplates(),
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('code');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EmailTemplate>;
    }) => {
      const { error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.emailTemplates() });
    },
  });
}

// =====================================================
// Receipt Templates
// =====================================================

export function useReceiptTemplates() {
  return useQuery({
    queryKey: settingsKeys.receiptTemplates(),
    queryFn: async (): Promise<ReceiptTemplate[]> => {
      const { data, error } = await supabase
        .from('receipt_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateReceiptTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ReceiptTemplate>;
    }) => {
      const { error } = await supabase
        .from('receipt_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.receiptTemplates() });
    },
  });
}

// =====================================================
// Convenience Hooks
// =====================================================

/**
 * Get a typed setting value with default fallback
 */
export function useSettingValue<T>(key: string, defaultValue: T): T {
  const storeValue = useSettingsStore((state) => state.getSetting<T>(key));
  return storeValue ?? defaultValue;
}

/**
 * Get appearance settings from store (instant, no loading)
 */
export function useAppearance() {
  return useSettingsStore((state) => state.appearance);
}

/**
 * Get localization settings from store (instant, no loading)
 */
export function useLocalization() {
  return useSettingsStore((state) => state.localization);
}

/**
 * Set appearance settings (immediate + async sync)
 */
export function useSetAppearance() {
  return useSettingsStore((state) => state.setAppearance);
}

/**
 * Set localization settings (immediate + async sync)
 */
export function useSetLocalization() {
  return useSettingsStore((state) => state.setLocalization);
}

// =====================================================
// POS Advanced Settings
// =====================================================

const defaultPOSAdvanced: POSAdvancedSettings = {
  cart: { lock_on_kitchen_send: true, require_pin_locked_remove: true },
  rounding: { amount: 100, method: 'round' },
  payment: { allow_split: true, max_split_count: 4 },
  sound: { enabled: true, new_order: 'chime', payment_success: 'cash', error: 'error' },
  screensaver: { enabled: false, timeout: 300, show_clock: true },
  offline: { enabled: true, auto_switch: true, sync_interval: 30, max_offline_orders: 100 },
  customer_display: { enabled: false, show_items: true, show_promotions: true, show_logo: true },
};

export function usePOSAdvancedSettings() {
  return useQuery({
    queryKey: settingsKeys.posAdvanced(),
    queryFn: async (): Promise<POSAdvancedSettings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'pos_advanced.%');

      if (error) throw error;

      // Build the nested object from flat key-value pairs
      const result = { ...defaultPOSAdvanced };
      for (const row of data || []) {
        const parts = row.key.replace('pos_advanced.', '').split('.');
        if (parts.length === 2) {
          const [group, key] = parts;
          if (group in result) {
            (result as Record<string, Record<string, unknown>>)[group][key] = row.value;
          }
        }
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePOSAdvancedSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      group,
      key,
      value,
    }: {
      group: keyof POSAdvancedSettings;
      key: string;
      value: unknown;
    }) => {
      const settingKey = `pos_advanced.${group}.${key}`;
      const { error } = await supabase
        .from('settings')
        .update({ value: value as Json })
        .eq('key', settingKey);

      if (error) throw error;
      return { group, key, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.posAdvanced() });
    },
  });
}

// =====================================================
// Module Settings
// =====================================================

const defaultModuleSettings: ModuleSettings = {
  production: { enabled: true, auto_consume_stock: true },
  b2b: { enabled: true, min_order_amount: 100000, default_payment_terms: 7 },
  purchasing: { enabled: true, auto_reorder_threshold: 0 },
  loyalty: { enabled: false, points_per_idr: 1000, points_expiry_days: 365 },
  kds: { enabled: true, auto_acknowledge_delay: 0, sound_new_order: true },
};

export function useModuleSettings() {
  return useQuery({
    queryKey: settingsKeys.modules(),
    queryFn: async (): Promise<ModuleSettings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'modules.%');

      if (error) throw error;

      const result = { ...defaultModuleSettings };
      for (const row of data || []) {
        const parts = row.key.replace('modules.', '').split('.');
        if (parts.length === 2) {
          const [module, key] = parts;
          if (module in result) {
            (result as Record<string, Record<string, unknown>>)[module][key] = row.value;
          }
        }
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateModuleSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      module,
      key,
      value,
    }: {
      module: keyof ModuleSettings;
      key: string;
      value: unknown;
    }) => {
      const settingKey = `modules.${module}.${key}`;
      const { error } = await supabase
        .from('settings')
        .update({ value: value as Json })
        .eq('key', settingKey);

      if (error) throw error;
      return { module, key, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.modules() });
    },
  });
}

export function useIsModuleEnabled(moduleName: keyof ModuleSettings): boolean {
  const { data } = useModuleSettings();
  return data?.[moduleName]?.enabled ?? defaultModuleSettings[moduleName].enabled;
}

// =====================================================
// Notification Settings
// =====================================================

const defaultNotificationSettings: NotificationSettings = {
  email_enabled: true,
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  from_email: '',
  low_stock_alerts: true,
  daily_report: true,
  daily_report_time: '21:00',
  whatsapp_enabled: false,
};

export function useNotificationSettings() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: async (): Promise<NotificationSettings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'notifications.%');

      if (error) throw error;

      const result = { ...defaultNotificationSettings };
      for (const row of data || []) {
        const key = row.key.replace('notifications.', '') as keyof NotificationSettings;
        if (key in result) {
          (result[key] as unknown) = row.value;
        }
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: keyof NotificationSettings;
      value: unknown;
    }) => {
      const settingKey = `notifications.${key}`;
      const { error } = await supabase
        .from('settings')
        .update({ value: value as Json })
        .eq('key', settingKey);

      if (error) throw error;
      return { key, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async (recipientEmail: string) => {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { email: recipientEmail },
      });

      if (error) throw error;
      return data;
    },
  });
}

// =====================================================
// Terminal Settings
// =====================================================

export function useTerminalSettings(terminalId: string) {
  return useQuery({
    queryKey: settingsKeys.terminalSettings(terminalId),
    queryFn: async (): Promise<TerminalSettings | null> => {
      // Get the terminal with its settings (columns added by migration)
      const { data: terminal, error: terminalError } = await untypedFrom('pos_terminals')
        .select('mode, default_printer_id, kitchen_printer_id, kds_station, allowed_payment_methods, default_order_type, floor_plan_id, auto_logout_timeout')
        .eq('id', terminalId)
        .single();

      if (terminalError) {
        if (terminalError.code === 'PGRST116') return null;
        throw terminalError;
      }

      return terminal as unknown as TerminalSettings;
    },
    enabled: !!terminalId,
  });
}

export function useUpdateTerminalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      terminalId,
      updates,
    }: {
      terminalId: string;
      updates: Partial<TerminalSettings>;
    }) => {
      const { error } = await untypedFrom('pos_terminals')
        .update(updates)
        .eq('id', terminalId);

      if (error) throw error;
      return { terminalId, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.terminalSettings(data.terminalId) });
    },
  });
}

// Terminal-specific key-value overrides
export function useTerminalSettingOverrides(terminalId: string) {
  return useQuery({
    queryKey: [...settingsKeys.terminalSettings(terminalId), 'overrides'] as const,
    queryFn: async (): Promise<ITerminalSetting[]> => {
      const { data, error } = await untypedFrom('terminal_settings')
        .select('*')
        .eq('terminal_id', terminalId);

      if (error) throw error;
      return (data || []) as unknown as ITerminalSetting[];
    },
    enabled: !!terminalId,
  });
}

export function useSetTerminalSettingOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      terminalId,
      key,
      value,
    }: {
      terminalId: string;
      key: string;
      value: unknown;
    }) => {
      const { error } = await untypedFrom('terminal_settings')
        .upsert({ terminal_id: terminalId, key, value }, { onConflict: 'terminal_id,key' });

      if (error) throw error;
      return { terminalId, key, value };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.terminalSettings(data.terminalId) });
    },
  });
}

// =====================================================
// Settings Profiles
// =====================================================

export function useSettingsProfiles() {
  return useQuery({
    queryKey: settingsKeys.profiles(),
    queryFn: async (): Promise<ISettingsProfile[]> => {
      const { data, error } = await untypedFrom('settings_profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as unknown as ISettingsProfile[];
    },
  });
}

export function useSettingsProfile(id: string) {
  return useQuery({
    queryKey: settingsKeys.profile(id),
    queryFn: async (): Promise<ISettingsProfile | null> => {
      const { data, error } = await untypedFrom('settings_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as ISettingsProfile;
    },
    enabled: !!id,
  });
}

export function useCreateSettingsProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Omit<ISettingsProfile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await untypedFrom('settings_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ISettingsProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profiles() });
    },
  });
}

export function useUpdateSettingsProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ISettingsProfile>;
    }) => {
      const { error } = await untypedFrom('settings_profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profiles() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile(data.id) });
    },
  });
}

export function useDeleteSettingsProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await untypedFrom('settings_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profiles() });
    },
  });
}

export function useApplySettingsProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      // Call the database function to apply profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.rpc as any)('apply_settings_profile', { p_profile_id: profileId });
      if (error) throw error;
      return profileId;
    },
    onSuccess: () => {
      // Invalidate all settings as they may have changed
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

// =====================================================
// Sound Assets
// =====================================================

export function useSoundAssets() {
  return useQuery({
    queryKey: settingsKeys.soundAssets(),
    queryFn: async (): Promise<ISoundAsset[]> => {
      const { data, error } = await untypedFrom('sound_assets')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as ISoundAsset[];
    },
  });
}

export function useSoundAssetsByCategory(category: ISoundAsset['category']) {
  const { data: allSounds } = useSoundAssets();
  return allSounds?.filter((s) => s.category === category) || [];
}
