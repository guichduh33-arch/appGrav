// =====================================================
// THE BREAKERY POS & MINI-ERP
// TypeScript Database Types
// Generated from Supabase schema v2.0.0
// =====================================================

// =====================================================
// ENUM TYPES
// =====================================================

export type ProductType = 'finished' | 'semi_finished' | 'raw_material';

export type DispatchStation = 'barista' | 'kitchen' | 'display' | 'none';

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type PaymentMethod = 'cash' | 'card' | 'qris' | 'split' | 'transfer';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'b2b';

export type ItemStatus = 'new' | 'preparing' | 'ready' | 'served';

export type MovementType =
    | 'purchase'
    | 'production_in'
    | 'production_out'
    | 'sale_pos'
    | 'sale_b2b'
    | 'adjustment_in'
    | 'adjustment_out'
    | 'waste'
    | 'transfer';

export type DiscountType = 'percentage' | 'fixed' | 'free';

export type POStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';

export type ExpenseType = 'cogs' | 'general';

export type PaymentTerms = 'cod' | 'net15' | 'net30' | 'net60';

export type CustomerType = 'retail' | 'wholesale';

export type UserRole = 'admin' | 'manager' | 'cashier' | 'server' | 'barista' | 'kitchen' | 'backoffice';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export type SessionStatus = 'open' | 'closed';

export type ModifierGroupType = 'single' | 'multiple';

// =====================================================
// TABLE TYPES
// =====================================================

export interface Category {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    dispatch_station: DispatchStation;
    is_raw_material: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    category_id: string | null;
    product_type: ProductType;
    retail_price: number;
    wholesale_price: number;
    cost_price: number;
    current_stock: number;
    min_stock_level: number;
    unit: string;
    pos_visible: boolean;
    available_for_sale: boolean;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    category?: Category;
}

