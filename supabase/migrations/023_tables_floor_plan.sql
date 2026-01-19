-- Migration: Tables Floor Plan
-- Description: Create tables for managing restaurant floor plan (Dine In tables)
-- Date: 2026-01-18

-- Create tables table
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    section TEXT NOT NULL DEFAULT 'Main',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
    x NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    y NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT tables_number_unique UNIQUE (number),
    CONSTRAINT tables_capacity_check CHECK (capacity > 0 AND capacity <= 20),
    CONSTRAINT tables_x_check CHECK (x >= 0 AND x <= 100),
    CONSTRAINT tables_y_check CHECK (y >= 0 AND y <= 100)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tables_section ON public.tables(section);
CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tables_updated_at
    BEFORE UPDATE ON public.tables
    FOR EACH ROW
    EXECUTE FUNCTION update_tables_updated_at();

-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all authenticated users to read tables
CREATE POLICY "Allow authenticated users to read tables"
    ON public.tables
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert tables
CREATE POLICY "Allow authenticated users to insert tables"
    ON public.tables
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update tables
CREATE POLICY "Allow authenticated users to update tables"
    ON public.tables
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete tables
CREATE POLICY "Allow authenticated users to delete tables"
    ON public.tables
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert some default tables for testing
INSERT INTO public.tables (number, capacity, section, status, x, y) VALUES
    ('1', 2, 'Main', 'available', 15, 15),
    ('2', 2, 'Main', 'available', 40, 15),
    ('3', 4, 'Main', 'available', 65, 15),
    ('4', 4, 'Main', 'available', 15, 40),
    ('5', 6, 'Main', 'available', 40, 40),
    ('6', 2, 'Main', 'available', 65, 40),
    ('7', 4, 'Terrace', 'available', 15, 65),
    ('8', 4, 'Terrace', 'available', 40, 65),
    ('9', 2, 'Terrace', 'available', 65, 65),
    ('10', 8, 'VIP', 'available', 15, 85),
    ('11', 8, 'VIP', 'available', 50, 85)
ON CONFLICT (number) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.tables IS 'Stores floor plan tables for Dine In orders';
