import { useState, useEffect } from 'react'
import {
    ChevronLeft, ChevronRight,
    Layers
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Product, Section, ProductionRecord } from '../../types/database'
import { toast } from 'sonner'
import { logError, logDebug } from '@/utils/logger'
import ProductionForm from './components/ProductionForm'
import ProductionSummary from './components/ProductionSummary'
import ProductionHistory from './components/ProductionHistory'
import './StockProductionPage.css'

export interface AvailableUnit {
    name: string
    conversionFactor: number
    isBase: boolean
}

export interface ProductionItem {
    productId: string
    name: string
    category: string
    icon: string
    unit: string
    selectedUnit: string
    conversionFactor: number
    availableUnits: AvailableUnit[]
    quantity: number
    wasted: number
    wasteReason: string
}

export interface ProductUOM {
    id: string
    unit_name: string
    conversion_factor: number
    is_consumption_unit: boolean
}

export interface ProductWithSection extends Product {
    category?: { name: string; icon: string }
    product_uoms?: ProductUOM[]
}

export default function StockProductionPage() {
    const { user } = useAuthStore()
    // Check admin status via permissions hook would be better, but for now just allow
    const isAdmin = true

    // State
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [sections, setSections] = useState<Section[]>([])
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [sectionProducts, setSectionProducts] = useState<ProductWithSection[]>([])
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([])
    const [todayHistory, setTodayHistory] = useState<(ProductionRecord & { product?: Product })[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Fetch sections on mount
    useEffect(() => {
        fetchSections()
    }, [])

    // Fetch products when section changes
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
            logError('Error fetching sections:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSectionProducts = async () => {
        if (!selectedSectionId) return

        try {
            logDebug('[StockProduction] Fetching products for section:', selectedSectionId)

            // First, get all product_sections for this section
            const { data: psData, error: psError } = await supabase
                .from('product_sections')
                .select('product_id')
                .eq('section_id', selectedSectionId)

            logDebug('[StockProduction] Product IDs:', psData)

            if (psError) {
                logError('[StockProduction] Error fetching product_sections:', psError)
                throw psError
            }

            if (!psData || psData.length === 0) {
                logDebug('[StockProduction] No products found for this section')
                setSectionProducts([])
                return
            }

            const productIds = psData.map(ps => ps.product_id)
            logDebug('[StockProduction] Product IDs to fetch:', productIds.length)

            // Then fetch the full product details
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    category:categories(name, icon)
                `)
                .in('id', productIds)
                .in('product_type', ['finished', 'semi_finished'])
                .neq('is_active', false)

            logDebug('[StockProduction] Products fetched:', data?.length)
            logDebug('[StockProduction] Error:', error)

            if (error) throw error

            // Fetch UOMs separately for each product
            const productsWithUoms = await Promise.all(
                (data || []).map(async (product) => {
                    const { data: uoms } = await supabase
                        .from('product_uoms')
                        .select('id, unit_name, conversion_factor, is_consumption_unit')
                        .eq('product_id', product.id)

                    return {
                        ...product,
                        product_uoms: uoms || []
                    }
                })
            )

            const products = productsWithUoms as ProductWithSection[]
            logDebug('[StockProduction] Final products:', products.length, products.slice(0, 5).map(p => p.name))

            setSectionProducts(products)
        } catch (error) {
            logError('[StockProduction] Error fetching section products:', error)
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
                    products!product_id(
                        name,
                        sku,
                        unit
                    )
                `)
                .eq('production_date', dateStr)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodayHistory((data || []) as never)
        } catch (error) {
            logError('Error fetching history:', error)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const navigateDate = (direction: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + direction)
        setSelectedDate(newDate)
    }

    const isToday = selectedDate.toDateString() === new Date().toDateString()

    const filteredProducts = sectionProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !productionItems.find(item => item.productId === p.id)
    )

    const getAvailableUnits = (product: ProductWithSection): AvailableUnit[] => {
        const baseUnit = product.unit || 'pcs'
        const units: AvailableUnit[] = [
            { name: baseUnit, conversionFactor: 1, isBase: true }
        ]

        if (product.product_uoms) {
            product.product_uoms.forEach(uom => {
                units.push({
                    name: uom.unit_name,
                    conversionFactor: uom.conversion_factor,
                    isBase: false
                })
            })
        }

        return units
    }

    const getDefaultUnit = (product: ProductWithSection): { name: string; conversionFactor: number } => {
        const consumptionUom = product.product_uoms?.find(u => u.is_consumption_unit)
        if (consumptionUom) {
            return { name: consumptionUom.unit_name, conversionFactor: consumptionUom.conversion_factor }
        }
        return { name: product.unit || 'pcs', conversionFactor: 1 }
    }

    const addProduct = (product: ProductWithSection) => {
        const availableUnits = getAvailableUnits(product)
        const defaultUnit = getDefaultUnit(product)

        setProductionItems([...productionItems, {
            productId: product.id,
            name: product.name,
            category: product.category?.name || 'General',
            icon: product.category?.icon || '',
            unit: product.unit || 'pcs',
            selectedUnit: defaultUnit.name,
            conversionFactor: defaultUnit.conversionFactor,
            availableUnits,
            quantity: 1,
            wasted: 0,
            wasteReason: ''
        }])
        setSearchQuery('')
    }

    const updateQuantity = (productId: string, field: 'quantity' | 'wasted', value: number) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, [field]: Math.max(0, value) }
                    : item
            )
        )
    }

    const updateUnit = (productId: string, unitName: string) => {
        setProductionItems(items =>
            items.map(item => {
                if (item.productId !== productId) return item
                const unit = item.availableUnits.find(u => u.name === unitName)
                return {
                    ...item,
                    selectedUnit: unitName,
                    conversionFactor: unit?.conversionFactor || 1
                }
            })
        )
    }

    const updateReason = (productId: string, reason: string) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, wasteReason: reason }
                    : item
            )
        )
    }

    const removeItem = (productId: string) => {
        setProductionItems(items => items.filter(item => item.productId !== productId))
    }

    const selectedSection = sections.find(s => s.id === selectedSectionId)

    const handleSave = async () => {
        if (productionItems.length === 0 || !selectedSectionId) return
        setIsSaving(true)

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]

            for (const item of productionItems) {
                // Convert quantity to base unit using conversion factor
                const quantityInBaseUnit = item.quantity * item.conversionFactor
                const wastedInBaseUnit = item.wasted * item.conversionFactor

                // Validate numeric overflow (DECIMAL(10,3) max = 9,999,999.999)
                const MAX_DECIMAL = 9999999.999
                if (quantityInBaseUnit > MAX_DECIMAL || wastedInBaseUnit > MAX_DECIMAL) {
                    throw new Error(`Quantity too large (${quantityInBaseUnit.toLocaleString()}). Maximum: ${MAX_DECIMAL.toLocaleString()}. Use a larger unit.`)
                }

                // Generate production number
                const productionNumber = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

                // Build notes with unit info
                const unitNote = item.selectedUnit !== item.unit
                    ? `Entered: ${item.quantity} ${item.selectedUnit} (= ${quantityInBaseUnit} ${item.unit})`
                    : ''
                const wasteNote = item.wasteReason ? `Waste: ${item.wasteReason}` : ''
                const sectionNote = `Section: ${selectedSection?.name || ''}`
                const notes = [unitNote, wasteNote, sectionNote].filter(Boolean).join('. ')

                const productionData = {
                    production_id: productionNumber,
                    product_id: item.productId,
                    quantity_produced: quantityInBaseUnit,
                    quantity_waste: wastedInBaseUnit,
                    production_date: dateStr,
                    staff_id: user?.id,
                    notes
                }

                const { data: prodRecord, error: prodError } = await supabase
                    .from('production_records')
                    .insert(productionData as never)
                    .select()
                    .single()

                if (prodError) throw prodError

                const { data: productData } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', item.productId)
                    .single()

                const currentStock = productData?.current_stock || 0

                if (quantityInBaseUnit > 0) {
                    const movementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
                    const stockData = {
                        movement_id: movementId,
                        product_id: item.productId,
                        movement_type: 'production_in' as const,
                        quantity: quantityInBaseUnit,
                        stock_before: currentStock,
                        stock_after: currentStock + quantityInBaseUnit,
                        reason: `Production ${selectedSection?.name || ''} - ${dateStr}`,
                        reference_type: 'production',
                        reference_id: prodRecord.id,
                        staff_id: user?.id
                    }

                    const { error: stockError } = await supabase
                        .from('stock_movements')
                        .insert(stockData as never)

                    if (stockError) throw stockError
                }

                if (wastedInBaseUnit > 0) {
                    const wasteMovementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
                    const stockAfterProduction = currentStock + quantityInBaseUnit
                    const wasteData = {
                        movement_id: wasteMovementId,
                        product_id: item.productId,
                        movement_type: 'waste' as const,
                        quantity: wastedInBaseUnit, // Positive value - trigger handles subtraction for 'waste' type
                        stock_before: stockAfterProduction,
                        stock_after: stockAfterProduction - wastedInBaseUnit,
                        reason: item.wasteReason || `Production waste ${dateStr}`,
                        reference_type: 'production',
                        reference_id: prodRecord.id,
                        staff_id: user?.id
                    }

                    const { error: wasteError } = await supabase
                        .from('stock_movements')
                        .insert(wasteData as never)

                    if (wasteError) throw wasteError
                }

                // Note: Stock update is handled automatically by the database trigger 'tr_stock_update'
                // when stock_movements are inserted, so no manual update needed here

                const { data: recipeItems } = await supabase
                    .from('recipes')
                    .select(`
                        id,
                        material_id,
                        quantity,
                        unit,
                        material:products!material_id(id, name, current_stock, cost_price, unit)
                    `)
                    .eq('product_id', item.productId)

                interface RecipeWithMaterial {
                    id: string
                    material_id: string
                    quantity: number
                    unit: string | null
                    material: { id: string; name: string; current_stock: number | null; cost_price: number | null; unit: string | null } | null
                }

                if (recipeItems && recipeItems.length > 0) {
                    for (const recipe of recipeItems as unknown as RecipeWithMaterial[]) {
                        const material = recipe.material
                        if (!material) continue

                        // Use quantity in base unit for recipe deduction
                        const qtyToDeduct = recipe.quantity * quantityInBaseUnit
                        const materialCurrentStock = material.current_stock || 0

                        const materialMovementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
                        const movementData = {
                            movement_id: materialMovementId,
                            product_id: recipe.material_id,
                            movement_type: 'production_out' as const,
                            quantity: qtyToDeduct, // Positive value - trigger handles subtraction for 'production_out' type
                            stock_before: materialCurrentStock,
                            stock_after: materialCurrentStock - qtyToDeduct,
                            reason: `Used for: ${item.name} (x${item.quantity}) - ${dateStr}`,
                            reference_type: 'production',
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        }

                        await supabase
                            .from('stock_movements')
                            .insert(movementData as never)

                        // Note: Material stock update is handled automatically by the database trigger 'tr_stock_update'
                    }
                }
            }

            toast.success('Production recorded')
            setProductionItems([])
            fetchTodayHistory()
        } catch (error) {
            logError('Error saving:', error)
            toast.error('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
                .select('product_id, quantity_produced')
                .eq('id', recordId)
                .single()

            if (record) {
                const rec = record as { product_id: string; quantity_produced: number; quantity_waste?: number }
                const { data: productData } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', rec.product_id)
                    .single()

                const currentStock = productData?.current_stock || 0
                const netChange = rec.quantity_produced - (rec.quantity_waste || 0)

                await supabase
                    .from('products')
                    .update({ current_stock: currentStock - netChange })
                    .eq('id', rec.product_id)
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
            toast.success('Entry and movements deleted')
            fetchTodayHistory()
        } catch (error) {
            toast.error('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
    }

    const totalProduced = todayHistory.reduce((sum, r) => sum + r.quantity_produced, 0)
    const totalWaste = todayHistory.reduce((sum, r) => sum + (r.quantity_waste || 0), 0)

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-smoke)]">
                <div className="w-8 h-8 border-2 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin mb-3" />
                <p className="text-sm">Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Section & Date Selectors */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Section Selector */}
                <div className="lg:col-span-8 bg-[var(--onyx-surface)] p-1 rounded-2xl flex border border-white/5">
                    {sections.length > 0 ? (
                        sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all ${
                                    selectedSectionId === section.id
                                        ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
                                        : 'text-[var(--muted-smoke)] hover:text-white border border-transparent'
                                }`}
                            >
                                {section.name}
                            </button>
                        ))
                    ) : (
                        <div className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-[var(--muted-smoke)] italic">
                            <Layers size={16} />
                            No production section configured
                        </div>
                    )}
                </div>

                {/* Date Selector */}
                <div className="lg:col-span-4 bg-[var(--onyx-surface)] p-1 rounded-2xl flex border border-white/5 items-center px-4">
                    <button
                        onClick={() => navigateDate(-1)}
                        className="text-[var(--muted-smoke)] hover:text-white transition-colors p-1"
                        title="Previous day"
                        aria-label="Previous day"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex-1 text-center">
                        {isToday ? (
                            <span className="text-sm font-semibold text-[var(--color-gold)]">Today</span>
                        ) : (
                            <span className="text-sm font-semibold text-white">{formatDate(selectedDate)}</span>
                        )}
                        <p className="text-[10px] text-[var(--muted-smoke)] uppercase tracking-[0.2em]">
                            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={() => navigateDate(1)}
                        className="text-[var(--muted-smoke)] hover:text-white transition-colors p-1"
                        title="Next day"
                        aria-label="Next day"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {!selectedSectionId ? (
                <div className="text-center py-16 bg-[var(--onyx-surface)] rounded-3xl border-2 border-dashed border-white/5">
                    <Layers size={48} className="mx-auto text-[var(--muted-smoke)]/30 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">Select a section</h3>
                    <p className="text-sm text-[var(--muted-smoke)]">Choose a production section to start</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left -- Production Entry */}
                    <div className="lg:col-span-8">
                        <ProductionForm
                            sectionName={selectedSection?.name || ''}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            filteredProducts={filteredProducts}
                            onAddProduct={addProduct}
                            productionItems={productionItems}
                            onUpdateQuantity={updateQuantity}
                            onUpdateUnit={updateUnit}
                            onUpdateReason={updateReason}
                            onRemoveItem={removeItem}
                            onClear={() => setProductionItems([])}
                            onSave={handleSave}
                            isSaving={isSaving}
                        />
                    </div>

                    {/* Right -- Summary & History */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <ProductionSummary
                            totalProduced={totalProduced}
                            totalWaste={totalWaste}
                        />
                        <ProductionHistory
                            todayHistory={todayHistory}
                            isAdmin={isAdmin}
                            onDeleteRecord={handleDeleteRecord}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
