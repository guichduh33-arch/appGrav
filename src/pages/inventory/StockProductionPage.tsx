import { useState, useEffect } from 'react'
import {
    Calendar, ChevronLeft, ChevronRight, Search,
    Trash2, Save, Clock, Package, Lock, Eye, Layers
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Product, Section, ProductionRecord } from '../../types/database'
import { toast } from 'sonner'
import './StockProductionPage.css'

// Format number with thousand separators (French locale uses spaces)
const formatNumber = (num: number): string => {
    return num.toLocaleString('fr-FR')
}

interface AvailableUnit {
    name: string
    conversionFactor: number
    isBase: boolean
}

interface ProductionItem {
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

interface ProductUOM {
    id: string
    unit_name: string
    conversion_factor: number
    is_consumption_unit: boolean
}

interface ProductWithSection extends Product {
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
            console.error('Error fetching sections:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSectionProducts = async () => {
        if (!selectedSectionId) return

        try {
            console.log('📦 [StockProduction] Fetching products for section:', selectedSectionId)

            // First, get all product_sections for this section
            const { data: psData, error: psError } = await supabase
                .from('product_sections')
                .select('product_id')
                .eq('section_id', selectedSectionId)

            console.log('📦 [StockProduction] Product IDs:', psData)

            if (psError) {
                console.error('❌ [StockProduction] Error fetching product_sections:', psError)
                throw psError
            }

            if (!psData || psData.length === 0) {
                console.log('📦 [StockProduction] No products found for this section')
                setSectionProducts([])
                return
            }

            const productIds = psData.map(ps => ps.product_id)
            console.log('📦 [StockProduction] Product IDs to fetch:', productIds.length)

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

            console.log('📦 [StockProduction] Products fetched:', data?.length)
            console.log('📦 [StockProduction] Error:', error)

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

            const products = productsWithUoms as unknown as ProductWithSection[]
            console.log('📦 [StockProduction] Final products:', products.length, products.slice(0, 5).map(p => p.name))

            setSectionProducts(products)
        } catch (error) {
            console.error('❌ [StockProduction] Error fetching section products:', error)
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
            console.error('Error fetching history:', error)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
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

    type RecordWithProduct = { product?: { unit?: string; product_uoms?: ProductUOM[] } };
    const getRecordUnit = (record: RecordWithProduct): string => {
        const product = record.product
        if (!product) return 'pcs'
        const consumptionUom = product.product_uoms?.find((u) => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
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
                    throw new Error(`Quantité trop grande (${quantityInBaseUnit.toLocaleString()}). Maximum: ${MAX_DECIMAL.toLocaleString()}. Utilisez une unité plus grande.`)
                }

                // Generate production number
                const productionNumber = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

                // Build notes with unit info
                const unitNote = item.selectedUnit !== item.unit
                    ? `Saisi: ${item.quantity} ${item.selectedUnit} (= ${quantityInBaseUnit} ${item.unit})`
                    : ''
                const wasteNote = item.wasteReason ? `Perte: ${item.wasteReason}` : ''
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

                if (recipeItems && recipeItems.length > 0) {
                    for (const recipe of recipeItems as any[]) {
                        const material = recipe.material as { id: string; name: string; current_stock: number | null; cost_price: number | null; unit: string | null } | null
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

            toast.success('Production enregistree')
            setProductionItems([])
            fetchTodayHistory()
        } catch (error) {
            console.error('Error saving:', error)
            toast.error('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRecord = async (recordId: string) => {
        if (!isAdmin) return
        if (!confirm('Supprimer cette entree et ses mouvements de stock?')) return

        try {
            const { data: record } = await supabase
                .from('production_records')
                .select('product_id, quantity_produced')
                .eq('id', recordId)
                .single()

            if (record) {
                const rec = record as any
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
            toast.success('Entree et mouvements supprimes')
            fetchTodayHistory()
        } catch (error) {
            toast.error('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
        }
    }

    const totalProduced = todayHistory.reduce((sum, r) => sum + (r as any).quantity_produced, 0)
    const totalWaste = todayHistory.reduce((sum, r) => sum + ((r as any).quantity_waste || 0), 0)

    if (isLoading) {
        return (
            <div className="production-loading">
                <div className="spinner" />
                <p>Chargement...</p>
            </div>
        )
    }

    return (
        <div className="stock-production-page">
            {/* Section & Date Selectors */}
            <div className="production-selectors">
                {/* Section Selector */}
                <div className="selector-card">
                    <div className="selector-header">
                        <Layers size={18} />
                        <span>Section</span>
                    </div>
                    <div className="selector-options">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                className={`selector-btn ${selectedSectionId === section.id ? 'active' : ''}`}
                            >
                                {section.name}
                            </button>
                        ))}
                        {sections.length === 0 && (
                            <p className="no-sections">Aucune section de production configuree</p>
                        )}
                    </div>
                </div>

                {/* Date Selector */}
                <div className="selector-card">
                    <div className="selector-header">
                        <Calendar size={18} />
                        <span>Date</span>
                    </div>
                    <div className="date-nav">
                        <button onClick={() => navigateDate(-1)} className="date-nav-btn" title="Jour précédent" aria-label="Jour précédent">
                            <ChevronLeft size={20} />
                        </button>
                        <div className={`date-display ${isToday ? 'today' : ''}`}>
                            {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
                        </div>
                        <button onClick={() => navigateDate(1)} className="date-nav-btn" title="Jour suivant" aria-label="Jour suivant">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {!selectedSectionId ? (
                <div className="production-empty-state">
                    <Layers size={48} />
                    <h3>Selectionnez une section</h3>
                    <p>Choisissez une section de production pour commencer</p>
                </div>
            ) : (
                <div className="production-content">
                    {/* Left - Production Entry */}
                    <div className="production-entry-card">
                        <h2>Saisie Production - {selectedSection?.name}</h2>

                        {/* Product Search */}
                        <div className="product-search-wrapper">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="product-search-input"
                            />

                            {/* Search Results */}
                            {searchQuery && filteredProducts.length > 0 && (
                                <div className="product-search-dropdown">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addProduct(product)}
                                            className="product-search-item"
                                        >
                                            <div className="product-info">
                                                <div className="product-name">{product.name}</div>
                                                <div className="product-category">{product.category?.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchQuery && filteredProducts.length === 0 && (
                                <div className="product-search-empty">
                                    Aucun produit trouve dans cette section
                                </div>
                            )}
                        </div>

                        {/* Production Items Table */}
                        {productionItems.length > 0 ? (
                            <div className="production-table-wrapper">
                                <table className="production-table">
                                    <thead>
                                        <tr>
                                            <th>Produit</th>
                                            <th className="text-center">Quantite</th>
                                            <th className="text-center">Perte</th>
                                            <th>Note</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productionItems.map(item => (
                                            <tr key={item.productId}>
                                                <td>
                                                    <div className="product-cell">
                                                        <div className="product-name">{item.name}</div>
                                                        <div className="product-category">{item.category}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="quantity-input-group">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.productId, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="qty-input"
                                                            min="0"
                                                            step="0.1"
                                                            placeholder="0"
                                                        />
                                                        {item.availableUnits.length > 1 ? (
                                                            <select
                                                                value={item.selectedUnit}
                                                                onChange={(e) => updateUnit(item.productId, e.target.value)}
                                                                className="unit-select"
                                                                title="Sélectionner l'unité"
                                                                aria-label="Sélectionner l'unité"
                                                            >
                                                                {item.availableUnits.map(u => (
                                                                    <option key={u.name} value={u.name}>
                                                                        {u.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className="unit-label">{item.selectedUnit}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="quantity-input-group waste">
                                                        <input
                                                            type="number"
                                                            value={item.wasted}
                                                            onChange={(e) => updateQuantity(item.productId, 'wasted', parseFloat(e.target.value) || 0)}
                                                            className={`qty-input ${item.wasted > 0 ? 'waste-active' : ''}`}
                                                            min="0"
                                                            step="0.1"
                                                            placeholder="0"
                                                        />
                                                        <span className={`unit-label ${item.wasted > 0 ? 'text-red' : ''}`}>{item.selectedUnit}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {item.wasted > 0 && (
                                                        <input
                                                            type="text"
                                                            placeholder="Raison..."
                                                            value={item.wasteReason}
                                                            onChange={(e) => updateReason(item.productId, e.target.value)}
                                                            className="waste-reason-input"
                                                        />
                                                    )}
                                                </td>
                                                <td>
                                                    <button onClick={() => removeItem(item.productId)} className="btn-remove" title="Supprimer la ligne" aria-label="Supprimer la ligne">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="production-items-empty">
                                <Package size={40} />
                                <p>Aucun produit ajoute</p>
                                <span>Recherchez un produit pour l'ajouter a la production</span>
                            </div>
                        )}

                        {/* Save Button */}
                        {productionItems.length > 0 && (
                            <div className="production-actions">
                                <button
                                    onClick={() => setProductionItems([])}
                                    disabled={isSaving}
                                    className="btn-cancel"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="btn-save"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right - Summary & History */}
                    <div className="production-sidebar">
                        {/* Summary Card */}
                        <div className="summary-card">
                            <h3>Resume du jour</h3>
                            <div className="summary-grid">
                                <div className="summary-item produced">
                                    <div className="summary-value">{formatNumber(totalProduced)}</div>
                                    <div className="summary-label">Produit</div>
                                </div>
                                <div className="summary-item waste">
                                    <div className="summary-value">{formatNumber(totalWaste)}</div>
                                    <div className="summary-label">Perte</div>
                                </div>
                            </div>
                        </div>

                        {/* History Card */}
                        <div className="history-card">
                            <div className="history-header">
                                <h3>Production du jour ({todayHistory.length})</h3>
                                {!isAdmin && (
                                    <div className="read-only-badge">
                                        <Eye size={14} />
                                        Lecture seule
                                    </div>
                                )}
                            </div>

                            <div className="history-list">
                                {todayHistory.length > 0 ? (
                                    todayHistory.map(record => (
                                        <div key={record.id} className="history-item">
                                            <div className="history-item-info">
                                                <div className="history-product">{record.product?.name}</div>
                                                <div className="history-time">
                                                    <Clock size={12} />
                                                    {record.created_at ? new Date(record.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </div>
                                            <div className="history-item-actions">
                                                <span className="badge-produced">
                                                    +{formatNumber(record.quantity_produced)} {getRecordUnit(record as RecordWithProduct)}
                                                </span>
                                                {(record as unknown as { quantity_waste?: number }).quantity_waste && (record as unknown as { quantity_waste: number }).quantity_waste > 0 && (
                                                    <span className="badge-waste">
                                                        -{formatNumber((record as unknown as { quantity_waste: number }).quantity_waste)} {getRecordUnit(record as RecordWithProduct)}
                                                    </span>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteRecord(record.id)}
                                                        className="btn-delete-record"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="history-empty">
                                        <Clock size={32} />
                                        <p>Aucune production enregistree</p>
                                    </div>
                                )}
                            </div>

                            {!isAdmin && todayHistory.length > 0 && (
                                <div className="admin-notice">
                                    <Lock size={16} />
                                    <span>Seul un administrateur peut modifier les entrees</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
