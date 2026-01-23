import { useState, useEffect } from 'react'
import {
    Factory, Calendar, ChevronLeft, ChevronRight, Search, Plus, Minus,
    Trash2, Save, Clock, Package, Lock, Eye, Layers
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Product, Section, ProductionRecord } from '../../types/database'
import toast from 'react-hot-toast'

interface ProductionItem {
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

interface ProductWithSection extends Product {
    category?: { name: string; icon: string }
    product_uoms?: ProductUOM[]
}

const ProductionPage = () => {
    const { user } = useAuthStore()
    const isAdmin = user?.role === 'admin' || user?.role === 'manager'

    // State
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [sections, setSections] = useState<Section[]>([])
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [sectionProducts, setSectionProducts] = useState<ProductWithSection[]>([])
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([])
    const [todayHistory, setTodayHistory] = useState<(ProductionRecord & { product?: Product })[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [_isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    void _isLoading // Used for loading state tracking

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
                .eq('is_production_point', true)
                .order('name')

            if (error) throw error
            setSections(data || [])

            // Auto-select first section
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
            // Get products linked to this section via product_sections
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
                        name,
                        sku,
                        unit,
                        product_uoms(id, unit_name, is_consumption_unit)
                    )
                `)
                .eq('section_id', selectedSectionId)
                .eq('production_date', dateStr)
                .order('created_at', { ascending: false })

            if (error) throw error
            setTodayHistory(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
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

    // Filter products by search
    const filteredProducts = sectionProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !productionItems.find(item => item.productId === p.id)
    )

    // Get the appropriate unit for production (consumption unit if available)
    const getProductionUnit = (product: ProductWithSection): string => {
        const consumptionUom = product.product_uoms?.find(u => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
    }

    // Get unit from history record
    const getRecordUnit = (record: any): string => {
        const product = record.product
        if (!product) return 'pcs'
        const consumptionUom = product.product_uoms?.find((u: any) => u.is_consumption_unit)
        return consumptionUom?.unit_name || product.unit || 'pcs'
    }

    const addProduct = (product: ProductWithSection) => {
        setProductionItems([...productionItems, {
            productId: product.id,
            name: product.name,
            category: product.category?.name || 'General',
            icon: product.category?.icon || '📦',
            unit: getProductionUnit(product),
            quantity: 1,
            wasted: 0,
            wasteReason: ''
        }])
        setSearchQuery('')
    }

    const updateQuantity = (productId: string, field: 'quantity' | 'wasted', delta: number) => {
        setProductionItems(items =>
            items.map(item =>
                item.productId === productId
                    ? { ...item, [field]: Math.max(0, item[field] + delta) }
                    : item
            )
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

    const handleSave = async () => {
        if (productionItems.length === 0 || !selectedSectionId) return
        setIsSaving(true)

        try {
            const dateStr = selectedDate.toISOString().split('T')[0]

            for (const item of productionItems) {
                // 1. Insert production record
                const { data: prodRecord, error: prodError } = await supabase
                    .from('production_records')
                    .insert({
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

                // 2. Get current stock of produced item
                const { data: productData } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', item.productId)
                    .single()

                const currentStock = productData?.current_stock || 0
                const netChange = item.quantity - item.wasted

                // 3. Create stock movement for production_in (positive)
                if (item.quantity > 0) {
                    const { error: stockError } = await supabase
                        .from('stock_movements')
                        .insert({
                            product_id: item.productId,
                            movement_type: 'production_in',
                            quantity: item.quantity,
                            reason: `Production ${selectedSection?.name || ''} - ${dateStr}`,
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        })

                    if (stockError) throw stockError
                }

                // 4. Create stock movement for waste (negative)
                if (item.wasted > 0) {
                    const { error: wasteError } = await supabase
                        .from('stock_movements')
                        .insert({
                            product_id: item.productId,
                            movement_type: 'waste',
                            quantity: -item.wasted,
                            reason: item.wasteReason || `Production waste ${dateStr}`,
                            reference_id: prodRecord.id,
                            staff_id: user?.id
                        })

                    if (wasteError) throw wasteError
                }

                // 5. Update product current_stock
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ current_stock: currentStock + netChange })
                    .eq('id', item.productId)

                if (updateError) throw updateError

                // 6. Deduct recipe ingredients from stock
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
                    .eq('is_active', true)

                if (recipeItems && recipeItems.length > 0) {
                    for (const recipe of recipeItems) {
                        const material = recipe.material as { id: string; name: string; current_stock: number; cost_price: number; unit: string } | null
                        if (!material) continue

                        // Calculate quantity to deduct (recipe qty per unit × production qty)
                        const qtyToDeduct = recipe.quantity * item.quantity
                        const materialCurrentStock = material.current_stock || 0

                        // Create stock movement for production_out (negative)
                        await supabase
                            .from('stock_movements')
                            .insert({
                                product_id: recipe.material_id,
                                movement_type: 'production_out',
                                quantity: -qtyToDeduct,
                                reason: `Used for: ${item.name} (×${item.quantity}) - ${dateStr}`,
                                reference_id: prodRecord.id,
                                staff_id: user?.id
                            })

                        // Update ingredient current_stock
                        await supabase
                            .from('products')
                            .update({ current_stock: materialCurrentStock - qtyToDeduct })
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
            // 1. Get the production record to know quantities
            const { data: record } = await supabase
                .from('production_records')
                .select('product_id, quantity_produced, quantity_waste')
                .eq('id', recordId)
                .single()

            if (record) {
                // 2. Get current stock
                const { data: productData } = await supabase
                    .from('products')
                    .select('current_stock')
                    .eq('id', record.product_id)
                    .single()

                const currentStock = productData?.current_stock || 0
                const netChange = record.quantity_produced - (record.quantity_waste || 0)

                // 3. Reverse the stock change
                await supabase
                    .from('products')
                    .update({ current_stock: currentStock - netChange })
                    .eq('id', record.product_id)
            }

            // 4. Delete associated stock movements
            await supabase
                .from('stock_movements')
                .delete()
                .eq('reference_id', recordId)

            // 5. Delete production record
            const { error } = await supabase
                .from('production_records')
                .delete()
                .eq('id', recordId)

            if (error) throw error
            toast.success('Entry and movements deleted')
            fetchTodayHistory()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        }
    }

    const selectedSection = sections.find(s => s.id === selectedSectionId)
    const totalProduced = todayHistory.reduce((sum, r) => sum + r.quantity_produced, 0)
    const totalWaste = todayHistory.reduce((sum, r) => sum + (r.quantity_waste || 0), 0)

    return (
        <div className="p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                        <Factory size={24} color="white" />
                    </div>
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-gray-800">
                            Production
                        </h1>
                        <p className="m-0 text-gray-500 text-sm">
                            Saisie de production par section
                        </p>
                    </div>
                </div>
            </div>

            {/* Section & Date Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Section Selector */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Layers size={18} className="text-amber-500" />
                        <span className="font-semibold text-gray-700 text-sm">Section</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${selectedSectionId === section.id
                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {section.name}
                            </button>
                        ))}
                        {sections.length === 0 && (
                            <p className="text-gray-400 text-sm italic">
                                Aucune section de production configurée
                            </p>
                        )}
                    </div>
                </div>

                {/* Date Selector */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar size={18} className="text-blue-500" />
                        <span className="font-semibold text-gray-700 text-sm">Date</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateDate(-1)}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                            title="Jour précédent"
                            aria-label="Jour précédent"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className={`flex-1 text-center py-2.5 px-4 rounded-lg font-semibold capitalize ${isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {isToday ? "Aujourd'hui" : formatDate(selectedDate)}
                        </div>
                        <button
                            onClick={() => navigateDate(1)}
                            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                            title="Jour suivant"
                            aria-label="Jour suivant"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {!selectedSectionId ? (
                <div className="text-center p-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Layers size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="m-0 text-gray-600 font-medium">Sélectionnez une section</h3>
                    <p className="text-gray-400 mt-2 text-sm">
                        Choisissez une section de production pour commencer
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                    {/* Left - Production Entry */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h2 className="m-0 mb-4 text-lg font-semibold text-gray-800">
                            Saisie Production - {selectedSection?.name}
                        </h2>

                        {/* Product Search */}
                        <div className="relative mb-6">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit à produire..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:border-amber-500 focus:outline-none transition-colors"
                            />

                            {/* Search Results */}
                            {searchQuery && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 shadow-xl z-20 max-h-[300px] overflow-auto">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addProduct(product)}
                                            className="w-full px-4 py-3 flex items-center gap-3 border-none bg-transparent hover:bg-gray-50 cursor-pointer text-left border-b border-gray-100 last:border-0"
                                            title={`Ajouter ${product.name}`}
                                        >
                                            <span className="text-xl">{product.category?.icon || '📦'}</span>
                                            <div>
                                                <div className="font-semibold text-gray-800">{product.name}</div>
                                                <div className="text-xs text-gray-400">{product.category?.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {searchQuery && filteredProducts.length === 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 p-4 text-center text-gray-400 z-10 shadow-lg">
                                    Aucun produit trouvé dans cette section
                                </div>
                            )}
                        </div>

                        {/* Production Items Table */}
                        {productionItems.length > 0 ? (
                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantité</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Perte</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                                            <th className="w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {productionItems.map(item => (
                                            <tr key={item.productId} className="hover:bg-gray-50/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{item.icon}</span>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">{item.name}</div>
                                                            <div className="text-xs text-gray-400">{item.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, 'quantity', -1)}
                                                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                            title="Diminuer"
                                                            aria-label="Diminuer Quantité"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="text-center min-w-[3rem]">
                                                            <span className="block font-bold text-lg text-gray-800 leading-none">{item.quantity}</span>
                                                            <span className="text-[10px] text-gray-500 font-medium uppercase">{item.unit}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, 'quantity', 1)}
                                                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                                            title="Augmenter"
                                                            aria-label="Augmenter Quantité"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, 'wasted', -1)}
                                                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                                            title="Diminuer Perte"
                                                            aria-label="Diminuer Perte"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <div className="text-center min-w-[3rem]">
                                                            <span className={`block font-bold text-lg leading-none ${item.wasted > 0 ? 'text-red-600' : 'text-gray-300'}`}>{item.wasted}</span>
                                                            {item.wasted > 0 && <span className="text-[10px] text-red-500 font-medium uppercase">{item.unit}</span>}
                                                        </div>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, 'wasted', 1)}
                                                            className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                                            title="Augmenter Perte"
                                                            aria-label="Augmenter Perte"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {item.wasted > 0 && (
                                                        <input
                                                            type="text"
                                                            placeholder="Raison..."
                                                            value={item.wasteReason}
                                                            onChange={(e) => updateReason(item.productId, e.target.value)}
                                                            className="w-full px-2 py-1.5 border border-red-200 rounded text-sm text-gray-700 bg-red-50/30 focus:border-red-400 focus:outline-none placeholder-red-200"
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => removeItem(item.productId)}
                                                        className="p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Supprimer la ligne"
                                                        aria-label="Supprimer la ligne"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Package size={40} className="mx-auto mb-3 text-gray-300" />
                                <p className="m-0 text-gray-500 font-medium">Aucun produit ajouté</p>
                                <p className="mt-1 text-sm text-gray-400">
                                    Recherchez un produit pour l'ajouter à la production
                                </p>
                            </div>
                        )}

                        {/* Save Button */}
                        {productionItems.length > 0 && (
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setProductionItems([])}
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right - Summary & History */}
                    <div className="flex flex-col gap-4">
                        {/* Summary Card */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                            <h3 className="m-0 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Résumé du jour
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                                    <div className="text-2xl font-bold text-emerald-600">{totalProduced}</div>
                                    <div className="text-xs font-semibold text-emerald-700 uppercase mt-1">Produit</div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl text-center border border-red-100">
                                    <div className="text-2xl font-bold text-red-600">{totalWaste}</div>
                                    <div className="text-xs font-semibold text-red-700 uppercase mt-1">Perte</div>
                                </div>
                            </div>
                        </div>

                        {/* History Card */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="m-0 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Historique ({todayHistory.length})
                                </h3>
                                {!isAdmin && (
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Eye size={14} />
                                        Lecture seule
                                    </div>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-auto pr-1">
                                {todayHistory.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {todayHistory.map(record => (
                                            <div
                                                key={record.id}
                                                className="p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100 hover:border-gray-200 transition-colors"
                                            >
                                                <div>
                                                    <div className="font-semibold text-gray-800 text-sm">
                                                        {(record.product as { name: string } | null)?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock size={12} />
                                                        {new Date(record.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                                                        +{record.quantity_produced} {getRecordUnit(record)}
                                                    </span>
                                                    {record.quantity_waste > 0 && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                                                            -{record.quantity_waste} {getRecordUnit(record)}
                                                        </span>
                                                    )}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteRecord(record.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            title="Supprimer"
                                                            aria-label="Supprimer cette entrée"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="m-0 text-sm">Aucune production enregistrée</p>
                                    </div>
                                )}
                            </div>

                            {!isAdmin && todayHistory.length > 0 && (
                                <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-center gap-2 border border-amber-100">
                                    <Lock size={16} className="text-amber-600" />
                                    <span className="text-xs text-amber-800 font-medium">
                                        Seul un administrateur peut modifier les entrées
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductionPage
