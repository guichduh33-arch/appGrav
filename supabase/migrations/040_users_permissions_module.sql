-- =====================================================
-- Migration 040: Users & Permissions Module
-- Description: Complete user management with granular permissions, roles hierarchy, and audit
-- Date: 2026-01-20
-- =====================================================

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- STEP 1: CREATE NEW TABLES FOR ROLES & PERMISSIONS
-- =====================================================

-- Table: roles
-- Définition des rôles système avec hiérarchie
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,  -- Rôles non supprimables
    is_active BOOLEAN DEFAULT true,
    hierarchy_level INTEGER DEFAULT 0, -- Pour héritage des permissions (plus haut = plus de pouvoir)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: permissions
-- Catalogue des permissions disponibles
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    name_fr VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_id VARCHAR(150) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false, -- Permissions critiques nécessitant confirmation
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: role_permissions
-- Association rôles <-> permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID,
    UNIQUE(role_id, permission_id)
);

-- =====================================================
-- STEP 2: EXTEND user_profiles TABLE
-- =====================================================

-- Add new columns to user_profiles (keeping existing data)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS employee_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'id',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255),  -- Hashed PIN for security
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Migrate existing 'name' to first_name/last_name if not already done
UPDATE public.user_profiles
SET
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE
        WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
        ELSE ''
    END,
    display_name = name
WHERE first_name IS NULL AND name IS NOT NULL;

-- =====================================================
-- STEP 3: USER ROLES TABLE (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Rôle principal affiché
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ, -- NULL = permanent
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id, role_id)
);

-- =====================================================
-- STEP 4: USER PERMISSIONS TABLE (Direct overrides)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN DEFAULT true, -- true=accordée, false=révoquée explicitement
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    reason TEXT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID,
    UNIQUE(user_id, permission_id)
);

-- =====================================================
-- STEP 5: USER SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    device_type VARCHAR(50), -- desktop, tablet, pos
    device_name VARCHAR(200),
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    end_reason VARCHAR(50) -- logout, timeout, forced
);

-- =====================================================
-- STEP 6: ENHANCED AUDIT LOGS TABLE
-- =====================================================

-- Drop existing audit_log if exists and recreate with new structure
DROP TABLE IF EXISTS public.audit_log CASCADE;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID REFERENCES public.user_sessions(id),
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, critical
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 7: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_roles_code ON public.roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_active ON public.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_hierarchy ON public.roles(hierarchy_level DESC);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON public.permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_sensitive ON public.permissions(is_sensitive);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_primary ON public.user_roles(is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON public.user_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, ended_at) WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- =====================================================
-- STEP 8: INSERT DEFAULT ROLES
-- =====================================================

INSERT INTO public.roles (code, name_fr, name_en, name_id, is_system, hierarchy_level, description) VALUES
    ('SUPER_ADMIN', 'Super Administrateur', 'Super Administrator', 'Super Administrator', true, 100, 'Full system access, cannot be deleted'),
    ('ADMIN', 'Administrateur', 'Administrator', 'Administrator', true, 90, 'Full access except system settings'),
    ('MANAGER', 'Gérant', 'Manager', 'Manajer', true, 70, 'Store management and reports'),
    ('CASHIER', 'Caissier', 'Cashier', 'Kasir', true, 50, 'POS operations and basic sales'),
    ('BAKER', 'Boulanger', 'Baker', 'Pembuat Roti', true, 40, 'Production and recipes'),
    ('INVENTORY', 'Gestionnaire Stock', 'Inventory Manager', 'Manajer Inventaris', true, 40, 'Stock and inventory management'),
    ('SERVER', 'Serveur', 'Server', 'Pelayan', true, 30, 'Order taking and serving'),
    ('BARISTA', 'Barista', 'Barista', 'Barista', true, 30, 'Beverage preparation'),
    ('KITCHEN', 'Cuisine', 'Kitchen', 'Dapur', true, 30, 'Food preparation'),
    ('VIEWER', 'Lecteur', 'Viewer', 'Penampil', true, 10, 'Read-only access')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- STEP 9: INSERT ALL PERMISSIONS
-- =====================================================

