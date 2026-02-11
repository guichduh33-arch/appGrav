# PROMPT: Module Settings/Paramètres - ERP Breakery Lombok

## 🎯 Objectif Principal

Développer un module de paramétrage complet et centralisé pour l'ERP de The Breakery Lombok. Ce module permet aux administrateurs de configurer tous les aspects de l'application : informations entreprise, POS, fiscalité, impressions, notifications, sécurité, et intégrations.

---

## 📋 Contexte Technique

### Stack Technologique
- **Frontend**: React 18+ avec TypeScript, Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions + Storage)
- **UI**: [Préciser: Tailwind/Shadcn/Ant Design]
- **État**: [Préciser: Zustand/Redux/React Query]
- **Langue**: Interface multilingue (FR/EN/ID)

### Caractéristiques Business
- Boulangerie française en Indonésie
- ~200 transactions quotidiennes
- Chiffre d'affaires ~6 milliards IDR/an
- Devise: IDR avec TVA 10%
- Multi-plateforme: Desktop Windows, Tablettes Android, Terminaux POS

---

## 🏗️ Structure des Catégories de Paramètres

| Catégorie | Code | Description | Icône |
|-----------|------|-------------|-------|
| Entreprise | company | Infos légales, logo, contacts | Building2 |
| Point de Vente | pos | Config caisse, remises, numérotation | ShoppingCart |
| Fiscalité | tax | TVA, factures, arrondis | Receipt |
| Inventaire | inventory | Seuils alertes, FIFO, lots | Package |
| Impression | printing | Imprimantes, tickets, étiquettes | Printer |
| Notifications | notifications | Email, WhatsApp, alertes | Bell |
| Localisation | localization | Langue, devise, formats | Globe |
| Sécurité | security | Sessions, mots de passe, 2FA | Shield |
| Intégrations | integrations | Comptabilité, e-commerce, livraison | Plug |
| Sauvegarde | backup | Auto-backup, rétention, cloud | Database |
| Apparence | appearance | Thème, couleurs, disposition | Palette |
| Avancé | advanced | Debug, cache, maintenance | Settings2 |

---

## 🏗️ Architecture Base de Données

### Tables Principales

