-- =====================================================
-- Migration 095: Settings Module Enhancements
-- Description: Advanced POS settings, terminal settings, module configs, profiles
-- Date: 2026-01-28
-- Depends on: 041_settings_module.sql, 057_pos_terminals_table.sql
-- =====================================================

-- =====================================================
-- STEP 1: New Settings Category - POS Advanced
-- =====================================================

INSERT INTO public.settings_categories
    (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, required_permission)
VALUES
    ('pos_advanced', 'POS Avancé', 'Advanced POS', 'POS Lanjutan',
     'Configuration avancée du point de vente', 'Advanced point of sale configuration',
     'Konfigurasi lanjutan point of sale', 'Sliders', 25, 'settings.view'),
    ('modules', 'Modules', 'Modules', 'Modul',
     'Activation et configuration des modules', 'Module activation and configuration',
     'Aktivasi dan konfigurasi modul', 'Puzzle', 85, 'settings.update')
ON CONFLICT (code) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    name_en = EXCLUDED.name_en,
    name_id = EXCLUDED.name_id,
    description_fr = EXCLUDED.description_fr,
    description_en = EXCLUDED.description_en,
    description_id = EXCLUDED.description_id,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- =====================================================
-- STEP 2: Terminal Settings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.terminal_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID NOT NULL REFERENCES public.pos_terminals(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT terminal_settings_unique UNIQUE (terminal_id, key)
);

CREATE INDEX IF NOT EXISTS idx_terminal_settings_terminal ON public.terminal_settings(terminal_id);
CREATE INDEX IF NOT EXISTS idx_terminal_settings_key ON public.terminal_settings(key);

-- =====================================================
-- STEP 3: Settings Profiles Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.settings_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    profile_type VARCHAR(20) NOT NULL DEFAULT 'custom',
    settings_snapshot JSONB NOT NULL DEFAULT '{}',
    terminal_settings_snapshot JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT settings_profiles_type_check CHECK (
        profile_type IN ('production', 'test', 'training', 'custom')
    )
);

CREATE INDEX IF NOT EXISTS idx_settings_profiles_type ON public.settings_profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_settings_profiles_active ON public.settings_profiles(is_active) WHERE is_active = true;

-- =====================================================
-- STEP 4: Sound Assets Table (for POS sounds)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sound_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    file_path VARCHAR(255),
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default sounds
INSERT INTO public.sound_assets (code, name, category, file_path, is_system) VALUES
    ('chime', 'Chime', 'order', '/sounds/chime.mp3', true),
    ('bell', 'Bell', 'order', '/sounds/bell.mp3', true),
    ('beep', 'Beep', 'notification', '/sounds/beep.mp3', true),
    ('cash', 'Cash Register', 'payment', '/sounds/cash.mp3', true),
    ('success', 'Success', 'payment', '/sounds/success.mp3', true),
    ('error', 'Error', 'error', '/sounds/error.mp3', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- STEP 5: Insert Advanced POS Settings
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id,
    description_fr, description_en, description_id, validation_rules, default_value, sort_order)
