drop extension if exists "pg_net";

drop view if exists "public"."view_production_summary";

drop view if exists "public"."view_section_stock_details";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.finalize_inventory_count(count_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    count_record RECORD;
    item_record RECORD;
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
    v_variance DECIMAL;
    v_user_id UUID;
    v_user_profile_id UUID;
BEGIN
    -- SECURITY: Get the actual caller's identity from auth context (cannot be spoofed)
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get user profile ID for staff_id and validated_by fields
    SELECT id INTO v_user_profile_id
    FROM user_profiles
    WHERE auth_user_id = v_user_id
    LIMIT 1;

    IF v_user_profile_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- SECURITY: Verify caller has the required permission
    IF NOT user_has_permission(v_user_profile_id, 'inventory.adjust') THEN
        RAISE EXCEPTION 'Permission denied: inventory.adjust required';
    END IF;

    -- 1. Get and validate count session
    SELECT * INTO count_record
    FROM inventory_counts
    WHERE id = count_uuid;

    IF count_record IS NULL THEN
        RAISE EXCEPTION 'Inventory count not found';
    END IF;

    IF count_record.status != 'draft' THEN
        RAISE EXCEPTION 'Inventory count is not in draft status';
    END IF;

    -- 2. Iterate items with variance (using current column names)
    FOR item_record IN
        SELECT *
        FROM inventory_count_items
        WHERE count_id = count_uuid
          AND counted_quantity IS NOT NULL
          AND difference IS NOT NULL
          AND difference != 0
    LOOP
        v_variance := item_record.difference;

        -- Get current stock from product
        SELECT COALESCE(current_stock, 0) INTO v_current_stock
        FROM public.products
        WHERE id = item_record.product_id;

        -- Generate unique movement ID
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
                WHEN v_variance > 0 THEN 'adjustment_in'::movement_type
                ELSE 'adjustment_out'::movement_type
            END,
            ABS(v_variance),  -- Stock movement quantity is absolute
            v_current_stock,
            v_current_stock + v_variance,
            'inventory_count',
            count_uuid::text,
            'Stock Opname ' || count_record.count_number,
            v_user_profile_id  -- SECURITY: Use server-verified user ID
        );

        -- Update product current_stock
        UPDATE public.products
        SET current_stock = v_current_stock + v_variance,
            updated_at = NOW()
        WHERE id = item_record.product_id;
    END LOOP;

    -- 3. Update inventory count status
    UPDATE inventory_counts
    SET status = 'completed',
        validated_at = NOW(),
        validated_by = v_user_profile_id,  -- SECURITY: Use server-verified user ID
        updated_at = NOW()
    WHERE id = count_uuid;

    RETURN TRUE;
END;
$function$
;

create or replace view "public"."view_production_summary" as  SELECT pr.production_date,
    p.id AS product_id,
    p.name AS product_name,
    s.name AS section_name,
    sum(pr.quantity_produced) AS total_produced,
    sum(pr.quantity_waste) AS total_waste,
    count(*) AS production_batches
   FROM ((public.production_records pr
     JOIN public.products p ON ((pr.product_id = p.id)))
     LEFT JOIN public.sections s ON ((pr.section_id = s.id)))
  WHERE (pr.production_date >= (CURRENT_DATE - '30 days'::interval))
  GROUP BY pr.production_date, p.id, p.name, s.name
  ORDER BY pr.production_date DESC, (sum(pr.quantity_produced)) DESC;


create or replace view "public"."view_section_stock_details" as  SELECT ss.id,
    ss.section_id,
    s.name AS section_name,
    s.code AS section_code,
    s.section_type,
    ss.product_id,
    p.name AS product_name,
    p.sku,
    p.product_type,
    p.unit,
    ss.quantity,
    ss.min_quantity,
    ss.max_quantity,
        CASE
            WHEN (ss.quantity <= (0)::numeric) THEN 'out_of_stock'::text
            WHEN (ss.quantity <= ss.min_quantity) THEN 'low_stock'::text
            ELSE 'in_stock'::text
        END AS stock_status,
    ss.last_counted_at,
    ss.updated_at
   FROM ((public.section_stock ss
     JOIN public.sections s ON ((s.id = ss.section_id)))
     JOIN public.products p ON ((p.id = ss.product_id)))
  WHERE (s.is_active = true);

-- NOTE: Storage triggers and policies removed - managed by Supabase infrastructure
