-- Insert default customer categories
-- Run this after 028_customer_loyalty_system.sql to create starter categories

-- Insert default categories (using INSERT ... ON CONFLICT to avoid duplicates)
INSERT INTO public.customer_categories (name, slug, description, color, price_modifier_type, discount_percentage, is_active)
VALUES
    (
        'Standard',
        'standard',
        'Client standard avec tarif de détail normal',
        '#6366f1',
        'retail',
        0,
        true
    ),
    (
        'VIP',
        'vip',
        'Clients VIP avec réductions spéciales',
        '#d946ef',
        'discount_percentage',
        10,
        true
    ),
    (
        'Wholesale',
        'wholesale',
        'Clients grossistes avec tarif de gros',
        '#10b981',
        'wholesale',
        0,
        true
    ),
    (
        'Staff',
        'staff',
        'Personnel de l''entreprise',
        '#f59e0b',
        'discount_percentage',
        20,
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    price_modifier_type = EXCLUDED.price_modifier_type,
    discount_percentage = EXCLUDED.discount_percentage,
    is_active = EXCLUDED.is_active,
    updated_at = now();

-- Set Standard as the default category
UPDATE public.customer_categories
SET is_default = true
WHERE slug = 'standard';

-- Verify the categories were created
SELECT
    id,
    name,
    slug,
    price_modifier_type,
    discount_percentage,
    is_active,
    is_default
FROM public.customer_categories
ORDER BY name;
