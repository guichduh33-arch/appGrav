-- Migration 031: Combo Choice Groups
-- Update combo system to support choice groups (e.g., choose 1 drink + 1 pastry)

-- =====================================================
-- Drop old combo items table structure
-- =====================================================
DROP TABLE IF EXISTS product_combo_items CASCADE;

-- =====================================================
-- TABLE: product_combo_groups
-- Groups of choices within a combo (e.g., "Boissons", "Viennoiseries")
-- =====================================================
CREATE TABLE IF NOT EXISTS product_combo_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
    group_name VARCHAR(255) NOT NULL,
    group_type VARCHAR(20) NOT NULL DEFAULT 'single', -- 'single' or 'multiple'
    is_required BOOLEAN DEFAULT true,
    min_selections INTEGER DEFAULT 1,
    max_selections INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for combo groups lookup
CREATE INDEX IF NOT EXISTS idx_combo_groups_combo ON product_combo_groups(combo_id);

-- =====================================================
-- TABLE: product_combo_group_items
-- Available products/options within a choice group
-- =====================================================
CREATE TABLE IF NOT EXISTS product_combo_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES product_combo_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_adjustment NUMERIC(10, 2) DEFAULT 0, -- Additional price for this option
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for group items lookup
CREATE INDEX IF NOT EXISTS idx_combo_group_items_group ON product_combo_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_combo_group_items_product ON product_combo_group_items(product_id);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Product Combo Groups
ALTER TABLE product_combo_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to combo groups"
    ON product_combo_groups FOR SELECT
    USING (true);

CREATE POLICY "Allow insert combo groups for authenticated users"
    ON product_combo_groups FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update combo groups for authenticated users"
    ON product_combo_groups FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete combo groups for authenticated users"
    ON product_combo_groups FOR DELETE
    USING (auth.role() = 'authenticated');

-- Product Combo Group Items
ALTER TABLE product_combo_group_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to combo group items"
    ON product_combo_group_items FOR SELECT
    USING (true);

CREATE POLICY "Allow insert combo group items for authenticated users"
    ON product_combo_group_items FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update combo group items for authenticated users"
    ON product_combo_group_items FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete combo group items for authenticated users"
    ON product_combo_group_items FOR DELETE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTION: get_combo_with_groups
-- Returns a combo with all its choice groups and items
-- =====================================================
CREATE OR REPLACE FUNCTION get_combo_with_groups(p_combo_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'combo', row_to_json(c),
        'groups', (
            SELECT json_agg(
                json_build_object(
                    'group', row_to_json(g),
                    'items', (
                        SELECT json_agg(
                            json_build_object(
                                'id', gi.id,
                                'product_id', gi.product_id,
                                'product', row_to_json(p),
                                'price_adjustment', gi.price_adjustment,
                                'is_default', gi.is_default,
                                'sort_order', gi.sort_order
                            )
                            ORDER BY gi.sort_order, p.name
                        )
                        FROM product_combo_group_items gi
                        JOIN products p ON gi.product_id = p.id
                        WHERE gi.group_id = g.id
                    )
                )
                ORDER BY g.sort_order, g.group_name
            )
            FROM product_combo_groups g
            WHERE g.combo_id = p_combo_id
        )
    ) INTO v_result
    FROM product_combos c
    WHERE c.id = p_combo_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: calculate_combo_total_price
-- Calculates total price of a combo with selected options
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_combo_total_price(
    p_combo_id UUID,
    p_selected_items UUID[] -- Array of selected group item IDs
)
RETURNS NUMERIC AS $$
DECLARE
    v_base_price NUMERIC;
    v_adjustments_total NUMERIC;
BEGIN
    -- Get base combo price
    SELECT combo_price INTO v_base_price
    FROM product_combos
    WHERE id = p_combo_id;

    -- Calculate total price adjustments from selected items
    SELECT COALESCE(SUM(price_adjustment), 0) INTO v_adjustments_total
    FROM product_combo_group_items
    WHERE id = ANY(p_selected_items);

    RETURN v_base_price + v_adjustments_total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data Comments
-- =====================================================

