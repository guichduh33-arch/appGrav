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

export interface DailySalesStat {
    date: string;
    total_sales: number; // mapped from total_revenue
    total_orders: number;
    avg_basket: number; // mapped from avg_basket_value
    net_revenue: number;
}

export interface ProductPerformanceStat {
    product_id: string;
    product_name: string;
    category_name?: string;
    quantity_sold: number;
    total_revenue: number;
    avg_price: number;
    cost_price?: number;
    margin_percentage?: number;
}

export interface CategorySalesStat {
    category_id: string;
    category_name: string;
    total_revenue: number;
    transaction_count: number;
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

// =============================================================
// Epic 3: New Report Types (Story 3.1, 3.2, 3.3)
// =============================================================

/**
 * Profit/Loss Report (FR35)
 */
export interface IProfitLossReport {
    report_date: string;
    order_count: number;
    gross_revenue: number;
    tax_collected: number;
    total_discounts: number;
    cogs: number;
    gross_profit: number;
    margin_percentage: number;
}

/**
 * Sales by Customer Report (FR36)
 */
export interface ISalesByCustomerReport {
    customer_id: string;
    customer_name: string;
    company_name: string | null;
    phone: string | null;
    customer_type: string;
    category_name: string | null;
    loyalty_tier: string | null;
    order_count: number;
    total_spent: number;
    avg_basket: number;
    first_order_at: string | null;
    last_order_at: string | null;
    days_since_last_order: number;
}

/**
 * Sales by Hour Report (FR37)
 */
export interface ISalesByHourReport {
    hour_of_day: number;
    report_date: string;
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
}

/**
 * Session Cash Balance Report (FR44)
 */
export interface ISessionCashBalanceReport {
    session_id: string;
    terminal_id: string | null;
    cashier_name: string;
    started_at: string;
    ended_at: string | null;
    opening_cash: number;
    closing_cash: number | null;
    cash_received: number;
    expected_cash: number;
    cash_difference: number;
    order_count: number;
    total_revenue: number;
    status: string;
}

/**
 * B2B Receivables Report (FR45)
 */
export interface IB2BReceivablesReport {
    customer_id: string;
    customer_name: string;
    company_name: string | null;
    phone: string | null;
    credit_limit: number;
    credit_balance: number;
    outstanding_amount: number;
    unpaid_order_count: number;
    oldest_unpaid_at: string | null;
    days_overdue: number;
}

/**
 * Stock Warning Report (FR40, FR41)
 */
export interface IStockWarningReport {
    product_id: string;
    sku: string | null;
    product_name: string;
    category_name: string | null;
    current_stock: number;
    unit: string;
    min_stock_level: number;
    cost_price: number;
    retail_price: number;
    stock_percentage: number;
    alert_level: 'out_of_stock' | 'critical' | 'warning' | 'ok';
    suggested_reorder: number;
    value_at_risk: number;
}

/**
 * Expired Stock Report (FR42)
 */
export interface IExpiredStockReport {
    product_id: string;
    sku: string | null;
    product_name: string;
    category_name: string | null;
    current_stock: number;
    unit: string;
    cost_price: number;
    expiry_date: string;
    days_until_expiry: number;
    expiry_status: 'expired' | 'expiring_soon' | 'expiring' | 'ok';
    potential_loss: number;
}

/**
 * Unsold Products Report (FR43)
 */
export interface IUnsoldProductsReport {
    product_id: string;
    sku: string | null;
    product_name: string;
    category_name: string | null;
    current_stock: number;
    unit: string;
    cost_price: number;
    retail_price: number;
    last_sale_at: string | null;
    days_since_sale: number;
    total_units_sold: number;
    stock_value: number;
}

/**
 * Cancellations Report (FR38)
 */
/**
 * KDS Service Speed Statistics
 */
export interface IKdsServiceSpeedStat {
    dispatch_station: string;
    report_date: string;
    hour_of_day: number;
    avg_prep_seconds: number;
    max_prep_seconds: number;
    min_prep_seconds: number;
    item_count: number;
}

export interface ICancellationsReport {
    order_id: string;
    order_number: string;
    cancelled_at: string;
    cashier_name: string | null;
    order_total: number;
    cancel_reason: string | null;
    items_count: number;
}
