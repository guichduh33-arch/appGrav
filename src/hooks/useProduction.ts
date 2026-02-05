import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Product, Section, ProductionRecord } from '../types/database'
import { toast } from 'sonner'

// Generate UUID using native crypto API
const generateUUID = (): string => crypto.randomUUID()

export interface ProductionItem {
    productId: string
    name: string
    category: string
    icon: string
    unit: string
    quantity: number
    wasted: number
    wasteReason: string
}

interface ProductUOM {
    id: string
    unit_name: string
    conversion_factor: number
    is_consumption_unit: boolean
}

export interface ProductWithSection extends Product {
    category?: { name: string; icon: string }
    product_uoms?: ProductUOM[]
}

export interface ProductionRecordWithProduct extends ProductionRecord {
    product?: {
        name: string
        sku: string
        unit: string
        product_uoms?: { id: string; unit_name: string; is_consumption_unit: boolean }[]
    }
}

export function useProduction() {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'admin' || user?.role === 'manager'

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [sections, setSections] = useState<Section[]>([])
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [sectionProducts, setSectionProducts] = useState<ProductWithSection[]>([])
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([])
    const [todayHistory, setTodayHistory] = useState<ProductionRecordWithProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const selectedSection = sections.find(s => s.id === selectedSectionId)
    const isToday = selectedDate.toDateString() === new Date().toDateString()

    // Fetch sections on mount
    useEffect(() => {
        fetchSections()
    }, [])

    // Fetch products when section or date changes
    useEffect(() => {
        if (selectedSectionId) {
            fetchSectionProducts()
            fetchTodayHistory()
        }
    }, [selectedSectionId, selectedDate])

    const fetchSections = async () => {
        try {
            const { data, error } = await supabase
                .from('sections')
                .select('*')
                .eq('is_active', true)
                .eq('section_type', 'production')
                .order('sort_order')

            if (error) throw error
            setSections(data || [])

            if (data && data.length > 0 && !selectedSectionId) {
                setSelectedSectionId(data[0].id)
            }
        } catch (error) {
            console.error('Error fetching sections:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSectionProducts = async () => {
        if (!selectedSectionId) return

        try {
            const { data, error } = await supabase
                .from('product_sections')
                .select(`
                    product:products(
                        *,
                        category:categories(name, icon),
                        product_uoms(id, unit_name, conversion_factor, is_consumption_unit)
                    )
                `)
                .eq('section_id', selectedSectionId)

            if (error) throw error

            const products = data
                ?.map((ps: any) => ps.product)
                .filter(Boolean)
                .filter((p: any) => p.product_type === 'finished' || p.product_type === 'semi_finished')

            setSectionProducts(products || [])
        } catch (error) {
            console.error('Error fetching section products:', error)
        }
    }

    const fetchTodayHistory = async () => {
        if (!selectedSectionId) return

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('production_records')
                .select(`
                    *,
                    product:products(
                        name, sku, unit,
                        product_uoms(id, unit_name, is_consumption_unit)
                    )
                `)
                .eq('section_id', selectedSectionId)
                .eq('production_date', dateStr)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodayHistory((data || []) as unknown as ProductionRecordWithProduct[])
        } catch (error) {
            console.error('Error fetching history:', error)
        }
    }

    const getProductionUnit = useCallback((product: ProductWithSection): string => {
        const consumptionUom = product.product_uoms?.find(u => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
    }, [])

    const addProduct = useCallback((product: ProductWithSection) => {
        setProductionItems(prev => [...prev, {
            productId: product.id,
            name: product.name,
            category: product.category?.name || 'General',
            icon: product.category?.icon || '📦',
            unit: getProductionUnit(product),
            quantity: 1,
            wasted: 0,
            wasteReason: ''
        }])
    }, [getProductionUnit])

    const updateQuantity = useCallback((productId: string, field: 'quantity' | 'wasted', delta: number) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, [field]: Math.max(0, item[field] + delta) }
                    : item
            )
        )
    }, [])

    const updateReason = useCallback((productId: string, reason: string) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, wasteReason: reason }
                    : item
            )
        )
    }, [])

    const removeItem = useCallback((productId: string) => {
        setProductionItems(items => items.filter(item => item.productId !== productId))
    }, [])

    const clearItems = useCallback(() => {
        setProductionItems([])
    }, [])

    const restoreFromReminder = useCallback((items: ProductionItem[]) => {
        setProductionItems(items)
    }, [])

    const navigateDate = useCallback((direction: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + direction)
        setSelectedDate(newDate)
    }, [selectedDate])

    const handleSave = async () => {
        if (productionItems.length === 0 || !selectedSectionId) return
        setIsSaving(true)

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]

            for (const item of productionItems) {
                const productionId = generateUUID()
                const { data: prodRecord, error: prodError } = await supabase
                    .from('production_records')
                    .insert({
                        production_id: productionId,
                        product_id: item.productId,
                        section_id: selectedSectionId,
                        quantity_produced: item.quantity,
                        quantity_waste: item.wasted,
                        production_date: dateStr,
                        created_by: user?.id,
                        notes: item.wasteReason ? `Waste: ${item.wasteReason}` : null,
                        stock_updated: true
                    })
                    .select()
                    .single()

                if (prodError) throw prodError

                const { data: productData } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', item.productId)
                    .single()

                const currentStock = productData?.current_stock || 0
                const netChange = item.quantity - item.wasted

                if (item.quantity > 0) {
                    await supabase
                        .from('stock_movements')
                        .insert({
                            movement_id: generateUUID(),
                            product_id: item.productId,
                            movement_type: 'production_in',
                            quantity: item.quantity,
                            stock_before: currentStock,
                            stock_after: currentStock + item.quantity,
                            unit: item.unit,
                            reason: `Production ${selectedSection?.name || ''} - ${dateStr}`,
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        })
                }

                if (item.wasted > 0) {
                    const stockAfterProduction = currentStock + item.quantity
                    await supabase
                        .from('stock_movements')
                        .insert({
                            movement_id: generateUUID(),
                            product_id: item.productId,
                            movement_type: 'waste',
                            quantity: -item.wasted,
                            stock_before: stockAfterProduction,
                            stock_after: stockAfterProduction - item.wasted,
                            unit: item.unit,
                            reason: item.wasteReason || `Production waste ${dateStr}`,
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        })
                }

                await supabase
                    .from('products')
                    .update({ current_stock: currentStock + netChange })
                    .eq('id', item.productId)

                // Deduct recipe ingredients
                const { data: recipeItems } = await supabase
                    .from('recipes')
                    .select(`id, material_id, quantity, unit, material:products!material_id(id, name, current_stock)`)
                    .eq('product_id', item.productId)
                    .eq('is_active', true)

                if (recipeItems && recipeItems.length > 0) {
                    for (const recipe of recipeItems as any[]) {
                        const rawMaterial = recipe.material
                        const material = Array.isArray(rawMaterial) ? rawMaterial[0] : rawMaterial
                        if (!material) continue

                        const qtyToDeduct = recipe.quantity * item.quantity

                        const materialStock = material.current_stock || 0
                        await supabase
                            .from('stock_movements')
                            .insert({
                                movement_id: generateUUID(),
                                product_id: recipe.material_id,
                                movement_type: 'production_out',
                                quantity: -qtyToDeduct,
                                stock_before: materialStock,
                                stock_after: materialStock - qtyToDeduct,
                                unit: recipe.unit || 'pcs',
                                reason: `Used for: ${item.name} (×${item.quantity}) - ${dateStr}`,
                                reference_id: prodRecord.id,
                                staff_id: user?.id
                            })

                        await supabase
                            .from('products')
                            .update({ current_stock: (material.current_stock || 0) - qtyToDeduct })
                            .eq('id', recipe.material_id)
                    }
                }
            }

            toast.success('Production saved')
            setProductionItems([])
            fetchTodayHistory()
        } catch (error: any) {
            console.error('Error saving:', error)
            toast.error('Error: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRecord = async (recordId: string) => {
        if (!isAdmin) return
        if (!confirm('Delete this entry and its stock movements?')) return

        try {
            const { data: record } = await supabase
                .from('production_records')
                .select('product_id, quantity_produced, quantity_waste')
                .eq('id', recordId)
                .single()

            if (record) {
                const { data: productData } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', record.product_id)
                    .single()

                const currentStock = productData?.current_stock || 0
                const netChange = record.quantity_produced - (record.quantity_waste || 0)

                await supabase
                    .from('products')
                    .update({ current_stock: currentStock - netChange })
                    .eq('id', record.product_id)
            }

            await supabase
                .from('stock_movements')
                .delete()
                .eq('reference_id', recordId)

            const { error } = await supabase
                .from('production_records')
                .delete()
                .eq('id', recordId)

            if (error) throw error
            toast.success('Entry deleted')
            fetchTodayHistory()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        }
    }

    const totalProduced = todayHistory.reduce((sum, r) => sum + r.quantity_produced, 0)
    const totalWaste = todayHistory.reduce((sum, r) => sum + (r.quantity_waste || 0), 0)

    return {
        // State
        selectedDate,
        sections,
        selectedSectionId,
        selectedSection,
        sectionProducts,
        productionItems,
        todayHistory,
        isLoading,
        isSaving,
        isAdmin,
        isToday,
        totalProduced,
        totalWaste,

        // Actions
        setSelectedSectionId,
        navigateDate,
        addProduct,
        updateQuantity,
        updateReason,
        removeItem,
        clearItems,
        restoreFromReminder,
        handleSave,
        handleDeleteRecord,
        getProductionUnit,
    }
}
