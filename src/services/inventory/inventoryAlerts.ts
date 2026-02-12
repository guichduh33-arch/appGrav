/**
 * Inventory Alerts Service
 * Epic 9: Inventaire & Production
 *
 * Handles low stock alerts, reorder suggestions, and production recommendations
 */

import { supabase } from '@/lib/supabase'
import { useCoreSettingsStore } from '@/stores/settings/coreSettingsStore'
import { INVENTORY_CONFIG_DEFAULTS } from '@/hooks/settings/useModuleConfigSettings'
import { logError } from '@/utils/logger'

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
    const getSetting = useCoreSettingsStore.getState().getSetting
    const pctCritical = getSetting<number>('inventory_config.stock_percentage_critical') ?? INVENTORY_CONFIG_DEFAULTS.stockPercentageCritical
    const pctWarning = getSetting<number>('inventory_config.stock_percentage_warning') ?? INVENTORY_CONFIG_DEFAULTS.stockPercentageWarning

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
        logError('[inventoryAlerts] Error fetching low stock items:', error)
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
            severity: stockPercentage <= pctCritical ? 'critical' : stockPercentage <= pctWarning ? 'warning' : 'normal',
            stock_percentage: stockPercentage
        }
    })
}

// ============================================
// Story 9.2: Reorder Suggestions
// Optimized: Uses get_reorder_suggestions_data RPC to batch all
// stock_movements and purchase_order_items queries into a single call.
// Before: 1 + 2N queries (1 products + N movements + N last prices)
// After: 1 RPC call
// ============================================

export async function getReorderSuggestions(): Promise<IReorderSuggestion[]> {
    const getSetting = useCoreSettingsStore.getState().getSetting
    const lookbackDays = getSetting<number>('inventory_config.reorder_lookback_days') ?? INVENTORY_CONFIG_DEFAULTS.reorderLookbackDays
    const maxMultiplier = getSetting<number>('inventory_config.max_stock_multiplier') ?? INVENTORY_CONFIG_DEFAULTS.maxStockMultiplier

    // Single RPC call replaces 1 + 2N queries
    const { data, error } = await supabase.rpc('get_reorder_suggestions_data', {
        p_lookback_days: lookbackDays,
        p_max_multiplier: maxMultiplier,
    })

    if (error) {
        logError('[inventoryAlerts] Error fetching reorder suggestions:', error)
        return []
    }

    return (data ?? []).map((row: {
        product_id: string
        product_name: string
        sku: string
        current_stock: number
        min_stock_level: number
        max_stock_level: number
        cost_price: number
        unit: string
        avg_daily_usage: number
        last_purchase_price: number
        days_until_stockout: number
        suggested_quantity: number
    }) => ({
        product_id: row.product_id,
        product_name: row.product_name,
        sku: row.sku,
        current_stock: Number(row.current_stock),
        min_stock_level: Number(row.min_stock_level),
        max_stock_level: Number(row.max_stock_level),
        suggested_quantity: Math.ceil(Number(row.suggested_quantity)),
        unit_name: row.unit || 'unit',
        supplier_id: null,
        supplier_name: null,
        estimated_cost: Number(row.suggested_quantity) * Number(row.last_purchase_price),
        last_purchase_price: Number(row.last_purchase_price),
        avg_daily_usage: Number(row.avg_daily_usage),
        days_until_stockout: Number(row.days_until_stockout),
    }))
}

// ============================================
// Story 9.4: Production Suggestions
// Optimized: Uses get_production_suggestions_data RPC for base data
// (products, avg sales, priority) in a single call. Recipe ingredient
// checking is done with a single batched query using .in() filter.
// Before: 1 + 2N queries (1 products + N recipes + N order_items)
// After: 1 RPC + 1 batch recipes query (2 total)
// ============================================

