// Settings Module Types

export type SettingValueType = 'string' | 'number' | 'boolean' | 'json' | 'array' | 'file';

export type PrinterType = 'receipt' | 'label' | 'kitchen' | 'report';
export type ConnectionType = 'usb' | 'network' | 'bluetooth';
export type PaymentType = 'cash' | 'card' | 'transfer' | 'ewallet' | 'other';
export type ReceiptTemplateType = 'receipt' | 'kitchen' | 'label';
export type ThemeMode = 'light' | 'dark' | 'system';
export type CurrencyPosition = 'before' | 'after';
export type RoundingMethod = 'round' | 'floor' | 'ceil';
export type BackupFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type POSLayout = 'grid' | 'list';

// =====================================================
// Settings Category
// =====================================================

export interface SettingsCategory {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description_fr?: string;
  description_en?: string;
  description_id?: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  required_permission?: string;
  created_at: string;
}

// =====================================================
// Setting
// =====================================================

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
}

export interface Setting {
  id: string;
  category_id: string;
  key: string;
  value: unknown;
  value_type: SettingValueType;
  name_fr: string;
  name_en: string;
  name_id: string;
  description_fr?: string;
  description_en?: string;
  description_id?: string;
  default_value?: unknown;
  validation_rules?: ValidationRules;
  is_sensitive: boolean;
  is_system: boolean;
  is_readonly: boolean;
  requires_restart: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// =====================================================
// Settings History
// =====================================================

export interface SettingHistory {
  id: string;
  setting_id: string;
  old_value: unknown;
  new_value: unknown;
  changed_by?: string;
  changed_at: string;
  change_reason?: string;
  ip_address?: string;
}

// =====================================================
// Printer Configuration
// =====================================================

export interface PrinterConfiguration {
  id: string;
  name: string;
  printer_type: PrinterType;
  connection_type: ConnectionType;
  connection_string?: string;
  paper_width: number;
  is_default: boolean;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Tax Rate
// =====================================================

export interface TaxRate {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  rate: number;
  is_inclusive: boolean;
  is_default: boolean;
  is_active: boolean;
  applies_to: string[];
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Payment Method
// =====================================================

export interface PaymentMethod {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  icon: string;
  payment_type: PaymentType;
  is_active: boolean;
  is_default: boolean;
  requires_reference: boolean;
  settings: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Business Hours
// =====================================================

export interface BusinessHours {
  id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  break_start?: string;
  break_end?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Email Template
// =====================================================

export interface EmailTemplate {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  subject_fr?: string;
  subject_en?: string;
  subject_id?: string;
  body_fr?: string;
  body_en?: string;
  body_id?: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Receipt Template
// =====================================================

export interface ReceiptTemplate {
  id: string;
  name: string;
  template_type: ReceiptTemplateType;
  header_content?: string;
  footer_content?: string;
  show_logo: boolean;
  show_company_info: boolean;
  show_tax_details: boolean;
  show_payment_method: boolean;
  show_cashier_name: boolean;
  show_customer_info: boolean;
  show_loyalty_points: boolean;
  custom_css?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Typed Settings Values
// =====================================================

export interface CompanySettings {
  name: string;
  legal_name: string;
  tax_id: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;
  logo: string | null;
  social_media: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
}

export interface POSSettings {
  default_customer: string | null;
  allow_negative_stock: boolean;
  require_customer: boolean;
  auto_print_receipt: boolean;
  receipt_copies: number;
  max_discount_percent: number;
  require_discount_reason: boolean;
  allow_price_override: boolean;
  quick_amounts: number[];
  order_number_format: string;
  cash_drawer_enabled: boolean;
  hold_orders_enabled: boolean;
  kitchen_display_enabled: boolean;
}

export interface TaxSettings {
  default_rate: string;
  prices_include_tax: boolean;
  show_tax_breakdown: boolean;
  invoice_required_above: number;
  rounding_method: RoundingMethod;
}

export interface InventorySettings {
  low_stock_threshold: number;
  critical_stock_threshold: number;
  auto_reorder: boolean;
  expiry_alert_days: number;
  track_batches: boolean;
  fifo_enabled: boolean;
}

export interface LocalizationSettings {
  default_language: 'fr' | 'en' | 'id';
  timezone: string;
  currency_code: string;
  currency_symbol: string;
  currency_position: CurrencyPosition;
  decimal_separator: string;
  thousands_separator: string;
  date_format: string;
  time_format: string;
}

export interface SecuritySettings {
  session_timeout: number;
  require_pin_for_void: boolean;
  require_pin_for_discount: boolean;
  require_pin_for_refund: boolean;
  max_login_attempts: number;
  lockout_duration: number;
  password_expiry_days: number;
  min_password_length: number;
  two_factor_enabled: boolean;
}

export interface NotificationSettings {
  email_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  low_stock_alerts: boolean;
  daily_report: boolean;
  daily_report_time: string;
  whatsapp_enabled: boolean;
}

export interface BackupSettings {
  auto_backup_enabled: boolean;
  backup_frequency: BackupFrequency;
  backup_time: string;
  retention_days: number;
  storage_provider: 'local' | 's3' | 'gcs';
  s3_bucket: string;
  s3_access_key: string;
  s3_secret_key: string;
}

export interface AppearanceSettings {
  theme: ThemeMode;
  primary_color: string;
  sidebar_collapsed: boolean;
  compact_mode: boolean;
  pos_layout: POSLayout;
  pos_columns: number;
  show_product_images: boolean;
}

// =====================================================
// All Settings Combined
// =====================================================

export interface AllSettings {
  company: CompanySettings;
  pos: POSSettings;
  tax: TaxSettings;
  inventory: InventorySettings;
  localization: LocalizationSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  backup: BackupSettings;
  appearance: AppearanceSettings;
}

// =====================================================
// API Response Types
// =====================================================

export interface SettingWithCategory extends Setting {
  category?: SettingsCategory;
}

export interface SettingsUpdatePayload {
  key: string;
  value: unknown;
  reason?: string;
}

export interface SettingsBulkUpdatePayload {
  [key: string]: unknown;
}