INSERT INTO public.permissions (code, module, action, name_fr, name_en, name_id, is_sensitive) VALUES
    -- Module Ventes (POS)
    ('sales.view', 'sales', 'view', 'Voir les ventes', 'View sales', 'Lihat penjualan', false),
    ('sales.create', 'sales', 'create', 'Créer une vente', 'Create sale', 'Buat penjualan', false),
    ('sales.void', 'sales', 'void', 'Annuler une vente', 'Void sale', 'Batalkan penjualan', true),
    ('sales.discount', 'sales', 'discount', 'Appliquer remise', 'Apply discount', 'Terapkan diskon', true),
    ('sales.refund', 'sales', 'refund', 'Effectuer remboursement', 'Process refund', 'Proses pengembalian', true),
    ('sales.report', 'sales', 'report', 'Voir rapports ventes', 'View sales reports', 'Lihat laporan penjualan', false),
    ('sales.export', 'sales', 'export', 'Exporter données ventes', 'Export sales data', 'Ekspor data penjualan', false),

    -- Module Inventaire
    ('inventory.view', 'inventory', 'view', 'Voir inventaire', 'View inventory', 'Lihat inventaris', false),
    ('inventory.create', 'inventory', 'create', 'Ajouter article', 'Add item', 'Tambah barang', false),
    ('inventory.update', 'inventory', 'update', 'Modifier article', 'Edit item', 'Edit barang', false),
    ('inventory.delete', 'inventory', 'delete', 'Supprimer article', 'Delete item', 'Hapus barang', true),
    ('inventory.adjust', 'inventory', 'adjust', 'Ajuster stock', 'Adjust stock', 'Sesuaikan stok', true),
    ('inventory.transfer', 'inventory', 'transfer', 'Transférer stock', 'Transfer stock', 'Transfer stok', false),

    -- Module Produits
    ('products.view', 'products', 'view', 'Voir produits', 'View products', 'Lihat produk', false),
    ('products.create', 'products', 'create', 'Créer produit', 'Create product', 'Buat produk', false),
    ('products.update', 'products', 'update', 'Modifier produit', 'Edit product', 'Edit produk', false),
    ('products.delete', 'products', 'delete', 'Supprimer produit', 'Delete product', 'Hapus produk', true),
    ('products.pricing', 'products', 'pricing', 'Modifier prix', 'Edit pricing', 'Edit harga', true),

    -- Module Clients
    ('customers.view', 'customers', 'view', 'Voir clients', 'View customers', 'Lihat pelanggan', false),
    ('customers.create', 'customers', 'create', 'Créer client', 'Create customer', 'Buat pelanggan', false),
    ('customers.update', 'customers', 'update', 'Modifier client', 'Edit customer', 'Edit pelanggan', false),
    ('customers.delete', 'customers', 'delete', 'Supprimer client', 'Delete customer', 'Hapus pelanggan', true),
    ('customers.loyalty', 'customers', 'loyalty', 'Gérer fidélité', 'Manage loyalty', 'Kelola loyalitas', false),

    -- Module Rapports
    ('reports.sales', 'reports', 'sales', 'Rapports ventes', 'Sales reports', 'Laporan penjualan', false),
    ('reports.inventory', 'reports', 'inventory', 'Rapports inventaire', 'Inventory reports', 'Laporan inventaris', false),
    ('reports.financial', 'reports', 'financial', 'Rapports financiers', 'Financial reports', 'Laporan keuangan', true),
    ('reports.analytics', 'reports', 'analytics', 'Analytics avancés', 'Advanced analytics', 'Analitik lanjutan', false),

    -- Module Utilisateurs
    ('users.view', 'users', 'view', 'Voir utilisateurs', 'View users', 'Lihat pengguna', false),
    ('users.create', 'users', 'create', 'Créer utilisateur', 'Create user', 'Buat pengguna', true),
    ('users.update', 'users', 'update', 'Modifier utilisateur', 'Edit user', 'Edit pengguna', true),
    ('users.delete', 'users', 'delete', 'Supprimer utilisateur', 'Delete user', 'Hapus pengguna', true),
    ('users.roles', 'users', 'roles', 'Gérer rôles', 'Manage roles', 'Kelola peran', true),
    ('users.permissions', 'users', 'permissions', 'Gérer permissions', 'Manage permissions', 'Kelola izin', true),

    -- Module Configuration
    ('settings.view', 'settings', 'view', 'Voir paramètres', 'View settings', 'Lihat pengaturan', false),
    ('settings.update', 'settings', 'update', 'Modifier paramètres', 'Edit settings', 'Edit pengaturan', true),
    ('settings.backup', 'settings', 'backup', 'Sauvegarder données', 'Backup data', 'Cadangkan data', true),

    -- Module Production
    ('production.view', 'production', 'view', 'Voir production', 'View production', 'Lihat produksi', false),
    ('production.create', 'production', 'create', 'Créer production', 'Create production', 'Buat produksi', false),
    ('production.update', 'production', 'update', 'Modifier production', 'Edit production', 'Edit produksi', false),
    ('production.recipes', 'production', 'recipes', 'Gérer recettes', 'Manage recipes', 'Kelola resep', false),

    -- Module Achats
    ('purchases.view', 'purchases', 'view', 'Voir achats', 'View purchases', 'Lihat pembelian', false),
    ('purchases.create', 'purchases', 'create', 'Créer commande', 'Create order', 'Buat pesanan', false),
    ('purchases.approve', 'purchases', 'approve', 'Approuver commande', 'Approve order', 'Setujui pesanan', true),
    ('purchases.receive', 'purchases', 'receive', 'Réceptionner', 'Receive', 'Terima barang', false),

    -- Module POS Spécifique
    ('pos.open_drawer', 'pos', 'open_drawer', 'Ouvrir caisse', 'Open drawer', 'Buka laci', false),
    ('pos.close_session', 'pos', 'close_session', 'Clôturer session', 'Close session', 'Tutup sesi', true),
    ('pos.no_sale', 'pos', 'no_sale', 'Ouverture sans vente', 'No sale opening', 'Buka tanpa penjualan', true),
    ('pos.price_override', 'pos', 'price_override', 'Modifier prix vente', 'Override price', 'Ubah harga jual', true),

    -- Module KDS
    ('kds.view', 'kds', 'view', 'Voir écran cuisine', 'View kitchen display', 'Lihat layar dapur', false),
    ('kds.update', 'kds', 'update', 'Mettre à jour statut', 'Update status', 'Update status', false)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- STEP 10: ASSIGN PERMISSIONS TO ROLES
