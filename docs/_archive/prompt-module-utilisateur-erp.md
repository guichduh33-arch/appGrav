# PROMPT: Module Utilisateur & Autorisations - ERP Breakery Lombok

## 🎯 Objectif Principal

Développer un système complet de gestion des utilisateurs et des autorisations pour l'ERP de The Breakery Lombok. Le système doit gérer l'authentification, les rôles, les permissions granulaires et la sécurité au niveau des données (Row Level Security).

---

## 📋 Contexte Technique

### Stack Technologique
- **Frontend**: React 18+ avec TypeScript, Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: [Préciser: Tailwind/Shadcn/Ant Design]
- **État**: [Préciser: Zustand/Redux/React Query]
- **Langue**: Interface multilingue (FR/EN/ID)

### Caractéristiques Business
- ~200 transactions quotidiennes
- Chiffre d'affaires ~6 milliards IDR/an
- Devise: IDR avec TVA 10%
- Multi-plateforme: Desktop Windows, Tablettes Android, Terminaux POS

---

## 🏗️ Architecture du Module

### 1. Schéma de Base de Données

Créer les tables suivantes dans Supabase:

```sql
-- =====================================================
-- TABLE: roles
-- Description: Définition des rôles système
-- =====================================================
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_id VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,  -- Rôles non supprimables
    is_active BOOLEAN DEFAULT true,
    hierarchy_level INTEGER DEFAULT 0, -- Pour héritage des permissions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rôles par défaut
INSERT INTO public.roles (code, name_fr, name_en, name_id, is_system, hierarchy_level) VALUES
('SUPER_ADMIN', 'Super Administrateur', 'Super Administrator', 'Super Administrator', true, 100),
('ADMIN', 'Administrateur', 'Administrator', 'Administrator', true, 90),
('MANAGER', 'Gérant', 'Manager', 'Manajer', true, 70),
('CASHIER', 'Caissier', 'Cashier', 'Kasir', true, 50),
('BAKER', 'Boulanger', 'Baker', 'Pembuat Roti', true, 40),
('INVENTORY', 'Gestionnaire Stock', 'Inventory Manager', 'Manajer Inventaris', true, 40),
('VIEWER', 'Lecteur', 'Viewer', 'Penampil', true, 10);

-- =====================================================
-- TABLE: permissions
-- Description: Catalogue des permissions disponibles
-- =====================================================
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    name_fr VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_id VARCHAR(150) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false, -- Permissions critiques
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions par module
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
('settings.backup', 'settings', 'backup', 'Sauvegarder données', 'Backup data', 'Cadangkan data', true);

-- =====================================================
-- TABLE: role_permissions
-- Description: Association rôles <-> permissions
-- =====================================================
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(role_id, permission_id)
);

-- =====================================================
-- TABLE: user_profiles
-- Description: Profils utilisateurs étendus
-- =====================================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    phone VARCHAR(20),
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'id', -- fr, en, id
    timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
    pin_code VARCHAR(6), -- Pour accès rapide POS (hashé)
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABLE: user_roles
-- Description: Attribution des rôles aux utilisateurs
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- Rôle principal
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ, -- NULL = permanent
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role_id)
);

-- =====================================================
-- TABLE: user_permissions
-- Description: Permissions additionnelles par utilisateur
-- =====================================================
CREATE TABLE public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN DEFAULT true, -- true=accordée, false=révoquée
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    reason TEXT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, permission_id)
);

-- =====================================================
-- TABLE: user_sessions
-- Description: Suivi des sessions utilisateurs
-- =====================================================
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
-- TABLE: audit_logs
-- Description: Journal d'audit des actions sensibles
-- =====================================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID REFERENCES public.user_sessions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
```

