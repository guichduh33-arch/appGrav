// Edge Function: calculate-daily-report
// Generates daily sales and performance report

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase-client.ts';
import { requireSession } from '../_shared/session-auth.ts';

interface DailyReport {
    date: string;
    summary: {
        total_orders: number;
        total_revenue: number;
        total_discounts: number;
        total_tax: number;
        net_revenue: number;
        average_order_value: number;
    };
    payment_breakdown: {
        cash: number;
        card: number;
        qris: number;
        split: number;
    };
    category_performance: Array<{
        category_name: string;
        items_sold: number;
        revenue: number;
        percentage: number;
    }>;
    top_products: Array<{
        product_name: string;
        quantity_sold: number;
        revenue: number;
    }>;
    hourly_sales: Array<{
        hour: number;
        orders: number;
        revenue: number;
    }>;
    staff_performance: Array<{
        staff_name: string;
        orders_processed: number;
        total_sales: number;
    }>;
}

serve(async (req) => {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Require authenticated session (SEC-006)
    const session = await requireSession(req);
    if (session instanceof Response) return session;

    try {
        const { date } = await req.json();
        const reportDate = date || new Date().toISOString().slice(0, 10);

        // Get all paid orders for the date
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('orders')
            .select(`
        id,
        order_number,
        total,
        subtotal,
        discount_amount,
        tax_amount,
        payment_method,
        staff_id,
        created_at,
        user_profiles!orders_staff_id_fkey (name)
      `)
            .eq('payment_status', 'paid')
            .gte('created_at', `${reportDate}T00:00:00`)
            .lt('created_at', `${reportDate}T23:59:59`);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            return errorResponse('Failed to fetch orders');
        }

        if (!orders || orders.length === 0) {
            return jsonResponse({
                date: reportDate,
                summary: {
                    total_orders: 0,
                    total_revenue: 0,
                    total_discounts: 0,
                    total_tax: 0,
                    net_revenue: 0,
                    average_order_value: 0,
                },
                payment_breakdown: { cash: 0, card: 0, qris: 0, split: 0 },
                category_performance: [],
                top_products: [],
                hourly_sales: [],
                staff_performance: [],
            });
        }

        // Get order items with product/category info
        const orderIds = orders.map(o => o.id);
        const { data: items } = await supabaseAdmin
            .from('order_items')
            .select(`
        order_id,
        product_id,
        product_name,
        quantity,
        total_price,
        products (
          category_id,
          categories (name)
        )
      `)
            .in('order_id', orderIds);

        // Calculate summary
        const summary = {
            total_orders: orders.length,
            total_revenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
            total_discounts: orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0),
            total_tax: orders.reduce((sum, o) => sum + Number(o.tax_amount || 0), 0),
            net_revenue: 0,
            average_order_value: 0,
        };
        summary.net_revenue = summary.total_revenue - summary.total_tax;
        summary.average_order_value = summary.total_revenue / summary.total_orders;

        // Payment breakdown
        const payment_breakdown = {
            cash: orders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + Number(o.total), 0),
            card: orders.filter(o => o.payment_method === 'card').reduce((sum, o) => sum + Number(o.total), 0),
            qris: orders.filter(o => o.payment_method === 'qris').reduce((sum, o) => sum + Number(o.total), 0),
            split: orders.filter(o => o.payment_method === 'split').reduce((sum, o) => sum + Number(o.total), 0),
        };

        // Category performance
        const categoryMap = new Map<string, { items_sold: number; revenue: number }>();
        for (const item of items || []) {
            const categoryName = (item.products as any)?.categories?.name || 'Uncategorized';
            const existing = categoryMap.get(categoryName) || { items_sold: 0, revenue: 0 };
            existing.items_sold += item.quantity;
            existing.revenue += Number(item.total_price);
            categoryMap.set(categoryName, existing);
        }

        const category_performance = Array.from(categoryMap.entries())
            .map(([name, data]) => ({
                category_name: name,
                items_sold: data.items_sold,
                revenue: data.revenue,
                percentage: (data.revenue / summary.total_revenue) * 100,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        // Top products
        const productMap = new Map<string, { quantity_sold: number; revenue: number }>();
        for (const item of items || []) {
            const existing = productMap.get(item.product_name) || { quantity_sold: 0, revenue: 0 };
            existing.quantity_sold += item.quantity;
            existing.revenue += Number(item.total_price);
            productMap.set(item.product_name, existing);
        }

        const top_products = Array.from(productMap.entries())
            .map(([name, data]) => ({
                product_name: name,
                quantity_sold: data.quantity_sold,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.quantity_sold - a.quantity_sold)
            .slice(0, 10);

        // Hourly sales
        const hourlyMap = new Map<number, { orders: number; revenue: number }>();
        for (const order of orders) {
            const hour = new Date(order.created_at).getHours();
            const existing = hourlyMap.get(hour) || { orders: 0, revenue: 0 };
            existing.orders += 1;
            existing.revenue += Number(order.total);
            hourlyMap.set(hour, existing);
        }

        const hourly_sales = Array.from(hourlyMap.entries())
            .map(([hour, data]) => ({
                hour,
                orders: data.orders,
                revenue: data.revenue,
            }))
            .sort((a, b) => a.hour - b.hour);

        // Staff performance
        const staffMap = new Map<string, { orders_processed: number; total_sales: number }>();
        for (const order of orders) {
            const staffName = (order.user_profiles as any)?.name || 'Unknown';
            const existing = staffMap.get(staffName) || { orders_processed: 0, total_sales: 0 };
            existing.orders_processed += 1;
            existing.total_sales += Number(order.total);
            staffMap.set(staffName, existing);
        }

        const staff_performance = Array.from(staffMap.entries())
            .map(([name, data]) => ({
                staff_name: name,
                orders_processed: data.orders_processed,
                total_sales: data.total_sales,
            }))
            .sort((a, b) => b.total_sales - a.total_sales);

        const report: DailyReport = {
            date: reportDate,
            summary,
            payment_breakdown,
            category_performance,
            top_products,
            hourly_sales,
            staff_performance,
        };

        return jsonResponse(report);

    } catch (error) {
        console.error('Error generating report:', error);
        return errorResponse('Internal server error', 500);
    }
});
