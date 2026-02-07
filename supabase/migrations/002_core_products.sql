-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 002: Core Products Module
-- Tables: categories, sections, products, product_modifiers, product_uoms, recipes
-- =====================================================

-- =====================================================
-- TABLE: sections (production areas)
-- =====================================================
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sections_code ON sections(code);
CREATE INDEX idx_sections_active ON sections(is_active) WHERE is_active = TRUE;

-- =====================================================
-- TABLE: categories
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(7),
    dispatch_station dispatch_station DEFAULT 'none',
    is_raw_material BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_categories_dispatch ON categories(dispatch_station);

-- =====================================================
-- TABLE: products
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL DEFAULT substr(gen_random_uuid()::text, 1, 8),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    product_type product_type DEFAULT 'finished',

    -- Pricing
    retail_price DECIMAL(12,2) DEFAULT 0,
    wholesale_price DECIMAL(12,2) DEFAULT 0,
    cost_price DECIMAL(12,2) DEFAULT 0,

    -- Stock
    current_stock DECIMAL(10,3) DEFAULT 0,
    min_stock_level DECIMAL(10,3) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',

    -- Production flags
    deduct_ingredients BOOLEAN DEFAULT FALSE,
    is_made_to_order BOOLEAN DEFAULT FALSE,

    -- Visibility
    pos_visible BOOLEAN DEFAULT TRUE,
    available_for_sale BOOLEAN DEFAULT TRUE,

    -- Media
    image_url TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_section ON products(section_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_type ON products(product_type);
CREATE INDEX idx_products_pos ON products(pos_visible, available_for_sale)
    WHERE pos_visible = TRUE AND available_for_sale = TRUE;
CREATE INDEX idx_products_stock_alert ON products(current_stock, min_stock_level)
    WHERE current_stock < min_stock_level;

-- =====================================================
-- TABLE: product_sections (many-to-many)
-- =====================================================
CREATE TABLE product_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, section_id)
);

CREATE INDEX idx_product_sections_product ON product_sections(product_id);
CREATE INDEX idx_product_sections_section ON product_sections(section_id);

-- =====================================================
-- TABLE: product_modifiers
-- =====================================================
CREATE TABLE product_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    group_name VARCHAR(100) NOT NULL,
    group_type modifier_group_type DEFAULT 'single',
    group_required BOOLEAN DEFAULT FALSE,
    group_sort_order INTEGER DEFAULT 0,
    option_id VARCHAR(50) NOT NULL,
    option_label VARCHAR(100) NOT NULL,
    option_icon VARCHAR(10),
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    option_sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_modifier_link CHECK (
        (product_id IS NOT NULL AND category_id IS NULL) OR
        (product_id IS NULL AND category_id IS NOT NULL)
    )
);

CREATE INDEX idx_modifiers_product ON product_modifiers(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_modifiers_category ON product_modifiers(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_modifiers_group ON product_modifiers(group_name, group_sort_order);

-- =====================================================
-- TABLE: product_uoms (Unit of Measure)
-- =====================================================
CREATE TABLE product_uoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    uom_name VARCHAR(50) NOT NULL,
    uom_code VARCHAR(20) NOT NULL,
    conversion_factor DECIMAL(10,4) NOT NULL DEFAULT 1,
    is_base_uom BOOLEAN DEFAULT FALSE,
    is_purchase_uom BOOLEAN DEFAULT FALSE,
    is_sale_uom BOOLEAN DEFAULT FALSE,
    barcode VARCHAR(50),
    price_override DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, uom_code)
);

CREATE INDEX idx_product_uoms_product ON product_uoms(product_id);
CREATE INDEX idx_product_uoms_barcode ON product_uoms(barcode) WHERE barcode IS NOT NULL;

-- =====================================================
-- TABLE: recipes
-- =====================================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, material_id)
);

CREATE INDEX idx_recipes_product ON recipes(product_id);
CREATE INDEX idx_recipes_material ON recipes(material_id);

-- =====================================================
-- TABLE: product_variant_materials (for modifiers that use materials)
-- =====================================================
CREATE TABLE product_variant_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_key VARCHAR(100) NOT NULL,
    material_ids UUID[] NOT NULL DEFAULT '{}',
    quantity DECIMAL(10,4) NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, variant_key)
);

CREATE INDEX idx_variant_materials_product ON product_variant_materials(product_id);

-- =====================================================
-- TABLE: suppliers
-- =====================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Indonesia',
    contact_person VARCHAR(200),
    payment_terms payment_terms DEFAULT 'cod',
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);
