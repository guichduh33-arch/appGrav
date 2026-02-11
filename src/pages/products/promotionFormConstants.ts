import { Percent, Tag, ShoppingBag, Gift } from 'lucide-react'
import { PromotionType } from '../../types/database'

export interface PromotionFormData {
    code: string
    name: string
    description: string
    promotion_type: PromotionType
    discount_percentage: number
    discount_amount: number
    buy_quantity: number
    get_quantity: number
    min_purchase_amount: number
    max_uses_total: number | null
    max_uses_per_customer: number | null
    start_date: string
    end_date: string
    days_of_week: number[]
    time_start: string
    time_end: string
    priority: number
    is_stackable: boolean
    is_active: boolean
}

export const PROMOTION_TYPES: {
    type: PromotionType
    label: string
    desc: string
    icon: typeof Percent
}[] = [
    { type: 'percentage', label: 'Discount %', desc: 'Percentage discount', icon: Percent },
    { type: 'fixed_amount', label: 'Fixed amount', desc: 'Discount in Rupiah', icon: Tag },
    { type: 'buy_x_get_y', label: 'Buy X, Get Y', desc: 'Quantity offer', icon: ShoppingBag },
    { type: 'free_product', label: 'Free product', desc: 'Gift with purchase', icon: Gift }
]

export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', full: 'Sunday' },
    { value: 1, label: 'Mon', full: 'Monday' },
    { value: 2, label: 'Tue', full: 'Tuesday' },
    { value: 3, label: 'Wed', full: 'Wednesday' },
    { value: 4, label: 'Thu', full: 'Thursday' },
    { value: 5, label: 'Fri', full: 'Friday' },
    { value: 6, label: 'Sat', full: 'Saturday' }
]

/** Maps a raw promotion row from Supabase into the form shape. */
export function mapPromotionToForm(
    data: { name: string; description: string | null; promotion_type: string; discount_percentage: number | null; discount_amount: number | null; buy_quantity: number | null; get_quantity: number | null; min_purchase_amount: number | null; start_date: string | null; end_date: string | null; days_of_week: number[] | null; priority: number | null; is_active: boolean | null },
    d: Record<string, unknown>
): PromotionFormData {
    return {
        code: (d.code as string) || '',
        name: data.name,
        description: data.description || '',
        promotion_type: data.promotion_type as PromotionType,
        discount_percentage: data.discount_percentage || 0,
        discount_amount: data.discount_amount || 0,
        buy_quantity: data.buy_quantity || 2,
        get_quantity: data.get_quantity || 1,
        min_purchase_amount: data.min_purchase_amount || 0,
        max_uses_total: (d.max_uses_total as number | null) || null,
        max_uses_per_customer: (d.max_uses_per_customer as number | null) || null,
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        days_of_week: data.days_of_week || [],
        time_start: (d.time_start as string) || '',
        time_end: (d.time_end as string) || '',
        priority: data.priority || 0,
        is_stackable: (d.is_stackable as boolean) ?? false,
        is_active: data.is_active ?? true
    }
}

export const initialFormData: PromotionFormData = {
    code: '',
    name: '',
    description: '',
    promotion_type: 'percentage',
    discount_percentage: 10,
    discount_amount: 0,
    buy_quantity: 2,
    get_quantity: 1,
    min_purchase_amount: 0,
    max_uses_total: null,
    max_uses_per_customer: null,
    start_date: '',
    end_date: '',
    days_of_week: [],
    time_start: '',
    time_end: '',
    priority: 0,
    is_stackable: false,
    is_active: true
}
