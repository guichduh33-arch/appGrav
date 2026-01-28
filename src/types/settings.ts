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
export type TerminalMode = 'primary' | 'secondary' | 'self_service' | 'kds_only'
export type KDSStation = 'kitchen' | 'barista' | 'display' | null
export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | null
export type SoundType = 'chime' | 'bell' | 'beep' | 'cash' | 'success' | 'error' | 'none'
export type ProfileType = 'production' | 'test' | 'training' | 'custom'
export type SoundCategory = 'order' | 'payment' | 'error' | 'notification'

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
// POS Advanced Settings (New)
// =====================================================

export interface POSAdvancedSettings {
  cart: {
    lock_on_kitchen_send: boolean
    require_pin_locked_remove: boolean
  }
  rounding: {
    amount: 100 | 500 | 1000
    method: RoundingMethod
  }
  payment: {
    allow_split: boolean
    max_split_count: number
  }
  sound: {
    enabled: boolean
    new_order: SoundType
    payment_success: SoundType
    error: SoundType
  }
  screensaver: {
    enabled: boolean
    timeout: number
    show_clock: boolean
  }
  offline: {
    enabled: boolean
    auto_switch: boolean
    sync_interval: number
    max_offline_orders: number
  }
  customer_display: {
    enabled: boolean
    show_items: boolean
    show_promotions: boolean
    show_logo: boolean
  }
}

// =====================================================
// Module Settings (New)
// =====================================================

export interface ModuleSettings {
  production: {
    enabled: boolean
    auto_consume_stock: boolean
  }
  b2b: {
    enabled: boolean
    min_order_amount: number
    default_payment_terms: number
  }
  purchasing: {
    enabled: boolean
    auto_reorder_threshold: number
  }
  loyalty: {
    enabled: boolean
    points_per_idr: number
    points_expiry_days: number
  }
  kds: {
    enabled: boolean
    auto_acknowledge_delay: number
    sound_new_order: boolean
  }
}

// =====================================================
// Terminal Settings (New)
// =====================================================

export interface TerminalSettings {
  mode: TerminalMode
  default_printer_id: string | null
  kitchen_printer_id: string | null
  kds_station: KDSStation
  allowed_payment_methods: string[]
  default_order_type: OrderType
  floor_plan_id: string | null
  auto_logout_timeout: number | null
}

// =====================================================
// Settings Profile (New)
// =====================================================

export interface SettingsProfile {
  id: string
  name: string
  description: string | null
  profile_type: ProfileType
  settings_snapshot: Record<string, unknown>
  terminal_settings_snapshot: Record<string, unknown>
  is_active: boolean
  is_system: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// =====================================================
// Sound Asset (New)
// =====================================================

export interface SoundAsset {
  id: string
  code: string
  name: string
  category: SoundCategory
  file_path: string | null
  is_system: boolean
  is_active: boolean
  created_at: string
}

// =====================================================
// Terminal Setting Row (New)
// =====================================================

export interface TerminalSettingRow {
  id: string
  terminal_id: string
  key: string
  value: unknown
  created_at: string
  updated_at: string
}

// =====================================================
// All Settings Combined
// =====================================================

export interface AllSettings {
  company: CompanySettings
  pos: POSSettings
  pos_advanced: POSAdvancedSettings
  tax: TaxSettings
  inventory: InventorySettings
  localization: LocalizationSettings
  security: SecuritySettings
  notifications: NotificationSettings
  backup: BackupSettings
  appearance: AppearanceSettings
  modules: ModuleSettings
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
