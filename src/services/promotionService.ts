import { supabase, untypedRpc } from '../lib/supabase'
import {
    Promotion
} from '../types/database'
import { logError } from '@/utils/logger'

export interface CartItem {
    product_id: string
    product_name: string
    category_id: string | null
    quantity: number
    unit_price: number
    total_price: number
}

export interface PromotionResult {
    promotion: Promotion
    discount_amount: number
    free_products: Array<{ product_id: string; quantity: number }>
    applicable_items: CartItem[]
}

export interface AppliedPromotion {
    promotion_id: string
    promotion_code: string
    promotion_name: string
    discount_amount: number
    free_products: Array<{ product_id: string; quantity: number }>
}

/**
 * Check if a promotion is currently valid based on time constraints
 */
export function isPromotionValid(
    promotion: Promotion,
    _customerId?: string | null
): { valid: boolean; reason?: string } {
    void _customerId; // Parameter reserved for future use
    // Check if active
    if (!promotion.is_active) {
        return { valid: false, reason: 'Promotion inactive' }
    }

    const now = new Date()

    // Check date range
    if (promotion.start_date) {
        const startDate = new Date(promotion.start_date)
        if (now < startDate) {
            return { valid: false, reason: 'Promotion not yet started' }
        }
    }

    if (promotion.end_date) {
        const endDate = new Date(promotion.end_date)
        if (now > endDate) {
            return { valid: false, reason: 'Promotion expired' }
        }
    }

    // Check day of week
    if (promotion.days_of_week && promotion.days_of_week.length > 0) {
        const currentDay = now.getDay()
        if (!promotion.days_of_week.includes(currentDay)) {
            return { valid: false, reason: 'Promotion not valid today' }
        }
    }

    // Check time range
    if (promotion.time_start && promotion.time_end) {
        const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
        if (currentTime < promotion.time_start || currentTime > promotion.time_end) {
            return { valid: false, reason: 'Promotion not valid at this time' }
        }
    }

    // Check total usage limit
    if (promotion.max_uses_total && (promotion.current_uses ?? 0) >= promotion.max_uses_total) {
        return { valid: false, reason: 'Promotion usage limit reached' }
    }

    return { valid: true }
}

/**
 * Get all applicable promotions for the current cart
 */
export async function getApplicablePromotions(
    cartItems: CartItem[],
    subtotal: number,
    customerId?: string | null
): Promise<Promotion[]> {
    try {
        // Fetch all active promotions
        const { data: promotions, error } = await supabase
            .from('promotions')
            .select(`
                id, code, name, description, promotion_type, is_active, is_stackable, 
                priority, min_purchase_amount, min_quantity, discount_percentage, 
                discount_amount, buy_quantity, get_quantity, max_uses_total, 
                max_uses_per_customer, current_uses, start_date, end_date, 
                start_time, end_time, time_start, time_end, days_of_week, 
                active_days, created_at, updated_at
            `)
            .eq('is_active', true)
            .order('priority', { ascending: false })

        if (error) throw error
        if (!promotions) return []

        // Filter promotions based on validity
        const validPromotions: Promotion[] = []

        for (const promotion of promotions) {
            const { valid } = isPromotionValid(promotion, customerId)
            if (!valid) continue

            // Check minimum purchase amount
            if (promotion.min_purchase_amount && subtotal < promotion.min_purchase_amount) {
                continue
            }

            // Check if promotion applies to any cart items
            const { data: promotionProducts } = await supabase
                .from('promotion_products')
                .select('id, promotion_id, product_id, category_id, created_at')
                .eq('promotion_id', promotion.id)

            // If no specific products/categories, promotion applies to all
            if (!promotionProducts || promotionProducts.length === 0) {
                validPromotions.push(promotion)
                continue
            }

            // Check if any cart item matches promotion products/categories
            const hasMatchingItem = cartItems.some(item => {
                return promotionProducts.some(pp => {
                    return (pp.product_id && pp.product_id === item.product_id) ||
                        (pp.category_id && pp.category_id === item.category_id)
                })
            })

            if (hasMatchingItem) {
                validPromotions.push(promotion)
            }
        }

        return validPromotions
    } catch (error) {
        logError('Error fetching applicable promotions:', error)
        return []
    }
}

/**
 * Calculate discount for a specific promotion
 */
