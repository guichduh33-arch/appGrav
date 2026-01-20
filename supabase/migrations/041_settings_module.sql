-- =====================================================
-- Migration 041: Settings Module
-- Description: Centralized configuration system for ERP
-- Date: 2026-01-20
-- Depends on: 040_users_permissions_module.sql (user_has_permission, is_admin functions)
-- =====================================================

-- =====================================================
-- STEP 0: CREATE FALLBACK HELPER FUNCTIONS (if not exists from 040)
-- These will be overwritten when 040 is applied, but allow 041 to work standalone
-- =====================================================

-- Fallback: user_has_permission - returns true for all authenticated users
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_user_id UUID,
    p_permission_code VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    -- Fallback: Check if tables from 040 exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        -- Use proper permission check from 040
        RETURN EXISTS (
            SELECT 1
            FROM public.user_roles ur
            JOIN public.role_permissions rp ON ur.role_id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = p_user_id
            AND p.code = p_permission_code
            AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
            AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
        );
    ELSE
        -- Fallback: allow all authenticated users if permission system not yet deployed
        RETURN p_user_id IS NOT NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fallback: is_admin - returns true for authenticated users (will be properly restricted by 040)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Fallback: Check if tables from 040 exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        -- Use proper admin check from 040
        RETURN EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = p_user_id
            AND r.code IN ('SUPER_ADMIN', 'ADMIN')
            AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
            AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
        );
    ELSE
        -- Fallback: allow all authenticated users if permission system not yet deployed
        RETURN p_user_id IS NOT NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 1: SETTINGS CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.settings_categories (
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
    is_active BOOLEAN DEFAULT true,
    required_permission VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: SETTINGS TABLE (Key-Value with metadata)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.settings_categories(id) ON DELETE CASCADE,
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
    is_sensitive BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    is_readonly BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id)
);

-- =====================================================
-- STEP 3: SETTINGS HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID NOT NULL REFERENCES public.settings(id) ON DELETE CASCADE,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES public.user_profiles(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    ip_address INET
);

-- =====================================================
-- STEP 4: PRINTER CONFIGURATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.printer_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    printer_type VARCHAR(50) NOT NULL, -- receipt, label, kitchen, report
    connection_type VARCHAR(50) NOT NULL, -- usb, network, bluetooth
    connection_string TEXT,
    paper_width INTEGER DEFAULT 80,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 5: TAX RATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    is_inclusive BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    applies_to JSONB DEFAULT '["all"]',
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 6: PAYMENT METHODS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    payment_type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    requires_reference BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 7: BUSINESS HOURS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(day_of_week)
);

-- =====================================================
-- STEP 8: EMAIL TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
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
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 9: RECEIPT TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.receipt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(30) NOT NULL,
    header_content TEXT,
    footer_content TEXT,
    show_logo BOOLEAN DEFAULT true,
    show_company_info BOOLEAN DEFAULT true,
    show_tax_details BOOLEAN DEFAULT true,
    show_payment_method BOOLEAN DEFAULT true,
    show_cashier_name BOOLEAN DEFAULT true,
    show_customer_info BOOLEAN DEFAULT false,
    show_loyalty_points BOOLEAN DEFAULT true,
    custom_css TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 10: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_settings_categories_code ON public.settings_categories(code);
CREATE INDEX IF NOT EXISTS idx_settings_categories_active ON public.settings_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_settings_categories_sort ON public.settings_categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category_id);
CREATE INDEX IF NOT EXISTS idx_settings_sort ON public.settings(sort_order);

CREATE INDEX IF NOT EXISTS idx_settings_history_setting ON public.settings_history(setting_id);
CREATE INDEX IF NOT EXISTS idx_settings_history_changed_at ON public.settings_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_history_changed_by ON public.settings_history(changed_by);

