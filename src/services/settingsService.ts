/**
 * Settings Service - extracted from settingsStore (ARCH-007)
 *
 * All Supabase queries and mutations for settings are centralized here.
 * The settingsStore should call these functions instead of using supabase directly.
 */

import { supabase } from '@/lib/supabase'
import type {
  SettingsCategory,
  Setting,
  TaxRate,
  PaymentMethod,
  BusinessHours,
  PrinterConfiguration,
} from '@/types/settings'

// =====================================================
// Settings Categories
// =====================================================

export async function fetchSettingsCategories(): Promise<SettingsCategory[]> {
  const { data, error } = await supabase
    .from('settings_categories')
    .select(`
      id, code, name_en, name_fr, name_id, description_en, description_fr, 
      description_id, icon, sort_order, is_active, required_permission, created_at
    `)
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data || []
}

// =====================================================
// Settings (key-value)
// =====================================================

export async function fetchAllSettings(): Promise<Setting[]> {
  const { data, error } = await supabase
    .from('settings')
    .select(`
      id, category_id, key, name_en, name_fr, name_id, description_en, description_fr, 
      description_id, value, value_type, default_value, validation_rules, is_system, 
      is_readonly, is_sensitive, requires_restart, sort_order, updated_at, updated_by, created_at
    `)
    .order('sort_order')

  if (error) throw error
  return data || []
}

export async function fetchSettingsByCategory(categoryCode: string): Promise<Setting[]> {
  const { data, error } = await supabase
    .rpc('get_settings_by_category', { p_category_code: categoryCode })

  if (error) throw error
  return (data || []) as Setting[]
}

export async function updateSetting(key: string, value: unknown, reason?: string): Promise<void> {
  const { error } = await supabase.rpc('update_setting', {
    p_key: key,
    p_value: value,
    p_reason: reason,
  })

  if (error) throw error
}

export async function updateSettingsBulk(updates: Record<string, unknown>): Promise<number> {
  const { data, error } = await supabase.rpc('update_settings_bulk', {
    p_settings: updates as Record<string, string>,
  })

  if (error) throw error
  return data
}

export async function resetSetting(key: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('reset_setting', {
    p_key: key,
  })

  if (error) throw error
  return data
}

export async function resetCategorySettings(categoryCode: string): Promise<number> {
  const { data, error } = await supabase.rpc('reset_category_settings', {
    p_category_code: categoryCode,
  })

  if (error) throw error
  return data
}

// =====================================================
// Tax Rates
// =====================================================

export async function fetchTaxRates(): Promise<TaxRate[]> {
  const { data, error } = await supabase
    .from('tax_rates')
    .select(`
      id, applies_to, code, created_at, is_active, is_default, is_inclusive, 
      name, name_en, name_fr, name_id, rate, updated_at, valid_from, valid_until
    `)
    .order('rate')

  if (error) throw error
  return data || []
}

export async function createTaxRate(taxRate: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>): Promise<TaxRate> {
  const { data, error } = await supabase
    .from('tax_rates')
    .insert(taxRate)
    .select(`
      id, applies_to, code, created_at, is_active, is_default, is_inclusive, 
      name, name_en, name_fr, name_id, rate, updated_at, valid_from, valid_until
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateTaxRate(id: string, updates: Partial<TaxRate>): Promise<void> {
  const { error } = await supabase
    .from('tax_rates')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deleteTaxRate(id: string): Promise<void> {
  const { error } = await supabase
    .from('tax_rates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// Payment Methods
// =====================================================

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select(`
      id, code, created_at, icon, is_active, is_default, name, name_en, name_fr, 
      name_id, payment_type, requires_reference, settings, sort_order, type, updated_at
    `)
    .order('sort_order')

  if (error) throw error
  return data || []
}

export async function createPaymentMethod(method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod> {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert(method)
    .select(`
      id, code, created_at, icon, is_active, is_default, name, name_en, name_fr, 
      name_id, payment_type, requires_reference, settings, sort_order, type, updated_at
    `)
    .single()

  if (error) throw error
  return data
}

export async function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// Business Hours
// =====================================================

export async function fetchBusinessHours(): Promise<BusinessHours[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select(`
      id, break_end, break_start, close_time, created_at, day_of_week, 
      is_closed, is_open, open_time, updated_at
    `)
    .order('day_of_week')

  if (error) throw error
  return data || []
}

export async function updateBusinessHours(dayOfWeek: number, updates: Partial<BusinessHours>): Promise<void> {
  const { error } = await supabase
    .from('business_hours')
    .update(updates)
    .eq('day_of_week', dayOfWeek)

  if (error) throw error
}

// =====================================================
// Printer Configurations
// =====================================================

export async function fetchPrinters(): Promise<PrinterConfiguration[]> {
  const { data, error } = await supabase
    .from('printer_configurations')
    .select(`
      id, connection_string, connection_type, created_at, is_active, is_default, 
      name, paper_width, printer_type, settings, updated_at
    `)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createPrinter(printer: Omit<PrinterConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<PrinterConfiguration> {
  const { data, error } = await supabase
    .from('printer_configurations')
    .insert(printer)
    .select(`
      id, connection_string, connection_type, created_at, is_active, is_default, 
      name, paper_width, printer_type, settings, updated_at
    `)
    .single()

  if (error) throw error
  return data
}

export async function updatePrinter(id: string, updates: Partial<PrinterConfiguration>): Promise<void> {
  const { error } = await supabase
    .from('printer_configurations')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

export async function deletePrinter(id: string): Promise<void> {
  const { error } = await supabase
    .from('printer_configurations')
    .delete()
    .eq('id', id)

  if (error) throw error
}
