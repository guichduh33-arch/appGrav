-- =====================================================
-- Migration: Fix Settings Functions Permission Checks
-- Date: 2026-02-12
-- Description: Adds user_has_permission('settings.update') checks
--   to SECURITY DEFINER settings functions that were missing them.
--   This prevents unprivileged users from modifying settings
--   by calling these RPC functions directly.
-- =====================================================

-- 1. update_setting - core function, add permission check
CREATE OR REPLACE FUNCTION update_setting(
    p_key VARCHAR,
    p_value JSONB,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_setting_id UUID;
    v_old_value JSONB;
BEGIN
    -- Permission check
    IF NOT public.user_has_permission(auth.uid(), 'settings.update') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    -- Check if setting exists
    SELECT id, value INTO v_setting_id, v_old_value
    FROM settings
    WHERE key = p_key
    FOR UPDATE;

    IF v_setting_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update the setting
    UPDATE settings
    SET
        value = p_value,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = v_setting_id;

    -- Record in history
    INSERT INTO settings_history (
        setting_id,
        old_value,
        new_value,
        changed_by,
        change_reason
    ) VALUES (
        v_setting_id,
        v_old_value,
        p_value,
        auth.uid(),
        p_reason
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. update_settings_bulk - add permission check at entry point
CREATE OR REPLACE FUNCTION update_settings_bulk(
    p_settings JSONB
)
RETURNS INTEGER AS $$
DECLARE
    v_key TEXT;
    v_value JSONB;
    v_count INTEGER := 0;
BEGIN
    -- Permission check
    IF NOT public.user_has_permission(auth.uid(), 'settings.update') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    FOR v_key, v_value IN SELECT * FROM jsonb_each(p_settings)
    LOOP
        IF update_setting(v_key, v_value) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. reset_setting - add permission check
CREATE OR REPLACE FUNCTION reset_setting(p_key VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_setting_id UUID;
    v_default_value JSONB;
BEGIN
    -- Permission check
    IF NOT public.user_has_permission(auth.uid(), 'settings.update') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    SELECT id, default_value INTO v_setting_id, v_default_value
    FROM settings
    WHERE key = p_key;

    IF v_setting_id IS NULL OR v_default_value IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN update_setting(p_key, v_default_value, 'Reset to default');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. reset_category_settings - add permission check
CREATE OR REPLACE FUNCTION reset_category_settings(p_category_code VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_key RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Permission check
    IF NOT public.user_has_permission(auth.uid(), 'settings.update') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    FOR v_key IN
        SELECT s.key
        FROM settings s
        JOIN settings_categories c ON s.category_id = c.id
        WHERE c.code = p_category_code
    LOOP
        IF reset_setting(v_key.key) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
