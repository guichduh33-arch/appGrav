import { supabase, untypedRpc, untypedFrom } from '../lib/supabase';
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
    AuditLogEntry,
    // Epic 3: New report types
    IProfitLossReport,
    ISalesByCustomerReport,
    ISalesByHourReport,
    ISessionCashBalanceReport,
    IB2BReceivablesReport,
    IStockWarningReport,
    IExpiredStockReport,
    IUnsoldProductsReport,
    ICancellationsReport,
    IKdsServiceSpeedStat,
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
        const { data, error } = await untypedRpc('get_sales_comparison', {
            current_start: currentStart.toISOString(),
            current_end: currentEnd.toISOString(),
            previous_start: previousStart.toISOString(),
            previous_end: previousEnd.toISOString(),
        });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Holistic Dashboard Summary
     */
    async getDashboardSummary(
        startDate: Date,
        endDate: Date
    ): Promise<DashboardSummary> {
        const { data, error } = await untypedRpc('get_reporting_dashboard_summary', {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        });

        if (error) throw error;
        return data;
    },

    /**
     * Get Payment Method Statistics
     */
    async getPaymentMethodStats(): Promise<PaymentMethodStat[]> {
        const { data, error } = await untypedFrom('view_payment_method_stats')
            .select('*')
            .returns<PaymentMethodStat[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Daily Sales Statistics
     */
    async getDailySales(startDate: Date, endDate: Date): Promise<DailySalesStat[]> {
        const { data, error } = await untypedFrom('view_daily_kpis')
            .select('*')
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString())
            .order('date', { ascending: true }) as { data: unknown[] | null; error: Error | null };

        if (error) throw error;

        type KpiRow = {
            date: string | null;
            total_revenue: number | null;
            total_orders: number | null;
            avg_order_value: number | null;
            total_tax: number | null;
        };
        const rawData = (data || []) as KpiRow[];
        return rawData.map((row) => ({
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
    async getProductPerformance(
        startDate: Date,
        endDate: Date,
        filters?: { categoryId?: string; orderType?: string }
    ): Promise<ProductPerformanceStat[]> {
        let query = supabase
            .from('order_items')
            .select('product_id, product_name, quantity, total_price, product:products(cost_price, category_id, category:categories(name)), order:orders!inner(order_type)')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .eq('item_status', 'served');

        if (filters?.orderType) {
            query = query.eq('order.order_type', filters.orderType);
        }

        const { data, error } = await query;

        if (error) throw error;

        const map = new Map<string, ProductPerformanceStat>();

        type OrderItemRow = {
            product_id: string | null;
            product_name: string;
            quantity: number;
            total_price: number;
            product?: { cost_price?: number; category_id?: string; category?: { name?: string } };
            order?: { order_type?: string };
        };
        const rawData = data as unknown as OrderItemRow[];
        const filteredData = filters?.categoryId
            ? rawData?.filter((item) => item.product?.category_id === filters.categoryId)
            : rawData;
        filteredData?.forEach((item) => {
            const key = item.product_id ?? item.product_name;
            if (!map.has(key)) {
                map.set(key, {
                    product_id: item.product_id ?? '',
                    product_name: item.product_name,
                    category_name: item.product?.category?.name || 'Uncategorized',
                    quantity_sold: 0,
                    total_revenue: 0,
                    avg_price: 0,
                    cost_price: item.product?.cost_price || 0,
                });
            }
            const stat = map.get(key)!;
            stat.quantity_sold += item.quantity;
            stat.total_revenue += item.total_price;
        });

        const result = Array.from(map.values()).map(stat => ({
            ...stat,
            avg_price: stat.quantity_sold > 0 ? stat.total_revenue / stat.quantity_sold : 0,
            margin_percentage: stat.total_revenue > 0
                ? ((stat.total_revenue - stat.quantity_sold * (stat.cost_price || 0)) / stat.total_revenue) * 100
                : 0,
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
        const rawData = data as CategoryItemRow[];
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
        const { data, error } = await untypedFrom('view_stock_waste')
            .select('*')
            .order('waste_date', { ascending: false });

        if (error) throw error;
        return (data || []) as StockWaste[];
    },

    /**
     * Get Session Discrepancies (Cashier Performance)
     */
    async getSessionDiscrepancies(): Promise<SessionDiscrepancy[]> {
        const { data, error } = await untypedFrom('view_session_discrepancies')
            .select('*')
            .order('closed_at', { ascending: false });

        if (error) throw error;
        return (data || []) as SessionDiscrepancy[];
    },

    /**
     * Get Real-time Inventory Valuation
     */
    async getInventoryValuation(): Promise<InventoryValuation> {
        // This view may not exist in the schema, calculate from products table
        const { data, error } = await supabase
            .from('products')
            .select('current_stock, cost_price, retail_price')
            .eq('is_active', true);

        if (error) throw error;

        // Aggregate the results
        type InventoryRow = {
            current_stock: number | null;
            cost_price: number | null;
            retail_price: number | null;
        };
        const items = (data || []) as InventoryRow[];
        return {
            total_skus: items.length,
            total_items_in_stock: items.reduce((sum, i) => sum + (i.current_stock || 0), 0),
            total_valuation_cost: items.reduce((sum, i) => sum + ((i.current_stock || 0) * (i.cost_price || 0)), 0),
            total_valuation_retail: items.reduce((sum, i) => sum + ((i.current_stock || 0) * (i.retail_price || 0)), 0),
        };
    },

    /**
     * Get Inventory Items with stock details
     */
    async getInventoryItems() {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                sku,
                current_stock,
                unit,
                cost_price,
                price,
                category:categories(name)
            `)
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Audit Logs
     */
    async getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .returns<AuditLogEntry[]>()
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Purchase Details
     */
    async getPurchaseDetails(startDate: Date, endDate: Date) {
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
    async getPurchaseBySupplier(startDate: Date, endDate: Date) {
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
        const rawData = data as SupplierMovementRow[];
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
    },

    // =============================================================
    // Epic 3: New Report Methods (Story 3.3)
    // =============================================================

    /**
     * Get Profit/Loss Report (FR35)
     */
    async getProfitLoss(startDate: Date, endDate: Date): Promise<IProfitLossReport[]> {
        const { data, error } = await untypedFrom('view_profit_loss')
            .select('*')
            .gte('report_date', startDate.toISOString().split('T')[0])
            .lte('report_date', endDate.toISOString().split('T')[0])
            .order('report_date', { ascending: false })
            .returns<IProfitLossReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Sales by Customer Report (FR36)
     */
    async getSalesByCustomer(startDate: Date, endDate: Date): Promise<ISalesByCustomerReport[]> {
        // Query from orders with customer join and filter by date
        const { data, error } = await untypedFrom('view_sales_by_customer')
            .select('*')
            .returns<ISalesByCustomerReport[]>();

        if (error) throw error;

        // Filter by date range if last_order_at is within range
        const filtered = data || [];
        return filtered.filter(c =>
            c.last_order_at &&
            new Date(c.last_order_at) >= startDate &&
            new Date(c.last_order_at) <= endDate
        );
    },

    /**
     * Get Sales by Hour Report (FR37)
     */
    async getSalesByHour(startDate: Date, endDate: Date): Promise<ISalesByHourReport[]> {
        const { data, error } = await untypedFrom('view_sales_by_hour')
            .select('*')
            .gte('report_date', startDate.toISOString().split('T')[0])
            .lte('report_date', endDate.toISOString().split('T')[0])
            .order('hour_of_day', { ascending: true })
            .returns<ISalesByHourReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Session Cash Balance Report (FR44)
     */
    async getSessionCashBalance(startDate: Date, endDate: Date): Promise<ISessionCashBalanceReport[]> {
        const { data, error } = await untypedFrom('view_session_cash_balance')
            .select('*')
            .gte('started_at', startDate.toISOString())
            .lte('started_at', endDate.toISOString())
            .order('started_at', { ascending: false })
            .returns<ISessionCashBalanceReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get B2B Receivables Report (FR45)
     */
    async getB2BReceivables(): Promise<IB2BReceivablesReport[]> {
        const { data, error } = await untypedFrom('view_b2b_receivables')
            .select('*')
            .gt('outstanding_amount', 0)
            .order('outstanding_amount', { ascending: false })
            .returns<IB2BReceivablesReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Stock Warning Report (FR40, FR41)
     */
    async getStockWarning(): Promise<IStockWarningReport[]> {
        const { data, error } = await untypedFrom('view_stock_warning')
            .select('*')
            .returns<IStockWarningReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Expired Stock Report (FR42)
     */
    async getExpiredStock(): Promise<IExpiredStockReport[]> {
        const { data, error } = await untypedFrom('view_expired_stock')
            .select('*')
            .in('expiry_status', ['expired', 'expiring_soon', 'expiring'])
            .returns<IExpiredStockReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Unsold Products Report (FR43)
     */
    async getUnsoldProducts(daysSinceLastSale: number = 30): Promise<IUnsoldProductsReport[]> {
        const { data, error } = await untypedFrom('view_unsold_products')
            .select('*')
            .gte('days_since_sale', daysSinceLastSale)
            .order('days_since_sale', { ascending: false })
            .returns<IUnsoldProductsReport[]>();

        if (error) throw error;
        return data || [];
    },

    /**
     * Get KDS Service Speed Statistics
     */
    async getKdsServiceSpeed(
        startDate: Date,
        endDate: Date,
        station?: string
    ): Promise<IKdsServiceSpeedStat[]> {
        const params: Record<string, unknown> = {
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString(),
        };
        if (station) {
            params.p_station = station;
        }

        const { data, error } = await untypedRpc('get_kds_service_speed_stats', params);

        if (error) throw error;
        return (data || []) as IKdsServiceSpeedStat[];
    },

    /**
     * Get Cancellations Report (FR38)
     */
    async getCancellations(startDate: Date, endDate: Date): Promise<ICancellationsReport[]> {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                cancelled_at,
                total,
                cancellation_reason,
                staff:user_profiles!orders_staff_id_fkey(name),
                order_items(id)
            `)
            .eq('status', 'cancelled')
            .gte('cancelled_at', startDate.toISOString())
            .lte('cancelled_at', endDate.toISOString())
            .order('cancelled_at', { ascending: false });

        if (error) throw error;

        type CancellationRow = {
            id: string;
            order_number: string;
            cancelled_at: string;
            total: number;
            cancellation_reason: string | null;
            staff: { name: string } | { name: string }[] | null;
            order_items: { id: string }[];
        };

        return ((data || []) as CancellationRow[]).map(o => {
            let cashierName: string | null = null;
            if (o.staff) {
                if (Array.isArray(o.staff)) {
                    cashierName = o.staff.length > 0 ? o.staff[0].name : null;
                } else {
                    cashierName = o.staff.name;
                }
            }
            return {
                order_id: o.id,
                order_number: o.order_number,
                cancelled_at: o.cancelled_at,
                cashier_name: cashierName,
                order_total: o.total,
                cancel_reason: o.cancellation_reason,
                items_count: o.order_items?.length || 0,
            };
        });
    },
};
