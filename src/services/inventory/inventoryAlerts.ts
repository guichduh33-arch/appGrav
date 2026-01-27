/**
 * Inventory Alerts Service
 * Epic 9: Inventaire & Production
 *
 * Handles low stock alerts, reorder suggestions, and production recommendations
 */

import { supabase } from '@/lib/supabase'

// ============================================
// Types
// ============================================

export interface ILowStockItem {
    id: string
    name: string
    sku: string
    current_stock: number
    min_stock_level: number
    max_stock_level: number
    unit_name: string
    supplier_id: string | null
    supplier_name: string | null
    product_type: string
    severity: 'critical' | 'warning' | 'normal'
    stock_percentage: number
}

export interface IReorderSuggestion {
    product_id: string
    product_name: string
    sku: string
    current_stock: number
    min_stock_level: number
    max_stock_level: number
    suggested_quantity: number
    unit_name: string
    supplier_id: string | null
    supplier_name: string | null
    estimated_cost: number
    last_purchase_price: number | null
    avg_daily_usage: number
    days_until_stockout: number
}

export interface IProductionSuggestion {
    product_id: string
    product_name: string
    current_stock: number
    min_stock_level: number
    suggested_quantity: number
    recipe_id: string | null
    ingredients_available: boolean
    missing_ingredients: Array<{
        id: string
        name: string
        needed: number
        available: number
    }>
    avg_daily_sales: number
    priority: 'high' | 'medium' | 'low'
}

// ============================================
// Story 9.1: Low Stock Alerts
// ============================================

export async function getLowStockItems(): Promise<ILowStockItem[]> {
    // Note: max_stock_level doesn't exist in current schema, we'll use min_stock_level * 2 as default
    const { data, error } = await supabase
        .from('products')
        .select(`
            id,
            name,
            sku,
            current_stock,
            min_stock_level,
            product_type,
            unit,
            category:categories(name)
        `)
        .eq('is_active', true)
        .order('current_stock', { ascending: true })

    if (error) {
        console.error('[inventoryAlerts] Error fetching low stock items:', error)
        return []
    }

    // Filter for low stock items manually since we can't compare columns in the query
    const lowStockItems = (data || []).filter((item) => {
        const currentStock = item.current_stock || 0
        const minStock = item.min_stock_level || 0
        return currentStock < minStock
    })

    return lowStockItems.map((item) => {
        const currentStock = item.current_stock || 0
        const minStockLevel = item.min_stock_level || 0
        const stockPercentage = minStockLevel > 0
            ? (currentStock / minStockLevel) * 100
            : 0

        return {
            id: item.id,
            name: item.name,
            sku: item.sku,
            current_stock: currentStock,
            min_stock_level: minStockLevel,
            max_stock_level: minStockLevel * 2,
            unit_name: item.unit || 'unit',
            supplier_id: null,
            supplier_name: null,
            product_type: item.product_type || 'finished',
            severity: stockPercentage <= 20 ? 'critical' : stockPercentage <= 50 ? 'warning' : 'normal',
            stock_percentage: stockPercentage
        }
    })
}

// ============================================
// Story 9.2: Reorder Suggestions
// ============================================

