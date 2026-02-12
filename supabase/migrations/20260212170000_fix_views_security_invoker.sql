-- Fix Supabase security advisor ERRORs: views with SECURITY DEFINER
-- Change all 25 views to use security_invoker = true (RLS-respecting)

ALTER VIEW public.active_products SET (security_invoker = true);
ALTER VIEW public.user_profiles_safe SET (security_invoker = true);
ALTER VIEW public.view_b2b_performance SET (security_invoker = true);
ALTER VIEW public.view_b2b_receivables SET (security_invoker = true);
ALTER VIEW public.view_category_sales SET (security_invoker = true);
ALTER VIEW public.view_customer_insights SET (security_invoker = true);
ALTER VIEW public.view_daily_kpis SET (security_invoker = true);
ALTER VIEW public.view_expired_stock SET (security_invoker = true);
ALTER VIEW public.view_hourly_sales SET (security_invoker = true);
ALTER VIEW public.view_inventory_valuation SET (security_invoker = true);
ALTER VIEW public.view_kds_queue_status SET (security_invoker = true);
ALTER VIEW public.view_order_type_distribution SET (security_invoker = true);
ALTER VIEW public.view_payment_method_stats SET (security_invoker = true);
ALTER VIEW public.view_product_sales SET (security_invoker = true);
ALTER VIEW public.view_production_summary SET (security_invoker = true);
ALTER VIEW public.view_profit_loss SET (security_invoker = true);
ALTER VIEW public.view_sales_by_customer SET (security_invoker = true);
ALTER VIEW public.view_sales_by_hour SET (security_invoker = true);
ALTER VIEW public.view_section_stock_details SET (security_invoker = true);
ALTER VIEW public.view_session_cash_balance SET (security_invoker = true);
ALTER VIEW public.view_session_summary SET (security_invoker = true);
ALTER VIEW public.view_staff_performance SET (security_invoker = true);
ALTER VIEW public.view_stock_alerts SET (security_invoker = true);
ALTER VIEW public.view_stock_warning SET (security_invoker = true);
ALTER VIEW public.view_unsold_products SET (security_invoker = true);
