-- =====================================================
-- THE BREAKERY - RECETTES SIMPLES
-- Copiez-collez ce script dans Supabase SQL Editor
-- =====================================================
-- 1. AJOUTER LES MATIERES PREMIERES
-- Coffee bean (matière première pour tous les cafés)
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
SELECT 'RM-COFFEE',
    'Coffee bean',
    id,
    'raw_material',
    240,
    12000,
    'gr',
    false,
    1000
FROM categories
WHERE name = 'Coffee'
LIMIT 1 ON CONFLICT (sku) DO
UPDATE
SET current_stock = 12000;
-- Fresh Milk
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
SELECT 'RM-MILK',
    'Fresh Milk',
    id,
    'raw_material',
    20,
    50000,
    'ml',
    false,
    5000
FROM categories
WHERE name = 'Coffee'
LIMIT 1 ON CONFLICT (sku) DO
UPDATE
SET current_stock = 50000;
-- Croissant Dough
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
SELECT 'RM-DOUGH',
    'Croissant Dough',
    id,
    'semi_finished',
    65,
    40000,
    'gr',
    false,
    5000
FROM categories
WHERE name = 'Classic Viennoiserie'
LIMIT 1 ON CONFLICT (sku) DO
UPDATE
SET current_stock = 40000;
-- Chocolate Stick
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
SELECT 'RM-CHOCO',
    'Chocolate Stick',
    id,
    'raw_material',
    264,
    5000,
    'gr',
    false,
    500
FROM categories
WHERE name = 'Classic Viennoiserie'
LIMIT 1 ON CONFLICT (sku) DO
UPDATE
SET current_stock = 5000;
-- 2. CREER LES RECETTES
-- Espresso = 9gr Coffee bean
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
    AND m.sku = 'RM-COFFEE' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Double Espresso = 18gr Coffee bean
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
    AND m.sku = 'RM-COFFEE' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Americano = 18gr Coffee bean
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
    AND m.sku = 'RM-COFFEE' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Cappuccino = 18gr Coffee bean + 200ml Milk
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
    AND m.sku = 'RM-COFFEE' ON CONFLICT (product_id, material_id) DO NOTHING;
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
    AND m.sku = 'RM-MILK' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Latte = 18gr Coffee + 200ml Milk
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
    AND m.sku = 'RM-COFFEE' ON CONFLICT (product_id, material_id) DO NOTHING;
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
    AND m.sku = 'RM-MILK' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Flat White = 18gr Coffee + 200ml Milk
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
    AND m.sku = 'RM-COFFEE' ON CONFLICT (product_id, material_id) DO NOTHING;
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
    AND m.sku = 'RM-MILK' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Croissant = 90gr Dough
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
    AND m.sku = 'RM-DOUGH' ON CONFLICT (product_id, material_id) DO NOTHING;
-- Chocolatine = 90gr Dough + 10gr Chocolate
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
    AND m.sku = 'RM-DOUGH' ON CONFLICT (product_id, material_id) DO NOTHING;
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
    AND m.sku = 'RM-CHOCO' ON CONFLICT (product_id, material_id) DO NOTHING;
-- 3. VERIFICATION - Affiche les recettes créées
SELECT p.name as "Produit",
    p.sku as "SKU",
    m.name as "Ingrédient",
    r.quantity as "Quantité",
    r.unit as "Unité"
FROM recipes r
    JOIN products p ON r.product_id = p.id
    JOIN products m ON r.material_id = m.id
WHERE r.is_active = true
ORDER BY p.name,
    m.name;