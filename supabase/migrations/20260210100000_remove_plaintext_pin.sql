-- SEC-002: Remove plaintext PIN storage
-- 1. Clear all plaintext PIN values for security
UPDATE public.user_profiles SET pin_code = NULL WHERE pin_code IS NOT NULL;

-- 2. Modify set_user_pin() to stop storing plaintext PIN
CREATE OR REPLACE FUNCTION public.set_user_pin(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
    v_pin_hash TEXT;
BEGIN
    -- Validate PIN length (4-6 digits)
    IF p_pin IS NULL OR length(p_pin) < 4 OR length(p_pin) > 6 THEN
        RAISE EXCEPTION 'PIN must be 4-6 digits';
    END IF;

    -- Validate PIN is numeric
    IF p_pin !~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'PIN must contain only digits';
    END IF;

    -- Generate bcrypt hash using pgcrypto
    v_pin_hash := extensions.crypt(p_pin, extensions.gen_salt('bf', 10));

    -- Update user profile with ONLY the hash, no plaintext
    UPDATE public.user_profiles
    SET
        pin_hash = v_pin_hash,
        pin_code = NULL,  -- Never store plaintext
        updated_at = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    RETURN TRUE;
END;
$$;

-- 3. Modify verify_user_pin() to remove plaintext fallback
CREATE OR REPLACE FUNCTION public.verify_user_pin(p_user_id UUID, p_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
    v_pin_hash TEXT;
    v_is_active BOOLEAN;
BEGIN
    -- Get user's PIN hash and status
    SELECT pin_hash, is_active
    INTO v_pin_hash, v_is_active
    FROM public.user_profiles
    WHERE id = p_user_id;

    -- User not found
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- User not active
    IF NOT v_is_active THEN
        RETURN FALSE;
    END IF;

    -- PIN hash must exist
    IF v_pin_hash IS NULL OR v_pin_hash = '' THEN
        RETURN FALSE;
    END IF;

    -- Verify using bcrypt only (no plaintext fallback)
    RETURN v_pin_hash = extensions.crypt(p_pin, v_pin_hash);
END;
$$;
