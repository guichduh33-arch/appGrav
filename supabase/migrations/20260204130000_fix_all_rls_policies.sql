-- =====================================================
-- Migration: Fix All RLS Policies for Authenticated Users
-- Date: 2024-02-04
-- Description: Permet aux utilisateurs authentifiés d'effectuer
--              toutes les opérations CRUD sur les tables principales
-- =====================================================

-- =====================================================
-- CREATE MISSING TABLES FIRST
-- =====================================================

-- Business Hours (handle existing table with different schema: is_closed instead of is_open)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_hours' AND table_schema = 'public') THEN
        CREATE TABLE public.business_hours (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
            open_time TIME,
            close_time TIME,
            is_closed BOOLEAN DEFAULT FALSE,
            break_start TIME,
            break_end TIME,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(day_of_week)
        );
    END IF;
END $$;

-- Payment Methods (add columns if table exists, create if not)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
        CREATE TABLE public.payment_methods (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'cash',
            is_default BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Add missing columns to existing table
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS name VARCHAR(100);
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'cash';
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Tax Rates (add columns if table exists, create if not)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tax_rates') THEN
        CREATE TABLE public.tax_rates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
            is_default BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Add missing columns to existing table
        ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS name VARCHAR(100);
        ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS rate DECIMAL(5,2) DEFAULT 10.00;
        ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE public.tax_rates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;

-- RLS for business_hours
DROP POLICY IF EXISTS "business_hours_select" ON public.business_hours;
DROP POLICY IF EXISTS "business_hours_insert" ON public.business_hours;
DROP POLICY IF EXISTS "business_hours_update" ON public.business_hours;
DROP POLICY IF EXISTS "business_hours_delete" ON public.business_hours;
CREATE POLICY "business_hours_select" ON public.business_hours FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "business_hours_insert" ON public.business_hours FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "business_hours_update" ON public.business_hours FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "business_hours_delete" ON public.business_hours FOR DELETE TO authenticated USING (TRUE);

-- RLS for payment_methods
DROP POLICY IF EXISTS "payment_methods_select" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_insert" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_update" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_delete" ON public.payment_methods;
CREATE POLICY "payment_methods_select" ON public.payment_methods FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "payment_methods_insert" ON public.payment_methods FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "payment_methods_update" ON public.payment_methods FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "payment_methods_delete" ON public.payment_methods FOR DELETE TO authenticated USING (TRUE);

-- RLS for tax_rates
DROP POLICY IF EXISTS "tax_rates_select" ON public.tax_rates;
DROP POLICY IF EXISTS "tax_rates_insert" ON public.tax_rates;
DROP POLICY IF EXISTS "tax_rates_update" ON public.tax_rates;
DROP POLICY IF EXISTS "tax_rates_delete" ON public.tax_rates;
CREATE POLICY "tax_rates_select" ON public.tax_rates FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "tax_rates_insert" ON public.tax_rates FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "tax_rates_update" ON public.tax_rates FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "tax_rates_delete" ON public.tax_rates FOR DELETE TO authenticated USING (TRUE);

-- Insert default data if empty (wrapped in DO block to handle schema variations)
DO $$ BEGIN
    -- Only insert if 'name' column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'name') THEN
        INSERT INTO public.payment_methods (name, type, is_default, is_active, sort_order)
        SELECT 'Espèces', 'cash', TRUE, TRUE, 1
        WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods LIMIT 1);

        INSERT INTO public.payment_methods (name, type, is_default, is_active, sort_order)
        SELECT 'Carte Bancaire', 'card', FALSE, TRUE, 2
        WHERE NOT EXISTS (SELECT 1 FROM public.payment_methods WHERE type = 'card');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert default payment methods: %', SQLERRM;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tax_rates' AND column_name = 'name') THEN
        INSERT INTO public.tax_rates (name, rate, is_default, is_active)
        SELECT 'TVA 10%', 10.00, TRUE, TRUE
        WHERE NOT EXISTS (SELECT 1 FROM public.tax_rates LIMIT 1);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert default tax rates: %', SQLERRM;
END $$;

