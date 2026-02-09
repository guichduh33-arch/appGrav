-- Migration: Add show_in_pos column to categories
-- Purpose: Explicit control over category visibility in POS interface

-- Add show_in_pos column (default true for existing categories)
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS show_in_pos BOOLEAN DEFAULT TRUE;

-- Update existing categories: raw materials should not show in POS
UPDATE public.categories SET show_in_pos = FALSE WHERE is_raw_material = TRUE;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_categories_show_in_pos ON public.categories(show_in_pos);

-- Comment
COMMENT ON COLUMN public.categories.show_in_pos IS 'Whether this category appears in the POS interface';
