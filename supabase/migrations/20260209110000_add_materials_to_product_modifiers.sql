-- Add materials JSONB column to product_modifiers for variant ingredient deduction
ALTER TABLE public.product_modifiers
ADD COLUMN IF NOT EXISTS materials jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.product_modifiers.materials IS 'Array of {material_id, quantity} for stock deduction when variant is selected';
