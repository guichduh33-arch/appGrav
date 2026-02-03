-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Migration: Section Stock Model
-- Description: Implements stock tracking per section with proper
--              separation between sections (teams) and stock_locations (physical)
-- =====================================================

-- =====================================================
-- STEP 1: Enhance sections table
-- =====================================================

-- Add section_type to distinguish warehouse/production/sales
ALTER TABLE sections
ADD COLUMN IF NOT EXISTS section_type VARCHAR(20)
    CHECK (section_type IN ('warehouse', 'production', 'sales'));

-- Add manager reference
ALTER TABLE sections
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES user_profiles(id);

-- Add icon for UI display
ALTER TABLE sections
ADD COLUMN IF NOT EXISTS icon VARCHAR(10);

-- Create index for section_type queries
CREATE INDEX IF NOT EXISTS idx_sections_type ON sections(section_type);

COMMENT ON COLUMN sections.section_type IS 'Type of section: warehouse (storage), production (transforms products), sales (sells to customers)';
COMMENT ON COLUMN sections.manager_id IS 'User responsible for this section (chef de section)';

-- =====================================================
-- STEP 2: Create section_stock table
-- =====================================================

CREATE TABLE IF NOT EXISTS section_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Current quantity in this section
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0,

    -- Alert thresholds
    min_quantity DECIMAL(10,3) DEFAULT 0,
    max_quantity DECIMAL(10,3),

    -- Last inventory count info
    last_counted_at TIMESTAMPTZ,
    last_counted_by UUID REFERENCES user_profiles(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one entry per section per product
    UNIQUE(section_id, product_id)
);

-- Add constraint: quantity cannot be negative
ALTER TABLE section_stock
ADD CONSTRAINT chk_section_stock_non_negative
CHECK (quantity >= 0);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_stock_section ON section_stock(section_id);
CREATE INDEX IF NOT EXISTS idx_section_stock_product ON section_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_section_stock_low ON section_stock(section_id, product_id)
    WHERE quantity <= min_quantity;

COMMENT ON TABLE section_stock IS 'Tracks stock quantity per section - each section maintains its own inventory';
COMMENT ON COLUMN section_stock.quantity IS 'Current stock quantity in this section';
COMMENT ON COLUMN section_stock.min_quantity IS 'Minimum quantity before triggering replenishment alert';

-- =====================================================
-- STEP 3: Enhance stock_movements with section tracking
-- =====================================================

-- Add section references to stock_movements
ALTER TABLE stock_movements
ADD COLUMN IF NOT EXISTS from_section_id UUID REFERENCES sections(id),
ADD COLUMN IF NOT EXISTS to_section_id UUID REFERENCES sections(id);

-- Indexes for section-based queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_from_section ON stock_movements(from_section_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_to_section ON stock_movements(to_section_id);

COMMENT ON COLUMN stock_movements.from_section_id IS 'Section from which stock was removed';
COMMENT ON COLUMN stock_movements.to_section_id IS 'Section to which stock was added';

-- =====================================================
-- STEP 4: Link stock_locations to sections (optional)
-- =====================================================

ALTER TABLE stock_locations
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id);

CREATE INDEX IF NOT EXISTS idx_stock_locations_section ON stock_locations(section_id);

COMMENT ON COLUMN stock_locations.section_id IS 'Section that owns/manages this physical location';

-- =====================================================
-- STEP 5: Create trigger to sync products.current_stock
-- =====================================================

CREATE OR REPLACE FUNCTION sync_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's total stock as sum of all section stocks
    UPDATE products
    SET current_stock = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM section_stock
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_sync_product_stock ON section_stock;

CREATE TRIGGER trg_sync_product_stock
AFTER INSERT OR UPDATE OR DELETE ON section_stock
FOR EACH ROW EXECUTE FUNCTION sync_product_total_stock();

COMMENT ON FUNCTION sync_product_total_stock IS 'Automatically updates products.current_stock as the sum of all section_stock quantities';

