-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 009: System Settings Module
-- Tables: settings, settings_categories, settings_history, printers, tax_rates, etc.
-- =====================================================

-- =====================================================
-- TABLE: settings_categories
-- =====================================================
CREATE TABLE settings_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    description_id TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    required_permission VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_categories_code ON settings_categories(code);
CREATE INDEX idx_settings_categories_active ON settings_categories(is_active);
CREATE INDEX idx_settings_categories_sort ON settings_categories(sort_order);

-- =====================================================
-- TABLE: settings (key-value)
-- =====================================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES settings_categories(id) ON DELETE CASCADE,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    value_type VARCHAR(20) NOT NULL DEFAULT 'string',
    name_fr VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    name_id VARCHAR(200) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    description_id TEXT,
    default_value JSONB,
    validation_rules JSONB,
    is_sensitive BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    is_readonly BOOLEAN DEFAULT FALSE,
    requires_restart BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category_id);
CREATE INDEX idx_settings_sort ON settings(sort_order);

-- =====================================================
-- TABLE: settings_history
-- =====================================================
CREATE TABLE settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES user_profiles(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    ip_address INET
);

CREATE INDEX idx_settings_history_setting ON settings_history(setting_id);
CREATE INDEX idx_settings_history_changed_at ON settings_history(changed_at DESC);
CREATE INDEX idx_settings_history_changed_by ON settings_history(changed_by);

-- =====================================================
-- TABLE: app_settings (legacy key-value)
-- =====================================================
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: printer_configurations
-- =====================================================
CREATE TABLE printer_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    printer_type VARCHAR(50) NOT NULL,
    connection_type VARCHAR(50) NOT NULL,
    connection_string TEXT,
    paper_width INTEGER DEFAULT 80,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_printer_configurations_type ON printer_configurations(printer_type);
CREATE INDEX idx_printer_configurations_default ON printer_configurations(is_default) WHERE is_default = TRUE;

-- =====================================================
-- TABLE: tax_rates
-- =====================================================
CREATE TABLE tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    is_inclusive BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    applies_to JSONB DEFAULT '["all"]',
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tax_rates_code ON tax_rates(code);
CREATE INDEX idx_tax_rates_default ON tax_rates(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_tax_rates_active ON tax_rates(is_active);

-- =====================================================
-- TABLE: payment_methods
-- =====================================================
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    payment_type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    requires_reference BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_code ON payment_methods(code);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_payment_methods_sort ON payment_methods(sort_order);

-- =====================================================
-- TABLE: business_hours
-- =====================================================
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(day_of_week)
);

CREATE INDEX idx_business_hours_day ON business_hours(day_of_week);

-- =====================================================
-- TABLE: email_templates
-- =====================================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    subject_fr VARCHAR(200),
    subject_en VARCHAR(200),
    subject_id VARCHAR(200),
    body_fr TEXT,
    body_en TEXT,
    body_id TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_templates_code ON email_templates(code);

-- =====================================================
-- TABLE: receipt_templates
-- =====================================================
CREATE TABLE receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(30) NOT NULL,
    header_content TEXT,
    footer_content TEXT,
    show_logo BOOLEAN DEFAULT TRUE,
    show_company_info BOOLEAN DEFAULT TRUE,
    show_tax_details BOOLEAN DEFAULT TRUE,
    show_payment_method BOOLEAN DEFAULT TRUE,
    show_cashier_name BOOLEAN DEFAULT TRUE,
    show_customer_info BOOLEAN DEFAULT FALSE,
    show_loyalty_points BOOLEAN DEFAULT TRUE,
    custom_css TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receipt_templates_type ON receipt_templates(template_type);

-- =====================================================
-- TABLE: terminal_settings
-- =====================================================
CREATE TABLE terminal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(terminal_id, key)
);

CREATE INDEX idx_terminal_settings_terminal ON terminal_settings(terminal_id);

-- =====================================================
-- TABLE: settings_profiles
-- =====================================================
CREATE TABLE settings_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    profile_type VARCHAR(20) DEFAULT 'custom',
    settings_snapshot JSONB DEFAULT '{}',
    terminal_settings_snapshot JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: sound_assets
-- =====================================================
CREATE TABLE sound_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    file_path TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sound_assets_category ON sound_assets(category);
