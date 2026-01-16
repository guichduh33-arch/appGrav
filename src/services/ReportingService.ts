import { supabase } from '../lib/supabase';
import {
    SalesComparison,
    PaymentMethodStat,
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
        const { data, error } = await supabase.rpc('get_sales_comparison', {
            current_start: currentStart.toISOString(),
            current_end: currentEnd.toISOString(),
            previous_start: previousStart.toISOString(),
            previous_end: previousEnd.toISOString(),
        } as any);

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
        const { data, error } = await supabase.rpc('get_reporting_dashboard_summary', {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
        } as any);

        if (error) throw error;
        return data;
    },

    /**
     * Get Payment Method Statistics
     */
    async getPaymentMethodStats(): Promise<PaymentMethodStat[]> {
        const { data, error } = await supabase
            .from('view_payment_method_stats')
            .select('*')
            .order('total_revenue', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Stock Waste Report
     */
    async getStockWasteReport(): Promise<StockWaste[]> {
        const { data, error } = await supabase
            .from('view_stock_waste')
            .select('*')
            .order('waste_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Session Discrepancies (Cashier Performance)
     */
    async getSessionDiscrepancies(): Promise<SessionDiscrepancy[]> {
        const { data, error } = await supabase
            .from('view_session_discrepancies')
            .select('*')
            .order('closed_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get Real-time Inventory Valuation
     */
    async getInventoryValuation(): Promise<InventoryValuation> {
        const { data, error } = await supabase
            .from('view_inventory_valuation')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get Audit Logs
     */
    async getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('audit_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
};
