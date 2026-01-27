-- ============================================
-- Ajouter le tracking des ingrédients pour les variants
-- Permet d'associer un produit/ingrédient à chaque option de variant
-- pour la déduction automatique du stock
-- ============================================

-- Ajouter les colonnes pour le tracking des matériaux
ALTER TABLE public.product_modifiers
ADD COLUMN IF NOT EXISTS material_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS material_quantity DECIMAL(10,3) DEFAULT 0;

-- Commentaires
COMMENT ON COLUMN public.product_modifiers.material_id IS 'Produit/ingrédient à déduire du stock pour cette option de variant';
COMMENT ON COLUMN public.product_modifiers.material_quantity IS 'Quantité d''ingrédient à déduire (ex: 250 pour 250ml de lait d''avoine)';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_product_modifiers_material
ON public.product_modifiers(material_id)
WHERE material_id IS NOT NULL;

-- Exemple de données pour tester
-- Un café Latte avec différents types de lait
/*
UPDATE product_modifiers
SET material_id = (SELECT id FROM products WHERE name = 'Lait frais' LIMIT 1),
    material_quantity = 250
WHERE group_name = 'Lait' AND option_label = 'Lait frais';

UPDATE product_modifiers
SET material_id = (SELECT id FROM products WHERE name = 'Lait d''avoine' LIMIT 1),
    material_quantity = 250
WHERE group_name = 'Lait' AND option_label = 'Lait d''avoine';
*/
