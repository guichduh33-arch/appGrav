-- Migration: 064_add_supplier_address_columns.sql
-- Description: Add missing address columns to suppliers table
-- Required by: SuppliersPage.tsx

-- Add missing columns to suppliers table
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Indonesia',
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN public.suppliers.city IS 'City where supplier is located';
COMMENT ON COLUMN public.suppliers.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN public.suppliers.country IS 'Country (defaults to Indonesia)';
COMMENT ON COLUMN public.suppliers.tax_id IS 'Tax identification number (NPWP for Indonesia)';

-- Create index for city searches
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON public.suppliers(city);
