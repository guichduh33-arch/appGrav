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
} from '../types/settings';

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
