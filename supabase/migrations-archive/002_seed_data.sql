-- =====================================================
-- THE BREAKERY POS - PRODUCTION SEED DATA
-- Generated from CSV product data
-- =====================================================

-- =====================================================
-- CATEGORIES (from CSV unique categories)
-- =====================================================
DELETE FROM categories;

INSERT INTO categories (id, name, icon, color, dispatch_station, is_raw_material, sort_order, is_active) VALUES
    -- POS Visible Categories
    ('c1110000-0000-0000-0000-000000000001', 'Coffee', '☕', '#6F4E37', 'barista', false, 1, true),
    ('c1110000-0000-0000-0000-000000000002', 'Speciale Latte', '🥛', '#D4A574', 'barista', false, 2, true),
    ('c1110000-0000-0000-0000-000000000003', 'Other drinks', '🥤', '#4A90A4', 'barista', false, 3, true),
    ('c1110000-0000-0000-0000-000000000004', 'Special Drinks', '✨', '#9B59B6', 'barista', false, 4, true),
    ('c1110000-0000-0000-0000-000000000005', 'Classic Viennoiserie', '🥐', '#E8B4B8', 'display', false, 5, true),
    ('c1110000-0000-0000-0000-000000000006', 'Others Viennoiserie', '🧁', '#F5CBA7', 'display', false, 6, true),
    ('c1110000-0000-0000-0000-000000000007', 'Individual Pastries', '🍰', '#FAD7A0', 'display', false, 7, true),
    ('c1110000-0000-0000-0000-000000000008', 'Cake', '🎂', '#F9E79F', 'display', false, 8, true),
    ('c1110000-0000-0000-0000-000000000009', 'Classic Breads', '🍞', '#C4A35A', 'display', false, 9, true),
    ('c1110000-0000-0000-0000-000000000010', 'Sourdough Breads', '🥖', '#DEB887', 'display', false, 10, true),
    ('c1110000-0000-0000-0000-000000000011', 'Buns', '🧇', '#E59866', 'display', false, 11, true),
    ('c1110000-0000-0000-0000-000000000012', 'Bagel', '🥯', '#A569BD', 'kitchen', false, 12, true),
    ('c1110000-0000-0000-0000-000000000013', 'Savouries', '🥧', '#45B39D', 'kitchen', false, 13, true),
    ('c1110000-0000-0000-0000-000000000014', 'Savoury Croissant', '🥐', '#52BE80', 'kitchen', false, 14, true),
    ('c1110000-0000-0000-0000-000000000015', 'Sandwiches Baguette', '🥪', '#5DADE2', 'kitchen', false, 15, true),
    ('c1110000-0000-0000-0000-000000000016', 'Panini', '🔥', '#EB984E', 'kitchen', false, 16, true),
    ('c1110000-0000-0000-0000-000000000017', 'Classic Sandwiches', '🍔', '#58D68D', 'kitchen', false, 17, true),
    ('c1110000-0000-0000-0000-000000000018', 'Simple Plate', '🍳', '#85C1E9', 'kitchen', false, 18, true),
    ('c1110000-0000-0000-0000-000000000019', 'HASIL BOHEMI', '🍯', '#F4D03F', 'display', false, 19, true),
    -- Raw Materials Categories (not POS visible)
    ('c1110000-0000-0000-0000-000000000050', 'SFG', '⚙️', '#BDC3C7', 'none', true, 50, true),
    ('c1110000-0000-0000-0000-000000000051', 'DAIRY', '🥛', '#F5EEF8', 'none', true, 51, true),
    ('c1110000-0000-0000-0000-000000000052', 'DRY', '🌾', '#FCF3CF', 'none', true, 52, true),
    ('c1110000-0000-0000-0000-000000000053', 'FLOUR', '🌾', '#FDEBD0', 'none', true, 53, true),
    ('c1110000-0000-0000-0000-000000000054', 'CONDIMENT', '🧂', '#FAE5D3', 'none', true, 54, true),
    ('c1110000-0000-0000-0000-000000000055', 'SAUCE', '🍅', '#F5B7B1', 'none', true, 55, true),
    ('c1110000-0000-0000-0000-000000000056', 'CHOCOLAT', '🍫', '#6E2C00', 'none', true, 56, true),
    ('c1110000-0000-0000-0000-000000000057', 'SEED', '🌰', '#D4AC0D', 'none', true, 57, true),
    ('c1110000-0000-0000-0000-000000000058', 'VEGETABLE', '🥬', '#27AE60', 'none', true, 58, true),
    ('c1110000-0000-0000-0000-000000000059', 'FRUIT', '🍓', '#E74C3C', 'none', true, 59, true),
    ('c1110000-0000-0000-0000-000000000060', 'meat', '🥩', '#922B21', 'none', true, 60, true),
    ('c1110000-0000-0000-0000-000000000061', 'BEVERAGE', '🧃', '#48C9B0', 'none', true, 61, true),
    ('c1110000-0000-0000-0000-000000000062', 'CLEANING', '🧹', '#85929E', 'none', true, 62, true),
    ('c1110000-0000-0000-0000-000000000063', 'PACKAGING', '📦', '#AAB7B8', 'none', true, 63, true),
    ('c1110000-0000-0000-0000-000000000064', 'KITCHEN SUPLLIES', '🔧', '#7F8C8D', 'none', true, 64, true);

