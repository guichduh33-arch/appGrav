drop trigger if exists "purchase_order_items_delete_trigger" on "public"."purchase_order_items";

drop trigger if exists "purchase_order_items_insert_trigger" on "public"."purchase_order_items";

drop trigger if exists "purchase_order_items_update_trigger" on "public"."purchase_order_items";

drop trigger if exists "trg_update_transfer_totals" on "public"."transfer_items";

drop policy "Authenticated users can insert order payments" on "public"."order_payments";

drop policy "Authenticated users can read order payments" on "public"."order_payments";

drop policy "Authenticated users can update order payments" on "public"."order_payments";

drop policy "po_items_delete" on "public"."po_items";

drop policy "po_items_insert" on "public"."po_items";

drop policy "po_items_select" on "public"."po_items";

drop policy "po_items_update" on "public"."po_items";

drop policy "Authenticated insert system_alerts" on "public"."system_alerts";

drop policy "Authenticated read system_alerts" on "public"."system_alerts";

drop policy "Authenticated update system_alerts" on "public"."system_alerts";

revoke delete on table "public"."order_payments" from "anon";

revoke insert on table "public"."order_payments" from "anon";

revoke references on table "public"."order_payments" from "anon";

revoke select on table "public"."order_payments" from "anon";

revoke trigger on table "public"."order_payments" from "anon";

revoke truncate on table "public"."order_payments" from "anon";

revoke update on table "public"."order_payments" from "anon";

revoke delete on table "public"."order_payments" from "authenticated";

revoke insert on table "public"."order_payments" from "authenticated";

revoke references on table "public"."order_payments" from "authenticated";

revoke select on table "public"."order_payments" from "authenticated";

revoke trigger on table "public"."order_payments" from "authenticated";

revoke truncate on table "public"."order_payments" from "authenticated";

revoke update on table "public"."order_payments" from "authenticated";

revoke delete on table "public"."order_payments" from "service_role";

revoke insert on table "public"."order_payments" from "service_role";

revoke references on table "public"."order_payments" from "service_role";

revoke select on table "public"."order_payments" from "service_role";

revoke trigger on table "public"."order_payments" from "service_role";

revoke truncate on table "public"."order_payments" from "service_role";

revoke update on table "public"."order_payments" from "service_role";

revoke delete on table "public"."po_items" from "anon";

revoke insert on table "public"."po_items" from "anon";

revoke references on table "public"."po_items" from "anon";

revoke select on table "public"."po_items" from "anon";

revoke trigger on table "public"."po_items" from "anon";

revoke truncate on table "public"."po_items" from "anon";

revoke update on table "public"."po_items" from "anon";

revoke delete on table "public"."po_items" from "authenticated";

revoke insert on table "public"."po_items" from "authenticated";

revoke references on table "public"."po_items" from "authenticated";

revoke select on table "public"."po_items" from "authenticated";

revoke trigger on table "public"."po_items" from "authenticated";

revoke truncate on table "public"."po_items" from "authenticated";

revoke update on table "public"."po_items" from "authenticated";

revoke delete on table "public"."po_items" from "service_role";

revoke insert on table "public"."po_items" from "service_role";

revoke references on table "public"."po_items" from "service_role";

revoke select on table "public"."po_items" from "service_role";

revoke trigger on table "public"."po_items" from "service_role";

revoke truncate on table "public"."po_items" from "service_role";

revoke update on table "public"."po_items" from "service_role";

revoke delete on table "public"."system_alerts" from "anon";

revoke insert on table "public"."system_alerts" from "anon";

revoke references on table "public"."system_alerts" from "anon";

revoke select on table "public"."system_alerts" from "anon";

revoke trigger on table "public"."system_alerts" from "anon";

revoke truncate on table "public"."system_alerts" from "anon";

revoke update on table "public"."system_alerts" from "anon";

revoke delete on table "public"."system_alerts" from "authenticated";

revoke insert on table "public"."system_alerts" from "authenticated";

revoke references on table "public"."system_alerts" from "authenticated";

revoke select on table "public"."system_alerts" from "authenticated";

revoke trigger on table "public"."system_alerts" from "authenticated";

revoke truncate on table "public"."system_alerts" from "authenticated";

revoke update on table "public"."system_alerts" from "authenticated";

revoke delete on table "public"."system_alerts" from "service_role";

revoke insert on table "public"."system_alerts" from "service_role";

revoke references on table "public"."system_alerts" from "service_role";

revoke select on table "public"."system_alerts" from "service_role";

revoke trigger on table "public"."system_alerts" from "service_role";

revoke truncate on table "public"."system_alerts" from "service_role";

revoke update on table "public"."system_alerts" from "service_role";

alter table "public"."b2b_orders" drop constraint "chk_b2b_orders_amounts";

alter table "public"."b2b_orders" drop constraint "fk_b2b_orders_created_by";

alter table "public"."customer_categories" drop constraint "chk_customer_categories_discount";

alter table "public"."loyalty_tiers" drop constraint "chk_loyalty_tiers_discount";

alter table "public"."order_payments" drop constraint "order_payments_created_by_fkey";

alter table "public"."order_payments" drop constraint "order_payments_order_id_fkey";

alter table "public"."orders" drop constraint "chk_orders_discount";

alter table "public"."orders" drop constraint "orders_refunded_by_fkey";

alter table "public"."po_items" drop constraint "chk_po_items_quantity";

alter table "public"."po_items" drop constraint "po_items_po_id_fkey";

alter table "public"."po_items" drop constraint "po_items_product_id_fkey";

alter table "public"."system_alerts" drop constraint "system_alerts_resolved_by_fkey";

alter table "public"."system_alerts" drop constraint "system_alerts_severity_check";

alter table "public"."pos_sessions" drop constraint "pos_sessions_user_id_fkey";

alter table "public"."recipes" drop constraint "recipes_material_id_fkey";

alter table "public"."recipes" drop constraint "recipes_product_id_fkey";

