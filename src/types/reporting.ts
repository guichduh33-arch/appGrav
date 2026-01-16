export interface SalesComparison {
    period_label: 'current' | 'previous';
    total_revenue: number;
    net_revenue: number;
    transaction_count: number;
    avg_basket: number;
}

export interface PaymentMethodStat {
    payment_method: string;
    transaction_count: number;
    total_revenue: number;
    report_date: string;
}

export interface StockWaste {
    product_name: string;
    category_name: string;
    reason: string;
    waste_events: number;
    waste_quantity: number;
    loss_value_at_cost: number;
    loss_value_at_retail: number;
    waste_date: string;
}

export interface SessionDiscrepancy {
    session_number: string;
    staff_name: string;
    opened_at: string;
    closed_at: string;
    expected_cash: number;
    closing_cash: number;
    cash_difference: number;
    severity: 'info' | 'warning' | 'critical';
}

export interface InventoryValuation {
    total_skus: number;
    total_items_in_stock: number;
    total_valuation_cost: number;
    total_valuation_retail: number;
}

export interface DashboardSummary {
    period_sales: number;
    period_orders: number;
    top_product: {
        name: string;
        qty: number;
    } | null;
    low_stock_alerts: number;
    active_sessions: number;
}

export interface AuditLogEntry {
    id: string;
    action_type: string;
    severity: 'info' | 'warning' | 'critical';
    entity_type: string;
    entity_id: string;
    old_value: any;
    new_value: any;
    reason: string;
    user_id: string;
    created_at: string;
}
