-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 005: Inventory & Stock Module
-- Tables: stock_locations, stock_movements, production_records, inventory_counts, transfers
-- =====================================================

-- =====================================================
-- TABLE: stock_locations
-- =====================================================
CREATE TABLE stock_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    location_type location_type DEFAULT 'storage',
    parent_id UUID REFERENCES stock_locations(id),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_locations_code ON stock_locations(code);
CREATE INDEX idx_stock_locations_type ON stock_locations(location_type);
CREATE INDEX idx_stock_locations_parent ON stock_locations(parent_id);

-- =====================================================
-- TABLE: stock_movements
-- =====================================================
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_id VARCHAR(30) NOT NULL UNIQUE,

    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,

    -- Location tracking
    from_location_id UUID REFERENCES stock_locations(id),
    to_location_id UUID REFERENCES stock_locations(id),

    -- Quantity
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(12,2),

    -- Source reference
    reference_type VARCHAR(50),
    reference_id UUID,

    -- Stock before/after
    stock_before DECIMAL(10,3) NOT NULL,
    stock_after DECIMAL(10,3) NOT NULL,

    -- Metadata
    reason TEXT,
    staff_id UUID,
    batch_number VARCHAR(50),
    expiry_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_ref ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_stock_movements_location_from ON stock_movements(from_location_id);
CREATE INDEX idx_stock_movements_location_to ON stock_movements(to_location_id);

-- =====================================================
-- TABLE: production_records
-- =====================================================
CREATE TABLE production_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id VARCHAR(30) NOT NULL UNIQUE,

    product_id UUID NOT NULL REFERENCES products(id),
    section_id UUID REFERENCES sections(id),
    quantity_produced DECIMAL(10,3) NOT NULL,
    quantity_waste DECIMAL(10,3) DEFAULT 0,

    production_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Traceability
    staff_id UUID,
    staff_name VARCHAR(200),

    -- Processing status
    stock_updated BOOLEAN DEFAULT FALSE,
    materials_consumed BOOLEAN DEFAULT FALSE,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_product ON production_records(product_id);
CREATE INDEX idx_production_section ON production_records(section_id);
CREATE INDEX idx_production_date ON production_records(production_date);

-- =====================================================
-- TABLE: inventory_counts (stock opname)
-- =====================================================
CREATE TABLE inventory_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_number VARCHAR(30) NOT NULL UNIQUE,
    count_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location_id UUID REFERENCES stock_locations(id),
    section_id UUID REFERENCES sections(id),
    status VARCHAR(20) DEFAULT 'draft',
    notes TEXT,
    created_by UUID,
    validated_by UUID,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_counts_date ON inventory_counts(count_date);
CREATE INDEX idx_inventory_counts_status ON inventory_counts(status);
CREATE INDEX idx_inventory_counts_location ON inventory_counts(location_id);

-- =====================================================
-- TABLE: inventory_count_items
-- =====================================================
CREATE TABLE inventory_count_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    system_quantity DECIMAL(10,3) NOT NULL,
    counted_quantity DECIMAL(10,3),
    difference DECIMAL(10,3),
    unit_cost DECIMAL(12,2),
    notes TEXT,
    counted_by UUID,
    counted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_count_items_count ON inventory_count_items(count_id);
CREATE INDEX idx_inventory_count_items_product ON inventory_count_items(product_id);

-- =====================================================
-- TABLE: internal_transfers
-- =====================================================
CREATE TABLE internal_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(30) NOT NULL UNIQUE,
    from_location_id UUID NOT NULL REFERENCES stock_locations(id),
    to_location_id UUID NOT NULL REFERENCES stock_locations(id),
    status transfer_status DEFAULT 'draft',
    transfer_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    received_date DATE,
    notes TEXT,
    created_by UUID,
    approved_by UUID,
    received_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_internal_transfers_status ON internal_transfers(status);
CREATE INDEX idx_internal_transfers_from ON internal_transfers(from_location_id);
CREATE INDEX idx_internal_transfers_to ON internal_transfers(to_location_id);
CREATE INDEX idx_internal_transfers_date ON internal_transfers(transfer_date);

-- =====================================================
-- TABLE: transfer_items
-- =====================================================
CREATE TABLE transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES internal_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_requested DECIMAL(10,3) NOT NULL,
    quantity_sent DECIMAL(10,3),
    quantity_received DECIMAL(10,3),
    unit_cost DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfer_items_transfer ON transfer_items(transfer_id);
CREATE INDEX idx_transfer_items_product ON transfer_items(product_id);

-- =====================================================
-- TABLE: purchase_orders
-- =====================================================
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(30) NOT NULL UNIQUE,

    supplier_id UUID NOT NULL REFERENCES suppliers(id),

    -- Dates
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date DATE,
    received_date DATE,

    -- Status
    status po_status DEFAULT 'draft',
    expense_type expense_type DEFAULT 'cogs',

    -- Amounts
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.11,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,

    notes TEXT,

    -- Traceability
    created_by UUID,
    received_by UUID,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(order_date);

-- =====================================================
-- TABLE: po_items
-- =====================================================
CREATE TABLE po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),

    quantity_ordered DECIMAL(10,3) NOT NULL,
    quantity_received DECIMAL(10,3) DEFAULT 0,
    unit VARCHAR(20),

    unit_price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_items_po ON po_items(po_id);
CREATE INDEX idx_po_items_product ON po_items(product_id);
