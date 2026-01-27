-- ============================================
-- Force populate product_sections with debug info
-- ============================================

-- First, let's see what we have
DO $$
DECLARE
    v_section_count INTEGER;
    v_product_count INTEGER;
    v_assoc_count INTEGER;
BEGIN
    -- Count production sections
    SELECT COUNT(*) INTO v_section_count
    FROM sections
    WHERE is_production_point = true;

    RAISE NOTICE 'Production sections found: %', v_section_count;

    -- Count eligible products
    SELECT COUNT(*) INTO v_product_count
    FROM products
    WHERE product_type IN ('finished', 'semi_finished')
      AND is_active = true;

    RAISE NOTICE 'Eligible products found: %', v_product_count;

    -- Count existing associations
    SELECT COUNT(*) INTO v_assoc_count
    FROM product_sections;

    RAISE NOTICE 'Existing associations: %', v_assoc_count;

    -- If no associations exist, create them
    IF v_assoc_count = 0 THEN
        RAISE NOTICE 'Creating associations...';

        INSERT INTO product_sections (product_id, section_id, is_primary)
        SELECT
            p.id,
            s.id,
            false
        FROM products p
        CROSS JOIN sections s
        WHERE p.product_type IN ('finished', 'semi_finished')
          AND p.is_active = true
          AND s.is_production_point = true
        ON CONFLICT (product_id, section_id) DO NOTHING;

        -- Count after insert
        SELECT COUNT(*) INTO v_assoc_count FROM product_sections;
        RAISE NOTICE 'Associations created: %', v_assoc_count;
    ELSE
        RAISE NOTICE 'Associations already exist, skipping population';
    END IF;
END $$;

-- Show some sample data
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Sample associations:';
    FOR r IN (
        SELECT
            p.name as product_name,
            s.name as section_name
        FROM product_sections ps
        JOIN products p ON p.id = ps.product_id
        JOIN sections s ON s.id = ps.section_id
        LIMIT 5
    ) LOOP
        RAISE NOTICE '  - % in %', r.product_name, r.section_name;
    END LOOP;
END $$;
