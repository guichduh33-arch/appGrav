-- Epic 10 Phase 1: Settings Expansion Foundation
-- Adds 8 new setting categories and ~65 configurable settings rows
-- All settings are is_system: true (cannot be deleted) but editable
-- Default values match actual hardcoded constants in the codebase

DO $$
DECLARE
  v_cat_id UUID;
  v_sort INT;
BEGIN

  -- =====================================================
  -- Phase A: Insert 8 new settings categories
  -- =====================================================

  -- pos_config
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('pos_config', 'Configuration POS', 'POS Configuration', 'Konfigurasi POS', 'Paramètres du point de vente', 'Point of sale configuration', 'Pengaturan titik penjualan', 'ShoppingCart', 22, true, 'settings.view')
  ON CONFLICT (code) DO NOTHING;

  -- financial
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('financial', 'Financier', 'Financial', 'Keuangan', 'Paramètres financiers et monétaires', 'Financial and monetary settings', 'Pengaturan keuangan dan moneter', 'Banknote', 35, true, 'settings.update')
  ON CONFLICT (code) DO NOTHING;

  -- inventory_config
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('inventory_config', 'Configuration Inventaire', 'Inventory Configuration', 'Konfigurasi Inventaris', 'Paramètres avancés de gestion des stocks', 'Advanced stock management settings', 'Pengaturan manajemen stok lanjutan', 'PackageSearch', 42, true, 'settings.view')
  ON CONFLICT (code) DO NOTHING;

  -- loyalty
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('loyalty', 'Fidélité', 'Loyalty', 'Loyalitas', 'Paramètres du programme de fidélité', 'Loyalty program settings', 'Pengaturan program loyalitas', 'Heart', 55, true, 'settings.view')
  ON CONFLICT (code) DO NOTHING;

  -- b2b
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('b2b', 'B2B', 'B2B', 'B2B', 'Paramètres de vente inter-entreprises', 'Business-to-business settings', 'Pengaturan bisnis ke bisnis', 'Building', 57, true, 'settings.view')
  ON CONFLICT (code) DO NOTHING;

  -- kds_config
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('kds_config', 'Configuration KDS', 'KDS Configuration', 'Konfigurasi KDS', 'Paramètres du système d''affichage cuisine', 'Kitchen Display System settings', 'Pengaturan Sistem Tampilan Dapur', 'ChefHat', 62, true, 'settings.view')
  ON CONFLICT (code) DO NOTHING;

  -- display
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('display', 'Affichage', 'Display', 'Tampilan', 'Paramètres d''affichage client', 'Customer display settings', 'Pengaturan tampilan pelanggan', 'Monitor', 64, true, 'settings.view')
  ON CONFLICT (code) DO NOTHING;

  -- sync_advanced
  INSERT INTO public.settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, is_active, required_permission)
  VALUES ('sync_advanced', 'Synchronisation Avancée', 'Advanced Sync', 'Sinkronisasi Lanjutan', 'Paramètres avancés de synchronisation', 'Advanced synchronization settings', 'Pengaturan sinkronisasi lanjutan', 'RefreshCw', 95, true, 'settings.update')
  ON CONFLICT (code) DO NOTHING;

  -- =====================================================
  -- Phase B: Insert ~65 settings rows
  -- =====================================================

  -- ---------------------------------------------------
  -- pos_config (9 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'pos_config';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.quick_payment_amounts', '[50000,100000,150000,200000,500000]'::jsonb, 'array',
    'Montants de paiement rapide', 'Quick Payment Amounts', 'Jumlah Pembayaran Cepat',
    'Boutons de montant prédéfinis sur l''écran de paiement', 'Predefined amount buttons on the payment screen', 'Tombol jumlah yang telah ditentukan di layar pembayaran',
    '[50000,100000,150000,200000,500000]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.shift_opening_cash_presets', '[100000,200000,300000,500000,1000000]'::jsonb, 'array',
    'Préréglages caisse d''ouverture', 'Shift Opening Cash Presets', 'Preset Kas Pembukaan Shift',
    'Options de montant initial de caisse', 'Predefined opening cash amount options', 'Opsi jumlah kas pembukaan',
    '[100000,200000,300000,500000,1000000]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.quick_discount_percentages', '[5,10,15,20,25,50]'::jsonb, 'array',
    'Pourcentages de remise rapide', 'Quick Discount Percentages', 'Persentase Diskon Cepat',
    'Boutons de remise prédéfinis', 'Predefined discount percentage buttons', 'Tombol persentase diskon yang telah ditentukan',
    '[5,10,15,20,25,50]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.max_discount_percentage', '100'::jsonb, 'number',
    'Remise maximale (%)', 'Max Discount Percentage', 'Persentase Diskon Maksimum',
    'Pourcentage maximum de remise autorisé', 'Maximum allowed discount percentage', 'Persentase diskon maksimum yang diizinkan',
    '100'::jsonb, '{"min": 0, "max": 100}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.shift_reconciliation_tolerance', '5000'::jsonb, 'number',
    'Tolérance de réconciliation', 'Shift Reconciliation Tolerance', 'Toleransi Rekonsiliasi Shift',
    'Écart toléré entre caisse attendue et réelle (IDR)', 'Allowed difference between expected and actual cash (IDR)', 'Selisih yang diizinkan antara kas yang diharapkan dan aktual (IDR)',
    '5000'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.refund_methods', '["same","cash","card","transfer"]'::jsonb, 'array',
    'Méthodes de remboursement', 'Refund Methods', 'Metode Pengembalian Dana',
    'Méthodes de remboursement disponibles', 'Available refund methods', 'Metode pengembalian dana yang tersedia',
    '["same","cash","card","transfer"]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.void_required_roles', '["manager","admin"]'::jsonb, 'array',
    'Rôles requis pour annulation', 'Void Required Roles', 'Peran yang Diperlukan untuk Void',
    'Rôles autorisés à annuler une commande', 'Roles authorized to void an order', 'Peran yang diizinkan untuk membatalkan pesanan',
    '["manager","admin"]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.refund_required_roles', '["manager","admin"]'::jsonb, 'array',
    'Rôles requis pour remboursement', 'Refund Required Roles', 'Peran yang Diperlukan untuk Refund',
    'Rôles autorisés à effectuer un remboursement', 'Roles authorized to process a refund', 'Peran yang diizinkan untuk memproses pengembalian dana',
    '["manager","admin"]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'pos_config.shift_required_roles', '["cashier","manager","admin","barista"]'::jsonb, 'array',
    'Rôles requis pour les shifts', 'Shift Required Roles', 'Peran yang Diperlukan untuk Shift',
    'Rôles autorisés à ouvrir/fermer un shift', 'Roles authorized to open/close a shift', 'Peran yang diizinkan untuk membuka/menutup shift',
    '["cashier","manager","admin","barista"]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- financial (4 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'financial';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'financial.max_payment_amount', '10000000000'::jsonb, 'number',
    'Montant maximum de paiement', 'Max Payment Amount', 'Jumlah Pembayaran Maksimum',
    'Montant maximum autorisé pour un paiement unique (IDR)', 'Maximum allowed amount for a single payment (IDR)', 'Jumlah maksimum yang diizinkan untuk satu pembayaran (IDR)',
    '10000000000'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'financial.currency_rounding_unit', '100'::jsonb, 'number',
    'Unité d''arrondi monétaire', 'Currency Rounding Unit', 'Unit Pembulatan Mata Uang',
    'Arrondi des montants au multiple le plus proche (IDR)', 'Round amounts to nearest multiple (IDR)', 'Bulatkan jumlah ke kelipatan terdekat (IDR)',
    '100'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'financial.rounding_tolerance', '1'::jsonb, 'number',
    'Tolérance d''arrondi', 'Rounding Tolerance', 'Toleransi Pembulatan',
    'Tolérance d''arrondi en IDR', 'Rounding tolerance in IDR', 'Toleransi pembulatan dalam IDR',
    '1'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'financial.reference_required_methods', '["card","qris","edc","transfer"]'::jsonb, 'array',
    'Méthodes nécessitant une référence', 'Reference Required Methods', 'Metode yang Memerlukan Referensi',
    'Méthodes de paiement nécessitant un numéro de référence', 'Payment methods requiring a reference number', 'Metode pembayaran yang memerlukan nomor referensi',
    '["card","qris","edc","transfer"]'::jsonb, '{"min_items": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- inventory_config (13 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'inventory_config';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.stock_warning_threshold', '10'::jsonb, 'number',
    'Seuil d''alerte stock', 'Stock Warning Threshold', 'Ambang Peringatan Stok',
    'Quantité en dessous de laquelle un avertissement est affiché', 'Quantity below which a warning is displayed', 'Jumlah di bawah mana peringatan ditampilkan',
    '10'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.stock_critical_threshold', '5'::jsonb, 'number',
    'Seuil critique stock', 'Stock Critical Threshold', 'Ambang Kritis Stok',
    'Quantité en dessous de laquelle une alerte critique est affichée', 'Quantity below which a critical alert is displayed', 'Jumlah di bawah mana peringatan kritis ditampilkan',
    '5'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.stock_percentage_warning', '50'::jsonb, 'number',
    'Seuil d''alerte stock (%)', 'Stock Percentage Warning', 'Peringatan Persentase Stok',
    'Pourcentage de stock restant déclenchant un avertissement', 'Remaining stock percentage triggering a warning', 'Persentase stok tersisa yang memicu peringatan',
    '50'::jsonb, '{"min": 0, "max": 100}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.stock_percentage_critical', '20'::jsonb, 'number',
    'Seuil critique stock (%)', 'Stock Percentage Critical', 'Kritis Persentase Stok',
    'Pourcentage de stock restant déclenchant une alerte critique', 'Remaining stock percentage triggering a critical alert', 'Persentase stok tersisa yang memicu peringatan kritis',
    '20'::jsonb, '{"min": 0, "max": 100}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.reorder_lookback_days', '30'::jsonb, 'number',
    'Jours de rétrospective réapprovisionnement', 'Reorder Lookback Days', 'Hari Tinjauan Pemesanan Ulang',
    'Nombre de jours pour calculer la consommation moyenne', 'Number of days to calculate average consumption', 'Jumlah hari untuk menghitung konsumsi rata-rata',
    '30'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.production_lookback_days', '7'::jsonb, 'number',
    'Jours de rétrospective production', 'Production Lookback Days', 'Hari Tinjauan Produksi',
    'Nombre de jours pour les calculs de production', 'Number of days for production calculations', 'Jumlah hari untuk perhitungan produksi',
    '7'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.max_stock_multiplier', '2'::jsonb, 'number',
    'Multiplicateur de stock maximum', 'Max Stock Multiplier', 'Pengali Stok Maksimum',
    'Multiplicateur pour calculer le stock maximum recommandé', 'Multiplier to calculate maximum recommended stock', 'Pengali untuk menghitung stok maksimum yang direkomendasikan',
    '2'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.po_lead_time_days', '7'::jsonb, 'number',
    'Délai de livraison PO (jours)', 'PO Lead Time Days', 'Hari Waktu Tunggu PO',
    'Délai par défaut pour les commandes fournisseur', 'Default lead time for purchase orders', 'Waktu tunggu default untuk pesanan pembelian',
    '7'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.stock_movements_default_limit', '500'::jsonb, 'number',
    'Limite mouvements de stock par défaut', 'Stock Movements Default Limit', 'Batas Default Pergerakan Stok',
    'Nombre maximum de mouvements de stock affichés', 'Maximum number of stock movements displayed', 'Jumlah maksimum pergerakan stok yang ditampilkan',
    '500'::jsonb, '{"min": 10}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.stock_movements_product_limit', '100'::jsonb, 'number',
    'Limite mouvements par produit', 'Stock Movements Product Limit', 'Batas Pergerakan per Produk',
    'Nombre maximum de mouvements par produit', 'Maximum number of movements per product', 'Jumlah maksimum pergerakan per produk',
    '100'::jsonb, '{"min": 10}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.low_stock_refresh_interval_seconds', '300'::jsonb, 'number',
    'Intervalle rafraîchissement stock bas (s)', 'Low Stock Refresh Interval (seconds)', 'Interval Penyegaran Stok Rendah (detik)',
    'Intervalle de rafraîchissement des alertes de stock bas', 'Refresh interval for low stock alerts', 'Interval penyegaran untuk peringatan stok rendah',
    '300'::jsonb, '{"min": 30}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.production_priority_high_threshold', '20'::jsonb, 'number',
    'Seuil priorité haute production (%)', 'Production Priority High Threshold', 'Ambang Prioritas Tinggi Produksi',
    'Pourcentage de stock restant pour priorité haute', 'Remaining stock percentage for high priority', 'Persentase stok tersisa untuk prioritas tinggi',
    '20'::jsonb, '{"min": 0, "max": 100}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'inventory_config.production_priority_medium_threshold', '50'::jsonb, 'number',
    'Seuil priorité moyenne production (%)', 'Production Priority Medium Threshold', 'Ambang Prioritas Sedang Produksi',
    'Pourcentage de stock restant pour priorité moyenne', 'Remaining stock percentage for medium priority', 'Persentase stok tersisa untuk prioritas sedang',
    '50'::jsonb, '{"min": 0, "max": 100}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- loyalty (5 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'loyalty';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'loyalty.tier_discounts', '{"bronze":0,"silver":5,"gold":8,"platinum":10}'::jsonb, 'json',
    'Remises par niveau', 'Tier Discounts', 'Diskon per Tingkat',
    'Pourcentage de remise par niveau de fidélité', 'Discount percentage per loyalty tier', 'Persentase diskon per tingkat loyalitas',
    '{"bronze":0,"silver":5,"gold":8,"platinum":10}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'loyalty.tier_thresholds', '{"bronze":0,"silver":500,"gold":2000,"platinum":5000}'::jsonb, 'json',
    'Seuils de niveau', 'Tier Thresholds', 'Ambang Tingkat',
    'Points requis pour chaque niveau de fidélité', 'Points required for each loyalty tier', 'Poin yang diperlukan untuk setiap tingkat loyalitas',
    '{"bronze":0,"silver":500,"gold":2000,"platinum":5000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'loyalty.tier_colors', '{"bronze":"#cd7f32","silver":"#c0c0c0","gold":"#ffd700","platinum":"#e5e4e2"}'::jsonb, 'json',
    'Couleurs des niveaux', 'Tier Colors', 'Warna Tingkat',
    'Couleurs associées à chaque niveau de fidélité', 'Colors associated with each loyalty tier', 'Warna yang terkait dengan setiap tingkat loyalitas',
    '{"bronze":"#cd7f32","silver":"#c0c0c0","gold":"#ffd700","platinum":"#e5e4e2"}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'loyalty.points_per_idr', '1000'::jsonb, 'number',
    'IDR par point', 'IDR per Point', 'IDR per Poin',
    'Montant en IDR dépensé pour gagner 1 point', 'Amount in IDR spent to earn 1 point', 'Jumlah IDR yang dibelanjakan untuk mendapatkan 1 poin',
    '1000'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'loyalty.default_customer_category_slug', '"retail"'::jsonb, 'string',
    'Catégorie client par défaut', 'Default Customer Category', 'Kategori Pelanggan Default',
    'Slug de la catégorie client par défaut', 'Default customer category slug', 'Slug kategori pelanggan default',
    '"retail"'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- b2b (4 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'b2b';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'b2b.default_payment_terms_days', '30'::jsonb, 'number',
    'Délai de paiement par défaut (jours)', 'Default Payment Terms (days)', 'Syarat Pembayaran Default (hari)',
    'Nombre de jours par défaut pour le paiement B2B', 'Default number of days for B2B payment', 'Jumlah hari default untuk pembayaran B2B',
    '30'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'b2b.critical_overdue_threshold_days', '30'::jsonb, 'number',
    'Seuil critique retard (jours)', 'Critical Overdue Threshold (days)', 'Ambang Kritis Keterlambatan (hari)',
    'Nombre de jours après échéance pour marquer comme critique', 'Days past due to mark as critical', 'Hari setelah jatuh tempo untuk ditandai sebagai kritis',
    '30'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'b2b.aging_buckets', '[{"label":"Current","min":0,"max":30},{"label":"Overdue","min":31,"max":60},{"label":"Critical","min":61,"max":null}]'::jsonb, 'json',
    'Tranches de vieillissement', 'Aging Buckets', 'Kelompok Umur Piutang',
    'Configuration des tranches d''âge des créances', 'Accounts receivable aging bucket configuration', 'Konfigurasi kelompok umur piutang',
    '[{"label":"Current","min":0,"max":30},{"label":"Overdue","min":31,"max":60},{"label":"Critical","min":61,"max":null}]'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'b2b.payment_term_options', '["cod","net15","net30","net60"]'::jsonb, 'array',
    'Options de conditions de paiement', 'Payment Term Options', 'Opsi Syarat Pembayaran',
    'Conditions de paiement disponibles pour les clients B2B', 'Available payment terms for B2B customers', 'Syarat pembayaran yang tersedia untuk pelanggan B2B',
    '["cod","net15","net30","net60"]'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- kds_config (5 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'kds_config';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'kds_config.urgency_warning_seconds', '300'::jsonb, 'number',
    'Seuil d''urgence avertissement (s)', 'Urgency Warning Threshold (seconds)', 'Ambang Peringatan Urgensi (detik)',
    'Secondes avant qu''une commande soit marquée comme urgente', 'Seconds before an order is marked as urgent', 'Detik sebelum pesanan ditandai sebagai mendesak',
    '300'::jsonb, '{"min": 30}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'kds_config.urgency_critical_seconds', '600'::jsonb, 'number',
    'Seuil d''urgence critique (s)', 'Urgency Critical Threshold (seconds)', 'Ambang Kritis Urgensi (detik)',
    'Secondes avant qu''une commande soit marquée comme critique', 'Seconds before an order is marked as critical', 'Detik sebelum pesanan ditandai sebagai kritis',
    '600'::jsonb, '{"min": 60}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'kds_config.auto_remove_delay_ms', '5000'::jsonb, 'number',
    'Délai de suppression auto (ms)', 'Auto Remove Delay (ms)', 'Penundaan Hapus Otomatis (ms)',
    'Délai avant suppression automatique des commandes terminées', 'Delay before auto-removing completed orders', 'Penundaan sebelum penghapusan otomatis pesanan selesai',
    '5000'::jsonb, '{"min": 1000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'kds_config.poll_interval_ms', '5000'::jsonb, 'number',
    'Intervalle de polling (ms)', 'Poll Interval (ms)', 'Interval Polling (ms)',
    'Intervalle de vérification des nouvelles commandes', 'Interval for checking new orders', 'Interval untuk memeriksa pesanan baru',
    '5000'::jsonb, '{"min": 1000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'kds_config.exit_animation_duration_ms', '300'::jsonb, 'number',
    'Durée animation de sortie (ms)', 'Exit Animation Duration (ms)', 'Durasi Animasi Keluar (ms)',
    'Durée de l''animation de sortie des cartes KDS', 'Duration of the KDS card exit animation', 'Durasi animasi keluar kartu KDS',
    '300'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- display (4 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'display';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'display.idle_timeout_seconds', '30'::jsonb, 'number',
    'Délai d''inactivité (s)', 'Idle Timeout (seconds)', 'Batas Waktu Menganggur (detik)',
    'Secondes avant l''affichage du mode veille', 'Seconds before showing idle screen', 'Detik sebelum menampilkan layar siaga',
    '30'::jsonb, '{"min": 5}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'display.promo_rotation_interval_seconds', '10'::jsonb, 'number',
    'Intervalle rotation promos (s)', 'Promo Rotation Interval (seconds)', 'Interval Rotasi Promo (detik)',
    'Secondes entre chaque changement de promotion', 'Seconds between each promotion change', 'Detik antara setiap perubahan promosi',
    '10'::jsonb, '{"min": 3}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'display.ready_order_visible_duration_minutes', '5'::jsonb, 'number',
    'Durée affichage commande prête (min)', 'Ready Order Visible Duration (minutes)', 'Durasi Tampil Pesanan Siap (menit)',
    'Minutes pendant lesquelles une commande prête reste affichée', 'Minutes a ready order stays visible', 'Menit pesanan siap tetap terlihat',
    '5'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'display.broadcast_debounce_ms', '100'::jsonb, 'number',
    'Délai anti-rebond broadcast (ms)', 'Broadcast Debounce (ms)', 'Debounce Siaran (ms)',
    'Délai de debounce pour la diffusion d''affichage', 'Debounce delay for display broadcast', 'Penundaan debounce untuk siaran tampilan',
    '100'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- security (existing category, 4 new rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'security';

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'security.pin_min_length', '4'::jsonb, 'number',
    'Longueur minimale du PIN', 'PIN Minimum Length', 'Panjang Minimum PIN',
    'Nombre minimum de chiffres pour le PIN', 'Minimum number of digits for PIN', 'Jumlah digit minimum untuk PIN',
    '4'::jsonb, '{"min": 4, "max": 10}'::jsonb, true, 200)
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'security.pin_max_length', '6'::jsonb, 'number',
    'Longueur maximale du PIN', 'PIN Maximum Length', 'Panjang Maksimum PIN',
    'Nombre maximum de chiffres pour le PIN', 'Maximum number of digits for PIN', 'Jumlah digit maksimum untuk PIN',
    '6'::jsonb, '{"min": 4, "max": 10}'::jsonb, true, 210)
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'security.pin_max_attempts', '3'::jsonb, 'number',
    'Tentatives PIN maximum', 'PIN Max Attempts', 'Percobaan PIN Maksimum',
    'Nombre maximum de tentatives avant verrouillage', 'Maximum attempts before lockout', 'Jumlah percobaan maksimum sebelum terkunci',
    '3'::jsonb, '{"min": 1, "max": 10}'::jsonb, true, 220)
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'security.pin_cooldown_minutes', '15'::jsonb, 'number',
    'Durée de verrouillage PIN (min)', 'PIN Cooldown (minutes)', 'Pendinginan PIN (menit)',
    'Minutes de verrouillage après dépassement des tentatives', 'Minutes of lockout after exceeding attempts', 'Menit penguncian setelah melebihi percobaan',
    '15'::jsonb, '{"min": 1}'::jsonb, true, 230)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- sync_advanced (14 rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'sync_advanced';

  v_sort := 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.startup_delay_ms', '5000'::jsonb, 'number',
    'Délai de démarrage (ms)', 'Startup Delay (ms)', 'Penundaan Startup (ms)',
    'Délai avant le premier cycle de synchronisation', 'Delay before first sync cycle', 'Penundaan sebelum siklus sinkronisasi pertama',
    '5000'::jsonb, '{"min": 1000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.background_interval_ms', '30000'::jsonb, 'number',
    'Intervalle de fond (ms)', 'Background Interval (ms)', 'Interval Latar Belakang (ms)',
    'Intervalle entre les cycles de synchronisation en arrière-plan', 'Interval between background sync cycles', 'Interval antara siklus sinkronisasi latar belakang',
    '30000'::jsonb, '{"min": 5000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.item_process_delay_ms', '100'::jsonb, 'number',
    'Délai traitement par élément (ms)', 'Item Process Delay (ms)', 'Penundaan Proses per Item (ms)',
    'Délai entre le traitement de chaque élément de la file', 'Delay between processing each queue item', 'Penundaan antara pemrosesan setiap item antrean',
    '100'::jsonb, '{"min": 0}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.retry_backoff_delays_ms', '[5000,10000,30000,60000,300000]'::jsonb, 'array',
    'Délais de backoff (ms)', 'Retry Backoff Delays (ms)', 'Penundaan Backoff Percobaan Ulang (ms)',
    'Délais progressifs de re-tentative en millisecondes', 'Progressive retry delays in milliseconds', 'Penundaan percobaan ulang progresif dalam milidetik',
    '[5000,10000,30000,60000,300000]'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.max_queue_size', '500'::jsonb, 'number',
    'Taille max de la file', 'Max Queue Size', 'Ukuran Antrean Maksimum',
    'Nombre maximum d''éléments dans la file de synchronisation', 'Maximum number of items in the sync queue', 'Jumlah maksimum item dalam antrean sinkronisasi',
    '500'::jsonb, '{"min": 10}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.max_retries', '5'::jsonb, 'number',
    'Tentatives max', 'Max Retries', 'Percobaan Ulang Maksimum',
    'Nombre maximum de re-tentatives par élément', 'Maximum number of retries per item', 'Jumlah percobaan ulang maksimum per item',
    '5'::jsonb, '{"min": 1, "max": 20}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.cache_ttl_default_hours', '24'::jsonb, 'number',
    'TTL cache par défaut (heures)', 'Default Cache TTL (hours)', 'TTL Cache Default (jam)',
    'Durée de vie par défaut du cache en heures', 'Default cache time-to-live in hours', 'Waktu hidup cache default dalam jam',
    '24'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.cache_ttl_orders_hours', '168'::jsonb, 'number',
    'TTL cache commandes (heures)', 'Orders Cache TTL (hours)', 'TTL Cache Pesanan (jam)',
    'Durée de vie du cache commandes en heures (168 = 7 jours)', 'Orders cache time-to-live in hours (168 = 7 days)', 'Waktu hidup cache pesanan dalam jam (168 = 7 hari)',
    '168'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.cache_refresh_interval_hours', '1'::jsonb, 'number',
    'Intervalle de rafraîchissement cache (heures)', 'Cache Refresh Interval (hours)', 'Interval Penyegaran Cache (jam)',
    'Intervalle de rafraîchissement automatique du cache', 'Automatic cache refresh interval', 'Interval penyegaran cache otomatis',
    '1'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.lan_heartbeat_interval_ms', '30000'::jsonb, 'number',
    'Intervalle heartbeat LAN (ms)', 'LAN Heartbeat Interval (ms)', 'Interval Heartbeat LAN (ms)',
    'Intervalle d''envoi des heartbeats LAN', 'LAN heartbeat send interval', 'Interval pengiriman heartbeat LAN',
    '30000'::jsonb, '{"min": 5000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.lan_stale_timeout_ms', '120000'::jsonb, 'number',
    'Timeout stale LAN (ms)', 'LAN Stale Timeout (ms)', 'Batas Waktu Basi LAN (ms)',
    'Durée avant qu''un appareil LAN soit considéré comme inactif', 'Duration before a LAN device is considered stale', 'Durasi sebelum perangkat LAN dianggap tidak aktif',
    '120000'::jsonb, '{"min": 10000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.lan_max_reconnect_attempts', '10'::jsonb, 'number',
    'Tentatives max reconnexion LAN', 'LAN Max Reconnect Attempts', 'Percobaan Koneksi Ulang LAN Maksimum',
    'Nombre maximum de tentatives de reconnexion LAN', 'Maximum LAN reconnection attempts', 'Jumlah percobaan koneksi ulang LAN maksimum',
    '10'::jsonb, '{"min": 1}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.lan_reconnect_backoff_base_ms', '1000'::jsonb, 'number',
    'Base backoff reconnexion LAN (ms)', 'LAN Reconnect Backoff Base (ms)', 'Basis Backoff Koneksi Ulang LAN (ms)',
    'Délai de base pour le backoff de reconnexion LAN', 'Base delay for LAN reconnection backoff', 'Penundaan dasar untuk backoff koneksi ulang LAN',
    '1000'::jsonb, '{"min": 100}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  v_sort := v_sort + 10;
  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'sync_advanced.lan_reconnect_backoff_max_ms', '60000'::jsonb, 'number',
    'Max backoff reconnexion LAN (ms)', 'LAN Reconnect Backoff Max (ms)', 'Maks Backoff Koneksi Ulang LAN (ms)',
    'Délai maximum pour le backoff de reconnexion LAN', 'Maximum delay for LAN reconnection backoff', 'Penundaan maksimum untuk backoff koneksi ulang LAN',
    '60000'::jsonb, '{"min": 1000}'::jsonb, true, v_sort)
  ON CONFLICT (key) DO NOTHING;

  -- ---------------------------------------------------
  -- printing (existing category, 3 new rows)
  -- ---------------------------------------------------
  SELECT id INTO v_cat_id FROM public.settings_categories WHERE code = 'printing';

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, is_system, sort_order)
  VALUES (v_cat_id, 'printing.server_url', '"http://localhost:3001"'::jsonb, 'string',
    'URL du serveur d''impression', 'Print Server URL', 'URL Server Cetak',
    'Adresse du serveur d''impression local', 'Local print server address', 'Alamat server cetak lokal',
    '"http://localhost:3001"'::jsonb, true, 200)
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'printing.request_timeout_ms', '5000'::jsonb, 'number',
    'Timeout requête impression (ms)', 'Print Request Timeout (ms)', 'Batas Waktu Permintaan Cetak (ms)',
    'Délai d''attente maximum pour une requête d''impression', 'Maximum wait time for a print request', 'Waktu tunggu maksimum untuk permintaan cetak',
    '5000'::jsonb, '{"min": 1000}'::jsonb, true, 210)
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO public.settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, validation_rules, is_system, sort_order)
  VALUES (v_cat_id, 'printing.health_check_timeout_ms', '2000'::jsonb, 'number',
    'Timeout vérification santé (ms)', 'Health Check Timeout (ms)', 'Batas Waktu Pemeriksaan Kesehatan (ms)',
    'Délai d''attente pour la vérification de l''état du serveur', 'Wait time for server health check', 'Waktu tunggu untuk pemeriksaan kesehatan server',
    '2000'::jsonb, '{"min": 500}'::jsonb, true, 220)
  ON CONFLICT (key) DO NOTHING;

  RAISE NOTICE 'Epic 10 Phase 1: Settings expansion complete - 8 categories + 65 settings inserted';
END $$;