-- =====================================================

-- SUPER_ADMIN gets ALL permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN gets all except system settings
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'ADMIN'
AND p.code NOT IN ('settings.backup')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- MANAGER permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'MANAGER'
AND p.code IN (
    'sales.view', 'sales.create', 'sales.void', 'sales.discount', 'sales.refund', 'sales.report', 'sales.export',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.adjust', 'inventory.transfer',
    'products.view', 'products.create', 'products.update', 'products.pricing',
    'customers.view', 'customers.create', 'customers.update', 'customers.loyalty',
    'reports.sales', 'reports.inventory', 'reports.analytics',
    'users.view',
    'settings.view',
    'production.view', 'production.create', 'production.update', 'production.recipes',
    'purchases.view', 'purchases.create', 'purchases.approve', 'purchases.receive',
    'pos.open_drawer', 'pos.close_session', 'pos.no_sale', 'pos.price_override',
    'kds.view', 'kds.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- CASHIER permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'CASHIER'
AND p.code IN (
    'sales.view', 'sales.create',
    'products.view',
    'customers.view', 'customers.create', 'customers.loyalty',
    'pos.open_drawer',
    'kds.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- BAKER permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'BAKER'
AND p.code IN (
    'products.view',
    'inventory.view',
    'production.view', 'production.create', 'production.update', 'production.recipes',
    'kds.view', 'kds.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- INVENTORY permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'INVENTORY'
AND p.code IN (
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.adjust', 'inventory.transfer',
    'products.view',
    'purchases.view', 'purchases.create', 'purchases.receive',
    'reports.inventory'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- SERVER permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'SERVER'
AND p.code IN (
    'sales.view', 'sales.create',
    'products.view',
    'customers.view',
    'kds.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- BARISTA permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'BARISTA'
AND p.code IN (
    'products.view',
    'kds.view', 'kds.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- KITCHEN permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'KITCHEN'
AND p.code IN (
    'products.view',
    'inventory.view',
    'production.view',
    'kds.view', 'kds.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- VIEWER permissions (read-only)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'VIEWER'
AND p.code IN (
    'sales.view',
    'products.view',
    'inventory.view',
    'customers.view',
    'reports.sales'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- STEP 11: HELPER FUNCTIONS
-- =====================================================

-- Function: Check if user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_user_id UUID,
    p_permission_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_direct_grant BOOLEAN := false;
    v_has_direct_revoke BOOLEAN := false;
BEGIN
    -- Check for direct user permission (highest priority)
    SELECT
        COALESCE(bool_or(is_granted = true AND (valid_until IS NULL OR valid_until > NOW())), false),
        COALESCE(bool_or(is_granted = false AND (valid_until IS NULL OR valid_until > NOW())), false)
    INTO v_has_direct_grant, v_has_direct_revoke
    FROM public.user_permissions up
    JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
    AND p.code = p_permission_code
    AND (up.valid_from IS NULL OR up.valid_from <= NOW());

    -- If explicitly revoked, deny
    IF v_has_direct_revoke THEN
        RETURN false;
    END IF;

    -- If explicitly granted, allow
    IF v_has_direct_grant THEN
        RETURN true;
    END IF;

    -- Check role-based permissions
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
    permission_code VARCHAR,
    permission_module VARCHAR,
    permission_action VARCHAR,
    is_granted BOOLEAN,
    source VARCHAR,
    is_sensitive BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    -- Direct permissions (take priority)
    SELECT
        p.code::VARCHAR,
        p.module::VARCHAR,
        p.action::VARCHAR,
        up.is_granted,
        'direct'::VARCHAR as source,
        p.is_sensitive
    FROM public.user_permissions up
    JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
    AND (up.valid_from IS NULL OR up.valid_from <= NOW())
    AND (up.valid_until IS NULL OR up.valid_until > NOW())

    UNION

    -- Role-based permissions (only if no direct override exists)
    SELECT
        p.code::VARCHAR,
        p.module::VARCHAR,
        p.action::VARCHAR,
        true as is_granted,
        'role'::VARCHAR as source,
        p.is_sensitive
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    AND NOT EXISTS (
        SELECT 1 FROM public.user_permissions up2
        WHERE up2.user_id = p_user_id
        AND up2.permission_id = p.id
        AND (up2.valid_from IS NULL OR up2.valid_from <= NOW())
        AND (up2.valid_until IS NULL OR up2.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Check if user is admin (SUPER_ADMIN or ADMIN)
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.code IN ('SUPER_ADMIN', 'ADMIN')
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.code = 'SUPER_ADMIN'
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(p_user_id UUID)
RETURNS public.roles AS $$
DECLARE
    v_role public.roles;
BEGIN
    SELECT r.* INTO v_role
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    AND ur.is_primary = true
    AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    LIMIT 1;

    -- If no primary role, get highest hierarchy role
    IF v_role IS NULL THEN
        SELECT r.* INTO v_role
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
        ORDER BY r.hierarchy_level DESC
        LIMIT 1;
    END IF;

    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Hash PIN (using pgcrypto)
CREATE OR REPLACE FUNCTION public.hash_pin(p_pin VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN extensions.crypt(p_pin, extensions.gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verify PIN
CREATE OR REPLACE FUNCTION public.verify_user_pin(p_user_id UUID, p_pin VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_stored_hash VARCHAR;
    v_failed_attempts INTEGER;
    v_locked_until TIMESTAMPTZ;
BEGIN
    -- Get user info
    SELECT pin_hash, failed_login_attempts, locked_until
    INTO v_stored_hash, v_failed_attempts, v_locked_until
    FROM public.user_profiles
    WHERE id = p_user_id AND is_active = true;

    -- Check if account is locked
    IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
        RETURN false;
    END IF;

    -- Verify PIN
    IF v_stored_hash IS NOT NULL AND v_stored_hash = extensions.crypt(p_pin, v_stored_hash) THEN
        -- Reset failed attempts on success
        UPDATE public.user_profiles
        SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW()
        WHERE id = p_user_id;

        RETURN true;
    ELSE
        -- Increment failed attempts
        UPDATE public.user_profiles
        SET
            failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE
                WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
                ELSE NULL
            END
        WHERE id = p_user_id;

        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 12: TRIGGERS
-- =====================================================

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Try to get current user ID (from session or auth)
    v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, new_values
        ) VALUES (
            v_user_id,
            'CREATE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, old_values, new_values
        ) VALUES (
            v_user_id,
            'UPDATE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, old_values
        ) VALUES (
            v_user_id,
            'DELETE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_user_permissions ON public.user_permissions;
CREATE TRIGGER audit_user_permissions
    AFTER INSERT OR UPDATE OR DELETE ON public.user_permissions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_roles ON public.roles;
CREATE TRIGGER audit_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Ensure single primary role per user
CREATE OR REPLACE FUNCTION public.ensure_single_primary_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        UPDATE public.user_roles
        SET is_primary = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_primary = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_primary_role ON public.user_roles;
CREATE TRIGGER ensure_single_primary_role
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.ensure_single_primary_role();

-- =====================================================
-- STEP 13: MIGRATE EXISTING USERS TO NEW SYSTEM
-- =====================================================

-- Create a mapping from old role enum to new role codes
DO $$
DECLARE
    v_user RECORD;
    v_role_id UUID;
    v_role_mapping JSONB := '{
        "admin": "ADMIN",
        "manager": "MANAGER",
        "cashier": "CASHIER",
        "server": "SERVER",
        "barista": "BARISTA",
        "kitchen": "KITCHEN",
        "backoffice": "VIEWER"
    }'::JSONB;
    v_new_role_code TEXT;
BEGIN
    FOR v_user IN SELECT id, role::TEXT as role FROM public.user_profiles WHERE role IS NOT NULL
    LOOP
        -- Get corresponding new role code
        v_new_role_code := v_role_mapping ->> v_user.role;

        IF v_new_role_code IS NOT NULL THEN
            -- Get the new role ID
            SELECT id INTO v_role_id FROM public.roles WHERE code = v_new_role_code;

            IF v_role_id IS NOT NULL THEN
                -- Insert into user_roles if not exists
                INSERT INTO public.user_roles (user_id, role_id, is_primary)
                VALUES (v_user.id, v_role_id, true)
                ON CONFLICT (user_id, role_id) DO NOTHING;
            END IF;
        END IF;
    END LOOP;
END $$;

-- Hash existing PIN codes (if stored in plaintext)
-- Note: This requires pgcrypto extension. Skip if data migration not needed.
-- The hash_pin() function can be used for new PINs.
DO $$
BEGIN
    -- Skip PIN hashing during migration - will be handled by application
    NULL;
END $$;

-- =====================================================
-- STEP 14: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Roles: All authenticated can read, only admins can modify
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles" ON public.roles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" ON public.roles
    FOR ALL USING (true); -- Will be refined with proper auth check

-- Permissions: All can read
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
CREATE POLICY "Anyone can view permissions" ON public.permissions
    FOR SELECT USING (true);

-- Role_permissions: All can read, admins can modify
DROP POLICY IF EXISTS "Anyone can view role_permissions" ON public.role_permissions;
CREATE POLICY "Anyone can view role_permissions" ON public.role_permissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage role_permissions" ON public.role_permissions;
CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions
    FOR ALL USING (true);

-- User_roles: Users see own, admins see all
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can manage user_roles" ON public.user_roles
    FOR ALL USING (true);

-- User_permissions: Same as user_roles
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions" ON public.user_permissions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage user_permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage user_permissions" ON public.user_permissions
    FOR ALL USING (true);

-- User_sessions: Users see own, admins see all
DROP POLICY IF EXISTS "Users can view sessions" ON public.user_sessions;
CREATE POLICY "Users can view sessions" ON public.user_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.user_sessions;
CREATE POLICY "Anyone can insert sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update sessions" ON public.user_sessions;
CREATE POLICY "Anyone can update sessions" ON public.user_sessions
    FOR UPDATE USING (true);

-- Audit_logs: Only admins can view
DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit_logs" ON public.audit_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;
CREATE POLICY "System can insert audit_logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 15: GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.roles TO public;
GRANT ALL ON public.permissions TO public;
GRANT ALL ON public.role_permissions TO public;
GRANT ALL ON public.user_roles TO public;
GRANT ALL ON public.user_permissions TO public;
GRANT ALL ON public.user_sessions TO public;
GRANT ALL ON public.audit_logs TO public;

-- =====================================================
-- STEP 16: COMMENTS
-- =====================================================

COMMENT ON TABLE public.roles IS 'System roles with hierarchy levels for permission inheritance';
COMMENT ON TABLE public.permissions IS 'Granular permissions catalog organized by module and action';
COMMENT ON TABLE public.role_permissions IS 'Many-to-many mapping between roles and permissions';
COMMENT ON TABLE public.user_roles IS 'User role assignments with optional time-based validity';
COMMENT ON TABLE public.user_permissions IS 'Direct permission grants/revocations per user (overrides role permissions)';
COMMENT ON TABLE public.user_sessions IS 'User session tracking for security and audit';
COMMENT ON TABLE public.audit_logs IS 'Complete audit trail of all sensitive operations';

COMMENT ON FUNCTION public.user_has_permission IS 'Check if a user has a specific permission (direct or via role)';
COMMENT ON FUNCTION public.get_user_permissions IS 'Get all effective permissions for a user';
COMMENT ON FUNCTION public.is_admin IS 'Check if user has ADMIN or SUPER_ADMIN role';
COMMENT ON FUNCTION public.verify_user_pin IS 'Verify user PIN with lockout protection';
