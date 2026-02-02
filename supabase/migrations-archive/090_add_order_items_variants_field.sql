-- ============================================
-- Ajouter un champ pour stocker les variants sélectionnés
-- dans order_items pour la déduction automatique des ingrédients
-- ============================================

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_variants JSONB DEFAULT NULL;

COMMENT ON COLUMN public.order_items.selected_variants IS 'Variants sélectionnés avec leurs ingrédients pour déduction stock';

-- Index GIN pour recherches JSON
CREATE INDEX IF NOT EXISTS idx_order_items_selected_variants
ON public.order_items USING GIN (selected_variants);

-- Exemple de structure JSON:
/*
{
  "variants": [
    {
      "groupName": "Lait",
      "optionIds": ["opt_123"],
      "optionLabels": ["Lait d'avoine"],
      "materials": [
        {
          "materialId": "uuid-produit-lait-avoine",
          "quantity": 250
        }
      ]
    },
    {
      "groupName": "Taille",
      "optionIds": ["opt_456"],
      "optionLabels": ["Large"],
      "materials": []
    }
  ]
}
*/
