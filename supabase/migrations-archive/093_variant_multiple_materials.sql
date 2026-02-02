-- ============================================
-- Permettre plusieurs ingrédients par option de variant
-- Remplace material_id/material_quantity par un champ JSONB materials
-- ============================================

-- Ajouter le nouveau champ materials (tableau JSONB)
ALTER TABLE public.product_modifiers
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.product_modifiers.materials IS 'Tableau d''ingrédients à déduire: [{"material_id": "uuid", "quantity": 250}, ...]';

-- Migrer les données existantes de material_id/material_quantity vers materials
UPDATE public.product_modifiers
SET materials = jsonb_build_array(
    jsonb_build_object(
        'material_id', material_id::text,
        'quantity', material_quantity
    )
)
WHERE material_id IS NOT NULL AND material_quantity > 0;

-- Index pour recherches JSON
CREATE INDEX IF NOT EXISTS idx_product_modifiers_materials
ON public.product_modifiers USING GIN (materials);

-- Les anciennes colonnes sont conservées pour compatibilité ascendante
-- mais ne seront plus utilisées

-- Exemple de structure:
/*
materials: [
  {
    "material_id": "uuid-lait-avoine",
    "quantity": 250
  },
  {
    "material_id": "uuid-edulcorant",
    "quantity": 5
  }
]
*/
