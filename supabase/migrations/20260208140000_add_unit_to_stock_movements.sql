-- Add unit column to stock_movements for better traceability
-- This allows tracking the unit of measure for each movement

ALTER TABLE public.stock_movements
ADD COLUMN IF NOT EXISTS unit VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN public.stock_movements.unit IS 'Unit of measure for the quantity (e.g., pcs, kg, g, L, ml)';

-- Create index for potential filtering by unit
CREATE INDEX IF NOT EXISTS idx_stock_movements_unit ON public.stock_movements(unit);