export async function getReorderSuggestions(): Promise<IReorderSuggestion[]> {
    // Get low stock raw materials
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
            id,
            name,
            sku,
            current_stock,
            min_stock_level,
            product_type,
            cost_price,
            unit
        `)
        .eq('is_active', true)
        .in('product_type', ['raw_material', 'semi_finished'])
        .order('current_stock', { ascending: true })

    if (productsError) {
        console.error('[inventoryAlerts] Error fetching products:', productsError)
        return []
    }

    // Get average daily usage from stock movements (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const suggestions: IReorderSuggestion[] = []

    // Filter for low stock items
    const lowStockProducts = (products || []).filter((p) => {
        const currentStock = p.current_stock || 0
        const minStock = p.min_stock_level || 0
        return currentStock < minStock
    })

    for (const product of lowStockProducts) {
        const currentStock = product.current_stock || 0
        const minStockLevel = product.min_stock_level || 0
        const costPrice = product.cost_price || 0

        // Get usage from stock movements (using sale_pos or sale_b2b types)
        const { data: movements } = await supabase
            .from('stock_movements')
            .select('quantity')
            .eq('product_id', product.id)
            .in('movement_type', ['sale_pos', 'sale_b2b'])
            .gte('created_at', thirtyDaysAgo.toISOString())

        const totalUsage = (movements || []).reduce((sum, m) => sum + Math.abs(m.quantity), 0)
        const avgDailyUsage = totalUsage / 30

        // Get last purchase price
        const { data: lastPO } = await supabase
            .from('po_items')
            .select('unit_price')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
            .limit(1)

        const lastPurchasePrice = lastPO?.[0]?.unit_price || costPrice

        // Calculate suggested quantity (fill to max level = min * 2)
        const maxLevel = minStockLevel * 2
        const suggestedQuantity = Math.max(maxLevel - currentStock, 0)

        // Calculate days until stockout
        const daysUntilStockout = avgDailyUsage > 0
            ? Math.floor(currentStock / avgDailyUsage)
            : 999

        suggestions.push({
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            current_stock: currentStock,
            min_stock_level: minStockLevel,
            max_stock_level: maxLevel,
            suggested_quantity: Math.ceil(suggestedQuantity),
            unit_name: product.unit || 'unit',
            supplier_id: null,
            supplier_name: null,
            estimated_cost: suggestedQuantity * lastPurchasePrice,
            last_purchase_price: lastPurchasePrice,
            avg_daily_usage: avgDailyUsage,
            days_until_stockout: daysUntilStockout
        })
    }

    // Sort by days until stockout (most urgent first)
    return suggestions.sort((a, b) => a.days_until_stockout - b.days_until_stockout)
}

// ============================================
// Story 9.4: Production Suggestions
// ============================================

export async function getProductionSuggestions(): Promise<IProductionSuggestion[]> {
    // Get finished products that are low stock
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
            id,
            name,
            current_stock,
            min_stock_level
        `)
        .eq('is_active', true)
        .eq('product_type', 'finished')
        .lt('current_stock', 'min_stock_level')
        .order('current_stock', { ascending: true })

    if (productsError) {
        console.error('[inventoryAlerts] Error fetching products:', productsError)
        return []
    }

    const suggestions: IProductionSuggestion[] = []

    for (const product of products || []) {
        const typedProduct = product as {
            id: string
            name: string
            current_stock: number
            min_stock_level: number
        }

        // Get recipe for this product
        const { data: recipes } = await supabase
            .from('recipes')
            .select(`
                id,
                output_quantity,
                recipe_ingredients (
                    ingredient_id,
                    quantity,
                    products:ingredient_id (name, current_stock)
                )
            `)
            .eq('product_id', typedProduct.id)
            .eq('is_active', true)
            .limit(1)

        const recipe = recipes?.[0] as {
            id: string
            output_quantity: number
            recipe_ingredients: Array<{
                ingredient_id: string
                quantity: number
                products: { name: string; current_stock: number } | null
            }>
        } | undefined

        // Calculate suggested production quantity
        const suggestedQuantity = typedProduct.min_stock_level - typedProduct.current_stock

        // Check ingredient availability
        const missingIngredients: IProductionSuggestion['missing_ingredients'] = []
        let ingredientsAvailable = true

        if (recipe) {
            const batchesNeeded = Math.ceil(suggestedQuantity / (recipe.output_quantity || 1))

            for (const ingredient of recipe.recipe_ingredients || []) {
                const needed = ingredient.quantity * batchesNeeded
                const available = ingredient.products?.current_stock || 0

                if (available < needed) {
                    ingredientsAvailable = false
                    missingIngredients.push({
                        id: ingredient.ingredient_id,
                        name: ingredient.products?.name || 'Unknown',
                        needed,
                        available
                    })
                }
            }
        }

        // Get average daily sales (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: sales } = await supabase
            .from('order_items')
            .select('quantity')
            .eq('product_id', typedProduct.id)
            .gte('created_at', sevenDaysAgo.toISOString())

        const totalSales = (sales || []).reduce((sum, s) => sum + s.quantity, 0)
        const avgDailySales = totalSales / 7

        // Determine priority
        const stockPercentage = typedProduct.min_stock_level > 0
            ? (typedProduct.current_stock / typedProduct.min_stock_level) * 100
            : 0
        const priority: IProductionSuggestion['priority'] =
            stockPercentage <= 20 ? 'high' :
            stockPercentage <= 50 ? 'medium' : 'low'

        suggestions.push({
            product_id: typedProduct.id,
            product_name: typedProduct.name,
            current_stock: typedProduct.current_stock,
            min_stock_level: typedProduct.min_stock_level,
            suggested_quantity: Math.ceil(suggestedQuantity),
            recipe_id: recipe?.id || null,
            ingredients_available: ingredientsAvailable,
            missing_ingredients: missingIngredients,
            avg_daily_sales: avgDailySales,
            priority
        })
    }

    // Sort by priority (high first)
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

