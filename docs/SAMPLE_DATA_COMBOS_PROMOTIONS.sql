-- ============================================
-- SAMPLE DATA - Combos et Promotions
-- AppGrav - The Breakery
-- ============================================

-- NOTE: Remplacez les UUID par des IDs réels de votre base de données
-- Vous pouvez récupérer les IDs avec: SELECT id, name FROM products;

-- ============================================
-- 1. COMBOS - Offres Groupées
-- ============================================

-- Combo 1: Petit Déjeuner Complet
DO $$
DECLARE
    combo_breakfast_id UUID;
    product_croissant_id UUID;
    product_coffee_id UUID;
    product_juice_id UUID;
BEGIN
    -- Récupérer les IDs des produits (ajustez les noms selon vos produits)
    SELECT id INTO product_croissant_id FROM products WHERE name ILIKE '%croissant%' LIMIT 1;
    SELECT id INTO product_coffee_id FROM products WHERE name ILIKE '%café%' OR name ILIKE '%coffee%' LIMIT 1;
    SELECT id INTO product_juice_id FROM products WHERE name ILIKE '%jus%' OR name ILIKE '%juice%' LIMIT 1;

    -- Créer le combo
    INSERT INTO product_combos (name, description, combo_price, is_active, available_at_pos, sort_order)
    VALUES (
        'Petit Déjeuner Complet',
        'Commencez bien votre journée avec notre combo petit déjeuner: croissant frais, café et jus d''orange',
        45000,
        true,
        true,
        1
    )
    RETURNING id INTO combo_breakfast_id;

    -- Ajouter les items du combo
    IF product_croissant_id IS NOT NULL THEN
        INSERT INTO product_combo_items (combo_id, product_id, quantity, is_optional)
        VALUES (combo_breakfast_id, product_croissant_id, 1, false);
    END IF;

    IF product_coffee_id IS NOT NULL THEN
        INSERT INTO product_combo_items (combo_id, product_id, quantity, is_optional)
        VALUES (combo_breakfast_id, product_coffee_id, 1, false);
    END IF;

    IF product_juice_id IS NOT NULL THEN
        INSERT INTO product_combo_items (combo_id, product_id, quantity, is_optional)
        VALUES (combo_breakfast_id, product_juice_id, 1, true); -- Optionnel
    END IF;

    RAISE NOTICE 'Combo "Petit Déjeuner Complet" créé avec ID: %', combo_breakfast_id;
END $$;

-- Combo 2: Pause Café
DO $$
DECLARE
    combo_coffee_break_id UUID;
    product_coffee_id UUID;
    product_pastry_id UUID;
BEGIN
    SELECT id INTO product_coffee_id FROM products WHERE name ILIKE '%café%' OR name ILIKE '%coffee%' LIMIT 1;
    SELECT id INTO product_pastry_id FROM products WHERE name ILIKE '%pain%' OR name ILIKE '%viennois%' LIMIT 1;

    INSERT INTO product_combos (name, description, combo_price, is_active, available_at_pos, sort_order)
    VALUES (
        'Pause Café',
        'Un café accompagné d''une viennoiserie de votre choix',
        30000,
        true,
        true,
        2
    )
    RETURNING id INTO combo_coffee_break_id;

    IF product_coffee_id IS NOT NULL THEN
        INSERT INTO product_combo_items (combo_id, product_id, quantity, is_optional)
        VALUES (combo_coffee_break_id, product_coffee_id, 1, false);
    END IF;

    IF product_pastry_id IS NOT NULL THEN
        INSERT INTO product_combo_items (combo_id, product_id, quantity, is_optional)
        VALUES (combo_coffee_break_id, product_pastry_id, 1, false);
    END IF;

    RAISE NOTICE 'Combo "Pause Café" créé avec ID: %', combo_coffee_break_id;
END $$;

-- ============================================
-- 2. PROMOTIONS - Réductions Pourcentage
-- ============================================

-- Promotion 1: Happy Hour (30% sur boissons, 14h-17h, Lun-Ven)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    discount_percentage,
    time_start,
    time_end,
    days_of_week,
    is_active,
    priority,
    is_stackable
)
VALUES (
    'HAPPY30',
    'Happy Hour',
    '30% de réduction sur toutes les boissons entre 14h et 17h du lundi au vendredi',
    'percentage',
    30,
    '14:00',
    '17:00',
    ARRAY[1, 2, 3, 4, 5], -- Lundi(1) à Vendredi(5)
    true,
    50,
    false
);

-- Lier la promotion à la catégorie "Boissons" (si elle existe)
DO $$
DECLARE
    promo_happy_id UUID;
    cat_beverages_id UUID;
BEGIN
    SELECT id INTO promo_happy_id FROM promotions WHERE code = 'HAPPY30';
    SELECT id INTO cat_beverages_id FROM categories WHERE name ILIKE '%boisson%' OR name ILIKE '%drink%' OR name ILIKE '%beverage%' LIMIT 1;

    IF cat_beverages_id IS NOT NULL THEN
        INSERT INTO promotion_products (promotion_id, category_id)
        VALUES (promo_happy_id, cat_beverages_id);
        RAISE NOTICE 'Happy Hour lié à la catégorie Boissons';
    END IF;
END $$;

-- Promotion 2: Matinée Viennoiseries (15% sur pâtisseries, 6h-10h, tous les jours)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    discount_percentage,
    time_start,
    time_end,
    is_active,
    priority,
    is_stackable
)
VALUES (
    'MORNING15',
    'Matinée Viennoiseries',
    '15% de réduction sur toutes les viennoiseries le matin',
    'percentage',
    15,
    '06:00',
    '10:00',
    true,
    40,
    true
);

-- ============================================
-- 3. PROMOTIONS - Montant Fixe
-- ============================================

-- Promotion 3: Weekend Special (20,000 IDR de réduction, Sam-Dim, min 100,000)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    discount_amount,
    min_purchase_amount,
    days_of_week,
    is_active,
    priority,
    is_stackable,
    max_uses_total
)
VALUES (
    'WEEKEND20',
    'Weekend Special',
    '20,000 IDR de réduction pour tout achat supérieur à 100,000 IDR le weekend',
    'fixed_amount',
    20000,
    100000,
    ARRAY[0, 6], -- Dimanche(0) et Samedi(6)
    true,
    30,
    false,
    100 -- Limite à 100 utilisations
);

-- Promotion 4: Grand Achat (50,000 IDR de réduction, min 300,000)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    discount_amount,
    min_purchase_amount,
    is_active,
    priority,
    is_stackable,
    start_date,
    end_date
)
VALUES (
    'BIGBUY50',
    'Grand Achat',
    '50,000 IDR de réduction pour tout achat supérieur à 300,000 IDR',
    'fixed_amount',
    50000,
    300000,
    true,
    20,
    true,
    NOW(),
    NOW() + INTERVAL '30 days'
);

-- ============================================
-- 4. PROMOTIONS - Achetez X obtenez Y
-- ============================================

-- Promotion 5: 2+1 Gratuit sur Croissants
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    buy_quantity,
    get_quantity,
    is_active,
    priority,
    is_stackable
)
VALUES (
    'CROIS2GET1',
    'Croissants 2+1',
    'Achetez 2 croissants, obtenez le 3ème gratuit',
    'buy_x_get_y',
    2,
    1,
    true,
    60,
    false
);

-- Lier à un produit spécifique (Croissant)
DO $$
DECLARE
    promo_2get1_id UUID;
    product_croissant_id UUID;
BEGIN
    SELECT id INTO promo_2get1_id FROM promotions WHERE code = 'CROIS2GET1';
    SELECT id INTO product_croissant_id FROM products WHERE name ILIKE '%croissant%' LIMIT 1;

    IF product_croissant_id IS NOT NULL THEN
        INSERT INTO promotion_products (promotion_id, product_id)
        VALUES (promo_2get1_id, product_croissant_id);
        RAISE NOTICE '2+1 lié au produit Croissant';
    END IF;
END $$;

-- Promotion 6: 3 pour 2 sur tous les cafés
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    buy_quantity,
    get_quantity,
    is_active,
    priority,
    is_stackable,
    time_start,
    time_end
)
VALUES (
    'COFFEE3FOR2',
    'Cafés 3 pour 2',
    'Achetez 3 cafés, payez-en seulement 2',
    'buy_x_get_y',
    3,
    1,
    true,
    55,
    false,
    '06:00',
    '11:00' -- Uniquement le matin
);

-- ============================================
-- 5. PROMOTIONS - Produit Offert
-- ============================================

-- Promotion 7: Cookie Gratuit (min 50,000, max 1 par client)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    min_purchase_amount,
    is_active,
    priority,
    is_stackable,
    max_uses_per_customer
)
VALUES (
    'FREECOOKIE',
    'Cookie Gratuit',
    'Un délicieux cookie offert pour tout achat supérieur à 50,000 IDR (max 1 par client)',
    'free_product',
    50000,
    true,
    25,
    true,
    1 -- Maximum 1 fois par client
);

-- Définir le produit offert
DO $$
DECLARE
    promo_cookie_id UUID;
    product_cookie_id UUID;
BEGIN
    SELECT id INTO promo_cookie_id FROM promotions WHERE code = 'FREECOOKIE';
    SELECT id INTO product_cookie_id FROM products WHERE name ILIKE '%cookie%' LIMIT 1;

    IF product_cookie_id IS NOT NULL THEN
        INSERT INTO promotion_free_products (promotion_id, free_product_id, quantity)
        VALUES (promo_cookie_id, product_cookie_id, 1);
        RAISE NOTICE 'Cookie gratuit configuré';
    END IF;
END $$;

-- Promotion 8: Macaron Offert (achat pâtisserie + boisson)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    min_purchase_amount,
    is_active,
    priority,
    is_stackable,
    start_date,
    end_date
)
VALUES (
    'MACARON-GIFT',
    'Macaron Cadeau',
    'Un macaron offert pour tout achat de pâtisserie accompagné d''une boisson',
    'free_product',
    40000,
    true,
    15,
    true,
    NOW(),
    NOW() + INTERVAL '14 days'
);

-- ============================================
-- 6. PROMOTIONS - Campagnes Spéciales
-- ============================================

-- Promotion 9: Nouvelle Année (25% sur tout, 1-7 Janvier)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    discount_percentage,
    is_active,
    priority,
    is_stackable,
    start_date,
    end_date,
    max_uses_total
)
VALUES (
    'NEWYEAR25',
    'Nouvelle Année',
    '25% de réduction sur tous les produits pour bien commencer l''année',
    'percentage',
    25,
    false, -- À activer au moment voulu
    80,
    false,
    '2026-01-01 00:00:00',
    '2026-01-07 23:59:59',
    500
);

-- Promotion 10: Anniversaire The Breakery (50% sur tout, jour spécifique)
INSERT INTO promotions (
    code,
    name,
    description,
    promotion_type,
    discount_percentage,
    is_active,
    priority,
    is_stackable,
    start_date,
    end_date,
    max_uses_per_customer
)
VALUES (
    'BIRTHDAY50',
    'Anniversaire The Breakery',
    '50% sur tout pour notre anniversaire - merci de votre fidélité !',
    'percentage',
    50,
    false, -- À activer le jour J
    100,
    false,
    '2026-06-15 00:00:00',
    '2026-06-15 23:59:59',
    2 -- Max 2 fois par client ce jour-là
);

-- ============================================
-- 7. VERIFICATION
-- ============================================

-- Compter les combos créés
SELECT COUNT(*) as "Nombre de Combos" FROM product_combos;

-- Compter les promotions créées
SELECT COUNT(*) as "Nombre de Promotions" FROM promotions;

-- Afficher un résumé
SELECT
    'Combos' as type,
    COUNT(*) as total,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as actifs
FROM product_combos
UNION ALL
SELECT
    'Promotions' as type,
    COUNT(*) as total,
    SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as actifs
FROM promotions;

-- Afficher les promotions actives par priorité
SELECT
    code,
    name,
    promotion_type,
    priority,
    CASE
        WHEN start_date IS NOT NULL AND end_date IS NOT NULL
        THEN CONCAT('Du ', start_date::DATE, ' au ', end_date::DATE)
        ELSE 'Permanent'
    END as periode
FROM promotions
WHERE is_active = true
ORDER BY priority DESC;

-- ============================================
-- NOTES
-- ============================================

/*
ADAPTATION NÉCESSAIRE:
1. Remplacez les noms de produits dans les requêtes SELECT id FROM products WHERE name ILIKE '...'
   par les noms exacts de vos produits

2. Si certaines catégories n'existent pas, créez-les d'abord:
   INSERT INTO categories (name, icon, color) VALUES ('Boissons', 'coffee', '#e97451');

3. Les promotions avec start_date/end_date peuvent être ajustées selon vos besoins

4. Les jours de la semaine suivent ce format:
   - 0 = Dimanche
   - 1 = Lundi
   - 2 = Mardi
   - 3 = Mercredi
   - 4 = Jeudi
   - 5 = Vendredi
   - 6 = Samedi

5. Les heures sont au format 24h: '14:00', '17:30', etc.

6. Pour désactiver temporairement une promotion:
   UPDATE promotions SET is_active = false WHERE code = 'CODE_PROMO';

7. Pour voir l'utilisation d'une promotion:
   SELECT COUNT(*) FROM promotion_usage WHERE promotion_id = (SELECT id FROM promotions WHERE code = 'CODE_PROMO');
*/
