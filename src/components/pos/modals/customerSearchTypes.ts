import { Building2, Crown, UserCheck, User } from 'lucide-react'
import { IOfflineCustomer } from '../../../services/sync/customerSync'

export interface ICustomerCategory {
    id: string
    name: string
    slug: string
    color: string | null
    price_modifier_type: string
    discount_percentage: number | null
}

export interface ICustomerSearchCustomer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    customer_type: string
    category_id: string | null
    category?: {
        name: string
        slug: string
        color: string
        price_modifier_type: string
        discount_percentage: number | null
    }
    loyalty_points: number
    loyalty_tier: string
    total_spent: number
    membership_number: string | null
    loyalty_qr_slug: string | null
}

export interface IOrderHistoryItem {
    id: string
    order_number: string
    created_at: string
    total: number
    items: Array<{
        id: string
        product_id: string
        product_name: string
        quantity: number
        unit_price: number
    }>
}

export interface IFrequentProduct {
    product_id: string
    product_name: string
    times_ordered: number
    last_ordered: string
}

// LocalStorage key for favorites
const FAVORITES_KEY = 'appgrav_favorite_customers'

// Get favorites from localStorage
export const getFavorites = (): string[] => {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY)
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}

// Save favorites to localStorage
export const saveFavorites = (favorites: string[]) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

// Transform offline customer to ICustomerSearchCustomer type for display
// Story 6.1: Uses new fields (points_balance, category_slug, loyalty_tier)
export const transformOfflineCustomer = (c: IOfflineCustomer): ICustomerSearchCustomer => ({
    id: c.id,
    name: c.name,
    company_name: null,
    phone: c.phone,
    email: c.email,
    customer_type: c.category_slug === 'wholesale' ? 'b2b' : 'retail',
    category_id: null,
    category: c.category_slug ? {
        name: c.category_slug.charAt(0).toUpperCase() + c.category_slug.slice(1),
        slug: c.category_slug,
        color: c.category_slug === 'wholesale' ? '#3b82f6' :
               c.category_slug === 'vip' ? '#f59e0b' : '#6366f1',
        price_modifier_type: c.category_slug === 'wholesale' ? 'wholesale_price' : 'none',
        discount_percentage: null,
    } : undefined,
    loyalty_points: c.points_balance,
    loyalty_tier: c.loyalty_tier?.toLowerCase() || 'bronze',
    total_spent: 0,
    membership_number: null,
    loyalty_qr_slug: null,
})

export const getCategoryIcon = (slug?: string) => {
    switch (slug) {
        case 'wholesale': return Building2
        case 'vip': return Crown
        case 'staff': return UserCheck
        default: return User
    }
}