-- Insert default business hours (Mon-Sun, 7am-9pm)
-- Uses is_closed=FALSE to indicate the business is open
DO $$ BEGIN
    INSERT INTO public.business_hours (day_of_week, open_time, close_time, is_closed)
    SELECT d, '07:00:00'::TIME, '21:00:00'::TIME, FALSE
    FROM generate_series(0, 6) AS d
    WHERE NOT EXISTS (SELECT 1 FROM public.business_hours WHERE day_of_week = d);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert default business hours: %', SQLERRM;
END $$;

-- =====================================================
-- ADD MISSING COLUMNS TO pos_sessions
-- =====================================================
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS counted_cash DECIMAL(12,2);
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS terminal_id VARCHAR(50);
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- =====================================================
-- ADD MISSING COLUMNS TO stock_movements
-- =====================================================
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS movement_type VARCHAR(50);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS quantity DECIMAL(12,3);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS supplier_id UUID;

-- =====================================================
-- ADD MISSING COLUMNS TO internal_transfers
-- =====================================================
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS from_section_id UUID;
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS to_section_id UUID;
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS responsible_person VARCHAR(100);
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS transfer_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0;
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS total_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.internal_transfers ADD COLUMN IF NOT EXISTS transfer_number VARCHAR(50);

-- =====================================================
-- PRODUCTS & CATEGORIES
-- =====================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;
DROP POLICY IF EXISTS "products_manage_auth" ON public.products;

CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated USING (TRUE);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "categories_delete" ON public.categories;
DROP POLICY IF EXISTS "categories_manage_auth" ON public.categories;

CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "categories_insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "categories_update" ON public.categories FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "categories_delete" ON public.categories FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- RECIPES
-- =====================================================
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recipes_select" ON public.recipes;
DROP POLICY IF EXISTS "recipes_insert" ON public.recipes;
DROP POLICY IF EXISTS "recipes_update" ON public.recipes;
DROP POLICY IF EXISTS "recipes_delete" ON public.recipes;
DROP POLICY IF EXISTS "recipes_manage_auth" ON public.recipes;

CREATE POLICY "recipes_select" ON public.recipes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "recipes_insert" ON public.recipes FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "recipes_update" ON public.recipes FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "recipes_delete" ON public.recipes FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- STOCK MOVEMENTS & INVENTORY
-- =====================================================
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stock_movements_select" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_insert" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_update" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_delete" ON public.stock_movements;
DROP POLICY IF EXISTS "stock_movements_manage_auth" ON public.stock_movements;

CREATE POLICY "stock_movements_select" ON public.stock_movements FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "stock_movements_insert" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "stock_movements_update" ON public.stock_movements FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "stock_movements_delete" ON public.stock_movements FOR DELETE TO authenticated USING (TRUE);

-- Stock levels
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_levels') THEN
        ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "stock_levels_select" ON public.stock_levels;
        DROP POLICY IF EXISTS "stock_levels_insert" ON public.stock_levels;
        DROP POLICY IF EXISTS "stock_levels_update" ON public.stock_levels;
        DROP POLICY IF EXISTS "stock_levels_delete" ON public.stock_levels;

        CREATE POLICY "stock_levels_select" ON public.stock_levels FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "stock_levels_insert" ON public.stock_levels FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "stock_levels_update" ON public.stock_levels FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "stock_levels_delete" ON public.stock_levels FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- INTERNAL TRANSFERS
-- =====================================================
ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "internal_transfers_select_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_insert_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_update_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_delete_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_manage_auth" ON public.internal_transfers;

CREATE POLICY "internal_transfers_select_auth" ON public.internal_transfers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "internal_transfers_insert_auth" ON public.internal_transfers FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "internal_transfers_update_auth" ON public.internal_transfers FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "internal_transfers_delete_auth" ON public.internal_transfers FOR DELETE TO authenticated USING (TRUE);

ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transfer_items_select_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_insert_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_update_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_delete_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_manage_auth" ON public.transfer_items;

CREATE POLICY "transfer_items_select_auth" ON public.transfer_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "transfer_items_insert_auth" ON public.transfer_items FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "transfer_items_update_auth" ON public.transfer_items FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "transfer_items_delete_auth" ON public.transfer_items FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- ORDERS & ORDER ITEMS
-- =====================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;
DROP POLICY IF EXISTS "orders_manage_auth" ON public.orders;

