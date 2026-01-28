


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."audit_severity" AS ENUM (
    'info',
    'warning',
    'critical'
);


ALTER TYPE "public"."audit_severity" OWNER TO "postgres";


CREATE TYPE "public"."customer_type" AS ENUM (
    'retail',
    'wholesale'
);


ALTER TYPE "public"."customer_type" OWNER TO "postgres";


CREATE TYPE "public"."discount_type" AS ENUM (
    'percentage',
    'fixed',
    'free'
);


ALTER TYPE "public"."discount_type" OWNER TO "postgres";


CREATE TYPE "public"."dispatch_station" AS ENUM (
    'barista',
    'kitchen',
    'display',
    'none'
);


ALTER TYPE "public"."dispatch_station" OWNER TO "postgres";


CREATE TYPE "public"."expense_type" AS ENUM (
    'cogs',
    'general'
);


ALTER TYPE "public"."expense_type" OWNER TO "postgres";


CREATE TYPE "public"."inventory_count_status" AS ENUM (
    'draft',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."inventory_count_status" OWNER TO "postgres";


CREATE TYPE "public"."item_status" AS ENUM (
    'new',
    'preparing',
    'ready',
    'served'
);


ALTER TYPE "public"."item_status" OWNER TO "postgres";


CREATE TYPE "public"."modifier_group_type" AS ENUM (
    'single',
    'multiple'
);


ALTER TYPE "public"."modifier_group_type" OWNER TO "postgres";


CREATE TYPE "public"."movement_type" AS ENUM (
    'purchase',
    'production_in',
    'production_out',
    'sale_pos',
    'sale_b2b',
    'adjustment_in',
    'adjustment_out',
    'waste',
    'transfer'
);


ALTER TYPE "public"."movement_type" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'new',
    'preparing',
    'ready',
    'served',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."order_type" AS ENUM (
    'dine_in',
    'takeaway',
    'delivery',
    'b2b'
);


ALTER TYPE "public"."order_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'cash',
    'card',
    'qris',
    'split',
    'transfer'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'unpaid',
    'partial',
    'paid'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_terms" AS ENUM (
    'cod',
    'net15',
    'net30',
    'net60'
);


ALTER TYPE "public"."payment_terms" OWNER TO "postgres";


CREATE TYPE "public"."po_status" AS ENUM (
    'draft',
    'sent',
    'partial',
    'received',
    'cancelled'
);


ALTER TYPE "public"."po_status" OWNER TO "postgres";


CREATE TYPE "public"."product_type" AS ENUM (
    'finished',
    'semi_finished',
    'raw_material'
);


ALTER TYPE "public"."product_type" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'open',
    'closed'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'manager',
    'cashier',
    'server',
    'barista',
    'kitchen',
    'backoffice'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_loyalty_points"("p_customer_id" "uuid", "p_order_id" "uuid", "p_order_amount" numeric, "p_created_by" "uuid" DEFAULT NULL::"uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_category_id UUID;
    v_points_per_amount NUMERIC(10,2);
    v_points_multiplier NUMERIC(5,2);
    v_tier_multiplier NUMERIC(5,2);
    v_loyalty_enabled BOOLEAN;
    v_current_points INTEGER;
    v_lifetime_points INTEGER;
    v_earned_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get customer info
    SELECT
        c.category_id,
        c.loyalty_points,
        c.lifetime_points,
        COALESCE(cc.loyalty_enabled, false),
        COALESCE(cc.points_per_amount, 1000),
        COALESCE(cc.points_multiplier, 1.0)
    INTO
        v_category_id,
        v_current_points,
        v_lifetime_points,
        v_loyalty_enabled,
        v_points_per_amount,
        v_points_multiplier
    FROM public.customers c
    LEFT JOIN public.customer_categories cc ON c.category_id = cc.id
    WHERE c.id = p_customer_id;

    -- Check if loyalty is enabled for this category
    IF NOT v_loyalty_enabled THEN
        RETURN 0;
    END IF;

    -- Get tier multiplier
    SELECT COALESCE(points_multiplier, 1.0) INTO v_tier_multiplier
    FROM public.loyalty_tiers
    WHERE slug = (SELECT loyalty_tier FROM public.customers WHERE id = p_customer_id)
    AND is_active = true;

    -- Calculate points
    v_earned_points := FLOOR(p_order_amount / v_points_per_amount * v_points_multiplier * COALESCE(v_tier_multiplier, 1.0));

    IF v_earned_points <= 0 THEN
        RETURN 0;
    END IF;

    v_new_balance := v_current_points + v_earned_points;

    -- Update customer points
    UPDATE public.customers
    SET
        loyalty_points = v_new_balance,
        lifetime_points = COALESCE(lifetime_points, 0) + v_earned_points,
        total_spent = COALESCE(total_spent, 0) + p_order_amount,
        total_visits = COALESCE(total_visits, 0) + 1,
        last_visit_at = now()
    WHERE id = p_customer_id;

    -- Log transaction
    INSERT INTO public.loyalty_transactions (
        customer_id, order_id, transaction_type, points, points_balance_after,
        order_amount, points_rate, multiplier, description, created_by
    ) VALUES (
        p_customer_id, p_order_id, 'earn', v_earned_points, v_new_balance,
        p_order_amount, v_points_per_amount, v_points_multiplier * COALESCE(v_tier_multiplier, 1.0),
        'Points gagnés sur commande', p_created_by
    );

    RETURN v_earned_points;
END;
$$;


