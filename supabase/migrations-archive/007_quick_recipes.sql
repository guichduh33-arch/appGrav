-- =====================================================
-- THE BREAKERY - QUICK RECIPE FIX
-- Run this in Supabase SQL Editor
-- =====================================================
-- Step 1: Add Coffee Bean raw material
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-COF-001',
        'Coffee bean',
        'c1110000-0000-0000-0000-000000000001',
        'raw_material',
        240,
        12441,
        'gr',
        false,
        1000
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-BEV-001',
        'Fresh Milk',
        'c1110000-0000-0000-0000-000000000001',
        'raw_material',
        20,
        58400,
        'ml',
        false,
        5000
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-BEV-002',
        'Oat Milk',
        'c1110000-0000-0000-0000-000000000001',
        'raw_material',
        30,
        32800,
        'ml',
        false,
        3000
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-SFG-001',
        'Croissant Dough',
        'c1110000-0000-0000-0000-000000000001',
        'semi_finished',
        65,
        43530,
        'gr',
        false,
        5000
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-CHO-003',
        'Chocolate Stick',
        'c1110000-0000-0000-0000-000000000001',
        'raw_material',
        264,
        3680,
        'gr',
        false,
        500
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-SFG-002',
        'Almond Cream',
        'c1110000-0000-0000-0000-000000000001',
        'semi_finished',
        73,
        1850,
        'gr',
        false,
        500
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-SEE-002',
        'Almond Slice',
        'c1110000-0000-0000-0000-000000000001',
        'raw_material',
        167,
        5440,
        'gr',
        false,
        500
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible,
        min_stock_level
    )
VALUES (
        'RM-BEV-008',
        'Ice Cream Vanilla',
        'c1110000-0000-0000-0000-000000000001',
        'raw_material',
        41,
        4239,
        'gr',
        false,
        1000
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    current_stock = EXCLUDED.current_stock;
-- Step 2: Get the product IDs and insert recipes
-- Cappuccino (COF-007) + Coffee bean
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-007'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Cappuccino (COF-007) + Fresh Milk
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    200,
    'ml',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-007'
    AND m.sku = 'RM-BEV-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Espresso (COF-001) + Coffee bean
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    9,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-001'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Double Espresso (COF-002) + Coffee bean  
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-002'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Americano (COF-003) + Coffee bean
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-003'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Long Black (COF-004) + Coffee bean
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-004'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Flat White (COF-006) + Coffee bean + Milk
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-006'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    200,
    'ml',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-006'
    AND m.sku = 'RM-BEV-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Latte (COF-008) + Coffee bean + Milk
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-008'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    200,
    'ml',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-008'
    AND m.sku = 'RM-BEV-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Affogato (COF-010) + Coffee bean + Ice Cream
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    18,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-010'
    AND m.sku = 'RM-COF-001' ON CONFLICT (product_id, material_id) DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    170,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'COF-010'
    AND m.sku = 'RM-BEV-008' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Croissant (CV-001) + Croissant Dough
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    90,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'CV-001'
    AND m.sku = 'RM-SFG-001' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Chocolatine (CV-002) + Croissant Dough + Chocolate Stick
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    90,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'CV-002'
    AND m.sku = 'RM-SFG-001' ON CONFLICT (product_id, material_id) DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    10,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'CV-002'
    AND m.sku = 'RM-CHO-003' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Croissant Almond (CV-003) + Almond Cream + Almond Slice
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    25,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'CV-003'
    AND m.sku = 'RM-SFG-002' ON CONFLICT (product_id, material_id) DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    5,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'CV-003'
    AND m.sku = 'RM-SEE-002' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Verify what was inserted
SELECT p.name as product,
    m.name as material,
    r.quantity,
    r.unit,
    r.is_active
FROM recipes r
    JOIN products p ON r.product_id = p.id
    JOIN products m ON r.material_id = m.id
ORDER BY p.name;