COMMENT ON TABLE product_combo_groups IS 'Choice groups within combos (e.g., Drinks group, Pastries group)';
COMMENT ON TABLE product_combo_group_items IS 'Available product options within each choice group with price adjustments';
COMMENT ON COLUMN product_combo_groups.group_type IS 'single = choose 1, multiple = choose many';
COMMENT ON COLUMN product_combo_groups.is_required IS 'Whether customer must make a selection from this group';
COMMENT ON COLUMN product_combo_groups.min_selections IS 'Minimum number of items to select (for multiple type)';
COMMENT ON COLUMN product_combo_groups.max_selections IS 'Maximum number of items to select';
COMMENT ON COLUMN product_combo_group_items.price_adjustment IS 'Additional price for this option (0 = included in base price, positive = extra charge)';

-- =====================================================
-- Example: Create a sample combo with choice groups
-- =====================================================

-- This is commented out - uncomment and adjust IDs to test
/*
DO $$
DECLARE
    v_combo_id UUID;
    v_group_drinks_id UUID;
    v_group_pastries_id UUID;
    v_product_coffee_id UUID;
    v_product_cappuccino_id UUID;
    v_product_juice_id UUID;
    v_product_croissant_id UUID;
    v_product_choco_id UUID;
BEGIN
    -- Get product IDs (adjust these to match your products)
    SELECT id INTO v_product_coffee_id FROM products WHERE name ILIKE '%café%' LIMIT 1;
    SELECT id INTO v_product_cappuccino_id FROM products WHERE name ILIKE '%cappuccino%' LIMIT 1;
    SELECT id INTO v_product_juice_id FROM products WHERE name ILIKE '%jus%' LIMIT 1;
    SELECT id INTO v_product_croissant_id FROM products WHERE name ILIKE '%croissant%' LIMIT 1;
    SELECT id INTO v_product_choco_id FROM products WHERE name ILIKE '%chocolat%' LIMIT 1;

    -- Create combo
    INSERT INTO product_combos (name, description, combo_price, is_active, available_at_pos)
    VALUES (
        'Petit Déjeuner',
        'Choisissez votre boisson et votre viennoiserie',
        45000,
        true,
        true
    )
    RETURNING id INTO v_combo_id;

    -- Create "Boissons" group
    INSERT INTO product_combo_groups (combo_id, group_name, group_type, is_required, min_selections, max_selections, sort_order)
    VALUES (v_combo_id, 'Boissons', 'single', true, 1, 1, 1)
    RETURNING id INTO v_group_drinks_id;

    -- Add drink options
    IF v_product_coffee_id IS NOT NULL THEN
        INSERT INTO product_combo_group_items (group_id, product_id, price_adjustment, is_default, sort_order)
        VALUES (v_group_drinks_id, v_product_coffee_id, 0, true, 1); -- Included in base price
    END IF;

    IF v_product_cappuccino_id IS NOT NULL THEN
        INSERT INTO product_combo_group_items (group_id, product_id, price_adjustment, sort_order)
        VALUES (v_group_drinks_id, v_product_cappuccino_id, 5000, 2); -- +5,000 IDR
    END IF;

    IF v_product_juice_id IS NOT NULL THEN
        INSERT INTO product_combo_group_items (group_id, product_id, price_adjustment, sort_order)
        VALUES (v_group_drinks_id, v_product_juice_id, 3000, 3); -- +3,000 IDR
    END IF;

    -- Create "Viennoiseries" group
    INSERT INTO product_combo_groups (combo_id, group_name, group_type, is_required, min_selections, max_selections, sort_order)
    VALUES (v_combo_id, 'Viennoiseries', 'single', true, 1, 1, 2)
    RETURNING id INTO v_group_pastries_id;

    -- Add pastry options
    IF v_product_croissant_id IS NOT NULL THEN
        INSERT INTO product_combo_group_items (group_id, product_id, price_adjustment, is_default, sort_order)
        VALUES (v_group_pastries_id, v_product_croissant_id, 0, true, 1); -- Included
    END IF;

    IF v_product_choco_id IS NOT NULL THEN
        INSERT INTO product_combo_group_items (group_id, product_id, price_adjustment, sort_order)
        VALUES (v_group_pastries_id, v_product_choco_id, 2000, 2); -- +2,000 IDR
    END IF;

    RAISE NOTICE 'Sample combo created with ID: %', v_combo_id;
END $$;
*/
