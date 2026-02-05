-- =====================================================
-- Migration: Add Company Settings
-- Story: 1-6-company-settings-ui
-- Date: 2026-02-05
-- =====================================================

-- Get the company category ID
DO $$
DECLARE
    company_category_id UUID;
BEGIN
    SELECT id INTO company_category_id FROM settings_categories WHERE code = 'company';

    IF company_category_id IS NULL THEN
        -- Create the category if it doesn't exist
        INSERT INTO settings_categories (code, name_fr, name_en, name_id, description_fr, description_en, description_id, icon, sort_order, required_permission)
        VALUES (
            'company',
            'Entreprise',
            'Company',
            'Perusahaan',
            'Informations de l''entreprise pour les tickets et rapports',
            'Company information for receipts and reports',
            'Informasi perusahaan untuk struk dan laporan',
            'Building2',
            10,
            'settings.view'
        )
        RETURNING id INTO company_category_id;
    END IF;

    -- Insert company settings if they don't exist
    INSERT INTO settings (category_id, key, value, value_type, name_fr, name_en, name_id, description_fr, description_en, description_id, default_value, sort_order)
    VALUES
        -- Company Name
        (company_category_id, 'company.name', '"The Breakery"', 'string',
         'Nom de l''entreprise', 'Company Name', 'Nama Perusahaan',
         'Nom commercial affiché sur les tickets', 'Trade name shown on receipts', 'Nama dagang yang ditampilkan di struk',
         '"The Breakery"', 10),

        -- Legal Name
        (company_category_id, 'company.legal_name', '""', 'string',
         'Raison sociale', 'Legal Name', 'Nama Hukum',
         'Nom légal de l''entreprise', 'Legal company name', 'Nama hukum perusahaan',
         '""', 20),

        -- NPWP (Indonesian Tax Number)
        (company_category_id, 'company.npwp', '""', 'string',
         'NPWP', 'Tax Number (NPWP)', 'NPWP',
         'Numéro d''identification fiscale indonésien (format: XX.XXX.XXX.X-XXX.XXX)', 'Indonesian tax identification number', 'Nomor Pokok Wajib Pajak',
         '""', 30),

        -- Address
        (company_category_id, 'company.address', '""', 'string',
         'Adresse', 'Address', 'Alamat',
         'Adresse complète de l''établissement', 'Full business address', 'Alamat lengkap tempat usaha',
         '""', 40),

        -- Phone
        (company_category_id, 'company.phone', '""', 'string',
         'Téléphone', 'Phone', 'Telepon',
         'Numéro de téléphone de contact', 'Contact phone number', 'Nomor telepon kontak',
         '""', 50),

        -- Email
        (company_category_id, 'company.email', '""', 'string',
         'Email', 'Email', 'Email',
         'Adresse email de contact', 'Contact email address', 'Alamat email kontak',
         '""', 60),

        -- Logo URL
        (company_category_id, 'company.logo_url', '""', 'string',
         'Logo', 'Logo', 'Logo',
         'URL du logo de l''entreprise (Supabase Storage)', 'Company logo URL (Supabase Storage)', 'URL logo perusahaan (Supabase Storage)',
         '""', 70)
    ON CONFLICT (key) DO NOTHING;
END $$;

-- =====================================================
-- Create storage bucket for company assets
-- =====================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'company-assets',
    'company-assets',
    true,  -- Public bucket for logo display
    2097152,  -- 2MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage.objects
-- Allow public to view company assets (logos are public)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Public can view company assets'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public can view company assets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'company-assets');
    END IF;
END $$;

-- Allow authenticated users to upload company assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Auth users can upload company assets'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Auth users can upload company assets"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'company-assets'
            AND auth.uid() IS NOT NULL
        );
    END IF;
END $$;

-- Allow authenticated users to update company assets (for upsert)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Auth users can update company assets'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Auth users can update company assets"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'company-assets'
            AND auth.uid() IS NOT NULL
        );
    END IF;
END $$;

-- Allow authenticated users to delete company assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Auth users can delete company assets'
        AND tablename = 'objects'
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Auth users can delete company assets"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'company-assets'
            AND auth.uid() IS NOT NULL
        );
    END IF;
END $$;