// ============================================
// Story 9.5: PO Receipt Stock Update
// ============================================

export async function receivePoItems(
    poId: string,
    items: Array<{ poItemId: string; receivedQuantity: number }>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get PO details
        const { data: po, error: poError } = await supabase
            .from('purchase_orders')
            .select('id, status')
            .eq('id', poId)
            .single()

        if (poError || !po) {
            return { success: false, error: 'PO not found' }
        }

        if (po.status === 'received') {
            return { success: false, error: 'PO already completed' }
        }

        // Update each PO item and create stock movements
        for (const item of items) {
            // Get PO item details
            const { data: poItem } = await supabase
                .from('po_items')
                .select('product_id, quantity_ordered, quantity_received')
                .eq('id', item.poItemId)
                .single()

            if (!poItem) continue

            // Update received quantity
            const newReceivedQty = (poItem.quantity_received || 0) + item.receivedQuantity
            await supabase
                .from('po_items')
                .update({ quantity_received: newReceivedQty })
                .eq('id', item.poItemId)

            // Get current product stock for the movement record
            const { data: product } = await supabase
                .from('products')
                .select('current_stock')
                .eq('id', poItem.product_id)
                .single()

            const stockBefore = product?.current_stock || 0
            const stockAfter = stockBefore + item.receivedQuantity

            // Create stock movement
            await supabase
                .from('stock_movements')
                .insert({
                    product_id: poItem.product_id,
                    quantity: item.receivedQuantity,
                    movement_type: 'purchase',
                    movement_id: `PO-${poId}-${item.poItemId}`,
                    reference_type: 'purchase_order',
                    reference_id: poId,
                    reason: `PO receipt: ${item.receivedQuantity} units`,
                    stock_before: stockBefore,
                    stock_after: stockAfter
                })

            // Update product stock
            await supabase
                .from('products')
                .update({ current_stock: stockAfter })
                .eq('id', poItem.product_id)
        }

        // Check if all items are fully received
        const { data: allItems } = await supabase
            .from('po_items')
            .select('quantity_ordered, quantity_received')
            .eq('po_id', poId)

        const allReceived = (allItems || []).every(i =>
            (i.quantity_received || 0) >= i.quantity_ordered
        )

        // Update PO status
        await supabase
            .from('purchase_orders')
            .update({
                status: allReceived ? 'received' : 'partial',
                received_date: new Date().toISOString()
            })
            .eq('id', poId)

        return { success: true }
    } catch (err) {
        console.error('[inventoryAlerts] Error receiving PO:', err)
        return { success: false, error: 'Failed to receive PO items' }
    }
}

// ============================================
// Story 9.6: Create PO from Low Stock
// ============================================

export async function createPoFromLowStock(
    supplierId: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
): Promise<{ success: boolean; poId?: string; error?: string }> {
    try {
        // Calculate totals
        const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
        const taxRate = 0.1 // 10% tax
        const taxAmount = subtotal * taxRate
        const total = subtotal + taxAmount

        // Generate PO number
        const poNumber = `PO-${Date.now()}`

        // Create PO
        const { data: po, error: poError } = await supabase
            .from('purchase_orders')
            .insert({
                supplier_id: supplierId,
                po_number: poNumber,
                status: 'draft',
                subtotal,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total: total,
                expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            })
            .select('id')
            .single()

        if (poError || !po) {
            return { success: false, error: 'Failed to create PO' }
        }

        // Create PO items
        const poItems = items.map(item => ({
            po_id: po.id,
            product_id: item.productId,
            quantity_ordered: item.quantity,
            unit_price: item.unitPrice,
            total: item.quantity * item.unitPrice,
            quantity_received: 0
        }))

        const { error: itemsError } = await supabase
            .from('po_items')
            .insert(poItems)

        if (itemsError) {
            // Rollback PO
            await supabase.from('purchase_orders').delete().eq('id', po.id)
            return { success: false, error: 'Failed to create PO items' }
        }

        return { success: true, poId: po.id }
    } catch (err) {
        console.error('[inventoryAlerts] Error creating PO:', err)
        return { success: false, error: 'Failed to create PO' }
    }
}