CREATE POLICY "orders_select" ON public.orders FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO authenticated USING (TRUE);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_update" ON public.order_items;
DROP POLICY IF EXISTS "order_items_delete" ON public.order_items;
DROP POLICY IF EXISTS "order_items_manage_auth" ON public.order_items;

CREATE POLICY "order_items_select" ON public.order_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "order_items_update" ON public.order_items FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "order_items_delete" ON public.order_items FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- POS SESSIONS
-- =====================================================
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pos_sessions_select" ON public.pos_sessions;
DROP POLICY IF EXISTS "pos_sessions_insert" ON public.pos_sessions;
DROP POLICY IF EXISTS "pos_sessions_update" ON public.pos_sessions;
DROP POLICY IF EXISTS "pos_sessions_delete" ON public.pos_sessions;
DROP POLICY IF EXISTS "pos_sessions_manage_auth" ON public.pos_sessions;

CREATE POLICY "pos_sessions_select" ON public.pos_sessions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "pos_sessions_insert" ON public.pos_sessions FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "pos_sessions_update" ON public.pos_sessions FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "pos_sessions_delete" ON public.pos_sessions FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- CUSTOMERS
-- =====================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customers_select" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "customers_delete" ON public.customers;
DROP POLICY IF EXISTS "customers_manage_auth" ON public.customers;

CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated USING (TRUE);

-- Customer categories
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_categories') THEN
        ALTER TABLE public.customer_categories ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "customer_categories_select" ON public.customer_categories;
        DROP POLICY IF EXISTS "customer_categories_insert" ON public.customer_categories;
        DROP POLICY IF EXISTS "customer_categories_update" ON public.customer_categories;
        DROP POLICY IF EXISTS "customer_categories_delete" ON public.customer_categories;

        CREATE POLICY "customer_categories_select" ON public.customer_categories FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "customer_categories_insert" ON public.customer_categories FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "customer_categories_update" ON public.customer_categories FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "customer_categories_delete" ON public.customer_categories FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- SUPPLIERS & PURCHASING
-- =====================================================
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suppliers_select" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_insert" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_update" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_delete" ON public.suppliers;
DROP POLICY IF EXISTS "suppliers_manage_auth" ON public.suppliers;

CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "suppliers_insert" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "suppliers_update" ON public.suppliers FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "suppliers_delete" ON public.suppliers FOR DELETE TO authenticated USING (TRUE);

