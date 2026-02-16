-- ============================================================================
-- Migration: Add POS modifier configuration to settings
-- Description: Move hardcoded MODIFIER_CONFIG from ModifierModal.tsx to database
-- Author: Claude Code
-- Date: 2026-02-16
-- ============================================================================

-- =============================================================================
-- UP MIGRATION
-- =============================================================================

-- Insert default modifier configurations as system settings
-- Using ON CONFLICT to make migration idempotent

INSERT INTO public.settings (key, value, category, description, is_system, created_at, updated_at)
VALUES
  (
    'modifier_group_coffee_temperature',
    '{
      "group_name": "Temperature",
      "group_type": "single",
      "group_required": true,
      "sort_order": 1,
      "options": [
        {"id": "hot", "label": "Hot", "price_adjustment": 0, "is_default": true, "sort_order": 1},
        {"id": "iced", "label": "Iced", "price_adjustment": 5000, "is_default": false, "sort_order": 2},
        {"id": "blended", "label": "Blended", "price_adjustment": 8000, "is_default": false, "sort_order": 3}
      ]
    }',
    'pos_modifiers',
    'Default coffee temperature options (Hot/Iced/Blended)',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_group_size',
    '{
      "group_name": "Size",
      "group_type": "single",
      "group_required": true,
      "sort_order": 2,
      "options": [
        {"id": "regular", "label": "Regular", "price_adjustment": 0, "is_default": true, "sort_order": 1},
        {"id": "large", "label": "Large", "price_adjustment": 10000, "is_default": false, "sort_order": 2}
      ]
    }',
    'pos_modifiers',
    'Default size options for beverages',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_group_milk',
    '{
      "group_name": "Milk Options",
      "group_type": "single",
      "group_required": false,
      "sort_order": 3,
      "options": [
        {"id": "regular_milk", "label": "Regular Milk", "price_adjustment": 0, "is_default": true, "sort_order": 1},
        {"id": "oat_milk", "label": "Oat Milk", "price_adjustment": 8000, "is_default": false, "sort_order": 2},
        {"id": "almond_milk", "label": "Almond Milk", "price_adjustment": 10000, "is_default": false, "sort_order": 3},
        {"id": "soy_milk", "label": "Soy Milk", "price_adjustment": 6000, "is_default": false, "sort_order": 4},
        {"id": "no_milk", "label": "No Milk", "price_adjustment": 0, "is_default": false, "sort_order": 5}
      ]
    }',
    'pos_modifiers',
    'Alternative milk options for beverages',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_group_extras',
    '{
      "group_name": "Extras",
      "group_type": "multiple",
      "group_required": false,
      "sort_order": 4,
      "options": [
        {"id": "extra_shot", "label": "Extra Shot", "price_adjustment": 8000, "sort_order": 1},
        {"id": "whipped_cream", "label": "Whipped Cream", "price_adjustment": 5000, "sort_order": 2},
        {"id": "caramel_drizzle", "label": "Caramel Drizzle", "price_adjustment": 5000, "sort_order": 3},
        {"id": "chocolate_sauce", "label": "Chocolate Sauce", "price_adjustment": 5000, "sort_order": 4},
        {"id": "vanilla_syrup", "label": "Vanilla Syrup", "price_adjustment": 5000, "sort_order": 5},
        {"id": "hazelnut_syrup", "label": "Hazelnut Syrup", "price_adjustment": 5000, "sort_order": 6}
      ]
    }',
    'pos_modifiers',
    'Add-on extras for beverages (multi-select)',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_group_sugar',
    '{
      "group_name": "Sugar Level",
      "group_type": "single",
      "group_required": false,
      "sort_order": 5,
      "options": [
        {"id": "normal_sugar", "label": "Normal Sugar", "price_adjustment": 0, "is_default": true, "sort_order": 1},
        {"id": "less_sugar", "label": "Less Sugar", "price_adjustment": 0, "is_default": false, "sort_order": 2},
        {"id": "no_sugar", "label": "No Sugar", "price_adjustment": 0, "is_default": false, "sort_order": 3},
        {"id": "extra_sugar", "label": "Extra Sugar", "price_adjustment": 0, "is_default": false, "sort_order": 4}
      ]
    }',
    'pos_modifiers',
    'Sugar level options (no price impact)',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_group_bakery_heating',
    '{
      "group_name": "Heating",
      "group_type": "single",
      "group_required": false,
      "sort_order": 1,
      "options": [
        {"id": "as_is", "label": "As Is", "price_adjustment": 0, "is_default": true, "sort_order": 1},
        {"id": "warmed", "label": "Warmed", "price_adjustment": 0, "is_default": false, "sort_order": 2},
        {"id": "toasted", "label": "Toasted", "price_adjustment": 0, "is_default": false, "sort_order": 3}
      ]
    }',
    'pos_modifiers',
    'Heating options for bakery items',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_group_sandwich_bread',
    '{
      "group_name": "Bread Type",
      "group_type": "single",
      "group_required": true,
      "sort_order": 1,
      "options": [
        {"id": "baguette", "label": "Baguette", "price_adjustment": 0, "is_default": true, "sort_order": 1},
        {"id": "ciabatta", "label": "Ciabatta", "price_adjustment": 5000, "is_default": false, "sort_order": 2},
        {"id": "sourdough", "label": "Sourdough", "price_adjustment": 8000, "is_default": false, "sort_order": 3},
        {"id": "croissant", "label": "Croissant", "price_adjustment": 10000, "is_default": false, "sort_order": 4}
      ]
    }',
    'pos_modifiers',
    'Bread options for sandwiches',
    true,
    NOW(),
    NOW()
  ),
  (
    'modifier_category_mapping',
    '{
      "coffee": ["modifier_group_coffee_temperature", "modifier_group_size", "modifier_group_milk", "modifier_group_extras", "modifier_group_sugar"],
      "beverage": ["modifier_group_size", "modifier_group_extras", "modifier_group_sugar"],
      "bakery": ["modifier_group_bakery_heating"],
      "sandwich": ["modifier_group_sandwich_bread", "modifier_group_bakery_heating"],
      "default": ["modifier_group_bakery_heating"]
    }',
    'pos_modifiers',
    'Maps product categories to applicable modifier groups',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =============================================================================
-- DOWN MIGRATION (Rollback)
-- =============================================================================
-- To rollback, run:
--
-- DELETE FROM public.settings
-- WHERE category = 'pos_modifiers'
--   AND key IN (
--     'modifier_group_coffee_temperature',
--     'modifier_group_size',
--     'modifier_group_milk',
--     'modifier_group_extras',
--     'modifier_group_sugar',
--     'modifier_group_bakery_heating',
--     'modifier_group_sandwich_bread',
--     'modifier_category_mapping'
--   );
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run after migration to verify:
--
-- SELECT key, category, description
-- FROM public.settings
-- WHERE category = 'pos_modifiers'
-- ORDER BY key;
--
-- Expected: 8 rows with modifier configurations
-- =============================================================================