export interface ProductModifier {
    id: string;
    product_id: string | null;
    category_id: string | null;
    group_name: string;
    group_type: ModifierGroupType;
    group_required: boolean;
    group_sort_order: number;
    option_id: string;
    option_label: string;
    option_icon: string | null;
    price_adjustment: number;
    is_default: boolean;
    option_sort_order: number;
    is_active: boolean;
    materials: Array<{ material_id: string; quantity: number }> | null;
    created_at: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    customer_type: CustomerType;
    company_name: string | null;
    tax_id: string | null;
    payment_terms: PaymentTerms;
    credit_limit: number;
    loyalty_points: number;
    total_visits: number;
    total_spent: number;
    last_visit_at: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    auth_user_id: string | null;
    name: string;
    role: UserRole;
    pin_code: string | null;
    can_apply_discount: boolean;
    can_cancel_order: boolean;
    can_access_reports: boolean;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface POSSession {
    id: string;
    session_number: string;
    opened_at: string;
    opened_by: string | null;
    opening_cash: number;
    opening_cash_details: Record<string, number> | null;
    closed_at: string | null;
    closed_by: string | null;
    closing_cash: number | null;
    closing_cash_details: Record<string, number> | null;
    total_cash_sales: number;
    total_card_sales: number;
    total_qris_sales: number;
    total_orders: number;
    total_discounts: number;
    total_refunds: number;
    expected_cash: number | null;
    cash_difference: number | null;
    difference_reason: string | null;
    tips_cash: number;
    tips_card: number;
    manager_validated: boolean;
    manager_id: string | null;
    notes: string | null;
    status: SessionStatus;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    order_type: OrderType;
    table_number: string | null;
    customer_id: string | null;
    customer_name: string | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    subtotal: number;
    discount_type: DiscountType | null;
    discount_value: number;
    discount_amount: number;
    discount_reason: string | null;
    discount_requires_manager: boolean;
    discount_manager_id: string | null;
    tax_rate: number;
    tax_amount: number;
    total: number;
    payment_method: PaymentMethod | null;
    payment_details: Record<string, unknown> | null;
    cash_received: number | null;
    change_given: number | null;
    points_earned: number;
    points_used: number;
    points_discount: number;
    staff_id: string | null;
    session_id: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    cancelled_at: string | null;
    cancelled_by: string | null;
    cancellation_reason: string | null;
    // Relations
    customer?: Customer;
    staff?: UserProfile;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    modifiers: ModifierSelection[] | null;
    modifiers_total: number;
    notes: string | null;
    dispatch_station: DispatchStation | null;
    item_status: ItemStatus;
    sent_to_kitchen_at: string | null;
    prepared_at: string | null;
    prepared_by: string | null;
    served_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    product?: Product;
}

export interface ModifierSelection {
    group: string;
    option_id: string;
    option_label: string;
    price: number;
}

export interface StockMovement {
    id: string;
    movement_id: string;
    product_id: string;
    movement_type: MovementType;
    quantity: number;
    unit_cost: number | null;
    reference_type: string | null;
    reference_id: string | null;
    stock_before: number;
    stock_after: number;
    reason: string | null;
    staff_id: string | null;
    created_at: string;
}

export interface Recipe {
    id: string;
    product_id: string;
    material_id: string;
    quantity: number;
    unit: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    product?: Product;
    material?: Product;
}

export interface ProductionRecord {
    id: string;
    production_id: string;
    product_id: string;
    quantity_produced: number;
    quantity_waste: number;
    production_date: string;
    staff_id: string | null;
    staff_name: string | null;
    stock_updated: boolean;
    materials_consumed: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Supplier {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    contact_person: string | null;
    payment_terms: PaymentTerms;
    bank_name: string | null;
    bank_account: string | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PurchaseOrder {
    id: string;
    po_number: string;
    supplier_id: string;
    order_date: string;
    expected_date: string | null;
    received_date: string | null;
    status: POStatus;
    expense_type: ExpenseType;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes: string | null;
    created_by: string | null;
    received_by: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    supplier?: Supplier;
    items?: POItem[];
}

export interface POItem {
    id: string;
    po_id: string;
    product_id: string;
    quantity_ordered: number;
    quantity_received: number;
    unit_price: number;
    total: number;
    created_at: string;
    updated_at: string;
    // Relations
    product?: Product;
}

export interface B2BOrder {
    id: string;
    order_number: string;
    customer_id: string;
    order_date: string;
    delivery_date: string | null;
    delivered_at: string | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    payment_method: PaymentMethod;
    paid_amount: number;
    paid_at: string | null;
    stock_deducted: boolean;
    invoice_number: string | null;
    invoice_generated_at: string | null;
    invoice_url: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    customer?: Customer;
    items?: B2BOrderItem[];
}

export interface B2BOrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    total: number;
    created_at: string;
    // Relations
    product?: Product;
}

export interface AuditLog {
    id: string;
    action_type: string;
    severity: AuditSeverity;
    entity_type: string | null;
    entity_id: string | null;
    old_value: Record<string, unknown> | null;
    new_value: Record<string, unknown> | null;
    reason: string | null;
    requires_manager: boolean;
    manager_approved: boolean | null;
    manager_id: string | null;
    user_id: string | null;
    user_name: string | null;
    user_role: UserRole | null;
    ip_address: string | null;
    device_info: string | null;
    session_id: string | null;
    created_at: string;
}

export interface AppSetting {
    id: string;
    key: string;
    value: unknown;
    description: string | null;
    updated_by: string | null;
    updated_at: string;
}

// =====================================================
// VIEW TYPES
// =====================================================

export interface POSProduct {
    id: string;
    sku: string;
    name: string;
    retail_price: number;
    current_stock: number;
    image_url: string | null;
    category_id: string | null;
    category_name: string | null;
    category_icon: string | null;
    category_color: string | null;
    dispatch_station: DispatchStation | null;
}

export interface KDSQueueItem {
    id: string;
    order_id: string;
    order_number: string;
    table_number: string | null;
    order_type: OrderType;
    product_name: string;
    quantity: number;
    modifiers: ModifierSelection[] | null;
    notes: string | null;
    dispatch_station: DispatchStation;
    item_status: ItemStatus;
    sent_to_kitchen_at: string | null;
    wait_seconds: number;
}

export interface LowStockProduct {
    id: string;
    sku: string;
    name: string;
    current_stock: number;
    min_stock_level: number;
    unit: string;
    category_name: string | null;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface DailyReport {
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

// =====================================================
// DATABASE TYPE (for Supabase client)
// =====================================================

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: Category;
                Insert: Partial<Category> & Pick<Category, 'name'>;
                Update: Partial<Category>;
            };
            products: {
                Row: Product;
                Insert: Partial<Product> & Pick<Product, 'sku' | 'name'>;
                Update: Partial<Product>;
            };
            product_modifiers: {
                Row: ProductModifier;
                Insert: Partial<ProductModifier> & Pick<ProductModifier, 'group_name' | 'option_id' | 'option_label'>;
                Update: Partial<ProductModifier>;
            };
            customers: {
                Row: Customer;
                Insert: Partial<Customer> & Pick<Customer, 'name'>;
                Update: Partial<Customer>;
            };
            user_profiles: {
                Row: UserProfile;
                Insert: Partial<UserProfile> & Pick<UserProfile, 'name' | 'role'>;
                Update: Partial<UserProfile>;
            };
            pos_sessions: {
                Row: POSSession;
                Insert: Partial<POSSession>;
                Update: Partial<POSSession>;
            };
            orders: {
                Row: Order;
                Insert: Partial<Order>;
                Update: Partial<Order>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Partial<OrderItem> & Pick<OrderItem, 'order_id' | 'product_name' | 'quantity' | 'unit_price' | 'total_price'>;
                Update: Partial<OrderItem>;
            };
            stock_movements: {
                Row: StockMovement;
                Insert: Partial<StockMovement> & Pick<StockMovement, 'product_id' | 'movement_type' | 'quantity'>;
                Update: Partial<StockMovement>;
            };
            recipes: {
                Row: Recipe;
                Insert: Partial<Recipe> & Pick<Recipe, 'product_id' | 'material_id' | 'quantity'>;
                Update: Partial<Recipe>;
            };
            production_records: {
                Row: ProductionRecord;
                Insert: Partial<ProductionRecord> & Pick<ProductionRecord, 'product_id' | 'quantity_produced'>;
                Update: Partial<ProductionRecord>;
            };
            suppliers: {
                Row: Supplier;
                Insert: Partial<Supplier> & Pick<Supplier, 'name'>;
                Update: Partial<Supplier>;
            };
            purchase_orders: {
                Row: PurchaseOrder;
                Insert: Partial<PurchaseOrder> & Pick<PurchaseOrder, 'supplier_id'>;
                Update: Partial<PurchaseOrder>;
            };
            po_items: {
                Row: POItem;
                Insert: Partial<POItem> & Pick<POItem, 'po_id' | 'product_id' | 'quantity_ordered' | 'unit_price' | 'total'>;
                Update: Partial<POItem>;
            };
            b2b_orders: {
                Row: B2BOrder;
                Insert: Partial<B2BOrder> & Pick<B2BOrder, 'customer_id'>;
                Update: Partial<B2BOrder>;
            };
            b2b_order_items: {
                Row: B2BOrderItem;
                Insert: Partial<B2BOrderItem> & Pick<B2BOrderItem, 'order_id' | 'product_id' | 'product_name' | 'quantity' | 'unit_price' | 'total'>;
                Update: Partial<B2BOrderItem>;
            };
            audit_log: {
                Row: AuditLog;
                Insert: Partial<AuditLog> & Pick<AuditLog, 'action_type'>;
                Update: Partial<AuditLog>;
            };
            app_settings: {
                Row: AppSetting;
                Insert: Partial<AppSetting> & Pick<AppSetting, 'key' | 'value'>;
                Update: Partial<AppSetting>;
            };
        };
        Views: {
            pos_products: {
                Row: POSProduct;
            };
            kds_queue: {
                Row: KDSQueueItem;
            };
            low_stock_products: {
                Row: LowStockProduct;
            };
        };
        Functions: {
            get_user_role: {
                Args: Record<string, never>;
                Returns: UserRole;
            };
            is_admin_or_manager: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            can_access_pos: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            can_access_backoffice: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            calculate_loyalty_points: {
                Args: { order_total: number };
                Returns: number;
            };
            verify_manager_pin: {
                Args: { pin_input: string };
                Returns: { user_id: string; user_name: string; is_valid: boolean }[];
            };
            process_production: {
                Args: { production_uuid: string };
                Returns: boolean;
            };
        };
    };
}