-- Purchase Orders
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_orders') THEN
        ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "purchase_orders_select" ON public.purchase_orders;
        DROP POLICY IF EXISTS "purchase_orders_insert" ON public.purchase_orders;
        DROP POLICY IF EXISTS "purchase_orders_update" ON public.purchase_orders;
        DROP POLICY IF EXISTS "purchase_orders_delete" ON public.purchase_orders;

        CREATE POLICY "purchase_orders_select" ON public.purchase_orders FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "purchase_orders_insert" ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "purchase_orders_update" ON public.purchase_orders FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "purchase_orders_delete" ON public.purchase_orders FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- PO Items
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'po_items') THEN
        ALTER TABLE public.po_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "po_items_select" ON public.po_items;
        DROP POLICY IF EXISTS "po_items_insert" ON public.po_items;
        DROP POLICY IF EXISTS "po_items_update" ON public.po_items;
        DROP POLICY IF EXISTS "po_items_delete" ON public.po_items;

        CREATE POLICY "po_items_select" ON public.po_items FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "po_items_insert" ON public.po_items FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "po_items_update" ON public.po_items FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "po_items_delete" ON public.po_items FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PRODUCT MODIFIERS & COMBOS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_modifiers') THEN
        ALTER TABLE public.product_modifiers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_modifiers_select" ON public.product_modifiers;
        DROP POLICY IF EXISTS "product_modifiers_insert" ON public.product_modifiers;
        DROP POLICY IF EXISTS "product_modifiers_update" ON public.product_modifiers;
        DROP POLICY IF EXISTS "product_modifiers_delete" ON public.product_modifiers;

        CREATE POLICY "product_modifiers_select" ON public.product_modifiers FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "product_modifiers_insert" ON public.product_modifiers FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "product_modifiers_update" ON public.product_modifiers FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "product_modifiers_delete" ON public.product_modifiers FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_combos') THEN
        ALTER TABLE public.product_combos ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_combos_select" ON public.product_combos;
        DROP POLICY IF EXISTS "product_combos_insert" ON public.product_combos;
        DROP POLICY IF EXISTS "product_combos_update" ON public.product_combos;
        DROP POLICY IF EXISTS "product_combos_delete" ON public.product_combos;

        CREATE POLICY "product_combos_select" ON public.product_combos FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "product_combos_insert" ON public.product_combos FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "product_combos_update" ON public.product_combos FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "product_combos_delete" ON public.product_combos FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PROMOTIONS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions') THEN
        ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "promotions_select" ON public.promotions;
        DROP POLICY IF EXISTS "promotions_insert" ON public.promotions;
        DROP POLICY IF EXISTS "promotions_update" ON public.promotions;
        DROP POLICY IF EXISTS "promotions_delete" ON public.promotions;

        CREATE POLICY "promotions_select" ON public.promotions FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "promotions_insert" ON public.promotions FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "promotions_update" ON public.promotions FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "promotions_delete" ON public.promotions FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- LAN NODES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lan_nodes') THEN
        ALTER TABLE public.lan_nodes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "lan_nodes_select" ON public.lan_nodes;
        DROP POLICY IF EXISTS "lan_nodes_insert" ON public.lan_nodes;
        DROP POLICY IF EXISTS "lan_nodes_update" ON public.lan_nodes;
        DROP POLICY IF EXISTS "lan_nodes_delete" ON public.lan_nodes;

        CREATE POLICY "lan_nodes_select" ON public.lan_nodes FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "lan_nodes_insert" ON public.lan_nodes FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "lan_nodes_update" ON public.lan_nodes FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "lan_nodes_delete" ON public.lan_nodes FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- SECTIONS (Inventory sections)
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
        ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "sections_select" ON public.sections;
        DROP POLICY IF EXISTS "sections_insert" ON public.sections;
        DROP POLICY IF EXISTS "sections_update" ON public.sections;
        DROP POLICY IF EXISTS "sections_delete" ON public.sections;

        CREATE POLICY "sections_select" ON public.sections FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "sections_insert" ON public.sections FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "sections_update" ON public.sections FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "sections_delete" ON public.sections FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- Section stock
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'section_stock') THEN
        ALTER TABLE public.section_stock ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "section_stock_select" ON public.section_stock;
        DROP POLICY IF EXISTS "section_stock_insert" ON public.section_stock;
        DROP POLICY IF EXISTS "section_stock_update" ON public.section_stock;
        DROP POLICY IF EXISTS "section_stock_delete" ON public.section_stock;

        CREATE POLICY "section_stock_select" ON public.section_stock FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "section_stock_insert" ON public.section_stock FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "section_stock_update" ON public.section_stock FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "section_stock_delete" ON public.section_stock FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- USER PROFILES (read own, admin can read all)
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_manage_auth" ON public.user_profiles;

CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "user_profiles_delete" ON public.user_profiles FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- SETTINGS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "settings_select" ON public.settings;
        DROP POLICY IF EXISTS "settings_insert" ON public.settings;
        DROP POLICY IF EXISTS "settings_update" ON public.settings;
        DROP POLICY IF EXISTS "settings_delete" ON public.settings;

        CREATE POLICY "settings_select" ON public.settings FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "settings_insert" ON public.settings FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "settings_update" ON public.settings FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "settings_delete" ON public.settings FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- B2B TABLES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'b2b_orders') THEN
        ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "b2b_orders_select" ON public.b2b_orders;
        DROP POLICY IF EXISTS "b2b_orders_insert" ON public.b2b_orders;
        DROP POLICY IF EXISTS "b2b_orders_update" ON public.b2b_orders;
        DROP POLICY IF EXISTS "b2b_orders_delete" ON public.b2b_orders;

        CREATE POLICY "b2b_orders_select" ON public.b2b_orders FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "b2b_orders_insert" ON public.b2b_orders FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "b2b_orders_update" ON public.b2b_orders FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "b2b_orders_delete" ON public.b2b_orders FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'b2b_order_items') THEN
        ALTER TABLE public.b2b_order_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "b2b_order_items_select" ON public.b2b_order_items;
        DROP POLICY IF EXISTS "b2b_order_items_insert" ON public.b2b_order_items;
        DROP POLICY IF EXISTS "b2b_order_items_update" ON public.b2b_order_items;
        DROP POLICY IF EXISTS "b2b_order_items_delete" ON public.b2b_order_items;

        CREATE POLICY "b2b_order_items_select" ON public.b2b_order_items FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "b2b_order_items_insert" ON public.b2b_order_items FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "b2b_order_items_update" ON public.b2b_order_items FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "b2b_order_items_delete" ON public.b2b_order_items FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PRODUCTION RECORDS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'production_records') THEN
        ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "production_records_select" ON public.production_records;
        DROP POLICY IF EXISTS "production_records_insert" ON public.production_records;
        DROP POLICY IF EXISTS "production_records_update" ON public.production_records;
        DROP POLICY IF EXISTS "production_records_delete" ON public.production_records;

        CREATE POLICY "production_records_select" ON public.production_records FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "production_records_insert" ON public.production_records FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "production_records_update" ON public.production_records FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "production_records_delete" ON public.production_records FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- INVENTORY COUNTS (Stock Opname)
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_counts') THEN
        ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "inventory_counts_select" ON public.inventory_counts;
        DROP POLICY IF EXISTS "inventory_counts_insert" ON public.inventory_counts;
        DROP POLICY IF EXISTS "inventory_counts_update" ON public.inventory_counts;
        DROP POLICY IF EXISTS "inventory_counts_delete" ON public.inventory_counts;

        CREATE POLICY "inventory_counts_select" ON public.inventory_counts FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "inventory_counts_insert" ON public.inventory_counts FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "inventory_counts_update" ON public.inventory_counts FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "inventory_counts_delete" ON public.inventory_counts FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- FLOOR PLAN ITEMS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'floor_plan_items') THEN
        ALTER TABLE public.floor_plan_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "floor_plan_items_select" ON public.floor_plan_items;
        DROP POLICY IF EXISTS "floor_plan_items_insert" ON public.floor_plan_items;
        DROP POLICY IF EXISTS "floor_plan_items_update" ON public.floor_plan_items;
        DROP POLICY IF EXISTS "floor_plan_items_delete" ON public.floor_plan_items;

        CREATE POLICY "floor_plan_items_select" ON public.floor_plan_items FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "floor_plan_items_insert" ON public.floor_plan_items FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "floor_plan_items_update" ON public.floor_plan_items FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "floor_plan_items_delete" ON public.floor_plan_items FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- ROLES & PERMISSIONS & USER_ROLES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "roles_select" ON public.roles;
        DROP POLICY IF EXISTS "roles_insert" ON public.roles;
        DROP POLICY IF EXISTS "roles_update" ON public.roles;
        DROP POLICY IF EXISTS "roles_delete" ON public.roles;

        CREATE POLICY "roles_select" ON public.roles FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "roles_insert" ON public.roles FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "roles_update" ON public.roles FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "roles_delete" ON public.roles FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "permissions_select" ON public.permissions;
        DROP POLICY IF EXISTS "permissions_insert" ON public.permissions;
        DROP POLICY IF EXISTS "permissions_update" ON public.permissions;
        DROP POLICY IF EXISTS "permissions_delete" ON public.permissions;

        CREATE POLICY "permissions_select" ON public.permissions FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "permissions_insert" ON public.permissions FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "permissions_update" ON public.permissions FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "permissions_delete" ON public.permissions FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
        ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "role_permissions_select" ON public.role_permissions;
        DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
        DROP POLICY IF EXISTS "role_permissions_update" ON public.role_permissions;
        DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;

        CREATE POLICY "role_permissions_select" ON public.role_permissions FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "role_permissions_insert" ON public.role_permissions FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "role_permissions_update" ON public.role_permissions FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "role_permissions_delete" ON public.role_permissions FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
        DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
        DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
        DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;

        CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "user_roles_update" ON public.user_roles FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "user_roles_delete" ON public.user_roles FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_permissions') THEN
        ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "user_permissions_select" ON public.user_permissions;
        DROP POLICY IF EXISTS "user_permissions_insert" ON public.user_permissions;
        DROP POLICY IF EXISTS "user_permissions_update" ON public.user_permissions;
        DROP POLICY IF EXISTS "user_permissions_delete" ON public.user_permissions;

        CREATE POLICY "user_permissions_select" ON public.user_permissions FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "user_permissions_insert" ON public.user_permissions FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "user_permissions_update" ON public.user_permissions FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "user_permissions_delete" ON public.user_permissions FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PRODUCT UOMS (Units of Measure)