CREATE INDEX IF NOT EXISTS idx_printer_configurations_type ON public.printer_configurations(printer_type);
CREATE INDEX IF NOT EXISTS idx_printer_configurations_default ON public.printer_configurations(is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_tax_rates_code ON public.tax_rates(code);
CREATE INDEX IF NOT EXISTS idx_tax_rates_default ON public.tax_rates(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON public.tax_rates(is_active);

CREATE INDEX IF NOT EXISTS idx_payment_methods_code ON public.payment_methods(code);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON public.payment_methods(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_sort ON public.payment_methods(sort_order);

CREATE INDEX IF NOT EXISTS idx_business_hours_day ON public.business_hours(day_of_week);

CREATE INDEX IF NOT EXISTS idx_email_templates_code ON public.email_templates(code);
CREATE INDEX IF NOT EXISTS idx_receipt_templates_type ON public.receipt_templates(template_type);

-- =====================================================
-- STEP 11: INSERT DEFAULT CATEGORIES
-- =====================================================

INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, required_permission) VALUES
    ('company', 'Entreprise', 'Company', 'Perusahaan', 'Informations et paramètres de l''entreprise', 'Company information and settings', 'Informasi dan pengaturan perusahaan', 'Building2', 10, 'settings.view'),
    ('pos', 'Point de Vente', 'Point of Sale', 'Titik Penjualan', 'Configuration de la caisse et des ventes', 'POS and sales configuration', 'Konfigurasi kasir dan penjualan', 'ShoppingCart', 20, 'settings.view'),
    ('tax', 'Fiscalité', 'Taxation', 'Perpajakan', 'Gestion des taxes et TVA', 'Tax and VAT management', 'Manajemen pajak dan PPN', 'Receipt', 30, 'settings.view'),
    ('inventory', 'Inventaire', 'Inventory', 'Inventaris', 'Paramètres de gestion des stocks', 'Stock management settings', 'Pengaturan manajemen stok', 'Package', 40, 'settings.view'),
    ('printing', 'Impression', 'Printing', 'Pencetakan', 'Configuration des imprimantes et tickets', 'Printer and receipt configuration', 'Konfigurasi printer dan struk', 'Printer', 50, 'settings.view'),
    ('notifications', 'Notifications', 'Notifications', 'Notifikasi', 'Paramètres des emails et alertes', 'Email and alert settings', 'Pengaturan email dan peringatan', 'Bell', 60, 'settings.view'),
    ('localization', 'Localisation', 'Localization', 'Lokalisasi', 'Langue, devise et formats', 'Language, currency and formats', 'Bahasa, mata uang dan format', 'Globe', 70, 'settings.view'),
    ('security', 'Sécurité', 'Security', 'Keamanan', 'Paramètres de sécurité et authentification', 'Security and authentication settings', 'Pengaturan keamanan dan autentikasi', 'Shield', 80, 'settings.update'),
    ('integrations', 'Intégrations', 'Integrations', 'Integrasi', 'Connexions aux services externes', 'External service connections', 'Koneksi ke layanan eksternal', 'Plug', 90, 'settings.update'),
    ('backup', 'Sauvegarde', 'Backup', 'Cadangan', 'Configuration des sauvegardes', 'Backup configuration', 'Konfigurasi cadangan', 'Database', 100, 'settings.backup'),
    ('appearance', 'Apparence', 'Appearance', 'Tampilan', 'Thème et personnalisation visuelle', 'Theme and visual customization', 'Tema dan kustomisasi visual', 'Palette', 110, 'settings.view'),
    ('advanced', 'Avancé', 'Advanced', 'Lanjutan', 'Paramètres avancés et maintenance', 'Advanced settings and maintenance', 'Pengaturan lanjutan dan pemeliharaan', 'Settings2', 999, 'settings.update')
ON CONFLICT (code) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_en = EXCLUDED.name_en,
    name_id = EXCLUDED.name_id,
    description_fr = EXCLUDED.description_fr,
    description_en = EXCLUDED.description_en,
    description_id = EXCLUDED.description_id,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    required_permission = EXCLUDED.required_permission;

-- =====================================================
-- STEP 12: INSERT DEFAULT SETTINGS - COMPANY
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.name', '"The Breakery Lombok"', 'string', 'Nom de l''entreprise', 'Company Name', 'Nama Perusahaan', 'Nom commercial affiché', 'Business name displayed', 'Nama bisnis yang ditampilkan', '"The Breakery Lombok"', 10),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.legal_name', '"PT. The Breakery Lombok"', 'string', 'Raison sociale', 'Legal Name', 'Nama Hukum', 'Nom légal pour les factures', 'Legal name for invoices', 'Nama hukum untuk faktur', '"PT. The Breakery Lombok"', 20),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.tax_id', '""', 'string', 'NPWP', 'Tax ID (NPWP)', 'NPWP', 'Numéro d''identification fiscale', 'Tax identification number', 'Nomor pokok wajib pajak', '""', 30),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.address', '{"line1": "", "line2": "", "city": "Lombok", "province": "NTB", "postal_code": "", "country": "Indonesia"}', 'json', 'Adresse', 'Address', 'Alamat', 'Adresse complète de l''entreprise', 'Complete company address', 'Alamat lengkap perusahaan', '{"line1": "", "line2": "", "city": "Lombok", "province": "NTB", "postal_code": "", "country": "Indonesia"}', 40),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.phone', '""', 'string', 'Téléphone', 'Phone', 'Telepon', 'Numéro de téléphone principal', 'Main phone number', 'Nomor telepon utama', '""', 50),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.email', '""', 'string', 'Email', 'Email', 'Email', 'Adresse email de contact', 'Contact email address', 'Alamat email kontak', '""', 60),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.website', '""', 'string', 'Site web', 'Website', 'Situs Web', 'URL du site web', 'Website URL', 'URL situs web', '""', 70),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.logo', 'null', 'file', 'Logo', 'Logo', 'Logo', 'Logo de l''entreprise', 'Company logo', 'Logo perusahaan', 'null', 80),
    ((SELECT id FROM settings_categories WHERE code = 'company'), 'company.social_media', '{"instagram": "", "facebook": "", "whatsapp": ""}', 'json', 'Réseaux sociaux', 'Social Media', 'Media Sosial', 'Liens vers les réseaux sociaux', 'Social media links', 'Tautan media sosial', '{"instagram": "", "facebook": "", "whatsapp": ""}', 90)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 13: INSERT DEFAULT SETTINGS - POS
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, validation_rules, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.default_customer', 'null', 'string', 'Client par défaut', 'Default Customer', 'Pelanggan Default', 'Client utilisé si non sélectionné', 'Customer used if none selected', 'Pelanggan yang digunakan jika tidak ada yang dipilih', NULL, 'null', 10),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.allow_negative_stock', 'false', 'boolean', 'Autoriser stock négatif', 'Allow Negative Stock', 'Izinkan Stok Negatif', 'Permettre les ventes avec stock insuffisant', 'Allow sales with insufficient stock', 'Izinkan penjualan dengan stok tidak cukup', NULL, 'false', 20),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.require_customer', 'false', 'boolean', 'Client obligatoire', 'Require Customer', 'Wajib Pelanggan', 'Exiger la sélection d''un client', 'Require customer selection', 'Wajib memilih pelanggan', NULL, 'false', 30),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.auto_print_receipt', 'true', 'boolean', 'Impression auto ticket', 'Auto Print Receipt', 'Cetak Otomatis Struk', 'Imprimer automatiquement après paiement', 'Print automatically after payment', 'Cetak otomatis setelah pembayaran', NULL, 'true', 40),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.receipt_copies', '1', 'number', 'Copies ticket', 'Receipt Copies', 'Jumlah Salinan Struk', 'Nombre de copies à imprimer', 'Number of copies to print', 'Jumlah salinan yang dicetak', '{"min": 1, "max": 5}', '1', 50),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.max_discount_percent', '100', 'number', 'Remise max (%)', 'Max Discount (%)', 'Diskon Maks (%)', 'Pourcentage maximum de remise autorisé', 'Maximum discount percentage allowed', 'Persentase diskon maksimum yang diizinkan', '{"min": 0, "max": 100}', '100', 60),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.require_discount_reason', 'true', 'boolean', 'Motif remise obligatoire', 'Require Discount Reason', 'Wajib Alasan Diskon', 'Exiger un motif pour les remises', 'Require a reason for discounts', 'Wajib alasan untuk diskon', NULL, 'true', 70),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.allow_price_override', 'false', 'boolean', 'Modification prix', 'Allow Price Override', 'Izinkan Ubah Harga', 'Permettre la modification des prix', 'Allow price modification', 'Izinkan modifikasi harga', NULL, 'false', 80),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.quick_amounts', '[10000, 20000, 50000, 100000]', 'array', 'Montants rapides', 'Quick Amounts', 'Jumlah Cepat', 'Montants prédéfinis pour paiement rapide', 'Predefined amounts for quick payment', 'Jumlah yang telah ditentukan untuk pembayaran cepat', NULL, '[10000, 20000, 50000, 100000]', 90),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.order_number_format', '"ORD-{YYYY}{MM}{DD}-{####}"', 'string', 'Format n° commande', 'Order Number Format', 'Format No. Pesanan', 'Format du numéro de commande', 'Order number format', 'Format nomor pesanan', NULL, '"ORD-{YYYY}{MM}{DD}-{####}"', 100),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.cash_drawer_enabled', 'true', 'boolean', 'Tiroir-caisse', 'Cash Drawer', 'Laci Uang', 'Activer le tiroir-caisse', 'Enable cash drawer', 'Aktifkan laci uang', NULL, 'true', 110),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.hold_orders_enabled', 'true', 'boolean', 'Commandes en attente', 'Hold Orders', 'Simpan Pesanan', 'Permettre les commandes en attente', 'Allow held orders', 'Izinkan pesanan tertunda', NULL, 'true', 120),
    ((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.kitchen_display_enabled', 'false', 'boolean', 'Écran cuisine', 'Kitchen Display', 'Layar Dapur', 'Activer l''affichage cuisine', 'Enable kitchen display', 'Aktifkan tampilan dapur', NULL, 'false', 130)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 14: INSERT DEFAULT SETTINGS - TAX
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.default_rate', '"PPN_10"', 'string', 'Taux par défaut', 'Default Tax Rate', 'Tarif Pajak Default', 'Taux de taxe appliqué par défaut', 'Default tax rate applied', 'Tarif pajak yang diterapkan secara default', '"PPN_10"', 10),
    ((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.prices_include_tax', 'true', 'boolean', 'Prix TTC', 'Prices Include Tax', 'Harga Termasuk Pajak', 'Les prix affichés incluent la taxe', 'Displayed prices include tax', 'Harga yang ditampilkan termasuk pajak', 'true', 20),
    ((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.show_tax_breakdown', 'true', 'boolean', 'Détail taxes', 'Show Tax Breakdown', 'Tampilkan Rincian Pajak', 'Afficher le détail des taxes sur le ticket', 'Show tax breakdown on receipt', 'Tampilkan rincian pajak di struk', 'true', 30),
    ((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.invoice_required_above', '50000000', 'number', 'Facture obligatoire (IDR)', 'Invoice Required Above', 'Faktur Wajib Di Atas', 'Montant au-dessus duquel la facture est obligatoire', 'Amount above which invoice is required', 'Jumlah di atas mana faktur diperlukan', '50000000', 40),
    ((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.rounding_method', '"round"', 'string', 'Méthode arrondi', 'Rounding Method', 'Metode Pembulatan', 'Méthode d''arrondi des montants', 'Amount rounding method', 'Metode pembulatan jumlah', '"round"', 50)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 15: INSERT DEFAULT TAX RATES
-- =====================================================

INSERT INTO public.tax_rates (code, name_fr, name_en, name_id, rate, is_inclusive, is_default, is_active) VALUES
    ('PPN_10', 'PPN 10%', 'VAT 10%', 'PPN 10%', 10.00, true, true, true),
    ('PPN_11', 'PPN 11%', 'VAT 11%', 'PPN 11%', 11.00, true, false, true),
    ('EXEMPT', 'Exonéré', 'Tax Exempt', 'Bebas Pajak', 0.00, true, false, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- STEP 16: INSERT DEFAULT PAYMENT METHODS
-- =====================================================

INSERT INTO public.payment_methods (code, name_fr, name_en, name_id, payment_type, icon, is_default, requires_reference, sort_order) VALUES
    ('CASH', 'Espèces', 'Cash', 'Tunai', 'cash', 'Banknote', true, false, 10),
    ('CARD_DEBIT', 'Carte Débit', 'Debit Card', 'Kartu Debit', 'card', 'CreditCard', false, true, 20),
    ('CARD_CREDIT', 'Carte Crédit', 'Credit Card', 'Kartu Kredit', 'card', 'CreditCard', false, true, 30),
    ('TRANSFER', 'Virement', 'Bank Transfer', 'Transfer Bank', 'transfer', 'Building', false, true, 40),
    ('GOPAY', 'GoPay', 'GoPay', 'GoPay', 'ewallet', 'Wallet', false, false, 50),
    ('OVO', 'OVO', 'OVO', 'OVO', 'ewallet', 'Wallet', false, false, 60),
    ('DANA', 'DANA', 'DANA', 'DANA', 'ewallet', 'Wallet', false, false, 70),
    ('QRIS', 'QRIS', 'QRIS', 'QRIS', 'ewallet', 'QrCode', false, false, 80)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- STEP 17: INSERT DEFAULT SETTINGS - INVENTORY
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, validation_rules, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.low_stock_threshold', '10', 'number', 'Seuil stock bas', 'Low Stock Threshold', 'Ambang Stok Rendah', 'Seuil d''alerte de stock bas', 'Low stock alert threshold', 'Ambang peringatan stok rendah', '{"min": 1}', '10', 10),
    ((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.critical_stock_threshold', '5', 'number', 'Seuil stock critique', 'Critical Stock Threshold', 'Ambang Stok Kritis', 'Seuil d''alerte de stock critique', 'Critical stock alert threshold', 'Ambang peringatan stok kritis', '{"min": 0}', '5', 20),
    ((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.auto_reorder', 'false', 'boolean', 'Réappro auto', 'Auto Reorder', 'Pesan Ulang Otomatis', 'Créer automatiquement des commandes de réapprovisionnement', 'Automatically create reorder purchase orders', 'Buat pesanan pembelian ulang secara otomatis', NULL, 'false', 30),
    ((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.expiry_alert_days', '7', 'number', 'Alerte péremption (jours)', 'Expiry Alert Days', 'Peringatan Kadaluarsa (hari)', 'Jours avant péremption pour alerte', 'Days before expiry for alert', 'Hari sebelum kadaluarsa untuk peringatan', '{"min": 1, "max": 90}', '7', 40),
    ((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.track_batches', 'true', 'boolean', 'Suivi lots', 'Track Batches', 'Lacak Batch', 'Activer le suivi par lot', 'Enable batch tracking', 'Aktifkan pelacakan batch', NULL, 'true', 50),
    ((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.fifo_enabled', 'true', 'boolean', 'FIFO activé', 'FIFO Enabled', 'FIFO Aktif', 'Utiliser la méthode FIFO', 'Use FIFO method', 'Gunakan metode FIFO', NULL, 'true', 60)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 18: INSERT DEFAULT SETTINGS - LOCALIZATION
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, validation_rules, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.default_language', '"id"', 'string', 'Langue par défaut', 'Default Language', 'Bahasa Default', 'Langue par défaut de l''interface', 'Default interface language', 'Bahasa antarmuka default', '{"options": ["fr", "en", "id"]}', '"id"', 10),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.timezone', '"Asia/Makassar"', 'string', 'Fuseau horaire', 'Timezone', 'Zona Waktu', 'Fuseau horaire de l''application', 'Application timezone', 'Zona waktu aplikasi', NULL, '"Asia/Makassar"', 20),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.currency_code', '"IDR"', 'string', 'Code devise', 'Currency Code', 'Kode Mata Uang', 'Code ISO de la devise', 'Currency ISO code', 'Kode ISO mata uang', NULL, '"IDR"', 30),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.currency_symbol', '"Rp"', 'string', 'Symbole devise', 'Currency Symbol', 'Simbol Mata Uang', 'Symbole de la devise', 'Currency symbol', 'Simbol mata uang', NULL, '"Rp"', 40),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.currency_position', '"before"', 'string', 'Position devise', 'Currency Position', 'Posisi Mata Uang', 'Position du symbole monétaire', 'Currency symbol position', 'Posisi simbol mata uang', '{"options": ["before", "after"]}', '"before"', 50),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.decimal_separator', '","', 'string', 'Séparateur décimal', 'Decimal Separator', 'Pemisah Desimal', 'Séparateur pour les décimales', 'Decimal separator', 'Pemisah desimal', NULL, '","', 60),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.thousands_separator', '"."', 'string', 'Séparateur milliers', 'Thousands Separator', 'Pemisah Ribuan', 'Séparateur pour les milliers', 'Thousands separator', 'Pemisah ribuan', NULL, '"."', 70),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.date_format', '"DD/MM/YYYY"', 'string', 'Format date', 'Date Format', 'Format Tanggal', 'Format d''affichage des dates', 'Date display format', 'Format tampilan tanggal', NULL, '"DD/MM/YYYY"', 80),
    ((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.time_format', '"HH:mm"', 'string', 'Format heure', 'Time Format', 'Format Waktu', 'Format d''affichage de l''heure', 'Time display format', 'Format tampilan waktu', '{"options": ["HH:mm", "hh:mm A"]}', '"HH:mm"', 90)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 19: INSERT DEFAULT SETTINGS - SECURITY
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, validation_rules, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.session_timeout', '480', 'number', 'Expiration session (min)', 'Session Timeout (min)', 'Timeout Sesi (menit)', 'Durée d''inactivité avant déconnexion', 'Inactivity duration before logout', 'Durasi tidak aktif sebelum keluar', '{"min": 15, "max": 1440}', '480', 10),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.require_pin_for_void', 'true', 'boolean', 'PIN pour annulation', 'Require PIN for Void', 'Wajib PIN untuk Batal', 'Exiger un PIN pour annuler une vente', 'Require PIN to void a sale', 'Wajib PIN untuk membatalkan penjualan', NULL, 'true', 20),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.require_pin_for_discount', 'true', 'boolean', 'PIN pour remise', 'Require PIN for Discount', 'Wajib PIN untuk Diskon', 'Exiger un PIN pour appliquer une remise', 'Require PIN to apply discount', 'Wajib PIN untuk menerapkan diskon', NULL, 'true', 30),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.require_pin_for_refund', 'true', 'boolean', 'PIN pour remboursement', 'Require PIN for Refund', 'Wajib PIN untuk Pengembalian', 'Exiger un PIN pour effectuer un remboursement', 'Require PIN to process refund', 'Wajib PIN untuk memproses pengembalian', NULL, 'true', 40),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.max_login_attempts', '5', 'number', 'Tentatives connexion max', 'Max Login Attempts', 'Maks Percobaan Login', 'Nombre maximum de tentatives de connexion', 'Maximum login attempts', 'Jumlah maksimum percobaan login', '{"min": 3, "max": 10}', '5', 50),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.lockout_duration', '30', 'number', 'Durée verrouillage (min)', 'Lockout Duration (min)', 'Durasi Kunci (menit)', 'Durée de verrouillage après échecs', 'Lockout duration after failures', 'Durasi kunci setelah kegagalan', '{"min": 5, "max": 1440}', '30', 60),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.password_expiry_days', '90', 'number', 'Expiration mdp (jours)', 'Password Expiry (days)', 'Kadaluarsa Kata Sandi (hari)', 'Jours avant expiration du mot de passe', 'Days before password expires', 'Hari sebelum kata sandi kadaluarsa', '{"min": 0, "max": 365}', '90', 70),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.min_password_length', '8', 'number', 'Longueur min mdp', 'Min Password Length', 'Panjang Min Kata Sandi', 'Longueur minimale du mot de passe', 'Minimum password length', 'Panjang minimum kata sandi', '{"min": 6, "max": 32}', '8', 80),
    ((SELECT id FROM settings_categories WHERE code = 'security'), 'security.two_factor_enabled', 'false', 'boolean', '2FA activé', '2FA Enabled', '2FA Aktif', 'Activer l''authentification à deux facteurs', 'Enable two-factor authentication', 'Aktifkan autentikasi dua faktor', NULL, 'false', 90)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 20: INSERT DEFAULT SETTINGS - NOTIFICATIONS
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, is_sensitive, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.email_enabled', 'true', 'boolean', 'Emails activés', 'Emails Enabled', 'Email Aktif', 'Activer l''envoi d''emails', 'Enable email sending', 'Aktifkan pengiriman email', false, 'true', 10),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_host', '""', 'string', 'Serveur SMTP', 'SMTP Host', 'Host SMTP', 'Adresse du serveur SMTP', 'SMTP server address', 'Alamat server SMTP', false, '""', 20),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_port', '587', 'number', 'Port SMTP', 'SMTP Port', 'Port SMTP', 'Port du serveur SMTP', 'SMTP server port', 'Port server SMTP', false, '587', 30),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_user', '""', 'string', 'Utilisateur SMTP', 'SMTP User', 'Pengguna SMTP', 'Nom d''utilisateur SMTP', 'SMTP username', 'Nama pengguna SMTP', false, '""', 40),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_password', '""', 'string', 'Mot de passe SMTP', 'SMTP Password', 'Kata Sandi SMTP', 'Mot de passe SMTP', 'SMTP password', 'Kata sandi SMTP', true, '""', 50),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.from_email', '""', 'string', 'Email expéditeur', 'From Email', 'Email Pengirim', 'Adresse email d''expédition', 'Sender email address', 'Alamat email pengirim', false, '""', 60),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.low_stock_alerts', 'true', 'boolean', 'Alertes stock bas', 'Low Stock Alerts', 'Peringatan Stok Rendah', 'Recevoir les alertes de stock bas', 'Receive low stock alerts', 'Terima peringatan stok rendah', false, 'true', 70),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.daily_report', 'true', 'boolean', 'Rapport quotidien', 'Daily Report', 'Laporan Harian', 'Recevoir le rapport quotidien', 'Receive daily report', 'Terima laporan harian', false, 'true', 80),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.daily_report_time', '"21:00"', 'string', 'Heure rapport', 'Report Time', 'Waktu Laporan', 'Heure d''envoi du rapport quotidien', 'Daily report sending time', 'Waktu pengiriman laporan harian', false, '"21:00"', 90),
    ((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.whatsapp_enabled', 'false', 'boolean', 'WhatsApp activé', 'WhatsApp Enabled', 'WhatsApp Aktif', 'Activer les notifications WhatsApp', 'Enable WhatsApp notifications', 'Aktifkan notifikasi WhatsApp', false, 'false', 100)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 21: INSERT DEFAULT SETTINGS - BACKUP
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, is_sensitive, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.auto_backup_enabled', 'true', 'boolean', 'Sauvegarde auto', 'Auto Backup', 'Cadangan Otomatis', 'Activer la sauvegarde automatique', 'Enable automatic backup', 'Aktifkan cadangan otomatis', false, 'true', 10),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.backup_frequency', '"daily"', 'string', 'Fréquence', 'Frequency', 'Frekuensi', 'Fréquence des sauvegardes', 'Backup frequency', 'Frekuensi cadangan', false, '"daily"', 20),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.backup_time', '"02:00"', 'string', 'Heure sauvegarde', 'Backup Time', 'Waktu Cadangan', 'Heure de la sauvegarde automatique', 'Automatic backup time', 'Waktu cadangan otomatis', false, '"02:00"', 30),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.retention_days', '30', 'number', 'Rétention (jours)', 'Retention (days)', 'Retensi (hari)', 'Durée de conservation des sauvegardes', 'Backup retention period', 'Periode retensi cadangan', false, '30', 40),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.storage_provider', '"local"', 'string', 'Stockage', 'Storage Provider', 'Penyedia Penyimpanan', 'Emplacement de stockage des sauvegardes', 'Backup storage location', 'Lokasi penyimpanan cadangan', false, '"local"', 50),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.s3_bucket', '""', 'string', 'Bucket S3', 'S3 Bucket', 'Bucket S3', 'Nom du bucket S3', 'S3 bucket name', 'Nama bucket S3', false, '""', 60),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.s3_access_key', '""', 'string', 'Clé accès S3', 'S3 Access Key', 'Kunci Akses S3', 'Clé d''accès AWS S3', 'AWS S3 access key', 'Kunci akses AWS S3', true, '""', 70),
    ((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.s3_secret_key', '""', 'string', 'Clé secrète S3', 'S3 Secret Key', 'Kunci Rahasia S3', 'Clé secrète AWS S3', 'AWS S3 secret key', 'Kunci rahasia AWS S3', true, '""', 80)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 22: INSERT DEFAULT SETTINGS - APPEARANCE
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, validation_rules, default_value, sort_order) VALUES
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.theme', '"light"', 'string', 'Thème', 'Theme', 'Tema', 'Thème de l''interface', 'Interface theme', 'Tema antarmuka', '{"options": ["light", "dark", "system"]}', '"light"', 10),
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.primary_color', '"#2563eb"', 'string', 'Couleur principale', 'Primary Color', 'Warna Utama', 'Couleur principale de l''interface', 'Main interface color', 'Warna utama antarmuka', NULL, '"#2563eb"', 20),
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.sidebar_collapsed', 'false', 'boolean', 'Sidebar réduite', 'Collapsed Sidebar', 'Sidebar Diciutkan', 'Réduire la barre latérale par défaut', 'Collapse sidebar by default', 'Ciutkan sidebar secara default', NULL, 'false', 30),
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.compact_mode', 'false', 'boolean', 'Mode compact', 'Compact Mode', 'Mode Kompak', 'Activer le mode compact', 'Enable compact mode', 'Aktifkan mode kompak', NULL, 'false', 40),
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.pos_layout', '"grid"', 'string', 'Disposition POS', 'POS Layout', 'Tata Letak POS', 'Disposition de l''interface POS', 'POS interface layout', 'Tata letak antarmuka POS', '{"options": ["grid", "list"]}', '"grid"', 50),
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.pos_columns', '4', 'number', 'Colonnes POS', 'POS Columns', 'Kolom POS', 'Nombre de colonnes dans le POS', 'Number of columns in POS', 'Jumlah kolom di POS', '{"min": 2, "max": 8}', '4', 60),
    ((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.show_product_images', 'true', 'boolean', 'Images produits', 'Show Product Images', 'Tampilkan Gambar Produk', 'Afficher les images des produits', 'Show product images', 'Tampilkan gambar produk', NULL, 'true', 70)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 23: INSERT DEFAULT BUSINESS HOURS
-- =====================================================

INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_closed) VALUES
    (0, '07:00', '21:00', false),
    (1, '07:00', '21:00', false),
    (2, '07:00', '21:00', false),
    (3, '07:00', '21:00', false),
    (4, '07:00', '21:00', false),
    (5, '07:00', '21:00', false),
    (6, '07:00', '21:00', false)
ON CONFLICT (day_of_week) DO NOTHING;

-- =====================================================
-- STEP 24: INSERT DEFAULT EMAIL TEMPLATES
-- =====================================================

INSERT INTO public.email_templates (code, name_fr, name_en, name_id, subject_fr, subject_en, subject_id, variables) VALUES
    ('welcome', 'Bienvenue', 'Welcome', 'Selamat Datang', 'Bienvenue chez The Breakery Lombok!', 'Welcome to The Breakery Lombok!', 'Selamat Datang di The Breakery Lombok!', '["customer_name", "company_name"]'),
    ('order_confirmation', 'Confirmation commande', 'Order Confirmation', 'Konfirmasi Pesanan', 'Confirmation de votre commande #{order_number}', 'Your order #{order_number} confirmation', 'Konfirmasi pesanan Anda #{order_number}', '["order_number", "customer_name", "total", "items"]'),
    ('password_reset', 'Réinitialisation mot de passe', 'Password Reset', 'Reset Kata Sandi', 'Réinitialisation de votre mot de passe', 'Reset your password', 'Reset kata sandi Anda', '["user_name", "reset_link"]'),
    ('low_stock_alert', 'Alerte stock bas', 'Low Stock Alert', 'Peringatan Stok Rendah', 'Alerte: Stock bas pour {product_name}', 'Alert: Low stock for {product_name}', 'Peringatan: Stok rendah untuk {product_name}', '["product_name", "current_stock", "min_stock"]'),
    ('daily_report', 'Rapport journalier', 'Daily Report', 'Laporan Harian', 'Rapport journalier du {date}', 'Daily report for {date}', 'Laporan harian untuk {date}', '["date", "total_sales", "transactions_count"]')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- STEP 25: INSERT DEFAULT RECEIPT TEMPLATE
-- =====================================================

INSERT INTO public.receipt_templates (name, template_type, header_content, footer_content, is_default, is_active) VALUES
    ('Standard Receipt', 'receipt', 'THE BREAKERY LOMBOK\nFrench Bakery & Cafe', 'Terima kasih atas kunjungan Anda!\nThank you for your visit!\nMerci de votre visite!', true, true),
    ('Kitchen Order', 'kitchen', NULL, NULL, false, true),
    ('Label', 'label', NULL, NULL, false, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 26: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_templates ENABLE ROW LEVEL SECURITY;

-- Settings categories: anyone authenticated can read
CREATE POLICY "View active settings categories" ON public.settings_categories
    FOR SELECT USING (is_active = true);

-- Settings: view with permission, update with permission
CREATE POLICY "View settings" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Update settings" ON public.settings
    FOR UPDATE USING (
        public.user_has_permission(auth.uid(), 'settings.update')
        AND is_system = false
        AND is_readonly = false
    );

-- Settings history: admins only
CREATE POLICY "Admins view settings history" ON public.settings_history
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System insert settings history" ON public.settings_history
    FOR INSERT WITH CHECK (true);

-- Printer configurations
CREATE POLICY "View printers" ON public.printer_configurations
    FOR SELECT USING (true);

CREATE POLICY "Manage printers" ON public.printer_configurations
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- Tax rates
CREATE POLICY "View tax rates" ON public.tax_rates
    FOR SELECT USING (true);

CREATE POLICY "Manage tax rates" ON public.tax_rates
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- Payment methods
CREATE POLICY "View payment methods" ON public.payment_methods
    FOR SELECT USING (true);

CREATE POLICY "Manage payment methods" ON public.payment_methods
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- Business hours
CREATE POLICY "View business hours" ON public.business_hours
    FOR SELECT USING (true);

CREATE POLICY "Manage business hours" ON public.business_hours
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- Email templates
CREATE POLICY "View email templates" ON public.email_templates
    FOR SELECT USING (true);

CREATE POLICY "Manage email templates" ON public.email_templates
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- Receipt templates
CREATE POLICY "View receipt templates" ON public.receipt_templates
    FOR SELECT USING (true);

CREATE POLICY "Manage receipt templates" ON public.receipt_templates
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- =====================================================
-- STEP 27: FUNCTIONS
-- =====================================================

-- Trigger: Log setting changes
CREATE OR REPLACE FUNCTION public.log_setting_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.value IS DISTINCT FROM NEW.value THEN
        INSERT INTO public.settings_history (setting_id, old_value, new_value, changed_by)
        VALUES (NEW.id, OLD.value, NEW.value, auth.uid());
        NEW.updated_at = NOW();
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_setting_changes ON public.settings;
CREATE TRIGGER log_setting_changes
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.log_setting_change();

-- Function: Get a single setting value
CREATE OR REPLACE FUNCTION public.get_setting(p_key VARCHAR)
RETURNS JSONB AS $$
    SELECT value FROM public.settings WHERE key = p_key;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function: Get settings by category
CREATE OR REPLACE FUNCTION public.get_settings_by_category(p_category_code VARCHAR)
RETURNS TABLE (
    key VARCHAR,
    value JSONB,
    value_type VARCHAR,
    name_fr VARCHAR,
    name_en VARCHAR,
    name_id VARCHAR,
    is_sensitive BOOLEAN,
    validation_rules JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.key::VARCHAR,
        CASE WHEN s.is_sensitive THEN '""'::JSONB ELSE s.value END,
        s.value_type::VARCHAR,
        s.name_fr::VARCHAR,
        s.name_en::VARCHAR,
        s.name_id::VARCHAR,
        s.is_sensitive,
        s.validation_rules
    FROM public.settings s
    JOIN public.settings_categories c ON s.category_id = c.id
    WHERE c.code = p_category_code
    ORDER BY s.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Update setting with validation
CREATE OR REPLACE FUNCTION public.update_setting(p_key VARCHAR, p_value JSONB, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_setting RECORD;
    v_validation JSONB;
    v_num_value NUMERIC;
BEGIN
    -- Get setting
    SELECT * INTO v_setting FROM public.settings WHERE key = p_key;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Setting not found: %', p_key;
    END IF;

    IF v_setting.is_system OR v_setting.is_readonly THEN
        RAISE EXCEPTION 'Setting is not modifiable: %', p_key;
    END IF;

    -- Validate based on rules
    v_validation := v_setting.validation_rules;

    IF v_validation IS NOT NULL AND v_setting.value_type = 'number' THEN
        v_num_value := (p_value #>> '{}')::NUMERIC;

        IF v_validation->>'min' IS NOT NULL AND v_num_value < (v_validation->>'min')::NUMERIC THEN
            RAISE EXCEPTION 'Value % is below minimum %', v_num_value, v_validation->>'min';
        END IF;

        IF v_validation->>'max' IS NOT NULL AND v_num_value > (v_validation->>'max')::NUMERIC THEN
            RAISE EXCEPTION 'Value % is above maximum %', v_num_value, v_validation->>'max';
        END IF;
    END IF;

    IF v_validation IS NOT NULL AND v_validation->'options' IS NOT NULL THEN
        IF NOT (p_value #>> '{}') = ANY(ARRAY(SELECT jsonb_array_elements_text(v_validation->'options'))) THEN
            RAISE EXCEPTION 'Value must be one of: %', v_validation->'options';
        END IF;
    END IF;

    -- Update the setting
    UPDATE public.settings SET value = p_value WHERE key = p_key;

    -- Update history with reason if provided
    IF p_reason IS NOT NULL THEN
        UPDATE public.settings_history
        SET change_reason = p_reason
        WHERE setting_id = v_setting.id
        AND changed_at = (SELECT MAX(changed_at) FROM public.settings_history WHERE setting_id = v_setting.id);
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reset setting to default
CREATE OR REPLACE FUNCTION public.reset_setting(p_key VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.settings
    SET value = default_value
    WHERE key = p_key
    AND default_value IS NOT NULL
    AND is_system = false
    AND is_readonly = false;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reset all settings in a category to defaults
CREATE OR REPLACE FUNCTION public.reset_category_settings(p_category_code VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.settings s
    SET value = s.default_value
    FROM public.settings_categories c
    WHERE s.category_id = c.id
    AND c.code = p_category_code
    AND s.default_value IS NOT NULL
    AND s.is_system = false
    AND s.is_readonly = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk update settings
CREATE OR REPLACE FUNCTION public.update_settings_bulk(p_settings JSONB)
RETURNS INTEGER AS $$
DECLARE
    v_item RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_each(p_settings)
    LOOP
        IF public.update_setting(v_item.key, v_item.value) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 28: TIMESTAMP TRIGGERS
-- =====================================================

-- Updated_at trigger for tables
CREATE OR REPLACE FUNCTION public.settings_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_printer_configurations_timestamp ON public.printer_configurations;
CREATE TRIGGER update_printer_configurations_timestamp
    BEFORE UPDATE ON public.printer_configurations
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

DROP TRIGGER IF EXISTS update_tax_rates_timestamp ON public.tax_rates;
CREATE TRIGGER update_tax_rates_timestamp
    BEFORE UPDATE ON public.tax_rates
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

DROP TRIGGER IF EXISTS update_payment_methods_timestamp ON public.payment_methods;
CREATE TRIGGER update_payment_methods_timestamp
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

DROP TRIGGER IF EXISTS update_business_hours_timestamp ON public.business_hours;
CREATE TRIGGER update_business_hours_timestamp
    BEFORE UPDATE ON public.business_hours
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

DROP TRIGGER IF EXISTS update_email_templates_timestamp ON public.email_templates;
CREATE TRIGGER update_email_templates_timestamp
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

DROP TRIGGER IF EXISTS update_receipt_templates_timestamp ON public.receipt_templates;
CREATE TRIGGER update_receipt_templates_timestamp
    BEFORE UPDATE ON public.receipt_templates
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

-- =====================================================
-- STEP 29: GRANTS
-- =====================================================

GRANT SELECT ON public.settings_categories TO authenticated;
GRANT SELECT, UPDATE ON public.settings TO authenticated;
GRANT SELECT, INSERT ON public.settings_history TO authenticated;
GRANT ALL ON public.printer_configurations TO authenticated;
GRANT ALL ON public.tax_rates TO authenticated;
GRANT ALL ON public.payment_methods TO authenticated;
GRANT ALL ON public.business_hours TO authenticated;
GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.receipt_templates TO authenticated;

-- =====================================================
-- STEP 30: COMMENTS
-- =====================================================

COMMENT ON TABLE public.settings_categories IS 'Categories for organizing application settings';
COMMENT ON TABLE public.settings IS 'Key-value store for all application settings with multilingual support';
COMMENT ON TABLE public.settings_history IS 'Audit trail of all setting changes';
COMMENT ON TABLE public.printer_configurations IS 'Printer configurations for receipts, labels, and kitchen orders';
COMMENT ON TABLE public.tax_rates IS 'Tax rates configuration (PPN/VAT)';
COMMENT ON TABLE public.payment_methods IS 'Available payment methods for POS';
COMMENT ON TABLE public.business_hours IS 'Store opening hours per day of week';
COMMENT ON TABLE public.email_templates IS 'Email templates for notifications';
COMMENT ON TABLE public.receipt_templates IS 'Receipt and ticket templates';

COMMENT ON FUNCTION public.get_setting IS 'Get a single setting value by key';
COMMENT ON FUNCTION public.get_settings_by_category IS 'Get all settings for a category with sensitive values masked';
COMMENT ON FUNCTION public.update_setting IS 'Update a setting with validation';
COMMENT ON FUNCTION public.reset_setting IS 'Reset a setting to its default value';
COMMENT ON FUNCTION public.reset_category_settings IS 'Reset all settings in a category to defaults';
COMMENT ON FUNCTION public.update_settings_bulk IS 'Update multiple settings at once';