ALTER FUNCTION "public"."add_loyalty_points"("p_customer_id" "uuid", "p_order_id" "uuid", "p_order_amount" numeric, "p_created_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."add_loyalty_points"("p_customer_id" "uuid", "p_order_id" "uuid", "p_order_amount" numeric, "p_created_by" "uuid") IS 'Add loyalty points to a customer based on order amount';



CREATE OR REPLACE FUNCTION "public"."add_stock_on_purchase"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
    v_qty_change DECIMAL;
BEGIN
    -- Only process if quantity_received increased
    v_qty_change := COALESCE(NEW.quantity_received, 0) - COALESCE(OLD.quantity_received, 0);

    IF v_qty_change <= 0 THEN
        RETURN NEW;
    END IF;

    -- Get current stock
    SELECT COALESCE(current_stock, 0) INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id;

    -- Generate movement ID
    v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

    -- Create stock movement
    INSERT INTO public.stock_movements (
        movement_id,
        product_id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        unit_cost,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
    VALUES (
        v_movement_id,
        NEW.product_id,
        'purchase',
        v_qty_change,
        v_current_stock,
        v_current_stock + v_qty_change,
        NEW.unit_price,
        'purchase_order',
        NEW.po_id,
        'Purchase order receipt',
        auth.uid()
    );

    -- Update product stock
    UPDATE public.products
    SET current_stock = v_current_stock + v_qty_change,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."add_stock_on_purchase"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."apply_settings_profile"("p_profile_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_settings JSONB;
    v_key TEXT;
    v_value JSONB;
    v_count INTEGER := 0;
BEGIN
    -- Get profile settings
    SELECT settings_snapshot INTO v_settings
    FROM public.settings_profiles
    WHERE id = p_profile_id;

    IF v_settings IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- Apply each setting
    FOR v_key, v_value IN SELECT * FROM jsonb_each(v_settings)
    LOOP
        UPDATE public.settings
        SET value = v_value, updated_at = NOW(), updated_by = auth.uid()
        WHERE key = v_key AND is_system = false AND is_readonly = false;

        IF FOUND THEN v_count := v_count + 1; END IF;
    END LOOP;

    RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."apply_settings_profile"("p_profile_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."apply_settings_profile"("p_profile_id" "uuid") IS 'Apply a saved profile to current settings';



CREATE OR REPLACE FUNCTION "public"."audit_trigger_function"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Try to get current user ID (from session or auth)
    v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, new_values
        ) VALUES (
            v_user_id,
            'CREATE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, old_values, new_values
        ) VALUES (
            v_user_id,
            'UPDATE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            user_id, action, module, entity_type, entity_id, old_values
        ) VALUES (
            v_user_id,
            'DELETE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."audit_trigger_function"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_combo_total_price"("p_combo_id" "uuid", "p_selected_items" "uuid"[]) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_base_price NUMERIC;
    v_adjustments_total NUMERIC;
BEGIN
    -- Get base combo price
    SELECT combo_price INTO v_base_price
    FROM product_combos
    WHERE id = p_combo_id;

    -- Calculate total price adjustments from selected items
    SELECT COALESCE(SUM(price_adjustment), 0) INTO v_adjustments_total
    FROM product_combo_group_items
    WHERE id = ANY(p_selected_items);

    RETURN v_base_price + v_adjustments_total;
END;
$$;


ALTER FUNCTION "public"."calculate_combo_total_price"("p_combo_id" "uuid", "p_selected_items" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_loyalty_points"("order_total" numeric) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE points_rate INTEGER;
BEGIN
SELECT (value::TEXT)::INTEGER INTO points_rate
FROM app_settings
WHERE key = 'loyalty_points_rate';
IF points_rate IS NULL
OR points_rate = 0 THEN points_rate := 1000;
END IF;
RETURN FLOOR(order_total / points_rate);
END;
$$;


ALTER FUNCTION "public"."calculate_loyalty_points"("order_total" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_order_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    calc_subtotal DECIMAL(12, 2);
    calc_tax DECIMAL(12, 2);
    calc_discount DECIMAL(12, 2);
    calc_total DECIMAL(12, 2);
BEGIN
    -- 1. Calculate subtotal from items (Total price is already inclusive of tax as per PRD)
    SELECT COALESCE(SUM(total_price + COALESCE(modifiers_total, 0)), 0)
    INTO calc_subtotal
    FROM order_items
    WHERE order_id = NEW.id;

    -- 2. Calculate discount
    IF NEW.discount_type = 'percentage' THEN
        calc_discount := calc_subtotal * (COALESCE(NEW.discount_value, 0) / 100);
    ELSIF NEW.discount_type = 'fixed' THEN
        calc_discount := COALESCE(NEW.discount_value, 0);
    ELSE
        calc_discount := 0;
    END IF;

    -- Add points discount
    calc_discount := calc_discount + COALESCE(NEW.points_discount, 0);

    -- 3. Calculate final total (before rounding)
    calc_total := calc_subtotal - calc_discount;

    -- 4. Apply Rounding (Nearest 100 IDR as per PRD)
    calc_total := ROUND(calc_total / 100.0) * 100.0;

    -- 5. Calculate Tax component from total (10% included: Tax = Total * 10 / 110)
    calc_tax := (calc_total * 10) / 110;

    -- Update totals in the record
    NEW.subtotal := calc_subtotal;
    NEW.discount_amount := calc_discount;
    NEW.tax_amount := calc_tax;
    NEW.total := calc_total;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_order_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_backoffice"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager', 'backoffice');
END;
$$;


ALTER FUNCTION "public"."can_access_backoffice"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_kds"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager', 'barista', 'kitchen');
END;
$$;


ALTER FUNCTION "public"."can_access_kds"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_pos"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager', 'cashier', 'server');
END;
$$;


ALTER FUNCTION "public"."can_access_pos"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."capture_daily_stock_snapshot"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE new_snapshot_id UUID;
v_total_items INTEGER;
v_total_cost DECIMAL(15, 2);
v_total_retail DECIMAL(15, 2);
v_low_stock INTEGER;
v_out_stock INTEGER;
BEGIN -- Calculate aggregates
SELECT COUNT(*),
    COALESCE(SUM(current_stock * cost_price), 0),
    COALESCE(SUM(current_stock * retail_price), 0),
    COUNT(*) FILTER (
        WHERE current_stock <= min_stock_level
            AND current_stock > 0
    ),
    COUNT(*) FILTER (
        WHERE current_stock <= 0
    ) INTO v_total_items,
    v_total_cost,
    v_total_retail,
    v_low_stock,
    v_out_stock
FROM products
WHERE is_active = TRUE;
INSERT INTO reporting_stock_snapshots (
        snapshot_date,
        total_items_count,
        total_value_cost,
        total_value_retail,
        low_stock_count,
        out_of_stock_count
    )
VALUES (
        CURRENT_DATE,
        v_total_items,
        v_total_cost,
        v_total_retail,
        v_low_stock,
        v_out_stock
    ) ON CONFLICT (snapshot_date) DO
UPDATE
SET total_items_count = EXCLUDED.total_items_count,
    total_value_cost = EXCLUDED.total_value_cost,
    total_value_retail = EXCLUDED.total_value_retail,
    low_stock_count = EXCLUDED.low_stock_count,
    out_of_stock_count = EXCLUDED.out_of_stock_count,
    created_at = NOW()
RETURNING id INTO new_snapshot_id;
RETURN new_snapshot_id;
END;
$$;


ALTER FUNCTION "public"."capture_daily_stock_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_discount_anomaly"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Alert if discount > 20%
    IF NEW.discount_type = 'percentage' AND NEW.discount_value > 20 THEN
        PERFORM public.create_anomaly_alert(
            'high_discount',
            'warning',
            'Remise élevée détectée',
            format('Commande %s avec remise de %s%%', NEW.order_number, NEW.discount_value::TEXT),
            'order',
            NEW.id
        );
    END IF;

    -- Alert if discount > 50%
    IF NEW.discount_type = 'percentage' AND NEW.discount_value > 50 THEN
        PERFORM public.create_anomaly_alert(
            'excessive_discount',
            'critical',
            'Remise excessive détectée',
            format('Commande %s avec remise de %s%%', NEW.order_number, NEW.discount_value::TEXT),
            'order',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_discount_anomaly"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_promotion_validity"("p_promotion_id" "uuid", "p_customer_id" "uuid" DEFAULT NULL::"uuid", "p_purchase_amount" numeric DEFAULT 0) RETURNS TABLE("is_valid" boolean, "reason" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_promotion RECORD;
    v_current_time TIME;
    v_current_day INTEGER;
    v_customer_uses INTEGER;
BEGIN
    -- Get promotion details
    SELECT * INTO v_promotion
    FROM promotions
    WHERE id = p_promotion_id;

    -- Check if promotion exists and is active
    IF NOT FOUND OR NOT v_promotion.is_active THEN
        RETURN QUERY SELECT false, 'Promotion not found or inactive';
        RETURN;
    END IF;

    -- Check date range
    IF v_promotion.start_date IS NOT NULL AND NOW() < v_promotion.start_date THEN
        RETURN QUERY SELECT false, 'Promotion not yet started';
        RETURN;
    END IF;

    IF v_promotion.end_date IS NOT NULL AND NOW() > v_promotion.end_date THEN
        RETURN QUERY SELECT false, 'Promotion expired';
        RETURN;
    END IF;

    -- Check day of week
    IF v_promotion.days_of_week IS NOT NULL THEN
        v_current_day := EXTRACT(DOW FROM NOW())::INTEGER;
        IF NOT (v_current_day = ANY(v_promotion.days_of_week)) THEN
            RETURN QUERY SELECT false, 'Promotion not valid on this day';
            RETURN;
        END IF;
    END IF;

    -- Check time range
    IF v_promotion.time_start IS NOT NULL AND v_promotion.time_end IS NOT NULL THEN
        v_current_time := NOW()::TIME;
        IF v_current_time < v_promotion.time_start OR v_current_time > v_promotion.time_end THEN
            RETURN QUERY SELECT false, 'Promotion not valid at this time';
            RETURN;
        END IF;
    END IF;

    -- Check minimum purchase amount
    IF v_promotion.min_purchase_amount IS NOT NULL AND p_purchase_amount < v_promotion.min_purchase_amount THEN
        RETURN QUERY SELECT false, 'Minimum purchase amount not met';
        RETURN;
    END IF;

    -- Check total usage limit
    IF v_promotion.max_uses_total IS NOT NULL AND v_promotion.current_uses >= v_promotion.max_uses_total THEN
        RETURN QUERY SELECT false, 'Promotion usage limit reached';
        RETURN;
    END IF;

    -- Check per-customer usage limit
    IF p_customer_id IS NOT NULL AND v_promotion.max_uses_per_customer IS NOT NULL THEN
        SELECT COUNT(*) INTO v_customer_uses
        FROM promotion_usage
        WHERE promotion_id = p_promotion_id AND customer_id = p_customer_id;

        IF v_customer_uses >= v_promotion.max_uses_per_customer THEN
            RETURN QUERY SELECT false, 'Customer usage limit reached';
            RETURN;
        END IF;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT true, 'Valid'::TEXT;
END;
$$;


ALTER FUNCTION "public"."check_promotion_validity"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_purchase_amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_reporting_access"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE user_p RECORD;
BEGIN
SELECT role,
    can_access_reports INTO user_p
FROM user_profiles
WHERE auth_user_id = auth.uid();
IF user_p.role IN ('admin', 'manager')
OR user_p.can_access_reports THEN RETURN TRUE;
END IF;
RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."check_reporting_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_stock_alert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE product_record RECORD;
BEGIN
SELECT id,
    name,
    current_stock,
    min_stock_level INTO product_record
FROM products
WHERE id = NEW.product_id;
IF product_record.current_stock < product_record.min_stock_level THEN
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        new_value
    )
VALUES (
        'stock_low_alert',
        'warning',
        'product',
        product_record.id,
        jsonb_build_object(
            'product_name',
            product_record.name,
            'current_stock',
            product_record.current_stock,
            'min_level',
            product_record.min_stock_level
        )
    );
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_stock_alert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_closing_cash" numeric DEFAULT 0, "p_counted_cash" numeric DEFAULT 0, "p_notes" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.pos_sessions
    SET status = 'closed',
        closed_at = NOW(),
        closing_cash = p_closing_cash,
        counted_cash = p_counted_cash,
        notes = COALESCE(p_notes, notes)
    WHERE id = p_session_id
      AND status = 'open';

    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_closing_cash" numeric, "p_counted_cash" numeric, "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_actual_cash" numeric, "p_actual_qris" numeric, "p_actual_edc" numeric, "p_closed_by" "uuid", "p_notes" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_session pos_sessions%ROWTYPE;
    v_expected_cash DECIMAL;
    v_expected_qris DECIMAL;
    v_expected_edc DECIMAL;
    v_total_sales DECIMAL;
    v_transaction_count INTEGER;
BEGIN
    -- Get session
    SELECT * INTO v_session FROM pos_sessions WHERE id = p_session_id;

    IF v_session IS NULL THEN
        RAISE EXCEPTION 'Session not found';
    END IF;

    IF v_session.status != 'open' THEN
        RAISE EXCEPTION 'Session is not open';
    END IF;

    -- Calculate expected amounts from orders during this shift
    SELECT
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_method = 'qris' THEN total_amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN payment_method IN ('card', 'edc') THEN total_amount ELSE 0 END), 0),
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO v_expected_cash, v_expected_qris, v_expected_edc, v_total_sales, v_transaction_count
    FROM orders
    WHERE created_at >= v_session.opened_at
      AND created_at <= NOW()
      AND status = 'completed';

    -- Add opening cash to expected cash
    v_expected_cash := v_expected_cash + v_session.opening_cash;

    -- Update session with closing data
    UPDATE pos_sessions SET
        status = 'closed',
        closed_at = NOW(),
        expected_cash = v_expected_cash,
        expected_qris = v_expected_qris,
        expected_edc = v_expected_edc,
        actual_cash = p_actual_cash,
        actual_qris = p_actual_qris,
        actual_edc = p_actual_edc,
        cash_difference = p_actual_cash - v_expected_cash,
        qris_difference = p_actual_qris - v_expected_qris,
        edc_difference = p_actual_edc - v_expected_edc,
        total_sales = v_total_sales,
        transaction_count = v_transaction_count,
        closed_by = p_closed_by,
        notes = COALESCE(p_notes, v_session.notes),
        updated_at = NOW()
    WHERE id = p_session_id;

    -- Return reconciliation data
    RETURN jsonb_build_object(
        'session_id', p_session_id,
        'status', 'closed',
        'total_sales', v_total_sales,
        'transaction_count', v_transaction_count,
        'reconciliation', jsonb_build_object(
            'cash', jsonb_build_object(
                'expected', v_expected_cash,
                'actual', p_actual_cash,
                'difference', p_actual_cash - v_expected_cash
            ),
            'qris', jsonb_build_object(
                'expected', v_expected_qris,
                'actual', p_actual_qris,
                'difference', p_actual_qris - v_expected_qris
            ),
            'edc', jsonb_build_object(
                'expected', v_expected_edc,
                'actual', p_actual_edc,
                'difference', p_actual_edc - v_expected_edc
            )
        )
    );
END;
$$;


ALTER FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_actual_cash" numeric, "p_actual_qris" numeric, "p_actual_edc" numeric, "p_closed_by" "uuid", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_anomaly_alert"("p_alert_type" character varying, "p_severity" character varying, "p_title" character varying, "p_description" "text" DEFAULT NULL::"text", "p_reference_type" character varying DEFAULT NULL::character varying, "p_reference_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO public.system_alerts (
        alert_type,
        severity,
        title,
        description,
        reference_type,
        reference_id
    )
    VALUES (
        p_alert_type,
        p_severity,
        p_title,
        p_description,
        p_reference_type,
        p_reference_id
    )
    RETURNING id INTO v_alert_id;

    RETURN v_alert_id;
END;
$$;


ALTER FUNCTION "public"."create_anomaly_alert"("p_alert_type" character varying, "p_severity" character varying, "p_title" character varying, "p_description" "text", "p_reference_type" character varying, "p_reference_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_settings_profile"("p_name" character varying, "p_description" "text", "p_type" character varying DEFAULT 'custom'::character varying) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_profile_id UUID;
    v_settings JSONB;
BEGIN
    -- Capture current settings
    SELECT jsonb_object_agg(key, value)
    INTO v_settings
    FROM public.settings
    WHERE is_system = false;

    -- Create profile
    INSERT INTO public.settings_profiles (name, description, profile_type, settings_snapshot, created_by)
    VALUES (p_name, p_description, p_type, v_settings, auth.uid())
    RETURNING id INTO v_profile_id;

    RETURN v_profile_id;
END;
$$;


ALTER FUNCTION "public"."create_settings_profile"("p_name" character varying, "p_description" "text", "p_type" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_settings_profile"("p_name" character varying, "p_description" "text", "p_type" character varying) IS 'Create a profile from current settings';



CREATE OR REPLACE FUNCTION "public"."create_stock_movements_on_receive"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only create movements when status changes to 'received'
    IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
        -- Create stock movements for each item
        INSERT INTO public.stock_movements (
            movement_id,
            product_id,
            movement_type,
            quantity,
            unit_cost,
            stock_before,
            stock_after,
            from_location_id,
            to_location_id,
            unit,
            total_cost,
            reference_type,
            reference_id,
            reference_number,
            notes,
            created_by,
            created_by_name
        )
        SELECT
            'TRF-' || NEW.transfer_number || '-' || ti.product_id::text,
            ti.product_id,
            'transfer'::movement_type,
            ti.quantity_received,
            ti.unit_cost,
            COALESCE((SELECT current_stock FROM products WHERE id = ti.product_id), 0),
            COALESCE((SELECT current_stock FROM products WHERE id = ti.product_id), 0) + ti.quantity_received,
            NEW.from_location_id,
            NEW.to_location_id,
            ti.unit,
            ti.line_total,
            'transfer',
            NEW.id,
            NEW.transfer_number,
            'Transfert interne: ' ||
                (SELECT name FROM public.stock_locations WHERE id = NEW.from_location_id) ||
                ' → ' ||
                (SELECT name FROM public.stock_locations WHERE id = NEW.to_location_id),
            NEW.received_by,
            NEW.received_by_name
        FROM public.transfer_items ti
        WHERE ti.transfer_id = NEW.id
        AND ti.quantity_received > 0
        ON CONFLICT (movement_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_stock_movements_on_receive"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_production_ingredients"("p_production_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_product_id UUID;
    v_quantity DECIMAL;
    v_recipe RECORD;
    v_material_stock DECIMAL;
    v_product_stock DECIMAL;
BEGIN
    -- Get production record details
    SELECT product_id, quantity_produced
    INTO v_product_id, v_quantity
    FROM public.production_records
    WHERE id = p_production_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Production record not found';
    END IF;

    -- Deduct each material based on recipe
    FOR v_recipe IN
        SELECT r.material_id, r.quantity as quantity_needed, p.name as material_name
        FROM public.recipes r
        JOIN public.products p ON p.id = r.material_id
        WHERE r.product_id = v_product_id
          AND r.is_active = TRUE
    LOOP
        -- Get current stock before deduction
        SELECT COALESCE(current_stock, 0) INTO v_material_stock
        FROM public.products
        WHERE id = v_recipe.material_id;

        -- Create stock movement for deduction
        -- Generate short movement ID: MV-{timestamp}-{random}
        INSERT INTO public.stock_movements (
            movement_id,
            product_id,
            movement_type,
            quantity,
            stock_before,
            stock_after,
            reference_type,
            reference_id,
            reason,
            staff_id
        )
        VALUES (
            'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4),
            v_recipe.material_id,
            'production_out',
            -(v_recipe.quantity_needed * v_quantity),
            v_material_stock,
            v_material_stock - (v_recipe.quantity_needed * v_quantity),
            'production',
            p_production_id,
            'Déduction automatique pour production',
            auth.uid()
        );

        -- Update product stock
        UPDATE public.products
        SET current_stock = COALESCE(current_stock, 0) - (v_recipe.quantity_needed * v_quantity),
            updated_at = NOW()
        WHERE id = v_recipe.material_id;
    END LOOP;

    -- Also increase stock of produced item
    SELECT COALESCE(current_stock, 0) INTO v_product_stock
    FROM public.products
    WHERE id = v_product_id;

    INSERT INTO public.stock_movements (
        movement_id,
        product_id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
    VALUES (
        'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4),
        v_product_id,
        'production_in',
        v_quantity,
        v_product_stock,
        v_product_stock + v_quantity,
        'production',
        p_production_id,
        'Production enregistrée',
        auth.uid()
    );

    UPDATE public.products
    SET current_stock = COALESCE(current_stock, 0) + v_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."deduct_production_ingredients"("p_production_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_stock_from_order"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE item_record RECORD;
BEGIN IF (
    OLD.payment_status != 'paid'
    AND NEW.payment_status = 'paid'
) THEN FOR item_record IN
SELECT oi.id,
    oi.product_id,
    oi.quantity,
    p.name
FROM order_items oi
    JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = NEW.id
    AND oi.product_id IS NOT NULL LOOP
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        item_record.product_id,
        'sale_pos',
        item_record.quantity,
        'order',
        NEW.id,
        'POS Sale #' || NEW.order_number,
        NEW.staff_id
    );
END LOOP;
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."deduct_stock_from_order"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_stock_on_sale"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
    v_order_type VARCHAR(20);
    v_deduct_ingredients BOOLEAN;
    v_recipe RECORD;
    v_material_stock DECIMAL;
    v_sale_movement_type movement_type;
    v_variant_material RECORD;
    v_has_variant_materials BOOLEAN := FALSE;
BEGIN
    -- Get order type and product settings
    SELECT order_type INTO v_order_type
    FROM public.orders
    WHERE id = NEW.order_id;

    SELECT deduct_ingredients_on_sale INTO v_deduct_ingredients
    FROM public.products
    WHERE id = NEW.product_id;

    -- Determine sale movement type
    v_sale_movement_type := CASE
        WHEN v_order_type = 'b2b' THEN 'sale_b2b'::movement_type
        ELSE 'sale_pos'::movement_type
    END;

    IF NOT v_deduct_ingredients THEN
        -- Produit pré-fabriqué : déduire le produit fini du stock
        SELECT COALESCE(current_stock, 0) INTO v_current_stock
        FROM public.products
        WHERE id = NEW.product_id;

        v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

        INSERT INTO public.stock_movements (
            movement_id,
            product_id,
            movement_type,
            quantity,
            stock_before,
            stock_after,
            reference_type,
            reference_id,
            reason,
            staff_id
        )
        VALUES (
            v_movement_id,
            NEW.product_id,
            v_sale_movement_type,
            -NEW.quantity,
            v_current_stock,
            v_current_stock - NEW.quantity,
            'order',
            NEW.order_id,
            'Sale of pre-made product',
            auth.uid()
        );

        UPDATE public.products
        SET current_stock = v_current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
    ELSE
        -- Produit fait à la demande : déduire SEULEMENT les ingrédients

        -- Check if variants with materials are selected
        IF NEW.selected_variants IS NOT NULL AND jsonb_array_length((NEW.selected_variants->'variants')::jsonb) > 0 THEN
            -- Loop through variants to find materials
            FOR v_variant_material IN
                SELECT
                    (material->>'materialId')::UUID as material_id,
                    (material->>'quantity')::DECIMAL as quantity_needed
                FROM jsonb_array_elements(NEW.selected_variants->'variants') AS variant,
                     jsonb_array_elements(variant->'materials') AS material
                WHERE material->>'materialId' IS NOT NULL
            LOOP
                v_has_variant_materials := TRUE;

                -- Get current material stock
                SELECT COALESCE(current_stock, 0) INTO v_material_stock
                FROM public.products
                WHERE id = v_variant_material.material_id;

                -- Generate movement ID for material
                v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

                -- Create stock movement for variant material deduction
                INSERT INTO public.stock_movements (
                    movement_id,
                    product_id,
                    movement_type,
                    quantity,
                    stock_before,
                    stock_after,
                    reference_type,
                    reference_id,
                    reason,
                    staff_id
                )
                VALUES (
                    v_movement_id,
                    v_variant_material.material_id,
                    v_sale_movement_type,
                    -(v_variant_material.quantity_needed * NEW.quantity),
                    v_material_stock,
                    v_material_stock - (v_variant_material.quantity_needed * NEW.quantity),
                    'order',
                    NEW.order_id,
                    'Variant ingredient for made-to-order sale',
                    auth.uid()
                );

                -- Update material stock
                UPDATE public.products
                SET current_stock = v_material_stock - (v_variant_material.quantity_needed * NEW.quantity),
                    updated_at = NOW()
                WHERE id = v_variant_material.material_id;
            END LOOP;
        END IF;

        -- If no variant materials found, fall back to recipe ingredients
        IF NOT v_has_variant_materials THEN
            FOR v_recipe IN
                SELECT r.material_id, r.quantity as quantity_needed
                FROM public.recipes r
                WHERE r.product_id = NEW.product_id
                  AND r.is_active = TRUE
            LOOP
                -- Get current material stock
                SELECT COALESCE(current_stock, 0) INTO v_material_stock
                FROM public.products
                WHERE id = v_recipe.material_id;

                -- Generate movement ID for material
                v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

                -- Create stock movement for material deduction
                INSERT INTO public.stock_movements (
                    movement_id,
                    product_id,
                    movement_type,
                    quantity,
                    stock_before,
                    stock_after,
                    reference_type,
                    reference_id,
                    reason,
                    staff_id
                )
                VALUES (
                    v_movement_id,
                    v_recipe.material_id,
                    v_sale_movement_type,
                    -(v_recipe.quantity_needed * NEW.quantity),
                    v_material_stock,
                    v_material_stock - (v_recipe.quantity_needed * NEW.quantity),
                    'order',
                    NEW.order_id,
                    'Ingredient for made-to-order sale',
                    auth.uid()
                );

                -- Update material stock
                UPDATE public.products
                SET current_stock = v_material_stock - (v_recipe.quantity_needed * NEW.quantity),
                    updated_at = NOW()
                WHERE id = v_recipe.material_id;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."deduct_stock_on_sale"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_primary_role"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.is_primary = true THEN
        UPDATE public.user_roles
        SET is_primary = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_primary = true;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_primary_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."export_settings"() RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'exported_at', NOW(),
        'version', '1.0',
        'settings', (
            SELECT jsonb_object_agg(key, value)
            FROM public.settings
            WHERE is_system = false AND is_sensitive = false
        ),
        'tax_rates', (
            SELECT jsonb_agg(to_jsonb(t) - 'id' - 'created_at' - 'updated_at')
            FROM public.tax_rates t WHERE is_active = true
        ),
        'payment_methods', (
            SELECT jsonb_agg(to_jsonb(p) - 'id' - 'created_at' - 'updated_at')
            FROM public.payment_methods p WHERE is_active = true
        ),
        'business_hours', (
            SELECT jsonb_agg(to_jsonb(b) - 'id' - 'created_at' - 'updated_at')
            FROM public.business_hours b
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."export_settings"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."export_settings"() IS 'Export all settings as JSON';



CREATE OR REPLACE FUNCTION "public"."finalize_inventory_count"("count_uuid" "uuid", "user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    count_record RECORD;
    item_record RECORD;
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
BEGIN
    -- Get and validate count session
    SELECT * INTO count_record
    FROM inventory_counts
    WHERE id = count_uuid;

    IF count_record IS NULL THEN
        RAISE EXCEPTION 'Inventory count not found';
    END IF;

    IF count_record.status != 'draft' THEN
        RAISE EXCEPTION 'Inventory count is not in draft status';
    END IF;

    -- Iterate items with variance
    FOR item_record IN
        SELECT *
        FROM inventory_count_items
        WHERE inventory_count_id = count_uuid
          AND actual_stock IS NOT NULL
          AND variance != 0
    LOOP
        -- Get current stock
        SELECT COALESCE(current_stock, 0) INTO v_current_stock
        FROM public.products
        WHERE id = item_record.product_id;

        -- Generate movement ID
        v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

        -- Create stock movement for adjustment
        INSERT INTO stock_movements (
            movement_id,
            product_id,
            movement_type,
            quantity,
            stock_before,
            stock_after,
            reference_type,
            reference_id,
            reason,
            staff_id
        )
        VALUES (
            v_movement_id,
            item_record.product_id,
            CASE
                WHEN item_record.variance > 0 THEN 'adjustment_in'
                ELSE 'adjustment_out'
            END,
            item_record.variance,
            v_current_stock,
            v_current_stock + item_record.variance,
            'inventory_count',
            count_uuid,
            'Stock Opname ' || count_record.count_number,
            user_uuid
        );

        -- Update product stock
        UPDATE public.products
        SET current_stock = v_current_stock + item_record.variance,
            updated_at = NOW()
        WHERE id = item_record.product_id;
    END LOOP;

    -- Update status
    UPDATE inventory_counts
    SET status = 'completed',
        completed_at = NOW(),
        completed_by = user_uuid,
        updated_at = NOW()
    WHERE id = count_uuid;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."finalize_inventory_count"("count_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_audit_product_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE v_user_id UUID;
v_diffs JSONB;
BEGIN -- Try to get user ID from Supabase auth (if available) or fallback
BEGIN v_user_id := auth.uid();
EXCEPTION
WHEN OTHERS THEN v_user_id := NULL;
END;
v_diffs := '{}'::jsonb;
IF OLD.retail_price IS DISTINCT
FROM NEW.retail_price THEN v_diffs := v_diffs || jsonb_build_object(
        'retail_price',
        jsonb_build_object('old', OLD.retail_price, 'new', NEW.retail_price)
    );
END IF;
IF OLD.cost_price IS DISTINCT
FROM NEW.cost_price THEN v_diffs := v_diffs || jsonb_build_object(
        'cost_price',
        jsonb_build_object('old', OLD.cost_price, 'new', NEW.cost_price)
    );
END IF;
IF v_diffs != '{}'::jsonb THEN
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        old_value,
        new_value,
        reason,
        user_id,
        created_at
    )
VALUES (
        'UPDATE',
        'warning',
        -- Price changes are sensitive
        'product',
        NEW.id,
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb,
        'Auto-detected Product Change: ' || v_diffs::text,
        v_user_id,
        NOW()
    );
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_audit_product_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_create_movements_on_order_complete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  DECLARE
      item RECORD;
  BEGIN
      IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN    
          FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
              INSERT INTO stock_movements (
                  product_id,
                  movement_type,
                  quantity,
                  reference_type,
                  reference_id,
                  reason,
                  staff_id
              ) VALUES (
                  item.product_id,
                  'sale_pos',
                  -item.quantity,
                  'order',
                  NEW.id::uuid,
                  'POS Order: ' || NEW.order_number,
                  NEW.staff_id
              );
          END LOOP;
      END IF;
      RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."fn_create_movements_on_order_complete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_b2b_delivery_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    year_month := to_char(NOW(), 'YYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(delivery_number FROM 'DEL-' || year_month || '-(\d+)') AS INT)
    ), 0) + 1
    INTO sequence_num
    FROM public.b2b_deliveries
    WHERE delivery_number LIKE 'DEL-' || year_month || '-%';

    NEW.delivery_number := 'DEL-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_b2b_delivery_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_b2b_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        year_month := to_char(NOW(), 'YYMM');

        SELECT COALESCE(MAX(
            CASE
                WHEN order_number ~ ('^B2B-' || year_month || '-\d+$')
                THEN CAST(SUBSTRING(order_number FROM 'B2B-' || year_month || '-(\d+)') AS INT)
                ELSE 0
            END
        ), 0) + 1
        INTO sequence_num
        FROM public.b2b_orders
        WHERE order_number LIKE 'B2B-' || year_month || '-%';

        NEW.order_number := 'B2B-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$_$;


ALTER FUNCTION "public"."generate_b2b_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_b2b_payment_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    year_month := to_char(NOW(), 'YYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(payment_number FROM 'PAY-' || year_month || '-(\d+)') AS INT)
    ), 0) + 1
    INTO sequence_num
    FROM public.b2b_payments
    WHERE payment_number LIKE 'PAY-' || year_month || '-%';

    NEW.payment_number := 'PAY-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_b2b_payment_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_customer_qr_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    qr_prefix TEXT := 'BRK';
    random_part TEXT;
    final_qr TEXT;
BEGIN
    IF NEW.loyalty_qr_code IS NULL THEN
        random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');

        WHILE EXISTS (SELECT 1 FROM public.customers WHERE loyalty_qr_code = final_qr) LOOP
            random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
            final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');
        END LOOP;

        NEW.loyalty_qr_code := final_qr;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_customer_qr_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_device_token_hash"("p_device_id" character varying, "p_secret" character varying) RETURNS character varying
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN encode(
        digest(p_device_id || ':' || p_secret || ':' || extract(epoch from now())::text, 'sha256'),
        'hex'
    );
END;
$$;


ALTER FUNCTION "public"."generate_device_token_hash"("p_device_id" character varying, "p_secret" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_inventory_count_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM inventory_counts
WHERE DATE(created_at) = today;
NEW.count_number := 'INV-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_inventory_count_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_membership_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_part TEXT;
    sequence_num INT;
    final_number TEXT;
BEGIN
    IF NEW.membership_number IS NULL THEN
        year_part := to_char(NOW(), 'YY');

        SELECT COALESCE(MAX(
            CAST(SUBSTRING(membership_number FROM 'M' || year_part || '(\d+)') AS INT)
        ), 0) + 1
        INTO sequence_num
        FROM public.customers
        WHERE membership_number LIKE 'M' || year_part || '%';

        final_number := 'M' || year_part || LPAD(sequence_num::TEXT, 5, '0');
        NEW.membership_number := final_number;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_membership_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_movement_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM stock_movements
WHERE DATE(created_at) = today;
NEW.movement_id := 'MVT-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_movement_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num FROM orders WHERE DATE(created_at) = CURRENT_DATE;
NEW.order_number := 'POS-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_po_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM purchase_orders
WHERE DATE(created_at) = today;
NEW.po_number := 'PO-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_po_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_production_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM production_records
WHERE production_date = NEW.production_date;
NEW.production_id := 'PROD-' || TO_CHAR(NEW.production_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_production_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_session_number"() RETURNS character varying
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_date TEXT;
    v_count INTEGER;
    v_number VARCHAR(50);
BEGIN
    v_date := TO_CHAR(NOW(), 'YYYYMMDD');

    SELECT COUNT(*) + 1 INTO v_count
    FROM pos_sessions
    WHERE DATE(opened_at) = CURRENT_DATE;

    v_number := 'SHIFT-' || v_date || '-' || LPAD(v_count::TEXT, 3, '0');

    RETURN v_number;
END;
$$;


ALTER FUNCTION "public"."generate_session_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_transfer_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
    final_number TEXT;
BEGIN
    IF NEW.transfer_number IS NULL THEN
        year_month := to_char(NEW.transfer_date, 'YYMM');

        SELECT COALESCE(MAX(
            CAST(SUBSTRING(transfer_number FROM 'TR' || year_month || '-(\\d+)') AS INT)
        ), 0) + 1
        INTO sequence_num
        FROM public.internal_transfers
        WHERE transfer_number LIKE 'TR' || year_month || '-%';

        final_number := 'TR' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
        NEW.transfer_number := final_number;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_transfer_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_terminal_settings"("p_terminal_id" "uuid") RETURNS TABLE("key" character varying, "value" "jsonb")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT ts.key::VARCHAR, ts.value
    FROM public.terminal_settings ts
    WHERE ts.terminal_id = p_terminal_id;
END;
$$;


ALTER FUNCTION "public"."get_all_terminal_settings"("p_terminal_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_all_terminal_settings"("p_terminal_id" "uuid") IS 'Get all settings for a terminal';



CREATE OR REPLACE FUNCTION "public"."get_applicable_promotions"("p_product_ids" "uuid"[], "p_category_ids" "uuid"[], "p_customer_id" "uuid" DEFAULT NULL::"uuid", "p_subtotal" numeric DEFAULT 0) RETURNS TABLE("promotion_id" "uuid", "promotion_code" character varying, "promotion_name" character varying, "promotion_type" character varying, "discount_percentage" numeric, "discount_amount" numeric, "priority" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.id,
        p.code,
        p.name,
        p.promotion_type,
        p.discount_percentage,
        p.discount_amount,
        p.priority
    FROM promotions p
    LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
    WHERE p.is_active = true
        AND (p.start_date IS NULL OR NOW() >= p.start_date)
        AND (p.end_date IS NULL OR NOW() <= p.end_date)
        AND (p.days_of_week IS NULL OR EXTRACT(DOW FROM NOW())::INTEGER = ANY(p.days_of_week))
        AND (p.time_start IS NULL OR NOW()::TIME >= p.time_start)
        AND (p.time_end IS NULL OR NOW()::TIME <= p.time_end)
        AND (p.min_purchase_amount IS NULL OR p_subtotal >= p.min_purchase_amount)
        AND (p.max_uses_total IS NULL OR p.current_uses < p.max_uses_total)
        AND (
            -- No specific products/categories (applies to all)
            NOT EXISTS (SELECT 1 FROM promotion_products WHERE promotion_id = p.id)
            OR
            -- Matches specific products
            pp.product_id = ANY(p_product_ids)
            OR
            -- Matches categories
            pp.category_id = ANY(p_category_ids)
        )
    ORDER BY p.priority DESC, p.discount_percentage DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_applicable_promotions"("p_product_ids" "uuid"[], "p_category_ids" "uuid"[], "p_customer_id" "uuid", "p_subtotal" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_available_stock"("p_product_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_stock DECIMAL;
    v_reserved DECIMAL;
BEGIN
    SELECT stock_quantity INTO v_stock
    FROM public.products
    WHERE id = p_product_id;

    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
    FROM public.stock_reservations
    WHERE product_id = p_product_id
      AND status = 'active'
      AND reserved_until > NOW();

    RETURN COALESCE(v_stock, 0) - v_reserved;
END;
$$;


ALTER FUNCTION "public"."get_available_stock"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_combo_with_groups"("p_combo_id" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'combo', row_to_json(c),
        'groups', (
            SELECT json_agg(
                json_build_object(
                    'group', row_to_json(g),
                    'items', (
                        SELECT json_agg(
                            json_build_object(
                                'id', gi.id,
                                'product_id', gi.product_id,
                                'product', row_to_json(p),
                                'price_adjustment', gi.price_adjustment,
                                'is_default', gi.is_default,
                                'sort_order', gi.sort_order
                            )
                            ORDER BY gi.sort_order, p.name
                        )
                        FROM product_combo_group_items gi
                        JOIN products p ON gi.product_id = p.id
                        WHERE gi.group_id = g.id
                    )
                )
                ORDER BY g.sort_order, g.group_name
            )
            FROM product_combo_groups g
            WHERE g.combo_id = p_combo_id
        )
    ) INTO v_result
    FROM product_combos c
    WHERE c.id = p_combo_id;

    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_combo_with_groups"("p_combo_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_profile"() RETURNS TABLE("id" "uuid", "auth_user_id" "uuid", "role" "text", "can_apply_discount" boolean, "can_cancel_order" boolean, "can_access_reports" boolean)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT 
    id, 
    auth_user_id, 
    role::TEXT, 
    can_apply_discount, 
    can_cancel_order, 
    can_access_reports
  FROM user_profiles 
  WHERE auth_user_id = auth.uid()
  AND is_active = true
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_current_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_price"("p_customer_id" "uuid", "p_product_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_category_id UUID;
    v_price_modifier_type TEXT;
    v_discount_percentage NUMERIC(5,2);
    v_custom_price NUMERIC(12,2);
    v_retail_price NUMERIC(12,2);
    v_wholesale_price NUMERIC(12,2);
    v_final_price NUMERIC(12,2);
BEGIN
    -- Get customer category info
    SELECT
        c.category_id,
        cc.price_modifier_type,
        cc.discount_percentage
    INTO
        v_category_id,
        v_price_modifier_type,
        v_discount_percentage
    FROM public.customers c
    LEFT JOIN public.customer_categories cc ON c.category_id = cc.id
    WHERE c.id = p_customer_id;

    -- Get product prices
    SELECT retail_price, wholesale_price
    INTO v_retail_price, v_wholesale_price
    FROM public.products
    WHERE id = p_product_id;

    -- If no category, return retail price
    IF v_category_id IS NULL OR v_price_modifier_type IS NULL THEN
        RETURN COALESCE(v_retail_price, 0);
    END IF;

    -- Determine price based on modifier type
    CASE v_price_modifier_type
        WHEN 'retail' THEN
            v_final_price := COALESCE(v_retail_price, 0);
        WHEN 'wholesale' THEN
            v_final_price := COALESCE(v_wholesale_price, v_retail_price, 0);
        WHEN 'custom' THEN
            -- Check for custom price
            SELECT custom_price INTO v_custom_price
            FROM public.customer_category_prices
            WHERE category_id = v_category_id AND product_id = p_product_id AND is_active = true;

            v_final_price := COALESCE(v_custom_price, v_retail_price, 0);
        WHEN 'discount_percentage' THEN
            v_final_price := COALESCE(v_retail_price, 0) * (1 - COALESCE(v_discount_percentage, 0) / 100);
        ELSE
            v_final_price := COALESCE(v_retail_price, 0);
    END CASE;

    RETURN v_final_price;
END;
$$;


ALTER FUNCTION "public"."get_customer_price"("p_customer_id" "uuid", "p_product_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_customer_price"("p_customer_id" "uuid", "p_product_id" "uuid") IS 'Get the appropriate price for a product based on customer category';



CREATE OR REPLACE FUNCTION "public"."get_customer_product_price"("p_product_id" "uuid", "p_customer_id" "uuid" DEFAULT NULL::"uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_customer_category_id UUID;
    v_price_modifier_type TEXT;
    v_discount_percentage NUMERIC;
    v_retail_price NUMERIC;
    v_wholesale_price NUMERIC;
    v_category_price NUMERIC;
    v_final_price NUMERIC;
BEGIN
    -- Récupérer le prix retail du produit
    SELECT retail_price, wholesale_price INTO v_retail_price, v_wholesale_price
    FROM products WHERE id = p_product_id;

    IF v_retail_price IS NULL THEN
        RETURN 0;
    END IF;

    -- Si pas de client, retourner le prix retail
    IF p_customer_id IS NULL THEN
        RETURN v_retail_price;
    END IF;

    -- Récupérer les infos de la catégorie client
    SELECT
        c.category_id,
        cc.price_modifier_type,
        cc.discount_percentage
    INTO
        v_customer_category_id,
        v_price_modifier_type,
        v_discount_percentage
    FROM customers c
    LEFT JOIN customer_categories cc ON cc.id = c.category_id
    WHERE c.id = p_customer_id;

    -- Si pas de catégorie, retourner le prix retail
    IF v_customer_category_id IS NULL OR v_price_modifier_type IS NULL THEN
        RETURN v_retail_price;
    END IF;

    -- Vérifier s'il y a un prix spécifique pour cette catégorie
    SELECT price INTO v_category_price
    FROM product_category_prices
    WHERE product_id = p_product_id
      AND customer_category_id = v_customer_category_id
      AND is_active = true;

    -- Si prix spécifique existe, l'utiliser
    IF v_category_price IS NOT NULL THEN
        RETURN v_category_price;
    END IF;

    -- Sinon, appliquer la logique de la catégorie
    CASE v_price_modifier_type
        WHEN 'wholesale' THEN
            -- Utiliser le prix wholesale s'il existe, sinon retail
            v_final_price := COALESCE(v_wholesale_price, v_retail_price);
        WHEN 'discount_percentage' THEN
            -- Appliquer la réduction sur le prix retail
            v_final_price := v_retail_price * (1 - COALESCE(v_discount_percentage, 0) / 100);
        WHEN 'custom' THEN
            -- Pour custom, chercher le prix spécifique (déjà fait), sinon retail
            v_final_price := v_retail_price;
        ELSE
            -- retail ou autre: prix retail
            v_final_price := v_retail_price;
    END CASE;

    RETURN v_final_price;
END;
$$;


ALTER FUNCTION "public"."get_customer_product_price"("p_product_id" "uuid", "p_customer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_customer_product_price"("p_product_id" "uuid", "p_customer_id" "uuid") IS 'Calcule le prix final d''un produit pour un client donné selon sa catégorie';



CREATE OR REPLACE FUNCTION "public"."get_kds_orders"("p_station" character varying DEFAULT NULL::character varying) RETURNS TABLE("order_id" "uuid", "order_number" character varying, "order_type" character varying, "table_number" character varying, "customer_name" character varying, "created_at" timestamp with time zone, "status" character varying, "source" character varying, "elapsed_seconds" integer, "items" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id AS order_id,
        o.order_number,
        o.order_type::VARCHAR,
        o.table_number,
        o.customer_name,
        o.created_at,
        o.status::VARCHAR,
        COALESCE(o.source, 'pos')::VARCHAR,
        EXTRACT(EPOCH FROM (NOW() - o.created_at))::INTEGER AS elapsed_seconds,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'modifiers', oi.modifiers,
                    'notes', oi.notes,
                    'item_status', oi.item_status,
                    'dispatch_station', oi.dispatch_station,
                    'is_held', COALESCE(oi.is_held, false),
                    'prepared_at', oi.prepared_at,
                    'served_at', oi.served_at
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
            AND (p_station IS NULL OR oi.dispatch_station = p_station OR p_station = 'all')
        ) AS items
    FROM public.orders o
    WHERE o.status IN ('new', 'preparing', 'ready')
    ORDER BY o.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_kds_orders"("p_station" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_lan_hub_node"() RETURNS TABLE("id" "uuid", "device_id" character varying, "device_name" character varying, "ip_address" "inet", "port" integer, "last_heartbeat" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.device_id, n.device_name, n.ip_address, n.port, n.last_heartbeat
    FROM public.lan_nodes n
    WHERE n.is_hub = TRUE AND n.status = 'online'
    LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_lan_hub_node"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_online_lan_nodes"() RETURNS TABLE("id" "uuid", "device_id" character varying, "device_type" character varying, "device_name" character varying, "ip_address" "inet", "port" integer, "is_hub" boolean, "last_heartbeat" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.device_id, n.device_type, n.device_name, n.ip_address, n.port, n.is_hub, n.last_heartbeat
    FROM public.lan_nodes n
    WHERE n.status = 'online'
    ORDER BY n.is_hub DESC, n.last_heartbeat DESC;
END;
$$;


ALTER FUNCTION "public"."get_online_lan_nodes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_overdue_invoices"() RETURNS TABLE("invoice_id" "uuid", "customer_id" "uuid", "customer_name" character varying, "invoice_number" character varying, "due_date" timestamp with time zone, "days_overdue" integer, "amount" numeric, "paid_amount" numeric, "balance_due" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        ci.id as invoice_id,
        ci.customer_id,
        c.name as customer_name,
        ci.invoice_number,
        ci.due_date,
        EXTRACT(DAY FROM (NOW() - ci.due_date))::INTEGER as days_overdue,
        ci.amount,
        ci.paid_amount,
        (ci.amount - ci.paid_amount) as balance_due
    FROM public.customer_invoices ci
    JOIN public.customers c ON c.id = ci.customer_id
    WHERE ci.due_date < NOW()
      AND ci.status NOT IN ('paid')
      AND (ci.amount - ci.paid_amount) > 0
    ORDER BY ci.due_date ASC;
END;
$$;


ALTER FUNCTION "public"."get_overdue_invoices"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_reporting_dashboard_summary"("start_date" timestamp without time zone, "end_date" timestamp without time zone) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE v_sales RECORD;
v_top_product RECORD;
v_low_stock_count INTEGER;
v_open_sessions INTEGER;
BEGIN -- 1. Sales Metrics
SELECT COALESCE(SUM(total), 0) as total_revenue,
    COUNT(id) as total_orders INTO v_sales
FROM orders
WHERE created_at BETWEEN start_date AND end_date
    AND status != 'cancelled'
    AND payment_status = 'paid';
SELECT p.name,
    SUM(oi.quantity) as qty INTO v_top_product
FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
WHERE o.created_at BETWEEN start_date AND end_date
    AND o.status != 'cancelled'
    AND o.payment_status = 'paid'
GROUP BY p.name
ORDER BY SUM(oi.quantity) DESC
LIMIT 1;
SELECT COUNT(*) INTO v_low_stock_count
FROM products
WHERE current_stock <= min_stock_level
    AND is_active = TRUE;
SELECT COUNT(*) INTO v_open_sessions
FROM pos_sessions
WHERE status = 'open';
RETURN jsonb_build_object(
    'period_sales',
    v_sales.total_revenue,
    'period_orders',
    v_sales.total_orders,
    'top_product',
    CASE
        WHEN v_top_product.name IS NOT NULL THEN jsonb_build_object(
            'name',
            v_top_product.name,
            'qty',
            v_top_product.qty
        )
        ELSE NULL
    END,
    'low_stock_alerts',
    v_low_stock_count,
    'active_sessions',
    v_open_sessions
);
END;
$$;


ALTER FUNCTION "public"."get_reporting_dashboard_summary"("start_date" timestamp without time zone, "end_date" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sales_analytics"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "trunc_interval" character varying DEFAULT 'day'::character varying) RETURNS TABLE("period" timestamp without time zone, "total_sales" numeric, "order_count" bigint, "avg_order_value" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN IF NOT check_reporting_access() THEN RAISE EXCEPTION 'Access Denied: Reporting permissions required.';
END IF;
RETURN QUERY
SELECT DATE_TRUNC(trunc_interval, created_at) AS period,
    COALESCE(SUM(total), 0) AS total_sales,
    COUNT(id) AS order_count,
    CASE
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(total), 0) / COUNT(id)
        ELSE 0
    END AS avg_order_value
FROM orders
WHERE created_at BETWEEN start_date AND end_date
    AND status != 'cancelled'
    AND payment_status = 'paid'
GROUP BY 1
ORDER BY 1;
END;
$$;


ALTER FUNCTION "public"."get_sales_analytics"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "trunc_interval" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sales_comparison"("current_start" timestamp without time zone, "current_end" timestamp without time zone, "previous_start" timestamp without time zone, "previous_end" timestamp without time zone) RETURNS TABLE("period_label" "text", "total_revenue" numeric, "net_revenue" numeric, "transaction_count" bigint, "avg_basket" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN RETURN QUERY -- Current Period
SELECT 'current'::TEXT as period_label,
    COALESCE(SUM(total), 0) as total_revenue,
    COALESCE(SUM(subtotal - discount_amount), 0) as net_revenue,
    COUNT(id) as transaction_count,
    CASE
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(total), 0) / COUNT(id)
        ELSE 0
    END as avg_basket
FROM orders
WHERE created_at BETWEEN current_start AND current_end
    AND status != 'cancelled'
    AND payment_status = 'paid'
UNION ALL
SELECT 'previous'::TEXT as period_label,
    COALESCE(SUM(total), 0) as total_revenue,
    COALESCE(SUM(subtotal - discount_amount), 0) as net_revenue,
    COUNT(id) as transaction_count,
    CASE
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(total), 0) / COUNT(id)
        ELSE 0
    END as avg_basket
FROM orders
WHERE created_at BETWEEN previous_start AND previous_end
    AND status != 'cancelled'
    AND payment_status = 'paid';
END;
$$;


ALTER FUNCTION "public"."get_sales_comparison"("current_start" timestamp without time zone, "current_end" timestamp without time zone, "previous_start" timestamp without time zone, "previous_end" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_setting"("p_key" character varying) RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT value FROM public.settings WHERE key = p_key;
$$;


ALTER FUNCTION "public"."get_setting"("p_key" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_setting"("p_key" character varying) IS 'Get a single setting value by key';



CREATE OR REPLACE FUNCTION "public"."get_settings_by_category"("p_category_code" character varying) RETURNS TABLE("key" character varying, "value" "jsonb", "value_type" character varying, "name_fr" character varying, "name_en" character varying, "name_id" character varying, "is_sensitive" boolean, "validation_rules" "jsonb")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.key::VARCHAR,
        CASE WHEN s.is_sensitive THEN '""'::JSONB ELSE s.value END,
        s.value_type::VARCHAR,
        s.name_fr::VARCHAR,
        s.name_en::VARCHAR,
        s.name_id::VARCHAR,
        s.is_sensitive,
        s.validation_rules
    FROM public.settings s
    JOIN public.settings_categories c ON s.category_id = c.id
    WHERE c.code = p_category_code
    ORDER BY s.sort_order;
END;
$$;


ALTER FUNCTION "public"."get_settings_by_category"("p_category_code" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_settings_by_category"("p_category_code" character varying) IS 'Get all settings for a category with sensitive values masked';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."pos_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_number" character varying(30) NOT NULL,
    "opened_at" timestamp with time zone DEFAULT "now"(),
    "opened_by" "uuid",
    "opening_cash" numeric(12,2) DEFAULT 0,
    "opening_cash_details" "jsonb",
    "closed_at" timestamp with time zone,
    "closed_by" "uuid",
    "closing_cash" numeric(12,2),
    "closing_cash_details" "jsonb",
    "total_cash_sales" numeric(12,2) DEFAULT 0,
    "total_card_sales" numeric(12,2) DEFAULT 0,
    "total_qris_sales" numeric(12,2) DEFAULT 0,
    "total_orders" integer DEFAULT 0,
    "total_discounts" numeric(12,2) DEFAULT 0,
    "total_refunds" numeric(12,2) DEFAULT 0,
    "expected_cash" numeric(12,2),
    "cash_difference" numeric(12,2),
    "difference_reason" "text",
    "tips_cash" numeric(12,2) DEFAULT 0,
    "tips_card" numeric(12,2) DEFAULT 0,
    "manager_validated" boolean DEFAULT false,
    "manager_id" "uuid",
    "notes" "text",
    "status" "public"."session_status" DEFAULT 'open'::"public"."session_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "terminal_id" character varying(50),
    "counted_cash" numeric(12,2)
);


ALTER TABLE "public"."pos_sessions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_terminal_open_shifts"("p_terminal_id" character varying) RETURNS SETOF "public"."pos_sessions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pos_sessions
    WHERE terminal_id = p_terminal_id
      AND status = 'open'
    ORDER BY opened_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_terminal_open_shifts"("p_terminal_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying) RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
    SELECT value
    FROM public.terminal_settings
    WHERE terminal_id = p_terminal_id AND key = p_key;
$$;


ALTER FUNCTION "public"."get_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying) IS 'Get a terminal-specific setting';



CREATE OR REPLACE FUNCTION "public"."get_top_products"("start_date" timestamp without time zone DEFAULT NULL::timestamp without time zone, "end_date" timestamp without time zone DEFAULT NULL::timestamp without time zone, "limit_count" integer DEFAULT 10) RETURNS TABLE("product_name" character varying, "sku" character varying, "quantity_sold" numeric, "total_revenue" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$ BEGIN IF NOT check_reporting_access() THEN RAISE EXCEPTION 'Access Denied: Reporting permissions required.';
END IF;
RETURN QUERY
SELECT p.name,
    p.sku,
    SUM(oi.quantity) AS quantity_sold,
    SUM(oi.total_price) AS total_revenue
FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
WHERE o.status != 'cancelled'
    AND o.payment_status = 'paid'
    AND (
        start_date IS NULL
        OR o.created_at >= start_date
    )
    AND (
        end_date IS NULL
        OR o.created_at <= end_date
    )
GROUP BY p.id,
    p.name,
    p.sku
ORDER BY total_revenue DESC
LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_top_products"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_open_shift"("p_user_id" "uuid") RETURNS SETOF "public"."pos_sessions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pos_sessions
    WHERE user_id = p_user_id
      AND status = 'open'
    LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_user_open_shift"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") RETURNS TABLE("permission_code" character varying, "permission_module" character varying, "permission_action" character varying, "is_granted" boolean, "source" character varying, "is_sensitive" boolean)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    -- Direct permissions (take priority)
    SELECT
        p.code::VARCHAR,
        p.module::VARCHAR,
        p.action::VARCHAR,
        up.is_granted,
        'direct'::VARCHAR as source,
        p.is_sensitive
    FROM public.user_permissions up
    JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
    AND (up.valid_from IS NULL OR up.valid_from <= NOW())
    AND (up.valid_until IS NULL OR up.valid_until > NOW())

    UNION

    -- Role-based permissions (only if no direct override exists)
    SELECT
        p.code::VARCHAR,
        p.module::VARCHAR,
        p.action::VARCHAR,
        true as is_granted,
        'role'::VARCHAR as source,
        p.is_sensitive
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    AND NOT EXISTS (
        SELECT 1 FROM public.user_permissions up2
        WHERE up2.user_id = p_user_id
        AND up2.permission_id = p.id
        AND (up2.valid_from IS NULL OR up2.valid_from <= NOW())
        AND (up2.valid_until IS NULL OR up2.valid_until > NOW())
    );
END;
$$;


ALTER FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") IS 'Get all effective permissions for a user';



CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "name_fr" character varying(100) NOT NULL,
    "name_en" character varying(100) NOT NULL,
    "name_id" character varying(100) NOT NULL,
    "description" "text",
    "is_system" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "hierarchy_level" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."roles" IS 'System roles with hierarchy levels for permission inheritance';



CREATE OR REPLACE FUNCTION "public"."get_user_primary_role"("p_user_id" "uuid") RETURNS "public"."roles"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_role public.roles;
BEGIN
    SELECT r.* INTO v_role
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    AND ur.is_primary = true
    AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    LIMIT 1;

    -- If no primary role, get highest hierarchy role
    IF v_role IS NULL THEN
        SELECT r.* INTO v_role
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
        ORDER BY r.hierarchy_level DESC
        LIMIT 1;
    END IF;

    RETURN v_role;
END;
$$;


ALTER FUNCTION "public"."get_user_primary_role"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    profile_id UUID;
BEGIN
    SELECT id INTO profile_id
    FROM user_profiles
    WHERE auth_user_id = auth.uid();
    
    RETURN profile_id;
END;
$$;


ALTER FUNCTION "public"."get_user_profile_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO user_profiles (auth_user_id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cashier')
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hash_pin"("p_pin" character varying) RETURNS character varying
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN extensions.crypt(p_pin, extensions.gen_salt('bf', 8));
END;
$$;


ALTER FUNCTION "public"."hash_pin"("p_pin" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    -- Fallback: Check if tables from 040 exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        -- Use proper admin check from 040
        RETURN EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = p_user_id
            AND r.code IN ('SUPER_ADMIN', 'ADMIN')
            AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
            AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
        );
    ELSE
        -- Fallback: allow all authenticated users if permission system not yet deployed
        RETURN p_user_id IS NOT NULL;
    END IF;
END;
$$;


ALTER FUNCTION "public"."is_admin"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"("p_user_id" "uuid") IS 'Check if user has ADMIN or SUPER_ADMIN role';



CREATE OR REPLACE FUNCTION "public"."is_admin_or_manager"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager');
END;
$$;


ALTER FUNCTION "public"."is_admin_or_manager"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.code = 'SUPER_ADMIN'
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$;


ALTER FUNCTION "public"."is_super_admin"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_b2b_order_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.b2b_order_history (order_id, action_type, new_status, description, created_by)
        VALUES (NEW.id, 'created', NEW.status, 'Commande B2B créée', NEW.created_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.b2b_order_history (order_id, action_type, previous_status, new_status, description)
        VALUES (
            NEW.id,
            NEW.status,
            OLD.status,
            NEW.status,
            'Statut modifié: ' || OLD.status || ' → ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_b2b_order_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_order_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE action_name VARCHAR(100);
sev audit_severity;
BEGIN IF TG_OP = 'UPDATE' THEN -- Order cancelled
IF NEW.status = 'cancelled'
AND OLD.status != 'cancelled' THEN action_name := 'order_cancelled';
sev := 'warning';
ELSIF NEW.discount_amount > 0
AND COALESCE(OLD.discount_amount, 0) = 0 THEN action_name := 'discount_applied';
sev := CASE
    WHEN NEW.discount_requires_manager THEN 'warning'
    ELSE 'info'
END;
ELSIF NEW.payment_status = 'paid'
AND OLD.payment_status != 'paid' THEN action_name := 'order_paid';
sev := 'info';
ELSE RETURN NEW;
END IF;
END IF;
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        old_value,
        new_value,
        reason,
        requires_manager,
        manager_id,
        user_id,
        session_id
    )
VALUES (
        action_name,
        sev,
        'order',
        NEW.id,
        row_to_json(OLD)::JSONB,
        row_to_json(NEW)::JSONB,
        NEW.cancellation_reason,
        NEW.discount_requires_manager,
        NEW.discount_manager_id,
        NEW.staff_id,
        NEW.session_id
    );
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_order_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_price_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ BEGIN IF OLD.retail_price != NEW.retail_price
    OR OLD.wholesale_price != NEW.wholesale_price THEN
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        old_value,
        new_value
    )
VALUES (
        'price_changed',
        'warning',
        'product',
        NEW.id,
        jsonb_build_object(
            'retail_price',
            OLD.retail_price,
            'wholesale_price',
            OLD.wholesale_price
        ),
        jsonb_build_object(
            'retail_price',
            NEW.retail_price,
            'wholesale_price',
            NEW.wholesale_price
        )
    );
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_price_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_purchase_order_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.purchase_order_history (purchase_order_id, action_type, new_status, description)
        VALUES (NEW.id, 'created', NEW.status, 'Purchase order created');
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.purchase_order_history (purchase_order_id, action_type, previous_status, new_status, description)
        VALUES (NEW.id, LOWER(NEW.status), OLD.status, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_purchase_order_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_setting_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF OLD.value IS DISTINCT FROM NEW.value THEN
        INSERT INTO public.settings_history (setting_id, old_value, new_value, changed_by)
        VALUES (NEW.id, OLD.value, NEW.value, auth.uid());
        NEW.updated_at = NOW();
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_setting_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_stale_lan_nodes_offline"("p_timeout_seconds" integer DEFAULT 60) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE public.lan_nodes
    SET status = 'offline'
    WHERE status = 'online'
      AND last_heartbeat < NOW() - (p_timeout_seconds || ' seconds')::INTERVAL;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$;


ALTER FUNCTION "public"."mark_stale_lan_nodes_offline"("p_timeout_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."open_shift"("p_user_id" "uuid", "p_opening_cash" numeric, "p_terminal_id" character varying DEFAULT NULL::character varying, "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_session_id UUID;
    v_session_number VARCHAR(50);
BEGIN
    -- Generate session number
    v_session_number := 'SHIFT-' || to_char(NOW(), 'YYYYMMDD-HH24MISS');

    -- Close any existing open shifts for this user
    UPDATE public.pos_sessions
    SET status = 'closed',
        closed_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'open';

    -- Create new session
    INSERT INTO public.pos_sessions (
        session_number,
        user_id,
        opened_by,
        terminal_id,
        opening_cash,
        notes,
        status,
        opened_at
    ) VALUES (
        v_session_number,
        p_user_id,
        p_user_id,
        COALESCE(p_terminal_id, 'POS-01'),
        p_opening_cash,
        p_notes,
        'open',
        NOW()
    ) RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$;


ALTER FUNCTION "public"."open_shift"("p_user_id" "uuid", "p_opening_cash" numeric, "p_terminal_id" character varying, "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_production"("production_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE prod_record RECORD;
recipe_record RECORD;
total_qty DECIMAL(10, 3);
BEGIN -- Get production record
SELECT * INTO prod_record
FROM production_records
WHERE id = production_uuid;
IF prod_record IS NULL THEN RAISE EXCEPTION 'Production not found: %',
production_uuid;
END IF;
IF prod_record.stock_updated THEN RAISE EXCEPTION 'Production already processed';
END IF;
total_qty := prod_record.quantity_produced + COALESCE(prod_record.quantity_waste, 0);
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        prod_record.product_id,
        'production_in',
        total_qty,
        -- Add everything we made
        'production',
        prod_record.id,
        'Production #' || prod_record.production_id,
        prod_record.staff_id
    );
IF prod_record.quantity_waste > 0 THEN
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        prod_record.product_id,
        'waste',
        prod_record.quantity_waste,
        -- Remove bad stuff
        'production',
        prod_record.id,
        'Production Waste #' || prod_record.production_id,
        prod_record.staff_id
    );
END IF;
FOR recipe_record IN
SELECT r.material_id,
    r.quantity,
    p.name
FROM recipes r
    JOIN products p ON p.id = r.material_id
WHERE r.product_id = prod_record.product_id
    AND r.is_active = TRUE LOOP
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        recipe_record.material_id,
        'production_out',
        recipe_record.quantity * total_qty,
        -- Consume based on total output
        'production',
        prod_record.id,
        'Consumed for production #' || prod_record.production_id,
        prod_record.staff_id
    );
END LOOP;
UPDATE production_records
SET stock_updated = TRUE,
    materials_consumed = TRUE,
    updated_at = NOW()
WHERE id = production_uuid;
RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."process_production"("production_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."receive_po_items"("p_po_id" "uuid", "p_items" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_item RECORD;
    v_received_count INT := 0;
    v_po_status VARCHAR;
BEGIN
    -- Check PO exists
    SELECT status INTO v_po_status
    FROM public.purchase_orders
    WHERE id = p_po_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;

    -- Process each item
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        po_item_id UUID,
        quantity_received DECIMAL
    )
    LOOP
        -- Update PO item received quantity
        UPDATE public.po_items
        SET received_quantity = COALESCE(received_quantity, 0) + v_item.quantity_received,
            updated_at = NOW()
        WHERE id = v_item.po_item_id
          AND po_id = p_po_id;

        IF FOUND THEN
            -- Get product_id for this PO item
            DECLARE
                v_product_id UUID;
                v_unit_price DECIMAL;
            BEGIN
                SELECT product_id, unit_price
                INTO v_product_id, v_unit_price
                FROM public.po_items
                WHERE id = v_item.po_item_id;

                -- Create stock movement
                INSERT INTO public.stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    unit_cost,
                    reference_type,
                    reference_id,
                    notes,
                    created_by
                )
                VALUES (
                    v_product_id,
                    'purchase',
                    v_item.quantity_received,
                    v_unit_price,
                    'purchase_order',
                    p_po_id,
                    'Réception bon de commande',
                    auth.uid()
                );

                -- Update product stock
                UPDATE public.products
                SET stock_quantity = COALESCE(stock_quantity, 0) + v_item.quantity_received,
                    updated_at = NOW()
                WHERE id = v_product_id;

                v_received_count := v_received_count + 1;
            END;
        END IF;
    END LOOP;

    -- Check if PO is fully received
    IF NOT EXISTS (
        SELECT 1
        FROM public.po_items
        WHERE po_id = p_po_id
          AND COALESCE(received_quantity, 0) < ordered_quantity
    ) THEN
        UPDATE public.purchase_orders
        SET status = 'received',
            received_at = NOW(),
            updated_at = NOW()
        WHERE id = p_po_id;
    ELSE
        -- Partial receive
        UPDATE public.purchase_orders
        SET status = 'partial',
            updated_at = NOW()
        WHERE id = p_po_id
          AND status != 'partial';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'items_received', v_received_count
    );
END;
$$;


ALTER FUNCTION "public"."receive_po_items"("p_po_id" "uuid", "p_items" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_promotion_usage"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_order_id" "uuid", "p_discount_amount" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Insert usage record
    INSERT INTO promotion_usage (promotion_id, customer_id, order_id, discount_amount)
    VALUES (p_promotion_id, p_customer_id, p_order_id, p_discount_amount);

    -- Increment promotion usage counter
    UPDATE promotions
    SET current_uses = current_uses + 1
    WHERE id = p_promotion_id;
END;
$$;


ALTER FUNCTION "public"."record_promotion_usage"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_order_id" "uuid", "p_discount_amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_stock_before_after"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE current_qty DECIMAL(10, 3);
movement_qty DECIMAL(10, 3);
BEGIN
SELECT current_stock INTO current_qty
FROM products
WHERE id = NEW.product_id;
NEW.stock_before := COALESCE(current_qty, 0);
CASE
    NEW.movement_type
    WHEN 'purchase',
    'production_in',
    'adjustment_in',
    'transfer' THEN movement_qty := ABS(NEW.quantity);
WHEN 'sale_pos',
'sale_b2b',
'production_out',
'adjustment_out',
'waste' THEN movement_qty := - ABS(NEW.quantity);
ELSE movement_qty := NEW.quantity;
END CASE
;
NEW.stock_after := NEW.stock_before + movement_qty;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."record_stock_before_after"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."redeem_loyalty_points"("p_customer_id" "uuid", "p_points" integer, "p_order_id" "uuid" DEFAULT NULL::"uuid", "p_description" "text" DEFAULT 'Utilisation de points'::"text", "p_created_by" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_current_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current points
    SELECT loyalty_points INTO v_current_points
    FROM public.customers
    WHERE id = p_customer_id;

    -- Check if customer has enough points
    IF v_current_points < p_points THEN
        RAISE EXCEPTION 'Insufficient loyalty points. Available: %, Requested: %', v_current_points, p_points;
    END IF;

    v_new_balance := v_current_points - p_points;

    -- Update customer points
    UPDATE public.customers
    SET loyalty_points = v_new_balance
    WHERE id = p_customer_id;

    -- Log transaction
    INSERT INTO public.loyalty_transactions (
        customer_id, order_id, transaction_type, points, points_balance_after,
        description, created_by
    ) VALUES (
        p_customer_id, p_order_id, 'redeem', -p_points, v_new_balance,
        p_description, p_created_by
    );

    RETURN true;
END;
$$;


ALTER FUNCTION "public"."redeem_loyalty_points"("p_customer_id" "uuid", "p_points" integer, "p_order_id" "uuid", "p_description" "text", "p_created_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."redeem_loyalty_points"("p_customer_id" "uuid", "p_points" integer, "p_order_id" "uuid", "p_description" "text", "p_created_by" "uuid") IS 'Redeem loyalty points from a customer account';



CREATE OR REPLACE FUNCTION "public"."register_lan_node"("p_device_id" character varying, "p_device_type" character varying, "p_device_name" character varying, "p_ip_address" "inet", "p_port" integer, "p_is_hub" boolean DEFAULT false) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_node_id UUID;
BEGIN
    INSERT INTO public.lan_nodes (device_id, device_type, device_name, ip_address, port, is_hub, status, last_heartbeat)
    VALUES (p_device_id, p_device_type, p_device_name, p_ip_address, p_port, p_is_hub, 'online', NOW())
    ON CONFLICT (device_id) DO UPDATE SET
        ip_address = EXCLUDED.ip_address,
        port = EXCLUDED.port,
        device_name = EXCLUDED.device_name,
        is_hub = EXCLUDED.is_hub,
        status = 'online',
        last_heartbeat = NOW()
    RETURNING id INTO v_node_id;

    RETURN v_node_id;
END;
$$;


ALTER FUNCTION "public"."register_lan_node"("p_device_id" character varying, "p_device_type" character varying, "p_device_name" character varying, "p_ip_address" "inet", "p_port" integer, "p_is_hub" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_category_settings"("p_category_code" character varying) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.settings s
    SET value = s.default_value
    FROM public.settings_categories c
    WHERE s.category_id = c.id
    AND c.code = p_category_code
    AND s.default_value IS NOT NULL
    AND s.is_system = false
    AND s.is_readonly = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."reset_category_settings"("p_category_code" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reset_category_settings"("p_category_code" character varying) IS 'Reset all settings in a category to defaults';



CREATE OR REPLACE FUNCTION "public"."reset_setting"("p_key" character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.settings
    SET value = default_value
    WHERE key = p_key
    AND default_value IS NOT NULL
    AND is_system = false
    AND is_readonly = false;

    RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."reset_setting"("p_key" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reset_setting"("p_key" character varying) IS 'Reset a setting to its default value';



CREATE OR REPLACE FUNCTION "public"."set_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying, "p_value" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.terminal_settings (terminal_id, key, value)
    VALUES (p_terminal_id, p_key, p_value)
    ON CONFLICT (terminal_id, key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW();
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."set_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying, "p_value" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying, "p_value" "jsonb") IS 'Set a terminal-specific setting';



CREATE OR REPLACE FUNCTION "public"."set_user_pin"("p_user_id" "uuid", "p_pin" character varying, "p_updated_by" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
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
$_$;


ALTER FUNCTION "public"."set_user_pin"("p_user_id" "uuid", "p_pin" character varying, "p_updated_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_user_pin"("p_user_id" "uuid", "p_pin" character varying, "p_updated_by" "uuid") IS 'Securely set user PIN with bcrypt hashing, clears any plaintext PIN';



CREATE OR REPLACE FUNCTION "public"."settings_update_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."settings_update_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transfer_stock"("p_product_id" "uuid", "p_from_section_id" "uuid", "p_to_section_id" "uuid", "p_quantity" numeric) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$ BEGIN -- Deduct from source
INSERT INTO public.product_stocks (section_id, product_id, quantity)
VALUES (p_from_section_id, p_product_id, - p_quantity) ON CONFLICT (section_id, product_id) DO
UPDATE
SET quantity = product_stocks.quantity - p_quantity;
INSERT INTO public.product_stocks (section_id, product_id, quantity)
VALUES (p_to_section_id, p_product_id, p_quantity) ON CONFLICT (section_id, product_id) DO
UPDATE
SET quantity = product_stocks.quantity + p_quantity;
INSERT INTO public.stock_movements (
        product_id,
        from_section_id,
        to_section_id,
        quantity,
        movement_type
    )
VALUES (
        p_product_id,
        p_from_section_id,
        p_to_section_id,
        p_quantity,
        'transfer'
    );
RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."transfer_stock"("p_product_id" "uuid", "p_from_section_id" "uuid", "p_to_section_id" "uuid", "p_quantity" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_production_stock_deduction"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only deduct if status indicates completion
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        PERFORM public.deduct_production_ingredients(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_production_stock_deduction"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_deliveries_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_b2b_deliveries_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_delivery_quantities"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.b2b_order_items
        SET quantity_delivered = (
            SELECT COALESCE(SUM(di.quantity_delivered), 0)
            FROM public.b2b_delivery_items di
            JOIN public.b2b_deliveries d ON d.id = di.delivery_id
            WHERE di.order_item_id = NEW.order_item_id
            AND d.status IN ('delivered', 'partial')
        )
        WHERE id = NEW.order_item_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE public.b2b_order_items
        SET quantity_delivered = (
            SELECT COALESCE(SUM(di.quantity_delivered), 0)
            FROM public.b2b_delivery_items di
            JOIN public.b2b_deliveries d ON d.id = di.delivery_id
            WHERE di.order_item_id = OLD.order_item_id
            AND d.status IN ('delivered', 'partial')
        )
        WHERE id = OLD.order_item_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_b2b_delivery_quantities"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_order_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_b2b_order_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_order_payment_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    order_uuid UUID;
    total_paid NUMERIC(12,2);
    order_total NUMERIC(12,2);
    new_payment_status TEXT;
BEGIN
    order_uuid := COALESCE(NEW.order_id, OLD.order_id);

    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM public.b2b_payments
    WHERE order_id = order_uuid AND status = 'completed';

    -- Get order total
    SELECT total_amount
    INTO order_total
    FROM public.b2b_orders
    WHERE id = order_uuid;

    -- Determine payment status
    IF total_paid >= order_total THEN
        new_payment_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_payment_status := 'partial';
    ELSE
        new_payment_status := 'unpaid';
    END IF;

    -- Update order
    UPDATE public.b2b_orders
    SET
        amount_paid = total_paid,
        amount_due = order_total - total_paid,
        payment_status = new_payment_status
    WHERE id = order_uuid;

    -- Log payment in history
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        INSERT INTO public.b2b_order_history (order_id, action_type, description, metadata, created_by)
        VALUES (
            order_uuid,
            CASE WHEN new_payment_status = 'paid' THEN 'payment_received' ELSE 'payment_partial' END,
            'Paiement reçu: ' || NEW.amount || ' IDR via ' || NEW.payment_method,
            jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount, 'method', NEW.payment_method),
            NEW.received_by
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_b2b_order_payment_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_order_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    order_uuid UUID;
    new_subtotal NUMERIC(12,2);
    order_discount_type TEXT;
    order_discount_value NUMERIC(10,2);
    new_discount_amount NUMERIC(12,2);
    order_tax_rate NUMERIC(5,2);
    new_tax_amount NUMERIC(12,2);
    new_total NUMERIC(12,2);
    paid_amount NUMERIC(12,2);
BEGIN
    order_uuid := COALESCE(NEW.order_id, OLD.order_id);

    -- Calculate subtotal from items
    SELECT COALESCE(SUM(line_total), 0)
    INTO new_subtotal
    FROM public.b2b_order_items
    WHERE order_id = order_uuid;

    -- Get order discount info
    SELECT discount_type, discount_value, tax_rate, amount_paid
    INTO order_discount_type, order_discount_value, order_tax_rate, paid_amount
    FROM public.b2b_orders
    WHERE id = order_uuid;

    -- Calculate discount
    IF order_discount_type = 'percentage' THEN
        new_discount_amount := new_subtotal * (COALESCE(order_discount_value, 0) / 100);
    ELSE
        new_discount_amount := COALESCE(order_discount_value, 0);
    END IF;

    -- Calculate tax and total
    new_tax_amount := (new_subtotal - new_discount_amount) * (COALESCE(order_tax_rate, 10) / 100);
    new_total := new_subtotal - new_discount_amount + new_tax_amount;

    -- Update order
    UPDATE public.b2b_orders
    SET
        subtotal = new_subtotal,
        discount_amount = new_discount_amount,
        tax_amount = new_tax_amount,
        total_amount = new_total,
        amount_due = new_total - COALESCE(paid_amount, 0)
    WHERE id = order_uuid;

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_b2b_order_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_orders_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_b2b_orders_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_b2b_payments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_b2b_payments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customer_categories_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customer_categories_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customer_category_prices_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customer_category_prices_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customer_loyalty"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE points_earned INTEGER;
BEGIN IF NEW.payment_status = 'paid'
AND NEW.customer_id IS NOT NULL THEN points_earned := calculate_loyalty_points(NEW.total - COALESCE(NEW.discount_amount, 0));
UPDATE orders
SET points_earned = points_earned
WHERE id = NEW.id;
UPDATE customers
SET loyalty_points = loyalty_points + points_earned - COALESCE(NEW.points_used, 0),
    total_visits = total_visits + 1,
    total_spent = total_spent + NEW.total,
    last_visit_at = NOW(),
    updated_at = NOW()
WHERE id = NEW.customer_id;
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customer_loyalty"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customer_loyalty_tier"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_tier TEXT;
BEGIN
    SELECT slug INTO new_tier
    FROM public.loyalty_tiers
    WHERE min_lifetime_points <= NEW.lifetime_points
    AND is_active = true
    ORDER BY min_lifetime_points DESC
    LIMIT 1;

    IF new_tier IS NOT NULL AND new_tier != COALESCE(NEW.loyalty_tier, 'bronze') THEN
        NEW.loyalty_tier := new_tier;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customer_loyalty_tier"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customers_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customers_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_device_last_seen"("p_device_id" character varying) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.sync_devices
    SET last_seen = NOW()
    WHERE device_id = p_device_id;
END;
$$;


ALTER FUNCTION "public"."update_device_last_seen"("p_device_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_display_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_display_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_floor_plan_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_floor_plan_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_internal_transfers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_internal_transfers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_lan_node_heartbeat"("p_device_id" character varying) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.lan_nodes
    SET last_heartbeat = NOW(), status = 'online'
    WHERE device_id = p_device_id;
END;
$$;


ALTER FUNCTION "public"."update_lan_node_heartbeat"("p_device_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_lan_nodes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_lan_nodes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_loyalty_rewards_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_loyalty_rewards_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_loyalty_tiers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_loyalty_tiers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_offline_versions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_offline_versions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pos_sessions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pos_sessions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_pos_terminals_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_pos_terminals_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_category_prices_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_product_category_prices_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_stock"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE movement_qty DECIMAL(10, 3);
BEGIN CASE
    NEW.movement_type
    WHEN 'purchase',
    'production_in',
    'adjustment_in',
    'transfer' THEN movement_qty := ABS(NEW.quantity);
WHEN 'sale_pos',
'sale_b2b',
'production_out',
'adjustment_out',
'waste' THEN movement_qty := - ABS(NEW.quantity);
ELSE movement_qty := NEW.quantity;
END CASE
;
UPDATE products
SET current_stock = current_stock + movement_qty,
    updated_at = NOW()
WHERE id = NEW.product_id;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_product_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_purchase_order_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_purchase_order_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_purchase_order_returns_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_purchase_order_returns_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_purchase_order_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    po_subtotal NUMERIC(10,2);
    po_tax NUMERIC(10,2);
    po_total NUMERIC(10,2);
BEGIN
    -- Calculate totals from items
    SELECT
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(line_total * tax_rate / 100), 0)
    INTO po_subtotal, po_tax
    FROM public.purchase_order_items
    WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

    -- Update purchase order
    UPDATE public.purchase_orders
    SET
        subtotal = po_subtotal,
        tax_amount = po_tax,
        total_amount = po_subtotal - COALESCE(discount_amount, 0) + po_tax
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_purchase_order_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_purchase_orders_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_purchase_orders_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_session_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ BEGIN IF NEW.payment_status = 'paid'
    AND OLD.payment_status != 'paid'
    AND NEW.session_id IS NOT NULL THEN
UPDATE pos_sessions
SET total_orders = total_orders + 1,
    total_cash_sales = total_cash_sales + CASE
        WHEN NEW.payment_method = 'cash' THEN NEW.total
        ELSE 0
    END,
    total_card_sales = total_card_sales + CASE
        WHEN NEW.payment_method = 'card' THEN NEW.total
        ELSE 0
    END,
    total_qris_sales = total_qris_sales + CASE
        WHEN NEW.payment_method = 'qris' THEN NEW.total
        ELSE 0
    END,
    total_discounts = total_discounts + COALESCE(NEW.discount_amount, 0),
    expected_cash = opening_cash + total_cash_sales + CASE
        WHEN NEW.payment_method = 'cash' THEN NEW.total
        ELSE 0
    END - total_refunds,
    updated_at = NOW()
WHERE id = NEW.session_id;
END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_session_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_setting"("p_key" character varying, "p_value" "jsonb", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_setting RECORD;
    v_validation JSONB;
    v_num_value NUMERIC;
BEGIN
    -- Get setting
    SELECT * INTO v_setting FROM public.settings WHERE key = p_key;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Setting not found: %', p_key;
    END IF;

    IF v_setting.is_system OR v_setting.is_readonly THEN
        RAISE EXCEPTION 'Setting is not modifiable: %', p_key;
    END IF;

    -- Validate based on rules
    v_validation := v_setting.validation_rules;

    IF v_validation IS NOT NULL AND v_setting.value_type = 'number' THEN
        v_num_value := (p_value #>> '{}')::NUMERIC;

        IF v_validation->>'min' IS NOT NULL AND v_num_value < (v_validation->>'min')::NUMERIC THEN
            RAISE EXCEPTION 'Value % is below minimum %', v_num_value, v_validation->>'min';
        END IF;

        IF v_validation->>'max' IS NOT NULL AND v_num_value > (v_validation->>'max')::NUMERIC THEN
            RAISE EXCEPTION 'Value % is above maximum %', v_num_value, v_validation->>'max';
        END IF;
    END IF;

    IF v_validation IS NOT NULL AND v_validation->'options' IS NOT NULL THEN
        IF NOT (p_value #>> '{}') = ANY(ARRAY(SELECT jsonb_array_elements_text(v_validation->'options'))) THEN
            RAISE EXCEPTION 'Value must be one of: %', v_validation->'options';
        END IF;
    END IF;

    -- Update the setting
    UPDATE public.settings SET value = p_value WHERE key = p_key;

    -- Update history with reason if provided
    IF p_reason IS NOT NULL THEN
        UPDATE public.settings_history
        SET change_reason = p_reason
        WHERE setting_id = v_setting.id
        AND changed_at = (SELECT MAX(changed_at) FROM public.settings_history WHERE setting_id = v_setting.id);
    END IF;

    RETURN true;
END;
$$;


ALTER FUNCTION "public"."update_setting"("p_key" character varying, "p_value" "jsonb", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_setting"("p_key" character varying, "p_value" "jsonb", "p_reason" "text") IS 'Update a setting with validation';



CREATE OR REPLACE FUNCTION "public"."update_settings_bulk"("p_settings" "jsonb") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_item RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_each(p_settings)
    LOOP
        IF public.update_setting(v_item.key, v_item.value) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;

    RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."update_settings_bulk"("p_settings" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_settings_bulk"("p_settings" "jsonb") IS 'Update multiple settings at once';



CREATE OR REPLACE FUNCTION "public"."update_stock_locations_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_stock_locations_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_suppliers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_suppliers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sync_devices_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sync_devices_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tables_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_tables_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_transfer_totals"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_items_count INTEGER;
    total_value_sum NUMERIC(12,2);
BEGIN
    SELECT
        COUNT(*),
        COALESCE(SUM(line_total), 0)
    INTO
        total_items_count,
        total_value_sum
    FROM public.transfer_items
    WHERE transfer_id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    UPDATE public.internal_transfers
    SET
        total_items = total_items_count,
        total_value = total_value_sum
    WHERE id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_transfer_totals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_any_role"("required_roles" "text"[]) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid()
    AND role::TEXT = ANY(required_roles)
    AND is_active = true
  );
$$;


ALTER FUNCTION "public"."user_has_any_role"("required_roles" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_permission"("p_user_id" "uuid", "p_permission_code" character varying) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    -- Fallback: Check if tables from 040 exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
        -- Use proper permission check from 040
        RETURN EXISTS (
            SELECT 1
            FROM public.user_roles ur
            JOIN public.role_permissions rp ON ur.role_id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = p_user_id
            AND p.code = p_permission_code
            AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
            AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
        );
    ELSE
        -- Fallback: allow all authenticated users if permission system not yet deployed
        RETURN p_user_id IS NOT NULL;
    END IF;
END;
$$;


ALTER FUNCTION "public"."user_has_permission"("p_user_id" "uuid", "p_permission_code" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_has_permission"("p_user_id" "uuid", "p_permission_code" character varying) IS 'Check if a user has a specific permission (direct or via role)';



CREATE OR REPLACE FUNCTION "public"."user_has_role"("required_role" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid()
    AND role::TEXT = required_role
    AND is_active = true
  );
$$;


ALTER FUNCTION "public"."user_has_role"("required_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_device_token"("p_device_id" character varying, "p_token_hash" character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_stored_hash VARCHAR;
BEGIN
    SELECT token_hash INTO v_stored_hash
    FROM public.sync_devices
    WHERE device_id = p_device_id AND is_active = TRUE;

    IF v_stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN v_stored_hash = p_token_hash;
END;
$$;


ALTER FUNCTION "public"."verify_device_token"("p_device_id" character varying, "p_token_hash" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_manager_pin"("pin_input" character varying) RETURNS TABLE("user_id" "uuid", "user_name" character varying, "is_valid" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."verify_manager_pin"("pin_input" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."verify_manager_pin"("pin_input" character varying) IS 'Verify manager/admin PIN using bcrypt comparison (secure version)';



CREATE OR REPLACE FUNCTION "public"."verify_user_pin"("p_user_id" "uuid", "p_pin" character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_stored_hash VARCHAR;
    v_failed_attempts INTEGER;
    v_locked_until TIMESTAMPTZ;
BEGIN
    -- Get user info
    SELECT pin_hash, failed_login_attempts, locked_until
    INTO v_stored_hash, v_failed_attempts, v_locked_until
    FROM public.user_profiles
    WHERE id = p_user_id AND is_active = true;

    -- Check if account is locked
    IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
        RETURN false;
    END IF;

    -- Verify PIN
    IF v_stored_hash IS NOT NULL AND v_stored_hash = extensions.crypt(p_pin, v_stored_hash) THEN
        -- Reset failed attempts on success
        UPDATE public.user_profiles
        SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW()
        WHERE id = p_user_id;

        RETURN true;
    ELSE
        -- Increment failed attempts
        UPDATE public.user_profiles
        SET
            failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE
                WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
                ELSE NULL
            END
        WHERE id = p_user_id;

        RETURN false;
    END IF;
END;
$$;


ALTER FUNCTION "public"."verify_user_pin"("p_user_id" "uuid", "p_pin" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."verify_user_pin"("p_user_id" "uuid", "p_pin" character varying) IS 'Verify user PIN with lockout protection';



CREATE OR REPLACE FUNCTION "public"."warn_plaintext_pin"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.pin_code IS NOT NULL AND NEW.pin_code != '' THEN
        RAISE WARNING 'SECURITY: Plaintext PIN detected for user %. Use set_user_pin() function instead.', NEW.id;
        -- Auto-hash and clear plaintext
        NEW.pin_hash := extensions.crypt(NEW.pin_code, extensions.gen_salt('bf', 8));
        NEW.pin_code := NULL;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."warn_plaintext_pin"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action_type" character varying(100) NOT NULL,
    "severity" "public"."audit_severity" DEFAULT 'info'::"public"."audit_severity",
    "entity_type" character varying(50),
    "entity_id" "uuid",
    "old_value" "jsonb",
    "new_value" "jsonb",
    "reason" "text",
    "requires_manager" boolean DEFAULT false,
    "manager_approved" boolean,
    "manager_id" "uuid",
    "user_id" "uuid",
    "user_name" character varying(200),
    "user_role" "public"."user_role",
    "ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "session_id" "uuid"
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" character varying(100) NOT NULL,
    "module" character varying(50) NOT NULL,
    "entity_type" character varying(50),
    "entity_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "session_id" "uuid",
    "severity" character varying(20) DEFAULT 'info'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Complete audit trail of all sensitive operations';



CREATE TABLE IF NOT EXISTS "public"."b2b_deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "delivery_number" "text",
    "order_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "scheduled_date" timestamp with time zone,
    "actual_date" timestamp with time zone,
    "delivery_address" "text",
    "driver_name" "text",
    "vehicle_info" "text",
    "received_by" "text",
    "signature_url" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "b2b_deliveries_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_transit'::"text", 'delivered'::"text", 'partial'::"text", 'failed'::"text", 'returned'::"text"])))
);


ALTER TABLE "public"."b2b_deliveries" OWNER TO "postgres";


COMMENT ON TABLE "public"."b2b_deliveries" IS 'Delivery records for B2B orders';



CREATE TABLE IF NOT EXISTS "public"."b2b_delivery_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "delivery_id" "uuid" NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "quantity_delivered" numeric(15,2) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."b2b_delivery_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."b2b_delivery_items" IS 'Items included in each delivery';



CREATE TABLE IF NOT EXISTS "public"."b2b_order_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "previous_status" "text",
    "new_status" "text",
    "description" "text" NOT NULL,
    "metadata" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."b2b_order_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."b2b_order_history" IS 'Activity log and audit trail for B2B orders';



CREATE TABLE IF NOT EXISTS "public"."b2b_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_name" character varying(200) NOT NULL,
    "product_sku" character varying(50),
    "quantity" numeric(10,3) NOT NULL,
    "unit_price" numeric(12,2) NOT NULL,
    "discount_percent" numeric(5,2) DEFAULT 0,
    "total" numeric(12,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."b2b_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."b2b_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" character varying(30) NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "delivery_date" "date",
    "delivered_at" timestamp with time zone,
    "status" "public"."order_status" DEFAULT 'new'::"public"."order_status",
    "payment_status" "public"."payment_status" DEFAULT 'unpaid'::"public"."payment_status",
    "subtotal" numeric(15,2) DEFAULT 0,
    "discount_percent" numeric(5,2) DEFAULT 0,
    "discount_amount" numeric(15,2) DEFAULT 0,
    "tax_rate" numeric(5,4) DEFAULT 0.11,
    "tax_amount" numeric(15,2) DEFAULT 0,
    "total" numeric(15,2) DEFAULT 0,
    "payment_method" "public"."payment_method" DEFAULT 'transfer'::"public"."payment_method",
    "paid_amount" numeric(15,2) DEFAULT 0,
    "paid_at" timestamp with time zone,
    "stock_deducted" boolean DEFAULT false,
    "invoice_number" character varying(30),
    "invoice_generated_at" timestamp with time zone,
    "invoice_url" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."b2b_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."b2b_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_number" "text",
    "order_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "amount" numeric(15,2) NOT NULL,
    "payment_method" "text" NOT NULL,
    "payment_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reference_number" "text",
    "bank_name" "text",
    "status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "notes" "text",
    "received_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "b2b_payments_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['cash'::"text", 'transfer'::"text", 'check'::"text", 'card'::"text", 'qris'::"text", 'credit'::"text"]))),
    CONSTRAINT "b2b_payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."b2b_payments" OWNER TO "postgres";


COMMENT ON TABLE "public"."b2b_payments" IS 'Payment records for B2B orders';



CREATE TABLE IF NOT EXISTS "public"."business_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_of_week" integer NOT NULL,
    "open_time" time without time zone,
    "close_time" time without time zone,
    "is_closed" boolean DEFAULT false,
    "break_start" time without time zone,
    "break_end" time without time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "business_hours_day_of_week_check" CHECK ((("day_of_week" >= 0) AND ("day_of_week" <= 6)))
);


ALTER TABLE "public"."business_hours" OWNER TO "postgres";


COMMENT ON TABLE "public"."business_hours" IS 'Store opening hours per day of week';



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "icon" character varying(10),
    "color" character varying(7),
    "dispatch_station" "public"."dispatch_station" DEFAULT 'none'::"public"."dispatch_station",
    "is_raw_material" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#BA90A2'::"text",
    "icon" "text" DEFAULT 'users'::"text",
    "price_modifier_type" "text" DEFAULT 'retail'::"text" NOT NULL,
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "loyalty_enabled" boolean DEFAULT false NOT NULL,
    "points_per_amount" numeric(10,2) DEFAULT 1000,
    "points_multiplier" numeric(5,2) DEFAULT 1.0,
    "auto_discount_enabled" boolean DEFAULT false,
    "auto_discount_threshold" integer DEFAULT 100,
    "auto_discount_percentage" numeric(5,2) DEFAULT 10,
    "sort_order" integer DEFAULT 0,
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "customer_categories_price_modifier_type_check" CHECK (("price_modifier_type" = ANY (ARRAY['retail'::"text", 'wholesale'::"text", 'custom'::"text", 'discount_percentage'::"text"])))
);


ALTER TABLE "public"."customer_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_categories" IS 'Customer segments with different pricing and loyalty rules';



CREATE TABLE IF NOT EXISTS "public"."customer_category_prices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "custom_price" numeric(12,2) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customer_category_prices" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_category_prices" IS 'Custom prices per product for specific customer categories';



CREATE TABLE IF NOT EXISTS "public"."customer_invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "invoice_number" character varying(50) NOT NULL,
    "invoice_date" timestamp with time zone DEFAULT "now"(),
    "due_date" timestamp with time zone NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "paid_amount" numeric(12,2) DEFAULT 0,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(200) NOT NULL,
    "phone" character varying(30),
    "email" character varying(255),
    "address" "text",
    "customer_type" "public"."customer_type" DEFAULT 'retail'::"public"."customer_type",
    "company_name" character varying(200),
    "tax_id" character varying(50),
    "payment_terms" "public"."payment_terms" DEFAULT 'cod'::"public"."payment_terms",
    "credit_limit" numeric(15,2) DEFAULT 0,
    "loyalty_points" integer DEFAULT 0,
    "total_visits" integer DEFAULT 0,
    "total_spent" numeric(15,2) DEFAULT 0,
    "last_visit_at" timestamp with time zone,
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "credit_balance" numeric(12,2) DEFAULT 0,
    "payment_terms_days" integer DEFAULT 0,
    "credit_status" character varying(20) DEFAULT 'none'::character varying
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."display_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "pos_terminal_id" "uuid",
    "layout_config" "jsonb" DEFAULT '{"showCart": true, "showQueue": true, "showPromos": true, "cartFontSize": 18, "priceFontSize": 24, "totalFontSize": 32, "showReadyOrders": true}'::"jsonb",
    "promo_rotation_interval" integer DEFAULT 10,
    "idle_timeout" integer DEFAULT 30,
    "audio_enabled" boolean DEFAULT true,
    "audio_volume" numeric(3,2) DEFAULT 0.7,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."display_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."display_order_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "display_id" "uuid",
    "order_id" "uuid",
    "order_number" character varying(20) NOT NULL,
    "status" character varying(20) DEFAULT 'preparing'::character varying,
    "received_at" timestamp with time zone DEFAULT "now"(),
    "ready_at" timestamp with time zone,
    "called_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    CONSTRAINT "display_order_queue_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['preparing'::character varying, 'ready'::character varying, 'called'::character varying, 'completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."display_order_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."display_promotions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "display_id" "uuid",
    "title" character varying(200) NOT NULL,
    "subtitle" character varying(500),
    "image_url" "text",
    "background_color" character varying(20) DEFAULT '#BA90A2'::character varying,
    "text_color" character varying(20) DEFAULT '#FFFFFF'::character varying,
    "promotion_id" "uuid",
    "priority" integer DEFAULT 0,
    "duration" integer DEFAULT 10,
    "start_date" "date",
    "end_date" "date",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."display_promotions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "name_fr" character varying(100) NOT NULL,
    "name_en" character varying(100) NOT NULL,
    "name_id" character varying(100) NOT NULL,
    "subject_fr" character varying(200),
    "subject_en" character varying(200),
    "subject_id" character varying(200),
    "body_fr" "text",
    "body_en" "text",
    "body_id" "text",
    "variables" "jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."email_templates" IS 'Email templates for notifications';



CREATE TABLE IF NOT EXISTS "public"."floor_plan_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "number" "text",
    "capacity" integer,
    "section" "text",
    "status" "text",
    "shape" "text" NOT NULL,
    "decoration_type" "text",
    "x" numeric(5,2) DEFAULT 50.00 NOT NULL,
    "y" numeric(5,2) DEFAULT 50.00 NOT NULL,
    "width" integer,
    "height" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "floor_plan_items_decoration_type_check" CHECK (("decoration_type" = ANY (ARRAY['plant'::"text", 'wall'::"text", 'bar'::"text", 'entrance'::"text"]))),
    CONSTRAINT "floor_plan_items_shape_check" CHECK (("shape" = ANY (ARRAY['square'::"text", 'round'::"text", 'rectangle'::"text"]))),
    CONSTRAINT "floor_plan_items_status_check" CHECK (("status" = ANY (ARRAY['available'::"text", 'occupied'::"text", 'reserved'::"text"]))),
    CONSTRAINT "floor_plan_items_type_check" CHECK (("type" = ANY (ARRAY['table'::"text", 'decoration'::"text"])))
);


ALTER TABLE "public"."floor_plan_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."floor_plan_items" IS 'Stores floor plan items including tables with different shapes and decoration elements (plants, walls, bars, etc.)';



COMMENT ON COLUMN "public"."floor_plan_items"."type" IS 'Type of item: table or decoration';



COMMENT ON COLUMN "public"."floor_plan_items"."shape" IS 'Shape of the item: square, round, or rectangle';



COMMENT ON COLUMN "public"."floor_plan_items"."decoration_type" IS 'Type of decoration: plant, wall, bar, or entrance (only for decoration type)';



COMMENT ON COLUMN "public"."floor_plan_items"."x" IS 'Horizontal position as percentage (0-100)';



COMMENT ON COLUMN "public"."floor_plan_items"."y" IS 'Vertical position as percentage (0-100)';



COMMENT ON COLUMN "public"."floor_plan_items"."width" IS 'Width in pixels';



COMMENT ON COLUMN "public"."floor_plan_items"."height" IS 'Height in pixels';



CREATE TABLE IF NOT EXISTS "public"."internal_transfers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transfer_number" "text" NOT NULL,
    "from_location_id" "uuid" NOT NULL,
    "to_location_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "requested_by" "uuid",
    "requested_by_name" "text",
    "approved_by" "uuid",
    "approved_by_name" "text",
    "received_by" "uuid",
    "received_by_name" "text",
    "responsible_person" "text" NOT NULL,
    "transfer_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "requested_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "shipped_at" timestamp with time zone,
    "received_at" timestamp with time zone,
    "total_items" integer DEFAULT 0,
    "total_value" numeric(12,2) DEFAULT 0,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "internal_transfers_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'in_transit'::"text", 'received'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."internal_transfers" OWNER TO "postgres";


COMMENT ON TABLE "public"."internal_transfers" IS 'Internal transfer requests between locations';



CREATE TABLE IF NOT EXISTS "public"."inventory_count_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "inventory_count_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "system_stock" numeric(10,3) NOT NULL,
    "actual_stock" numeric(10,3),
    "variance" numeric(10,3),
    "unit" character varying(20),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inventory_count_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_counts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "count_number" character varying(30) NOT NULL,
    "status" "public"."inventory_count_status" DEFAULT 'draft'::"public"."inventory_count_status",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "started_by" "uuid",
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."inventory_counts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lan_messages_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_type" character varying(50) NOT NULL,
    "from_device" character varying(100) NOT NULL,
    "to_device" character varying(100),
    "payload_hash" character varying(64),
    "payload_size" integer,
    "status" character varying(20) DEFAULT 'sent'::character varying,
    "error_message" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "lan_messages_log_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'timeout'::character varying])::"text"[])))
);


ALTER TABLE "public"."lan_messages_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."lan_messages_log" IS 'Audit log of LAN messages for debugging and monitoring';



COMMENT ON COLUMN "public"."lan_messages_log"."message_type" IS 'Type of LAN message (heartbeat, cart_update, order_sync, etc.)';



COMMENT ON COLUMN "public"."lan_messages_log"."payload_hash" IS 'SHA-256 hash of message payload for integrity verification';



CREATE TABLE IF NOT EXISTS "public"."lan_nodes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "device_id" character varying(100) NOT NULL,
    "device_type" character varying(50) NOT NULL,
    "device_name" character varying(100),
    "ip_address" "inet" NOT NULL,
    "port" integer NOT NULL,
    "is_hub" boolean DEFAULT false,
    "status" character varying(20) DEFAULT 'online'::character varying,
    "last_heartbeat" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "lan_nodes_device_type_check" CHECK ((("device_type")::"text" = ANY ((ARRAY['pos'::character varying, 'mobile'::character varying, 'display'::character varying, 'kds'::character varying])::"text"[]))),
    CONSTRAINT "lan_nodes_port_check" CHECK ((("port" > 0) AND ("port" <= 65535))),
    CONSTRAINT "lan_nodes_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['online'::character varying, 'offline'::character varying, 'unknown'::character varying])::"text"[])))
);


ALTER TABLE "public"."lan_nodes" OWNER TO "postgres";


COMMENT ON TABLE "public"."lan_nodes" IS 'Registry of devices on the local network for P2P communication';



COMMENT ON COLUMN "public"."lan_nodes"."device_id" IS 'Unique device identifier (from terminal registration)';



COMMENT ON COLUMN "public"."lan_nodes"."ip_address" IS 'Current LAN IP address of the device';



COMMENT ON COLUMN "public"."lan_nodes"."port" IS 'WebSocket port the device is listening on';



COMMENT ON COLUMN "public"."lan_nodes"."is_hub" IS 'Whether this device acts as the LAN hub/coordinator';



COMMENT ON COLUMN "public"."lan_nodes"."last_heartbeat" IS 'Timestamp of last heartbeat received';



CREATE TABLE IF NOT EXISTS "public"."loyalty_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "loyalty_transaction_id" "uuid",
    "points_used" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "redeemed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_redemptions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'applied'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."loyalty_redemptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."loyalty_redemptions" IS 'Record of reward redemptions by customers';



CREATE TABLE IF NOT EXISTS "public"."loyalty_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "reward_type" "text" NOT NULL,
    "product_id" "uuid",
    "discount_value" numeric(12,2),
    "min_order_amount" numeric(12,2) DEFAULT 0,
    "points_required" integer NOT NULL,
    "quantity_available" integer,
    "quantity_redeemed" integer DEFAULT 0,
    "valid_from" "date",
    "valid_until" "date",
    "min_tier" "text" DEFAULT 'bronze'::"text",
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_rewards_reward_type_check" CHECK (("reward_type" = ANY (ARRAY['product'::"text", 'discount_fixed'::"text", 'discount_percentage'::"text", 'free_item'::"text"])))
);


ALTER TABLE "public"."loyalty_rewards" OWNER TO "postgres";


COMMENT ON TABLE "public"."loyalty_rewards" IS 'Redeemable rewards in the loyalty program';



CREATE TABLE IF NOT EXISTS "public"."loyalty_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "min_lifetime_points" integer NOT NULL,
    "color" "text" DEFAULT '#CD7F32'::"text",
    "icon" "text" DEFAULT 'award'::"text",
    "points_multiplier" numeric(5,2) DEFAULT 1.0,
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "free_delivery" boolean DEFAULT false,
    "priority_support" boolean DEFAULT false,
    "birthday_bonus_points" integer DEFAULT 0,
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."loyalty_tiers" OWNER TO "postgres";


COMMENT ON TABLE "public"."loyalty_tiers" IS 'Loyalty program tiers with associated benefits';



CREATE TABLE IF NOT EXISTS "public"."loyalty_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "transaction_type" "text" NOT NULL,
    "points" integer NOT NULL,
    "points_balance_after" integer NOT NULL,
    "order_amount" numeric(12,2),
    "points_rate" numeric(10,2),
    "multiplier" numeric(5,2) DEFAULT 1.0,
    "discount_applied" numeric(12,2),
    "description" "text",
    "reference_number" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "loyalty_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['earn'::"text", 'redeem'::"text", 'expire'::"text", 'adjust'::"text", 'bonus'::"text", 'refund'::"text"])))
);


ALTER TABLE "public"."loyalty_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."loyalty_transactions" IS 'Audit trail of all loyalty point transactions';



CREATE TABLE IF NOT EXISTS "public"."offline_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "table_name" character varying(100) NOT NULL,
    "version" integer DEFAULT 1,
    "last_sync" timestamp with time zone DEFAULT "now"(),
    "checksum" character varying(64),
    "row_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "offline_versions_version_positive" CHECK (("version" > 0))
);


ALTER TABLE "public"."offline_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."offline_versions" IS 'Tracks version and sync state of offline-cached tables';



COMMENT ON COLUMN "public"."offline_versions"."checksum" IS 'SHA-256 hash of table data for integrity verification';



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "product_name" character varying(200) NOT NULL,
    "product_sku" character varying(50),
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(12,2) NOT NULL,
    "total_price" numeric(12,2) NOT NULL,
    "modifiers" "jsonb",
    "modifiers_total" numeric(12,2) DEFAULT 0,
    "notes" "text",
    "dispatch_station" "public"."dispatch_station",
    "item_status" "public"."item_status" DEFAULT 'new'::"public"."item_status",
    "sent_to_kitchen_at" timestamp with time zone,
    "prepared_at" timestamp with time zone,
    "prepared_by" "uuid",
    "served_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_held" boolean DEFAULT false,
    "selected_variants" "jsonb"
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."order_items"."selected_variants" IS 'Variants sélectionnés avec leurs ingrédients pour déduction stock';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" character varying(30) NOT NULL,
    "order_type" "public"."order_type" DEFAULT 'dine_in'::"public"."order_type",
    "table_number" character varying(10),
    "customer_id" "uuid",
    "customer_name" character varying(200),
    "status" "public"."order_status" DEFAULT 'new'::"public"."order_status",
    "payment_status" "public"."payment_status" DEFAULT 'unpaid'::"public"."payment_status",
    "subtotal" numeric(12,2) DEFAULT 0,
    "discount_type" "public"."discount_type",
    "discount_value" numeric(10,2) DEFAULT 0,
    "discount_amount" numeric(12,2) DEFAULT 0,
    "discount_reason" "text",
    "discount_requires_manager" boolean DEFAULT false,
    "discount_manager_id" "uuid",
    "tax_rate" numeric(5,4) DEFAULT 0.11,
    "tax_amount" numeric(12,2) DEFAULT 0,
    "total" numeric(12,2) DEFAULT 0,
    "payment_method" "public"."payment_method",
    "payment_details" "jsonb",
    "cash_received" numeric(12,2),
    "change_given" numeric(12,2),
    "points_earned" integer DEFAULT 0,
    "points_used" integer DEFAULT 0,
    "points_discount" numeric(12,2) DEFAULT 0,
    "staff_id" "uuid",
    "session_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "cancelled_by" "uuid",
    "cancellation_reason" "text",
    "source" character varying(20) DEFAULT 'pos'::character varying,
    CONSTRAINT "orders_source_check" CHECK ((("source")::"text" = ANY ((ARRAY['pos'::character varying, 'mobile'::character varying, 'web'::character varying, 'b2b'::character varying])::"text"[])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(30) NOT NULL,
    "name_fr" character varying(100) NOT NULL,
    "name_en" character varying(100) NOT NULL,
    "name_id" character varying(100) NOT NULL,
    "icon" character varying(50),
    "payment_type" character varying(30) NOT NULL,
    "is_active" boolean DEFAULT true,
    "is_default" boolean DEFAULT false,
    "requires_reference" boolean DEFAULT false,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_methods" IS 'Available payment methods for POS';



CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(100) NOT NULL,
    "module" character varying(50) NOT NULL,
    "action" character varying(50) NOT NULL,
    "name_fr" character varying(150) NOT NULL,
    "name_en" character varying(150) NOT NULL,
    "name_id" character varying(150) NOT NULL,
    "description" "text",
    "is_sensitive" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."permissions" IS 'Granular permissions catalog organized by module and action';



CREATE TABLE IF NOT EXISTS "public"."po_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "po_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity_ordered" numeric(10,3) NOT NULL,
    "quantity_received" numeric(10,3) DEFAULT 0,
    "unit_price" numeric(12,2) NOT NULL,
    "total" numeric(12,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."po_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pos_terminals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "terminal_name" character varying(100) NOT NULL,
    "device_id" character varying(100) NOT NULL,
    "is_hub" boolean DEFAULT false,
    "location" character varying(200),
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "mode" character varying(30) DEFAULT 'primary'::character varying,
    "default_printer_id" "uuid",
    "kitchen_printer_id" "uuid",
    "kds_station" character varying(30),
    "allowed_payment_methods" "jsonb" DEFAULT '[]'::"jsonb",
    "default_order_type" character varying(20),
    "floor_plan_id" "uuid",
    "auto_logout_timeout" integer,
    CONSTRAINT "pos_terminals_mode_check" CHECK ((("mode")::"text" = ANY ((ARRAY['primary'::character varying, 'secondary'::character varying, 'self_service'::character varying, 'kds_only'::character varying])::"text"[]))),
    CONSTRAINT "pos_terminals_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::"text"[])))
);


ALTER TABLE "public"."pos_terminals" OWNER TO "postgres";


COMMENT ON TABLE "public"."pos_terminals" IS 'Registered POS terminals for LAN communication and sync tracking';



COMMENT ON COLUMN "public"."pos_terminals"."device_id" IS 'Unique identifier generated client-side (UUID)';



COMMENT ON COLUMN "public"."pos_terminals"."is_hub" IS 'Whether this terminal acts as the WebSocket hub for LAN communication';



COMMENT ON COLUMN "public"."pos_terminals"."status" IS 'Terminal status: active, inactive, or maintenance';



CREATE TABLE IF NOT EXISTS "public"."printer_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "printer_type" character varying(50) NOT NULL,
    "connection_type" character varying(50) NOT NULL,
    "connection_string" "text",
    "paper_width" integer DEFAULT 80,
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."printer_configurations" OWNER TO "postgres";


COMMENT ON TABLE "public"."printer_configurations" IS 'Printer configurations for receipts, labels, and kitchen orders';



CREATE TABLE IF NOT EXISTS "public"."product_category_prices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "customer_category_id" "uuid" NOT NULL,
    "price" numeric(12,2) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_category_prices" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_category_prices" IS 'Prix personnalisés des produits par catégorie client';



COMMENT ON COLUMN "public"."product_category_prices"."price" IS 'Prix spécifique pour cette combinaison produit/catégorie';



CREATE TABLE IF NOT EXISTS "public"."product_combo_group_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "price_adjustment" numeric(10,2) DEFAULT 0,
    "is_default" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_combo_group_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_combo_group_items" IS 'Available product options within each choice group with price adjustments';



COMMENT ON COLUMN "public"."product_combo_group_items"."price_adjustment" IS 'Additional price for this option (0 = included in base price, positive = extra charge)';



CREATE TABLE IF NOT EXISTS "public"."product_combo_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "combo_id" "uuid" NOT NULL,
    "group_name" character varying(255) NOT NULL,
    "group_type" character varying(20) DEFAULT 'single'::character varying NOT NULL,
    "is_required" boolean DEFAULT true,
    "min_selections" integer DEFAULT 1,
    "max_selections" integer DEFAULT 1,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_combo_groups" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_combo_groups" IS 'Choice groups within combos (e.g., Drinks group, Pastries group)';



COMMENT ON COLUMN "public"."product_combo_groups"."group_type" IS 'single = choose 1, multiple = choose many';



COMMENT ON COLUMN "public"."product_combo_groups"."is_required" IS 'Whether customer must make a selection from this group';



COMMENT ON COLUMN "public"."product_combo_groups"."min_selections" IS 'Minimum number of items to select (for multiple type)';



COMMENT ON COLUMN "public"."product_combo_groups"."max_selections" IS 'Maximum number of items to select';



CREATE TABLE IF NOT EXISTS "public"."product_combos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "combo_price" numeric(10,2) NOT NULL,
    "is_active" boolean DEFAULT true,
    "available_at_pos" boolean DEFAULT true,
    "image_url" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_combos" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_combos" IS 'Product combo deals (e.g., Coffee + Croissant bundle)';



CREATE TABLE IF NOT EXISTS "public"."product_modifiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "category_id" "uuid",
    "group_name" character varying(100) NOT NULL,
    "group_type" "public"."modifier_group_type" DEFAULT 'single'::"public"."modifier_group_type",
    "group_required" boolean DEFAULT false,
    "group_sort_order" integer DEFAULT 0,
    "option_id" character varying(50) NOT NULL,
    "option_label" character varying(100) NOT NULL,
    "option_icon" character varying(10),
    "price_adjustment" numeric(10,2) DEFAULT 0,
    "is_default" boolean DEFAULT false,
    "option_sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "material_id" "uuid",
    "material_quantity" numeric(10,3) DEFAULT 0,
    "materials" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "check_modifier_link" CHECK (((("product_id" IS NOT NULL) AND ("category_id" IS NULL)) OR (("product_id" IS NULL) AND ("category_id" IS NOT NULL))))
);


ALTER TABLE "public"."product_modifiers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."product_modifiers"."material_id" IS 'Produit/ingrédient à déduire du stock pour cette option de variant';



COMMENT ON COLUMN "public"."product_modifiers"."material_quantity" IS 'Quantité d''ingrédient à déduire (ex: 250 pour 250ml de lait d''avoine)';



COMMENT ON COLUMN "public"."product_modifiers"."materials" IS 'Tableau d''ingrédients à déduire: [{"material_id": "uuid", "quantity": 250}, ...]';



CREATE TABLE IF NOT EXISTS "public"."product_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "section_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."product_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_stocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_id" "uuid",
    "product_id" "uuid",
    "quantity" numeric DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."product_stocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_uoms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "unit_name" character varying(50) NOT NULL,
    "conversion_factor" numeric(12,4) NOT NULL,
    "is_purchase_unit" boolean DEFAULT false,
    "is_consumption_unit" boolean DEFAULT false,
    "barcode" character varying(100),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_stock_opname_unit" boolean DEFAULT false
);


ALTER TABLE "public"."product_uoms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "production_id" character varying(30) NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity_produced" numeric(10,3) NOT NULL,
    "quantity_waste" numeric(10,3) DEFAULT 0,
    "production_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "staff_id" "uuid",
    "staff_name" character varying(200),
    "stock_updated" boolean DEFAULT false,
    "materials_consumed" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'completed'::character varying
);


ALTER TABLE "public"."production_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sku" character varying(50) NOT NULL,
    "name" character varying(200) NOT NULL,
    "description" "text",
    "category_id" "uuid",
    "product_type" "public"."product_type" DEFAULT 'finished'::"public"."product_type",
    "retail_price" numeric(12,2) DEFAULT 0,
    "wholesale_price" numeric(12,2) DEFAULT 0,
    "cost_price" numeric(12,2) DEFAULT 0,
    "current_stock" numeric(10,3) DEFAULT 0,
    "min_stock_level" numeric(10,3) DEFAULT 0,
    "unit" character varying(20) DEFAULT 'pcs'::character varying,
    "pos_visible" boolean DEFAULT true,
    "available_for_sale" boolean DEFAULT true,
    "image_url" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deduct_ingredients_on_sale" boolean DEFAULT false
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."deduct_ingredients_on_sale" IS 'If true, deduct recipe ingredients when this product is sold (made-to-order items like coffee, sandwiches). If false, ingredients were already deducted during batch production (croissants, bread, etc.)';



CREATE TABLE IF NOT EXISTS "public"."promotion_free_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "free_product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."promotion_free_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_free_products" IS 'Free products offered in promotions';



CREATE TABLE IF NOT EXISTS "public"."promotion_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "category_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_product_or_category" CHECK (((("product_id" IS NOT NULL) AND ("category_id" IS NULL)) OR (("product_id" IS NULL) AND ("category_id" IS NOT NULL))))
);


ALTER TABLE "public"."promotion_products" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_products" IS 'Products/categories eligible for promotions';



CREATE TABLE IF NOT EXISTS "public"."promotion_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promotion_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "order_id" "uuid",
    "discount_amount" numeric(10,2) NOT NULL,
    "used_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."promotion_usage" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotion_usage" IS 'Tracks promotion usage per customer and order';



CREATE TABLE IF NOT EXISTS "public"."promotions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "promotion_type" character varying(50) NOT NULL,
    "is_active" boolean DEFAULT true,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "days_of_week" integer[],
    "time_start" time without time zone,
    "time_end" time without time zone,
    "discount_percentage" numeric(5,2),
    "discount_amount" numeric(10,2),
    "buy_quantity" integer,
    "get_quantity" integer,
    "min_purchase_amount" numeric(10,2),
    "min_quantity" integer,
    "max_uses_total" integer,
    "max_uses_per_customer" integer,
    "current_uses" integer DEFAULT 0,
    "priority" integer DEFAULT 0,
    "is_stackable" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."promotions" OWNER TO "postgres";


COMMENT ON TABLE "public"."promotions" IS 'Time-based promotions with flexible rules';



CREATE TABLE IF NOT EXISTS "public"."purchase_order_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "previous_status" "text",
    "new_status" "text",
    "description" "text" NOT NULL,
    "changed_by" "uuid",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchase_order_history_action_type_check" CHECK (("action_type" = ANY (ARRAY['created'::"text", 'modified'::"text", 'sent'::"text", 'confirmed'::"text", 'received'::"text", 'partially_received'::"text", 'cancelled'::"text", 'payment_made'::"text", 'item_returned'::"text"])))
);


ALTER TABLE "public"."purchase_order_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_order_history" IS 'Audit trail for all purchase order changes';



CREATE TABLE IF NOT EXISTS "public"."purchase_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "product_name" "text" NOT NULL,
    "description" "text",
    "quantity" numeric(10,2) NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount_percentage" numeric(5,2),
    "tax_rate" numeric(5,2) DEFAULT 0 NOT NULL,
    "line_total" numeric(10,2) NOT NULL,
    "quantity_received" numeric(10,2) DEFAULT 0 NOT NULL,
    "quantity_returned" numeric(10,2) DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "unit" "text" DEFAULT 'kg'::"text" NOT NULL,
    CONSTRAINT "purchase_order_items_discount_check" CHECK (("discount_amount" >= (0)::numeric)),
    CONSTRAINT "purchase_order_items_discount_percentage_check" CHECK ((("discount_percentage" IS NULL) OR (("discount_percentage" >= (0)::numeric) AND ("discount_percentage" <= (100)::numeric)))),
    CONSTRAINT "purchase_order_items_quantity_check" CHECK (("quantity" > (0)::numeric)),
    CONSTRAINT "purchase_order_items_quantity_received_check" CHECK ((("quantity_received" >= (0)::numeric) AND ("quantity_received" <= "quantity"))),
    CONSTRAINT "purchase_order_items_quantity_returned_check" CHECK ((("quantity_returned" >= (0)::numeric) AND ("quantity_returned" <= "quantity_received"))),
    CONSTRAINT "purchase_order_items_unit_price_check" CHECK (("unit_price" >= (0)::numeric))
);


ALTER TABLE "public"."purchase_order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_order_items" IS 'Stores line items for each purchase order';



COMMENT ON COLUMN "public"."purchase_order_items"."unit" IS 'Unit of measurement for the product (kg, g, L, mL, pcs, box, bag, etc.)';



CREATE TABLE IF NOT EXISTS "public"."purchase_order_returns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "purchase_order_item_id" "uuid" NOT NULL,
    "quantity_returned" numeric(10,2) NOT NULL,
    "reason" "text" NOT NULL,
    "reason_details" "text",
    "return_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "refund_amount" numeric(10,2),
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchase_order_returns_quantity_check" CHECK (("quantity_returned" > (0)::numeric)),
    CONSTRAINT "purchase_order_returns_reason_check" CHECK (("reason" = ANY (ARRAY['damaged'::"text", 'wrong_item'::"text", 'quality_issue'::"text", 'excess_quantity'::"text", 'other'::"text"]))),
    CONSTRAINT "purchase_order_returns_refund_check" CHECK ((("refund_amount" IS NULL) OR ("refund_amount" >= (0)::numeric))),
    CONSTRAINT "purchase_order_returns_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."purchase_order_returns" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_order_returns" IS 'Tracks item returns and refunds';



COMMENT ON COLUMN "public"."purchase_order_returns"."reason" IS 'Return reason: damaged, wrong_item, quality_issue, excess_quantity, other';



CREATE TABLE IF NOT EXISTS "public"."purchase_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "po_number" character varying(30) NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "order_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "expected_date" "date",
    "received_date" "date",
    "status" "public"."po_status" DEFAULT 'draft'::"public"."po_status",
    "expense_type" "public"."expense_type" DEFAULT 'cogs'::"public"."expense_type",
    "subtotal" numeric(15,2) DEFAULT 0,
    "tax_rate" numeric(5,4) DEFAULT 0.11,
    "tax_amount" numeric(15,2) DEFAULT 0,
    "total" numeric(15,2) DEFAULT 0,
    "notes" "text",
    "created_by" "uuid",
    "received_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."purchase_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."receipt_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "template_type" character varying(30) NOT NULL,
    "header_content" "text",
    "footer_content" "text",
    "show_logo" boolean DEFAULT true,
    "show_company_info" boolean DEFAULT true,
    "show_tax_details" boolean DEFAULT true,
    "show_payment_method" boolean DEFAULT true,
    "show_cashier_name" boolean DEFAULT true,
    "show_customer_info" boolean DEFAULT false,
    "show_loyalty_points" boolean DEFAULT true,
    "custom_css" "text",
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."receipt_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."receipt_templates" IS 'Receipt and ticket templates';



CREATE TABLE IF NOT EXISTS "public"."recipes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "material_id" "uuid" NOT NULL,
    "quantity" numeric(10,4) NOT NULL,
    "unit" character varying(20),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recipes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reporting_stock_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "snapshot_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "total_items_count" integer DEFAULT 0,
    "total_value_cost" numeric(15,2) DEFAULT 0,
    "total_value_retail" numeric(15,2) DEFAULT 0,
    "low_stock_count" integer DEFAULT 0,
    "out_of_stock_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reporting_stock_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "granted_by" "uuid"
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Many-to-many mapping between roles and permissions';



CREATE TABLE IF NOT EXISTS "public"."section_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "section_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" numeric(10,3) DEFAULT 0 NOT NULL,
    "last_updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."section_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "is_sales_point" boolean DEFAULT false,
    "is_production_point" boolean DEFAULT false,
    "is_warehouse" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "key" character varying(100) NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "value_type" character varying(20) DEFAULT 'string'::character varying NOT NULL,
    "name_fr" character varying(200) NOT NULL,
    "name_en" character varying(200) NOT NULL,
    "name_id" character varying(200) NOT NULL,
    "description_fr" "text",
    "description_en" "text",
    "description_id" "text",
    "default_value" "jsonb",
    "validation_rules" "jsonb",
    "is_sensitive" boolean DEFAULT false,
    "is_system" boolean DEFAULT false,
    "is_readonly" boolean DEFAULT false,
    "requires_restart" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid"
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings" IS 'Key-value store for all application settings with multilingual support';



CREATE TABLE IF NOT EXISTS "public"."settings_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "name_fr" character varying(100) NOT NULL,
    "name_en" character varying(100) NOT NULL,
    "name_id" character varying(100) NOT NULL,
    "description_fr" "text",
    "description_en" "text",
    "description_id" "text",
    "icon" character varying(50),
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "required_permission" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."settings_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings_categories" IS 'Categories for organizing application settings';



CREATE TABLE IF NOT EXISTS "public"."settings_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_id" "uuid" NOT NULL,
    "old_value" "jsonb",
    "new_value" "jsonb",
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"(),
    "change_reason" "text",
    "ip_address" "inet"
);


ALTER TABLE "public"."settings_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings_history" IS 'Audit trail of all setting changes';



CREATE TABLE IF NOT EXISTS "public"."settings_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "profile_type" character varying(20) DEFAULT 'custom'::character varying NOT NULL,
    "settings_snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "terminal_settings_snapshot" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT false,
    "is_system" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "settings_profiles_type_check" CHECK ((("profile_type")::"text" = ANY ((ARRAY['production'::character varying, 'test'::character varying, 'training'::character varying, 'custom'::character varying])::"text"[])))
);


ALTER TABLE "public"."settings_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings_profiles" IS 'Saved settings configurations (production, test, training)';



CREATE TABLE IF NOT EXISTS "public"."sound_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "category" character varying(30) NOT NULL,
    "file_path" character varying(255),
    "is_system" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sound_assets" OWNER TO "postgres";


COMMENT ON TABLE "public"."sound_assets" IS 'Audio files for POS notifications';



CREATE TABLE IF NOT EXISTS "public"."stock_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "location_type" "text" NOT NULL,
    "description" "text",
    "responsible_person" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "stock_locations_location_type_check" CHECK (("location_type" = ANY (ARRAY['main_warehouse'::"text", 'section'::"text", 'production'::"text", 'waste'::"text"])))
);


ALTER TABLE "public"."stock_locations" OWNER TO "postgres";


COMMENT ON TABLE "public"."stock_locations" IS 'Physical locations for stock storage (warehouse, sections, etc.)';



CREATE TABLE IF NOT EXISTS "public"."stock_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "movement_id" character varying(30) NOT NULL,
    "product_id" "uuid" NOT NULL,
    "movement_type" "public"."movement_type" NOT NULL,
    "quantity" numeric(10,3) NOT NULL,
    "unit_cost" numeric(12,2),
    "reference_type" character varying(50),
    "reference_id" "uuid",
    "stock_before" numeric(10,3) NOT NULL,
    "stock_after" numeric(10,3) NOT NULL,
    "reason" "text",
    "staff_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stock_movements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_reservations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "b2b_order_id" "uuid",
    "quantity" numeric(10,3) NOT NULL,
    "reserved_until" timestamp with time zone NOT NULL,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stock_reservations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storage_sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storage_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(200) NOT NULL,
    "phone" character varying(30),
    "email" character varying(255),
    "address" "text",
    "contact_person" character varying(200),
    "payment_terms" "public"."payment_terms" DEFAULT 'cod'::"public"."payment_terms",
    "bank_name" character varying(100),
    "bank_account" character varying(50),
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "city" character varying(100),
    "postal_code" character varying(20),
    "country" character varying(100) DEFAULT 'Indonesia'::character varying,
    "tax_id" character varying(50)
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."suppliers"."city" IS 'City where supplier is located';



COMMENT ON COLUMN "public"."suppliers"."postal_code" IS 'Postal/ZIP code';



COMMENT ON COLUMN "public"."suppliers"."country" IS 'Country (defaults to Indonesia)';



COMMENT ON COLUMN "public"."suppliers"."tax_id" IS 'Tax identification number (NPWP for Indonesia)';



CREATE TABLE IF NOT EXISTS "public"."sync_devices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "device_id" character varying(100) NOT NULL,
    "device_type" character varying(50) NOT NULL,
    "device_name" character varying(100),
    "user_id" "uuid",
    "last_seen" timestamp with time zone DEFAULT "now"(),
    "token_hash" character varying(64) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "sync_devices_device_type_check" CHECK ((("device_type")::"text" = ANY ((ARRAY['pos'::character varying, 'mobile'::character varying, 'display'::character varying, 'kds'::character varying])::"text"[])))
);


ALTER TABLE "public"."sync_devices" OWNER TO "postgres";


COMMENT ON TABLE "public"."sync_devices" IS 'Registry of devices authorized for sync operations';



COMMENT ON COLUMN "public"."sync_devices"."token_hash" IS 'SHA-256 hash of device authentication token';



CREATE TABLE IF NOT EXISTS "public"."sync_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "device_id" character varying(100) NOT NULL,
    "user_id" "uuid",
    "type" character varying(50) NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "retry_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "synced_at" timestamp with time zone,
    "error_message" "text",
    CONSTRAINT "sync_queue_retry_count_positive" CHECK (("retry_count" >= 0)),
    CONSTRAINT "sync_queue_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'syncing'::character varying, 'synced'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."sync_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."sync_queue" IS 'Queue for offline transactions pending synchronization';



COMMENT ON COLUMN "public"."sync_queue"."type" IS 'Type of operation: order, payment, stock_movement, customer, etc.';



COMMENT ON COLUMN "public"."sync_queue"."status" IS 'pending: waiting to sync, syncing: in progress, synced: completed, failed: error';



CREATE TABLE IF NOT EXISTS "public"."system_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "alert_type" character varying(50) NOT NULL,
    "severity" character varying(20) DEFAULT 'warning'::character varying,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "reference_type" character varying(50),
    "reference_id" "uuid",
    "is_read" boolean DEFAULT false,
    "is_resolved" boolean DEFAULT false,
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "resolution_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "severity" character varying(20) NOT NULL,
    "source" character varying(50) NOT NULL,
    "component" character varying(50),
    "message" "text" NOT NULL,
    "stack_trace" "text",
    "meta" "jsonb",
    "user_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "system_logs_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['info'::character varying, 'warning'::character varying, 'error'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."system_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tax_rates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(20) NOT NULL,
    "name_fr" character varying(100) NOT NULL,
    "name_en" character varying(100) NOT NULL,
    "name_id" character varying(100) NOT NULL,
    "rate" numeric(5,2) NOT NULL,
    "is_inclusive" boolean DEFAULT true,
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "applies_to" "jsonb" DEFAULT '["all"]'::"jsonb",
    "valid_from" "date",
    "valid_until" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tax_rates" OWNER TO "postgres";


COMMENT ON TABLE "public"."tax_rates" IS 'Tax rates configuration (PPN/VAT)';



CREATE TABLE IF NOT EXISTS "public"."terminal_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "terminal_id" "uuid" NOT NULL,
    "key" character varying(100) NOT NULL,
    "value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."terminal_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."terminal_settings" IS 'Per-terminal settings overrides';



CREATE TABLE IF NOT EXISTS "public"."transfer_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transfer_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity_requested" numeric(10,3) NOT NULL,
    "quantity_shipped" numeric(10,3) DEFAULT 0,
    "quantity_received" numeric(10,3) DEFAULT 0,
    "unit" "text" DEFAULT 'unit'::"text" NOT NULL,
    "unit_cost" numeric(12,2),
    "line_total" numeric(12,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."transfer_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."transfer_items" IS 'Line items for each internal transfer';



CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "is_granted" boolean DEFAULT true,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "reason" "text",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "granted_by" "uuid"
);


ALTER TABLE "public"."user_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_permissions" IS 'Direct permission grants/revocations per user (overrides role permissions)';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_user_id" "uuid",
    "name" character varying(200) NOT NULL,
    "role" "public"."user_role" DEFAULT 'cashier'::"public"."user_role" NOT NULL,
    "pin_code" character varying(10),
    "can_apply_discount" boolean DEFAULT false,
    "can_cancel_order" boolean DEFAULT false,
    "can_access_reports" boolean DEFAULT false,
    "avatar_url" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pin_hash" character varying(255),
    "failed_login_attempts" integer DEFAULT 0,
    "locked_until" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "display_name" character varying(200),
    "first_name" character varying(100),
    "last_name" character varying(100),
    "employee_code" character varying(20),
    "phone" character varying(20),
    "preferred_language" character varying(5) DEFAULT 'id'::character varying,
    "timezone" character varying(50) DEFAULT 'Asia/Makassar'::character varying,
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "assigned_by" "uuid"
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'User role assignments with optional time-based validity';



CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_token" "text" NOT NULL,
    "device_type" character varying(50),
    "device_name" character varying(200),
    "ip_address" "inet",
    "user_agent" "text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "last_activity_at" timestamp with time zone DEFAULT "now"(),
    "ended_at" timestamp with time zone,
    "end_reason" character varying(50)
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_sessions" IS 'User session tracking for security and audit';



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2b_deliveries"
    ADD CONSTRAINT "b2b_deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2b_delivery_items"
    ADD CONSTRAINT "b2b_delivery_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2b_order_history"
    ADD CONSTRAINT "b2b_order_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2b_order_items"
    ADD CONSTRAINT "b2b_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2b_orders"
    ADD CONSTRAINT "b2b_orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."b2b_orders"
    ADD CONSTRAINT "b2b_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b2b_payments"
    ADD CONSTRAINT "b2b_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_day_of_week_key" UNIQUE ("day_of_week");



ALTER TABLE ONLY "public"."business_hours"
    ADD CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_categories"
    ADD CONSTRAINT "customer_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_categories"
    ADD CONSTRAINT "customer_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."customer_category_prices"
    ADD CONSTRAINT "customer_category_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_category_prices"
    ADD CONSTRAINT "customer_category_prices_unique" UNIQUE ("category_id", "product_id");



ALTER TABLE ONLY "public"."customer_invoices"
    ADD CONSTRAINT "customer_invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."display_configurations"
    ADD CONSTRAINT "display_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."display_order_queue"
    ADD CONSTRAINT "display_order_queue_display_id_order_id_key" UNIQUE ("display_id", "order_id");



ALTER TABLE ONLY "public"."display_order_queue"
    ADD CONSTRAINT "display_order_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."display_promotions"
    ADD CONSTRAINT "display_promotions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."floor_plan_items"
    ADD CONSTRAINT "floor_plan_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."internal_transfers"
    ADD CONSTRAINT "internal_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."internal_transfers"
    ADD CONSTRAINT "internal_transfers_transfer_number_key" UNIQUE ("transfer_number");



ALTER TABLE ONLY "public"."inventory_count_items"
    ADD CONSTRAINT "inventory_count_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_counts"
    ADD CONSTRAINT "inventory_counts_count_number_key" UNIQUE ("count_number");



ALTER TABLE ONLY "public"."inventory_counts"
    ADD CONSTRAINT "inventory_counts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lan_messages_log"
    ADD CONSTRAINT "lan_messages_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lan_nodes"
    ADD CONSTRAINT "lan_nodes_device_id_unique" UNIQUE ("device_id");



ALTER TABLE ONLY "public"."lan_nodes"
    ADD CONSTRAINT "lan_nodes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_redemptions"
    ADD CONSTRAINT "loyalty_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_rewards"
    ADD CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_tiers"
    ADD CONSTRAINT "loyalty_tiers_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."loyalty_tiers"
    ADD CONSTRAINT "loyalty_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_tiers"
    ADD CONSTRAINT "loyalty_tiers_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."loyalty_transactions"
    ADD CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offline_versions"
    ADD CONSTRAINT "offline_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offline_versions"
    ADD CONSTRAINT "offline_versions_table_name_unique" UNIQUE ("table_name");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."po_items"
    ADD CONSTRAINT "po_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pos_sessions"
    ADD CONSTRAINT "pos_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pos_sessions"
    ADD CONSTRAINT "pos_sessions_session_number_key" UNIQUE ("session_number");



ALTER TABLE ONLY "public"."pos_terminals"
    ADD CONSTRAINT "pos_terminals_device_id_unique" UNIQUE ("device_id");



ALTER TABLE ONLY "public"."pos_terminals"
    ADD CONSTRAINT "pos_terminals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."printer_configurations"
    ADD CONSTRAINT "printer_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_category_prices"
    ADD CONSTRAINT "product_category_prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_category_prices"
    ADD CONSTRAINT "product_category_prices_product_id_customer_category_id_key" UNIQUE ("product_id", "customer_category_id");



ALTER TABLE ONLY "public"."product_combo_group_items"
    ADD CONSTRAINT "product_combo_group_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_combo_groups"
    ADD CONSTRAINT "product_combo_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_combos"
    ADD CONSTRAINT "product_combos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_modifiers"
    ADD CONSTRAINT "product_modifiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_sections"
    ADD CONSTRAINT "product_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_sections"
    ADD CONSTRAINT "product_sections_product_id_section_id_key" UNIQUE ("product_id", "section_id");



ALTER TABLE ONLY "public"."product_stocks"
    ADD CONSTRAINT "product_stocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_stocks"
    ADD CONSTRAINT "product_stocks_section_id_product_id_key" UNIQUE ("section_id", "product_id");



ALTER TABLE ONLY "public"."product_uoms"
    ADD CONSTRAINT "product_uoms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_uoms"
    ADD CONSTRAINT "product_uoms_product_id_unit_name_key" UNIQUE ("product_id", "unit_name");



ALTER TABLE ONLY "public"."production_records"
    ADD CONSTRAINT "production_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_records"
    ADD CONSTRAINT "production_records_production_id_key" UNIQUE ("production_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."promotion_free_products"
    ADD CONSTRAINT "promotion_free_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_products"
    ADD CONSTRAINT "promotion_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotion_usage"
    ADD CONSTRAINT "promotion_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promotions"
    ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_order_history"
    ADD CONSTRAINT "purchase_order_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_order_returns"
    ADD CONSTRAINT "purchase_order_returns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_po_number_key" UNIQUE ("po_number");



ALTER TABLE ONLY "public"."receipt_templates"
    ADD CONSTRAINT "receipt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_product_id_material_id_key" UNIQUE ("product_id", "material_id");



ALTER TABLE ONLY "public"."reporting_stock_snapshots"
    ADD CONSTRAINT "reporting_stock_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reporting_stock_snapshots"
    ADD CONSTRAINT "reporting_stock_snapshots_snapshot_date_key" UNIQUE ("snapshot_date");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_permission_id_key" UNIQUE ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_items"
    ADD CONSTRAINT "section_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."section_items"
    ADD CONSTRAINT "section_items_section_id_product_id_key" UNIQUE ("section_id", "product_id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."settings_categories"
    ADD CONSTRAINT "settings_categories_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."settings_categories"
    ADD CONSTRAINT "settings_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings_history"
    ADD CONSTRAINT "settings_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings_profiles"
    ADD CONSTRAINT "settings_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sound_assets"
    ADD CONSTRAINT "sound_assets_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."sound_assets"
    ADD CONSTRAINT "sound_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_locations"
    ADD CONSTRAINT "stock_locations_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."stock_locations"
    ADD CONSTRAINT "stock_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_movement_id_key" UNIQUE ("movement_id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_reservations"
    ADD CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_sections"
    ADD CONSTRAINT "storage_sections_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."storage_sections"
    ADD CONSTRAINT "storage_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storage_sections"
    ADD CONSTRAINT "storage_sections_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_devices"
    ADD CONSTRAINT "sync_devices_device_id_unique" UNIQUE ("device_id");



ALTER TABLE ONLY "public"."sync_devices"
    ADD CONSTRAINT "sync_devices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_queue"
    ADD CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_alerts"
    ADD CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tax_rates"
    ADD CONSTRAINT "tax_rates_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."tax_rates"
    ADD CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terminal_settings"
    ADD CONSTRAINT "terminal_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terminal_settings"
    ADD CONSTRAINT "terminal_settings_unique" UNIQUE ("terminal_id", "key");



ALTER TABLE ONLY "public"."transfer_items"
    ADD CONSTRAINT "transfer_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transfer_items"
    ADD CONSTRAINT "transfer_items_unique" UNIQUE ("transfer_id", "product_id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_permission_id_key" UNIQUE ("user_id", "permission_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_created" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_logs_module" ON "public"."audit_logs" USING "btree" ("module");



CREATE INDEX "idx_audit_logs_severity" ON "public"."audit_logs" USING "btree" ("severity");



CREATE INDEX "idx_audit_logs_user" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_b2b_deliveries_customer_id" ON "public"."b2b_deliveries" USING "btree" ("customer_id");



CREATE INDEX "idx_b2b_deliveries_order_id" ON "public"."b2b_deliveries" USING "btree" ("order_id");



CREATE INDEX "idx_b2b_deliveries_scheduled_date" ON "public"."b2b_deliveries" USING "btree" ("scheduled_date");



CREATE INDEX "idx_b2b_deliveries_status" ON "public"."b2b_deliveries" USING "btree" ("status");



CREATE INDEX "idx_b2b_order_history_created_at" ON "public"."b2b_order_history" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_b2b_order_history_order_id" ON "public"."b2b_order_history" USING "btree" ("order_id");



CREATE INDEX "idx_b2b_payments_customer_id" ON "public"."b2b_payments" USING "btree" ("customer_id");



CREATE INDEX "idx_b2b_payments_order_id" ON "public"."b2b_payments" USING "btree" ("order_id");



CREATE INDEX "idx_b2b_payments_payment_date" ON "public"."b2b_payments" USING "btree" ("payment_date" DESC);



CREATE INDEX "idx_business_hours_day" ON "public"."business_hours" USING "btree" ("day_of_week");



CREATE INDEX "idx_combo_group_items_group" ON "public"."product_combo_group_items" USING "btree" ("group_id");



CREATE INDEX "idx_combo_group_items_product" ON "public"."product_combo_group_items" USING "btree" ("product_id");



CREATE INDEX "idx_combo_groups_combo" ON "public"."product_combo_groups" USING "btree" ("combo_id");



CREATE INDEX "idx_customer_categories_is_active" ON "public"."customer_categories" USING "btree" ("is_active");



CREATE INDEX "idx_customer_categories_slug" ON "public"."customer_categories" USING "btree" ("slug");



CREATE INDEX "idx_customer_category_prices_category" ON "public"."customer_category_prices" USING "btree" ("category_id");



CREATE INDEX "idx_customer_category_prices_product" ON "public"."customer_category_prices" USING "btree" ("product_id");



CREATE INDEX "idx_display_configurations_terminal" ON "public"."display_configurations" USING "btree" ("pos_terminal_id");



CREATE INDEX "idx_display_order_queue_display" ON "public"."display_order_queue" USING "btree" ("display_id", "status");



CREATE INDEX "idx_display_order_queue_status" ON "public"."display_order_queue" USING "btree" ("status", "expires_at");



CREATE INDEX "idx_display_promotions_active" ON "public"."display_promotions" USING "btree" ("is_active", "start_date", "end_date");



CREATE INDEX "idx_display_promotions_display" ON "public"."display_promotions" USING "btree" ("display_id");



CREATE INDEX "idx_email_templates_code" ON "public"."email_templates" USING "btree" ("code");



CREATE INDEX "idx_floor_plan_items_number" ON "public"."floor_plan_items" USING "btree" ("number") WHERE ("type" = 'table'::"text");



CREATE INDEX "idx_floor_plan_items_section" ON "public"."floor_plan_items" USING "btree" ("section") WHERE ("type" = 'table'::"text");



CREATE INDEX "idx_floor_plan_items_status" ON "public"."floor_plan_items" USING "btree" ("status") WHERE ("type" = 'table'::"text");



CREATE INDEX "idx_floor_plan_items_type" ON "public"."floor_plan_items" USING "btree" ("type");



CREATE INDEX "idx_internal_transfers_date" ON "public"."internal_transfers" USING "btree" ("transfer_date" DESC);



CREATE INDEX "idx_internal_transfers_from" ON "public"."internal_transfers" USING "btree" ("from_location_id");



CREATE INDEX "idx_internal_transfers_number" ON "public"."internal_transfers" USING "btree" ("transfer_number");



CREATE INDEX "idx_internal_transfers_status" ON "public"."internal_transfers" USING "btree" ("status");



CREATE INDEX "idx_internal_transfers_to" ON "public"."internal_transfers" USING "btree" ("to_location_id");



CREATE INDEX "idx_inv_count_items_parent" ON "public"."inventory_count_items" USING "btree" ("inventory_count_id");



CREATE INDEX "idx_inv_count_items_product" ON "public"."inventory_count_items" USING "btree" ("product_id");



CREATE INDEX "idx_lan_messages_log_from_device" ON "public"."lan_messages_log" USING "btree" ("from_device");



CREATE INDEX "idx_lan_messages_log_message_type" ON "public"."lan_messages_log" USING "btree" ("message_type");



CREATE INDEX "idx_lan_messages_log_status" ON "public"."lan_messages_log" USING "btree" ("status");



CREATE INDEX "idx_lan_messages_log_timestamp" ON "public"."lan_messages_log" USING "btree" ("timestamp");



CREATE INDEX "idx_lan_messages_log_to_device" ON "public"."lan_messages_log" USING "btree" ("to_device");



CREATE INDEX "idx_lan_nodes_device_id" ON "public"."lan_nodes" USING "btree" ("device_id");



CREATE INDEX "idx_lan_nodes_device_type" ON "public"."lan_nodes" USING "btree" ("device_type");



CREATE INDEX "idx_lan_nodes_hub" ON "public"."lan_nodes" USING "btree" ("is_hub") WHERE ("is_hub" = true);



CREATE INDEX "idx_lan_nodes_last_heartbeat" ON "public"."lan_nodes" USING "btree" ("last_heartbeat");



CREATE INDEX "idx_lan_nodes_online" ON "public"."lan_nodes" USING "btree" ("status") WHERE (("status")::"text" = 'online'::"text");



CREATE INDEX "idx_lan_nodes_status" ON "public"."lan_nodes" USING "btree" ("status");



CREATE INDEX "idx_loyalty_redemptions_customer" ON "public"."loyalty_redemptions" USING "btree" ("customer_id");



CREATE INDEX "idx_loyalty_redemptions_status" ON "public"."loyalty_redemptions" USING "btree" ("status");



CREATE INDEX "idx_loyalty_rewards_active" ON "public"."loyalty_rewards" USING "btree" ("is_active");



CREATE INDEX "idx_loyalty_rewards_type" ON "public"."loyalty_rewards" USING "btree" ("reward_type");



CREATE INDEX "idx_loyalty_tiers_min_points" ON "public"."loyalty_tiers" USING "btree" ("min_lifetime_points");



CREATE INDEX "idx_loyalty_tiers_slug" ON "public"."loyalty_tiers" USING "btree" ("slug");



CREATE INDEX "idx_loyalty_transactions_created" ON "public"."loyalty_transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_loyalty_transactions_customer" ON "public"."loyalty_transactions" USING "btree" ("customer_id");



CREATE INDEX "idx_loyalty_transactions_order" ON "public"."loyalty_transactions" USING "btree" ("order_id");



CREATE INDEX "idx_loyalty_transactions_type" ON "public"."loyalty_transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_offline_versions_last_sync" ON "public"."offline_versions" USING "btree" ("last_sync");



CREATE INDEX "idx_offline_versions_table_name" ON "public"."offline_versions" USING "btree" ("table_name");



CREATE INDEX "idx_order_items_selected_variants" ON "public"."order_items" USING "gin" ("selected_variants");



CREATE INDEX "idx_order_items_station_status" ON "public"."order_items" USING "btree" ("dispatch_station", "item_status");



CREATE INDEX "idx_orders_source" ON "public"."orders" USING "btree" ("source") WHERE (("source")::"text" <> 'pos'::"text");



CREATE INDEX "idx_payment_methods_code" ON "public"."payment_methods" USING "btree" ("code");



CREATE INDEX "idx_payment_methods_default" ON "public"."payment_methods" USING "btree" ("is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_payment_methods_sort" ON "public"."payment_methods" USING "btree" ("sort_order");



CREATE INDEX "idx_permissions_code" ON "public"."permissions" USING "btree" ("code");



CREATE INDEX "idx_permissions_module" ON "public"."permissions" USING "btree" ("module");



CREATE INDEX "idx_permissions_sensitive" ON "public"."permissions" USING "btree" ("is_sensitive");



CREATE INDEX "idx_pos_sessions_status" ON "public"."pos_sessions" USING "btree" ("status");



CREATE INDEX "idx_pos_sessions_user_id" ON "public"."pos_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_pos_terminals_device_id" ON "public"."pos_terminals" USING "btree" ("device_id");



CREATE INDEX "idx_pos_terminals_is_hub" ON "public"."pos_terminals" USING "btree" ("is_hub") WHERE ("is_hub" = true);



CREATE INDEX "idx_pos_terminals_status" ON "public"."pos_terminals" USING "btree" ("status");



CREATE INDEX "idx_printer_configurations_default" ON "public"."printer_configurations" USING "btree" ("is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_printer_configurations_type" ON "public"."printer_configurations" USING "btree" ("printer_type");



CREATE INDEX "idx_product_category_prices_active" ON "public"."product_category_prices" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_product_category_prices_category" ON "public"."product_category_prices" USING "btree" ("customer_category_id");



CREATE INDEX "idx_product_category_prices_product" ON "public"."product_category_prices" USING "btree" ("product_id");



CREATE INDEX "idx_product_modifiers_material" ON "public"."product_modifiers" USING "btree" ("material_id") WHERE ("material_id" IS NOT NULL);



CREATE INDEX "idx_product_modifiers_materials" ON "public"."product_modifiers" USING "gin" ("materials");



CREATE INDEX "idx_product_sections_product" ON "public"."product_sections" USING "btree" ("product_id");



CREATE INDEX "idx_product_sections_section" ON "public"."product_sections" USING "btree" ("section_id");



CREATE INDEX "idx_promotion_usage_customer" ON "public"."promotion_usage" USING "btree" ("promotion_id", "customer_id");



CREATE INDEX "idx_promotion_usage_date" ON "public"."promotion_usage" USING "btree" ("used_at");



CREATE INDEX "idx_promotions_active" ON "public"."promotions" USING "btree" ("is_active", "start_date", "end_date");



CREATE INDEX "idx_promotions_code" ON "public"."promotions" USING "btree" ("code") WHERE ("is_active" = true);



CREATE INDEX "idx_purchase_order_history_action_type" ON "public"."purchase_order_history" USING "btree" ("action_type");



CREATE INDEX "idx_purchase_order_history_created_at" ON "public"."purchase_order_history" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_purchase_order_history_po_id" ON "public"."purchase_order_history" USING "btree" ("purchase_order_id");



CREATE INDEX "idx_purchase_order_items_po_id" ON "public"."purchase_order_items" USING "btree" ("purchase_order_id");



CREATE INDEX "idx_purchase_order_items_product_id" ON "public"."purchase_order_items" USING "btree" ("product_id");



CREATE INDEX "idx_purchase_order_returns_item_id" ON "public"."purchase_order_returns" USING "btree" ("purchase_order_item_id");



CREATE INDEX "idx_purchase_order_returns_po_id" ON "public"."purchase_order_returns" USING "btree" ("purchase_order_id");



CREATE INDEX "idx_purchase_order_returns_status" ON "public"."purchase_order_returns" USING "btree" ("status");



CREATE INDEX "idx_receipt_templates_type" ON "public"."receipt_templates" USING "btree" ("template_type");



CREATE INDEX "idx_role_permissions_permission" ON "public"."role_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_role_permissions_role" ON "public"."role_permissions" USING "btree" ("role_id");



CREATE INDEX "idx_roles_active" ON "public"."roles" USING "btree" ("is_active");



CREATE INDEX "idx_roles_code" ON "public"."roles" USING "btree" ("code");



CREATE INDEX "idx_roles_hierarchy" ON "public"."roles" USING "btree" ("hierarchy_level" DESC);



CREATE INDEX "idx_section_items_product" ON "public"."section_items" USING "btree" ("product_id");



CREATE INDEX "idx_section_items_section" ON "public"."section_items" USING "btree" ("section_id");



CREATE INDEX "idx_settings_categories_active" ON "public"."settings_categories" USING "btree" ("is_active");



CREATE INDEX "idx_settings_categories_code" ON "public"."settings_categories" USING "btree" ("code");



CREATE INDEX "idx_settings_categories_sort" ON "public"."settings_categories" USING "btree" ("sort_order");



CREATE INDEX "idx_settings_category" ON "public"."settings" USING "btree" ("category_id");



CREATE INDEX "idx_settings_history_changed_at" ON "public"."settings_history" USING "btree" ("changed_at" DESC);



CREATE INDEX "idx_settings_history_changed_by" ON "public"."settings_history" USING "btree" ("changed_by");



CREATE INDEX "idx_settings_history_setting" ON "public"."settings_history" USING "btree" ("setting_id");



CREATE INDEX "idx_settings_key" ON "public"."settings" USING "btree" ("key");



CREATE INDEX "idx_settings_profiles_active" ON "public"."settings_profiles" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_settings_profiles_type" ON "public"."settings_profiles" USING "btree" ("profile_type");



CREATE INDEX "idx_settings_sort" ON "public"."settings" USING "btree" ("sort_order");



CREATE INDEX "idx_snapshots_date" ON "public"."reporting_stock_snapshots" USING "btree" ("snapshot_date");



CREATE INDEX "idx_stock_locations_active" ON "public"."stock_locations" USING "btree" ("is_active");



CREATE INDEX "idx_stock_locations_type" ON "public"."stock_locations" USING "btree" ("location_type");



CREATE INDEX "idx_suppliers_city" ON "public"."suppliers" USING "btree" ("city");



CREATE INDEX "idx_sync_devices_active" ON "public"."sync_devices" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_sync_devices_device_id" ON "public"."sync_devices" USING "btree" ("device_id");



CREATE INDEX "idx_sync_devices_device_type" ON "public"."sync_devices" USING "btree" ("device_type");



CREATE INDEX "idx_sync_devices_last_seen" ON "public"."sync_devices" USING "btree" ("last_seen");



CREATE INDEX "idx_sync_queue_created_at" ON "public"."sync_queue" USING "btree" ("created_at");



CREATE INDEX "idx_sync_queue_device_id" ON "public"."sync_queue" USING "btree" ("device_id");



CREATE INDEX "idx_sync_queue_pending" ON "public"."sync_queue" USING "btree" ("status", "created_at") WHERE (("status")::"text" = 'pending'::"text");



CREATE INDEX "idx_sync_queue_status" ON "public"."sync_queue" USING "btree" ("status");



CREATE INDEX "idx_sync_queue_type" ON "public"."sync_queue" USING "btree" ("type");



CREATE INDEX "idx_system_logs_created_at" ON "public"."system_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_system_logs_severity" ON "public"."system_logs" USING "btree" ("severity");



CREATE INDEX "idx_system_logs_source" ON "public"."system_logs" USING "btree" ("source");



CREATE INDEX "idx_tax_rates_active" ON "public"."tax_rates" USING "btree" ("is_active");



CREATE INDEX "idx_tax_rates_code" ON "public"."tax_rates" USING "btree" ("code");



CREATE INDEX "idx_tax_rates_default" ON "public"."tax_rates" USING "btree" ("is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_terminal_settings_key" ON "public"."terminal_settings" USING "btree" ("key");



CREATE INDEX "idx_terminal_settings_terminal" ON "public"."terminal_settings" USING "btree" ("terminal_id");



CREATE INDEX "idx_transfer_items_product" ON "public"."transfer_items" USING "btree" ("product_id");



CREATE INDEX "idx_transfer_items_transfer" ON "public"."transfer_items" USING "btree" ("transfer_id");



CREATE INDEX "idx_uoms_product" ON "public"."product_uoms" USING "btree" ("product_id");



CREATE INDEX "idx_user_permissions_permission" ON "public"."user_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_user_permissions_user" ON "public"."user_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_user_roles_primary" ON "public"."user_roles" USING "btree" ("is_primary") WHERE ("is_primary" = true);



CREATE INDEX "idx_user_roles_role" ON "public"."user_roles" USING "btree" ("role_id");



CREATE INDEX "idx_user_roles_user" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "idx_user_sessions_active" ON "public"."user_sessions" USING "btree" ("user_id", "ended_at") WHERE ("ended_at" IS NULL);



CREATE INDEX "idx_user_sessions_token" ON "public"."user_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_user_sessions_user" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "audit_roles" AFTER INSERT OR DELETE OR UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_user_permissions" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "audit_user_roles" AFTER INSERT OR DELETE OR UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."audit_trigger_function"();



CREATE OR REPLACE TRIGGER "ensure_single_primary_role" BEFORE INSERT OR UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_primary_role"();



CREATE OR REPLACE TRIGGER "log_setting_changes" BEFORE UPDATE ON "public"."settings" FOR EACH ROW EXECUTE FUNCTION "public"."log_setting_change"();



CREATE OR REPLACE TRIGGER "set_product_category_prices_updated_at" BEFORE UPDATE ON "public"."product_category_prices" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_category_prices_updated_at"();



CREATE OR REPLACE TRIGGER "tr_generate_inv_count_number" BEFORE INSERT ON "public"."inventory_counts" FOR EACH ROW WHEN (("new"."count_number" IS NULL)) EXECUTE FUNCTION "public"."generate_inventory_count_number"();



CREATE OR REPLACE TRIGGER "tr_generate_order_number" BEFORE INSERT ON "public"."orders" FOR EACH ROW WHEN (("new"."order_number" IS NULL)) EXECUTE FUNCTION "public"."generate_order_number"();



CREATE OR REPLACE TRIGGER "tr_update_categories_timestamp" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "tr_update_products_timestamp" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trg_add_stock_on_purchase" AFTER UPDATE OF "quantity_received" ON "public"."po_items" FOR EACH ROW EXECUTE FUNCTION "public"."add_stock_on_purchase"();



CREATE OR REPLACE TRIGGER "trg_check_discount_anomaly" AFTER INSERT OR UPDATE ON "public"."orders" FOR EACH ROW WHEN ((("new"."discount_value" IS NOT NULL) AND ("new"."discount_value" > (0)::numeric))) EXECUTE FUNCTION "public"."check_discount_anomaly"();



CREATE OR REPLACE TRIGGER "trg_deduct_stock_on_sale" AFTER INSERT ON "public"."order_items" FOR EACH ROW EXECUTE FUNCTION "public"."deduct_stock_on_sale"();



CREATE OR REPLACE TRIGGER "trg_production_stock_deduction" AFTER INSERT OR UPDATE ON "public"."production_records" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_production_stock_deduction"();



CREATE OR REPLACE TRIGGER "trigger_create_stock_movements_on_receive" AFTER UPDATE ON "public"."internal_transfers" FOR EACH ROW EXECUTE FUNCTION "public"."create_stock_movements_on_receive"();



CREATE OR REPLACE TRIGGER "trigger_display_configurations_updated_at" BEFORE UPDATE ON "public"."display_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_display_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_display_promotions_updated_at" BEFORE UPDATE ON "public"."display_promotions" FOR EACH ROW EXECUTE FUNCTION "public"."update_display_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_generate_b2b_delivery_number" BEFORE INSERT ON "public"."b2b_deliveries" FOR EACH ROW WHEN ((("new"."delivery_number" IS NULL) OR ("new"."delivery_number" = ''::"text"))) EXECUTE FUNCTION "public"."generate_b2b_delivery_number"();



CREATE OR REPLACE TRIGGER "trigger_generate_b2b_payment_number" BEFORE INSERT ON "public"."b2b_payments" FOR EACH ROW WHEN ((("new"."payment_number" IS NULL) OR ("new"."payment_number" = ''::"text"))) EXECUTE FUNCTION "public"."generate_b2b_payment_number"();



CREATE OR REPLACE TRIGGER "trigger_generate_transfer_number" BEFORE INSERT ON "public"."internal_transfers" FOR EACH ROW EXECUTE FUNCTION "public"."generate_transfer_number"();



CREATE OR REPLACE TRIGGER "trigger_lan_nodes_updated_at" BEFORE UPDATE ON "public"."lan_nodes" FOR EACH ROW EXECUTE FUNCTION "public"."update_lan_nodes_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_offline_versions_updated_at" BEFORE UPDATE ON "public"."offline_versions" FOR EACH ROW EXECUTE FUNCTION "public"."update_offline_versions_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_pos_terminals_updated_at" BEFORE UPDATE ON "public"."pos_terminals" FOR EACH ROW EXECUTE FUNCTION "public"."update_pos_terminals_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_sync_devices_updated_at" BEFORE UPDATE ON "public"."sync_devices" FOR EACH ROW EXECUTE FUNCTION "public"."update_sync_devices_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_b2b_deliveries_updated_at" BEFORE UPDATE ON "public"."b2b_deliveries" FOR EACH ROW EXECUTE FUNCTION "public"."update_b2b_deliveries_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_b2b_delivery_quantities" AFTER INSERT OR DELETE OR UPDATE ON "public"."b2b_delivery_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_b2b_delivery_quantities"();



CREATE OR REPLACE TRIGGER "trigger_update_b2b_order_payment_status" AFTER INSERT OR DELETE OR UPDATE ON "public"."b2b_payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_b2b_order_payment_status"();



CREATE OR REPLACE TRIGGER "trigger_update_b2b_payments_updated_at" BEFORE UPDATE ON "public"."b2b_payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_b2b_payments_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_customer_categories_updated_at" BEFORE UPDATE ON "public"."customer_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_customer_categories_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_customer_category_prices_updated_at" BEFORE UPDATE ON "public"."customer_category_prices" FOR EACH ROW EXECUTE FUNCTION "public"."update_customer_category_prices_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_floor_plan_items_updated_at" BEFORE UPDATE ON "public"."floor_plan_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_floor_plan_items_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_internal_transfers_updated_at" BEFORE UPDATE ON "public"."internal_transfers" FOR EACH ROW EXECUTE FUNCTION "public"."update_internal_transfers_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_loyalty_rewards_updated_at" BEFORE UPDATE ON "public"."loyalty_rewards" FOR EACH ROW EXECUTE FUNCTION "public"."update_loyalty_rewards_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_loyalty_tiers_updated_at" BEFORE UPDATE ON "public"."loyalty_tiers" FOR EACH ROW EXECUTE FUNCTION "public"."update_loyalty_tiers_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_purchase_order_items_updated_at" BEFORE UPDATE ON "public"."purchase_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_purchase_order_items_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_purchase_order_returns_updated_at" BEFORE UPDATE ON "public"."purchase_order_returns" FOR EACH ROW EXECUTE FUNCTION "public"."update_purchase_order_returns_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_purchase_order_totals" AFTER INSERT OR DELETE OR UPDATE ON "public"."purchase_order_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_purchase_order_totals"();



CREATE OR REPLACE TRIGGER "trigger_update_stock_locations_updated_at" BEFORE UPDATE ON "public"."stock_locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_locations_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_transfer_totals" AFTER INSERT OR DELETE OR UPDATE ON "public"."transfer_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_transfer_totals"();



CREATE OR REPLACE TRIGGER "update_business_hours_timestamp" BEFORE UPDATE ON "public"."business_hours" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_email_templates_timestamp" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_payment_methods_timestamp" BEFORE UPDATE ON "public"."payment_methods" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_printer_configurations_timestamp" BEFORE UPDATE ON "public"."printer_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_product_combos_updated_at" BEFORE UPDATE ON "public"."product_combos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_promotions_updated_at" BEFORE UPDATE ON "public"."promotions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_receipt_templates_timestamp" BEFORE UPDATE ON "public"."receipt_templates" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_roles_updated_at" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_settings_profiles_timestamp" BEFORE UPDATE ON "public"."settings_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_tax_rates_timestamp" BEFORE UPDATE ON "public"."tax_rates" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



CREATE OR REPLACE TRIGGER "update_terminal_settings_timestamp" BEFORE UPDATE ON "public"."terminal_settings" FOR EACH ROW EXECUTE FUNCTION "public"."settings_update_timestamp"();



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id");



ALTER TABLE ONLY "public"."b2b_delivery_items"
    ADD CONSTRAINT "b2b_delivery_items_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "public"."b2b_deliveries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b2b_order_items"
    ADD CONSTRAINT "b2b_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."b2b_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b2b_order_items"
    ADD CONSTRAINT "b2b_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."b2b_orders"
    ADD CONSTRAINT "b2b_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."b2b_orders"
    ADD CONSTRAINT "b2b_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."customer_category_prices"
    ADD CONSTRAINT "customer_category_prices_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."customer_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_invoices"
    ADD CONSTRAINT "customer_invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."customer_invoices"
    ADD CONSTRAINT "customer_invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."display_configurations"
    ADD CONSTRAINT "display_configurations_pos_terminal_id_fkey" FOREIGN KEY ("pos_terminal_id") REFERENCES "public"."pos_terminals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."display_order_queue"
    ADD CONSTRAINT "display_order_queue_display_id_fkey" FOREIGN KEY ("display_id") REFERENCES "public"."display_configurations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."display_order_queue"
    ADD CONSTRAINT "display_order_queue_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."display_promotions"
    ADD CONSTRAINT "display_promotions_display_id_fkey" FOREIGN KEY ("display_id") REFERENCES "public"."display_configurations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."display_promotions"
    ADD CONSTRAINT "display_promotions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."internal_transfers"
    ADD CONSTRAINT "internal_transfers_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "public"."stock_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."internal_transfers"
    ADD CONSTRAINT "internal_transfers_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "public"."stock_locations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_count_items"
    ADD CONSTRAINT "inventory_count_items_inventory_count_id_fkey" FOREIGN KEY ("inventory_count_id") REFERENCES "public"."inventory_counts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_redemptions"
    ADD CONSTRAINT "loyalty_redemptions_loyalty_transaction_id_fkey" FOREIGN KEY ("loyalty_transaction_id") REFERENCES "public"."loyalty_transactions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."loyalty_redemptions"
    ADD CONSTRAINT "loyalty_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."loyalty_rewards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_prepared_by_fkey" FOREIGN KEY ("prepared_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_discount_manager_id_fkey" FOREIGN KEY ("discount_manager_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."pos_sessions"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."po_items"
    ADD CONSTRAINT "po_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."po_items"
    ADD CONSTRAINT "po_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."pos_sessions"
    ADD CONSTRAINT "pos_sessions_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."pos_sessions"
    ADD CONSTRAINT "pos_sessions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."pos_sessions"
    ADD CONSTRAINT "pos_sessions_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."pos_sessions"
    ADD CONSTRAINT "pos_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pos_terminals"
    ADD CONSTRAINT "pos_terminals_default_printer_id_fkey" FOREIGN KEY ("default_printer_id") REFERENCES "public"."printer_configurations"("id");



ALTER TABLE ONLY "public"."pos_terminals"
    ADD CONSTRAINT "pos_terminals_kitchen_printer_id_fkey" FOREIGN KEY ("kitchen_printer_id") REFERENCES "public"."printer_configurations"("id");



ALTER TABLE ONLY "public"."product_category_prices"
    ADD CONSTRAINT "product_category_prices_customer_category_id_fkey" FOREIGN KEY ("customer_category_id") REFERENCES "public"."customer_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_combo_group_items"
    ADD CONSTRAINT "product_combo_group_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."product_combo_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_combo_groups"
    ADD CONSTRAINT "product_combo_groups_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "public"."product_combos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_modifiers"
    ADD CONSTRAINT "product_modifiers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_modifiers"
    ADD CONSTRAINT "product_modifiers_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_modifiers"
    ADD CONSTRAINT "product_modifiers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_sections"
    ADD CONSTRAINT "product_sections_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_sections"
    ADD CONSTRAINT "product_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_stocks"
    ADD CONSTRAINT "product_stocks_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id");



ALTER TABLE ONLY "public"."production_records"
    ADD CONSTRAINT "production_records_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."production_records"
    ADD CONSTRAINT "production_records_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."promotion_free_products"
    ADD CONSTRAINT "promotion_free_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_products"
    ADD CONSTRAINT "promotion_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promotion_usage"
    ADD CONSTRAINT "promotion_usage_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_order_returns"
    ADD CONSTRAINT "purchase_order_returns_purchase_order_item_id_fkey" FOREIGN KEY ("purchase_order_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id");



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipes"
    ADD CONSTRAINT "recipes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."section_items"
    ADD CONSTRAINT "section_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."storage_sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."settings_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings_history"
    ADD CONSTRAINT "settings_history_setting_id_fkey" FOREIGN KEY ("setting_id") REFERENCES "public"."settings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings_profiles"
    ADD CONSTRAINT "settings_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."stock_reservations"
    ADD CONSTRAINT "stock_reservations_b2b_order_id_fkey" FOREIGN KEY ("b2b_order_id") REFERENCES "public"."b2b_orders"("id");



ALTER TABLE ONLY "public"."stock_reservations"
    ADD CONSTRAINT "stock_reservations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."stock_reservations"
    ADD CONSTRAINT "stock_reservations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."stock_reservations"
    ADD CONSTRAINT "stock_reservations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."stock_reservations"
    ADD CONSTRAINT "stock_reservations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."sync_devices"
    ADD CONSTRAINT "sync_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sync_queue"
    ADD CONSTRAINT "sync_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."system_alerts"
    ADD CONSTRAINT "system_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."terminal_settings"
    ADD CONSTRAINT "terminal_settings_terminal_id_fkey" FOREIGN KEY ("terminal_id") REFERENCES "public"."pos_terminals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transfer_items"
    ADD CONSTRAINT "transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "public"."internal_transfers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete lan_messages_log" ON "public"."lan_messages_log" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can delete lan_nodes" ON "public"."lan_nodes" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can delete offline_versions" ON "public"."offline_versions" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can delete role_permissions" ON "public"."role_permissions" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Admins can delete sync_devices" ON "public"."sync_devices" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can delete sync_queue" ON "public"."sync_queue" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can delete user_permissions" ON "public"."user_permissions" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Admins can insert role_permissions" ON "public"."role_permissions" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Admins can insert user_permissions" ON "public"."user_permissions" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Admins can manage display configurations" ON "public"."display_configurations" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can manage display promotions" ON "public"."display_promotions" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can update lan_messages_log" ON "public"."lan_messages_log" FOR UPDATE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Admins can update role_permissions" ON "public"."role_permissions" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Admins can update user_permissions" ON "public"."user_permissions" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Admins view settings history" ON "public"."settings_history" FOR SELECT USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow anon to manage customer_category_prices" ON "public"."customer_category_prices" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage b2b_deliveries" ON "public"."b2b_deliveries" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage b2b_delivery_items" ON "public"."b2b_delivery_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage b2b_order_history" ON "public"."b2b_order_history" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage b2b_payments" ON "public"."b2b_payments" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage customer_category_prices" ON "public"."customer_category_prices" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage loyalty_redemptions" ON "public"."loyalty_redemptions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage loyalty_rewards" ON "public"."loyalty_rewards" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage loyalty_tiers" ON "public"."loyalty_tiers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated to manage loyalty_transactions" ON "public"."loyalty_transactions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to delete floor plan items" ON "public"."floor_plan_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete purchase order items" ON "public"."purchase_order_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete purchase order returns" ON "public"."purchase_order_returns" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert floor plan items" ON "public"."floor_plan_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert purchase order history" ON "public"."purchase_order_history" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert purchase order items" ON "public"."purchase_order_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert purchase order returns" ON "public"."purchase_order_returns" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read floor plan items" ON "public"."floor_plan_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read purchase order history" ON "public"."purchase_order_history" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read purchase order items" ON "public"."purchase_order_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read purchase order returns" ON "public"."purchase_order_returns" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update floor plan items" ON "public"."floor_plan_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update purchase order items" ON "public"."purchase_order_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update purchase order returns" ON "public"."purchase_order_returns" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow delete combo group items for authenticated users" ON "public"."product_combo_group_items" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete combo groups for authenticated users" ON "public"."product_combo_groups" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete combos for authenticated users" ON "public"."product_combos" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete product_category_prices" ON "public"."product_category_prices" FOR DELETE USING (true);



CREATE POLICY "Allow delete promotion free products for authenticated users" ON "public"."promotion_free_products" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete promotion products for authenticated users" ON "public"."promotion_products" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete promotions for authenticated users" ON "public"."promotions" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert combo group items for authenticated users" ON "public"."product_combo_group_items" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert combo groups for authenticated users" ON "public"."product_combo_groups" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert combos for authenticated users" ON "public"."product_combos" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert product_category_prices" ON "public"."product_category_prices" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert promotion free products for authenticated users" ON "public"."promotion_free_products" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert promotion products for authenticated users" ON "public"."promotion_products" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert promotion usage for authenticated users" ON "public"."promotion_usage" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert promotions for authenticated users" ON "public"."promotions" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public b2b_deliveries" ON "public"."b2b_deliveries" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public b2b_delivery_items" ON "public"."b2b_delivery_items" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public b2b_order_history" ON "public"."b2b_order_history" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public b2b_payments" ON "public"."b2b_payments" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to delete customer_category_prices" ON "public"."customer_category_prices" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete internal_transfers" ON "public"."internal_transfers" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete loyalty_redemptions" ON "public"."loyalty_redemptions" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete loyalty_rewards" ON "public"."loyalty_rewards" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete loyalty_tiers" ON "public"."loyalty_tiers" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete loyalty_transactions" ON "public"."loyalty_transactions" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete stock_locations" ON "public"."stock_locations" FOR DELETE USING (true);



CREATE POLICY "Allow public to delete transfer_items" ON "public"."transfer_items" FOR DELETE USING (true);



CREATE POLICY "Allow public to insert customer_category_prices" ON "public"."customer_category_prices" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert internal_transfers" ON "public"."internal_transfers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert loyalty_redemptions" ON "public"."loyalty_redemptions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert loyalty_rewards" ON "public"."loyalty_rewards" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert loyalty_tiers" ON "public"."loyalty_tiers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert loyalty_transactions" ON "public"."loyalty_transactions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert stock_locations" ON "public"."stock_locations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to insert transfer_items" ON "public"."transfer_items" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public to select customer_category_prices" ON "public"."customer_category_prices" FOR SELECT USING (true);



CREATE POLICY "Allow public to select internal_transfers" ON "public"."internal_transfers" FOR SELECT USING (true);



CREATE POLICY "Allow public to select loyalty_redemptions" ON "public"."loyalty_redemptions" FOR SELECT USING (true);



CREATE POLICY "Allow public to select loyalty_rewards" ON "public"."loyalty_rewards" FOR SELECT USING (true);



CREATE POLICY "Allow public to select loyalty_tiers" ON "public"."loyalty_tiers" FOR SELECT USING (true);



CREATE POLICY "Allow public to select loyalty_transactions" ON "public"."loyalty_transactions" FOR SELECT USING (true);



CREATE POLICY "Allow public to select stock_locations" ON "public"."stock_locations" FOR SELECT USING (true);



CREATE POLICY "Allow public to select transfer_items" ON "public"."transfer_items" FOR SELECT USING (true);



CREATE POLICY "Allow public to update customer_category_prices" ON "public"."customer_category_prices" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update internal_transfers" ON "public"."internal_transfers" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update loyalty_redemptions" ON "public"."loyalty_redemptions" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update loyalty_rewards" ON "public"."loyalty_rewards" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update loyalty_tiers" ON "public"."loyalty_tiers" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update loyalty_transactions" ON "public"."loyalty_transactions" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update stock_locations" ON "public"."stock_locations" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow public to update transfer_items" ON "public"."transfer_items" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow read access to combo group items" ON "public"."product_combo_group_items" FOR SELECT USING (true);



CREATE POLICY "Allow read access to combo groups" ON "public"."product_combo_groups" FOR SELECT USING (true);



CREATE POLICY "Allow read access to combos" ON "public"."product_combos" FOR SELECT USING (true);



CREATE POLICY "Allow read access to promotion free products" ON "public"."promotion_free_products" FOR SELECT USING (true);



CREATE POLICY "Allow read access to promotion products" ON "public"."promotion_products" FOR SELECT USING (true);



CREATE POLICY "Allow read access to promotion usage" ON "public"."promotion_usage" FOR SELECT USING (true);



CREATE POLICY "Allow read access to promotions" ON "public"."promotions" FOR SELECT USING (true);



CREATE POLICY "Allow read product_category_prices" ON "public"."product_category_prices" FOR SELECT USING (true);



CREATE POLICY "Allow section deletes" ON "public"."sections" FOR DELETE USING (true);



CREATE POLICY "Allow section inserts" ON "public"."sections" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow section updates" ON "public"."sections" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow update combo group items for authenticated users" ON "public"."product_combo_group_items" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update combo groups for authenticated users" ON "public"."product_combo_groups" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update combos for authenticated users" ON "public"."product_combos" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update product_category_prices" ON "public"."product_category_prices" FOR UPDATE USING (true);



CREATE POLICY "Allow update promotion free products for authenticated users" ON "public"."promotion_free_products" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update promotion products for authenticated users" ON "public"."promotion_products" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update promotions for authenticated users" ON "public"."promotions" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Anyone can read sections" ON "public"."sections" FOR SELECT USING (true);



CREATE POLICY "Anyone can view permissions" ON "public"."permissions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view role_permissions" ON "public"."role_permissions" FOR SELECT USING (true);



CREATE POLICY "Authenticated read alerts" ON "public"."system_alerts" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated read invoices" ON "public"."customer_invoices" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated read reservations" ON "public"."stock_reservations" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert lan_messages_log" ON "public"."lan_messages_log" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert offline_versions" ON "public"."offline_versions" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can insert sync_queue" ON "public"."sync_queue" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can manage b2b_deliveries" ON "public"."b2b_deliveries" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage b2b_delivery_items" ON "public"."b2b_delivery_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage b2b_order_history" ON "public"."b2b_order_history" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage b2b_payments" ON "public"."b2b_payments" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage loyalty_redemptions" ON "public"."loyalty_redemptions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage loyalty_rewards" ON "public"."loyalty_rewards" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage loyalty_tiers" ON "public"."loyalty_tiers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage loyalty_transactions" ON "public"."loyalty_transactions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage order queue" ON "public"."display_order_queue" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can manage purchase_order_history" ON "public"."purchase_order_history" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage purchase_order_items" ON "public"."purchase_order_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can manage purchase_order_returns" ON "public"."purchase_order_returns" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can read lan_messages_log" ON "public"."lan_messages_log" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can read lan_nodes" ON "public"."lan_nodes" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can read loyalty_tiers" ON "public"."loyalty_tiers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read offline_versions" ON "public"."offline_versions" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can read product_stocks" ON "public"."product_stocks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read section_items" ON "public"."section_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read storage_sections" ON "public"."storage_sections" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can read sync_devices" ON "public"."sync_devices" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can read sync_queue" ON "public"."sync_queue" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can register lan_nodes" ON "public"."lan_nodes" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can register their devices" ON "public"."sync_devices" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update lan_nodes" ON "public"."lan_nodes" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update offline_versions" ON "public"."offline_versions" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update their sync_queue" ON "public"."sync_queue" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view display configurations" ON "public"."display_configurations" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view display promotions" ON "public"."display_promotions" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view order queue" ON "public"."display_order_queue" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authorized users can view audit_logs" ON "public"."audit_logs" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ("public"."is_admin"("auth"."uid"()) OR "public"."user_has_permission"("auth"."uid"(), 'reports.financial'::character varying))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."section_items" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for authenticated users" ON "public"."storage_sections" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable write access for authenticated users" ON "public"."section_items" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Manage business hours" ON "public"."business_hours" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "Manage email templates" ON "public"."email_templates" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "Manage payment methods" ON "public"."payment_methods" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "Manage printers" ON "public"."printer_configurations" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "Manage receipt templates" ON "public"."receipt_templates" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "Manage tax rates" ON "public"."tax_rates" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "No one can delete audit_logs" ON "public"."audit_logs" FOR DELETE USING (false);



CREATE POLICY "Permission-based write alerts" ON "public"."system_alerts" USING ("public"."user_has_permission"("auth"."uid"(), 'reports.view'::character varying));



CREATE POLICY "Permission-based write invoices" ON "public"."customer_invoices" USING ("public"."user_has_permission"("auth"."uid"(), 'customers.update'::character varying));



CREATE POLICY "Permission-based write reservations" ON "public"."stock_reservations" USING ("public"."user_has_permission"("auth"."uid"(), 'inventory.update'::character varying));



CREATE POLICY "System can insert audit_logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System insert settings history" ON "public"."settings_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "Update settings" ON "public"."settings" FOR UPDATE USING (("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying) AND ("is_system" = false) AND ("is_readonly" = false)));



CREATE POLICY "Users can create own sessions" ON "public"."user_sessions" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can update own sessions" ON "public"."user_sessions" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND (("user_id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"()))));



CREATE POLICY "Users can update their own devices" ON "public"."sync_devices" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "Users can view own permissions" ON "public"."user_permissions" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND (("user_id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"()))));



CREATE POLICY "Users can view own sessions" ON "public"."user_sessions" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND (("user_id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"()))));



CREATE POLICY "View active settings categories" ON "public"."settings_categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "View business hours" ON "public"."business_hours" FOR SELECT USING (true);



CREATE POLICY "View email templates" ON "public"."email_templates" FOR SELECT USING (true);



CREATE POLICY "View payment methods" ON "public"."payment_methods" FOR SELECT USING (true);



CREATE POLICY "View printers" ON "public"."printer_configurations" FOR SELECT USING (true);



CREATE POLICY "View receipt templates" ON "public"."receipt_templates" FOR SELECT USING (true);



CREATE POLICY "View settings" ON "public"."settings" FOR SELECT USING (true);



CREATE POLICY "View tax rates" ON "public"."tax_rates" FOR SELECT USING (true);



CREATE POLICY "admins_read_system_logs" ON "public"."system_logs" FOR SELECT TO "authenticated" USING ("public"."is_admin_or_manager"());



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b2b_deliveries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b2b_delivery_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b2b_order_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."b2b_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_categories_delete" ON "public"."customer_categories" FOR DELETE USING (true);



CREATE POLICY "customer_categories_insert" ON "public"."customer_categories" FOR INSERT WITH CHECK (true);



CREATE POLICY "customer_categories_select" ON "public"."customer_categories" FOR SELECT USING (true);



CREATE POLICY "customer_categories_update" ON "public"."customer_categories" FOR UPDATE USING (true) WITH CHECK (true);



ALTER TABLE "public"."customer_category_prices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_invoices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_inv_items" ON "public"."inventory_count_items" FOR DELETE TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "delete_product_stocks_admin" ON "public"."product_stocks" FOR DELETE TO "authenticated" USING ("public"."is_admin_or_manager"());



CREATE POLICY "delete_uoms" ON "public"."product_uoms" FOR DELETE TO "authenticated" USING (("public"."is_admin_or_manager"() OR "public"."can_access_backoffice"()));



ALTER TABLE "public"."display_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."display_order_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."display_promotions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "everyone_insert_system_logs" ON "public"."system_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "floor_plan_anon_delete" ON "public"."floor_plan_items" FOR DELETE TO "anon" USING (true);



CREATE POLICY "floor_plan_anon_insert" ON "public"."floor_plan_items" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "floor_plan_anon_read" ON "public"."floor_plan_items" FOR SELECT TO "anon" USING (true);



CREATE POLICY "floor_plan_anon_update" ON "public"."floor_plan_items" FOR UPDATE TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "floor_plan_delete" ON "public"."floor_plan_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "floor_plan_insert" ON "public"."floor_plan_items" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."floor_plan_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "floor_plan_read" ON "public"."floor_plan_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "floor_plan_update" ON "public"."floor_plan_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "insert_inv_counts" ON "public"."inventory_counts" FOR INSERT TO "authenticated" WITH CHECK (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "insert_inv_items" ON "public"."inventory_count_items" FOR INSERT TO "authenticated" WITH CHECK (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "insert_product_stocks" ON "public"."product_stocks" FOR INSERT TO "authenticated" WITH CHECK (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "insert_sections_staff" ON "public"."sections" FOR INSERT TO "authenticated" WITH CHECK (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "insert_uoms" ON "public"."product_uoms" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin_or_manager"() OR "public"."can_access_backoffice"()));



ALTER TABLE "public"."internal_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_count_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_count_items_manage" ON "public"."inventory_count_items" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"]));



ALTER TABLE "public"."inventory_counts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inventory_counts_manage" ON "public"."inventory_counts" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"]));



ALTER TABLE "public"."lan_messages_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lan_nodes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offline_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pos_terminals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pos_terminals_delete_admin" ON "public"."pos_terminals" FOR DELETE USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "pos_terminals_insert_permission" ON "public"."pos_terminals" FOR INSERT WITH CHECK (("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "pos_terminals_select_authenticated" ON "public"."pos_terminals" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "pos_terminals_update_permission" ON "public"."pos_terminals" FOR UPDATE USING (("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying) OR "public"."is_admin"("auth"."uid"())));



ALTER TABLE "public"."printer_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_category_prices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_combo_group_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_combo_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_combos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_sections_delete_policy" ON "public"."product_sections" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "product_sections_insert_policy" ON "public"."product_sections" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "product_sections_select_policy" ON "public"."product_sections" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "product_sections_update_policy" ON "public"."product_sections" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."product_stocks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_stocks_manage" ON "public"."product_stocks" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"]));



CREATE POLICY "product_stocks_view" ON "public"."product_stocks" FOR SELECT TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'staff'::"text", 'inventory_manager'::"text"]));



ALTER TABLE "public"."product_uoms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_uoms_policy" ON "public"."product_uoms" USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."promotion_free_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotion_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotion_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promotions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_delete_user_profiles" ON "public"."user_profiles" FOR DELETE USING (true);



CREATE POLICY "public_delete_user_roles" ON "public"."user_roles" FOR DELETE USING (true);



CREATE POLICY "public_insert_user_profiles" ON "public"."user_profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "public_insert_user_roles" ON "public"."user_roles" FOR INSERT WITH CHECK (true);



CREATE POLICY "public_read_roles" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "public_read_user_profiles" ON "public"."user_profiles" FOR SELECT USING (true);



CREATE POLICY "public_read_user_roles" ON "public"."user_roles" FOR SELECT USING (true);



CREATE POLICY "public_update_user_profiles" ON "public"."user_profiles" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "public_update_user_roles" ON "public"."user_roles" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "public_write_roles" ON "public"."roles" USING (true) WITH CHECK (true);



ALTER TABLE "public"."purchase_order_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchase_order_returns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."receipt_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reporting_stock_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."section_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "section_items_manage" ON "public"."section_items" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'staff'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'staff'::"text"]));



ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sections_manage" ON "public"."sections" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'staff'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text"]));



CREATE POLICY "select_inv_counts" ON "public"."inventory_counts" FOR SELECT TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "select_inv_items" ON "public"."inventory_count_items" FOR SELECT TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "select_product_stocks" ON "public"."product_stocks" FOR SELECT TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."can_access_pos"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "select_uoms" ON "public"."product_uoms" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "settings_profiles_manage" ON "public"."settings_profiles" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "settings_profiles_select" ON "public"."settings_profiles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."sound_assets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sound_assets_select" ON "public"."sound_assets" FOR SELECT USING (true);



CREATE POLICY "staff_read_snapshots" ON "public"."reporting_stock_snapshots" FOR SELECT TO "authenticated" USING (("public"."is_admin_or_manager"() OR "public"."can_access_backoffice"()));



ALTER TABLE "public"."stock_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stock_reservations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storage_sections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "storage_sections_manage" ON "public"."storage_sections" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'inventory_manager'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text"]));



ALTER TABLE "public"."sync_devices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tax_rates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."terminal_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "terminal_settings_manage" ON "public"."terminal_settings" USING ("public"."user_has_permission"("auth"."uid"(), 'settings.update'::character varying));



CREATE POLICY "terminal_settings_select" ON "public"."terminal_settings" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."transfer_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "uoms_manage" ON "public"."product_uoms" TO "authenticated" USING ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'staff'::"text"])) WITH CHECK ("public"."user_has_any_role"(ARRAY['admin'::"text", 'manager'::"text", 'staff'::"text"]));



CREATE POLICY "uoms_public_read" ON "public"."product_uoms" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "update_inv_counts" ON "public"."inventory_counts" FOR UPDATE TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "update_inv_items" ON "public"."inventory_count_items" FOR UPDATE TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "update_product_stocks" ON "public"."product_stocks" FOR UPDATE TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"())) WITH CHECK (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "update_sections_staff" ON "public"."sections" FOR UPDATE TO "authenticated" USING (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"())) WITH CHECK (("public"."can_access_backoffice"() OR "public"."is_admin_or_manager"()));



CREATE POLICY "update_uoms" ON "public"."product_uoms" FOR UPDATE TO "authenticated" USING (("public"."is_admin_or_manager"() OR "public"."can_access_backoffice"())) WITH CHECK (("public"."is_admin_or_manager"() OR "public"."can_access_backoffice"()));



ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





























































































































































































GRANT ALL ON FUNCTION "public"."add_loyalty_points"("p_customer_id" "uuid", "p_order_id" "uuid", "p_order_amount" numeric, "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_loyalty_points"("p_customer_id" "uuid", "p_order_id" "uuid", "p_order_amount" numeric, "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_loyalty_points"("p_customer_id" "uuid", "p_order_id" "uuid", "p_order_amount" numeric, "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_stock_on_purchase"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_stock_on_purchase"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_stock_on_purchase"() TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_settings_profile"("p_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."apply_settings_profile"("p_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_settings_profile"("p_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_trigger_function"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_combo_total_price"("p_combo_id" "uuid", "p_selected_items" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_combo_total_price"("p_combo_id" "uuid", "p_selected_items" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_combo_total_price"("p_combo_id" "uuid", "p_selected_items" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_loyalty_points"("order_total" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_loyalty_points"("order_total" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_loyalty_points"("order_total" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_order_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_order_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_order_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_backoffice"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_backoffice"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_backoffice"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_kds"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_kds"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_kds"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_pos"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_pos"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_pos"() TO "service_role";



GRANT ALL ON FUNCTION "public"."capture_daily_stock_snapshot"() TO "anon";
GRANT ALL ON FUNCTION "public"."capture_daily_stock_snapshot"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."capture_daily_stock_snapshot"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_discount_anomaly"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_discount_anomaly"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_discount_anomaly"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_promotion_validity"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_purchase_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."check_promotion_validity"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_purchase_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_promotion_validity"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_purchase_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_reporting_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_reporting_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_reporting_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_stock_alert"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_stock_alert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_stock_alert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_closing_cash" numeric, "p_counted_cash" numeric, "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_closing_cash" numeric, "p_counted_cash" numeric, "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_closing_cash" numeric, "p_counted_cash" numeric, "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_actual_cash" numeric, "p_actual_qris" numeric, "p_actual_edc" numeric, "p_closed_by" "uuid", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_actual_cash" numeric, "p_actual_qris" numeric, "p_actual_edc" numeric, "p_closed_by" "uuid", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_shift"("p_session_id" "uuid", "p_actual_cash" numeric, "p_actual_qris" numeric, "p_actual_edc" numeric, "p_closed_by" "uuid", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_anomaly_alert"("p_alert_type" character varying, "p_severity" character varying, "p_title" character varying, "p_description" "text", "p_reference_type" character varying, "p_reference_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_anomaly_alert"("p_alert_type" character varying, "p_severity" character varying, "p_title" character varying, "p_description" "text", "p_reference_type" character varying, "p_reference_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_anomaly_alert"("p_alert_type" character varying, "p_severity" character varying, "p_title" character varying, "p_description" "text", "p_reference_type" character varying, "p_reference_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_settings_profile"("p_name" character varying, "p_description" "text", "p_type" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."create_settings_profile"("p_name" character varying, "p_description" "text", "p_type" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_settings_profile"("p_name" character varying, "p_description" "text", "p_type" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_stock_movements_on_receive"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_stock_movements_on_receive"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_stock_movements_on_receive"() TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_production_ingredients"("p_production_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_production_ingredients"("p_production_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_production_ingredients"("p_production_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_stock_from_order"() TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_stock_from_order"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_stock_from_order"() TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_stock_on_sale"() TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_stock_on_sale"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_stock_on_sale"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."export_settings"() TO "anon";
GRANT ALL ON FUNCTION "public"."export_settings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."export_settings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."finalize_inventory_count"("count_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."finalize_inventory_count"("count_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."finalize_inventory_count"("count_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_audit_product_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_audit_product_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_audit_product_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_create_movements_on_order_complete"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_create_movements_on_order_complete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_create_movements_on_order_complete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_b2b_delivery_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_b2b_delivery_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_b2b_delivery_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_b2b_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_b2b_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_b2b_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_b2b_payment_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_b2b_payment_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_b2b_payment_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_customer_qr_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_customer_qr_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_customer_qr_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_device_token_hash"("p_device_id" character varying, "p_secret" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_device_token_hash"("p_device_id" character varying, "p_secret" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_device_token_hash"("p_device_id" character varying, "p_secret" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_inventory_count_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_inventory_count_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_inventory_count_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_membership_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_membership_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_membership_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_movement_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_movement_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_movement_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_po_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_po_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_po_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_production_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_production_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_production_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_session_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_session_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_session_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_transfer_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_transfer_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_transfer_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_all_terminal_settings"("p_terminal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_terminal_settings"("p_terminal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_terminal_settings"("p_terminal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_applicable_promotions"("p_product_ids" "uuid"[], "p_category_ids" "uuid"[], "p_customer_id" "uuid", "p_subtotal" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."get_applicable_promotions"("p_product_ids" "uuid"[], "p_category_ids" "uuid"[], "p_customer_id" "uuid", "p_subtotal" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_applicable_promotions"("p_product_ids" "uuid"[], "p_category_ids" "uuid"[], "p_customer_id" "uuid", "p_subtotal" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_available_stock"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_available_stock"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_available_stock"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_combo_with_groups"("p_combo_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_combo_with_groups"("p_combo_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_combo_with_groups"("p_combo_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_price"("p_customer_id" "uuid", "p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_price"("p_customer_id" "uuid", "p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_price"("p_customer_id" "uuid", "p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_product_price"("p_product_id" "uuid", "p_customer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_product_price"("p_product_id" "uuid", "p_customer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_product_price"("p_product_id" "uuid", "p_customer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_kds_orders"("p_station" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_kds_orders"("p_station" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_kds_orders"("p_station" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_lan_hub_node"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_lan_hub_node"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_lan_hub_node"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_online_lan_nodes"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_online_lan_nodes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_online_lan_nodes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_overdue_invoices"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_overdue_invoices"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_overdue_invoices"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reporting_dashboard_summary"("start_date" timestamp without time zone, "end_date" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_reporting_dashboard_summary"("start_date" timestamp without time zone, "end_date" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reporting_dashboard_summary"("start_date" timestamp without time zone, "end_date" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sales_analytics"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "trunc_interval" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sales_analytics"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "trunc_interval" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sales_analytics"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "trunc_interval" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sales_comparison"("current_start" timestamp without time zone, "current_end" timestamp without time zone, "previous_start" timestamp without time zone, "previous_end" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sales_comparison"("current_start" timestamp without time zone, "current_end" timestamp without time zone, "previous_start" timestamp without time zone, "previous_end" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sales_comparison"("current_start" timestamp without time zone, "current_end" timestamp without time zone, "previous_start" timestamp without time zone, "previous_end" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_setting"("p_key" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_setting"("p_key" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_setting"("p_key" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_settings_by_category"("p_category_code" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_settings_by_category"("p_category_code" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_settings_by_category"("p_category_code" character varying) TO "service_role";



GRANT ALL ON TABLE "public"."pos_sessions" TO "anon";
GRANT ALL ON TABLE "public"."pos_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."pos_sessions" TO "service_role";
GRANT ALL ON TABLE "public"."pos_sessions" TO PUBLIC;



GRANT ALL ON FUNCTION "public"."get_terminal_open_shifts"("p_terminal_id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_terminal_open_shifts"("p_terminal_id" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_terminal_open_shifts"("p_terminal_id" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp without time zone, "end_date" timestamp without time zone, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_open_shift"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_open_shift"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_open_shift"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_permissions"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";
GRANT ALL ON TABLE "public"."roles" TO PUBLIC;



GRANT ALL ON FUNCTION "public"."get_user_primary_role"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_primary_role"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_primary_role"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hash_pin"("p_pin" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."hash_pin"("p_pin" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hash_pin"("p_pin" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_b2b_order_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_b2b_order_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_b2b_order_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_order_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_order_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_order_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_price_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_price_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_price_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_purchase_order_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_purchase_order_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_purchase_order_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_setting_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_setting_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_setting_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_stale_lan_nodes_offline"("p_timeout_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."mark_stale_lan_nodes_offline"("p_timeout_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_stale_lan_nodes_offline"("p_timeout_seconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."open_shift"("p_user_id" "uuid", "p_opening_cash" numeric, "p_terminal_id" character varying, "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."open_shift"("p_user_id" "uuid", "p_opening_cash" numeric, "p_terminal_id" character varying, "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."open_shift"("p_user_id" "uuid", "p_opening_cash" numeric, "p_terminal_id" character varying, "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_production"("production_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."process_production"("production_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_production"("production_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."receive_po_items"("p_po_id" "uuid", "p_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."receive_po_items"("p_po_id" "uuid", "p_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."receive_po_items"("p_po_id" "uuid", "p_items" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."record_promotion_usage"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_order_id" "uuid", "p_discount_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."record_promotion_usage"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_order_id" "uuid", "p_discount_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_promotion_usage"("p_promotion_id" "uuid", "p_customer_id" "uuid", "p_order_id" "uuid", "p_discount_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."record_stock_before_after"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_stock_before_after"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_stock_before_after"() TO "service_role";



GRANT ALL ON FUNCTION "public"."redeem_loyalty_points"("p_customer_id" "uuid", "p_points" integer, "p_order_id" "uuid", "p_description" "text", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."redeem_loyalty_points"("p_customer_id" "uuid", "p_points" integer, "p_order_id" "uuid", "p_description" "text", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."redeem_loyalty_points"("p_customer_id" "uuid", "p_points" integer, "p_order_id" "uuid", "p_description" "text", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."register_lan_node"("p_device_id" character varying, "p_device_type" character varying, "p_device_name" character varying, "p_ip_address" "inet", "p_port" integer, "p_is_hub" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."register_lan_node"("p_device_id" character varying, "p_device_type" character varying, "p_device_name" character varying, "p_ip_address" "inet", "p_port" integer, "p_is_hub" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_lan_node"("p_device_id" character varying, "p_device_type" character varying, "p_device_name" character varying, "p_ip_address" "inet", "p_port" integer, "p_is_hub" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_category_settings"("p_category_code" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."reset_category_settings"("p_category_code" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_category_settings"("p_category_code" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_setting"("p_key" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."reset_setting"("p_key" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_setting"("p_key" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying, "p_value" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."set_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying, "p_value" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_terminal_setting"("p_terminal_id" "uuid", "p_key" character varying, "p_value" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_pin"("p_user_id" "uuid", "p_pin" character varying, "p_updated_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_pin"("p_user_id" "uuid", "p_pin" character varying, "p_updated_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_pin"("p_user_id" "uuid", "p_pin" character varying, "p_updated_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."settings_update_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."settings_update_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."settings_update_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."transfer_stock"("p_product_id" "uuid", "p_from_section_id" "uuid", "p_to_section_id" "uuid", "p_quantity" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."transfer_stock"("p_product_id" "uuid", "p_from_section_id" "uuid", "p_to_section_id" "uuid", "p_quantity" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."transfer_stock"("p_product_id" "uuid", "p_from_section_id" "uuid", "p_to_section_id" "uuid", "p_quantity" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_production_stock_deduction"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_production_stock_deduction"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_production_stock_deduction"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_deliveries_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_deliveries_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_deliveries_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_delivery_quantities"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_delivery_quantities"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_delivery_quantities"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_order_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_order_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_order_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_order_payment_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_order_payment_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_order_payment_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_order_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_order_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_order_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_orders_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_orders_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_orders_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_b2b_payments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_b2b_payments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_b2b_payments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customer_categories_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customer_categories_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customer_categories_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customer_category_prices_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customer_category_prices_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customer_category_prices_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customer_loyalty"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customer_loyalty"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customer_loyalty"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customer_loyalty_tier"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customer_loyalty_tier"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customer_loyalty_tier"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customers_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customers_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customers_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_device_last_seen"("p_device_id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."update_device_last_seen"("p_device_id" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_device_last_seen"("p_device_id" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_display_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_display_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_display_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_floor_plan_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_floor_plan_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_floor_plan_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_internal_transfers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_internal_transfers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_internal_transfers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_lan_node_heartbeat"("p_device_id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."update_lan_node_heartbeat"("p_device_id" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_lan_node_heartbeat"("p_device_id" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_lan_nodes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_lan_nodes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_lan_nodes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_loyalty_rewards_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_loyalty_rewards_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_loyalty_rewards_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_loyalty_tiers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_loyalty_tiers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_loyalty_tiers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_offline_versions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_offline_versions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_offline_versions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pos_sessions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pos_sessions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pos_sessions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_pos_terminals_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_pos_terminals_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_pos_terminals_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_category_prices_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_category_prices_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_category_prices_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_purchase_order_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_purchase_order_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_purchase_order_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_purchase_order_returns_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_purchase_order_returns_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_purchase_order_returns_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_purchase_order_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_purchase_order_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_purchase_order_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_purchase_orders_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_purchase_orders_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_purchase_orders_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_session_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_session_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_session_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_setting"("p_key" character varying, "p_value" "jsonb", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_setting"("p_key" character varying, "p_value" "jsonb", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_setting"("p_key" character varying, "p_value" "jsonb", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_settings_bulk"("p_settings" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_settings_bulk"("p_settings" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_settings_bulk"("p_settings" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_stock_locations_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_stock_locations_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_stock_locations_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_suppliers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_suppliers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_suppliers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sync_devices_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sync_devices_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sync_devices_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tables_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tables_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tables_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_transfer_totals"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_transfer_totals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transfer_totals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_any_role"("required_roles" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_any_role"("required_roles" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_any_role"("required_roles" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_permission"("p_user_id" "uuid", "p_permission_code" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_permission"("p_user_id" "uuid", "p_permission_code" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_permission"("p_user_id" "uuid", "p_permission_code" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_role"("required_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_role"("required_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_role"("required_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_device_token"("p_device_id" character varying, "p_token_hash" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."verify_device_token"("p_device_id" character varying, "p_token_hash" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_device_token"("p_device_id" character varying, "p_token_hash" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_manager_pin"("pin_input" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."verify_manager_pin"("pin_input" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_manager_pin"("pin_input" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_user_pin"("p_user_id" "uuid", "p_pin" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."verify_user_pin"("p_user_id" "uuid", "p_pin" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_user_pin"("p_user_id" "uuid", "p_pin" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."warn_plaintext_pin"() TO "anon";
GRANT ALL ON FUNCTION "public"."warn_plaintext_pin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."warn_plaintext_pin"() TO "service_role";
























GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";
GRANT ALL ON TABLE "public"."audit_logs" TO PUBLIC;



GRANT ALL ON TABLE "public"."b2b_deliveries" TO "anon";
GRANT ALL ON TABLE "public"."b2b_deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_deliveries" TO "service_role";
GRANT ALL ON TABLE "public"."b2b_deliveries" TO PUBLIC;



GRANT ALL ON TABLE "public"."b2b_delivery_items" TO "anon";
GRANT ALL ON TABLE "public"."b2b_delivery_items" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_delivery_items" TO "service_role";
GRANT ALL ON TABLE "public"."b2b_delivery_items" TO PUBLIC;



GRANT ALL ON TABLE "public"."b2b_order_history" TO "anon";
GRANT ALL ON TABLE "public"."b2b_order_history" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_order_history" TO "service_role";
GRANT ALL ON TABLE "public"."b2b_order_history" TO PUBLIC;



GRANT ALL ON TABLE "public"."b2b_order_items" TO "anon";
GRANT ALL ON TABLE "public"."b2b_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."b2b_orders" TO "anon";
GRANT ALL ON TABLE "public"."b2b_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_orders" TO "service_role";



GRANT ALL ON TABLE "public"."b2b_payments" TO "anon";
GRANT ALL ON TABLE "public"."b2b_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."b2b_payments" TO "service_role";
GRANT ALL ON TABLE "public"."b2b_payments" TO PUBLIC;



GRANT ALL ON TABLE "public"."business_hours" TO "anon";
GRANT ALL ON TABLE "public"."business_hours" TO "authenticated";
GRANT ALL ON TABLE "public"."business_hours" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."customer_categories" TO "anon";
GRANT ALL ON TABLE "public"."customer_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_categories" TO "service_role";
GRANT ALL ON TABLE "public"."customer_categories" TO PUBLIC;



GRANT ALL ON TABLE "public"."customer_category_prices" TO "anon";
GRANT ALL ON TABLE "public"."customer_category_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_category_prices" TO "service_role";



GRANT ALL ON TABLE "public"."customer_invoices" TO "anon";
GRANT ALL ON TABLE "public"."customer_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_invoices" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."display_configurations" TO "anon";
GRANT ALL ON TABLE "public"."display_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."display_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."display_order_queue" TO "anon";
GRANT ALL ON TABLE "public"."display_order_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."display_order_queue" TO "service_role";



GRANT ALL ON TABLE "public"."display_promotions" TO "anon";
GRANT ALL ON TABLE "public"."display_promotions" TO "authenticated";
GRANT ALL ON TABLE "public"."display_promotions" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."floor_plan_items" TO "anon";
GRANT ALL ON TABLE "public"."floor_plan_items" TO "authenticated";
GRANT ALL ON TABLE "public"."floor_plan_items" TO "service_role";



GRANT ALL ON TABLE "public"."internal_transfers" TO "anon";
GRANT ALL ON TABLE "public"."internal_transfers" TO "authenticated";
GRANT ALL ON TABLE "public"."internal_transfers" TO "service_role";
GRANT ALL ON TABLE "public"."internal_transfers" TO PUBLIC;



GRANT ALL ON TABLE "public"."inventory_count_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_count_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_count_items" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_counts" TO "anon";
GRANT ALL ON TABLE "public"."inventory_counts" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_counts" TO "service_role";



GRANT ALL ON TABLE "public"."lan_messages_log" TO "anon";
GRANT ALL ON TABLE "public"."lan_messages_log" TO "authenticated";
GRANT ALL ON TABLE "public"."lan_messages_log" TO "service_role";



GRANT ALL ON TABLE "public"."lan_nodes" TO "anon";
GRANT ALL ON TABLE "public"."lan_nodes" TO "authenticated";
GRANT ALL ON TABLE "public"."lan_nodes" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_redemptions" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_redemptions" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_redemptions" TO "service_role";
GRANT ALL ON TABLE "public"."loyalty_redemptions" TO PUBLIC;



GRANT ALL ON TABLE "public"."loyalty_rewards" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_rewards" TO "service_role";
GRANT ALL ON TABLE "public"."loyalty_rewards" TO PUBLIC;



GRANT ALL ON TABLE "public"."loyalty_tiers" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_tiers" TO "service_role";
GRANT ALL ON TABLE "public"."loyalty_tiers" TO PUBLIC;



GRANT ALL ON TABLE "public"."loyalty_transactions" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO "service_role";
GRANT ALL ON TABLE "public"."loyalty_transactions" TO PUBLIC;



GRANT ALL ON TABLE "public"."offline_versions" TO "anon";
GRANT ALL ON TABLE "public"."offline_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."offline_versions" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";
GRANT ALL ON TABLE "public"."permissions" TO PUBLIC;



GRANT ALL ON TABLE "public"."po_items" TO "anon";
GRANT ALL ON TABLE "public"."po_items" TO "authenticated";
GRANT ALL ON TABLE "public"."po_items" TO "service_role";



GRANT ALL ON TABLE "public"."pos_terminals" TO "anon";
GRANT ALL ON TABLE "public"."pos_terminals" TO "authenticated";
GRANT ALL ON TABLE "public"."pos_terminals" TO "service_role";



GRANT ALL ON TABLE "public"."printer_configurations" TO "anon";
GRANT ALL ON TABLE "public"."printer_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."printer_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."product_category_prices" TO "anon";
GRANT ALL ON TABLE "public"."product_category_prices" TO "authenticated";
GRANT ALL ON TABLE "public"."product_category_prices" TO "service_role";



GRANT ALL ON TABLE "public"."product_combo_group_items" TO "anon";
GRANT ALL ON TABLE "public"."product_combo_group_items" TO "authenticated";
GRANT ALL ON TABLE "public"."product_combo_group_items" TO "service_role";



GRANT ALL ON TABLE "public"."product_combo_groups" TO "anon";
GRANT ALL ON TABLE "public"."product_combo_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."product_combo_groups" TO "service_role";



GRANT ALL ON TABLE "public"."product_combos" TO "anon";
GRANT ALL ON TABLE "public"."product_combos" TO "authenticated";
GRANT ALL ON TABLE "public"."product_combos" TO "service_role";



GRANT ALL ON TABLE "public"."product_modifiers" TO "anon";
GRANT ALL ON TABLE "public"."product_modifiers" TO "authenticated";
GRANT ALL ON TABLE "public"."product_modifiers" TO "service_role";



GRANT ALL ON TABLE "public"."product_sections" TO "anon";
GRANT ALL ON TABLE "public"."product_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."product_sections" TO "service_role";



GRANT ALL ON TABLE "public"."product_stocks" TO "anon";
GRANT ALL ON TABLE "public"."product_stocks" TO "authenticated";
GRANT ALL ON TABLE "public"."product_stocks" TO "service_role";



GRANT ALL ON TABLE "public"."product_uoms" TO "anon";
GRANT ALL ON TABLE "public"."product_uoms" TO "authenticated";
GRANT ALL ON TABLE "public"."product_uoms" TO "service_role";



GRANT ALL ON TABLE "public"."production_records" TO "anon";
GRANT ALL ON TABLE "public"."production_records" TO "authenticated";
GRANT ALL ON TABLE "public"."production_records" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_free_products" TO "anon";
GRANT ALL ON TABLE "public"."promotion_free_products" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_free_products" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_products" TO "anon";
GRANT ALL ON TABLE "public"."promotion_products" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_products" TO "service_role";



GRANT ALL ON TABLE "public"."promotion_usage" TO "anon";
GRANT ALL ON TABLE "public"."promotion_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."promotion_usage" TO "service_role";



GRANT ALL ON TABLE "public"."promotions" TO "anon";
GRANT ALL ON TABLE "public"."promotions" TO "authenticated";
GRANT ALL ON TABLE "public"."promotions" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_order_history" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order_history" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order_history" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_order_items" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_order_returns" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order_returns" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order_returns" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_orders" TO "anon";
GRANT ALL ON TABLE "public"."purchase_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_orders" TO "service_role";



GRANT ALL ON TABLE "public"."receipt_templates" TO "anon";
GRANT ALL ON TABLE "public"."receipt_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."receipt_templates" TO "service_role";



GRANT ALL ON TABLE "public"."recipes" TO "anon";
GRANT ALL ON TABLE "public"."recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipes" TO "service_role";



GRANT ALL ON TABLE "public"."reporting_stock_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."reporting_stock_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."reporting_stock_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";
GRANT ALL ON TABLE "public"."role_permissions" TO PUBLIC;



GRANT ALL ON TABLE "public"."section_items" TO "anon";
GRANT ALL ON TABLE "public"."section_items" TO "authenticated";
GRANT ALL ON TABLE "public"."section_items" TO "service_role";



GRANT ALL ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT ALL ON TABLE "public"."sections" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."settings_categories" TO "anon";
GRANT ALL ON TABLE "public"."settings_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_categories" TO "service_role";



GRANT ALL ON TABLE "public"."settings_history" TO "anon";
GRANT ALL ON TABLE "public"."settings_history" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_history" TO "service_role";



GRANT ALL ON TABLE "public"."settings_profiles" TO "anon";
GRANT ALL ON TABLE "public"."settings_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."settings_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sound_assets" TO "anon";
GRANT ALL ON TABLE "public"."sound_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."sound_assets" TO "service_role";



GRANT ALL ON TABLE "public"."stock_locations" TO "anon";
GRANT ALL ON TABLE "public"."stock_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_locations" TO "service_role";
GRANT ALL ON TABLE "public"."stock_locations" TO PUBLIC;



GRANT ALL ON TABLE "public"."stock_movements" TO "anon";
GRANT ALL ON TABLE "public"."stock_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_movements" TO "service_role";



GRANT ALL ON TABLE "public"."stock_reservations" TO "anon";
GRANT ALL ON TABLE "public"."stock_reservations" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_reservations" TO "service_role";



GRANT ALL ON TABLE "public"."storage_sections" TO "anon";
GRANT ALL ON TABLE "public"."storage_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."storage_sections" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."sync_devices" TO "anon";
GRANT ALL ON TABLE "public"."sync_devices" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_devices" TO "service_role";



GRANT ALL ON TABLE "public"."sync_queue" TO "anon";
GRANT ALL ON TABLE "public"."sync_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_queue" TO "service_role";



GRANT ALL ON TABLE "public"."system_alerts" TO "anon";
GRANT ALL ON TABLE "public"."system_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."system_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."system_logs" TO "anon";
GRANT ALL ON TABLE "public"."system_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."system_logs" TO "service_role";



GRANT ALL ON TABLE "public"."tax_rates" TO "anon";
GRANT ALL ON TABLE "public"."tax_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."tax_rates" TO "service_role";



GRANT ALL ON TABLE "public"."terminal_settings" TO "anon";
GRANT ALL ON TABLE "public"."terminal_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."terminal_settings" TO "service_role";



GRANT ALL ON TABLE "public"."transfer_items" TO "anon";
GRANT ALL ON TABLE "public"."transfer_items" TO "authenticated";
GRANT ALL ON TABLE "public"."transfer_items" TO "service_role";
GRANT ALL ON TABLE "public"."transfer_items" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";
GRANT ALL ON TABLE "public"."user_permissions" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";
GRANT ALL ON TABLE "public"."user_profiles" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
GRANT ALL ON TABLE "public"."user_roles" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";
GRANT ALL ON TABLE "public"."user_sessions" TO PUBLIC;









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