-- =====================================================
-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.product_uoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    unit_name VARCHAR(50) NOT NULL,
    conversion_factor DECIMAL(10,4) DEFAULT 1,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_uoms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_uoms_select" ON public.product_uoms;
DROP POLICY IF EXISTS "product_uoms_insert" ON public.product_uoms;
DROP POLICY IF EXISTS "product_uoms_update" ON public.product_uoms;
DROP POLICY IF EXISTS "product_uoms_delete" ON public.product_uoms;

CREATE POLICY "product_uoms_select" ON public.product_uoms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "product_uoms_insert" ON public.product_uoms FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "product_uoms_update" ON public.product_uoms FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "product_uoms_delete" ON public.product_uoms FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
        DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

        CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (TRUE);
    END IF;
END $$;

-- =====================================================
-- LOYALTY TABLES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loyalty_tiers') THEN
        ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "loyalty_tiers_select" ON public.loyalty_tiers;
        DROP POLICY IF EXISTS "loyalty_tiers_insert" ON public.loyalty_tiers;
        DROP POLICY IF EXISTS "loyalty_tiers_update" ON public.loyalty_tiers;
        DROP POLICY IF EXISTS "loyalty_tiers_delete" ON public.loyalty_tiers;

        CREATE POLICY "loyalty_tiers_select" ON public.loyalty_tiers FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "loyalty_tiers_insert" ON public.loyalty_tiers FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "loyalty_tiers_update" ON public.loyalty_tiers FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "loyalty_tiers_delete" ON public.loyalty_tiers FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loyalty_transactions') THEN
        ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "loyalty_transactions_select" ON public.loyalty_transactions;
        DROP POLICY IF EXISTS "loyalty_transactions_insert" ON public.loyalty_transactions;
        DROP POLICY IF EXISTS "loyalty_transactions_update" ON public.loyalty_transactions;
        DROP POLICY IF EXISTS "loyalty_transactions_delete" ON public.loyalty_transactions;

        CREATE POLICY "loyalty_transactions_select" ON public.loyalty_transactions FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "loyalty_transactions_insert" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "loyalty_transactions_update" ON public.loyalty_transactions FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "loyalty_transactions_delete" ON public.loyalty_transactions FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- B2B PAYMENTS
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'b2b_payments') THEN
        ALTER TABLE public.b2b_payments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "b2b_payments_select" ON public.b2b_payments;
        DROP POLICY IF EXISTS "b2b_payments_insert" ON public.b2b_payments;
        DROP POLICY IF EXISTS "b2b_payments_update" ON public.b2b_payments;
        DROP POLICY IF EXISTS "b2b_payments_delete" ON public.b2b_payments;

        CREATE POLICY "b2b_payments_select" ON public.b2b_payments FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "b2b_payments_insert" ON public.b2b_payments FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "b2b_payments_update" ON public.b2b_payments FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "b2b_payments_delete" ON public.b2b_payments FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PRODUCT COMBO RELATED TABLES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_combo_groups') THEN
        ALTER TABLE public.product_combo_groups ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_combo_groups_select" ON public.product_combo_groups;
        DROP POLICY IF EXISTS "product_combo_groups_insert" ON public.product_combo_groups;
        DROP POLICY IF EXISTS "product_combo_groups_update" ON public.product_combo_groups;
        DROP POLICY IF EXISTS "product_combo_groups_delete" ON public.product_combo_groups;

        CREATE POLICY "product_combo_groups_select" ON public.product_combo_groups FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "product_combo_groups_insert" ON public.product_combo_groups FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "product_combo_groups_update" ON public.product_combo_groups FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "product_combo_groups_delete" ON public.product_combo_groups FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_combo_group_items') THEN
        ALTER TABLE public.product_combo_group_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_combo_group_items_select" ON public.product_combo_group_items;
        DROP POLICY IF EXISTS "product_combo_group_items_insert" ON public.product_combo_group_items;
        DROP POLICY IF EXISTS "product_combo_group_items_update" ON public.product_combo_group_items;
        DROP POLICY IF EXISTS "product_combo_group_items_delete" ON public.product_combo_group_items;

        CREATE POLICY "product_combo_group_items_select" ON public.product_combo_group_items FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "product_combo_group_items_insert" ON public.product_combo_group_items FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "product_combo_group_items_update" ON public.product_combo_group_items FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "product_combo_group_items_delete" ON public.product_combo_group_items FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PROMOTION RELATED TABLES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotion_products') THEN
        ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "promotion_products_select" ON public.promotion_products;
        DROP POLICY IF EXISTS "promotion_products_insert" ON public.promotion_products;
        DROP POLICY IF EXISTS "promotion_products_update" ON public.promotion_products;
        DROP POLICY IF EXISTS "promotion_products_delete" ON public.promotion_products;

        CREATE POLICY "promotion_products_select" ON public.promotion_products FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "promotion_products_insert" ON public.promotion_products FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "promotion_products_update" ON public.promotion_products FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "promotion_products_delete" ON public.promotion_products FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotion_free_products') THEN
        ALTER TABLE public.promotion_free_products ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "promotion_free_products_select" ON public.promotion_free_products;
        DROP POLICY IF EXISTS "promotion_free_products_insert" ON public.promotion_free_products;
        DROP POLICY IF EXISTS "promotion_free_products_update" ON public.promotion_free_products;
        DROP POLICY IF EXISTS "promotion_free_products_delete" ON public.promotion_free_products;

        CREATE POLICY "promotion_free_products_select" ON public.promotion_free_products FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "promotion_free_products_insert" ON public.promotion_free_products FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "promotion_free_products_update" ON public.promotion_free_products FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "promotion_free_products_delete" ON public.promotion_free_products FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotion_usage') THEN
        ALTER TABLE public.promotion_usage ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "promotion_usage_select" ON public.promotion_usage;
        DROP POLICY IF EXISTS "promotion_usage_insert" ON public.promotion_usage;
        DROP POLICY IF EXISTS "promotion_usage_update" ON public.promotion_usage;
        DROP POLICY IF EXISTS "promotion_usage_delete" ON public.promotion_usage;

        CREATE POLICY "promotion_usage_select" ON public.promotion_usage FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "promotion_usage_insert" ON public.promotion_usage FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "promotion_usage_update" ON public.promotion_usage FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "promotion_usage_delete" ON public.promotion_usage FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- PRODUCT CATEGORY PRICES
-- =====================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_category_prices') THEN
        ALTER TABLE public.product_category_prices ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "product_category_prices_select" ON public.product_category_prices;
        DROP POLICY IF EXISTS "product_category_prices_insert" ON public.product_category_prices;
        DROP POLICY IF EXISTS "product_category_prices_update" ON public.product_category_prices;
        DROP POLICY IF EXISTS "product_category_prices_delete" ON public.product_category_prices;

        CREATE POLICY "product_category_prices_select" ON public.product_category_prices FOR SELECT TO authenticated USING (TRUE);
        CREATE POLICY "product_category_prices_insert" ON public.product_category_prices FOR INSERT TO authenticated WITH CHECK (TRUE);
        CREATE POLICY "product_category_prices_update" ON public.product_category_prices FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
        CREATE POLICY "product_category_prices_delete" ON public.product_category_prices FOR DELETE TO authenticated USING (TRUE);
    END IF;
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
