// Database Types for Supabase
// These types will be auto-generated from Supabase schema, but we define them manually for now

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string
                    name: string
                    icon: string | null
                    color: string | null
                    dispatch_station: 'barista' | 'kitchen' | 'display' | 'none' | null
                    is_raw_material: boolean
                    sort_order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['categories']['Row']> & { name: string }
                Update: Partial<Database['public']['Tables']['categories']['Row']>
            }
            products: {
                Row: {
                    id: string
                    sku: string
                    name: string
                    description: string | null
                    category_id: string | null
                    product_type: 'finished' | 'semi_finished' | 'raw_material'
                    retail_price: number | null
                    wholesale_price: number | null
                    cost_price: number | null
                    current_stock: number
                    min_stock_level: number
                    unit: string
                    pos_visible: boolean
                    available_for_sale: boolean
                    image_url: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['products']['Row']> & { sku: string, name: string }
                Update: Partial<Database['public']['Tables']['products']['Row']>
            }
            product_modifiers: {
                Row: {
                    id: string
                    product_id: string | null
                    category_id: string | null
                    group_name: string
                    group_type: 'single' | 'multiple'
                    group_required: boolean
                    group_sort_order: number
                    option_id: string
                    option_label: string
                    option_icon: string | null
                    price_adjustment: number
                    is_default: boolean
                    option_sort_order: number
                    is_active: boolean
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['product_modifiers']['Row']> & { group_name: string, option_id: string, option_label: string }
                Update: Partial<Database['public']['Tables']['product_modifiers']['Row']>
            }
            customers: {
                Row: {
                    id: string
                    name: string
                    phone: string | null
                    email: string | null
                    address: string | null
                    customer_type: 'retail' | 'wholesale'
                    company_name: string | null
                    tax_id: string | null
                    payment_terms: 'cod' | 'net15' | 'net30' | 'net60' | null
                    credit_limit: number | null
                    loyalty_points: number
                    total_visits: number
                    total_spent: number
                    last_visit_at: string | null
                    notes: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['customers']['Row']> & { name: string }
                Update: Partial<Database['public']['Tables']['customers']['Row']>
            }
            pos_sessions: {
                Row: {
                    id: string
                    session_number: string
                    opened_at: string
                    opened_by: string | null
                    opening_cash: number
                    opening_cash_details: Json | null
                    closed_at: string | null
                    closed_by: string | null
                    closing_cash: number | null
                    closing_cash_details: Json | null
                    total_cash_sales: number
                    total_card_sales: number
                    total_qris_sales: number
                    total_orders: number
                    total_discounts: number
                    total_refunds: number
                    expected_cash: number | null
                    cash_difference: number | null
                    difference_reason: string | null
                    tips_cash: number
                    tips_card: number
                    manager_validated: boolean
                    manager_id: string | null
                    notes: string | null
                    status: 'open' | 'closed'
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['pos_sessions']['Row']> & { session_number: string }
                Update: Partial<Database['public']['Tables']['pos_sessions']['Row']>
            }
            orders: {
                Row: {
                    id: string
                    order_number: string
                    order_type: 'dine_in' | 'takeaway' | 'delivery' | 'b2b'
                    table_number: string | null
                    customer_id: string | null
                    customer_name: string | null
                    status: 'new' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled'
                    payment_status: 'unpaid' | 'partial' | 'paid'
                    subtotal: number
                    discount_type: 'percentage' | 'fixed' | 'free' | null
                    discount_value: number
                    discount_amount: number
                    discount_reason: string | null
                    discount_requires_manager: boolean
                    discount_manager_id: string | null
                    tax_rate: number
                    tax_amount: number
                    total: number
                    payment_method: 'cash' | 'card' | 'qris' | 'split' | 'transfer' | null
                    payment_details: Json | null
                    cash_received: number | null
                    change_given: number | null
                    points_earned: number
                    points_used: number
                    points_discount: number
                    staff_id: string | null
                    session_id: string | null
                    created_at: string
                    updated_at: string
                    completed_at: string | null
                    cancelled_at: string | null
                    cancelled_by: string | null
                    cancellation_reason: string | null
                }
                Insert: Partial<Database['public']['Tables']['orders']['Row']> & { order_number: string }
                Update: Partial<Database['public']['Tables']['orders']['Row']>
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    product_name: string
                    product_sku: string | null
                    quantity: number
                    unit_price: number
                    total_price: number
                    modifiers: Json | null
                    modifiers_total: number
                    notes: string | null
                    dispatch_station: 'barista' | 'kitchen' | 'display' | 'none' | null
                    item_status: 'new' | 'preparing' | 'ready' | 'served'
                    sent_to_kitchen_at: string | null
                    prepared_at: string | null
                    prepared_by: string | null
                    served_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['order_items']['Row']> & { order_id: string, product_name: string }
                Update: Partial<Database['public']['Tables']['order_items']['Row']>
            }
            user_profiles: {
                Row: {
                    id: string
                    auth_user_id: string | null
                    name: string
                    role: 'admin' | 'manager' | 'cashier' | 'server' | 'barista' | 'kitchen' | 'backoffice'
                    pin_code: string | null
                    can_apply_discount: boolean
                    can_cancel_order: boolean
                    can_access_reports: boolean
                    avatar_url: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['user_profiles']['Row']> & { name: string, role: 'admin' | 'manager' | 'cashier' | 'server' | 'barista' | 'kitchen' | 'backoffice' }
                Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
            }
            stock_movements: {
                Row: {
                    id: string
                    product_id: string
                    movement_type: 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out' | 'sale' | 'production'
                    quantity: number
                    reason: string | null
                    notes: string | null
                    staff_id: string | null
                    reference_id: string | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['stock_movements']['Row']> & { product_id: string, movement_type: 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out' | 'sale' | 'production', quantity: number }
                Update: Partial<Database['public']['Tables']['stock_movements']['Row']>
            }
            recipes: {
                Row: {
                    id: string
                    product_id: string
                    material_id: string
                    quantity: number
                    unit: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['recipes']['Row']> & { product_id: string, material_id: string, quantity: number }
                Update: Partial<Database['public']['Tables']['recipes']['Row']>
            }
            product_uoms: {
                Row: {
                    id: string
                    product_id: string
                    unit_name: string
                    conversion_factor: number
                    is_purchase_unit: boolean
                    is_consumption_unit: boolean
                    barcode: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id: string
                    unit_name: string
                    conversion_factor: number
                    is_purchase_unit?: boolean
                    is_consumption_unit?: boolean
                    barcode?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['product_uoms']['Row']>
            }
            inventory_counts: {
                Row: {
                    id: string
                    count_number: string
                    status: 'draft' | 'completed' | 'cancelled'
                    started_at: string
                    started_by: string | null
                    completed_at: string | null
                    completed_by: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    count_number?: string  // Auto-generated by trigger
                    status?: 'draft' | 'completed' | 'cancelled'
                    started_at?: string
                    started_by?: string | null
                    completed_at?: string | null
                    completed_by?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['inventory_counts']['Row']>
            }
            inventory_count_items: {
                Row: {
                    id: string
                    inventory_count_id: string
                    product_id: string
                    system_stock: number
                    actual_stock: number | null
                    variance: number | null
                    unit: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    inventory_count_id: string
                    product_id: string
                    system_stock: number
                    actual_stock?: number | null
                    variance?: number | null
                    unit?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['inventory_count_items']['Row']>
            }
        }
        Views: {
            view_daily_kpis: {
                Row: {
                    date: string
                    total_orders: number
                    total_revenue: number
                    net_revenue: number
                    total_tax: number
                    total_discount: number
                    avg_basket_value: number
                }
            }
            view_stock_waste: {
                Row: {
                    product_name: string
                    category_name: string
                    reason: string | null
                    waste_events: number
                    waste_quantity: number
                    loss_value_at_cost: number
                    loss_value_at_retail: number
                    waste_date: string
                }
            }
            view_inventory_valuation: {
                Row: {
                    total_skus: number
                    total_items_in_stock: number
                    total_valuation_cost: number
                    total_valuation_retail: number
                }
            }
            view_payment_method_stats: {
                Row: {
                    payment_method: string
                    transaction_count: number
                    total_revenue: number
                    report_date: string
                }
            }
            view_session_discrepancies: {
                Row: {
                    session_number: string
                    staff_name: string | null
                    opened_at: string
                    closed_at: string | null
                    expected_cash: number | null
                    closing_cash: number | null
                    cash_difference: number | null
                    severity: 'info' | 'warning' | 'critical'
                }
            }
        }
        Functions: {
            finalize_inventory_count: {
                Args: {
                    count_uuid: string
                    user_uuid: string
                }
                Returns: void
            }
            get_sales_comparison: {
                Args: {
                    current_start: string
                    current_end: string
                    previous_start: string
                    previous_end: string
                }
                Returns: {
                    period_label: 'current' | 'previous'
                    total_revenue: number
                    net_revenue: number
                    transaction_count: number
                    avg_basket: number
                }[]
            }
            get_reporting_dashboard_summary: {
                Args: {
                    start_date: string
                    end_date: string
                }
                Returns: Json
            }
        }
        Enums: {
            // Add enums if needed for stricter typing
        }
    }
}

// Helper types
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductModifier = Database['public']['Tables']['product_modifiers']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type POSSession = Database['public']['Tables']['pos_sessions']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type StockMovement = Database['public']['Tables']['stock_movements']['Row']
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type ProductUOM = Database['public']['Tables']['product_uoms']['Row']
export type InventoryCount = Database['public']['Tables']['inventory_counts']['Row']
export type InventoryCountItem = Database['public']['Tables']['inventory_count_items']['Row']

// Extended types with relations
export interface ProductWithCategory extends Product {
    category: Category | null
}

export interface OrderWithItems extends Order {
    items: OrderItemWithProduct[]
}

export interface OrderItemWithProduct extends OrderItem {
    product: Product
}
