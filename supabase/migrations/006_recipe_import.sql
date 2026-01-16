-- =====================================================
-- THE BREAKERY - RAW MATERIALS IMPORT
-- From product_data.csv
-- =====================================================
-- Run this AFTER 002_seed_data.sql to add raw materials
-- =====================================================
-- RAW MATERIAL CATEGORIES (ensure they exist)
-- =====================================================
INSERT INTO categories (
        id,
        name,
        icon,
        color,
        dispatch_station,
        is_raw_material,
        sort_order,
        is_active
    )
VALUES (
        'c1110000-0000-0000-0000-000000000050',
        'SFG',
        '⚙️',
        '#BDC3C7',
        'none',
        true,
        50,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000051',
        'DAIRY',
        '🥛',
        '#F5EEF8',
        'none',
        true,
        51,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000052',
        'DRY',
        '🌾',
        '#FCF3CF',
        'none',
        true,
        52,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000053',
        'FLOUR',
        '🌾',
        '#FDEBD0',
        'none',
        true,
        53,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000054',
        'CONDIMENT',
        '🧂',
        '#FAE5D3',
        'none',
        true,
        54,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000055',
        'SAUCE',
        '🍅',
        '#F5B7B1',
        'none',
        true,
        55,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000056',
        'CHOCOLAT',
        '🍫',
        '#6E2C00',
        'none',
        true,
        56,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000057',
        'SEED',
        '🌰',
        '#D4AC0D',
        'none',
        true,
        57,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000058',
        'VEGETABLE',
        '🥬',
        '#27AE60',
        'none',
        true,
        58,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000059',
        'FRUIT',
        '🍓',
        '#E74C3C',
        'none',
        true,
        59,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000060',
        'meat',
        '🥩',
        '#922B21',
        'none',
        true,
        60,
        true
    ),
    (
        'c1110000-0000-0000-0000-000000000061',
        'BEVERAGE',
        '🧃',
        '#48C9B0',
        'none',
        true,
        61,
        true
    ) ON CONFLICT (id) DO NOTHING;