drop function if exists "public"."get_reporting_dashboard_summary"(start_date timestamp with time zone, end_date timestamp with time zone);

drop function if exists "public"."get_sales_comparison"(current_start timestamp with time zone, current_end timestamp with time zone, previous_start timestamp with time zone, previous_end timestamp with time zone);

drop view if exists "public"."purchase_order_items";

drop function if exists "public"."register_lan_node"(p_device_id character varying, p_device_name character varying, p_device_type character varying, p_ip_address inet, p_is_hub boolean, p_port integer);

drop function if exists "public"."update_transfer_totals"();

drop view if exists "public"."view_b2b_receivables";

drop view if exists "public"."view_expired_stock";

drop view if exists "public"."view_profit_loss";

drop view if exists "public"."view_sales_by_customer";

drop view if exists "public"."view_sales_by_hour";

drop view if exists "public"."view_section_transfers";

drop view if exists "public"."view_session_cash_balance";

drop view if exists "public"."view_stock_warning";

drop view if exists "public"."view_unsold_products";

drop view if exists "public"."view_category_sales";

drop view if exists "public"."view_daily_kpis";

drop view if exists "public"."view_hourly_sales";

drop view if exists "public"."view_order_type_distribution";

drop view if exists "public"."view_payment_method_stats";

drop view if exists "public"."view_product_sales";

drop view if exists "public"."view_production_summary";

drop view if exists "public"."view_section_stock_details";

drop view if exists "public"."view_staff_performance";

alter table "public"."order_payments" drop constraint "order_payments_pkey";

alter table "public"."po_items" drop constraint "po_items_pkey";

alter table "public"."system_alerts" drop constraint "system_alerts_pkey";

drop index if exists "public"."idx_order_payments_created";

drop index if exists "public"."idx_order_payments_order_status";

drop index if exists "public"."idx_order_payments_sync";

drop index if exists "public"."idx_orders_refunded";

drop index if exists "public"."idx_pos_sessions_manager";

drop index if exists "public"."idx_system_alerts_type";

drop index if exists "public"."idx_system_alerts_unresolved";

drop index if exists "public"."order_payments_pkey";

drop index if exists "public"."po_items_pkey";

drop index if exists "public"."system_alerts_pkey";

drop index if exists "public"."idx_po_items_po";

drop index if exists "public"."idx_po_items_product";

drop table "public"."order_payments";

drop table "public"."po_items";

drop table "public"."system_alerts";

alter table "public"."orders" alter column "status" drop default;

-- Drop trigger that depends on orders.status column before altering the type
DROP TRIGGER IF EXISTS tr_deduct_stock_on_sale ON public.orders;

alter type "public"."order_status" rename to "order_status__old_version_to_be_dropped";

create type "public"."order_status" as enum ('new', 'preparing', 'ready', 'served', 'completed', 'cancelled');


  create table "public"."purchase_order_items" (
    "id" uuid not null default gen_random_uuid(),
    "purchase_order_id" uuid not null,
    "product_id" uuid not null,
    "quantity" numeric(10,3) not null,
    "quantity_received" numeric(10,3) default 0,
    "unit" character varying(20),
    "unit_price" numeric(12,2) not null,
    "total" numeric(12,2) not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "quantity_returned" numeric(10,3) default 0,
    "product_name" character varying(200)
      );


alter table "public"."purchase_order_items" enable row level security;

alter table "public"."orders" alter column status type "public"."order_status" using status::text::"public"."order_status";

alter table "public"."orders" alter column "status" set default 'new'::public.order_status;

drop type "public"."order_status__old_version_to_be_dropped";

-- Recreate the trigger after altering the column type
CREATE TRIGGER tr_deduct_stock_on_sale
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (
    NEW.status = 'completed'
    AND OLD.status <> 'completed'
)
EXECUTE FUNCTION deduct_stock_on_sale_items();

alter table "public"."business_hours" add column "is_open" boolean generated always as ((NOT COALESCE(is_closed, false))) stored;

alter table "public"."internal_transfers" alter column "from_location_id" drop not null;

alter table "public"."internal_transfers" alter column "to_location_id" drop not null;

alter table "public"."orders" drop column "refund_amount";

alter table "public"."orders" drop column "refund_method";

alter table "public"."orders" drop column "refund_reason";

alter table "public"."orders" drop column "refunded_at";

alter table "public"."orders" drop column "refunded_by";

alter table "public"."products" alter column "sku" drop default;

alter table "public"."sections" add column "slug" character varying(50);

alter table "public"."suppliers" add column "tax_id" character varying(50);

drop sequence if exists "public"."b2b_delivery_seq";

drop sequence if exists "public"."b2b_order_seq";

drop sequence if exists "public"."b2b_payment_seq";

drop sequence if exists "public"."count_number_seq";

drop sequence if exists "public"."movement_id_seq";

drop sequence if exists "public"."order_number_seq";

drop sequence if exists "public"."po_number_seq";

drop sequence if exists "public"."production_id_seq";

drop sequence if exists "public"."session_number_seq";

drop sequence if exists "public"."transfer_number_seq";

CREATE UNIQUE INDEX purchase_order_items_pkey ON public.purchase_order_items USING btree (id);

CREATE INDEX idx_po_items_po ON public.purchase_order_items USING btree (purchase_order_id);

CREATE INDEX idx_po_items_product ON public.purchase_order_items USING btree (product_id);

alter table "public"."purchase_order_items" add constraint "purchase_order_items_pkey" PRIMARY KEY using index "purchase_order_items_pkey";

alter table "public"."internal_transfers" add constraint "check_transfer_endpoints" CHECK ((((from_location_id IS NOT NULL) AND (to_location_id IS NOT NULL)) OR ((from_section_id IS NOT NULL) AND (to_section_id IS NOT NULL)))) not valid;