-- =====================================================
-- STEP 6: Create function for recipe deduction logic
-- =====================================================

CREATE OR REPLACE FUNCTION get_ingredient_deduction_section(
    p_ingredient_id UUID,
    p_consuming_section_id UUID
) RETURNS UUID AS $$
DECLARE
    v_product_type product_type;
    v_ingredient_section_id UUID;
BEGIN
    -- Get the ingredient's type and section
    SELECT product_type, section_id
    INTO v_product_type, v_ingredient_section_id
    FROM products
    WHERE id = p_ingredient_id;

    -- Rule: semi_finished -> deduct from its origin section
    --       raw_material -> deduct from the consuming section
    IF v_product_type = 'semi_finished' THEN
        RETURN v_ingredient_section_id;
    ELSE
        RETURN p_consuming_section_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_ingredient_deduction_section IS 'Determines which section to deduct stock from based on ingredient type: semi_finished from origin section, raw_material from consuming section';

-- =====================================================
-- STEP 7: Insert default sections (The Breakery specific)
-- =====================================================

-- First, clean up any invalid section data (categories mixed with sections)
-- We'll mark them inactive rather than delete to preserve FK references
UPDATE sections
SET is_active = FALSE,
    description = 'DEPRECATED - was incorrectly used as category'
WHERE code NOT IN ('warehouse', 'viennoiserie', 'hot_kitchen', 'pastry', 'bakery', 'cafe', 'bar');

-- Insert the correct sections if they don't exist
INSERT INTO sections (name, code, section_type, icon, description, sort_order, is_active)
VALUES
    ('Warehouse', 'warehouse', 'warehouse', '🏭', 'Main storage for raw materials', 1, TRUE),
    ('Viennoiserie', 'viennoiserie', 'production', '🥐', 'Croissants, pains au chocolat, etc.', 2, TRUE),
    ('Pâtisserie', 'pastry', 'production', '🎂', 'Cakes, tarts, desserts', 3, TRUE),
    ('Boulangerie', 'bakery', 'production', '🍞', 'Breads and baked goods', 4, TRUE),
    ('Cuisine Chaude', 'hot_kitchen', 'production', '🍳', 'Hot food preparation', 5, TRUE),
    ('Café', 'cafe', 'sales', '☕', 'Coffee bar and front counter', 6, TRUE),
    ('Bar', 'bar', 'sales', '🍹', 'Beverage bar', 7, TRUE)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    section_type = EXCLUDED.section_type,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = TRUE;

-- =====================================================
-- STEP 8: RLS Policies for section_stock
-- =====================================================

ALTER TABLE section_stock ENABLE ROW LEVEL SECURITY;

-- Read policy: authenticated users can view all section stock
CREATE POLICY "Authenticated users can view section stock"
ON section_stock FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Write policy: users with inventory permissions can modify
CREATE POLICY "Inventory permission required for section stock changes"
ON section_stock FOR ALL
USING (
    auth.uid() IS NOT NULL AND (
        public.is_admin(auth.uid()) OR
        public.user_has_permission(auth.uid(), 'inventory.update')
    )
);

-- =====================================================
-- STEP 9: Create view for section stock with product details
-- =====================================================

CREATE OR REPLACE VIEW view_section_stock_details AS
SELECT
    ss.id,
    ss.section_id,
    s.name AS section_name,
    s.code AS section_code,
    s.section_type,
    ss.product_id,
    p.name AS product_name,
    p.sku,
    p.product_type,
    p.unit,
    ss.quantity,
    ss.min_quantity,
    ss.max_quantity,
    CASE
        WHEN ss.quantity <= 0 THEN 'out_of_stock'
        WHEN ss.quantity <= ss.min_quantity THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status,
    ss.last_counted_at,
    ss.updated_at
FROM section_stock ss
JOIN sections s ON s.id = ss.section_id
JOIN products p ON p.id = ss.product_id
WHERE s.is_active = TRUE;

COMMENT ON VIEW view_section_stock_details IS 'Section stock with product and section details, including stock status';
