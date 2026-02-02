-- Auto-generated migration from CSV Files/Recipe_Master_Data (2).csv

-- 1. Insert Missing Products
INSERT INTO products (sku, name, category_id, product_type, unit, cost_price, current_stock, pos_visible) VALUES
('PR-CAPUCCINO-91', 'Capuccino', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-MAYONNAISE-786', 'Mayonnaise', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-ALMONDBISC-814', 'Almond Biscuit', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-BAGUETTE28-541', 'Baguette 280gr', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-POOLISHSTA-521', 'Poolish Starter', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-SOURDOUGHS-906', 'Sourdough Starter Liquid', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-CHOCOLATSP-612', 'Chocolat Sponge Cake', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-BREAKERYSA-2', 'Breakery Sauce', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-ZUCCHINIPI-386', 'Zucchini Pickles', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-CARAMELGAR-699', 'Caramel Garnish', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-CHEESYBRIE-52', 'Cheesy Brie', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-CHOCOLATPI-111', 'Chocolat Pie Mix', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-CHOCOLATCL-602', 'Chocolat Cloud', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-CHOCOLATPE-514', 'Chocolat Peanut', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-CHOCOLATPI-327', 'Chocolat Pie', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-CHOCOLATIN-701', 'Chocolatine Prod', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-COCONUTBIS-266', 'Coconut Biscuit', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-COCONUTCRE-355', 'Coconut Cream', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-COFFEECREA-614', 'Coffee Cream', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-SOURDOUGHS-953', 'Sourdough Starter Hard', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-CROISSANTS-182', 'Croissant stock', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-DOUBLEEXPR-455', 'Double expresso', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-DRESSINGSA-426', 'Dressing Sauce', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-EXPRESSO-471', 'Expresso', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-CHEDDARORA-115', 'Cheddar Orange Slice', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-ONIONCRISP-549', 'Onion Crispy', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-DRYTOMATO-788', 'Dry Tomato', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-PESTOSAUCE-454', 'Pesto Sauce', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-LEMONCHEES-235', 'Lemon Cheesecake Mix', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-LEMONGLAZI-538', 'Lemon Glazing', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-LEMONCHEES-353', 'Lemon Cheesecake Small 16cm', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-MADELAINE-334', 'Madelaine', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-QUICHEMIX-744', 'Quiche Mix', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-QUICHEDOUG-82', 'Quiche Dough', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-MINICHOCOL-914', 'Mini Chocolatine Prod', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-MINICROISS-886', 'Mini Croissant Prod', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-MUSHROOMSA-16', 'Mushroom Sautee', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-NEWYORKROL-429', 'New york Roll Chocolat', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-NEWYORKROL-427', 'New york Roll pistaccio', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-PISTACCHIO-101', 'Pistacchio Cream', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-NUTELLACRE-488', 'Nutella Cream', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-SPONGECAKE-34', 'Sponge Cake', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-PASSIONFRU-647', 'Passion Fruit Cream', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-PASSIONFRU-944', 'Passion Fruit Filling', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-PIZZADOUGH-725', 'Pizza Dough', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-PIZZASAUCE-450', 'Pizza Sauce', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-TOMATOPEEL-655', 'Tomato Peeled', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-PRALINEPAS-380', 'Praline Paste', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-BALSAMICVI-7', 'Balsamic Vinegar', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-FLAXSEEDSB-603', 'Flax Seeds Brown', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-SMOKYFISH-753', 'Smoky Fish', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-SMOKEDMAHI-557', 'Smoked Mahi"', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-STRAWBERRY-998', 'Strawberry Cheesecake Mix', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('RM-STRAWBERRY-209', 'Strawberry Glazing', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'gr', 0, 100, false),
('PR-STRAWBERRY-193', 'Strawberry Cheesecake Small 16cm', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-STRAWBERRY-36', 'Strawberry Cheesecakes Big 24cm', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('PR-WHITEPOOLI-539', 'White Poolish Bread Medium', 'c1110000-0000-0000-0000-000000000052', 'finished', 'pcs', 0, 100, false),
('RM-OLIVEOIL-499', 'Olive Oil', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-BBQSAUCE-571', 'Bbq Sauce', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-VINEGAR-332', 'Vinegar', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-WATER-524', 'Water', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-SWEETSOYAS-825', 'Sweet Soya Sauce', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-FISHSAUCE-325', 'Fish Sauce', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-SOYASAUCE-445', 'Soya sauce', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-COCONUTMIL-579', 'Coconut Milk', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-SALADEOIL-741', 'Salade Oil', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-COOKINGCRE-332', 'Cooking Cream', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'ml', 0, 100, false),
('RM-PAPERBAGBA-772', 'Paper Bag Baguette', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CAKEBOX25X-60', 'Cake Box 25X25 Cm', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CAKECARDBO-285', 'Cake Cardboard 24 Cm', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CAKECARDBO-867', 'Cake Cardboard Round', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CUPBREAKER-879', 'Cup Breakery Cloud', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CAKEBOX16C-609', 'Cake Box 16 Cm', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CAKECARDBO-897', 'Cake Cardboard 16 Cm', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-CUPCRUFFIN-920', 'Cup Cruffin', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-PASTRYCARD-948', 'Pastry Cardboard Rectangle', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-BOXNEWYORK-758', 'Box New York Roll', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false),
('RM-TEABAG-160', 'Tea Bag', 'c1110000-0000-0000-0000-000000000052', 'raw_material', 'pcs', 0, 100, false)
ON CONFLICT (sku) DO NOTHING;

-- 2. Insert Recipes

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Affogato' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 170, 'gr', true
FROM products p, products m
WHERE p.name = 'Affogato' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 170, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 900, 'gr', true
FROM products p, products m
WHERE p.name = 'Aioli Sauce' AND m.name = 'Mayonnaise'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 900, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Aioli Sauce' AND m.name = 'Oregano'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Aioli Sauce' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 284, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Biscuit' AND m.name = 'Almond Ground'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 284, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 148, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Biscuit' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 148, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 284, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Biscuit' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 284, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 284, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Biscuit' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 284, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Cream' AND m.name = 'Almond Ground'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 250, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Cream' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 250, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 250, 'gr', true
FROM products p, products m
WHERE p.name = 'Almond Cream' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 250, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'American Bagel' AND m.name = 'Cheddar Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'American Bagel' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'American Bagel' AND m.name = 'Caramelized Onion'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'Minced Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'Caramelized Onion'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 35, 'gr', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'Aioli Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 35, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'Cheddar Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Americano' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Americano' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'RADISH'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'CARROT'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'gr', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'LIME'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 78, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 78, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 23, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Maizena Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 23, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 14, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 14, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 54, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 54, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'White Sesame Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Black Sesame Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette 280gr' AND m.name = 'FLOUR AMOURETTE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette 280gr' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette 280gr' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 203, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette Poolish 280gr' AND m.name = 'Poolish Starter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 203, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette Poolish 280gr' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 51, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette Poolish 280gr' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 51, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 86, 'gr', true
FROM products p, products m
WHERE p.name = 'Baguette Poolish 280gr' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 86, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Banh Mi Croissant' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 40, 'gr', true
FROM products p, products m
WHERE p.name = 'Banh Mi Croissant' AND m.name = 'Chicken Banh Mi Marinated'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 40, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Banh Mi Croissant' AND m.name = 'CORIANDER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Banh Mi Croissant' AND m.name = 'Asian Pickles'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Banh Mi Croissant' AND m.name = 'Aioli Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'gr', true
FROM products p, products m
WHERE p.name = 'Bechamel Sauce' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Bechamel Sauce' AND m.name = 'Nutmeg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Bechamel Sauce' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Bechamel Sauce' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'gr', true
FROM products p, products m
WHERE p.name = 'Bechamel Sauce' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Beef Cheese Croissant' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Beef Cheese Croissant' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.134, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest BIG 24cm' AND m.name = 'Chocolat Sponge Cake'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.134, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 585, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest BIG 24cm' AND m.name = 'Chantilly'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 585, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 135, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest BIG 24cm' AND m.name = 'Strawberry Jam'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 135, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 180, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest BIG 24cm' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 180, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 80, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest Small 18cm' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 80, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 504, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest Small 18cm' AND m.name = 'Chocolat Sponge Cake'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 504, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 250, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest Small 18cm' AND m.name = 'Chantilly'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 250, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest Small 18cm' AND m.name = 'Strawberry Jam'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 126, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest' AND m.name = 'Chocolat Sponge Cake'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 126, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest' AND m.name = 'Chantilly'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest' AND m.name = 'Strawberry Jam'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Black Forest' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Cloud' AND m.name = 'Chantilly'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Cloud' AND m.name = 'Choux Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Cloud' AND m.name = 'Pearl Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Garlic Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Onion Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 750, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Mayonnaise'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 750, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 195, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Zucchini Pickles'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 195, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Paprika Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 33.333, 'gr', true
FROM products p, products m
WHERE p.name = 'Brown Bread' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 33.333, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3.333, 'gr', true
FROM products p, products m
WHERE p.name = 'Brown Bread' AND m.name = 'Brown Bread Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3.333, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'gr', true
FROM products p, products m
WHERE p.name = 'Brown Bread' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 467, 'gr', true
FROM products p, products m
WHERE p.name = 'Brown Bread' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 467, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'Cheddar Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'Minced Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'Caramelized Onion'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 572, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 572, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 34, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 34, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 29, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 29, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 9, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 9, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'White Sesame Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.499, 'gr', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'CAPSICUM'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.499, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'Oregano'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 9, 'gr', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 9, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 58, 'gr', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 58, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 400, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Cream' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 400, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Cream' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Garnish' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.754, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramelized Onion' AND m.name = 'ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.754, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 47, 'gr', true
FROM products p, products m
WHERE p.name = 'Caramelized Onion' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 47, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 320, 'gr', true
FROM products p, products m
WHERE p.name = 'Chantilly' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 320, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Cheesy Brie' AND m.name = 'Camembert'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Cheesy Brie' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Cheesy Brie' AND m.name = 'Red Onion Jam'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Cheesy Brie' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 80, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'Roasted Chicken'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 80, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'Capsicum Marinated'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 35, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'Aioli Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 35, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'Caramelized Onion'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 80, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi' AND m.name = 'Chicken Banh Mi Marinated'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 80, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi' AND m.name = 'Asian Pickles'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi' AND m.name = 'CORIANDER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi' AND m.name = 'Aioli Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.4, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi Marinated' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi Marinated' AND m.name = 'GINGER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 650, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Curry' AND m.name = 'Roasted Chicken'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 650, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 16, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Curry' AND m.name = 'Curry Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 16, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 110, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Curry Panini' AND m.name = 'Chicken Curry'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 110, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Curry Panini' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chicken Curry Panini' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 166, 'gr', true
FROM products p, products m
WHERE p.name = 'Choco Pie 16cm' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 166, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Choco Pie 16cm' AND m.name = 'Chocolat Pie Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Choco Pie 16cm' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3.735, 'gr', true
FROM products p, products m
WHERE p.name = 'Choco Pie 24cm' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3.735, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 450, 'gr', true
FROM products p, products m
WHERE p.name = 'Choco Pie 24cm' AND m.name = 'Chocolat Pie Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 450, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 450, 'gr', true
FROM products p, products m
WHERE p.name = 'Choco Pie 24cm' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 450, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Cloud' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Cloud' AND m.name = 'Choux Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Cloud' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 222, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Ganache' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 222, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 111, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Ganache' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 111, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 400, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Peanut' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 400, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 600, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Peanut' AND m.name = 'Peanut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 600, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 415, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 415, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie' AND m.name = 'Chocolat Pie Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 185, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie Mix' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 185, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 74, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie Mix' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 74, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 24, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Sponge Cake' AND m.name = 'Cocoa Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 24, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 206, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Sponge Cake' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 206, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 206, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Sponge Cake' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 206, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 48, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolat Sponge Cake' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 48, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolatine Almond' AND m.name = 'Almond Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolatine Almond' AND m.name = 'Almond Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolatine Prod' AND m.name = 'Chocolate Stick'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 90, 'gr', true
FROM products p, products m
WHERE p.name = 'Chocolatine Prod' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 90, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 60, 'gr', true
FROM products p, products m
WHERE p.name = 'Choux Dough' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 60, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Choux Dough' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 140, 'gr', true
FROM products p, products m
WHERE p.name = 'Choux Dough' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 140, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Choux Dough' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 87, 'gr', true
FROM products p, products m
WHERE p.name = 'Ciabatta' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 87, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.636, 'gr', true
FROM products p, products m
WHERE p.name = 'Ciabatta' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.636, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 127, 'gr', true
FROM products p, products m
WHERE p.name = 'Ciabatta' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 127, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 231, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Biscuit' AND m.name = 'Almond Ground'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 231, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 154, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Biscuit' AND m.name = 'Dry Coconut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 154, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 77, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Biscuit' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 77, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 308, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Biscuit' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 308, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 231, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Biscuit' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 231, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 132, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Cream' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 132, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 46, 'gr', true
FROM products p, products m
WHERE p.name = 'Coconut Cream' AND m.name = 'Dry Coconut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 46, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 250, 'gr', true
FROM products p, products m
WHERE p.name = 'Coffee Bean Pack 250gr' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 250, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Coffee Bean Pack 500gr' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 49, 'gr', true
FROM products p, products m
WHERE p.name = 'Coffee Cream' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 49, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 304, 'gr', true
FROM products p, products m
WHERE p.name = 'Coffee Cream' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 304, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 138, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 138, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 33, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 33, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'Sourdough Starter Hard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 138, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'Pain De Campagne Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 138, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 92, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 92, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 14, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 14, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 92, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'Pain De Campagne Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 92, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 55, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'Sourdough Starter Hard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 55, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 55, 'gr', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 55, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 625, 'gr', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'Cream Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 625, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 143, 'gr', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'PARSLEY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 143, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'gr', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 143, 'gr', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 143, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 464, 'gr', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 464, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'gr', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Almond' AND m.name = 'Almond Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Almond' AND m.name = 'Almond Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 240, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'Butter Sheet Croissant'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 240, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 61, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 61, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 411, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 411, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 21, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'Milk Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 21, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Nutella' AND m.name = 'Cocoa Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Nutella' AND m.name = 'Nutella'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 90, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant Nutella' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 90, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 90, 'gr', true
FROM products p, products m
WHERE p.name = 'Croissant stock' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 90, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Croque-Monsieur' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Croque-Monsieur' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Croque-Monsieur' AND m.name = 'Bechamel Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 90, 'gr', true
FROM products p, products m
WHERE p.name = 'Cruffin' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 90, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Cruffin' AND m.name = 'Nutella'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 90, 'gr', true
FROM products p, products m
WHERE p.name = 'Danish Raisin' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 90, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 43, 'gr', true
FROM products p, products m
WHERE p.name = 'Danish Raisin' AND m.name = 'Pastry Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 43, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Danish Raisin' AND m.name = 'Kismis/Raisins'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Double expresso' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 19, 'gr', true
FROM products p, products m
WHERE p.name = 'Dressing Sauce' AND m.name = 'Mustard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 19, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Dressing Sauce' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Dressing Sauce' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 415, 'gr', true
FROM products p, products m
WHERE p.name = 'Dulce praline Tartelette' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 415, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Dulce praline Tartelette' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Dulce praline Tartelette' AND m.name = 'Praline Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 60, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'Hollandaise Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 60, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'CARROT'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'CUCUMBER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'RED ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'Dressing Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 9, 'gr', true
FROM products p, products m
WHERE p.name = 'Expresso' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 9, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 27.777, 'gr', true
FROM products p, products m
WHERE p.name = 'French Fries' AND m.name = 'POTATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 27.777, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'French Fries' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'French Fries' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Frenchy' AND m.name = 'Camembert'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Frenchy' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Frenchy' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Frenchy' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Frenchy' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'BANANA'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'LIME'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'MANGO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 450, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'ORANGE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 450, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'PINAPPLE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'STRAWBERRY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Fresh Juice' AND m.name = 'WATER MELON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Hollandaise Sauce' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 400, 'gr', true
FROM products p, products m
WHERE p.name = 'Hollandaise Sauce' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 400, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 440, 'gr', true
FROM products p, products m
WHERE p.name = 'Hollandaise Sauce' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 440, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Hollandaise Sauce' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 572, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 572, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 34, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 34, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 29, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 29, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 9, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 9, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 59, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog sandwich' AND m.name = 'Sausage Hotdog'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 59, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog sandwich' AND m.name = 'Cheddar Orange Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog sandwich' AND m.name = 'Breakery Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Hot Dog sandwich' AND m.name = 'Onion Crispy'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 80, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Roasted Chicken'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 80, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Dry Tomato'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Pesto Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Sunflower Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Parmesan'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'BASIL LEAF'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 55, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake' AND m.name = 'Almond Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 55, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 7.083, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake' AND m.name = 'Lemon Cheesecake Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 7.083, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3.366, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake' AND m.name = 'Lemon Glazing'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3.366, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 495, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake 24cm' AND m.name = 'Almond Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 495, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 63.747, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake 24cm' AND m.name = 'Lemon Cheesecake Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 63.747, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 303, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake 24cm' AND m.name = 'Lemon Glazing'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 303, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 353, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Mix' AND m.name = 'Cream Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 353, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 379, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Mix' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 379, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 118, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Mix' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 118, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 220, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Small 16cm' AND m.name = 'Almond Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 220, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 284, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Small 16cm' AND m.name = 'Lemon Cheesecake Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 284, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 136, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Small 16cm' AND m.name = 'Lemon Glazing'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 136, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5.345, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cream' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5.345, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 190, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cream' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 190, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 38, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cream' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 38, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 238, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Cream' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 238, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 321, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Glazing' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 321, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 99, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Glazing' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 99, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 415, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 415, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 65, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie' AND m.name = 'Lemon Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 65, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie' AND m.name = 'Meringue'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 166, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 16cm' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 166, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 260, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 16cm' AND m.name = 'Lemon Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 260, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 120, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 16cm' AND m.name = 'Meringue'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 120, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3.735, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 24cm' AND m.name = 'Sugar Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3.735, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 585, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 24cm' AND m.name = 'Lemon Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 585, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 270, 'gr', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 24cm' AND m.name = 'Meringue'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 270, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Long Black' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Long Black' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 53, 'gr', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 53, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'Almond Ground'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 126, 'gr', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 126, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Matcha Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Matcha Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Matcha Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Matcha Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Matcha Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Matcha Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 16, 'gr', true
FROM products p, products m
WHERE p.name = 'Mayonnaise' AND m.name = 'Mustard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 16, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Mayonnaise' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 60, 'gr', true
FROM products p, products m
WHERE p.name = 'Meat Quiche' AND m.name = 'Quiche Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 60, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 555, 'gr', true
FROM products p, products m
WHERE p.name = 'Meat Quiche' AND m.name = 'Quiche Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 555, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Meat Quiche' AND m.name = 'Caramelized Onion'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Meat Quiche' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 125, 'gr', true
FROM products p, products m
WHERE p.name = 'Meat Quiche' AND m.name = 'Smoked Beef'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 125, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Meringue' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Meringue' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'BANANA'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 35, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Cacao Powder Cafe'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 35, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'LIME'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'MANGO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 425, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'ORANGE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 425, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'PINAPPLE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'STRAWBERRY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 227, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'Ice Cream Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 227, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Milk shake' AND m.name = 'WATER MELON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Almond Croissant' AND m.name = 'Almond Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Almond Croissant' AND m.name = 'Almond Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 33.334, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 33.334, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 7, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 7, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 17, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 17, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'White Sesame Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini choco almond' AND m.name = 'Almond Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini choco almond' AND m.name = 'Almond Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Chocolatine Prod' AND m.name = 'Chocolate Stick'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 45, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Chocolatine Prod' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 45, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 45, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Croissant Prod' AND m.name = 'Croissant Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 45, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 325, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 325, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 7, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 7, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 13, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 13, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.724, 'gr', true
FROM products p, products m
WHERE p.name = 'Mushroom Sautee' AND m.name = 'MUSHROOM'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.724, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Mushroom Sautee' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Mushroom Sautee' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 86, 'gr', true
FROM products p, products m
WHERE p.name = 'Mushroom Sautee' AND m.name = 'PARSLEY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 86, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 17, 'gr', true
FROM products p, products m
WHERE p.name = 'Mushroom Sautee' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 17, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll Caramel' AND m.name = 'Caramel Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 925, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll Caramel' AND m.name = 'New York Roll Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 925, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 925, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll Chocolat' AND m.name = 'New York Roll Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 925, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll Chocolat' AND m.name = 'Nutella'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 541, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 541, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 270, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'Butter Sheet Croissant'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 270, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 54, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 54, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 59, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 59, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll pistaccio' AND m.name = 'Pistacchio Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 925, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll pistaccio' AND m.name = 'New York Roll Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 925, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 925, 'gr', true
FROM products p, products m
WHERE p.name = 'New York Roll Plain' AND m.name = 'New York Roll Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 925, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll Strawberry' AND m.name = 'Strawberry Jam'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 925, 'gr', true
FROM products p, products m
WHERE p.name = 'New york Roll Strawberry' AND m.name = 'New York Roll Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 925, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 667, 'gr', true
FROM products p, products m
WHERE p.name = 'Nutella Cream' AND m.name = 'Nutella'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 667, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 333, 'gr', true
FROM products p, products m
WHERE p.name = 'Nutella Cream' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 333, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'Mushroom Sautee'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'Parmesan'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'SPINACH'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'Cooking Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2.5, 'gr', true
FROM products p, products m
WHERE p.name = 'Onion Crispy' AND m.name = 'ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2.5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2.5, 'gr', true
FROM products p, products m
WHERE p.name = 'Onion Crispy' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2.5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2.5, 'ml', true
FROM products p, products m
WHERE p.name = 'Onion Crispy' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2.5, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Onion Crispy' AND m.name = 'Paprika Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Onion Crispy' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2.916, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2.916, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2.916, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera' AND m.name = 'Coffee Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2.916, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2.083, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera' AND m.name = 'Chocolat Peanut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2.083, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera' AND m.name = 'Sponge Cake'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 600, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Sponge Cake'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 600, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 350, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 350, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 350, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Coffee Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 350, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 250, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Chocolat Peanut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 250, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 300, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Sponge Cake'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 300, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 225, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Chocolat Ganache'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 225, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 125, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Chocolat Peanut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 125, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 165, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Coffee Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 165, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Chocolate Dark Couverture'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Panini 3 cheese' AND m.name = 'Cheddar Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Panini 3 cheese' AND m.name = 'Goat Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Panini 3 cheese' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 75, 'gr', true
FROM products p, products m
WHERE p.name = 'Paris-Brest' AND m.name = 'Choux Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 75, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Paris-Brest' AND m.name = 'Almond Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 60, 'gr', true
FROM products p, products m
WHERE p.name = 'Paris-Brest' AND m.name = 'Praline Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 60, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 138, 'gr', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Cream' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 138, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 172, 'gr', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Cream' AND m.name = 'Passion Fruit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 172, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 385, 'gr', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Filling' AND m.name = 'Passion Fruit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 385, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 192, 'gr', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Filling' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 192, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 38, 'gr', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Filling' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 38, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 63, 'gr', true
FROM products p, products m
WHERE p.name = 'Pastry Cream' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 63, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 125, 'gr', true
FROM products p, products m
WHERE p.name = 'Pastry Cream' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 125, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Piccolo' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 250, 'gr', true
FROM products p, products m
WHERE p.name = 'Pistacchio Cream' AND m.name = 'Pistacio Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 250, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Pistacchio Cream' AND m.name = 'Pastry Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 163, 'gr', true
FROM products p, products m
WHERE p.name = 'Pistacchio Cream' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 163, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Dough' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 581, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Dough' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 581, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Dough' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 906, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Sauce' AND m.name = 'Tomato Peeled'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 906, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Sauce' AND m.name = 'BASIL LEAF'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Sauce' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 72, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Sauce' AND m.name = 'ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 72, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 75, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Slice' AND m.name = 'Pizza Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 75, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 29, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Slice' AND m.name = 'Pizza Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 29, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Slice' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 13, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Slice' AND m.name = 'ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 13, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Slice' AND m.name = 'Oregano'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Pizza Slice' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Poolish Starter' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Poolish Starter' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 167, 'gr', true
FROM products p, products m
WHERE p.name = 'Praline Cream' AND m.name = 'Praline Paste'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 167, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 833, 'gr', true
FROM products p, products m
WHERE p.name = 'Praline Cream' AND m.name = 'Chantilly'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 833, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 188, 'gr', true
FROM products p, products m
WHERE p.name = 'Praline Paste' AND m.name = 'Almond Slice'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 188, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 125, 'gr', true
FROM products p, products m
WHERE p.name = 'Praline Paste' AND m.name = 'Walnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 125, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 188, 'gr', true
FROM products p, products m
WHERE p.name = 'Praline Paste' AND m.name = 'Peanut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 188, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Praline Paste' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Quiche Dough' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 300, 'gr', true
FROM products p, products m
WHERE p.name = 'Quiche Dough' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 300, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Quiche Dough' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Quiche Mix' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Quiche Mix' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 538, 'gr', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'RED ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 538, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 81, 'gr', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'Brown Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 81, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 108, 'ml', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'Balsamic Vinegar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 108, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1.4, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'Chicken'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1.4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'Oregano'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'Pepper'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'Rosemary'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'GARLIC'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 75, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'LEMON'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 75, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 133, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 133, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Pumpkin Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Sunflower Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 11, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Flax Seeds Brown'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 11, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 33, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 33, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 133, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Crusty Rye Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 133, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 80, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Sourdough Starter Hard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 80, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 80, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 80, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 88, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 88, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Pumpkin Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Sunflower Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 7, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Flax Seeds Brown'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 7, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 14, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 14, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 88, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Crusty Rye Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 88, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 53, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Sourdough Starter Hard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 53, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 53, 'gr', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 53, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'CUCUMBER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'RED ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'CARROT'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'Parmesan'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'Capsicum Marinated'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'Sunflower Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'Pumpkin Seed'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'Dressing Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Small baguette' AND m.name = 'FLOUR AMOURETTE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'gr', true
FROM products p, products m
WHERE p.name = 'Small baguette' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'gr', true
FROM products p, products m
WHERE p.name = 'Small baguette' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 101, 'gr', true
FROM products p, products m
WHERE p.name = 'Small Baguette Poolish' AND m.name = 'Poolish Starter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 101, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Small Baguette Poolish' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Small Baguette Poolish' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 43, 'gr', true
FROM products p, products m
WHERE p.name = 'Small Baguette Poolish' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 43, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Smoky Fish' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Smoky Fish' AND m.name = 'RED ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'gr', true
FROM products p, products m
WHERE p.name = 'Smoky Fish' AND m.name = 'Smoked Mahi"'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 35, 'gr', true
FROM products p, products m
WHERE p.name = 'Smoky Fish' AND m.name = 'Cream Cheese Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 35, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 667, 'gr', true
FROM products p, products m
WHERE p.name = 'Sourdough Starter Hard' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 667, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'gr', true
FROM products p, products m
WHERE p.name = 'Sourdough Starter Hard' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'gr', true
FROM products p, products m
WHERE p.name = 'Sourdough Starter Liquid' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 167, 'gr', true
FROM products p, products m
WHERE p.name = 'Sponge Cake' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 167, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 333, 'gr', true
FROM products p, products m
WHERE p.name = 'Sponge Cake' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 333, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 708, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake' AND m.name = 'Strawberry Cheesecake Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 708, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5.371, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake' AND m.name = 'Strawberry Glazing'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5.371, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 55, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake' AND m.name = 'Almond Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 55, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 357, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Mix' AND m.name = 'Cream Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 357, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 179, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Mix' AND m.name = 'STRAWBERRY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 179, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 119, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Mix' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 119, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 220, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Small 16cm' AND m.name = 'Almond Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 220, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 283, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Small 16cm' AND m.name = 'Strawberry Cheesecake Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 283, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 21.483, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Small 16cm' AND m.name = 'Strawberry Glazing'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 21.483, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 495, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecakes Big 24cm' AND m.name = 'Almond Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 495, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 637, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecakes Big 24cm' AND m.name = 'Strawberry Cheesecake Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 637, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 4.835, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecakes Big 24cm' AND m.name = 'Strawberry Glazing'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 4.835, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 465, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Glazing' AND m.name = 'STRAWBERRY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 465, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 62, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Glazing' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 62, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 667, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Jam' AND m.name = 'STRAWBERRY'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 667, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 333, 'gr', true
FROM products p, products m
WHERE p.name = 'Strawberry Jam' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 333, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 482, 'gr', true
FROM products p, products m
WHERE p.name = 'Sugar Dough' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 482, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 241, 'gr', true
FROM products p, products m
WHERE p.name = 'Sugar Dough' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 241, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 157, 'gr', true
FROM products p, products m
WHERE p.name = 'Sugar Dough' AND m.name = 'Ice Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 157, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 650, 'gr', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 650, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 39, 'gr', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'Mix Butter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 39, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 13, 'gr', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 13, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 26, 'gr', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'White Sugar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 26, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 32, 'gr', true
FROM products p, products m
WHERE p.name = 'Tropical Fruit Cake' AND m.name = 'Coconut Biscuit'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 32, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 38, 'gr', true
FROM products p, products m
WHERE p.name = 'Tropical Fruit Cake' AND m.name = 'Coconut Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 38, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 17, 'gr', true
FROM products p, products m
WHERE p.name = 'Tropical Fruit Cake' AND m.name = 'Passion Fruit Filling'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 17, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 36, 'gr', true
FROM products p, products m
WHERE p.name = 'Tropical Fruit Cake' AND m.name = 'Passion Fruit Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 36, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 18, 'gr', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Coffee bean'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 18, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'CUCUMBER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'Capsicum Marinated'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'Aioli Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'RED ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'CUCUMBER'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'LETTUCE'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'Parmesan'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'Capsicum Marinated'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 35, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'Aioli Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 35, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'TOMATO'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'RED ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 555, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Quiche' AND m.name = 'Quiche Dough'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 555, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 60, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Quiche' AND m.name = 'Quiche Mix'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 60, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Quiche' AND m.name = 'Caramelized Onion'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 15, 'gr', true
FROM products p, products m
WHERE p.name = 'Vegetarian Quiche' AND m.name = 'Mozarella Cheese'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 15, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 354, 'gr', true
FROM products p, products m
WHERE p.name = 'White Poolish Bread Medium' AND m.name = 'Poolish Starter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 354, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 150, 'gr', true
FROM products p, products m
WHERE p.name = 'White Poolish Bread Medium' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 150, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 88, 'gr', true
FROM products p, products m
WHERE p.name = 'White Poolish Bread Medium' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 88, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 7, 'gr', true
FROM products p, products m
WHERE p.name = 'White Poolish Bread Medium' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 7, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 33, 'gr', true
FROM products p, products m
WHERE p.name = 'White Poolish Bread Medium' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 33, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 236, 'gr', true
FROM products p, products m
WHERE p.name = 'White poolish small' AND m.name = 'Poolish Starter'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 236, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'gr', true
FROM products p, products m
WHERE p.name = 'White poolish small' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 59, 'gr', true
FROM products p, products m
WHERE p.name = 'White poolish small' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 59, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'White poolish small' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 14, 'gr', true
FROM products p, products m
WHERE p.name = 'White poolish small' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 14, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 275, 'gr', true
FROM products p, products m
WHERE p.name = 'White sourdough medium' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 275, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'gr', true
FROM products p, products m
WHERE p.name = 'White sourdough medium' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'gr', true
FROM products p, products m
WHERE p.name = 'White sourdough medium' AND m.name = 'Sourdough Starter Hard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'gr', true
FROM products p, products m
WHERE p.name = 'White sourdough medium' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 33, 'gr', true
FROM products p, products m
WHERE p.name = 'White sourdough medium' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 33, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 183, 'gr', true
FROM products p, products m
WHERE p.name = 'White Sourdough Small' AND m.name = 'White Flour'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 183, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'gr', true
FROM products p, products m
WHERE p.name = 'White Sourdough Small' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 55, 'gr', true
FROM products p, products m
WHERE p.name = 'White Sourdough Small' AND m.name = 'Sourdough Starter Hard'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 55, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 55, 'gr', true
FROM products p, products m
WHERE p.name = 'White Sourdough Small' AND m.name = 'Sourdough Starter Liquid'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 55, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 14, 'gr', true
FROM products p, products m
WHERE p.name = 'White Sourdough Small' AND m.name = 'Yeast'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 14, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 405, 'gr', true
FROM products p, products m
WHERE p.name = 'Zucchini Pickles' AND m.name = 'ONION'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 405, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 476, 'gr', true
FROM products p, products m
WHERE p.name = 'Zucchini Pickles' AND m.name = 'ZUCCHINI'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 476, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'gr', true
FROM products p, products m
WHERE p.name = 'Zucchini Pickles' AND m.name = 'Curry Powder'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 83, 'ml', true
FROM products p, products m
WHERE p.name = 'Aioli Sauce' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 83, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 35, 'ml', true
FROM products p, products m
WHERE p.name = 'American Bagel' AND m.name = 'Bbq Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 35, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'ml', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'Vinegar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'ml', true
FROM products p, products m
WHERE p.name = 'Asian Pickles' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 12, 'ml', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 12, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'ml', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 404, 'ml', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 404, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 124, 'ml', true
FROM products p, products m
WHERE p.name = 'Baguette 280gr' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 124, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 833, 'ml', true
FROM products p, products m
WHERE p.name = 'Bechamel Sauce' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 833, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 75, 'ml', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Bbq Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 75, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'ml', true
FROM products p, products m
WHERE p.name = 'Breakery Sauce' AND m.name = 'Vinegar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 21.667, 'ml', true
FROM products p, products m
WHERE p.name = 'Brown Bread' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 21.667, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'Bbq Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 172, 'ml', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 172, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 172, 'ml', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 172, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 129, 'ml', true
FROM products p, products m
WHERE p.name = 'Capsicum Marinated' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 129, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 400, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Cream' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 400, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Syrup Caramel'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Syrup Caramel'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Syrup Caramel'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Syrup Caramel'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Syrup Caramel'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramel Latte' AND m.name = 'Syrup Caramel'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 19, 'ml', true
FROM products p, products m
WHERE p.name = 'Caramelized Onion' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 19, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 680, 'ml', true
FROM products p, products m
WHERE p.name = 'Chantilly' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 680, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'ml', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi Marinated' AND m.name = 'Sweet Soya Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'ml', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi Marinated' AND m.name = 'Fish Sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'ml', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi Marinated' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'ml', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi Marinated' AND m.name = 'Soya sauce'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 325, 'ml', true
FROM products p, products m
WHERE p.name = 'Chicken Curry' AND m.name = 'Coconut Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 325, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'ml', true
FROM products p, products m
WHERE p.name = 'Chicken Curry' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 667, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolat Ganache' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 667, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 278, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie Mix' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 278, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 278, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie Mix' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 278, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Chocolate latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 340, 'ml', true
FROM products p, products m
WHERE p.name = 'Choux Dough' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 340, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 435, 'ml', true
FROM products p, products m
WHERE p.name = 'Ciabatta' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 435, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 57, 'ml', true
FROM products p, products m
WHERE p.name = 'Ciabatta' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 57, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 658, 'ml', true
FROM products p, products m
WHERE p.name = 'Coconut Cream' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 658, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 164, 'ml', true
FROM products p, products m
WHERE p.name = 'Coconut Cream' AND m.name = 'Coconut Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 164, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 647, 'ml', true
FROM products p, products m
WHERE p.name = 'Coffee Cream' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 647, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 151, 'ml', true
FROM products p, products m
WHERE p.name = 'Countryside sourdough medium' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 151, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 101, 'ml', true
FROM products p, products m
WHERE p.name = 'Countryside Sourdough Small' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 101, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 429, 'ml', true
FROM products p, products m
WHERE p.name = 'Cream Cheese Sauce' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 429, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 226, 'ml', true
FROM products p, products m
WHERE p.name = 'Croissant Dough' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 226, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 201, 'ml', true
FROM products p, products m
WHERE p.name = 'Dressing Sauce' AND m.name = 'Balsamic Vinegar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 201, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 795, 'ml', true
FROM products p, products m
WHERE p.name = 'Dressing Sauce' AND m.name = 'Salade Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 795, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Flat white' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Syrup Hazelnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Syrup Hazelnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Syrup Hazelnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Syrup Hazelnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Syrup Hazelnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Syrup Hazelnut'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Hazelnut Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 38, 'ml', true
FROM products p, products m
WHERE p.name = 'Hollandaise Sauce' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 38, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 172, 'ml', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 172, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 172, 'ml', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 172, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 300, 'ml', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake 24cm' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 300, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 353, 'ml', true
FROM products p, products m
WHERE p.name = 'Lemon Cheesecake Mix' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 353, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 743, 'ml', true
FROM products p, products m
WHERE p.name = 'Lemon Glazing' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 743, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Matcha Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 817, 'ml', true
FROM products p, products m
WHERE p.name = 'Mayonnaise' AND m.name = 'Salade Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 817, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'ml', true
FROM products p, products m
WHERE p.name = 'Mayonnaise' AND m.name = 'Vinegar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'ml', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 133, 'ml', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 133, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 111, 'ml', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 111, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 81, 'ml', true
FROM products p, products m
WHERE p.name = 'Mini Toast Bread' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 81, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Moka latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 17, 'ml', true
FROM products p, products m
WHERE p.name = 'Mushroom Sautee' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 17, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 54, 'ml', true
FROM products p, products m
WHERE p.name = 'New York Roll Dough' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 54, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 50, 'ml', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 50, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'ml', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 25, 'ml', true
FROM products p, products m
WHERE p.name = 'Panini 3 cheese' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 25, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 690, 'ml', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Cream' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 690, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 385, 'ml', true
FROM products p, products m
WHERE p.name = 'Passion Fruit Filling' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 385, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 625, 'ml', true
FROM products p, products m
WHERE p.name = 'Pastry Cream' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 625, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 88, 'ml', true
FROM products p, products m
WHERE p.name = 'Pistacchio Cream' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 88, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 377, 'ml', true
FROM products p, products m
WHERE p.name = 'Pizza Dough' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 377, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 23, 'ml', true
FROM products p, products m
WHERE p.name = 'Pizza Dough' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 23, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'ml', true
FROM products p, products m
WHERE p.name = 'Poolish Starter' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 100, 'ml', true
FROM products p, products m
WHERE p.name = 'Quiche Dough' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 100, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 312, 'ml', true
FROM products p, products m
WHERE p.name = 'Quiche Mix' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 312, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 312, 'ml', true
FROM products p, products m
WHERE p.name = 'Quiche Mix' AND m.name = 'Cooking Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 312, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 54, 'ml', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 54, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 215, 'ml', true
FROM products p, products m
WHERE p.name = 'Red Onion Jam' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 215, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Roasted Chicken' AND m.name = 'Olive Oil'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 146, 'ml', true
FROM products p, products m
WHERE p.name = 'Rye sourdough medium' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 146, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 97, 'ml', true
FROM products p, products m
WHERE p.name = 'Rye Sourdough Small' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 97, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 62, 'ml', true
FROM products p, products m
WHERE p.name = 'Small baguette' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 62, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 300, 'ml', true
FROM products p, products m
WHERE p.name = 'Sourdough Starter Hard' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 300, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 500, 'ml', true
FROM products p, products m
WHERE p.name = 'Sourdough Starter Liquid' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 500, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 357, 'ml', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Mix' AND m.name = 'Whipping Cream'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 357, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 465, 'ml', true
FROM products p, products m
WHERE p.name = 'Strawberry Glazing' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 465, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 223, 'ml', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'Milk (Uht)'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 223, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 163, 'ml', true
FROM products p, products m
WHERE p.name = 'Toast Bread' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 163, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Syrup Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Syrup Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Syrup Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Syrup Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Syrup Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 30, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Syrup Vanilla'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 30, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Vanilla Latte' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 151, 'ml', true
FROM products p, products m
WHERE p.name = 'White sourdough medium' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 151, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 101, 'ml', true
FROM products p, products m
WHERE p.name = 'White Sourdough Small' AND m.name = 'Water'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 101, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 119, 'ml', true
FROM products p, products m
WHERE p.name = 'Zucchini Pickles' AND m.name = 'Vinegar'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 119, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Fresh Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 200, 'ml', true
FROM products p, products m
WHERE p.name = 'Capuccino' AND m.name = 'Oat Milk'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 200, unit = 'ml';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 5, 'pcs', true
FROM products p, products m
WHERE p.name = 'Almond Cream' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 5, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'American Bagel' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'American Bagel' AND m.name = 'Bagels'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'French Fries'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'American Sandwich' AND m.name = 'Small Baguette Poolish'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 334, 'pcs', true
FROM products p, products m
WHERE p.name = 'Bagels' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 334, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Baguette Poolish 280gr' AND m.name = 'Paper Bag Baguette'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Banh Mi Croissant' AND m.name = 'Croissant stock'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Beef Cheese Croissant' AND m.name = 'Croissant stock'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Black Forest BIG 24cm' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Black Forest BIG 24cm' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Black Forest Small 18cm' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Black Forest Small 18cm' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Black Forest' AND m.name = 'Cake Cardboard Round'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Breakery Cloud' AND m.name = 'Cup Breakery Cloud'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'Burger Buns'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Burger' AND m.name = 'French Fries'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Burger Buns' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Cheesy Brie' AND m.name = 'Bagels'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chicken Baguette Sandwich' AND m.name = 'Small Baguette Poolish'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chicken Banh Mi' AND m.name = 'Small Baguette Poolish'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chicken Curry Panini' AND m.name = 'Ciabatta'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Choco Pie 16cm' AND m.name = 'Cake Box 16 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Choco Pie 16cm' AND m.name = 'Cake Cardboard 16 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Choco Pie 24cm' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Choco Pie 24cm' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chocolat Cloud' AND m.name = 'Cup Breakery Cloud'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie' AND m.name = 'Cake Cardboard Round'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 37, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chocolat Pie Mix' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 37, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chocolat Sponge Cake' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'pcs', true
FROM products p, products m
WHERE p.name = 'Choux Dough' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Croffel' AND m.name = 'Croissant stock'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Croissant' AND m.name = 'Croissant stock'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Croissant Almond' AND m.name = 'Croissant stock'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 66, 'pcs', true
FROM products p, products m
WHERE p.name = 'Croque-Monsieur' AND m.name = 'Toast Bread'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 66, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Cruffin' AND m.name = 'Cup Cruffin'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Dulce praline Tartelette' AND m.name = 'Pastry Cardboard Rectangle'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'pcs', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 13, 'pcs', true
FROM products p, products m
WHERE p.name = 'Egg Benedict' AND m.name = 'White Poolish Bread Medium'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 13, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Frenchy' AND m.name = 'Small Baguette Poolish'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 8, 'pcs', true
FROM products p, products m
WHERE p.name = 'Hollandaise Sauce' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 8, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Hot Dog buns' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Hot Dog sandwich' AND m.name = 'Hot Dog buns'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Italian Panini' AND m.name = 'Ciabatta'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake' AND m.name = 'Cake Cardboard Round'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake 24cm' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 6, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon Cream' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 6, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie' AND m.name = 'Cake Cardboard Round'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 16cm' AND m.name = 'Cake Cardboard 16 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 16cm' AND m.name = 'Cake Box 16 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 24cm' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon Meringue Pie 24cm' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 134, 'pcs', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 134, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 326, 'pcs', true
FROM products p, products m
WHERE p.name = 'Mayonnaise' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 326, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 20, 'pcs', true
FROM products p, products m
WHERE p.name = 'Meringue' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 20, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 67, 'pcs', true
FROM products p, products m
WHERE p.name = 'Mini burger buns' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 67, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Mini choco almond' AND m.name = 'Mini Chocolatine Prod'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Mini Chocolatine' AND m.name = 'Mini Chocolatine Prod'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Mini Croissant' AND m.name = 'Mini Croissant Prod'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'New york Roll Caramel' AND m.name = 'Box New York Roll'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'New york Roll Chocolat' AND m.name = 'Box New York Roll'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'New york Roll pistaccio' AND m.name = 'Box New York Roll'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'New york Roll Strawberry' AND m.name = 'Box New York Roll'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'pcs', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'pcs', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'French Fries'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 13, 'pcs', true
FROM products p, products m
WHERE p.name = 'Omelette' AND m.name = 'White Poolish Bread Medium'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 13, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Opera' AND m.name = 'Pastry Cardboard Rectangle'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Opera Cake Big' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Opera Cake Small' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Panini 3 cheese' AND m.name = 'Ciabatta'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Paris-Brest' AND m.name = 'Pastry Cardboard Rectangle'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 236, 'pcs', true
FROM products p, products m
WHERE p.name = 'Pastry Cream' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 236, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 2, 'pcs', true
FROM products p, products m
WHERE p.name = 'Quiche Dough' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 2, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 748, 'pcs', true
FROM products p, products m
WHERE p.name = 'Quiche Mix' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 748, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Salade Special' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Smoky Fish' AND m.name = 'Bagels'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 10, 'pcs', true
FROM products p, products m
WHERE p.name = 'Sponge Cake' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 10, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake' AND m.name = 'Cake Cardboard Round'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Small 16cm' AND m.name = 'Cake Box 16 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecake Small 16cm' AND m.name = 'Cake Cardboard 16 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecakes Big 24cm' AND m.name = 'Cake Box 25X25 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Strawberry Cheesecakes Big 24cm' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 24, 'pcs', true
FROM products p, products m
WHERE p.name = 'Sugar Dough' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 24, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tea' AND m.name = 'Tea Bag'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Tropical Fruit Cake' AND m.name = 'Cake Cardboard Round'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'Bagels'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Vegetarian Baguette Sandwich' AND m.name = 'Small Baguette Poolish'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chocolatine' AND m.name = 'Chocolatine Prod'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Chocolatine Almond' AND m.name = 'Chocolatine Prod'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Lemon cheesecake 24cm' AND m.name = 'Cake Cardboard 24 Cm'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 3, 'gr', true
FROM products p, products m
WHERE p.name = 'Madelaine' AND m.name = 'Salt'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 3, unit = 'gr';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Mini Almond Croissant' AND m.name = 'Mini Croissant Prod'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';

INSERT INTO recipes (product_id, material_id, quantity, unit, is_active)
SELECT p.id, m.id, 1, 'pcs', true
FROM products p, products m
WHERE p.name = 'Vegetarian Bagel' AND m.name = 'Egg'
ON CONFLICT (product_id, material_id) DO UPDATE SET quantity = 1, unit = 'pcs';