VALUES
    -- Cart Locking
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.cart.lock_on_kitchen_send', 'true', 'boolean',
     'Verrouiller après envoi cuisine', 'Lock after kitchen send', 'Kunci setelah kirim ke dapur',
     'Verrouiller les articles après envoi en cuisine', 'Lock items after sending to kitchen',
     'Kunci item setelah dikirim ke dapur', NULL, 'true', 10),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.cart.require_pin_locked_remove', 'true', 'boolean',
     'PIN pour retirer item verrouillé', 'PIN to remove locked item', 'PIN untuk hapus item terkunci',
     'Exiger un PIN pour retirer un article verrouillé', 'Require PIN to remove locked item',
     'Wajib PIN untuk hapus item terkunci', NULL, 'true', 20),

    -- Rounding
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.rounding.amount', '100', 'number',
     'Arrondi IDR', 'IDR Rounding', 'Pembulatan IDR',
     'Montant d''arrondi en Rupiah (100, 500, 1000)', 'Rounding amount in Rupiah (100, 500, 1000)',
     'Jumlah pembulatan dalam Rupiah (100, 500, 1000)',
     '{"options": [100, 500, 1000]}', '100', 30),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.rounding.method', '"round"', 'string',
     'Méthode d''arrondi', 'Rounding method', 'Metode pembulatan',
     'Méthode d''arrondi des montants', 'Amount rounding method',
     'Metode pembulatan jumlah',
     '{"options": ["round", "floor", "ceil"]}', '"round"', 40),

    -- Split Payment
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.payment.allow_split', 'true', 'boolean',
     'Paiement fractionné', 'Split payment', 'Pembayaran terpisah',
     'Autoriser le paiement fractionné', 'Allow split payment',
     'Izinkan pembayaran terpisah', NULL, 'true', 50),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.payment.max_split_count', '4', 'number',
     'Fractions max', 'Max splits', 'Maks pembagian',
     'Nombre maximum de fractions de paiement', 'Maximum number of payment splits',
     'Jumlah maksimum pembagian pembayaran',
     '{"min": 2, "max": 10}', '4', 60),

    -- Sounds
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.sound.enabled', 'true', 'boolean',
     'Sons activés', 'Sounds enabled', 'Suara aktif',
     'Activer les sons et feedback audio', 'Enable sounds and audio feedback',
     'Aktifkan suara dan umpan balik audio', NULL, 'true', 70),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.sound.new_order', '"chime"', 'string',
     'Son nouvelle commande', 'New order sound', 'Suara pesanan baru',
     'Son joué lors d''une nouvelle commande', 'Sound played for new order',
     'Suara yang diputar untuk pesanan baru',
     '{"options": ["chime", "bell", "beep", "none"]}', '"chime"', 80),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.sound.payment_success', '"cash"', 'string',
     'Son paiement réussi', 'Payment success sound', 'Suara pembayaran berhasil',
     'Son joué après paiement réussi', 'Sound played after successful payment',
     'Suara yang diputar setelah pembayaran berhasil',
     '{"options": ["cash", "success", "none"]}', '"cash"', 90),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.sound.error', '"error"', 'string',
     'Son erreur', 'Error sound', 'Suara error',
     'Son joué lors d''une erreur', 'Sound played on error',
     'Suara yang diputar saat error',
     '{"options": ["error", "beep", "none"]}', '"error"', 95),

    -- Screensaver
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.screensaver.enabled', 'true', 'boolean',
     'Écran de veille', 'Screensaver', 'Screensaver',
     'Activer l''écran de veille', 'Enable screensaver',
     'Aktifkan screensaver', NULL, 'true', 100),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.screensaver.timeout', '300', 'number',
     'Délai écran de veille (sec)', 'Screensaver timeout (sec)', 'Timeout screensaver (detik)',
     'Délai d''inactivité avant écran de veille', 'Inactivity delay before screensaver',
     'Waktu tidak aktif sebelum screensaver',
     '{"min": 60, "max": 3600}', '300', 110),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.screensaver.show_clock', 'true', 'boolean',
     'Afficher horloge', 'Show clock', 'Tampilkan jam',
     'Afficher l''horloge sur l''écran de veille', 'Show clock on screensaver',
     'Tampilkan jam di screensaver', NULL, 'true', 115),

    -- Offline Mode
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.offline.enabled', 'true', 'boolean',
     'Mode hors ligne', 'Offline mode', 'Mode offline',
     'Activer le mode hors ligne', 'Enable offline mode',
     'Aktifkan mode offline', NULL, 'true', 120),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.offline.auto_switch', 'true', 'boolean',
     'Bascule auto online/offline', 'Auto online/offline switch', 'Otomatis online/offline',
     'Basculer automatiquement entre online et offline', 'Automatically switch between online and offline',
     'Otomatis beralih antara online dan offline', NULL, 'true', 130),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.offline.sync_interval', '30', 'number',
     'Intervalle sync (sec)', 'Sync interval (sec)', 'Interval sync (detik)',
     'Intervalle de synchronisation en secondes', 'Sync interval in seconds',
     'Interval sinkronisasi dalam detik',
     '{"min": 10, "max": 300}', '30', 140),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.offline.max_offline_orders', '100', 'number',
     'Max commandes offline', 'Max offline orders', 'Maks pesanan offline',
     'Nombre maximum de commandes en mode offline', 'Maximum orders in offline mode',
     'Jumlah maksimum pesanan dalam mode offline',
     '{"min": 10, "max": 500}', '100', 145),

    -- Customer Display
    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.customer_display.enabled', 'false', 'boolean',
     'Affichage client', 'Customer display', 'Tampilan pelanggan',
     'Activer l''affichage client', 'Enable customer display',
     'Aktifkan tampilan pelanggan', NULL, 'false', 150),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.customer_display.show_items', 'true', 'boolean',
     'Afficher articles', 'Show items', 'Tampilkan item',
     'Afficher les articles sur l''écran client', 'Show items on customer display',
     'Tampilkan item di layar pelanggan', NULL, 'true', 160),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.customer_display.show_promotions', 'true', 'boolean',
     'Afficher promotions', 'Show promotions', 'Tampilkan promosi',
     'Afficher les promotions sur l''écran client', 'Show promotions on customer display',
     'Tampilkan promosi di layar pelanggan', NULL, 'true', 165),

    ((SELECT id FROM settings_categories WHERE code = 'pos_advanced'),
     'pos.customer_display.show_logo', 'true', 'boolean',
     'Afficher logo', 'Show logo', 'Tampilkan logo',
     'Afficher le logo sur l''écran client', 'Show logo on customer display',
     'Tampilkan logo di layar pelanggan', NULL, 'true', 170)

ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 6: Insert Module Settings
-- =====================================================

INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id,
    description_fr, description_en, description_id, validation_rules, default_value, sort_order)
VALUES
    -- Production Module
    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.production.enabled', 'true', 'boolean',
     'Module Production', 'Production Module', 'Modul Produksi',
     'Activer le module de production', 'Enable production module',
     'Aktifkan modul produksi', NULL, 'true', 10),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.production.auto_consume_stock', 'true', 'boolean',
     'Consommation auto stock', 'Auto stock consumption', 'Konsumsi stok otomatis',
     'Déduire automatiquement le stock lors de la production',
     'Automatically deduct stock during production',
     'Otomatis kurangi stok saat produksi', NULL, 'true', 20),

    -- B2B Module
    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.b2b.enabled', 'true', 'boolean',
     'Module B2B', 'B2B Module', 'Modul B2B',
     'Activer le module B2B', 'Enable B2B module',
     'Aktifkan modul B2B', NULL, 'true', 30),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.b2b.min_order_amount', '500000', 'number',
     'Montant min commande B2B', 'B2B min order amount', 'Jumlah min pesanan B2B',
     'Montant minimum pour commande B2B (IDR)',
     'Minimum amount for B2B order (IDR)',
     'Jumlah minimum untuk pesanan B2B (IDR)',
     '{"min": 0}', '500000', 40),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.b2b.default_payment_terms', '30', 'number',
     'Délai paiement (jours)', 'Payment terms (days)', 'Jangka waktu pembayaran (hari)',
     'Délai de paiement par défaut en jours',
     'Default payment terms in days',
     'Jangka waktu pembayaran default dalam hari',
     '{"min": 0, "max": 90}', '30', 50),

    -- Purchasing Module
    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.purchasing.enabled', 'true', 'boolean',
     'Module Achats', 'Purchasing Module', 'Modul Pembelian',
     'Activer le module achats', 'Enable purchasing module',
     'Aktifkan modul pembelian', NULL, 'true', 60),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.purchasing.auto_reorder_threshold', '5', 'number',
     'Seuil réappro auto', 'Auto reorder threshold', 'Ambang pesan ulang otomatis',
     'Seuil de stock pour réapprovisionnement automatique',
     'Stock threshold for automatic reorder',
     'Ambang stok untuk pemesanan ulang otomatis',
     '{"min": 0}', '5', 65),

    -- Loyalty Module
    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.loyalty.enabled', 'true', 'boolean',
     'Programme fidélité', 'Loyalty Program', 'Program Loyalitas',
     'Activer le programme de fidélité', 'Enable loyalty program',
     'Aktifkan program loyalitas', NULL, 'true', 70),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.loyalty.points_per_idr', '1000', 'number',
     'IDR par point', 'IDR per point', 'IDR per poin',
     'Montant en IDR pour gagner 1 point',
     'Amount in IDR to earn 1 point',
     'Jumlah IDR untuk mendapatkan 1 poin',
     '{"min": 100}', '1000', 80),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.loyalty.points_expiry_days', '365', 'number',
     'Expiration points (jours)', 'Points expiry (days)', 'Kadaluarsa poin (hari)',
     'Jours avant expiration des points (0 = jamais)',
     'Days before points expire (0 = never)',
     'Hari sebelum poin kadaluarsa (0 = tidak pernah)',
     '{"min": 0}', '365', 90),

    -- KDS Module
    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.kds.enabled', 'true', 'boolean',
     'Kitchen Display (KDS)', 'Kitchen Display (KDS)', 'Kitchen Display (KDS)',
     'Activer l''affichage cuisine', 'Enable kitchen display',
     'Aktifkan tampilan dapur', NULL, 'true', 100),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.kds.auto_acknowledge_delay', '30', 'number',
     'Délai acquittement auto (sec)', 'Auto acknowledge delay (sec)', 'Delay konfirmasi otomatis (detik)',
     'Délai avant acquittement automatique',
     'Delay before automatic acknowledgment',
     'Waktu sebelum konfirmasi otomatis',
     '{"min": 0, "max": 300}', '30', 110),

    ((SELECT id FROM settings_categories WHERE code = 'modules'),
     'modules.kds.sound_new_order', 'true', 'boolean',
     'Son nouvelle commande KDS', 'KDS new order sound', 'Suara pesanan baru KDS',
     'Jouer un son pour les nouvelles commandes KDS',
     'Play sound for new KDS orders',
     'Putar suara untuk pesanan KDS baru', NULL, 'true', 115)

ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STEP 7: Extend pos_terminals table
-- =====================================================