export async function calculatePromotionDiscount(
    promotion: Promotion,
    cartItems: CartItem[],
    _subtotal: number
): Promise<PromotionResult | null> {
    void _subtotal; // Reserved for future use
    try {
        // Get promotion products
        const { data: promotionProducts } = await supabase
            .from('promotion_products')
            .select('id, promotion_id, product_id, category_id, created_at')
            .eq('promotion_id', promotion.id)

        // Filter applicable items
        let applicableItems = cartItems

        if (promotionProducts && promotionProducts.length > 0) {
            applicableItems = cartItems.filter(item =>
                promotionProducts.some(pp => {
                    return (pp.product_id && pp.product_id === item.product_id) ||
                        (pp.category_id && pp.category_id === item.category_id)
                })
            )
        }

        if (applicableItems.length === 0) return null

        let discountAmount = 0
        const freeProducts: Array<{ product_id: string; quantity: number }> = []

        switch (promotion.promotion_type) {
            case 'percentage':
                if (promotion.discount_percentage) {
                    const applicableTotal = applicableItems.reduce(
                        (sum, item) => sum + item.total_price,
                        0
                    )
                    discountAmount = (applicableTotal * promotion.discount_percentage) / 100
                }
                break

            case 'fixed_amount':
                if (promotion.discount_amount) {
                    discountAmount = promotion.discount_amount
                }
                break

            case 'buy_x_get_y':
                if (promotion.buy_quantity && promotion.get_quantity) {
                    // Calculate how many times the promotion applies
                    const totalQuantity = applicableItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                    )
                    const promoSets = Math.floor(totalQuantity / promotion.buy_quantity)

                    if (promoSets > 0) {
                        // Find cheapest item to discount
                        const sortedItems = [...applicableItems].sort(
                            (a, b) => a.unit_price - b.unit_price
                        )
                        const freeQty = promoSets * promotion.get_quantity
                        discountAmount = sortedItems[0].unit_price * Math.min(freeQty, sortedItems[0].quantity)
                    }
                }
                break

            case 'free_product': {
                // Get free products
                type FreeProductRow = { product_id?: string; free_product_id?: string; quantity?: number };
                const { data: freeProductsData } = await supabase
                    .from('promotion_free_products')
                    .select('product_id, quantity')
                    .eq('promotion_id', promotion.id)
                    .returns<FreeProductRow[]>();

                if (freeProductsData) {
                    const validItems = freeProductsData
                        .map((fp) => ({
                            product_id: fp.product_id || fp.free_product_id || '',
                            quantity: fp.quantity || 1
                        }))
                        .filter((fp) => fp.product_id !== '');
                    freeProducts.push(...validItems)
                }
                break
            }
        }

        return {
            promotion,
            discount_amount: discountAmount,
            free_products: freeProducts,
            applicable_items: applicableItems
        }
    } catch (error) {
        logError('Error calculating promotion discount:', error)
        return null
    }
}

/**
 * Apply best promotions to cart (handles stacking logic)
 */
export async function applyBestPromotions(
    cartItems: CartItem[],
    subtotal: number,
    customerId?: string | null
): Promise<AppliedPromotion[]> {
    try {
        const applicablePromotions = await getApplicablePromotions(
            cartItems,
            subtotal,
            customerId
        )

        if (applicablePromotions.length === 0) return []

        const results: PromotionResult[] = []

        for (const promotion of applicablePromotions) {
            const result = await calculatePromotionDiscount(promotion, cartItems, subtotal)
            if (result && result.discount_amount > 0) {
                results.push(result)
            }
        }

        // Sort by discount amount (best first)
        results.sort((a, b) => b.discount_amount - a.discount_amount)

        // Apply stacking logic
        const appliedPromotions: AppliedPromotion[] = []
        const appliedNonStackable = results.find(r => !r.promotion.is_stackable)

        if (appliedNonStackable) {
            // If we have a non-stackable promotion, only apply that one
            appliedPromotions.push({
                promotion_id: appliedNonStackable.promotion.id,
                promotion_code: appliedNonStackable.promotion.code || '',
                promotion_name: appliedNonStackable.promotion.name,
                discount_amount: appliedNonStackable.discount_amount,
                free_products: appliedNonStackable.free_products
            })
        } else {
            // Apply all stackable promotions
            for (const result of results) {
                if (result.promotion.is_stackable || appliedPromotions.length === 0) {
                    appliedPromotions.push({
                        promotion_id: result.promotion.id,
                        promotion_code: result.promotion.code || '',
                        promotion_name: result.promotion.name,
                        discount_amount: result.discount_amount,
                        free_products: result.free_products
                    })
                }
            }
        }

        return appliedPromotions
    } catch (error) {
        logError('Error applying promotions:', error)
        return []
    }
}

/**
 * Record promotion usage after order completion
 */
export async function recordPromotionUsage(
    promotionId: string,
    customerId: string | null,
    orderId: string,
    discountAmount: number
): Promise<void> {
    try {
        await untypedRpc('record_promotion_usage', {
            p_promotion_id: promotionId,
            p_customer_id: customerId || undefined,
            p_order_id: orderId,
            p_discount_amount: discountAmount
        })
    } catch (error) {
        logError('Error recording promotion usage:', error)
    }
}

/**
 * Validate promotion code manually entered by user
 */
export async function validatePromotionCode(
    code: string,
    _cartItems: CartItem[],
    subtotal: number,
    customerId?: string | null
): Promise<{ valid: boolean; promotion?: Promotion; reason?: string }> {
    void _cartItems; // Reserved for future use
    try {
        const { data: promotion, error } = await supabase
            .from('promotions')
            .select(`
                id, code, name, description, promotion_type, is_active, is_stackable, 
                priority, min_purchase_amount, min_quantity, discount_percentage, 
                discount_amount, buy_quantity, get_quantity, max_uses_total, 
                max_uses_per_customer, current_uses, start_date, end_date, 
                start_time, end_time, time_start, time_end, days_of_week, 
                active_days, created_at, updated_at
            `)
            .eq('code', code.toUpperCase())
            .single()

        if (error || !promotion) {
            return { valid: false, reason: 'Code promotion invalide' }
        }

        const { valid, reason } = isPromotionValid(promotion, customerId)
        if (!valid) {
            return { valid: false, reason }
        }

        // Check minimum purchase
        if (promotion.min_purchase_amount && subtotal < promotion.min_purchase_amount) {
            return {
                valid: false,
                reason: `Montant minimum requis: ${promotion.min_purchase_amount} IDR`
            }
        }

        return { valid: true, promotion }
    } catch (error) {
        logError('Error validating promotion code:', error)
        return { valid: false, reason: 'Erreur lors de la validation du code' }
    }
}
