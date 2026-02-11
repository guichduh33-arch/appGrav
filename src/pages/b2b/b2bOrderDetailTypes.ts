export interface B2BOrder {
    id: string
    order_number: string
    customer_id: string
    customer?: {
        id: string
        name: string
        company_name: string | null
        phone: string | null
        email: string | null
        address: string | null
    }
    status: 'draft' | 'confirmed' | 'processing' | 'ready' | 'partially_delivered' | 'delivered' | 'cancelled'
    order_date: string
    requested_delivery_date: string | null
    actual_delivery_date: string | null
    delivery_address: string | null
    delivery_notes: string | null
    subtotal: number
    discount_type: string | null
    discount_value: number
    discount_amount: number
    tax_rate: number
    tax_amount: number
    total_amount: number
    payment_status: 'unpaid' | 'partial' | 'paid'
    payment_terms: string | null
    due_date: string | null
    amount_paid: number
    amount_due: number
    notes: string | null
    internal_notes: string | null
    created_at: string
}

export interface OrderItem {
    id: string
    product_id: string | null
    product_name: string
    product_sku: string | null
    quantity: number
    unit: string
    unit_price: number
    discount_percentage: number
    discount_amount: number
    line_total: number
    quantity_delivered: number
    quantity_remaining: number
}

export interface Payment {
    id: string
    payment_number: string
    amount: number
    payment_method: string
    payment_date: string
    reference_number: string | null
    status: string
}

export interface Delivery {
    id: string
    delivery_number: string
    status: string
    scheduled_date: string | null
    actual_date: string | null
    driver_name: string | null
    received_by: string | null
}

export interface HistoryEntry {
    id: string
    action_type: string
    description: string
    created_at: string
    metadata: Record<string, unknown>
}

export interface PaymentFormData {
    amount: number
    payment_method: string
    reference_number: string
    notes: string
}