ALTER TABLE public.pos_terminals
    ADD COLUMN IF NOT EXISTS mode VARCHAR(30) DEFAULT 'primary',
    ADD COLUMN IF NOT EXISTS default_printer_id UUID REFERENCES public.printer_configurations(id),
    ADD COLUMN IF NOT EXISTS kitchen_printer_id UUID REFERENCES public.printer_configurations(id),
    ADD COLUMN IF NOT EXISTS kds_station VARCHAR(30),
    ADD COLUMN IF NOT EXISTS allowed_payment_methods JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS default_order_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS floor_plan_id UUID,
    ADD COLUMN IF NOT EXISTS auto_logout_timeout INTEGER;

-- Add constraint for mode (use DO block to handle existing constraint)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pos_terminals_mode_check'
    ) THEN
        ALTER TABLE public.pos_terminals ADD CONSTRAINT pos_terminals_mode_check
            CHECK (mode IN ('primary', 'secondary', 'self_service', 'kds_only'));
    END IF;
END $$;

-- =====================================================
-- STEP 8: RLS for new tables
-- =====================================================

ALTER TABLE public.terminal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_assets ENABLE ROW LEVEL SECURITY;

-- Terminal settings policies
DROP POLICY IF EXISTS "terminal_settings_select" ON public.terminal_settings;
CREATE POLICY "terminal_settings_select" ON public.terminal_settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "terminal_settings_manage" ON public.terminal_settings;
CREATE POLICY "terminal_settings_manage" ON public.terminal_settings
    FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

-- Settings profiles policies
DROP POLICY IF EXISTS "settings_profiles_select" ON public.settings_profiles;
CREATE POLICY "settings_profiles_select" ON public.settings_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "settings_profiles_manage" ON public.settings_profiles;
CREATE POLICY "settings_profiles_manage" ON public.settings_profiles
    FOR ALL USING (public.is_admin(auth.uid()));

-- Sound assets policies
DROP POLICY IF EXISTS "sound_assets_select" ON public.sound_assets;
CREATE POLICY "sound_assets_select" ON public.sound_assets
    FOR SELECT USING (true);

-- =====================================================
-- STEP 9: Functions for terminal settings
-- =====================================================

-- Get terminal setting
CREATE OR REPLACE FUNCTION public.get_terminal_setting(
    p_terminal_id UUID,
    p_key VARCHAR
) RETURNS JSONB AS $$
    SELECT value
    FROM public.terminal_settings
    WHERE terminal_id = p_terminal_id AND key = p_key;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Set terminal setting