alter table "public"."internal_transfers" validate constraint "check_transfer_endpoints";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."purchase_order_items" add constraint "chk_po_items_quantity" CHECK (((quantity > (0)::numeric) AND (quantity_received >= (0)::numeric) AND (unit_price >= (0)::numeric))) not valid;

alter table "public"."purchase_order_items" validate constraint "chk_po_items_quantity";

alter table "public"."purchase_order_items" add constraint "purchase_order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."purchase_order_items" validate constraint "purchase_order_items_product_id_fkey";

alter table "public"."purchase_order_items" add constraint "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE not valid;

alter table "public"."purchase_order_items" validate constraint "purchase_order_items_purchase_order_id_fkey";

alter table "public"."stock_movements" add constraint "stock_movements_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."stock_movements" validate constraint "stock_movements_created_by_fkey";

alter table "public"."stock_movements" add constraint "stock_movements_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL not valid;

alter table "public"."stock_movements" validate constraint "stock_movements_supplier_id_fkey";

alter table "public"."pos_sessions" add constraint "pos_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."pos_sessions" validate constraint "pos_sessions_user_id_fkey";

-- Clean up orphaned recipes before adding FK constraints
DELETE FROM public.recipes WHERE material_id IS NOT NULL AND material_id NOT IN (SELECT id FROM public.products);
DELETE FROM public.recipes WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM public.products);