\`\`\`sql
-- =====================================================
-- TABLE: settings_categories
-- =====================================================
CREATE TABLE public.settings_categories (
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
-- TABLE: settings (clé-valeur avec métadonnées)
-- =====================================================
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.settings_categories(id),
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
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABLE: settings_history
-- =====================================================
CREATE TABLE public.settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_id UUID NOT NULL REFERENCES public.settings(id) ON DELETE CASCADE,
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    ip_address INET
);

-- =====================================================
-- TABLE: printer_configurations
-- =====================================================
CREATE TABLE public.printer_configurations (
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
-- TABLE: tax_rates
-- =====================================================
CREATE TABLE public.tax_rates (
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
-- TABLE: payment_methods
-- =====================================================
CREATE TABLE public.payment_methods (
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
-- TABLE: business_hours
-- =====================================================
CREATE TABLE public.business_hours (
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
-- TABLE: email_templates
-- =====================================================
CREATE TABLE public.email_templates (
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
-- TABLE: receipt_templates
-- =====================================================
CREATE TABLE public.receipt_templates (
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
\`\`\`

### Données par Défaut - Catégories

\`\`\`sql
INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, icon, sort_order, required_permission) VALUES
('company', 'Entreprise', 'Company', 'Perusahaan', 'Building2', 10, 'settings.view'),
('pos', 'Point de Vente', 'Point of Sale', 'Titik Penjualan', 'ShoppingCart', 20, 'settings.view'),
('tax', 'Fiscalité', 'Taxation', 'Perpajakan', 'Receipt', 30, 'settings.view'),
('inventory', 'Inventaire', 'Inventory', 'Inventaris', 'Package', 40, 'settings.view'),
('printing', 'Impression', 'Printing', 'Pencetakan', 'Printer', 50, 'settings.view'),
('notifications', 'Notifications', 'Notifications', 'Notifikasi', 'Bell', 60, 'settings.view'),
('localization', 'Localisation', 'Localization', 'Lokalisasi', 'Globe', 70, 'settings.view'),
('security', 'Sécurité', 'Security', 'Keamanan', 'Shield', 80, 'settings.update'),
('integrations', 'Intégrations', 'Integrations', 'Integrasi', 'Plug', 90, 'settings.update'),
('backup', 'Sauvegarde', 'Backup', 'Cadangan', 'Database', 100, 'settings.backup'),
('appearance', 'Apparence', 'Appearance', 'Tampilan', 'Palette', 110, 'settings.view'),
('advanced', 'Avancé', 'Advanced', 'Lanjutan', 'Settings2', 999, 'settings.update');
\`\`\`

### Données par Défaut - Paramètres Entreprise

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.name', '"The Breakery Lombok"', 'string', 'Nom de l''entreprise', 'Company Name', 'Nama Perusahaan', 10),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.legal_name', '"PT. The Breakery Lombok"', 'string', 'Raison sociale', 'Legal Name', 'Nama Hukum', 20),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.tax_id', '""', 'string', 'NPWP', 'Tax ID (NPWP)', 'NPWP', 30),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.address', '{"line1": "", "line2": "", "city": "Lombok", "province": "NTB", "postal_code": "", "country": "Indonesia"}', 'json', 'Adresse', 'Address', 'Alamat', 40),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.phone', '""', 'string', 'Téléphone', 'Phone', 'Telepon', 50),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.email', '""', 'string', 'Email', 'Email', 'Email', 60),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.website', '""', 'string', 'Site web', 'Website', 'Situs Web', 70),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.logo', 'null', 'file', 'Logo', 'Logo', 'Logo', 80),
((SELECT id FROM settings_categories WHERE code = 'company'), 'company.social_media', '{"instagram": "", "facebook": "", "whatsapp": ""}', 'json', 'Réseaux sociaux', 'Social Media', 'Media Sosial', 90);
\`\`\`

### Données par Défaut - Paramètres POS

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, validation_rules, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.default_customer', 'null', 'string', 'Client par défaut', 'Default Customer', 'Pelanggan Default', NULL, 10),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.allow_negative_stock', 'false', 'boolean', 'Autoriser stock négatif', 'Allow Negative Stock', 'Izinkan Stok Negatif', NULL, 20),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.require_customer', 'false', 'boolean', 'Client obligatoire', 'Require Customer', 'Wajib Pelanggan', NULL, 30),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.auto_print_receipt', 'true', 'boolean', 'Impression auto ticket', 'Auto Print Receipt', 'Cetak Otomatis Struk', NULL, 40),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.receipt_copies', '1', 'number', 'Copies ticket', 'Receipt Copies', 'Jumlah Salinan Struk', '{"min": 1, "max": 5}', 50),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.max_discount_percent', '100', 'number', 'Remise max (%)', 'Max Discount (%)', 'Diskon Maks (%)', '{"min": 0, "max": 100}', 60),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.require_discount_reason', 'true', 'boolean', 'Motif remise obligatoire', 'Require Discount Reason', 'Wajib Alasan Diskon', NULL, 70),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.allow_price_override', 'false', 'boolean', 'Modification prix', 'Allow Price Override', 'Izinkan Ubah Harga', NULL, 80),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.quick_amounts', '[10000, 20000, 50000, 100000]', 'array', 'Montants rapides', 'Quick Amounts', 'Jumlah Cepat', NULL, 90),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.order_number_format', '"ORD-{YYYY}{MM}{DD}-{####}"', 'string', 'Format n° commande', 'Order Number Format', 'Format No. Pesanan', NULL, 100),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.cash_drawer_enabled', 'true', 'boolean', 'Tiroir-caisse', 'Cash Drawer', 'Laci Uang', NULL, 110),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.hold_orders_enabled', 'true', 'boolean', 'Commandes en attente', 'Hold Orders', 'Simpan Pesanan', NULL, 120),
((SELECT id FROM settings_categories WHERE code = 'pos'), 'pos.kitchen_display_enabled', 'false', 'boolean', 'Écran cuisine', 'Kitchen Display', 'Layar Dapur', NULL, 130);
\`\`\`

### Données par Défaut - Fiscalité

\`\`\`sql
-- Taux de TVA
INSERT INTO public.tax_rates (code, name_fr, name_en, name_id, rate, is_inclusive, is_default) VALUES
('PPN_10', 'PPN 10%', 'VAT 10%', 'PPN 10%', 10.00, true, true),
('PPN_11', 'PPN 11%', 'VAT 11%', 'PPN 11%', 11.00, true, false),
('EXEMPT', 'Exonéré', 'Tax Exempt', 'Bebas Pajak', 0.00, true, false);

-- Paramètres fiscaux
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.default_rate', '"PPN_10"', 'string', 'Taux par défaut', 'Default Tax Rate', 'Tarif Pajak Default', 10),
((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.prices_include_tax', 'true', 'boolean', 'Prix TTC', 'Prices Include Tax', 'Harga Termasuk Pajak', 20),
((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.show_tax_breakdown', 'true', 'boolean', 'Détail taxes', 'Show Tax Breakdown', 'Tampilkan Rincian Pajak', 30),
((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.invoice_required_above', '50000000', 'number', 'Facture obligatoire (IDR)', 'Invoice Required Above', 'Faktur Wajib Di Atas', 40),
((SELECT id FROM settings_categories WHERE code = 'tax'), 'tax.rounding_method', '"round"', 'string', 'Méthode arrondi', 'Rounding Method', 'Metode Pembulatan', 50);
\`\`\`

### Données par Défaut - Modes de Paiement

\`\`\`sql
INSERT INTO public.payment_methods (code, name_fr, name_en, name_id, payment_type, icon, is_default, sort_order) VALUES
('CASH', 'Espèces', 'Cash', 'Tunai', 'cash', 'Banknote', true, 10),
('CARD_DEBIT', 'Carte Débit', 'Debit Card', 'Kartu Debit', 'card', 'CreditCard', false, 20),
('CARD_CREDIT', 'Carte Crédit', 'Credit Card', 'Kartu Kredit', 'card', 'CreditCard', false, 30),
('TRANSFER', 'Virement', 'Bank Transfer', 'Transfer Bank', 'transfer', 'Building', false, 40),
('GOPAY', 'GoPay', 'GoPay', 'GoPay', 'ewallet', 'Wallet', false, 50),
('OVO', 'OVO', 'OVO', 'OVO', 'ewallet', 'Wallet', false, 60),
('DANA', 'DANA', 'DANA', 'DANA', 'ewallet', 'Wallet', false, 70),
('QRIS', 'QRIS', 'QRIS', 'QRIS', 'ewallet', 'QrCode', false, 80);
\`\`\`

### Données par Défaut - Inventaire

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, validation_rules, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.low_stock_threshold', '10', 'number', 'Seuil stock bas', 'Low Stock Threshold', 'Ambang Stok Rendah', '{"min": 1}', 10),
((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.critical_stock_threshold', '5', 'number', 'Seuil stock critique', 'Critical Stock Threshold', 'Ambang Stok Kritis', '{"min": 0}', 20),
((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.auto_reorder', 'false', 'boolean', 'Réappro auto', 'Auto Reorder', 'Pesan Ulang Otomatis', NULL, 30),
((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.expiry_alert_days', '7', 'number', 'Alerte péremption (jours)', 'Expiry Alert Days', 'Peringatan Kadaluarsa (hari)', '{"min": 1, "max": 90}', 40),
((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.track_batches', 'true', 'boolean', 'Suivi lots', 'Track Batches', 'Lacak Batch', NULL, 50),
((SELECT id FROM settings_categories WHERE code = 'inventory'), 'inventory.fifo_enabled', 'true', 'boolean', 'FIFO activé', 'FIFO Enabled', 'FIFO Aktif', NULL, 60);
\`\`\`

### Données par Défaut - Localisation

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, validation_rules, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.default_language', '"id"', 'string', 'Langue par défaut', 'Default Language', 'Bahasa Default', '{"options": ["fr", "en", "id"]}', 10),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.timezone', '"Asia/Makassar"', 'string', 'Fuseau horaire', 'Timezone', 'Zona Waktu', NULL, 20),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.currency_code', '"IDR"', 'string', 'Code devise', 'Currency Code', 'Kode Mata Uang', NULL, 30),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.currency_symbol', '"Rp"', 'string', 'Symbole devise', 'Currency Symbol', 'Simbol Mata Uang', NULL, 40),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.currency_position', '"before"', 'string', 'Position devise', 'Currency Position', 'Posisi Mata Uang', '{"options": ["before", "after"]}', 50),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.decimal_separator', '","', 'string', 'Séparateur décimal', 'Decimal Separator', 'Pemisah Desimal', NULL, 60),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.thousands_separator', '"."', 'string', 'Séparateur milliers', 'Thousands Separator', 'Pemisah Ribuan', NULL, 70),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.date_format', '"DD/MM/YYYY"', 'string', 'Format date', 'Date Format', 'Format Tanggal', NULL, 80),
((SELECT id FROM settings_categories WHERE code = 'localization'), 'localization.time_format', '"HH:mm"', 'string', 'Format heure', 'Time Format', 'Format Waktu', '{"options": ["HH:mm", "hh:mm A"]}', 90);
\`\`\`

### Données par Défaut - Sécurité

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, validation_rules, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.session_timeout', '480', 'number', 'Expiration session (min)', 'Session Timeout (min)', 'Timeout Sesi (menit)', '{"min": 15, "max": 1440}', 10),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.require_pin_for_void', 'true', 'boolean', 'PIN pour annulation', 'Require PIN for Void', 'Wajib PIN untuk Batal', NULL, 20),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.require_pin_for_discount', 'true', 'boolean', 'PIN pour remise', 'Require PIN for Discount', 'Wajib PIN untuk Diskon', NULL, 30),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.require_pin_for_refund', 'true', 'boolean', 'PIN pour remboursement', 'Require PIN for Refund', 'Wajib PIN untuk Pengembalian', NULL, 40),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.max_login_attempts', '5', 'number', 'Tentatives connexion max', 'Max Login Attempts', 'Maks Percobaan Login', '{"min": 3, "max": 10}', 50),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.lockout_duration', '30', 'number', 'Durée verrouillage (min)', 'Lockout Duration (min)', 'Durasi Kunci (menit)', '{"min": 5, "max": 1440}', 60),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.password_expiry_days', '90', 'number', 'Expiration mdp (jours)', 'Password Expiry (days)', 'Kadaluarsa Kata Sandi (hari)', '{"min": 0, "max": 365}', 70),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.min_password_length', '8', 'number', 'Longueur min mdp', 'Min Password Length', 'Panjang Min Kata Sandi', '{"min": 6, "max": 32}', 80),
((SELECT id FROM settings_categories WHERE code = 'security'), 'security.two_factor_enabled', 'false', 'boolean', '2FA activé', '2FA Enabled', '2FA Aktif', NULL, 90);
\`\`\`

### Données par Défaut - Notifications

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, is_sensitive, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.email_enabled', 'true', 'boolean', 'Emails activés', 'Emails Enabled', 'Email Aktif', false, 10),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_host', '""', 'string', 'Serveur SMTP', 'SMTP Host', 'Host SMTP', false, 20),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_port', '587', 'number', 'Port SMTP', 'SMTP Port', 'Port SMTP', false, 30),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_user', '""', 'string', 'Utilisateur SMTP', 'SMTP User', 'Pengguna SMTP', false, 40),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.smtp_password', '""', 'string', 'Mot de passe SMTP', 'SMTP Password', 'Kata Sandi SMTP', true, 50),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.from_email', '""', 'string', 'Email expéditeur', 'From Email', 'Email Pengirim', false, 60),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.low_stock_alerts', 'true', 'boolean', 'Alertes stock bas', 'Low Stock Alerts', 'Peringatan Stok Rendah', false, 70),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.daily_report', 'true', 'boolean', 'Rapport quotidien', 'Daily Report', 'Laporan Harian', false, 80),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.daily_report_time', '"21:00"', 'string', 'Heure rapport', 'Report Time', 'Waktu Laporan', false, 90),
((SELECT id FROM settings_categories WHERE code = 'notifications'), 'notifications.whatsapp_enabled', 'false', 'boolean', 'WhatsApp activé', 'WhatsApp Enabled', 'WhatsApp Aktif', false, 100);
\`\`\`

### Données par Défaut - Sauvegarde

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, is_sensitive, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.auto_backup_enabled', 'true', 'boolean', 'Sauvegarde auto', 'Auto Backup', 'Cadangan Otomatis', false, 10),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.backup_frequency', '"daily"', 'string', 'Fréquence', 'Frequency', 'Frekuensi', false, 20),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.backup_time', '"02:00"', 'string', 'Heure sauvegarde', 'Backup Time', 'Waktu Cadangan', false, 30),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.retention_days', '30', 'number', 'Rétention (jours)', 'Retention (days)', 'Retensi (hari)', false, 40),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.storage_provider', '"local"', 'string', 'Stockage', 'Storage Provider', 'Penyedia Penyimpanan', false, 50),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.s3_bucket', '""', 'string', 'Bucket S3', 'S3 Bucket', 'Bucket S3', false, 60),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.s3_access_key', '""', 'string', 'Clé accès S3', 'S3 Access Key', 'Kunci Akses S3', true, 70),
((SELECT id FROM settings_categories WHERE code = 'backup'), 'backup.s3_secret_key', '""', 'string', 'Clé secrète S3', 'S3 Secret Key', 'Kunci Rahasia S3', true, 80);
\`\`\`

### Données par Défaut - Apparence

\`\`\`sql
INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, validation_rules, sort_order) VALUES
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.theme', '"light"', 'string', 'Thème', 'Theme', 'Tema', '{"options": ["light", "dark", "system"]}', 10),
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.primary_color', '"#2563eb"', 'string', 'Couleur principale', 'Primary Color', 'Warna Utama', NULL, 20),
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.sidebar_collapsed', 'false', 'boolean', 'Sidebar réduite', 'Collapsed Sidebar', 'Sidebar Diciutkan', NULL, 30),
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.compact_mode', 'false', 'boolean', 'Mode compact', 'Compact Mode', 'Mode Kompak', NULL, 40),
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.pos_layout', '"grid"', 'string', 'Disposition POS', 'POS Layout', 'Tata Letak POS', '{"options": ["grid", "list"]}', 50),
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.pos_columns', '4', 'number', 'Colonnes POS', 'POS Columns', 'Kolom POS', '{"min": 2, "max": 8}', 60),
((SELECT id FROM settings_categories WHERE code = 'appearance'), 'appearance.show_product_images', 'true', 'boolean', 'Images produits', 'Show Product Images', 'Tampilkan Gambar Produk', NULL, 70);
\`\`\`

### Données par Défaut - Horaires

\`\`\`sql
INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '07:00', '21:00', false),
(1, '07:00', '21:00', false),
(2, '07:00', '21:00', false),
(3, '07:00', '21:00', false),
(4, '07:00', '21:00', false),
(5, '07:00', '21:00', false),
(6, '07:00', '21:00', false);
\`\`\`

### Données par Défaut - Templates Email

\`\`\`sql
INSERT INTO public.email_templates (code, name_fr, name_en, name_id, variables) VALUES
('welcome', 'Bienvenue', 'Welcome', 'Selamat Datang', '["customer_name", "company_name"]'),
('order_confirmation', 'Confirmation commande', 'Order Confirmation', 'Konfirmasi Pesanan', '["order_number", "customer_name", "total", "items"]'),
('password_reset', 'Réinitialisation mot de passe', 'Password Reset', 'Reset Kata Sandi', '["user_name", "reset_link"]'),
('low_stock_alert', 'Alerte stock bas', 'Low Stock Alert', 'Peringatan Stok Rendah', '["product_name", "current_stock", "min_stock"]'),
('daily_report', 'Rapport journalier', 'Daily Report', 'Laporan Harian', '["date", "total_sales", "transactions_count"]');
\`\`\`

---

## 🔐 Row Level Security (RLS)

\`\`\`sql
-- Activer RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_templates ENABLE ROW LEVEL SECURITY;

-- Policies settings_categories
CREATE POLICY "View active categories" ON public.settings_categories
    FOR SELECT USING (is_active = true);

-- Policies settings
CREATE POLICY "View settings with permission" ON public.settings
    FOR SELECT USING (public.user_has_permission(auth.uid(), 'settings.view'));

CREATE POLICY "Update settings with permission" ON public.settings
    FOR UPDATE USING (
        public.user_has_permission(auth.uid(), 'settings.update')
        AND is_system = false AND is_readonly = false
    );

-- Policies settings_history
CREATE POLICY "Admins view history" ON public.settings_history
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System insert history" ON public.settings_history
    FOR INSERT WITH CHECK (true);

-- Policies autres tables
CREATE POLICY "View tax_rates" ON public.tax_rates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Manage tax_rates" ON public.tax_rates FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

CREATE POLICY "View payment_methods" ON public.payment_methods FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Manage payment_methods" ON public.payment_methods FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

CREATE POLICY "View business_hours" ON public.business_hours FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Manage business_hours" ON public.business_hours FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));
\`\`\`

---

## ⚙️ Fonctions PostgreSQL

\`\`\`sql
-- Trigger historique modifications
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

CREATE TRIGGER log_setting_changes
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.log_setting_change();

-- Obtenir un paramètre
CREATE OR REPLACE FUNCTION public.get_setting(p_key VARCHAR)
RETURNS JSONB AS $$
    SELECT value FROM public.settings WHERE key = p_key;
$$ LANGUAGE sql SECURITY DEFINER;

-- Obtenir paramètres par catégorie
CREATE OR REPLACE FUNCTION public.get_settings_by_category(p_category_code VARCHAR)
RETURNS TABLE (key VARCHAR, value JSONB, value_type VARCHAR, name_fr VARCHAR, is_sensitive BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT s.key, CASE WHEN s.is_sensitive THEN '""'::JSONB ELSE s.value END,
           s.value_type, s.name_fr, s.is_sensitive
    FROM public.settings s
    JOIN public.settings_categories c ON s.category_id = c.id
    WHERE c.code = p_category_code
    ORDER BY s.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour avec validation
CREATE OR REPLACE FUNCTION public.update_setting(p_key VARCHAR, p_value JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    v_setting RECORD;
    v_validation JSONB;
BEGIN
    SELECT * INTO v_setting FROM public.settings WHERE key = p_key;
    IF NOT FOUND THEN RAISE EXCEPTION 'Setting not found: %', p_key; END IF;
    IF v_setting.is_system OR v_setting.is_readonly THEN RAISE EXCEPTION 'Not modifiable'; END IF;
    
    v_validation := v_setting.validation_rules;
    IF v_validation IS NOT NULL AND v_setting.value_type = 'number' THEN
        IF v_validation->>'min' IS NOT NULL AND (p_value)::NUMERIC < (v_validation->>'min')::NUMERIC THEN
            RAISE EXCEPTION 'Below minimum';
        END IF;
        IF v_validation->>'max' IS NOT NULL AND (p_value)::NUMERIC > (v_validation->>'max')::NUMERIC THEN
            RAISE EXCEPTION 'Above maximum';
        END IF;
    END IF;
    
    UPDATE public.settings SET value = p_value WHERE key = p_key;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Réinitialiser paramètre
CREATE OR REPLACE FUNCTION public.reset_setting(p_key VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.settings SET value = default_value 
    WHERE key = p_key AND default_value IS NOT NULL AND is_system = false;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

---

## 🖥️ Types TypeScript

\`\`\`typescript
// types/settings.ts

export interface SettingsCategory {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description_fr?: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  required_permission?: string;
}

export interface Setting {
  id: string;
  category_id: string;
  key: string;
  value: any;
  value_type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'file';
  name_fr: string;
  name_en: string;
  name_id: string;
  description_fr?: string;
  default_value?: any;
  validation_rules?: { min?: number; max?: number; pattern?: string; options?: string[] };
  is_sensitive: boolean;
  is_system: boolean;
  is_readonly: boolean;
  requires_restart: boolean;
  sort_order: number;
  updated_at: string;
}

export interface PrinterConfiguration {
  id: string;
  name: string;
  printer_type: 'receipt' | 'label' | 'kitchen' | 'report';
  connection_type: 'usb' | 'network' | 'bluetooth';
  connection_string?: string;
  paper_width: number;
  is_default: boolean;
  is_active: boolean;
  settings: Record<string, any>;
}

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
}

export interface PaymentMethod {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  icon: string;
  payment_type: 'cash' | 'card' | 'transfer' | 'ewallet' | 'other';
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

export interface BusinessHours {
  id: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  break_start?: string;
  break_end?: string;
}
\`\`\`

---

## 📱 Pages UI à Implémenter

| Route | Description |
|-------|-------------|
| /settings | Page principale avec navigation par catégorie |
| /settings/company | Informations entreprise |
| /settings/pos | Configuration point de vente |
| /settings/tax | Gestion des taxes |
| /settings/payments | Modes de paiement |
| /settings/inventory | Paramètres inventaire |
| /settings/printing | Gestion imprimantes |
| /settings/notifications | Configuration emails/alertes |
| /settings/localization | Langue, devise, formats |
| /settings/security | Sécurité et mots de passe |
| /settings/integrations | Connexions externes |
| /settings/backup | Sauvegarde & restauration |
| /settings/appearance | Thème et personnalisation |
| /settings/hours | Horaires d'ouverture |
| /settings/receipts | Templates tickets |
| /settings/emails | Templates emails |
| /settings/history | Journal des modifications |

---

## ✅ Checklist d'Implémentation

### Phase 1: Base de données
- [ ] Créer toutes les tables
- [ ] Insérer données par défaut
- [ ] Implémenter RLS
- [ ] Créer fonctions et triggers
- [ ] Tester validations

### Phase 2: Frontend Core
- [ ] Types TypeScript
- [ ] Store Zustand settings
- [ ] Hook useSettings
- [ ] Composants champs dynamiques
- [ ] Page settings principale

### Phase 3: Pages Spécialisées
- [ ] Gestion imprimantes
- [ ] Gestion taxes
- [ ] Modes de paiement
- [ ] Horaires d'ouverture
- [ ] Templates email/tickets
- [ ] Sauvegarde/restauration
- [ ] Historique

### Phase 4: Intégrations
- [ ] Test impression
- [ ] Envoi emails test
- [ ] Backup cloud
- [ ] Webhooks