### 2. Row Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FONCTION: Vérification des permissions utilisateur
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_has_permission(
    p_user_id UUID,
    p_permission_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_permission BOOLEAN := false;
BEGIN
    -- Vérifier permissions directes utilisateur (priorité)
    SELECT EXISTS (
        SELECT 1 FROM public.user_permissions up
        JOIN public.permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.code = p_permission_code
        AND up.is_granted = true
        AND (up.valid_from IS NULL OR up.valid_from <= NOW())
        AND (up.valid_until IS NULL OR up.valid_until > NOW())
    ) INTO v_has_permission;
    
    IF v_has_permission THEN
        RETURN true;
    END IF;
    
    -- Vérifier si permission explicitement révoquée
    SELECT EXISTS (
        SELECT 1 FROM public.user_permissions up
        JOIN public.permissions p ON up.permission_id = p.id
        WHERE up.user_id = p_user_id
        AND p.code = p_permission_code
        AND up.is_granted = false
        AND (up.valid_from IS NULL OR up.valid_from <= NOW())
        AND (up.valid_until IS NULL OR up.valid_until > NOW())
    ) INTO v_has_permission;
    
    IF v_has_permission THEN
        RETURN false;
    END IF;
    
    -- Vérifier permissions via rôles
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND p.code = p_permission_code
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION: Obtenir toutes les permissions d'un utilisateur
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
    permission_code VARCHAR,
    permission_module VARCHAR,
    is_granted BOOLEAN,
    source VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    -- Permissions directes
    SELECT 
        p.code,
        p.module,
        up.is_granted,
        'direct'::VARCHAR as source
    FROM public.user_permissions up
    JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
    AND (up.valid_from IS NULL OR up.valid_from <= NOW())
    AND (up.valid_until IS NULL OR up.valid_until > NOW())
    
    UNION
    
    -- Permissions via rôles (sauf si override direct)
    SELECT 
        p.code,
        p.module,
        true as is_granted,
        'role'::VARCHAR as source
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
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION: Vérifier si utilisateur est admin
-- =====================================================
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLICIES RLS
-- =====================================================

-- user_profiles: Utilisateurs voient leur profil, admins voient tous
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (
        id = auth.uid() 
        OR public.is_admin(auth.uid())
        OR public.user_has_permission(auth.uid(), 'users.view')
    );

CREATE POLICY "Admins can insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (
        public.user_has_permission(auth.uid(), 'users.create')
    );

CREATE POLICY "Users can update own profile, admins all" ON public.user_profiles
    FOR UPDATE USING (
        id = auth.uid() 
        OR public.user_has_permission(auth.uid(), 'users.update')
    );

-- roles: Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view roles" ON public.roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage roles" ON public.roles
    FOR ALL USING (public.user_has_permission(auth.uid(), 'users.roles'));

-- permissions: Lecture pour tous les utilisateurs authentifiés  
CREATE POLICY "Authenticated users can view permissions" ON public.permissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- user_roles: Utilisateurs voient leurs rôles, admins voient tous
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (
        user_id = auth.uid() 
        OR public.user_has_permission(auth.uid(), 'users.roles')
    );

CREATE POLICY "Only admins can manage user roles" ON public.user_roles
    FOR ALL USING (public.user_has_permission(auth.uid(), 'users.roles'));

