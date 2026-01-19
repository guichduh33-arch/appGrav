-- Migration: Floor Plan Items (Tables + Decorations)
-- Description: Replace simple tables table with comprehensive floor plan items supporting different shapes and decorations
-- Date: 2026-01-18

-- Drop old tables table if exists
DROP TABLE IF EXISTS public.tables CASCADE;

-- Create floor_plan_items table
CREATE TABLE IF NOT EXISTS public.floor_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('table', 'decoration')),

    -- Table-specific fields
    number TEXT,
    capacity INTEGER,
    section TEXT,
    status TEXT CHECK (status IN ('available', 'occupied', 'reserved')),

    -- Common fields
    shape TEXT NOT NULL CHECK (shape IN ('square', 'round', 'rectangle')),

    -- Decoration-specific fields
    decoration_type TEXT CHECK (decoration_type IN ('plant', 'wall', 'bar', 'entrance')),

    -- Position and size
    x NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    y NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    width INTEGER,
    height INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT floor_plan_items_x_check CHECK (x >= 0 AND x <= 100),
    CONSTRAINT floor_plan_items_y_check CHECK (y >= 0 AND y <= 100),
    CONSTRAINT floor_plan_items_table_number_unique UNIQUE NULLS NOT DISTINCT (number),
    CONSTRAINT floor_plan_items_table_capacity_check CHECK (
        type != 'table' OR (capacity IS NOT NULL AND capacity > 0 AND capacity <= 20)
    ),
    CONSTRAINT floor_plan_items_table_section_check CHECK (
        type != 'table' OR section IS NOT NULL
    ),
    CONSTRAINT floor_plan_items_table_status_check CHECK (
        type != 'table' OR status IS NOT NULL
    ),
    CONSTRAINT floor_plan_items_decoration_type_check CHECK (
        type != 'decoration' OR decoration_type IS NOT NULL
    )
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_floor_plan_items_type ON public.floor_plan_items(type);
CREATE INDEX IF NOT EXISTS idx_floor_plan_items_section ON public.floor_plan_items(section) WHERE type = 'table';
CREATE INDEX IF NOT EXISTS idx_floor_plan_items_status ON public.floor_plan_items(status) WHERE type = 'table';
CREATE INDEX IF NOT EXISTS idx_floor_plan_items_number ON public.floor_plan_items(number) WHERE type = 'table';

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_floor_plan_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_floor_plan_items_updated_at
    BEFORE UPDATE ON public.floor_plan_items
    FOR EACH ROW
    EXECUTE FUNCTION update_floor_plan_items_updated_at();

-- Enable RLS
ALTER TABLE public.floor_plan_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read floor plan items"
    ON public.floor_plan_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert floor plan items"
    ON public.floor_plan_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update floor plan items"
    ON public.floor_plan_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete floor plan items"
    ON public.floor_plan_items
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert default floor plan with tables and decorations
INSERT INTO public.floor_plan_items (type, number, capacity, section, status, shape, x, y, width, height) VALUES
    -- Main Section Tables
    ('table', '1', 2, 'Main', 'available', 'square', 15, 15, 80, 80),
    ('table', '2', 2, 'Main', 'available', 'square', 40, 15, 80, 80),
    ('table', '3', 4, 'Main', 'available', 'round', 65, 15, 80, 80),
    ('table', '4', 4, 'Main', 'available', 'square', 15, 40, 80, 80),
    ('table', '5', 6, 'Main', 'available', 'rectangle', 40, 40, 120, 80),
    ('table', '6', 2, 'Main', 'available', 'round', 65, 40, 80, 80),

    -- Terrace Tables
    ('table', '7', 4, 'Terrace', 'available', 'square', 15, 65, 80, 80),
    ('table', '8', 4, 'Terrace', 'available', 'round', 40, 65, 80, 80),
    ('table', '9', 2, 'Terrace', 'available', 'square', 65, 65, 80, 80),

    -- VIP Section
    ('table', '10', 8, 'VIP', 'available', 'rectangle', 25, 85, 120, 80),
    ('table', '11', 8, 'VIP', 'available', 'rectangle', 60, 85, 120, 80)
ON CONFLICT (number) DO NOTHING;

-- Insert some decorations
INSERT INTO public.floor_plan_items (type, decoration_type, shape, x, y, width, height) VALUES
    ('decoration', 'plant', 'square', 85, 20, 60, 60),
    ('decoration', 'plant', 'square', 85, 50, 60, 60),
    ('decoration', 'entrance', 'rectangle', 50, 5, 80, 40),
    ('decoration', 'bar', 'rectangle', 10, 90, 150, 80)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE public.floor_plan_items IS 'Stores floor plan items including tables with different shapes and decoration elements (plants, walls, bars, etc.)';
COMMENT ON COLUMN public.floor_plan_items.type IS 'Type of item: table or decoration';
COMMENT ON COLUMN public.floor_plan_items.shape IS 'Shape of the item: square, round, or rectangle';
COMMENT ON COLUMN public.floor_plan_items.decoration_type IS 'Type of decoration: plant, wall, bar, or entrance (only for decoration type)';
COMMENT ON COLUMN public.floor_plan_items.x IS 'Horizontal position as percentage (0-100)';
COMMENT ON COLUMN public.floor_plan_items.y IS 'Vertical position as percentage (0-100)';
COMMENT ON COLUMN public.floor_plan_items.width IS 'Width in pixels';
COMMENT ON COLUMN public.floor_plan_items.height IS 'Height in pixels';