-- =====================================================
-- RAW MATERIALS (from product_data.csv)
-- =====================================================
-- Coffee & Beverages
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-COF-001',
        'Coffee bean',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        240002,
        12441,
        'gr',
        false
    ),
    (
        'RM-BEV-001',
        'Fresh Milk',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        20500,
        58400,
        'ml',
        false
    ),
    (
        'RM-BEV-002',
        'Oat Milk',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        29818,
        32800,
        'ml',
        false
    ),
    (
        'RM-BEV-003',
        'Matcha Powder',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        202702,
        2450,
        'gr',
        false
    ),
    (
        'RM-BEV-004',
        'Cacao Powder Cafe',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        153603,
        2050,
        'gr',
        false
    ),
    (
        'RM-BEV-005',
        'Syrup Caramel',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        180180,
        1400,
        'ml',
        false
    ),
    (
        'RM-BEV-006',
        'Syrup Vanilla',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        155855,
        1690,
        'ml',
        false
    ),
    (
        'RM-BEV-007',
        'Syrup Hazelnut',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        180180,
        1340,
        'ml',
        false
    ),
    (
        'RM-BEV-008',
        'Ice Cream Vanilla',
        'c1110000-0000-0000-0000-000000000061',
        'raw_material',
        40950,
        4239,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Dairy
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-DAI-001',
        'Whipping Cream',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        121729,
        4687,
        'ml',
        false
    ),
    (
        'RM-DAI-002',
        'Cream Cheese',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        133766,
        5117,
        'gr',
        false
    ),
    (
        'RM-DAI-003',
        'Cooking Butter',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        189999,
        6362,
        'gr',
        false
    ),
    (
        'RM-DAI-004',
        'Mix Butter',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        62666,
        35786,
        'gr',
        false
    ),
    (
        'RM-DAI-005',
        'Butter Sheet Croissant',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        236029,
        61430,
        'gr',
        false
    ),
    (
        'RM-DAI-006',
        'Milk (Uht)',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        15949,
        16640,
        'ml',
        false
    ),
    (
        'RM-DAI-007',
        'Mozarella Cheese',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        112377,
        15210,
        'gr',
        false
    ),
    (
        'RM-DAI-008',
        'Parmesan',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        259457,
        380,
        'gr',
        false
    ),
    (
        'RM-DAI-009',
        'Cheddar Cheese',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        251000,
        740,
        'gr',
        false
    ),
    (
        'RM-DAI-010',
        'Camembert',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        322000,
        2480,
        'gr',
        false
    ),
    (
        'RM-DAI-011',
        'Egg',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        1833,
        172048,
        'pcs',
        false
    ),
    (
        'RM-DAI-012',
        'Goat Cheese',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        362812,
        600,
        'gr',
        false
    ),
    (
        'RM-DAI-013',
        'Milk Powder',
        'c1110000-0000-0000-0000-000000000051',
        'raw_material',
        52753,
        5187,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Flour
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-FLO-001',
        'White Flour',
        'c1110000-0000-0000-0000-000000000053',
        'raw_material',
        10116,
        237986,
        'gr',
        false
    ),
    (
        'RM-FLO-002',
        'Brown Bread Flour',
        'c1110000-0000-0000-0000-000000000053',
        'raw_material',
        62587,
        11600,
        'gr',
        false
    ),
    (
        'RM-FLO-003',
        'FLOUR AMOURETTE',
        'c1110000-0000-0000-0000-000000000053',
        'raw_material',
        111203,
        22500,
        'gr',
        false
    ),
    (
        'RM-FLO-004',
        'Pain De Campagne Flour',
        'c1110000-0000-0000-0000-000000000053',
        'raw_material',
        53200,
        9300,
        'gr',
        false
    ),
    (
        'RM-FLO-005',
        'Crusty Rye Flour',
        'c1110000-0000-0000-0000-000000000053',
        'raw_material',
        106603,
        1526,
        'gr',
        false
    ),
    (
        'RM-FLO-006',
        'Maizena Flour',
        'c1110000-0000-0000-0000-000000000053',
        'raw_material',
        21099,
        1202,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Dry & Sugar
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-DRY-001',
        'White Sugar',
        'c1110000-0000-0000-0000-000000000052',
        'raw_material',
        18000,
        18230,
        'gr',
        false
    ),
    (
        'RM-DRY-002',
        'Ice Sugar',
        'c1110000-0000-0000-0000-000000000052',
        'raw_material',
        25706,
        916,
        'gr',
        false
    ),
    (
        'RM-DRY-003',
        'Brown Sugar',
        'c1110000-0000-0000-0000-000000000052',
        'raw_material',
        44000,
        1690,
        'gr',
        false
    ),
    (
        'RM-DRY-004',
        'Pearl Sugar',
        'c1110000-0000-0000-0000-000000000052',
        'raw_material',
        329690,
        600,
        'gr',
        false
    ),
    (
        'RM-DRY-005',
        'Yeast',
        'c1110000-0000-0000-0000-000000000052',
        'raw_material',
        95000,
        6108,
        'gr',
        false
    ),
    (
        'RM-DRY-006',
        'Dry Coconut',
        'c1110000-0000-0000-0000-000000000052',
        'raw_material',
        101622,
        1160,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Condiments
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-CON-001',
        'Salt',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        5666,
        20732,
        'gr',
        false
    ),
    (
        'RM-CON-002',
        'Pepper',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        331325,
        0,
        'gr',
        false
    ),
    (
        'RM-CON-003',
        'Oregano',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        722506,
        9,
        'gr',
        false
    ),
    (
        'RM-CON-004',
        'Nutmeg',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        430000,
        159,
        'gr',
        false
    ),
    (
        'RM-CON-005',
        'Mustard',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        148621,
        1975,
        'gr',
        false
    ),
    (
        'RM-CON-006',
        'Rosemary',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        279936,
        40,
        'gr',
        false
    ),
    (
        'RM-CON-007',
        'Garlic Powder',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        225,
        160,
        'gr',
        false
    ),
    (
        'RM-CON-008',
        'Onion Powder',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        294000,
        90,
        'gr',
        false
    ),
    (
        'RM-CON-009',
        'Curry Powder',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        0,
        60,
        'gr',
        false
    ),
    (
        'RM-CON-010',
        'Paprika Powder',
        'c1110000-0000-0000-0000-000000000054',
        'raw_material',
        371201,
        30,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Chocolate
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-CHO-001',
        'Chocolate Dark Couverture',
        'c1110000-0000-0000-0000-000000000056',
        'raw_material',
        274634,
        3999,
        'gr',
        false
    ),
    (
        'RM-CHO-002',
        'White Chocolate Couverture',
        'c1110000-0000-0000-0000-000000000056',
        'raw_material',
        311837,
        1900,
        'gr',
        false
    ),
    (
        'RM-CHO-003',
        'Chocolate Stick',
        'c1110000-0000-0000-0000-000000000056',
        'raw_material',
        264145,
        3680,
        'gr',
        false
    ),
    (
        'RM-CHO-004',
        'Cocoa Powder',
        'c1110000-0000-0000-0000-000000000056',
        'raw_material',
        156490,
        988,
        'gr',
        false
    ),
    (
        'RM-CHO-005',
        'Nutella',
        'c1110000-0000-0000-0000-000000000056',
        'raw_material',
        156166,
        6885,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Seeds & Nuts
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-SEE-001',
        'Almond Ground',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        175316,
        14684,
        'gr',
        false
    ),
    (
        'RM-SEE-002',
        'Almond Slice',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        166978,
        5440,
        'gr',
        false
    ),
    (
        'RM-SEE-003',
        'White Sesame Seed',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        49032,
        1505,
        'gr',
        false
    ),
    (
        'RM-SEE-004',
        'Black Sesame Seed',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        85438,
        2097,
        'gr',
        false
    ),
    (
        'RM-SEE-005',
        'Peanut',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        59461,
        1310,
        'gr',
        false
    ),
    (
        'RM-SEE-006',
        'Walnut',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        0,
        1170,
        'gr',
        false
    ),
    (
        'RM-SEE-007',
        'Pumpkin Seed',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        109303,
        1079,
        'gr',
        false
    ),
    (
        'RM-SEE-008',
        'Sunflower Seed',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        48985,
        192,
        'gr',
        false
    ),
    (
        'RM-SEE-009',
        'Pistacio Seed',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        510000,
        280,
        'gr',
        false
    ),
    (
        'RM-SEE-010',
        'Kismis/Raisins',
        'c1110000-0000-0000-0000-000000000057',
        'raw_material',
        48450,
        9570,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Vegetables
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-VEG-001',
        'ONION',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        28528,
        3124,
        'gr',
        false
    ),
    (
        'RM-VEG-002',
        'RED ONION',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        58000,
        245,
        'gr',
        false
    ),
    (
        'RM-VEG-003',
        'GARLIC',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        32000,
        859,
        'gr',
        false
    ),
    (
        'RM-VEG-004',
        'LETTUCE',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        29405,
        910,
        'gr',
        false
    ),
    (
        'RM-VEG-005',
        'TOMATO',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        19764,
        3934,
        'gr',
        false
    ),
    (
        'RM-VEG-006',
        'CUCUMBER',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        8425,
        1360,
        'gr',
        false
    ),
    (
        'RM-VEG-007',
        'CARROT',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        20025,
        480,
        'gr',
        false
    ),
    (
        'RM-VEG-008',
        'CAPSICUM',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        50000,
        378,
        'gr',
        false
    ),
    (
        'RM-VEG-009',
        'MUSHROOM',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        53000,
        571,
        'gr',
        false
    ),
    (
        'RM-VEG-010',
        'SPINACH',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        8688,
        320,
        'gr',
        false
    ),
    (
        'RM-VEG-011',
        'POTATO',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        20000,
        5000,
        'gr',
        false
    ),
    (
        'RM-VEG-012',
        'CORIANDER',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        100000,
        74,
        'gr',
        false
    ),
    (
        'RM-VEG-013',
        'PARSLEY',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        30000,
        17,
        'gr',
        false
    ),
    (
        'RM-VEG-014',
        'BASIL LEAF',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        45482,
        76,
        'gr',
        false
    ),
    (
        'RM-VEG-015',
        'GINGER',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        30006,
        230,
        'gr',
        false
    ),
    (
        'RM-VEG-016',
        'RADISH',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        18000,
        500,
        'gr',
        false
    ),
    (
        'RM-VEG-017',
        'ZUCCHINI',
        'c1110000-0000-0000-0000-000000000058',
        'raw_material',
        25828,
        670,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Fruits
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-FRU-001',
        'STRAWBERRY',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        27099,
        3780,
        'gr',
        false
    ),
    (
        'RM-FRU-002',
        'BANANA',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        6889,
        1000,
        'gr',
        false
    ),
    (
        'RM-FRU-003',
        'ORANGE',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        21496,
        11060,
        'gr',
        false
    ),
    (
        'RM-FRU-004',
        'LEMON',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        49997,
        1719,
        'gr',
        false
    ),
    (
        'RM-FRU-005',
        'LIME',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        18982,
        430,
        'gr',
        false
    ),
    (
        'RM-FRU-006',
        'MANGO',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        46666,
        790,
        'gr',
        false
    ),
    (
        'RM-FRU-007',
        'PINAPPLE',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        26836,
        1110,
        'gr',
        false
    ),
    (
        'RM-FRU-008',
        'WATER MELON',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        12500,
        9310,
        'gr',
        false
    ),
    (
        'RM-FRU-009',
        'Passion Fruit',
        'c1110000-0000-0000-0000-000000000059',
        'raw_material',
        59793,
        0,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Meat
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-MEA-001',
        'Chicken',
        'c1110000-0000-0000-0000-000000000060',
        'raw_material',
        43000,
        6638,
        'gr',
        false
    ),
    (
        'RM-MEA-002',
        'Smoked Beef',
        'c1110000-0000-0000-0000-000000000060',
        'raw_material',
        134619,
        5198,
        'gr',
        false
    ),
    (
        'RM-MEA-003',
        'Minced Beef',
        'c1110000-0000-0000-0000-000000000060',
        'raw_material',
        127500,
        4820,
        'gr',
        false
    ),
    (
        'RM-MEA-004',
        'Sausage Hotdog',
        'c1110000-0000-0000-0000-000000000060',
        'raw_material',
        85000,
        0,
        'gr',
        false
    ),
    (
        'RM-MEA-005',
        'Smoked Mahi',
        'c1110000-0000-0000-0000-000000000060',
        'raw_material',
        281000,
        1200,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- Semi-Finished Goods (SFG)
INSERT INTO products (
        sku,
        name,
        category_id,
        product_type,
        cost_price,
        current_stock,
        unit,
        pos_visible
    )
VALUES (
        'RM-SFG-001',
        'Croissant Dough',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        65517,
        43530,
        'gr',
        false
    ),
    (
        'RM-SFG-002',
        'Almond Cream',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        73163,
        1850,
        'gr',
        false
    ),
    (
        'RM-SFG-003',
        'Chantilly',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        91001,
        150,
        'gr',
        false
    ),
    (
        'RM-SFG-004',
        'Pastry Cream',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        12950,
        192,
        'gr',
        false
    ),
    (
        'RM-SFG-005',
        'Chocolat Ganache',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        145015,
        80,
        'gr',
        false
    ),
    (
        'RM-SFG-006',
        'Praline Cream',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        83357,
        40,
        'gr',
        false
    ),
    (
        'RM-SFG-007',
        'Lemon Cream',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        80327,
        0,
        'gr',
        false
    ),
    (
        'RM-SFG-008',
        'Meringue',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        49551,
        120,
        'gr',
        false
    ),
    (
        'RM-SFG-009',
        'Sugar Dough',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        28415,
        345,
        'gr',
        false
    ),
    (
        'RM-SFG-010',
        'Bechamel Sauce',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        31429,
        100,
        'gr',
        false
    ),
    (
        'RM-SFG-011',
        'Aioli Sauce',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        55304,
        565,
        'gr',
        false
    ),
    (
        'RM-SFG-012',
        'Caramelized Onion',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        60959,
        47,
        'gr',
        false
    ),
    (
        'RM-SFG-013',
        'Roasted Chicken',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        117316,
        1316,
        'gr',
        false
    ),
    (
        'RM-SFG-014',
        'Choux Dough',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        46149,
        0,
        'gr',
        false
    ),
    (
        'RM-SFG-015',
        'Strawberry Jam',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        24069,
        220,
        'gr',
        false
    ),
    (
        'RM-SFG-016',
        'Asian Pickles',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        26530,
        470,
        'gr',
        false
    ),
    (
        'RM-SFG-017',
        'Red Onion Jam',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        40658,
        20,
        'gr',
        false
    ),
    (
        'RM-SFG-018',
        'Cream Cheese Sauce',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        124509,
        45,
        'gr',
        false
    ),
    (
        'RM-SFG-019',
        'New York Roll Dough',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        75615,
        3565,
        'gr',
        false
    ),
    (
        'RM-SFG-020',
        'Hollandaise Sauce',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        114157,
        20,
        'gr',
        false
    ),
    (
        'RM-SFG-021',
        'Caramel Cream',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        93891,
        90,
        'gr',
        false
    ),
    (
        'RM-SFG-022',
        'Capsicum Marinated',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        92131,
        370,
        'gr',
        false
    ),
    (
        'RM-SFG-023',
        'Chicken Banh Mi Marinated',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        112570,
        210,
        'gr',
        false
    ),
    (
        'RM-SFG-024',
        'Chicken Curry',
        'c1110000-0000-0000-0000-000000000050',
        'semi_finished',
        102078,
        0,
        'gr',
        false
    ) ON CONFLICT (sku) DO
UPDATE
SET name = EXCLUDED.name,
    cost_price = EXCLUDED.cost_price,
    current_stock = EXCLUDED.current_stock;
-- =====================================================
-- RECIPES
-- =====================================================
-- Coffee Recipes
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
WHERE p.name = 'Cappuccino'
    AND m.sku = 'RM-COF-001' ON CONFLICT DO NOTHING;
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
WHERE p.name = 'Cappuccino'
    AND m.sku = 'RM-BEV-001' ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Americano
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Espresso
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Double Espresso
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Long Black
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Flat White
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-BEV-001' -- Flat White + Milk
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Latte
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-BEV-001' -- Latte + Milk
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-COF-001' -- Affogato
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-BEV-008' -- Affogato + Ice Cream
    ON CONFLICT DO NOTHING;
-- Specialty Lattes
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
WHERE p.sku = 'SL-001'
    AND m.sku = 'RM-COF-001' -- Caramel Latte
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    30,
    'ml',
    true
FROM products p,
    products m
WHERE p.sku = 'SL-001'
    AND m.sku = 'RM-BEV-005' -- Caramel Latte + Syrup
    ON CONFLICT DO NOTHING;
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
WHERE p.sku = 'SL-002'
    AND m.sku = 'RM-COF-001' -- Vanilla Latte
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    30,
    'ml',
    true
FROM products p,
    products m
WHERE p.sku = 'SL-002'
    AND m.sku = 'RM-BEV-006' -- Vanilla Latte + Syrup
    ON CONFLICT DO NOTHING;
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
WHERE p.sku = 'SL-003'
    AND m.sku = 'RM-COF-001' -- Hazelnut Latte
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    30,
    'ml',
    true
FROM products p,
    products m
WHERE p.sku = 'SL-003'
    AND m.sku = 'RM-BEV-007' -- Hazelnut Latte + Syrup
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    30,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'SL-004'
    AND m.sku = 'RM-BEV-004' -- Chocolate Latte
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    30,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'SL-005'
    AND m.sku = 'RM-BEV-003' -- Matcha Latte
    ON CONFLICT DO NOTHING;
-- Croissant Recipe
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
    AND m.sku = 'RM-SFG-001' -- Croissant + Croissant Dough
    ON CONFLICT DO NOTHING;
-- Chocolatine Recipe
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
    AND m.sku = 'RM-SFG-001' -- Chocolatine + Croissant Dough
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-CHO-003' -- Chocolatine + Chocolate Stick
    ON CONFLICT DO NOTHING;
-- Croissant Almond Recipe
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
    AND m.sku = 'RM-SFG-002' -- Croissant Almond + Almond Cream
    ON CONFLICT DO NOTHING;
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
    AND m.sku = 'RM-SEE-002' -- Croissant Almond + Almond Slice
    ON CONFLICT DO NOTHING;
-- Paris-Brest Recipe
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    75,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'IP-001'
    AND m.sku = 'RM-SFG-014' -- Paris-Brest + Choux Dough
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    60,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'IP-001'
    AND m.sku = 'RM-SFG-006' -- Paris-Brest + Praline Cream
    ON CONFLICT DO NOTHING;
-- Breakery Cloud Recipe
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
WHERE p.sku = 'IP-009'
    AND m.sku = 'RM-SFG-014' -- Breakery Cloud + Choux Dough
    ON CONFLICT DO NOTHING;
INSERT INTO recipes (
        product_id,
        material_id,
        quantity,
        unit,
        is_active
    )
SELECT p.id,
    m.id,
    20,
    'gr',
    true
FROM products p,
    products m
WHERE p.sku = 'IP-009'
    AND m.sku = 'RM-SFG-003' -- Breakery Cloud + Chantilly
    ON CONFLICT DO NOTHING;
-- =====================================================
-- VERIFY
-- =====================================================
-- Run after import to check:
-- SELECT p.name as product, m.name as material, r.quantity, r.unit 
-- FROM recipes r 
-- JOIN products p ON r.product_id = p.id 
-- JOIN products m ON r.material_id = m.id
-- ORDER BY p.name;