-- audit_logs: Admins seulement
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);
```

### 3. Triggers et Fonctions Automatiques

```sql
-- =====================================================
-- TRIGGER: Mise à jour automatique updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- TRIGGER: Audit automatique des modifications
-- =====================================================
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, new_values
        ) VALUES (
            auth.uid(),
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
            auth.uid(),
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
            auth.uid(),
            'DELETE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer audit sur tables sensibles
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- =====================================================
-- FONCTION: Créer profil utilisateur après signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, first_name, last_name, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
    
    -- Attribuer rôle par défaut (Viewer)
    INSERT INTO public.user_roles (user_id, role_id, is_primary, assigned_by)
    SELECT NEW.id, id, true, NEW.id
    FROM public.roles WHERE code = 'VIEWER';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 🖥️ Architecture Frontend

### 1. Types TypeScript

```typescript
// types/auth.ts

export interface Role {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  name_fr: string;
  name_en: string;
  name_id: string;
  description?: string;
  is_sensitive: boolean;
}

export interface UserProfile {
  id: string;
  employee_code?: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language: 'fr' | 'en' | 'id';
  timezone: string;
  is_active: boolean;
  last_login_at?: string;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role?: Role;
  is_primary: boolean;
  valid_from?: string;
  valid_until?: string;
  assigned_at: string;
}

export interface UserPermission {
  permission_code: string;
  permission_module: string;
  is_granted: boolean;
  source: 'direct' | 'role';
}

export interface AuthState {
  user: UserProfile | null;
  roles: Role[];
  permissions: UserPermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Types pour les actions
export type PermissionCode = 
  | 'sales.view' | 'sales.create' | 'sales.void' | 'sales.discount' | 'sales.refund'
  | 'inventory.view' | 'inventory.create' | 'inventory.update' | 'inventory.delete'
  | 'products.view' | 'products.create' | 'products.update' | 'products.pricing'
  | 'customers.view' | 'customers.create' | 'customers.update' | 'customers.loyalty'
  | 'reports.sales' | 'reports.inventory' | 'reports.financial'
  | 'users.view' | 'users.create' | 'users.update' | 'users.delete' | 'users.roles'
  | 'settings.view' | 'settings.update' | 'settings.backup';

export type ModuleCode = 
  | 'sales' | 'inventory' | 'products' | 'customers' 
  | 'reports' | 'users' | 'settings';
```

### 2. Hook de Permissions

```typescript
// hooks/usePermissions.ts
import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { PermissionCode, ModuleCode } from '@/types/auth';

export function usePermissions() {
  const { permissions, roles } = useAuthStore();

  const hasPermission = useCallback((code: PermissionCode): boolean => {
    const perm = permissions.find(p => p.permission_code === code);
    return perm?.is_granted ?? false;
  }, [permissions]);

  const hasAnyPermission = useCallback((codes: PermissionCode[]): boolean => {
    return codes.some(code => hasPermission(code));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((codes: PermissionCode[]): boolean => {
    return codes.every(code => hasPermission(code));
  }, [hasPermission]);

  const canAccessModule = useCallback((module: ModuleCode): boolean => {
    return permissions.some(
      p => p.permission_module === module && p.is_granted
    );
  }, [permissions]);

  const isAdmin = useMemo(() => {
    return roles.some(r => ['SUPER_ADMIN', 'ADMIN'].includes(r.code));
  }, [roles]);

  const isSuperAdmin = useMemo(() => {
    return roles.some(r => r.code === 'SUPER_ADMIN');
  }, [roles]);

  const getModulePermissions = useCallback((module: ModuleCode) => {
    return permissions.filter(p => p.permission_module === module);
  }, [permissions]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    isAdmin,
    isSuperAdmin,
    getModulePermissions,
    permissions,
    roles,
  };
}
```

### 3. Composant de Protection

```tsx
// components/auth/PermissionGuard.tsx
import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { PermissionCode } from '@/types/auth';

interface PermissionGuardProps {
  permission?: PermissionCode;
  permissions?: PermissionCode[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allPerms = permission ? [permission, ...permissions] : permissions;

  if (allPerms.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? hasAllPermissions(allPerms)
    : hasAnyPermission(allPerms);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Variante pour les routes
export function RouteGuard({
  permission,
  permissions,
  requireAll,
  children,
}: Omit<PermissionGuardProps, 'fallback'>) {
  return (
    <PermissionGuard
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      fallback={<AccessDeniedPage />}
    >
      {children}
    </PermissionGuard>
  );
}

function AccessDeniedPage() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('auth.accessDenied')}
        </h2>
        <p className="mt-2 text-gray-600">
          {t('auth.noPermission')}
        </p>
      </div>
    </div>
  );
}
```

### 4. Store Zustand

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { AuthState, UserProfile, Role, UserPermission } from '@/types/auth';

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithPin: (employeeCode: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: true,

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        await get().refreshPermissions();
      },

      loginWithPin: async (employeeCode, pin) => {
        // Implémentation login PIN pour POS
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('employee_code', employeeCode)
          .single();

        if (!profile) throw new Error('Employé non trouvé');

        // Vérifier PIN (implémentation côté serveur recommandée)
        const { data, error } = await supabase.rpc('verify_pin_login', {
          p_employee_code: employeeCode,
          p_pin: pin,
        });

        if (error || !data) throw new Error('PIN incorrect');

        await get().refreshPermissions();
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          roles: [],
          permissions: [],
          isAuthenticated: false,
        });
      },

      refreshPermissions: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Charger profil
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Charger rôles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('*, role:roles(*)')
          .eq('user_id', user.id);

        // Charger permissions
        const { data: permissions } = await supabase
          .rpc('get_user_permissions', { p_user_id: user.id });

        set({
          user: profile,
          roles: userRoles?.map(ur => ur.role).filter(Boolean) || [],
          permissions: permissions || [],
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;

        const { error } = await supabase
          .from('user_profiles')
          .update(data)
          .eq('id', user.id);

        if (error) throw error;

        set({ user: { ...user, ...data } });
      },
    }),
    {
      name: 'breakery-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 📱 Pages UI à Implémenter

### 1. Liste des Utilisateurs (`/users`)
- Tableau avec filtres (rôle, statut, recherche)
- Actions: créer, éditer, désactiver, supprimer
- Export CSV/Excel
- Pagination

### 2. Création/Édition Utilisateur (`/users/new`, `/users/:id`)
- Formulaire multi-étapes ou onglets
- Onglet 1: Informations personnelles
- Onglet 2: Attribution des rôles
- Onglet 3: Permissions additionnelles
- Onglet 4: Paramètres de sécurité (PIN, 2FA)

### 3. Gestion des Rôles (`/settings/roles`)
- Liste des rôles avec nombre d'utilisateurs
- Création/édition de rôles personnalisés
- Matrice permissions par rôle
- Copie de rôle existant

### 4. Journal d'Audit (`/settings/audit`)
- Filtres par utilisateur, action, date
- Export des logs
- Recherche full-text

### 5. Page de Profil (`/profile`)
- Modification infos personnelles
- Changement de mot de passe
- Configuration PIN POS
- Préférences langue/timezone

---

## 🔐 Exigences de Sécurité

1. **Mots de passe**
   - Minimum 8 caractères, 1 majuscule, 1 chiffre, 1 spécial
   - Hachage bcrypt côté Supabase Auth
   - Expiration configurable (90 jours par défaut)

2. **Sessions**
   - JWT avec expiration 1h, refresh token 7 jours
   - Déconnexion automatique après inactivité (configurable)
   - Session unique ou multiple par utilisateur

3. **PIN POS**
   - 4-6 chiffres
   - Hashé en base
   - Verrouillage après 5 tentatives
   - Valide uniquement sur terminaux autorisés

4. **Audit**
   - Toutes les modifications de permissions
   - Connexions/déconnexions
   - Actions sensibles (annulation, remboursement)
   - Rétention 2 ans minimum

---

## 🌐 Internationalisation

Toutes les chaînes de caractères doivent être traduites:

```json
// locales/fr/auth.json
{
  "login": {
    "title": "Connexion",
    "email": "Adresse email",
    "password": "Mot de passe",
    "submit": "Se connecter",
    "forgotPassword": "Mot de passe oublié ?",
    "pinLogin": "Connexion rapide (PIN)"
  },
  "roles": {
    "SUPER_ADMIN": "Super Administrateur",
    "ADMIN": "Administrateur",
    "MANAGER": "Gérant",
    "CASHIER": "Caissier",
    "BAKER": "Boulanger",
    "INVENTORY": "Gestionnaire Stock",
    "VIEWER": "Lecteur"
  },
  "permissions": {
    "sales.view": "Voir les ventes",
    "sales.create": "Créer une vente"
    // ... etc
  },
  "errors": {
    "invalidCredentials": "Email ou mot de passe incorrect",
    "accountLocked": "Compte verrouillé. Réessayez dans {minutes} minutes",
    "sessionExpired": "Session expirée. Veuillez vous reconnecter"
  }
}
```

---

## ✅ Checklist d'Implémentation

### Phase 1: Base de données
- [ ] Créer toutes les tables SQL
- [ ] Implémenter les fonctions RLS
- [ ] Configurer les triggers d'audit
- [ ] Insérer données par défaut (rôles, permissions)
- [ ] Tester les politiques RLS

### Phase 2: Backend
- [ ] Configurer Supabase Auth
- [ ] Créer les Edge Functions si nécessaire
- [ ] Implémenter vérification PIN
- [ ] Configurer email templates

### Phase 3: Frontend Auth
- [ ] Créer AuthStore (Zustand)
- [ ] Implémenter usePermissions hook
- [ ] Créer composants PermissionGuard
- [ ] Page de connexion
- [ ] Page de reset password

### Phase 4: Gestion Utilisateurs
- [ ] Page liste utilisateurs
- [ ] Formulaire création/édition
- [ ] Gestion des rôles
- [ ] Attribution permissions

### Phase 5: Sécurité
- [ ] Configuration expiration sessions
- [ ] Système de verrouillage compte
- [ ] Journal d'audit UI
- [ ] Tests de sécurité

---

## 📝 Notes Additionnelles

- Utiliser les conventions de nommage snake_case pour SQL, camelCase pour TypeScript
- Tous les UUID générés par `gen_random_uuid()` 
- Timestamps toujours en UTC avec TIMESTAMPTZ
- Les permissions sensibles nécessitent confirmation supplémentaire dans l'UI
- Le super admin ne peut pas être désactivé (protection système)