alter table "public"."recipes" add constraint "recipes_material_id_fkey" FOREIGN KEY (material_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."recipes" validate constraint "recipes_material_id_fkey";

alter table "public"."recipes" add constraint "recipes_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."recipes" validate constraint "recipes_product_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
 RETURNS TABLE(permission_code character varying, permission_module character varying, permission_action character varying, is_granted boolean, source character varying, is_sensitive boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.purchase_order_items_delete_fn()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.po_items WHERE id = OLD.id;
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.purchase_order_items_insert_fn()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.po_items (
        po_id, product_id, quantity_ordered, quantity_received, 
        quantity_returned, unit, unit_price, total, product_name
    ) VALUES (
        NEW.purchase_order_id, NEW.product_id, NEW.quantity, COALESCE(NEW.quantity_received, 0),
        COALESCE(NEW.quantity_returned, 0), NEW.unit, NEW.unit_price, 
        COALESCE(NEW.line_total, NEW.quantity * NEW.unit_price), NEW.product_name
    )
    RETURNING id, po_id, product_id, quantity_ordered, quantity_received, 
              quantity_returned, unit, unit_price, total, product_name, created_at, updated_at
    INTO NEW.id, NEW.purchase_order_id, NEW.product_id, NEW.quantity, NEW.quantity_received,
         NEW.quantity_returned, NEW.unit, NEW.unit_price, NEW.line_total, NEW.product_name, 
         NEW.created_at, NEW.updated_at;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.purchase_order_items_update_fn()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.po_items SET
        po_id = NEW.purchase_order_id,
        product_id = NEW.product_id,
        quantity_ordered = NEW.quantity,
        quantity_received = COALESCE(NEW.quantity_received, quantity_received),
        quantity_returned = COALESCE(NEW.quantity_returned, quantity_returned),
        unit = NEW.unit,
        unit_price = NEW.unit_price,
        total = COALESCE(NEW.line_total, NEW.quantity * NEW.unit_price),
        product_name = NEW.product_name,
        updated_at = NOW()
    WHERE id = OLD.id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.register_lan_node(p_device_id character varying, p_device_name character varying DEFAULT NULL::character varying, p_device_type character varying DEFAULT 'terminal'::character varying, p_ip_address character varying DEFAULT NULL::character varying, p_is_hub boolean DEFAULT false, p_port integer DEFAULT 3001)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_id UUID;
    v_ip_inet INET;
BEGIN
    -- Convert IP string to inet if provided
    IF p_ip_address IS NOT NULL AND p_ip_address != '' THEN
        v_ip_inet := p_ip_address::INET;
    END IF;
    
    -- Try to update existing node (use device_id column, not node_id)
    UPDATE lan_nodes 
    SET 
        device_type = p_device_type,
        device_name = COALESCE(p_device_name, device_name),
        ip_address = COALESCE(v_ip_inet, ip_address),
        port = COALESCE(p_port, port),
        is_hub = COALESCE(p_is_hub, is_hub),
        last_heartbeat = NOW(),
        status = 'online',
        updated_at = NOW()
    WHERE device_id = p_device_id
    RETURNING id INTO v_id;
    
    -- If no row updated, insert new
    IF v_id IS NULL THEN
        INSERT INTO lan_nodes (
            device_id, device_type, device_name, ip_address, port, is_hub, status, last_heartbeat
        )
        VALUES (
            p_device_id, p_device_type, p_device_name, v_ip_inet, p_port, p_is_hub, 'online', NOW()
        )
        RETURNING id INTO v_id;
    END IF;
    
    RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_user_pin(p_user_id uuid, p_pin text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
    
    -- Update user profile with hashed PIN
    UPDATE user_profiles
    SET 
        pin_hash = v_pin_hash,
        pin_code = p_pin,  -- Keep plaintext for legacy compatibility
        updated_at = NOW()
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.verify_user_pin(p_user_id uuid, p_pin text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    v_pin_hash TEXT;
    v_pin_code TEXT;
    v_is_active BOOLEAN;
BEGIN
    -- Get user's PIN hash and status
    SELECT pin_hash, pin_code, is_active
    INTO v_pin_hash, v_pin_code, v_is_active
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- User not found
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- User not active
    IF NOT v_is_active THEN
        RETURN FALSE;
    END IF;
    
    -- Try bcrypt verification first (if pin_hash exists)
    IF v_pin_hash IS NOT NULL AND v_pin_hash != '' THEN
        -- Use pgcrypto's crypt function for bcrypt verification
        RETURN v_pin_hash = extensions.crypt(p_pin, v_pin_hash);
    END IF;
    
    -- Fallback to plaintext comparison (legacy/demo)
    IF v_pin_code IS NOT NULL AND v_pin_code = p_pin THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_loyalty_points(p_customer_id uuid, p_order_id uuid, p_order_amount numeric, p_created_by uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_points_per_amount NUMERIC(10,2);
    v_points_multiplier NUMERIC(5,2);
    v_loyalty_enabled BOOLEAN;
    v_current_points INTEGER;
    v_earned_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    SELECT COALESCE(cc.loyalty_enabled, FALSE), COALESCE(cc.points_per_amount, 1000), COALESCE(cc.points_multiplier, 1.0), c.loyalty_points
    INTO v_loyalty_enabled, v_points_per_amount, v_points_multiplier, v_current_points
    FROM customers c LEFT JOIN customer_categories cc ON c.category_id = cc.id WHERE c.id = p_customer_id;
    IF NOT v_loyalty_enabled THEN RETURN 0; END IF;
    v_earned_points := FLOOR(p_order_amount / v_points_per_amount * v_points_multiplier);
    IF v_earned_points <= 0 THEN RETURN 0; END IF;
    v_new_balance := v_current_points + v_earned_points;
    UPDATE customers SET loyalty_points = v_new_balance, lifetime_points = COALESCE(lifetime_points, 0) + v_earned_points, total_spent = COALESCE(total_spent, 0) + p_order_amount, total_visits = COALESCE(total_visits, 0) + 1, last_visit_at = NOW() WHERE id = p_customer_id;
    INSERT INTO loyalty_transactions (customer_id, order_id, transaction_type, points, points_balance_after, order_amount, points_rate, multiplier, description, created_by) VALUES (p_customer_id, p_order_id, 'earn', v_earned_points, v_new_balance, p_order_amount, v_points_per_amount, v_points_multiplier, 'Points earned from order', p_created_by);
    RETURN v_earned_points;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.close_shift(p_session_id uuid, p_actual_cash numeric, p_actual_qris numeric, p_actual_edc numeric, p_closed_by character varying, p_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_session RECORD;
    v_cash_diff DECIMAL;
    v_qris_diff DECIMAL;
    v_edc_diff DECIMAL;
    v_total_sales DECIMAL;
    v_transaction_count INTEGER;
    v_closed_by_uuid UUID;
BEGIN
    SELECT id, opening_cash, expected_cash, expected_qris, expected_edc, status
    INTO v_session
    FROM public.pos_sessions
    WHERE id = p_session_id AND status = 'open';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found or already closed';
    END IF;

    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO v_total_sales, v_transaction_count
    FROM public.orders
    WHERE (session_id = p_session_id OR pos_session_id = p_session_id)
      AND status = 'completed';

    v_cash_diff := p_actual_cash - COALESCE(v_session.expected_cash, v_session.opening_cash);
    v_qris_diff := p_actual_qris - COALESCE(v_session.expected_qris, 0);
    v_edc_diff := p_actual_edc - COALESCE(v_session.expected_edc, 0);

    BEGIN
        v_closed_by_uuid := p_closed_by::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_closed_by_uuid := NULL;
    END;

    UPDATE public.pos_sessions
    SET
        status = 'closed',
        closed_at = NOW(),
        actual_cash = p_actual_cash,
        actual_qris = p_actual_qris,
        actual_edc = p_actual_edc,
        cash_difference = v_cash_diff,
        qris_difference = v_qris_diff,
        edc_difference = v_edc_diff,
        total_sales = v_total_sales,
        transaction_count = v_transaction_count,
        closed_by = v_closed_by_uuid,
        closed_by_name = p_closed_by,
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
        'session_id', p_session_id,
        'status', 'closed',
        'total_sales', v_total_sales,
        'transaction_count', v_transaction_count,
        'reconciliation', jsonb_build_object(
            'cash', jsonb_build_object(
                'expected', COALESCE(v_session.expected_cash, v_session.opening_cash),
                'actual', p_actual_cash,
                'difference', v_cash_diff
            ),
            'qris', jsonb_build_object(
                'expected', COALESCE(v_session.expected_qris, 0),
                'actual', p_actual_qris,
                'difference', v_qris_diff
            ),
            'edc', jsonb_build_object(
                'expected', COALESCE(v_session.expected_edc, 0),
                'actual', p_actual_edc,
                'difference', v_edc_diff
            )
        )
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.deduct_stock_on_sale_items()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_item RECORD;
    v_deduct_ingredients BOOLEAN;
    v_recipe RECORD;
    v_variant_material RECORD;
    v_sale_movement_type movement_type;
    v_variant_material_ids UUID[] := '{}';
BEGIN
    v_sale_movement_type := CASE
        WHEN NEW.order_type = 'b2b' THEN 'sale_b2b'::movement_type
        ELSE 'sale_pos'::movement_type
    END;

    FOR v_item IN
        SELECT oi.id, oi.product_id, oi.quantity, oi.selected_variants
        FROM order_items oi
        WHERE oi.order_id = NEW.id
          AND oi.product_id IS NOT NULL
    LOOP
        SELECT COALESCE(deduct_ingredients, FALSE) INTO v_deduct_ingredients
        FROM products
        WHERE id = v_item.product_id;

        IF NOT v_deduct_ingredients THEN
            INSERT INTO stock_movements (
                product_id, movement_type, quantity,
                reference_type, reference_id, reason
            )
            VALUES (
                v_item.product_id, v_sale_movement_type, -v_item.quantity,
                'order', NEW.id, 'Sale of pre-made product'
            );
        ELSE
            v_variant_material_ids := '{}';

            IF v_item.selected_variants IS NOT NULL AND jsonb_array_length(v_item.selected_variants) > 0 THEN
                FOR v_variant_material IN
                    SELECT
                        (mat->>'materialId')::UUID as material_id,
                        (mat->>'quantity')::DECIMAL as quantity_needed
                    FROM jsonb_array_elements(v_item.selected_variants) AS variant,
                         jsonb_array_elements(COALESCE(variant->'materials', '[]'::jsonb)) AS mat
                    WHERE mat->>'materialId' IS NOT NULL
                      AND (mat->>'materialId')::UUID IS NOT NULL
                LOOP
                    v_variant_material_ids := array_append(
                        v_variant_material_ids,
                        v_variant_material.material_id
                    );

                    INSERT INTO stock_movements (
                        product_id, movement_type, quantity,
                        reference_type, reference_id, reason
                    )
                    VALUES (
                        v_variant_material.material_id, v_sale_movement_type,
                        -(v_variant_material.quantity_needed * v_item.quantity),
                        'order', NEW.id, 'Variant ingredient for made-to-order sale'
                    );
                END LOOP;
            END IF;

            FOR v_recipe IN
                SELECT r.material_id, r.quantity as quantity_needed
                FROM recipes r
                WHERE r.product_id = v_item.product_id
                  AND r.is_active = TRUE
                  AND r.material_id != ALL(v_variant_material_ids)
            LOOP
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity,
                    reference_type, reference_id, reason
                )
                VALUES (
                    v_recipe.material_id, v_sale_movement_type,
                    -(v_recipe.quantity_needed * v_item.quantity),
                    'order', NEW.id, 'Ingredient for made-to-order sale'
                );
            END LOOP;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_b2b_delivery_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('b2b_delivery', today);
    NEW.delivery_number := 'DLV-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_b2b_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('b2b_order', today);
    NEW.order_number := 'B2B-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_b2b_payment_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('b2b_payment', today);
    NEW.payment_number := 'PAY-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_count_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('count_number', NEW.count_date);
    NEW.count_number := 'CNT-' || TO_CHAR(NEW.count_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_customer_qr_code()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    qr_prefix TEXT := 'BRK';
    random_part TEXT;
    final_qr TEXT;
BEGIN
    IF NEW.loyalty_qr_code IS NULL THEN
        random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');
        WHILE EXISTS (SELECT 1 FROM customers WHERE loyalty_qr_code = final_qr) LOOP
            random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
            final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');
        END LOOP;
        NEW.loyalty_qr_code := final_qr;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_movement_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('movement_id', today);
    NEW.movement_id := 'MVT-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('order_number', today);
    NEW.order_number := 'POS-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_po_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('po_number', today);
    NEW.po_number := 'PO-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_production_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('production_id', NEW.production_date);
    NEW.production_id := 'PROD-' || TO_CHAR(NEW.production_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_session_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('session_number', today);
    NEW.session_number := 'SESSION-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_transfer_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('transfer_number', today);
    NEW.transfer_number := 'TRF-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid() LIMIT 1);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_customer_product_price(p_product_id uuid, p_customer_category_slug character varying)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_category_id UUID;
    v_price_modifier_type TEXT;
    v_discount_percentage NUMERIC(5,2);
    v_custom_price NUMERIC(12,2);
    v_retail_price NUMERIC(12,2);
    v_wholesale_price NUMERIC(12,2);
BEGIN
    SELECT cc.id, cc.price_modifier_type, cc.discount_percentage INTO v_category_id, v_price_modifier_type, v_discount_percentage FROM customer_categories cc WHERE cc.slug = p_customer_category_slug;
    SELECT retail_price, wholesale_price INTO v_retail_price, v_wholesale_price FROM products WHERE id = p_product_id;
    IF v_category_id IS NULL THEN RETURN COALESCE(v_retail_price, 0); END IF;
    CASE v_price_modifier_type
        WHEN 'retail' THEN RETURN COALESCE(v_retail_price, 0);
        WHEN 'wholesale' THEN RETURN COALESCE(v_wholesale_price, v_retail_price, 0);
        WHEN 'custom' THEN
            SELECT custom_price INTO v_custom_price FROM product_category_prices WHERE customer_category_id = v_category_id AND product_id = p_product_id AND is_active = TRUE;
            RETURN COALESCE(v_custom_price, v_retail_price, 0);
        WHEN 'discount_percentage' THEN RETURN COALESCE(v_retail_price, 0) * (1 - COALESCE(v_discount_percentage, 0) / 100);
        ELSE RETURN COALESCE(v_retail_price, 0);
    END CASE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_ingredient_deduction_section(p_ingredient_id uuid, p_consuming_section_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_product_type product_type;
    v_ingredient_section_id UUID;
BEGIN
    -- Get the ingredient's type and section
    SELECT product_type, section_id
    INTO v_product_type, v_ingredient_section_id
    FROM products
    WHERE id = p_ingredient_id;

    -- Rule: semi_finished -> deduct from its origin section
    --       raw_material -> deduct from the consuming section
    IF v_product_type = 'semi_finished' THEN
        RETURN v_ingredient_section_id;
    ELSE
        RETURN p_consuming_section_id;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_next_daily_sequence(p_sequence_name character varying, p_date date DEFAULT CURRENT_DATE)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_next_value INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    UPDATE sequence_tracker
    SET
        last_value = CASE
            WHEN last_date = p_date THEN last_value + 1
            ELSE 1
        END,
        last_date = p_date
    WHERE sequence_name = p_sequence_name
    RETURNING last_value INTO v_next_value;

    IF v_next_value IS NULL THEN
        INSERT INTO sequence_tracker (sequence_name, last_date, last_value)
        VALUES (p_sequence_name, p_date, 1)
        RETURNING last_value INTO v_next_value;
    END IF;

    RETURN v_next_value;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_settings_by_category(p_category_code character varying)
 RETURNS SETOF public.settings
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.*
    FROM settings s
    JOIN settings_categories c ON s.category_id = c.id
    WHERE c.code = p_category_code
    AND c.is_active = TRUE
    ORDER BY s.sort_order ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.hash_session_token()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.session_token IS NOT NULL THEN
        NEW.session_token_hash := encode(sha256(NEW.session_token::bytea), 'hex');
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id AND r.code IN ('SUPER_ADMIN', 'ADMIN')
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.open_shift(p_user_id uuid, p_opening_cash numeric, p_terminal_id character varying, p_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_session_id UUID;
    v_session_number VARCHAR(50);
    v_user_name VARCHAR(200);
BEGIN
    SELECT COALESCE(display_name, name) INTO v_user_name
    FROM public.user_profiles
    WHERE id = p_user_id;

    v_session_number := 'SH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    INSERT INTO public.pos_sessions (
        id,
        session_number,
        user_id,
        opened_by,
        terminal_id_str,
        status,
        opened_at,
        opening_cash,
        expected_cash,
        expected_qris,
        expected_edc,
        total_sales,
        transaction_count,
        notes
    )
    VALUES (
        gen_random_uuid(),
        v_session_number,
        p_user_id,
        p_user_id,
        p_terminal_id,
        'open',
        NOW(),
        p_opening_cash,
        p_opening_cash,
        0,
        0,
        0,
        0,
        p_notes
    )
    RETURNING id INTO v_session_id;

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'session_number', v_session_number,
        'user_name', v_user_name,
        'terminal_id', p_terminal_id,
        'opening_cash', p_opening_cash,
        'status', 'open'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.purchase_order_items_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.po_items WHERE id = OLD.id;
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.purchase_order_items_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_quantity DECIMAL(10,3);
BEGIN
    v_quantity := COALESCE(NEW.quantity, NEW.quantity_ordered, 0);

    INSERT INTO public.po_items (
        id, po_id, product_id, quantity_ordered, quantity_received,
        unit, unit_price, total, created_at, updated_at
    )
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.purchase_order_id,
        NEW.product_id,
        v_quantity,
        COALESCE(NEW.quantity_received, 0),
        NEW.unit,
        NEW.unit_price,
        COALESCE(NEW.line_total, NEW.total, v_quantity * NEW.unit_price),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.purchase_order_items_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.po_items
    SET
        po_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id),
        product_id = COALESCE(NEW.product_id, OLD.product_id),
        quantity_ordered = COALESCE(NEW.quantity, NEW.quantity_ordered, OLD.quantity),
        quantity_received = COALESCE(NEW.quantity_received, OLD.quantity_received),
        unit = COALESCE(NEW.unit, OLD.unit),
        unit_price = COALESCE(NEW.unit_price, OLD.unit_price),
        total = COALESCE(NEW.line_total, NEW.total, OLD.line_total),
        updated_at = NOW()
    WHERE id = OLD.id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.record_stock_before_after()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_qty DECIMAL(10,3);
    movement_qty DECIMAL(10,3);
BEGIN
    -- Lock the product row to prevent concurrent modifications
    SELECT current_stock INTO current_qty
    FROM products
    WHERE id = NEW.product_id
    FOR UPDATE;

    NEW.stock_before := COALESCE(current_qty, 0);

    -- Determine movement direction based on type
    CASE NEW.movement_type::text
        WHEN 'purchase' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'production_in' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'adjustment_in' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'transfer_in' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'return' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'sale' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'sale_pos' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'sale_b2b' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'production_out' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'production' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'adjustment' THEN movement_qty := NEW.quantity;
        WHEN 'adjustment_out' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'waste' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'transfer_out' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'transfer' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'ingredient' THEN movement_qty := -ABS(NEW.quantity);
        ELSE movement_qty := NEW.quantity;
    END CASE;

    NEW.stock_after := NEW.stock_before + movement_qty;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(p_customer_id uuid, p_points integer, p_order_id uuid DEFAULT NULL::uuid, p_description text DEFAULT 'Points redemption'::text, p_created_by uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_current_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    SELECT loyalty_points INTO v_current_points FROM customers WHERE id = p_customer_id;
    IF v_current_points < p_points THEN RAISE EXCEPTION 'Insufficient loyalty points'; END IF;
    v_new_balance := v_current_points - p_points;
    UPDATE customers SET loyalty_points = v_new_balance WHERE id = p_customer_id;
    INSERT INTO loyalty_transactions (customer_id, order_id, transaction_type, points, points_balance_after, description, created_by) VALUES (p_customer_id, p_order_id, 'redeem', -p_points, v_new_balance, p_description, p_created_by);
    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reset_category_settings(p_category_code character varying)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_key RECORD;
    v_count INTEGER := 0;
BEGIN
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
$function$
;

CREATE OR REPLACE FUNCTION public.reset_setting(p_key character varying)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_setting_id UUID;
    v_default_value JSONB;
BEGIN
    SELECT id, default_value INTO v_setting_id, v_default_value
    FROM settings
    WHERE key = p_key;

    IF v_setting_id IS NULL OR v_default_value IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN update_setting(p_key, v_default_value, 'Reset to default');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_product_total_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update the product's total stock as sum of all section stocks
    UPDATE products
    SET current_stock = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM section_stock
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_b2b_order_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_subtotal DECIMAL(15,2);
    v_discount_amount DECIMAL(15,2);
    v_tax_amount DECIMAL(15,2);
    v_total DECIMAL(15,2);
    v_paid_amount DECIMAL(15,2);
    v_order RECORD;
BEGIN
    SELECT * INTO v_order FROM b2b_orders WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    SELECT COALESCE(SUM(total), 0) INTO v_subtotal FROM b2b_order_items WHERE order_id = v_order.id;
    v_discount_amount := v_subtotal * COALESCE(v_order.discount_percent, 0) / 100;
    v_tax_amount := (v_subtotal - v_discount_amount) * COALESCE(v_order.tax_rate, 0.11);
    v_total := v_subtotal - v_discount_amount + v_tax_amount;
    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount FROM b2b_payments WHERE order_id = v_order.id;
    UPDATE b2b_orders SET subtotal = v_subtotal, discount_amount = v_discount_amount, tax_amount = v_tax_amount, total = v_total, amount_due = v_total - v_paid_amount, paid_amount = v_paid_amount, updated_at = NOW() WHERE id = v_order.id;
    RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_product_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE products
    SET current_stock = NEW.stock_after,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_setting(p_key character varying, p_value jsonb, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_setting_id UUID;
    v_old_value JSONB;
BEGIN
    -- Check if setting exists
    SELECT id, value INTO v_setting_id, v_old_value
    FROM settings
    WHERE key = p_key;

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
$function$
;

CREATE OR REPLACE FUNCTION public.update_settings_bulk(p_settings jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_key TEXT;
    v_value JSONB;
    v_count INTEGER := 0;
BEGIN
    FOR v_key, v_value IN SELECT * FROM jsonb_each(p_settings)
    LOOP
        IF update_setting(v_key, v_value) THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id uuid, p_permission_code character varying)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    v_has_direct_grant BOOLEAN := FALSE;
    v_has_direct_revoke BOOLEAN := FALSE;
BEGIN
    SELECT COALESCE(bool_or(is_granted = TRUE AND (valid_until IS NULL OR valid_until > NOW())), FALSE),
           COALESCE(bool_or(is_granted = FALSE AND (valid_until IS NULL OR valid_until > NOW())), FALSE)
    INTO v_has_direct_grant, v_has_direct_revoke
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id AND p.code = p_permission_code AND (up.valid_from IS NULL OR up.valid_from <= NOW());
    IF v_has_direct_revoke THEN RETURN FALSE; END IF;
    IF v_has_direct_grant THEN RETURN TRUE; END IF;
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id AND p.code = p_permission_code
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$function$
;

create or replace view "public"."view_category_sales" as  SELECT c.id AS category_id,
    c.name AS category_name,
    c.icon,
    c.color,
    count(DISTINCT oi.order_id) AS order_count,
    sum(oi.quantity) AS items_sold,
    sum(oi.total_price) AS total_revenue,
    avg(oi.total_price) AS avg_item_value
   FROM (((public.categories c
     LEFT JOIN public.products p ON ((c.id = p.category_id)))
     LEFT JOIN public.order_items oi ON ((p.id = oi.product_id)))
     LEFT JOIN public.orders o ON (((oi.order_id = o.id) AND (o.payment_status = 'paid'::public.payment_status) AND (o.created_at >= (CURRENT_DATE - '30 days'::interval)))))
  WHERE (c.is_active = true)
  GROUP BY c.id, c.name, c.icon, c.color
  ORDER BY (sum(oi.total_price)) DESC NULLS LAST;


create or replace view "public"."view_daily_kpis" as  SELECT date(created_at) AS report_date,
    count(DISTINCT id) AS total_orders,
    count(DISTINCT id) FILTER (WHERE (status = 'completed'::public.order_status)) AS completed_orders,
    count(DISTINCT id) FILTER (WHERE (status = 'cancelled'::public.order_status)) AS cancelled_orders,
    COALESCE(sum(total) FILTER (WHERE (payment_status = 'paid'::public.payment_status)), (0)::numeric) AS total_revenue,
    COALESCE(sum(discount_amount) FILTER (WHERE (payment_status = 'paid'::public.payment_status)), (0)::numeric) AS total_discounts,
    COALESCE(sum(tax_amount) FILTER (WHERE (payment_status = 'paid'::public.payment_status)), (0)::numeric) AS total_tax,
    COALESCE(avg(total) FILTER (WHERE (payment_status = 'paid'::public.payment_status)), (0)::numeric) AS avg_order_value,
    count(DISTINCT customer_id) FILTER (WHERE (customer_id IS NOT NULL)) AS unique_customers,
    COALESCE(sum(total) FILTER (WHERE ((payment_method = 'cash'::public.payment_method) AND (payment_status = 'paid'::public.payment_status))), (0)::numeric) AS cash_sales,
    COALESCE(sum(total) FILTER (WHERE ((payment_method = 'card'::public.payment_method) AND (payment_status = 'paid'::public.payment_status))), (0)::numeric) AS card_sales,
    COALESCE(sum(total) FILTER (WHERE ((payment_method = 'qris'::public.payment_method) AND (payment_status = 'paid'::public.payment_status))), (0)::numeric) AS qris_sales,
    COALESCE(sum(total) FILTER (WHERE ((payment_method = 'edc'::public.payment_method) AND (payment_status = 'paid'::public.payment_status))), (0)::numeric) AS edc_sales
   FROM public.orders o
  WHERE (created_at >= (CURRENT_DATE - '90 days'::interval))
  GROUP BY (date(created_at))
  ORDER BY (date(created_at)) DESC;


create or replace view "public"."view_hourly_sales" as  SELECT date(created_at) AS sale_date,
    EXTRACT(hour FROM created_at) AS hour_of_day,
    count(*) AS order_count,
    sum(total) AS total_sales,
    avg(total) AS avg_order_value
   FROM public.orders o
  WHERE ((payment_status = 'paid'::public.payment_status) AND (created_at >= (CURRENT_DATE - '7 days'::interval)))
  GROUP BY (date(created_at)), (EXTRACT(hour FROM created_at))
  ORDER BY (date(created_at)) DESC, (EXTRACT(hour FROM created_at));


create or replace view "public"."view_kds_queue_status" as  SELECT station_type,
    status,
    count(*) AS order_count,
    avg(EXTRACT(epoch FROM (now() - created_at))) AS avg_wait_seconds
   FROM public.kds_order_queue koq
  WHERE ((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('preparing'::character varying)::text]))
  GROUP BY station_type, status
  ORDER BY station_type, status;


create or replace view "public"."view_order_type_distribution" as  SELECT date(created_at) AS report_date,
    order_type,
    count(*) AS order_count,
    sum(total) AS total_revenue,
    avg(total) AS avg_order_value
   FROM public.orders o
  WHERE ((payment_status = 'paid'::public.payment_status) AND (created_at >= (CURRENT_DATE - '30 days'::interval)))
  GROUP BY (date(created_at)), order_type
  ORDER BY (date(created_at)) DESC, (count(*)) DESC;


create or replace view "public"."view_payment_method_stats" as  SELECT date(created_at) AS report_date,
    payment_method,
    count(*) AS transaction_count,
    sum(total) AS total_amount,
    avg(total) AS avg_amount
   FROM public.orders o
  WHERE ((payment_status = 'paid'::public.payment_status) AND (created_at >= (CURRENT_DATE - '30 days'::interval)))
  GROUP BY (date(created_at)), payment_method
  ORDER BY (date(created_at)) DESC, (sum(total)) DESC;


create or replace view "public"."view_product_sales" as  SELECT p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    count(DISTINCT oi.order_id) AS order_count,
    sum(oi.quantity) AS total_quantity,
    sum(oi.total_price) AS total_revenue,
    avg(oi.unit_price) AS avg_unit_price,
    p.retail_price AS current_price,
    p.cost_price,
    (sum(oi.total_price) - ((sum(oi.quantity))::numeric * p.cost_price)) AS gross_profit
   FROM (((public.order_items oi
     JOIN public.products p ON ((oi.product_id = p.id)))
     LEFT JOIN public.categories c ON ((p.category_id = c.id)))
     JOIN public.orders o ON ((oi.order_id = o.id)))
  WHERE ((o.payment_status = 'paid'::public.payment_status) AND (o.created_at >= (CURRENT_DATE - '30 days'::interval)))
  GROUP BY p.id, p.sku, p.name, c.name, p.retail_price, p.cost_price
  ORDER BY (sum(oi.total_price)) DESC;


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


create or replace view "public"."view_staff_performance" as  SELECT up.id AS staff_id,
    up.name AS staff_name,
    up.role,
    count(DISTINCT o.id) AS orders_processed,
    COALESCE(sum(o.total) FILTER (WHERE (o.payment_status = 'paid'::public.payment_status)), (0)::numeric) AS total_sales,
    COALESCE(avg(o.total) FILTER (WHERE (o.payment_status = 'paid'::public.payment_status)), (0)::numeric) AS avg_order_value,
    count(DISTINCT o.id) FILTER (WHERE (o.status = 'cancelled'::public.order_status)) AS cancelled_orders,
    COALESCE(sum(o.discount_amount) FILTER (WHERE (o.payment_status = 'paid'::public.payment_status)), (0)::numeric) AS total_discounts_given
   FROM (public.user_profiles up
     LEFT JOIN public.orders o ON (((up.id = o.staff_id) AND (o.created_at >= (CURRENT_DATE - '30 days'::interval)))))
  WHERE (up.is_active = true)
  GROUP BY up.id, up.name, up.role
  ORDER BY COALESCE(sum(o.total) FILTER (WHERE (o.payment_status = 'paid'::public.payment_status)), (0)::numeric) DESC;


grant delete on table "public"."purchase_order_items" to "anon";

grant insert on table "public"."purchase_order_items" to "anon";

grant references on table "public"."purchase_order_items" to "anon";

grant select on table "public"."purchase_order_items" to "anon";

grant trigger on table "public"."purchase_order_items" to "anon";

grant truncate on table "public"."purchase_order_items" to "anon";

grant update on table "public"."purchase_order_items" to "anon";

grant delete on table "public"."purchase_order_items" to "authenticated";

grant insert on table "public"."purchase_order_items" to "authenticated";

grant references on table "public"."purchase_order_items" to "authenticated";

grant select on table "public"."purchase_order_items" to "authenticated";

grant trigger on table "public"."purchase_order_items" to "authenticated";

grant truncate on table "public"."purchase_order_items" to "authenticated";

grant update on table "public"."purchase_order_items" to "authenticated";

grant delete on table "public"."purchase_order_items" to "service_role";

grant insert on table "public"."purchase_order_items" to "service_role";

grant references on table "public"."purchase_order_items" to "service_role";

grant select on table "public"."purchase_order_items" to "service_role";

grant trigger on table "public"."purchase_order_items" to "service_role";

grant truncate on table "public"."purchase_order_items" to "service_role";

grant update on table "public"."purchase_order_items" to "service_role";


  create policy "categories_insert_anon"
  on "public"."categories"
  as permissive
  for insert
  to anon
with check (true);



  create policy "Allow anon insert product_sections"
  on "public"."product_sections"
  as permissive
  for insert
  to anon
with check (true);



  create policy "Allow anon read product_sections"
  on "public"."product_sections"
  as permissive
  for select
  to anon
using (true);



  create policy "Allow authenticated delete product_sections"
  on "public"."product_sections"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Allow authenticated insert product_sections"
  on "public"."product_sections"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow authenticated read product_sections"
  on "public"."product_sections"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow authenticated update product_sections"
  on "public"."product_sections"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "products_insert_anon"
  on "public"."products"
  as permissive
  for insert
  to anon
with check (true);



  create policy "Authenticated users can delete purchase_order_items"
  on "public"."purchase_order_items"
  as permissive
  for delete
  to public
using ((auth.uid() IS NOT NULL));



  create policy "Authenticated users can insert purchase_order_items"
  on "public"."purchase_order_items"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "Authenticated users can update purchase_order_items"
  on "public"."purchase_order_items"
  as permissive
  for update
  to public
using ((auth.uid() IS NOT NULL));



  create policy "Authenticated users can view purchase_order_items"
  on "public"."purchase_order_items"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "po_items_delete"
  on "public"."purchase_order_items"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "po_items_insert"
  on "public"."purchase_order_items"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "po_items_select"
  on "public"."purchase_order_items"
  as permissive
  for select
  to authenticated
using (true);



  create policy "po_items_update"
  on "public"."purchase_order_items"
  as permissive
  for update
  to authenticated
using (true)
with check (true);



  create policy "user_profiles_select_for_login"
  on "public"."user_profiles"
  as permissive
  for select
  to public
using (true);



