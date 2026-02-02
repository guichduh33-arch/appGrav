-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 014: Seed Data (Initial Configuration)
-- =====================================================

-- =====================================================
-- DEFAULT SECTIONS
-- =====================================================
INSERT INTO sections (code, name, description, sort_order) VALUES
    ('BAKERY', 'Boulangerie', 'Production boulangerie et viennoiseries', 1),
    ('PASTRY', 'Pâtisserie', 'Production pâtisserie', 2),
    ('KITCHEN', 'Cuisine', 'Préparation plats chauds et froids', 3),
    ('BAR', 'Bar', 'Préparation boissons', 4),
    ('DISPLAY', 'Vitrine', 'Produits en vitrine', 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEFAULT STOCK LOCATIONS
-- =====================================================
INSERT INTO stock_locations (code, name, location_type, is_default, sort_order) VALUES
    ('MAIN', 'Entrepôt Principal', 'main_warehouse', TRUE, 1),
    ('KITCHEN', 'Cuisine', 'kitchen', FALSE, 2),
    ('BAKERY', 'Boulangerie', 'section', FALSE, 3),
    ('BAR', 'Bar', 'section', FALSE, 4),
    ('DISPLAY', 'Vitrine', 'storage', FALSE, 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEFAULT ROLES
-- =====================================================
INSERT INTO roles (code, name_fr, name_en, name_id, is_system, hierarchy_level, description) VALUES
    ('SUPER_ADMIN', 'Super Administrateur', 'Super Administrator', 'Super Administrator', TRUE, 100, 'Full system access'),
    ('ADMIN', 'Administrateur', 'Administrator', 'Administrator', TRUE, 90, 'Full access except system settings'),
    ('MANAGER', 'Gérant', 'Manager', 'Manajer', TRUE, 70, 'Store management and reports'),
    ('CASHIER', 'Caissier', 'Cashier', 'Kasir', TRUE, 50, 'POS operations'),
    ('BAKER', 'Boulanger', 'Baker', 'Pembuat Roti', TRUE, 40, 'Production and recipes'),
    ('INVENTORY', 'Gestionnaire Stock', 'Inventory Manager', 'Manajer Inventaris', TRUE, 40, 'Stock management'),
    ('SERVER', 'Serveur', 'Server', 'Pelayan', TRUE, 30, 'Order taking'),
    ('BARISTA', 'Barista', 'Barista', 'Barista', TRUE, 30, 'Beverage preparation'),
    ('KITCHEN', 'Cuisine', 'Kitchen', 'Dapur', TRUE, 30, 'Food preparation'),
    ('VIEWER', 'Lecteur', 'Viewer', 'Penampil', TRUE, 10, 'Read-only access')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEFAULT PERMISSIONS
-- =====================================================
INSERT INTO permissions (code, module, action, name_fr, name_en, name_id, is_sensitive) VALUES
    -- Sales
    ('sales.view', 'sales', 'view', 'Voir les ventes', 'View sales', 'Lihat penjualan', FALSE),
    ('sales.create', 'sales', 'create', 'Créer une vente', 'Create sale', 'Buat penjualan', FALSE),
    ('sales.void', 'sales', 'void', 'Annuler une vente', 'Void sale', 'Batalkan penjualan', TRUE),
    ('sales.discount', 'sales', 'discount', 'Appliquer remise', 'Apply discount', 'Terapkan diskon', TRUE),
    ('sales.refund', 'sales', 'refund', 'Effectuer remboursement', 'Process refund', 'Proses pengembalian', TRUE),
    ('sales.report', 'sales', 'report', 'Voir rapports ventes', 'View sales reports', 'Lihat laporan penjualan', FALSE),
    -- Inventory
    ('inventory.view', 'inventory', 'view', 'Voir inventaire', 'View inventory', 'Lihat inventaris', FALSE),
    ('inventory.create', 'inventory', 'create', 'Ajouter article', 'Add item', 'Tambah barang', FALSE),
    ('inventory.update', 'inventory', 'update', 'Modifier article', 'Edit item', 'Edit barang', FALSE),
    ('inventory.delete', 'inventory', 'delete', 'Supprimer article', 'Delete item', 'Hapus barang', TRUE),
    ('inventory.adjust', 'inventory', 'adjust', 'Ajuster stock', 'Adjust stock', 'Sesuaikan stok', TRUE),
    ('inventory.transfer', 'inventory', 'transfer', 'Transférer stock', 'Transfer stock', 'Transfer stok', FALSE),
    -- Products
    ('products.view', 'products', 'view', 'Voir produits', 'View products', 'Lihat produk', FALSE),
    ('products.create', 'products', 'create', 'Créer produit', 'Create product', 'Buat produk', FALSE),
    ('products.update', 'products', 'update', 'Modifier produit', 'Edit product', 'Edit produk', FALSE),
    ('products.delete', 'products', 'delete', 'Supprimer produit', 'Delete product', 'Hapus produk', TRUE),
    ('products.pricing', 'products', 'pricing', 'Modifier prix', 'Edit pricing', 'Edit harga', TRUE),
    -- Customers
    ('customers.view', 'customers', 'view', 'Voir clients', 'View customers', 'Lihat pelanggan', FALSE),
    ('customers.create', 'customers', 'create', 'Créer client', 'Create customer', 'Buat pelanggan', FALSE),
    ('customers.update', 'customers', 'update', 'Modifier client', 'Edit customer', 'Edit pelanggan', FALSE),
    ('customers.delete', 'customers', 'delete', 'Supprimer client', 'Delete customer', 'Hapus pelanggan', TRUE),
    ('customers.loyalty', 'customers', 'loyalty', 'Gérer fidélité', 'Manage loyalty', 'Kelola loyalitas', FALSE),
    -- Reports
    ('reports.sales', 'reports', 'sales', 'Rapports ventes', 'Sales reports', 'Laporan penjualan', FALSE),
    ('reports.inventory', 'reports', 'inventory', 'Rapports inventaire', 'Inventory reports', 'Laporan inventaris', FALSE),
    ('reports.financial', 'reports', 'financial', 'Rapports financiers', 'Financial reports', 'Laporan keuangan', TRUE),
    -- Users
    ('users.view', 'users', 'view', 'Voir utilisateurs', 'View users', 'Lihat pengguna', FALSE),
    ('users.create', 'users', 'create', 'Créer utilisateur', 'Create user', 'Buat pengguna', TRUE),
    ('users.update', 'users', 'update', 'Modifier utilisateur', 'Edit user', 'Edit pengguna', TRUE),
    ('users.delete', 'users', 'delete', 'Supprimer utilisateur', 'Delete user', 'Hapus pengguna', TRUE),
    ('users.roles', 'users', 'roles', 'Gérer rôles', 'Manage roles', 'Kelola peran', TRUE),
    -- Settings
    ('settings.view', 'settings', 'view', 'Voir paramètres', 'View settings', 'Lihat pengaturan', FALSE),
    ('settings.update', 'settings', 'update', 'Modifier paramètres', 'Edit settings', 'Edit pengaturan', TRUE),
    -- Production
    ('production.view', 'production', 'view', 'Voir production', 'View production', 'Lihat produksi', FALSE),
    ('production.create', 'production', 'create', 'Créer production', 'Create production', 'Buat produksi', FALSE),
    ('production.recipes', 'production', 'recipes', 'Gérer recettes', 'Manage recipes', 'Kelola resep', FALSE),
    -- Purchases
    ('purchases.view', 'purchases', 'view', 'Voir achats', 'View purchases', 'Lihat pembelian', FALSE),
    ('purchases.create', 'purchases', 'create', 'Créer commande', 'Create order', 'Buat pesanan', FALSE),
    ('purchases.approve', 'purchases', 'approve', 'Approuver commande', 'Approve order', 'Setujui pesanan', TRUE),
    -- POS
    ('pos.open_drawer', 'pos', 'open_drawer', 'Ouvrir caisse', 'Open drawer', 'Buka laci', FALSE),
    ('pos.close_session', 'pos', 'close_session', 'Clôturer session', 'Close session', 'Tutup sesi', TRUE),
    ('pos.price_override', 'pos', 'price_override', 'Modifier prix vente', 'Override price', 'Ubah harga jual', TRUE),
    -- KDS
    ('kds.view', 'kds', 'view', 'Voir écran cuisine', 'View kitchen display', 'Lihat layar dapur', FALSE),
    ('kds.update', 'kds', 'update', 'Mettre à jour statut', 'Update status', 'Update status', FALSE)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ASSIGN PERMISSIONS TO ROLES
-- =====================================================

-- SUPER_ADMIN gets ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN gets all except some system settings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- MANAGER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'MANAGER' AND p.code IN (
    'sales.view', 'sales.create', 'sales.void', 'sales.discount', 'sales.refund', 'sales.report',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.adjust', 'inventory.transfer',
    'products.view', 'products.create', 'products.update', 'products.pricing',
    'customers.view', 'customers.create', 'customers.update', 'customers.loyalty',
    'reports.sales', 'reports.inventory',
    'users.view', 'settings.view',
    'production.view', 'production.create', 'production.recipes',
    'purchases.view', 'purchases.create', 'purchases.approve',
    'pos.open_drawer', 'pos.close_session', 'pos.price_override',
    'kds.view', 'kds.update'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CASHIER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'CASHIER' AND p.code IN (
    'sales.view', 'sales.create',
    'products.view',
    'customers.view', 'customers.create', 'customers.loyalty',
    'pos.open_drawer',
    'kds.view'
) ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- DEFAULT LOYALTY TIERS
-- =====================================================
INSERT INTO loyalty_tiers (name, slug, min_lifetime_points, color, points_multiplier, discount_percentage, birthday_bonus_points, sort_order) VALUES
    ('Bronze', 'bronze', 0, '#CD7F32', 1.0, 0, 50, 1),
    ('Silver', 'silver', 500, '#C0C0C0', 1.25, 2, 100, 2),
    ('Gold', 'gold', 2000, '#FFD700', 1.5, 5, 200, 3),
    ('Platinum', 'platinum', 5000, '#E5E4E2', 2.0, 10, 500, 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DEFAULT CUSTOMER CATEGORIES
-- =====================================================
INSERT INTO customer_categories (name, slug, description, color, price_modifier_type, loyalty_enabled, points_per_amount, discount_percentage, is_default, sort_order) VALUES
    ('Client Standard', 'retail', 'Clients particuliers avec programme fidélité', '#6B8E6B', 'retail', TRUE, 1000, 0, TRUE, 1),
    ('B2B / Wholesale', 'wholesale', 'Clients professionnels avec tarifs wholesale', '#7BA3B5', 'wholesale', FALSE, 0, 0, FALSE, 2),
    ('Membre VIP', 'vip', 'Membres premium avec réductions spéciales', '#BA90A2', 'discount_percentage', TRUE, 500, 15, FALSE, 3),
    ('Staff', 'staff', 'Employés avec remise staff', '#EAC086', 'discount_percentage', FALSE, 0, 25, FALSE, 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DEFAULT TAX RATES
-- =====================================================
INSERT INTO tax_rates (code, name_fr, name_en, name_id, rate, is_inclusive, is_default) VALUES
    ('PPN_10', 'PPN 10%', 'VAT 10%', 'PPN 10%', 10.00, TRUE, TRUE),
    ('PPN_11', 'PPN 11%', 'VAT 11%', 'PPN 11%', 11.00, TRUE, FALSE),
    ('NO_TAX', 'Sans taxe', 'No tax', 'Tanpa pajak', 0.00, TRUE, FALSE)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEFAULT PAYMENT METHODS
-- =====================================================
INSERT INTO payment_methods (code, name_fr, name_en, name_id, icon, payment_type, is_default, sort_order) VALUES
    ('cash', 'Espèces', 'Cash', 'Tunai', 'Banknote', 'cash', TRUE, 1),
    ('card', 'Carte', 'Card', 'Kartu', 'CreditCard', 'card', FALSE, 2),
    ('qris', 'QRIS', 'QRIS', 'QRIS', 'QrCode', 'digital', FALSE, 3),
    ('edc', 'EDC', 'EDC', 'EDC', 'Smartphone', 'card', FALSE, 4),
    ('transfer', 'Virement', 'Bank Transfer', 'Transfer', 'Building', 'transfer', FALSE, 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEFAULT BUSINESS HOURS
-- =====================================================
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
    (0, '08:00', '17:00', FALSE),  -- Sunday
    (1, '07:00', '18:00', FALSE),  -- Monday
    (2, '07:00', '18:00', FALSE),  -- Tuesday
    (3, '07:00', '18:00', FALSE),  -- Wednesday
    (4, '07:00', '18:00', FALSE),  -- Thursday
    (5, '07:00', '18:00', FALSE),  -- Friday
    (6, '07:00', '18:00', FALSE)   -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- =====================================================
-- DEFAULT SETTINGS CATEGORIES
-- =====================================================
INSERT INTO settings_categories (code, name_fr, name_en, name_id, icon, sort_order, required_permission) VALUES
    ('company', 'Entreprise', 'Company', 'Perusahaan', 'Building2', 10, 'settings.view'),
    ('pos', 'Point de Vente', 'Point of Sale', 'Titik Penjualan', 'ShoppingCart', 20, 'settings.view'),
    ('tax', 'Fiscalité', 'Taxation', 'Perpajakan', 'Receipt', 30, 'settings.view'),
    ('inventory', 'Inventaire', 'Inventory', 'Inventaris', 'Package', 40, 'settings.view'),
    ('printing', 'Impression', 'Printing', 'Pencetakan', 'Printer', 50, 'settings.view'),
    ('localization', 'Localisation', 'Localization', 'Lokalisasi', 'Globe', 60, 'settings.view'),
    ('security', 'Sécurité', 'Security', 'Keamanan', 'Shield', 70, 'settings.update'),
    ('advanced', 'Avancé', 'Advanced', 'Lanjutan', 'Settings2', 100, 'settings.update')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEFAULT APP SETTINGS
-- =====================================================
INSERT INTO app_settings (key, value, description) VALUES
    ('tax_rate', '"0.10"', 'Default tax rate (10% PPN)'),
    ('currency', '"IDR"', 'Currency'),
    ('currency_symbol', '"Rp"', 'Currency symbol'),
    ('loyalty_points_rate', '"1000"', 'Amount in IDR for 1 loyalty point'),
    ('loyalty_points_value', '"100"', 'Value in IDR of 1 loyalty point'),
    ('discount_manager_threshold', '"10"', 'Discount % threshold requiring manager approval'),
    ('receipt_header', '{"line1": "THE BREAKERY", "line2": "French Bakery & Coffee", "line3": "Lombok, Indonesia"}', 'Receipt header'),
    ('receipt_footer', '{"line1": "Merci de votre visite!", "line2": "See you soon!"}', 'Receipt footer'),
    ('business_hours', '{"open": "07:00", "close": "18:00"}', 'Business hours'),
    ('timezone', '"Asia/Makassar"', 'Default timezone (WITA)')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- DEFAULT CATEGORIES (Product categories)
-- =====================================================
INSERT INTO categories (name, icon, color, dispatch_station, is_raw_material, sort_order) VALUES
    ('Café', '☕', '#6F4E37', 'barista', FALSE, 1),
    ('Thé', '🍵', '#90EE90', 'barista', FALSE, 2),
    ('Boissons Froides', '🧊', '#87CEEB', 'barista', FALSE, 3),
    ('Viennoiseries', '🥐', '#DEB887', 'display', FALSE, 4),
    ('Pains', '🍞', '#D2691E', 'display', FALSE, 5),
    ('Pâtisseries', '🍰', '#FFB6C1', 'display', FALSE, 6),
    ('Sandwiches', '🥪', '#F5DEB3', 'kitchen', FALSE, 7),
    ('Salades', '🥗', '#90EE90', 'kitchen', FALSE, 8),
    ('Matières Premières', '📦', '#808080', 'none', TRUE, 99)
ON CONFLICT DO NOTHING;
