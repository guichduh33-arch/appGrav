-- Migration: 051_secure_pins_bcrypt.sql
-- Description: Secure all PINs with bcrypt hashing
-- This is a CRITICAL SECURITY fix - plaintext PINs must not be stored
-- Date: 2026-01-24

-- ============================================
-- STEP 1: Ensure pgcrypto extension is available
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 2: Migrate existing plaintext PINs to hashed PINs
-- Only for users who have pin_code but no pin_hash
-- ============================================
UPDATE public.user_profiles
SET pin_hash = extensions.crypt(pin_code, extensions.gen_salt('bf', 8))
WHERE pin_code IS NOT NULL
  AND pin_code != ''
  AND (pin_hash IS NULL OR pin_hash = '');

-- ============================================
-- STEP 3: Replace verify_manager_pin with secure bcrypt version
-- ============================================
DROP FUNCTION IF EXISTS public.verify_manager_pin(VARCHAR);

CREATE OR REPLACE FUNCTION public.verify_manager_pin(pin_input VARCHAR)
RETURNS TABLE (
    user_id UUID,
    user_name VARCHAR,
    is_valid BOOLEAN
) AS $$
DECLARE
    v_user RECORD;
BEGIN
    -- Find all active managers/admins with pin_hash set
    FOR v_user IN
        SELECT
            up.id,
            up.name,
            up.pin_hash,
            up.role
        FROM public.user_profiles up
        WHERE up.role IN ('admin', 'manager')
          AND up.is_active = TRUE
          AND up.pin_hash IS NOT NULL
          AND up.pin_hash != ''
    LOOP
        -- Check if PIN matches using bcrypt
        IF v_user.pin_hash = extensions.crypt(pin_input, v_user.pin_hash) THEN
            user_id := v_user.id;
            user_name := v_user.name;
            is_valid := TRUE;
            RETURN NEXT;
            RETURN; -- Return on first match
        END IF;
    END LOOP;

    -- No match found - return empty result
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_manager_pin IS 'Verify manager/admin PIN using bcrypt comparison (secure version)';

-- ============================================
-- STEP 4: Create secure function to set PIN (always hashes)
-- ============================================
CREATE OR REPLACE FUNCTION public.set_user_pin(
    p_user_id UUID,
    p_pin VARCHAR,
    p_updated_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_hashed_pin VARCHAR;
BEGIN
    -- Validate PIN format
    IF p_pin IS NULL OR LENGTH(p_pin) < 4 OR LENGTH(p_pin) > 6 THEN
        RAISE EXCEPTION 'PIN must be 4-6 digits';
    END IF;

    IF NOT p_pin ~ '^\d+$' THEN
        RAISE EXCEPTION 'PIN must contain only digits';
    END IF;

    -- Hash the PIN
    v_hashed_pin := extensions.crypt(p_pin, extensions.gen_salt('bf', 8));

    -- Update user profile with ONLY the hashed PIN
    -- NOTE: We no longer update pin_code to avoid plaintext storage
    UPDATE public.user_profiles
    SET
        pin_hash = v_hashed_pin,
        pin_code = NULL,  -- Clear plaintext PIN
        updated_by = COALESCE(p_updated_by, auth.uid()),
        updated_at = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.set_user_pin IS 'Securely set user PIN with bcrypt hashing, clears any plaintext PIN';

-- ============================================
-- STEP 5: Clear all plaintext PINs for users who have pin_hash
-- ============================================
UPDATE public.user_profiles
SET pin_code = NULL
WHERE pin_hash IS NOT NULL
  AND pin_hash != ''
  AND pin_code IS NOT NULL;

-- ============================================
-- STEP 6: Add constraint to prevent future plaintext PIN storage
-- (This can be enabled once all code is updated)
-- ============================================
-- Commented out for now - enable after verifying all code paths use bcrypt
-- ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS pin_code;

-- For now, add a trigger to warn about plaintext PIN usage
CREATE OR REPLACE FUNCTION public.warn_plaintext_pin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pin_code IS NOT NULL AND NEW.pin_code != '' THEN
        RAISE WARNING 'SECURITY: Plaintext PIN detected for user %. Use set_user_pin() function instead.', NEW.id;
        -- Auto-hash and clear plaintext
        NEW.pin_hash := extensions.crypt(NEW.pin_code, extensions.gen_salt('bf', 8));
        NEW.pin_code := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_warn_plaintext_pin ON public.user_profiles;
CREATE TRIGGER tr_warn_plaintext_pin
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.warn_plaintext_pin();

-- ============================================
-- VERIFICATION QUERY (for admin to run manually)
-- ============================================
-- Run this to verify no plaintext PINs remain:
-- SELECT id, name,
--        CASE WHEN pin_code IS NOT NULL THEN 'PLAINTEXT!' ELSE 'OK' END as pin_status,
--        CASE WHEN pin_hash IS NOT NULL THEN 'HASHED' ELSE 'MISSING' END as hash_status
-- FROM public.user_profiles
-- WHERE role IN ('admin', 'manager', 'cashier', 'barista')
-- ORDER BY name;
