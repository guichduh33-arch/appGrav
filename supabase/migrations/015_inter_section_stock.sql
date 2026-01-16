-- =====================================================
-- MIGRATION: Inter-Section Stock Management
-- Description: Adds support for tracking stock in specific sections (Baker, Pastry, etc.)
--             separate from the Main Warehouse (Master Stock).
-- =====================================================
-- 1. Create Storage Sections Table
CREATE TABLE IF NOT EXISTS storage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 2. Create Section Items Table (Stock per section)
CREATE TABLE IF NOT EXISTS section_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES storage_sections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, product_id)
);
-- 3. Enable RLS
ALTER TABLE storage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_items ENABLE ROW LEVEL SECURITY;
-- 4. RLS Policies (Allow all authenticated staff for now)
CREATE POLICY "Enable read access for authenticated users" ON storage_sections FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON section_items FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write access for authenticated users" ON section_items FOR ALL USING (auth.role() = 'authenticated');
-- 5. Seed Data
INSERT INTO storage_sections (name, slug, description)
VALUES (
        'Main Warehouse',
        'warehouse',
        'Central storage/Inventory'
    ),
    (
        'Baker Section',
        'baker',
        'Bread production area'
    ),
    (
        'Pastry Section',
        'pastry',
        'Pastry & Cake production'
    ),
    (
        'Hot Kitchen',
        'hot_kitchen',
        'Main kitchen for meals'
    ),
    (
        'Viennoiserie',
        'viennoiserie',
        'Croissant & laminated dough area'
    ),
    (
        'Cafe / Bar',
        'cafe',
        'Front of house bar and display'
    ) ON CONFLICT (slug) DO NOTHING;
-- 6. Indexes
CREATE INDEX idx_section_items_section ON section_items(section_id);
CREATE INDEX idx_section_items_product ON section_items(product_id);