CREATE OR REPLACE FUNCTION public.set_terminal_setting(
    p_terminal_id UUID,
    p_key VARCHAR,
    p_value JSONB
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.terminal_settings (terminal_id, key, value)
    VALUES (p_terminal_id, p_key, p_value)
    ON CONFLICT (terminal_id, key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all terminal settings
CREATE OR REPLACE FUNCTION public.get_all_terminal_settings(p_terminal_id UUID)
RETURNS TABLE (key VARCHAR, value JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT ts.key::VARCHAR, ts.value
    FROM public.terminal_settings ts
    WHERE ts.terminal_id = p_terminal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 10: Functions for settings profiles
-- =====================================================

-- Create settings profile from current settings
CREATE OR REPLACE FUNCTION public.create_settings_profile(
    p_name VARCHAR,
    p_description TEXT,
    p_type VARCHAR DEFAULT 'custom'
) RETURNS UUID AS $$
DECLARE
    v_profile_id UUID;
    v_settings JSONB;
BEGIN
    -- Capture current settings
    SELECT jsonb_object_agg(key, value)
    INTO v_settings
    FROM public.settings
    WHERE is_system = false;

    -- Create profile
    INSERT INTO public.settings_profiles (name, description, profile_type, settings_snapshot, created_by)
    VALUES (p_name, p_description, p_type, v_settings, auth.uid())
    RETURNING id INTO v_profile_id;

    RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply settings profile
CREATE OR REPLACE FUNCTION public.apply_settings_profile(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_settings JSONB;
    v_key TEXT;
    v_value JSONB;
    v_count INTEGER := 0;
BEGIN
    -- Get profile settings
    SELECT settings_snapshot INTO v_settings
    FROM public.settings_profiles
    WHERE id = p_profile_id;

    IF v_settings IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- Apply each setting
    FOR v_key, v_value IN SELECT * FROM jsonb_each(v_settings)
    LOOP
        UPDATE public.settings
        SET value = v_value, updated_at = NOW(), updated_by = auth.uid()
        WHERE key = v_key AND is_system = false AND is_readonly = false;

        IF FOUND THEN v_count := v_count + 1; END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 11: Export settings function
-- =====================================================

CREATE OR REPLACE FUNCTION public.export_settings()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'exported_at', NOW(),
        'version', '1.0',
        'settings', (
            SELECT jsonb_object_agg(key, value)
            FROM public.settings
            WHERE is_system = false AND is_sensitive = false
        ),
        'tax_rates', (
            SELECT jsonb_agg(to_jsonb(t) - 'id' - 'created_at' - 'updated_at')
            FROM public.tax_rates t WHERE is_active = true
        ),
        'payment_methods', (
            SELECT jsonb_agg(to_jsonb(p) - 'id' - 'created_at' - 'updated_at')
            FROM public.payment_methods p WHERE is_active = true
        ),
        'business_hours', (
            SELECT jsonb_agg(to_jsonb(b) - 'id' - 'created_at' - 'updated_at')
            FROM public.business_hours b
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 12: Insert default profiles
-- =====================================================

INSERT INTO public.settings_profiles (name, description, profile_type, is_system, settings_snapshot) VALUES
    ('Production', 'Configuration de production standard', 'production', true, '{}'),
    ('Test', 'Configuration pour tests et développement', 'test', true, '{}'),
    ('Formation', 'Configuration pour la formation du personnel', 'training', true, '{}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 13: Timestamp triggers for new tables
-- =====================================================

DROP TRIGGER IF EXISTS update_terminal_settings_timestamp ON public.terminal_settings;
CREATE TRIGGER update_terminal_settings_timestamp
    BEFORE UPDATE ON public.terminal_settings
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

DROP TRIGGER IF EXISTS update_settings_profiles_timestamp ON public.settings_profiles;
CREATE TRIGGER update_settings_profiles_timestamp
    BEFORE UPDATE ON public.settings_profiles
    FOR EACH ROW EXECUTE FUNCTION public.settings_update_timestamp();

-- =====================================================
-- STEP 14: Grants
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.terminal_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings_profiles TO authenticated;
GRANT SELECT ON public.sound_assets TO authenticated;

-- =====================================================
-- STEP 15: Comments
-- =====================================================

COMMENT ON TABLE public.terminal_settings IS 'Per-terminal settings overrides';
COMMENT ON TABLE public.settings_profiles IS 'Saved settings configurations (production, test, training)';
COMMENT ON TABLE public.sound_assets IS 'Audio files for POS notifications';

COMMENT ON FUNCTION public.get_terminal_setting IS 'Get a terminal-specific setting';
COMMENT ON FUNCTION public.set_terminal_setting IS 'Set a terminal-specific setting';
COMMENT ON FUNCTION public.get_all_terminal_settings IS 'Get all settings for a terminal';
COMMENT ON FUNCTION public.create_settings_profile IS 'Create a profile from current settings';
COMMENT ON FUNCTION public.apply_settings_profile IS 'Apply a saved profile to current settings';
COMMENT ON FUNCTION public.export_settings IS 'Export all settings as JSON';
