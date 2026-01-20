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
                    default_producing_section_id: string | null
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
            suppliers: {
                Row: {
                    id: string
                    name: string
                    contact_person: string | null
                    email: string | null
                    phone: string | null
                    address: string | null
                    city: string | null
                    postal_code: string | null
                    country: string | null
                    tax_id: string | null
                    payment_terms: string | null
                    notes: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    contact_person?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    city?: string | null
                    postal_code?: string | null
                    country?: string | null
                    tax_id?: string | null
                    payment_terms?: string | null
                    notes?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['suppliers']['Row']>
            },
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
                    // New fields from migration 040
                    employee_code: string | null
                    first_name: string | null
                    last_name: string | null
                    display_name: string | null
                    phone: string | null
                    preferred_language: 'fr' | 'en' | 'id'
                    timezone: string
                    pin_hash: string | null
                    last_login_at: string | null
                    failed_login_attempts: number
                    locked_until: string | null
                    password_changed_at: string | null
                    must_change_password: boolean
                    created_by: string | null
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['user_profiles']['Row']> & { name: string, role: 'admin' | 'manager' | 'cashier' | 'server' | 'barista' | 'kitchen' | 'backoffice' }
                Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
            }
            roles: {
                Row: {
                    id: string
                    code: string
                    name_fr: string
                    name_en: string
                    name_id: string
                    description: string | null
                    is_system: boolean
                    is_active: boolean
                    hierarchy_level: number
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['roles']['Row']> & { code: string, name_fr: string, name_en: string, name_id: string }
                Update: Partial<Database['public']['Tables']['roles']['Row']>
            }
            permissions: {
                Row: {
                    id: string
                    code: string
                    module: string
                    action: string
                    name_fr: string
                    name_en: string
                    name_id: string
                    description: string | null
                    is_sensitive: boolean
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['permissions']['Row']> & { code: string, module: string, action: string, name_fr: string, name_en: string, name_id: string }
                Update: Partial<Database['public']['Tables']['permissions']['Row']>
            }
            role_permissions: {
                Row: {
                    id: string
                    role_id: string
                    permission_id: string
                    granted_at: string
                    granted_by: string | null
                }
                Insert: Partial<Database['public']['Tables']['role_permissions']['Row']> & { role_id: string, permission_id: string }
                Update: Partial<Database['public']['Tables']['role_permissions']['Row']>
            }
            user_roles: {
                Row: {
                    id: string
                    user_id: string
                    role_id: string
                    is_primary: boolean
                    valid_from: string | null
                    valid_until: string | null
                    assigned_at: string
                    assigned_by: string | null
                }
                Insert: Partial<Database['public']['Tables']['user_roles']['Row']> & { user_id: string, role_id: string }
                Update: Partial<Database['public']['Tables']['user_roles']['Row']>
            }
            user_permissions: {
                Row: {
                    id: string
                    user_id: string
                    permission_id: string
                    is_granted: boolean
                    valid_from: string | null
                    valid_until: string | null
                    reason: string | null
                    granted_at: string
                    granted_by: string | null
                }
                Insert: Partial<Database['public']['Tables']['user_permissions']['Row']> & { user_id: string, permission_id: string }
                Update: Partial<Database['public']['Tables']['user_permissions']['Row']>
            }
            user_sessions: {
                Row: {
                    id: string
                    user_id: string
                    session_token: string
                    device_type: 'desktop' | 'tablet' | 'pos' | null
                    device_name: string | null
                    ip_address: string | null
                    user_agent: string | null
                    started_at: string
                    last_activity_at: string
                    ended_at: string | null
                    end_reason: 'logout' | 'timeout' | 'forced' | null
                }
                Insert: Partial<Database['public']['Tables']['user_sessions']['Row']> & { user_id: string, session_token: string }
                Update: Partial<Database['public']['Tables']['user_sessions']['Row']>
            }
            audit_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string
                    module: string
                    entity_type: string | null
                    entity_id: string | null
                    old_values: Record<string, unknown> | null
                    new_values: Record<string, unknown> | null
                    ip_address: string | null
                    user_agent: string | null
                    session_id: string | null
                    severity: 'info' | 'warning' | 'critical'
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & { action: string, module: string }
                Update: Partial<Database['public']['Tables']['audit_logs']['Row']>
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
                    from_section_id: string | null
                    to_section_id: string | null
                    supplier_id?: string | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['stock_movements']['Row']> & { product_id: string, movement_type: 'purchase' | 'waste' | 'adjustment_in' | 'adjustment_out' | 'sale' | 'production', quantity: number, supplier_id?: string | null }
                Update: Partial<Database['public']['Tables']['stock_movements']['Row']>
            },
            sections: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    is_sales_point: boolean
                    is_production_point: boolean
                    is_warehouse: boolean
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['sections']['Row']> & { name: string, slug: string }
                Update: Partial<Database['public']['Tables']['sections']['Row']>
            },
            product_stocks: {
                Row: {
                    id: string
                    section_id: string
                    product_id: string
                    quantity: number
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['product_stocks']['Row']> & { section_id: string, product_id: string }
                Update: Partial<Database['public']['Tables']['product_stocks']['Row']>
            },
            product_sections: {
                Row: {
                    id: string
                    product_id: string
                    section_id: string
                    is_primary: boolean
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['product_sections']['Row']> & { product_id: string, section_id: string }
                Update: Partial<Database['public']['Tables']['product_sections']['Row']>
            },
            production_records: {
                Row: {
                    id: string
                    production_id: string
                    product_id: string
                    quantity_produced: number
                    quantity_waste: number
                    production_date: string
                    section_id: string | null
                    created_by: string | null
                    staff_id: string | null
                    staff_name: string | null
                    stock_updated: boolean
                    materials_consumed: boolean
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    production_id?: string // Generated by trigger
                    product_id: string
                    quantity_produced: number
                    quantity_waste?: number
                    production_date?: string
                    section_id?: string | null
                    created_by?: string | null
                    staff_id?: string | null
                    staff_name?: string | null
                    stock_updated?: boolean
                    materials_consumed?: boolean
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['production_records']['Row']>
            },
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
                    is_stock_opname_unit: boolean
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
                    is_stock_opname_unit?: boolean
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
            product_combos: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    combo_price: number
                    is_active: boolean
                    available_at_pos: boolean
                    image_url: string | null
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    combo_price: number
                    is_active?: boolean
                    available_at_pos?: boolean
                    image_url?: string | null
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['product_combos']['Row']>
            }
            product_combo_groups: {
                Row: {
                    id: string
                    combo_id: string
                    group_name: string
                    group_type: 'single' | 'multiple'
                    is_required: boolean
                    min_selections: number
                    max_selections: number
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    combo_id: string
                    group_name: string
                    group_type?: 'single' | 'multiple'
                    is_required?: boolean
                    min_selections?: number
                    max_selections?: number
                    sort_order?: number
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['product_combo_groups']['Row']>
            }
            product_combo_group_items: {
                Row: {
                    id: string
                    group_id: string
                    product_id: string
                    price_adjustment: number
                    is_default: boolean
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    group_id: string
                    product_id: string
                    price_adjustment?: number
                    is_default?: boolean
                    sort_order?: number
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['product_combo_group_items']['Row']>
            }
            promotions: {
                Row: {
                    id: string
                    code: string
                    name: string
                    description: string | null
                    promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product'
                    is_active: boolean
                    start_date: string | null
                    end_date: string | null
                    days_of_week: number[] | null
                    time_start: string | null
                    time_end: string | null
                    discount_percentage: number | null
                    discount_amount: number | null
                    buy_quantity: number | null
                    get_quantity: number | null
                    min_purchase_amount: number | null
                    min_quantity: number | null
                    max_uses_total: number | null
                    max_uses_per_customer: number | null
                    current_uses: number
                    priority: number
                    is_stackable: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    name: string
                    description?: string | null
                    promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product'
                    is_active?: boolean
                    start_date?: string | null
                    end_date?: string | null
                    days_of_week?: number[] | null
                    time_start?: string | null
                    time_end?: string | null
                    discount_percentage?: number | null
                    discount_amount?: number | null
                    buy_quantity?: number | null
                    get_quantity?: number | null
                    min_purchase_amount?: number | null
                    min_quantity?: number | null
                    max_uses_total?: number | null
                    max_uses_per_customer?: number | null
                    current_uses?: number
                    priority?: number
                    is_stackable?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['promotions']['Row']>
            }
            promotion_products: {
                Row: {
                    id: string
                    promotion_id: string
                    product_id: string | null
                    category_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    promotion_id: string
                    product_id?: string | null
                    category_id?: string | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['promotion_products']['Row']>
            }
            promotion_free_products: {
                Row: {
                    id: string
                    promotion_id: string
                    free_product_id: string
                    quantity: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    promotion_id: string
                    free_product_id: string
                    quantity?: number
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['promotion_free_products']['Row']>
            }
            promotion_usage: {
                Row: {
                    id: string
                    promotion_id: string
                    customer_id: string | null
                    order_id: string | null
                    discount_amount: number
                    used_at: string
                }
                Insert: {
                    id?: string
                    promotion_id: string
                    customer_id?: string | null
                    order_id?: string | null
                    discount_amount: number
                    used_at?: string
                }
                Update: Partial<Database['public']['Tables']['promotion_usage']['Row']>
            }
            floor_plan_items: {
                Row: {
                    id: string
                    type: 'table' | 'decoration'
                    number: string | null
                    capacity: number | null
                    section: string | null
                    status: 'available' | 'occupied' | 'reserved' | null
                    shape: 'square' | 'round' | 'rectangle'
                    decoration_type: 'plant' | 'wall' | 'bar' | 'entrance' | null
                    x: number
                    y: number
                    width: number | null
                    height: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    type: 'table' | 'decoration'
                    number?: string | null
                    capacity?: number | null
                    section?: string | null
                    status?: 'available' | 'occupied' | 'reserved' | null
                    shape?: 'square' | 'round' | 'rectangle'
                    decoration_type?: 'plant' | 'wall' | 'bar' | 'entrance' | null
                    x: number
                    y: number
                    width?: number | null
                    height?: number | null
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['floor_plan_items']['Row']>
            }
            purchase_orders: {
                Row: {
                    id: string
                    po_number: string
                    supplier_id: string
                    expected_delivery_date: string | null
                    subtotal: number
                    discount_amount: number
                    discount_percentage: number | null
                    tax_amount: number
                    total_amount: number
                    notes: string | null
                    status: 'draft' | 'sent' | 'received' | 'cancelled'
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    po_number?: string
                    supplier_id: string
                    expected_delivery_date?: string | null
                    subtotal?: number
                    discount_amount?: number
                    discount_percentage?: number | null
                    tax_amount?: number
                    total_amount?: number
                    notes?: string | null
                    status?: 'draft' | 'sent' | 'received' | 'cancelled'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['purchase_orders']['Row']>
            }
            purchase_order_items: {
                Row: {
                    id: string
                    purchase_order_id: string
                    product_id: string | null
                    product_name: string
                    description: string | null
                    quantity: number
                    unit_price: number
                    discount_amount: number
                    discount_percentage: number | null
                    tax_rate: number
                    line_total: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    purchase_order_id: string
                    product_id?: string | null
                    product_name: string
                    description?: string | null
                    quantity: number
                    unit_price: number
                    discount_amount?: number
                    discount_percentage?: number | null
                    tax_rate?: number
                    line_total?: number
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['purchase_order_items']['Row']>
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
            },
            process_production: {
                Args: {
                    production_uuid: string
                }
                Returns: boolean
            },
            transfer_stock: {
                Args: {
                    p_product_id: string
                    p_from_section_id: string
                    p_to_section_id: string
                    p_quantity: number
                }
                Returns: boolean
            },
            // Users & Permissions functions (from migration 040)
            user_has_permission: {
                Args: {
                    p_user_id: string
                    p_permission_code: string
                }
                Returns: boolean
            },
            get_user_permissions: {
                Args: {
                    p_user_id: string
                }
                Returns: {
                    permission_code: string
                    permission_module: string
                    permission_action: string
                    is_granted: boolean
                    source: 'direct' | 'role'
                    is_sensitive: boolean
                }[]
            },
            is_admin: {
                Args: {
                    p_user_id: string
                }
                Returns: boolean
            },
            is_super_admin: {
                Args: {
                    p_user_id: string
                }
                Returns: boolean
            },
            verify_user_pin: {
                Args: {
                    p_user_id: string
                    p_pin: string
                }
                Returns: boolean
            },
            hash_pin: {
                Args: {
                    p_pin: string
                }
                Returns: string
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
export type Supplier = Database['public']['Tables']['suppliers']['Row']

export type ProductionRecord = Database['public']['Tables']['production_records']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type ProductStock = Database['public']['Tables']['product_stocks']['Row']
export type ProductSection = Database['public']['Tables']['product_sections']['Row']

// Combos and Promotions types
export type ProductCombo = Database['public']['Tables']['product_combos']['Row']
export type ProductComboGroup = Database['public']['Tables']['product_combo_groups']['Row']
export type ProductComboGroupItem = Database['public']['Tables']['product_combo_group_items']['Row']
export type Promotion = Database['public']['Tables']['promotions']['Row']
export type PromotionProduct = Database['public']['Tables']['promotion_products']['Row']
export type PromotionFreeProduct = Database['public']['Tables']['promotion_free_products']['Row']
export type PromotionUsage = Database['public']['Tables']['promotion_usage']['Row']

// Users & Permissions types (from migration 040)
export type Role = Database['public']['Tables']['roles']['Row']
export type Permission = Database['public']['Tables']['permissions']['Row']
export type RolePermission = Database['public']['Tables']['role_permissions']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type UserPermissionRow = Database['public']['Tables']['user_permissions']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Promotion types
export type PromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product'

// Extended types with relations
export interface ProductWithCategory extends Product {
    category: Category | null
}

export interface ProductSectionWithDetails extends ProductSection {
    section: Section
}

export interface ProductWithSections extends Product {
    sections: ProductSectionWithDetails[]
}

export interface OrderWithItems extends Order {
    items: OrderItemWithProduct[]
}

export interface OrderItemWithProduct extends OrderItem {
    product: Product
}

// Combo with groups
export interface ProductComboWithGroups extends ProductCombo {
    groups: ProductComboGroupWithItems[]
}

export interface ProductComboGroupWithItems extends ProductComboGroup {
    items: ProductComboGroupItemWithProduct[]
}

export interface ProductComboGroupItemWithProduct extends ProductComboGroupItem {
    product: Product
}

// Promotion with products
export interface PromotionWithProducts extends Promotion {
    promotion_products: PromotionProduct[]
    promotion_free_products: PromotionFreeProduct[]
}