-- =====================================================
-- PRODUCTS - Coffee (from CSV)
-- =====================================================
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('COF-001', 'Espresso', 'c1110000-0000-0000-0000-000000000001', 'finished', 25000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b7f0e0c067.jpg'),
    ('COF-002', 'Double Espresso', 'c1110000-0000-0000-0000-000000000001', 'finished', 30000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b7ef9701ab.jpg'),
    ('COF-003', 'Americano', 'c1110000-0000-0000-0000-000000000001', 'finished', 35000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b2c69a9c.jpg'),
    ('COF-004', 'Long Black', 'c1110000-0000-0000-0000-000000000001', 'finished', 35000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b8518a3096.jpg'),
    ('COF-005', 'Piccolo', 'c1110000-0000-0000-0000-000000000001', 'finished', 35000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0ab0d371c.jpg'),
    ('COF-006', 'Flat White', 'c1110000-0000-0000-0000-000000000001', 'finished', 35000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b814c1445a.jpg'),
    ('COF-007', 'Cappuccino', 'c1110000-0000-0000-0000-000000000001', 'finished', 35000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a8cdb0ea.jpg'),
    ('COF-008', 'Latte', 'c1110000-0000-0000-0000-000000000001', 'finished', 40000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b84279f70b.jpg'),
    ('COF-009', 'Moka Latte', 'c1110000-0000-0000-0000-000000000001', 'finished', 50000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b841762ed4.jpg'),
    ('COF-010', 'Affogato', 'c1110000-0000-0000-0000-000000000001', 'finished', 40000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b47bcd17.jpg'),
    ('COF-011', 'Babyccino', 'c1110000-0000-0000-0000-000000000001', 'finished', 25000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b8a4b56e.jpg');

-- Speciale Latte
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SL-001', 'Caramel Latte', 'c1110000-0000-0000-0000-000000000002', 'finished', 50000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6890221c7ceee.jpg'),
    ('SL-002', 'Vanilla Latte', 'c1110000-0000-0000-0000-000000000002', 'finished', 50000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689022e068c37.jpg'),
    ('SL-003', 'Hazelnut Latte', 'c1110000-0000-0000-0000-000000000002', 'finished', 50000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689021c0c8506.jpg'),
    ('SL-004', 'Chocolate Latte', 'c1110000-0000-0000-0000-000000000002', 'finished', 50000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689024170ecc5.jpg'),
    ('SL-005', 'Matcha Latte', 'c1110000-0000-0000-0000-000000000002', 'finished', 50000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689023eadd94e.jpg');

-- Special Drinks
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SD-001', 'Kombucha', 'c1110000-0000-0000-0000-000000000004', 'finished', 40000, 18000, 22, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b80aa430cb.jpg'),
    ('SD-002', 'Ginger Soda', 'c1110000-0000-0000-0000-000000000004', 'finished', 40000, 25000, 23, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b807c2aa1c.jpg');

-- Other drinks
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('OD-001', 'Fresh Juice', 'c1110000-0000-0000-0000-000000000003', 'finished', 30000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bef8bc59.jpg'),
    ('OD-002', 'Milk Shake', 'c1110000-0000-0000-0000-000000000003', 'finished', 45000, 0, 999, 'Cup', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0bc6938ee.jpg'),
    ('OD-003', 'Tea', 'c1110000-0000-0000-0000-000000000003', 'finished', 35000, 0, 999, 'Cup', true, NULL);

-- Classic Viennoiserie
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('CV-001', 'Croissant', 'c1110000-0000-0000-0000-000000000005', 'finished', 25000, 5902, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fe7ace724.jpg'),
    ('CV-002', 'Chocolatine', 'c1110000-0000-0000-0000-000000000005', 'finished', 30000, 8628, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879feda899eb.jpg'),
    ('CV-003', 'Croissant Almond', 'c1110000-0000-0000-0000-000000000005', 'finished', 30000, 8561, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879feb536ea0.jpg'),
    ('CV-004', 'Chocolatine Almond', 'c1110000-0000-0000-0000-000000000005', 'finished', 32000, 11202, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fc6780f56.jpg'),
    ('CV-005', 'Mini Croissant', 'c1110000-0000-0000-0000-000000000005', 'finished', 15000, 2951, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f63b180fd.jpg'),
    ('CV-006', 'Mini Chocolatine', 'c1110000-0000-0000-0000-000000000005', 'finished', 20000, 4311, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f61790b5f.jpg'),
    ('CV-007', 'Mini Choco Almond', 'c1110000-0000-0000-0000-000000000005', 'finished', 20000, 5867, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f5f361330.jpg'),
    ('CV-008', 'Mini Almond Croissant', 'c1110000-0000-0000-0000-000000000005', 'finished', 20000, 4881, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f53f9ec54.jpg'),
    ('CV-009', 'Danish Raisin', 'c1110000-0000-0000-0000-000000000005', 'finished', 30000, 6696, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a04390b1c7.jpg');

-- Others Viennoiserie
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('OV-001', 'Croissant Nutella', 'c1110000-0000-0000-0000-000000000006', 'finished', 35000, 10114, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f575aa4b3.jpg'),
    ('OV-002', 'Cruffin', 'c1110000-0000-0000-0000-000000000006', 'finished', 35000, 10371, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a013fd26b1.jpg'),
    ('OV-003', 'Croffel', 'c1110000-0000-0000-0000-000000000006', 'finished', 30000, 5897, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a060e95670.jpg'),
    ('OV-004', 'Madeleine', 'c1110000-0000-0000-0000-000000000006', 'finished', 10000, 4813, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f5c837b26.jpg'),
    ('OV-005', 'New York Roll Plain', 'c1110000-0000-0000-0000-000000000006', 'finished', 30000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a07a483e19.jpg'),
    ('OV-006', 'New York Roll Strawberry', 'c1110000-0000-0000-0000-000000000006', 'finished', 35000, 8328, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0728cfa62.jpg'),
    ('OV-007', 'New York Roll Chocolate', 'c1110000-0000-0000-0000-000000000006', 'finished', 35000, 12290, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0703bf5b3.jpg'),
    ('OV-008', 'New York Roll Caramel', 'c1110000-0000-0000-0000-000000000006', 'finished', 35000, 10422, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a076ae8e13.jpg'),
    ('OV-009', 'New York Roll Pistachio', 'c1110000-0000-0000-0000-000000000006', 'finished', 35000, 11730, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a071c6c8a8.jpg');

-- Individual Pastries
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('IP-001', 'Paris-Brest', 'c1110000-0000-0000-0000-000000000007', 'finished', 47000, 8964, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0597c567b.jpg'),
    ('IP-002', 'Opera', 'c1110000-0000-0000-0000-000000000007', 'finished', 42000, 13488, 12, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879ffbc22b8f.jpg'),
    ('IP-003', 'Lemon Meringue Pie', 'c1110000-0000-0000-0000-000000000007', 'finished', 42000, 7887, 2, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a05270fcd6.jpg'),
    ('IP-004', 'Lemon Cheesecake', 'c1110000-0000-0000-0000-000000000007', 'finished', 42000, 14207, 5, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0d90918d5.jpg'),
    ('IP-005', 'Strawberry Cheesecake', 'c1110000-0000-0000-0000-000000000007', 'finished', 42000, 13343, 6, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b862d40d9d.jpg'),
    ('IP-006', 'Tropical Fruit Cake', 'c1110000-0000-0000-0000-000000000007', 'finished', 47000, 9773, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a05d6aecca.jpg'),
    ('IP-007', 'Chocolate Pie', 'c1110000-0000-0000-0000-000000000007', 'finished', 47000, 13290, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0520dd9ab.jpg'),
    ('IP-008', 'Black Forest', 'c1110000-0000-0000-0000-000000000007', 'finished', 48000, 15233, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a04dd63a07.jpg'),
    ('IP-009', 'Breakery Cloud', 'c1110000-0000-0000-0000-000000000007', 'finished', 20000, 3658, 6, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879ff7b3189f.jpg'),
    ('IP-010', 'Chocolate Cloud', 'c1110000-0000-0000-0000-000000000007', 'finished', 22000, 6829, 7, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0d0490aa3.jpg'),
    ('IP-011', 'Dulce Praline Tartelette', 'c1110000-0000-0000-0000-000000000007', 'finished', 42000, 7999, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687afc12e7a26.jpg');

-- Cakes
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('CK-001', 'Opera Cake Small', 'c1110000-0000-0000-0000-000000000008', 'finished', 250000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a11e1b9c7d.jpg'),
    ('CK-002', 'Opera Cake Big', 'c1110000-0000-0000-0000-000000000008', 'finished', 420000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a11d6163fb.jpg'),
    ('CK-003', 'Black Forest Small 18cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 300000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a104523352.jpg'),
    ('CK-004', 'Black Forest Big 24cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 400000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a125ce45dd.jpg'),
    ('CK-005', 'Lemon Meringue Pie 16cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 250000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a13cb6716c.jpg'),
    ('CK-006', 'Lemon Meringue Pie 24cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 350000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a1390e0460.jpg'),
    ('CK-007', 'Strawberry Cheesecake 16cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 250000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a10a9b437e.jpg'),
    ('CK-008', 'Strawberry Cheesecake 24cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 400000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a118a70d76.jpg'),
    ('CK-009', 'Lemon Cheesecake 24cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 400000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a11217df5d.jpg'),
    ('CK-010', 'Tropical Fruit Cake 16cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 250000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a13c571d25.jpg'),
    ('CK-011', 'Tropical Fruit Cake 24cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 350000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a1374f3552.jpg'),
    ('CK-012', 'Choco Pie 16cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 250000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a107517afc.jpg'),
    ('CK-013', 'Choco Pie 24cm', 'c1110000-0000-0000-0000-000000000008', 'finished', 350000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a14dca0872.jpg');

-- Classic Breads
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('CB-001', 'Toast Bread', 'c1110000-0000-0000-0000-000000000009', 'finished', 60000, 14143, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f7fc34a67.jpg'),
    ('CB-002', 'Mini Toast Bread', 'c1110000-0000-0000-0000-000000000009', 'finished', 40000, 7029, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f6605af2e.jpg'),
    ('CB-003', 'Brown Bread', 'c1110000-0000-0000-0000-000000000009', 'finished', 40000, 6068, 18, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a002076c8d.jpg'),
    ('CB-004', 'Baguette Poolish 280gr', 'c1110000-0000-0000-0000-000000000009', 'finished', 24000, 3363, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a00b7ec31c.jpg'),
    ('CB-005', 'Small Baguette Poolish', 'c1110000-0000-0000-0000-000000000009', 'finished', 12000, 1672, 2, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a09c14f5e5.jpg'),
    ('CB-006', 'Small Baguette', 'c1110000-0000-0000-0000-000000000009', 'finished', 12000, 2270, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a08f01b6e8.jpg');

-- Sourdough Breads
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SB-001', 'White Sourdough Small', 'c1110000-0000-0000-0000-000000000010', 'finished', 40000, 2646, 2, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f8ba29244.jpg'),
    ('SB-002', 'White Sourdough Medium', 'c1110000-0000-0000-0000-000000000010', 'finished', 52000, 3986, 3, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a03825a385.jpg'),
    ('SB-003', 'White Poolish Small', 'c1110000-0000-0000-0000-000000000010', 'finished', 40000, 3889, 8, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b32bc162af.jpg'),
    ('SB-004', 'White Poolish Medium', 'c1110000-0000-0000-0000-000000000010', 'finished', 52000, 5840, 32, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b32636d8fc.jpg'),
    ('SB-005', 'Rye Sourdough Small', 'c1110000-0000-0000-0000-000000000010', 'finished', 42000, 11666, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f7a713ad5.jpg'),
    ('SB-006', 'Rye Sourdough Medium', 'c1110000-0000-0000-0000-000000000010', 'finished', 52000, 17479, 3, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f77d95b0d.jpg'),
    ('SB-007', 'Countryside Sourdough Small', 'c1110000-0000-0000-0000-000000000010', 'finished', 42000, 6610, 7, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b2f06ee657.jpg'),
    ('SB-008', 'Countryside Sourdough Medium', 'c1110000-0000-0000-0000-000000000010', 'finished', 52000, 9927, 4, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b2f1382f7e.jpg');

-- Buns
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('BN-001', 'Burger Buns', 'c1110000-0000-0000-0000-000000000011', 'finished', 12000, 1423, 16, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fcbc7f322.jpg'),
    ('BN-002', 'Mini Burger Buns', 'c1110000-0000-0000-0000-000000000011', 'finished', 8500, 762, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a1cf301d.jpg'),
    ('BN-003', 'Hot Dog Buns', 'c1110000-0000-0000-0000-000000000011', 'finished', 12000, 1474, 5, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a01a0de548.jpg'),
    ('BN-004', 'Ciabatta', 'c1110000-0000-0000-0000-000000000011', 'finished', 12000, 1481, 16, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a09f3cdf82.jpg'),
    ('BN-005', 'Bagels', 'c1110000-0000-0000-0000-000000000011', 'finished', 12000, 2423, 10, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f4d542680.jpg');

-- Bagel (sandwiches)
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('BG-001', 'American Bagel', 'c1110000-0000-0000-0000-000000000012', 'finished', 70000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f46e546ed.jpg'),
    ('BG-002', 'Vegetarian Bagel', 'c1110000-0000-0000-0000-000000000012', 'finished', 60000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f82316781.jpg'),
    ('BG-003', 'Smoky Fish Bagel', 'c1110000-0000-0000-0000-000000000012', 'finished', 85000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0088b2c4b.jpg'),
    ('BG-004', 'Cheesy Brie Bagel', 'c1110000-0000-0000-0000-000000000012', 'finished', 70000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fd8767785.jpg');

-- Savouries
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SV-001', 'Vegetarian Quiche', 'c1110000-0000-0000-0000-000000000013', 'finished', 42000, 7068, 5, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879ff134c78c.jpg'),
    ('SV-002', 'Meat Quiche', 'c1110000-0000-0000-0000-000000000013', 'finished', 47000, 8234, 3, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0c863c484.jpg'),
    ('SV-003', 'Pizza Slice', 'c1110000-0000-0000-0000-000000000013', 'finished', 22000, 5022, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f73cc3606.jpg'),
    ('SV-004', 'Croque-Monsieur', 'c1110000-0000-0000-0000-000000000013', 'finished', 37000, 8613, 6, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a00ef08b3c.jpg'),
    ('SV-005', 'French Fries', 'c1110000-0000-0000-0000-000000000013', 'finished', 35000, 6170, 15, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a08a76f8d1.jpg');

-- Savoury Croissant
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SC-001', 'Beef Cheese Croissant', 'c1110000-0000-0000-0000-000000000014', 'finished', 45000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f3a62df21.jpg'),
    ('SC-002', 'Banh Mi Croissant', 'c1110000-0000-0000-0000-000000000014', 'finished', 50000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fff45e02c.jpg');

-- Sandwiches Baguette
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SW-001', 'Chicken Baguette Sandwich', 'c1110000-0000-0000-0000-000000000015', 'finished', 85000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fe2c3f679.jpg'),
    ('SW-002', 'Chicken Banh Mi', 'c1110000-0000-0000-0000-000000000015', 'finished', 85000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fde9b12db.jpg'),
    ('SW-003', 'Frenchy', 'c1110000-0000-0000-0000-000000000015', 'finished', 90000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0235ed414.jpg'),
    ('SW-004', 'Vegetarian Baguette Sandwich', 'c1110000-0000-0000-0000-000000000015', 'finished', 60000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f87099207.jpg'),
    ('SW-005', 'American Sandwich', 'c1110000-0000-0000-0000-000000000015', 'finished', 100000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f498af0dd.jpg');

-- Panini
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('PN-001', 'Italian Panini', 'c1110000-0000-0000-0000-000000000016', 'finished', 85000, 31544, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a045346c42.jpg'),
    ('PN-002', 'Chicken Curry Panini', 'c1110000-0000-0000-0000-000000000016', 'finished', 85000, 16381, 1, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0468e8d05.jpg'),
    ('PN-003', 'Panini 3 Cheese', 'c1110000-0000-0000-0000-000000000016', 'finished', 90000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f6d4e0a37.jpg');

-- Classic Sandwiches
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('CS-001', 'Burger', 'c1110000-0000-0000-0000-000000000017', 'finished', 100000, 37415, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a01cc6b01e.jpg'),
    ('CS-002', 'Hot Dog Sandwich', 'c1110000-0000-0000-0000-000000000017', 'finished', 55000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0283d0271.jpg');

-- Simple Plate
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('SP-001', 'Egg Benedict', 'c1110000-0000-0000-0000-000000000018', 'finished', 75000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f59f2538a.jpg'),
    ('SP-002', 'Omelette', 'c1110000-0000-0000-0000-000000000018', 'finished', 65000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f3fcde747.jpg'),
    ('SP-003', 'Salade Special', 'c1110000-0000-0000-0000-000000000018', 'finished', 48000, 0, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879f7cca1680.jpg');

-- HASIL BOHEMI (Artisan Products)
INSERT INTO products (sku, name, category_id, product_type, retail_price, cost_price, current_stock, unit, pos_visible, image_url) VALUES
    ('HB-001', 'Passion Fruit Jam', 'c1110000-0000-0000-0000-000000000019', 'finished', 110000, 74250, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0aa723667.jpeg'),
    ('HB-002', 'Granola', 'c1110000-0000-0000-0000-000000000019', 'finished', 116000, 81000, 3, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0cd3602ff.jpeg'),
    ('HB-003', 'Crunchy Peanut Butter', 'c1110000-0000-0000-0000-000000000019', 'finished', 75000, 51750, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0c94d06e9.jpg'),
    ('HB-004', 'Almond Butter', 'c1110000-0000-0000-0000-000000000019', 'finished', 140000, 96750, 0, 'Pcs', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0ca461747.jpg'),
    ('HB-005', 'Dark Choco Peanut Butter', 'c1110000-0000-0000-0000-000000000019', 'finished', 110000, 74250, 1, 'Pcs', true, NULL),
    ('HB-006', 'Coffee Bean Pack 250gr', 'c1110000-0000-0000-0000-000000000019', 'finished', 150000, 0, 0, 'Bag', true, 'https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687b0f4047838.jpg'),
    ('HB-007', 'Coffee Bean Pack 500gr', 'c1110000-0000-0000-0000-000000000019', 'finished', 250000, 0, 0, 'Bag', true, NULL);

-- =====================================================
-- USER PROFILES
-- =====================================================
INSERT INTO user_profiles (id, name, role, pin_code, is_active, can_apply_discount, can_cancel_order, can_access_reports) VALUES
    ('a1110000-0000-0000-0000-000000000001', 'Apni', 'cashier', '1234', true, false, false, false),
    ('a1110000-0000-0000-0000-000000000002', 'Dani', 'manager', '0000', true, true, true, true),
    ('a1110000-0000-0000-0000-000000000003', 'Irfan', 'server', '5678', true, false, false, false),
    ('a1110000-0000-0000-0000-000000000004', 'Bayu', 'barista', '2222', true, false, false, false),
    ('a1110000-0000-0000-0000-000000000005', 'Admin', 'admin', '9999', true, true, true, true);

-- =====================================================
-- SAMPLE CUSTOMERS
-- =====================================================
INSERT INTO customers (id, name, phone, email, customer_type, loyalty_points, payment_terms) VALUES
    ('b1110000-0000-0000-0000-000000000001', 'Guest Customer', NULL, NULL, 'retail', 0, 'cod'),
    ('b1110000-0000-0000-0000-000000000002', 'Walk-in Customer', NULL, NULL, 'retail', 0, 'cod');

-- =====================================================
-- PRODUCT MODIFIERS - Coffee
-- =====================================================
INSERT INTO product_modifiers (category_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, option_icon, price_adjustment, is_default, option_sort_order) VALUES
    -- Temperature
    ('c1110000-0000-0000-0000-000000000001', 'Temperature', 'single', true, 1, 'hot', 'Hot 🔥', '🔥', 0, true, 1),
    ('c1110000-0000-0000-0000-000000000001', 'Temperature', 'single', true, 1, 'iced', 'Iced 🧊', '🧊', 0, false, 2),
    -- Milk for Coffee
    ('c1110000-0000-0000-0000-000000000001', 'Milk', 'single', true, 2, 'fresh', 'Fresh Milk', NULL, 0, true, 1),
    ('c1110000-0000-0000-0000-000000000001', 'Milk', 'single', true, 2, 'oat', 'Oat Milk', '🌾', 10000, false, 2);

-- Modifiers for Speciale Latte
INSERT INTO product_modifiers (category_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, option_icon, price_adjustment, is_default, option_sort_order) VALUES
    ('c1110000-0000-0000-0000-000000000002', 'Temperature', 'single', true, 1, 'hot', 'Hot 🔥', '🔥', 0, true, 1),
    ('c1110000-0000-0000-0000-000000000002', 'Temperature', 'single', true, 1, 'iced', 'Iced 🧊', '🧊', 0, false, 2),
    ('c1110000-0000-0000-0000-000000000002', 'Milk', 'single', true, 2, 'fresh', 'Fresh Milk', NULL, 0, true, 1),
    ('c1110000-0000-0000-0000-000000000002', 'Milk', 'single', true, 2, 'oat', 'Oat Milk', '🌾', 10000, false, 2);

-- Modifiers for Fresh Juice
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Fruit', 'single', true, 1, 'orange', 'Orange 🍊', 0, true, 1 FROM products WHERE sku = 'OD-001';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Fruit', 'single', true, 1, 'mango', 'Mango 🥭', 0, false, 2 FROM products WHERE sku = 'OD-001';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Fruit', 'single', true, 1, 'watermelon', 'Watermelon 🍉', 0, false, 3 FROM products WHERE sku = 'OD-001';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Fruit', 'single', true, 1, 'strawberry', 'Strawberry 🍓', 0, false, 4 FROM products WHERE sku = 'OD-001';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Fruit', 'single', true, 1, 'pineapple', 'Pineapple 🍍', 0, false, 5 FROM products WHERE sku = 'OD-001';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Fruit', 'single', true, 1, 'banana', 'Banana 🍌', 0, false, 6 FROM products WHERE sku = 'OD-001';

-- Modifiers for Tea
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Type', 'single', true, 1, 'earl-grey', 'Earl Grey', 0, true, 1 FROM products WHERE sku = 'OD-003';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Type', 'single', true, 1, 'green', 'Green Tea', 0, false, 2 FROM products WHERE sku = 'OD-003';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Type', 'single', true, 1, 'jasmine', 'Jasmine', 0, false, 3 FROM products WHERE sku = 'OD-003';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Type', 'single', true, 1, 'english', 'English Breakfast', 0, false, 4 FROM products WHERE sku = 'OD-003';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Type', 'single', true, 1, 'ginger', 'Ginger Lemon', 0, false, 5 FROM products WHERE sku = 'OD-003';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Temperature', 'single', true, 2, 'hot', 'Hot 🔥', 0, true, 1 FROM products WHERE sku = 'OD-003';
INSERT INTO product_modifiers (product_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, price_adjustment, is_default, option_sort_order)
SELECT id, 'Temperature', 'single', true, 2, 'iced', 'Iced 🧊', 0, false, 2 FROM products WHERE sku = 'OD-003';
