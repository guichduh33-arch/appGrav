-- Migration: Add unit field to purchase_order_items
-- Description: Adds unit of measurement column to purchase order items table
-- Date: 2026-01-28

-- Add unit column to purchase_order_items
ALTER TABLE public.purchase_order_items
ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'kg';

-- Add comment
COMMENT ON COLUMN public.purchase_order_items.unit IS 'Unit of measurement for the product (kg, g, L, mL, pcs, box, bag, etc.)';