export async function getProductionSuggestions(): Promise<IProductionSuggestion[]> {
    const getSetting = useCoreSettingsStore.getState().getSetting
    const productionLookbackDays = getSetting<number>('inventory_config.production_lookback_days') ?? INVENTORY_CONFIG_DEFAULTS.productionLookbackDays
    const priorityHighThreshold = getSetting<number>('inventory_config.production_priority_high_threshold') ?? INVENTORY_CONFIG_DEFAULTS.productionPriorityHighThreshold
    const priorityMediumThreshold = getSetting<number>('inventory_config.production_priority_medium_threshold') ?? INVENTORY_CONFIG_DEFAULTS.productionPriorityMediumThreshold

    // Single RPC call for base data (replaces 1 + N order_items queries)
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_production_suggestions_data', {
        p_lookback_days: productionLookbackDays,
        p_priority_high_threshold: priorityHighThreshold,
        p_priority_medium_threshold: priorityMediumThreshold,
    })

    if (rpcError) {
        logError('[inventoryAlerts] Error fetching production suggestions:', rpcError)
        return []
    }

    const baseData = (rpcData ?? []) as Array<{
        product_id: string
        product_name: string
        current_stock: number
        min_stock_level: number
        suggested_quantity: number
        recipe_id: string | null
        avg_daily_sales: number
        stock_percentage: number
        priority: 'high' | 'medium' | 'low'
    }>

    if (baseData.length === 0) return []

    // Get all product IDs that have recipes, then batch-fetch recipe ingredients
    const productIds = baseData.map(d => d.product_id)

    // Single batch query for all recipes + ingredients (replaces N individual recipe queries)
    type RecipeRow = {
        id: string
        product_id: string
        output_quantity: number
        recipe_ingredients: Array<{
            ingredient_id: string
            quantity: number
            products: { name: string; current_stock: number } | null
        }>
    };
    const { data: recipes } = await supabase
        .from('recipes')
        .select(`
            id,
            product_id,
            output_quantity,
            recipe_ingredients (
                ingredient_id,
                quantity,
                products:ingredient_id (name, current_stock)
            )
        `)
        .in('product_id', productIds)
        .eq('is_active', true)
        .returns<RecipeRow[]>()

    // Index recipes by product_id for O(1) lookup
    const recipeByProduct = new Map<string, {
        id: string
        output_quantity: number
        recipe_ingredients: Array<{
            ingredient_id: string
            quantity: number
            products: { name: string; current_stock: number } | null
        }>
    }>()

    for (const recipe of (recipes ?? [])) {
        // Use first recipe per product (same as original logic)
        if (!recipeByProduct.has(recipe.product_id)) {
            recipeByProduct.set(recipe.product_id, recipe)
        }
    }

    // Build suggestions with ingredient availability checks
    const suggestions: IProductionSuggestion[] = baseData.map((item) => {
        const suggestedQuantity = Math.ceil(Number(item.suggested_quantity))
        const recipe = recipeByProduct.get(item.product_id)

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
                        available,
                    })
                }
            }
        }

        return {
            product_id: item.product_id,
            product_name: item.product_name,
            current_stock: Number(item.current_stock),
            min_stock_level: Number(item.min_stock_level),
            suggested_quantity: suggestedQuantity,
            recipe_id: recipe?.id || item.recipe_id,
            ingredients_available: ingredientsAvailable,
            missing_ingredients: missingIngredients,
            avg_daily_sales: Number(item.avg_daily_sales),
            priority: item.priority,
        }
    })

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
                .from('purchase_order_items')
                .select('product_id, quantity_ordered, quantity_received')
                .eq('id', item.poItemId)
                .single()

            if (!poItem) continue

            // Update received quantity
            const newReceivedQty = (poItem.quantity_received || 0) + item.receivedQuantity
            await supabase
                .from('purchase_order_items')
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
            .from('purchase_order_items')
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
        logError('[inventoryAlerts] Error receiving PO:', err)
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
        const getSetting = useCoreSettingsStore.getState().getSetting
        const poLeadTimeDays = getSetting<number>('inventory_config.po_lead_time_days') ?? INVENTORY_CONFIG_DEFAULTS.poLeadTimeDays

        // Calculate totals
        const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
        // Tax rate is business-critical (10% PPN) - kept as constant to avoid accounting implications
        const taxRate = 0.1
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
                expected_date: new Date(Date.now() + poLeadTimeDays * 24 * 60 * 60 * 1000).toISOString()
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
            .from('purchase_order_items')
            .insert(poItems)

        if (itemsError) {
            // Rollback PO
            await supabase.from('purchase_orders').delete().eq('id', po.id)
            return { success: false, error: 'Failed to create PO items' }
        }

        return { success: true, poId: po.id }
    } catch (err) {
        logError('[inventoryAlerts] Error creating PO:', err)
        return { success: false, error: 'Failed to create PO' }
    }
}
