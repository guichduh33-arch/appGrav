import { supabase } from '../lib/supabase';
import { StockMovement } from '../types/database';
import {
    SalesComparison,
    PaymentMethodStat,
    DailySalesStat,
    ProductPerformanceStat,
    CategorySalesStat,
    StockWaste,
    SessionDiscrepancy,
    InventoryValuation,
    DashboardSummary,
    AuditLogEntry
} from '../types/reporting';

export const ReportingService = {
    /**
     * Get Sales Comparison between two periods (e.g. This Week vs Last Week)
     */
    async getSalesComparison(
        currentStart: Date,
        currentEnd: Date,
        previousStart: Date,
        previousEnd: Date
    ): Promise<SalesComparison[]> {
        const { data, error } = await supabase.rpc('get_sales_comparison' as any, {
            current_start: currentStart.toISOString(),
            current_end: currentEnd.toISOString(),
            previous_start: previousStart.toISOString(),
            previous_end: previousEnd.toISOString(),
        });

        if (error) throw error;
        return (data || []) as unknown as SalesComparison[];
    },

    /**
     * Get Holistic Dashboard Summary
     */
    async getDashboardSummary(
        startDate: Date,
        endDate: Date
    ): Promise<DashboardSummary> {
        const { data, error } = await supabase.rpc('get_reporting_dashboard_summary' as any, {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        });

        if (error) throw error;
        return data as unknown as DashboardSummary;
    },

    /**
     * Get Payment Method Statistics
     */
    async getPaymentMethodStats(): Promise<PaymentMethodStat[]> {
        const { data, error } = await supabase
            .from('view_payment_method_stats')
            .select('*')
            .order('total_revenue' as any, { ascending: false });

        if (error) throw error;
        return (data || []) as unknown as PaymentMethodStat[];
    },

    /**
     * Get Daily Sales Statistics
     */
    async getDailySales(startDate: Date, endDate: Date): Promise<DailySalesStat[]> {
        const { data, error } = await supabase
            .from('view_daily_kpis')
            .select('*')
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString())
            .order('date', { ascending: true });

        if (error) throw error;

        type KpiRow = {
            date: string | null;
            total_revenue: number | null;
            total_orders: number | null;
            avg_order_value: number | null;
            total_tax: number | null;
        };
        const rawData = data as unknown as KpiRow[];
        return (rawData || []).map((row) => ({
            date: row.date || '',
            total_sales: row.total_revenue || 0,
            total_orders: row.total_orders || 0,
            avg_basket: row.avg_order_value || 0,
            net_revenue: (row.total_revenue || 0) - (row.total_tax || 0)
        }));
    },

    /**
     * Get Product Performance
     */
    async getProductPerformance(startDate: Date, endDate: Date): Promise<ProductPerformanceStat[]> {
        const { data, error } = await supabase
            .from('order_items')
            .select('product_id, product_name, quantity, total_price')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .eq('item_status', 'served');

        if (error) throw error;

        const map = new Map<string, ProductPerformanceStat>();

        type OrderItemRow = {
            product_id: string | null;
            product_name: string;
            quantity: number;
            total_price: number;
        };
        const rawData = data as unknown as OrderItemRow[];
        rawData?.forEach((item) => {
            const key = item.product_id ?? item.product_name;
            if (!map.has(key)) {
                map.set(key, {
                    product_id: item.product_id ?? '',
                    product_name: item.product_name,
                    quantity_sold: 0,
                    total_revenue: 0,
                    avg_price: 0
                });
            }
            const stat = map.get(key)!;
            stat.quantity_sold += item.quantity;
            stat.total_revenue += item.total_price;
        });

        const result = Array.from(map.values()).map(stat => ({
            ...stat,
            avg_price: stat.quantity_sold > 0 ? stat.total_revenue / stat.quantity_sold : 0
        }));

        return result.sort((a, b) => b.total_revenue - a.total_revenue);
    },

    async getStockMovements(startDate: Date, endDate: Date): Promise<StockMovement[]> {
        const { data, error } = await supabase
            .from('stock_movements')
            .select(`
                *,
                product:products(name, sku, unit)
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Sales By Category
     */
    async getSalesByCategory(startDate: Date, endDate: Date): Promise<CategorySalesStat[]> {
        const { data, error } = await supabase
            .from('order_items')
            .select(`
                quantity, 
                total_price, 
                product:products(category:categories(id, name))
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .eq('item_status', 'served');

        if (error) throw error;

        const map = new Map<string, CategorySalesStat>();

        type CategoryItemRow = {
            quantity: number;
            total_price: number;
            product?: { category?: { id: string; name: string } };
        };
        const rawData = data as unknown as CategoryItemRow[];
        rawData?.forEach((item) => {
            const category = item.product?.category;
            const key = category?.id || 'uncategorized';
            const name = category?.name || 'Uncategorized';

            if (!map.has(key)) {
                map.set(key, {
                    category_id: key,
                    category_name: name,
                    total_revenue: 0,
                    transaction_count: 0
                });
            }
            const stat = map.get(key)!;
            stat.transaction_count += item.quantity;
            stat.total_revenue += item.total_price;
        });

        return Array.from(map.values()).sort((a, b) => b.total_revenue - a.total_revenue);
    },

    /**
     * Get Stock Waste Report
     */
    async getStockWasteReport(): Promise<StockWaste[]> {
        const { data, error } = await (supabase as any)
            .from('view_stock_waste')
            .select('*')
            .order('waste_date', { ascending: false });

        if (error) throw error;
        return (data || []) as StockWaste[];
    },

    /**
     * Get Session Discrepancies (Cashier Performance)
     */
    async getSessionDiscrepancies(): Promise<SessionDiscrepancy[]> {
        const { data, error } = await (supabase as any)
            .from('view_session_discrepancies')
            .select('*')
            .order('closed_at', { ascending: false });

        if (error) throw error;
        return (data || []) as SessionDiscrepancy[];
    },

    /**
     * Get Real-time Inventory Valuation
     */
    async getInventoryValuation(): Promise<InventoryValuation> {
        const { data, error } = await supabase
            .from('view_inventory_valuation')
            .select('*');

        if (error) throw error;

        // Aggregate the results from the view
        const items = data || [];
        return {
            total_skus: items.length,
            total_items_in_stock: items.reduce((sum, i) => sum + (i.current_stock || 0), 0),
            total_valuation_cost: items.reduce((sum, i) => sum + (i.stock_value_cost || 0), 0),
            total_valuation_retail: items.reduce((sum, i) => sum + (i.stock_value_retail || 0), 0),
        };
    },

    /**
     * Get Audit Logs
     */
    async getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []) as unknown as AuditLogEntry[];
    },

    /**
     * Get Purchase Details
     */
    async getPurchaseDetails(startDate: Date, endDate: Date): Promise<any[]> {
        const { data, error } = await supabase
            .from('stock_movements')
            .select(`
                *,
                product:products(name, sku, unit, cost_price),
                staff:user_profiles(name),
                supplier:suppliers(name)
            `)
            .eq('movement_type', 'purchase')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Purchase By Supplier
     */
    async getPurchaseBySupplier(startDate: Date, endDate: Date): Promise<any[]> {
        const { data, error } = await supabase
            .from('stock_movements')
            .select(`
                *,
                product:products(name, sku, unit, cost_price),
                supplier:suppliers(name)
            `)
            .eq('movement_type', 'purchase')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());

        if (error) throw error;

        // Aggregate by supplier
        const map = new Map<string, { supplier_name: string, total_quantity: number, total_value: number, transaction_count: number }>();

        type SupplierMovementRow = {
            quantity: number;
            supplier?: { name?: string };
            product?: { cost_price?: number };
        };
        const rawData = data as unknown as SupplierMovementRow[];
        rawData?.forEach((item) => {
            const supplierName = item.supplier?.name || 'Unknown Supplier';
            const key = supplierName;

            if (!map.has(key)) {
                map.set(key, {
                    supplier_name: supplierName,
                    total_quantity: 0,
                    total_value: 0,
                    transaction_count: 0
                });
            }
            const stat = map.get(key)!;
            stat.transaction_count += 1;
            stat.total_quantity += item.quantity;
            stat.total_value += (item.product?.cost_price || 0) * item.quantity;
        });

        return Array.from(map.values()).sort((a, b) => b.total_value - a.total_value);
    }
};
