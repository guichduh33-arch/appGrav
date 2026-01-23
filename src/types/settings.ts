// Settings Module Types
// These types are aligned with the database schema from database.generated.ts

import type { Database } from './database.generated'

// Re-export database row types with aliases
export type SettingsCategory = Database['public']['Tables']['settings_categories']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']
export type SettingHistory = Database['public']['Tables']['settings_history']['Row']
export type TaxRate = Database['public']['Tables']['tax_rates']['Row']
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row']
export type BusinessHours = Database['public']['Tables']['business_hours']['Row']
export type PrinterConfiguration = Database['public']['Tables']['printer_configurations']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
export type ReceiptTemplate = Database['public']['Tables']['receipt_templates']['Row']

// =====================================================
// Type Constants
// =====================================================

export type SettingValueType = 'string' | 'number' | 'boolean' | 'json' | 'array' | 'file'
export type PrinterType = 'receipt' | 'label' | 'kitchen' | 'report'
export type ConnectionType = 'usb' | 'network' | 'bluetooth'
export type PaymentType = 'cash' | 'card' | 'transfer' | 'ewallet' | 'other'
export type ReceiptTemplateType = 'receipt' | 'kitchen' | 'label'
export type ThemeMode = 'light' | 'dark' | 'system'
export type CurrencyPosition = 'before' | 'after'
export type RoundingMethod = 'round' | 'floor' | 'ceil'
export type BackupFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type POSLayout = 'grid' | 'list'

// =====================================================
// Validation Rules (for settings)
// =====================================================

export interface ValidationRules {
  min?: number
  max?: number
  pattern?: string
  options?: string[]
}

// =====================================================
// Typed Settings Values (App-level settings)
// =====================================================

export interface CompanySettings {
  name: string
  legal_name: string
  tax_id: string
  address: {
    line1: string
    line2: string
    city: string
    province: string
    postal_code: string
    country: string
  }
  phone: string
  email: string
  website: string
  logo: string | null
  social_media: {
    instagram: string
    facebook: string
    whatsapp: string
  }
}

export interface POSSettings {
  default_customer: string | null
  allow_negative_stock: boolean
  require_customer: boolean
  auto_print_receipt: boolean
  receipt_copies: number
  max_discount_percent: number
  require_discount_reason: boolean
  allow_price_override: boolean
  quick_amounts: number[]
  order_number_format: string
  cash_drawer_enabled: boolean
  hold_orders_enabled: boolean
  kitchen_display_enabled: boolean
}

export interface TaxSettings {
  default_rate: string
  prices_include_tax: boolean
  show_tax_breakdown: boolean
  invoice_required_above: number
  rounding_method: RoundingMethod
}

export interface InventorySettings {
  low_stock_threshold: number
  critical_stock_threshold: number
  auto_reorder: boolean
  expiry_alert_days: number
  track_batches: boolean
  fifo_enabled: boolean
}

export interface LocalizationSettings {
  default_language: 'fr' | 'en' | 'id'
  timezone: string
  currency_code: string
  currency_symbol: string
  currency_position: CurrencyPosition
  decimal_separator: string
  thousands_separator: string
  date_format: string
  time_format: string
}

export interface SecuritySettings {
  session_timeout: number
  require_pin_for_void: boolean
  require_pin_for_discount: boolean
  require_pin_for_refund: boolean
  max_login_attempts: number
  lockout_duration: number
  password_expiry_days: number
  min_password_length: number
  two_factor_enabled: boolean
}

export interface NotificationSettings {
  email_enabled: boolean
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  from_email: string
  low_stock_alerts: boolean
  daily_report: boolean
  daily_report_time: string
  whatsapp_enabled: boolean
}

export interface BackupSettings {
  auto_backup_enabled: boolean
  backup_frequency: BackupFrequency
  backup_time: string
  retention_days: number
  storage_provider: 'local' | 's3' | 'gcs'
  s3_bucket: string
  s3_access_key: string
  s3_secret_key: string
}

export interface AppearanceSettings {
  theme: ThemeMode
  primary_color: string
  sidebar_collapsed: boolean
  compact_mode: boolean
  pos_layout: POSLayout
  pos_columns: number
  show_product_images: boolean
}

// =====================================================
// All Settings Combined
// =====================================================

export interface AllSettings {
  company: CompanySettings
  pos: POSSettings
  tax: TaxSettings
  inventory: InventorySettings
  localization: LocalizationSettings
  security: SecuritySettings
  notifications: NotificationSettings
  backup: BackupSettings
  appearance: AppearanceSettings
}

// =====================================================
// API Response Types
// =====================================================

export interface SettingWithCategory extends Setting {
  category?: SettingsCategory
}

export interface SettingsUpdatePayload {
  key: string
  value: unknown
  reason?: string
}

export interface SettingsBulkUpdatePayload {
  [key: string]: unknown
}
