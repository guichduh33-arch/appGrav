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
                    country: string
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
                    country?: string
                    tax_id?: string | null
                    payment_terms?: string | null
                    notes?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    contact_person?: string | null
                    email?: string | null
                    phone?: string | null
                    address?: string | null
                    city?: string | null
                    postal_code?: string | null
                    country?: string
                    tax_id?: string | null
                    payment_terms?: string | null
                    notes?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            },
            // Purchase Orders Module (migration 025)
            purchase_orders: {
                Row: {
                    id: string
                    po_number: string
                    supplier_id: string
                    status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled' | 'modified'
                    order_date: string
                    expected_delivery_date: string | null
                    actual_delivery_date: string | null
                    subtotal: number
                    discount_amount: number
                    discount_percentage: number | null
                    tax_amount: number
                    total_amount: number
                    payment_status: 'unpaid' | 'partially_paid' | 'paid'
                    payment_date: string | null
                    notes: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['purchase_orders']['Row']> & { supplier_id: string }
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
                    quantity_received: number
                    quantity_returned: number
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['purchase_order_items']['Row']> & { purchase_order_id: string, product_name: string, quantity: number, unit_price: number, line_total: number }
                Update: Partial<Database['public']['Tables']['purchase_order_items']['Row']>
            }
            purchase_order_history: {
                Row: {
                    id: string
                    purchase_order_id: string
                    action_type: 'created' | 'modified' | 'sent' | 'confirmed' | 'received' | 'partially_received' | 'cancelled' | 'payment_made' | 'item_returned'
                    previous_status: string | null
                    new_status: string | null
                    description: string
                    changed_by: string | null
                    metadata: Json | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['purchase_order_history']['Row']> & { purchase_order_id: string, action_type: string, description: string }
                Update: Partial<Database['public']['Tables']['purchase_order_history']['Row']>
            }
            purchase_order_returns: {
                Row: {
                    id: string
                    purchase_order_id: string
                    purchase_order_item_id: string
                    quantity_returned: number
                    reason: 'damaged' | 'wrong_item' | 'quality_issue' | 'excess_quantity' | 'other'
                    reason_details: string | null
                    return_date: string
                    refund_amount: number | null
                    status: 'pending' | 'approved' | 'rejected' | 'completed'
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['purchase_order_returns']['Row']> & { purchase_order_id: string, purchase_order_item_id: string, quantity_returned: number, reason: 'damaged' | 'wrong_item' | 'quality_issue' | 'excess_quantity' | 'other' }
                Update: Partial<Database['public']['Tables']['purchase_order_returns']['Row']>
            }
            // B2B Sales Module (migration 027)
            b2b_orders: {
                Row: {
                    id: string
                    order_number: string
                    customer_id: string
                    status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'partially_delivered' | 'delivered' | 'cancelled'
                    order_date: string
                    requested_delivery_date: string | null
                    actual_delivery_date: string | null
                    delivery_address: string | null
                    delivery_notes: string | null
                    subtotal: number
                    discount_type: 'percentage' | 'fixed' | null
                    discount_value: number
                    discount_amount: number
                    tax_rate: number
                    tax_amount: number
                    total_amount: number
                    payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue'
                    payment_terms: 'cod' | 'net15' | 'net30' | 'net60' | null
                    due_date: string | null
                    amount_paid: number
                    amount_due: number
                    notes: string | null
                    internal_notes: string | null
                    created_by: string | null
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['b2b_orders']['Row']> & { customer_id: string }
                Update: Partial<Database['public']['Tables']['b2b_orders']['Row']>
            }
            b2b_order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    product_name: string
                    product_sku: string | null
                    description: string | null
                    quantity: number
                    unit: string
                    unit_price: number
                    discount_percentage: number
                    discount_amount: number
                    line_total: number
                    quantity_delivered: number
                    quantity_remaining: number
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['b2b_order_items']['Row']> & { order_id: string, product_name: string, quantity: number, unit_price: number, line_total: number }
                Update: Partial<Database['public']['Tables']['b2b_order_items']['Row']>
            }
            b2b_payments: {
                Row: {
                    id: string
                    payment_number: string
                    order_id: string
                    customer_id: string
                    amount: number
                    payment_method: 'cash' | 'transfer' | 'check' | 'card' | 'qris' | 'credit'
                    payment_date: string
                    reference_number: string | null
                    bank_name: string | null
                    status: 'pending' | 'completed' | 'failed' | 'refunded'
                    notes: string | null
                    received_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['b2b_payments']['Row']> & { order_id: string, customer_id: string, amount: number, payment_method: 'cash' | 'transfer' | 'check' | 'card' | 'qris' | 'credit' }
                Update: Partial<Database['public']['Tables']['b2b_payments']['Row']>
            }
            b2b_deliveries: {
                Row: {
                    id: string
                    delivery_number: string
                    order_id: string
                    customer_id: string
                    status: 'pending' | 'in_transit' | 'delivered' | 'partial' | 'failed' | 'returned'
                    scheduled_date: string | null
                    actual_date: string | null
                    delivery_address: string | null
                    driver_name: string | null
                    vehicle_info: string | null
                    received_by: string | null
                    signature_url: string | null
                    notes: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['b2b_deliveries']['Row']> & { order_id: string, customer_id: string }
                Update: Partial<Database['public']['Tables']['b2b_deliveries']['Row']>
            }
            b2b_delivery_items: {
                Row: {
                    id: string
                    delivery_id: string
                    order_item_id: string
                    quantity_delivered: number
                    notes: string | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['b2b_delivery_items']['Row']> & { delivery_id: string, order_item_id: string, quantity_delivered: number }
                Update: Partial<Database['public']['Tables']['b2b_delivery_items']['Row']>
            }
            b2b_order_history: {
                Row: {
                    id: string
                    order_id: string
                    action_type: 'created' | 'confirmed' | 'processing' | 'ready' | 'delivery_scheduled' | 'delivery_partial' | 'delivered' | 'payment_received' | 'payment_partial' | 'modified' | 'cancelled' | 'note_added'
                    previous_status: string | null
                    new_status: string | null
                    description: string
                    metadata: Json | null
                    created_by: string | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['b2b_order_history']['Row']> & { order_id: string, action_type: string, description: string }
                Update: Partial<Database['public']['Tables']['b2b_order_history']['Row']>
            }
            // Floor Plan Items (migration 024)
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
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['floor_plan_items']['Row']> & { type: 'table' | 'decoration', shape: 'square' | 'round' | 'rectangle' }
                Update: Partial<Database['public']['Tables']['floor_plan_items']['Row']>
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
                    // New fields from migration 028
                    category_id: string | null
                    loyalty_qr_code: string | null
                    membership_number: string | null
                    date_of_birth: string | null
                    loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
                    lifetime_points: number
                    points_expiry_date: string | null
                    preferred_language: 'id' | 'en' | 'fr'
                }
                Insert: Partial<Database['public']['Tables']['customers']['Row']> & { name: string }
                Update: Partial<Database['public']['Tables']['customers']['Row']>
            }
            customer_categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    color: string
                    icon: string
                    price_modifier_type: 'retail' | 'wholesale' | 'custom' | 'discount_percentage'
                    discount_percentage: number
                    loyalty_enabled: boolean
                    points_per_amount: number
                    points_multiplier: number
                    auto_discount_enabled: boolean
                    auto_discount_threshold: number
                    auto_discount_percentage: number
                    sort_order: number
                    is_default: boolean
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['customer_categories']['Row']> & { name: string, slug: string }
                Update: Partial<Database['public']['Tables']['customer_categories']['Row']>
            }
            loyalty_tiers: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    min_lifetime_points: number
                    color: string
                    icon: string
                    points_multiplier: number
                    discount_percentage: number
                    free_delivery: boolean
                    priority_support: boolean
                    birthday_bonus_points: number
                    sort_order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['loyalty_tiers']['Row']> & { name: string, slug: string, min_lifetime_points: number }
                Update: Partial<Database['public']['Tables']['loyalty_tiers']['Row']>
            }
            loyalty_transactions: {
                Row: {
                    id: string
                    customer_id: string
                    order_id: string | null
                    transaction_type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'bonus' | 'refund'
                    points: number
                    points_balance_after: number
                    order_amount: number | null
                    points_rate: number | null
                    multiplier: number
                    discount_applied: number | null
                    description: string | null
                    reference_number: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['loyalty_transactions']['Row']> & { customer_id: string, transaction_type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'bonus' | 'refund', points: number, points_balance_after: number }
                Update: Partial<Database['public']['Tables']['loyalty_transactions']['Row']>
            }
            loyalty_rewards: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    image_url: string | null
                    reward_type: 'product' | 'discount_fixed' | 'discount_percentage' | 'free_item'
                    product_id: string | null
                    discount_value: number | null
                    min_order_amount: number
                    points_required: number
                    quantity_available: number | null
                    quantity_redeemed: number
                    valid_from: string | null
                    valid_until: string | null
                    min_tier: string
                    sort_order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['loyalty_rewards']['Row']> & { name: string, reward_type: 'product' | 'discount_fixed' | 'discount_percentage' | 'free_item', points_required: number }
                Update: Partial<Database['public']['Tables']['loyalty_rewards']['Row']>
            }
            loyalty_redemptions: {
                Row: {
                    id: string
                    customer_id: string
                    reward_id: string
                    order_id: string | null
                    loyalty_transaction_id: string | null
                    points_used: number
                    status: 'pending' | 'applied' | 'expired' | 'cancelled'
                    redeemed_at: string
                    applied_at: string | null
                    expires_at: string | null
                    created_at: string
                }
                Insert: Partial<Database['public']['Tables']['loyalty_redemptions']['Row']> & { customer_id: string, reward_id: string, points_used: number }
                Update: Partial<Database['public']['Tables']['loyalty_redemptions']['Row']>
            }
            product_category_prices: {
                Row: {
                    id: string
                    product_id: string
                    customer_category_id: string
                    price: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Partial<Database['public']['Tables']['product_category_prices']['Row']> & { product_id: string, customer_category_id: string, price: number }
                Update: Partial<Database['public']['Tables']['product_category_prices']['Row']>
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
            }
            add_loyalty_points: {
                Args: {
                    p_customer_id: string
                    p_order_id: string
                    p_order_amount: number
                    p_created_by?: string | null
                }
                Returns: number
            }
            redeem_loyalty_points: {
                Args: {
                    p_customer_id: string
                    p_points: number
                    p_order_id?: string | null
                    p_description?: string
                    p_created_by?: string | null
                }
                Returns: boolean
            }
            get_customer_price: {
                Args: {
                    p_customer_id: string
                    p_product_id: string
                }
                Returns: number
            }
            get_customer_product_price: {
                Args: {
                    p_product_id: string
                    p_customer_id?: string | null
                }
                Returns: number
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

// Customer & Loyalty types (migration 028)
export type CustomerCategory = Database['public']['Tables']['customer_categories']['Row']
export type LoyaltyTier = Database['public']['Tables']['loyalty_tiers']['Row']
export type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row']
export type LoyaltyReward = Database['public']['Tables']['loyalty_rewards']['Row']
export type LoyaltyRedemption = Database['public']['Tables']['loyalty_redemptions']['Row']
export type ProductCategoryPrice = Database['public']['Tables']['product_category_prices']['Row']

// Purchase Orders types (migration 025)
export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']
export type PurchaseOrderHistory = Database['public']['Tables']['purchase_order_history']['Row']
export type PurchaseOrderReturn = Database['public']['Tables']['purchase_order_returns']['Row']

// B2B Sales types (migration 027)
export type B2BOrder = Database['public']['Tables']['b2b_orders']['Row']
export type B2BOrderItem = Database['public']['Tables']['b2b_order_items']['Row']
export type B2BPayment = Database['public']['Tables']['b2b_payments']['Row']
export type B2BDelivery = Database['public']['Tables']['b2b_deliveries']['Row']
export type B2BDeliveryItem = Database['public']['Tables']['b2b_delivery_items']['Row']
export type B2BOrderHistory = Database['public']['Tables']['b2b_order_history']['Row']

// Floor Plan types (migration 024)
export type FloorPlanItem = Database['public']['Tables']['floor_plan_items']['Row']

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
