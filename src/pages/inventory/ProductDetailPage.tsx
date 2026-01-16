
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Save, Trash2, Plus, DollarSign,
    Layers, Clock, Settings, Scale, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, Category, Recipe, StockMovement, ProductUOM } from '../../types/database'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../hooks/useProducts'
import './ProductDetailPage.css'

type Tab = 'general' | 'units' | 'recipe' | 'stock' | 'costing' | 'prices'

export default function ProductDetailPage() {
    const { t } = useTranslation()
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<Tab>('general')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Data states
    const [product, setProduct] = useState<Product | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [recipeItems, setRecipeItems] = useState<(Recipe & { material: Product })[]>([])
    const [stockHistory, setStockHistory] = useState<StockMovement[]>([])
    const [priceHistory, setPriceHistory] = useState<any[]>([])
    const [uoms, setUoms] = useState<ProductUOM[]>([])

    // Derived state for ingredient search
    const [allIngredients, setAllIngredients] = useState<Product[]>([])
    const [showIngredientSearch, setShowIngredientSearch] = useState(false)

    useEffect(() => {
        if (id) fetchProductData()
    }, [id])

    async function fetchProductData() {
        if (!id) return
        setLoading(true)
        try {
            // 1. Fetch Product
            const { data: prod, error: pError } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            // Handle Mock Data Fallback
            if (pError || !prod) {
                const mockRaw = MOCK_PRODUCTS.find(p => p.id === id)
                if (mockRaw) {
                    const mockIndex = MOCK_PRODUCTS.findIndex(p => p.id === id)
                    const mockProduct: Product = {
                        ...mockRaw,
                        description: 'Mock Product Description',
                        product_type: mockIndex % 3 === 0 ? 'raw_material' : (mockIndex % 3 === 1 ? 'finished' : 'semi_finished'),
                        cost_price: 0,
                        wholesale_price: 0,
                        current_stock: 50 - (mockIndex % 20),
                        min_stock_level: 10,
                        unit: 'pcs',
                        pos_visible: true,
                        available_for_sale: true,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                    setProduct(mockProduct)
                    setCategories(MOCK_CATEGORIES)
                    setRecipeItems([])
                    setStockHistory([])
                    setUoms([])
                    setAllIngredients(MOCK_PRODUCTS.filter((_, i) => i % 3 === 0).map((p) => ({
                        ...p,
                        description: '',
                        product_type: 'raw_material',
                        cost_price: 0,
                        wholesale_price: 0,
                        current_stock: 50,
                        min_stock_level: 10,
                        unit: 'pcs',
                        pos_visible: true,
                        available_for_sale: false,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    } as Product)))
                    return
                }
                if (pError) throw pError
            }

            setProduct(prod)

            // 2. Fetch Categories
            const { data: cats } = await supabase.from('categories').select('*').order('name')
            if (cats) setCategories(cats)

            // 3. Fetch Recipe
            const { data: recipes, error: rError } = await (supabase
                .from('recipes') as any)
                .select('*, material:products!material_id(*)')
                .eq('product_id', id)
            if (rError) throw rError
            setRecipeItems(recipes || [])

            // 4. Fetch Stock History (Limit 50)
            const { data: history } = await supabase
                .from('stock_movements')
                .select('*')
                .eq('product_id', id)
                .order('created_at', { ascending: false })
                .limit(50)
            if (history) setStockHistory(history)

            // 5. Fetch UOMs
            const { data: uomData } = await supabase
                .from('product_uoms')
                .select('*')
                .eq('product_id', id)
            if (uomData) setUoms(uomData)

            // 6. Fetch Potential Ingredients
            const { data: ingredients } = await supabase
                .from('products')
                .select('*')
                .eq('product_type', 'raw_material')
                .neq('id', id)
                .order('name')
            if (ingredients) setAllIngredients(ingredients)

            // 7. Fetch Price History (PO Items)
            const { data: prices } = await supabase
                .from('po_items')
                .select('*, purchase_order:purchase_orders(order_date, supplier:suppliers(name))')
                .eq('product_id', id)
                .order('created_at', { ascending: false })
            if (prices) setPriceHistory(prices)

        } catch (error) {
            console.error('Error fetching product details:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!product) return
        setSaving(true)
        try {
            const { error } = await (supabase
                .from('products') as any)
                .update({
                    name: product.name,
                    sku: product.sku,
                    category_id: product.category_id,
                    retail_price: product.retail_price,
                    cost_price: product.cost_price,
                    min_stock_level: product.min_stock_level,
                    description: product.description,
                    pos_visible: product.pos_visible,
                    is_active: product.is_active,
                    unit: product.unit
                })
                .eq('id', product.id)

            if (error) throw error
            alert(t('product_detail.messages.product_updated'))
        } catch (error: any) {
            alert(t('product_detail.messages.save_error') + ' ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    async function addUOM() {
        if (!product) return
        const unitName = prompt("Nom de l'unité (ex: Carton):")
        if (!unitName) return
        const factorStr = prompt(`Combien de ${product.unit} dans 1 ${unitName}?`)
        if (!factorStr) return
        const factor = parseFloat(factorStr)

        try {
            const { data, error } = await supabase
                .from('product_uoms')
                .insert({
                    product_id: product.id,
                    unit_name: unitName,
                    conversion_factor: factor,
                    is_consumption_unit: true
                } as any)
                .select()
                .single()

            if (error) throw error
            if (data) setUoms([...uoms, data])
        } catch (error: any) {
            alert(t('product_detail.messages.uom_add_error') + ' ' + error.message)
        }
    }

    async function deleteUOM(uomId: string) {
        if (!confirm(t('product_detail.messages.delete_uom_confirm'))) return
        try {
            const { error } = await supabase.from('product_uoms').delete().eq('id', uomId)
            if (error) throw error
            setUoms(uoms.filter(u => u.id !== uomId))
        } catch (error: any) {
            alert(t('product_detail.messages.uom_delete_error') + ' ' + error.message)
        }
    }

    async function addIngredient(materialId: string) {
        if (!product) return
        try {
            const material = allIngredients.find(i => i.id === materialId)
            const defaultUnit = material?.unit || 'pcs'

            const { data, error } = await (supabase
                .from('recipes') as any)
                .insert({
                    product_id: product.id,
                    material_id: materialId,
                    quantity: 1,
                    unit: defaultUnit
                })
                .select('*, material:products!material_id(*)')
                .single()

            if (error) throw error
            // @ts-ignore
            setRecipeItems([...recipeItems, data])
            setShowIngredientSearch(false)
        } catch (error) {
            console.error('Error adding ingredient:', error)
        }
    }

    async function removeIngredient(recipeId: string) {
        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', recipeId)

            if (error) throw error
            setRecipeItems(recipeItems.filter(r => r.id !== recipeId))
        } catch (error) {
            console.error('Error deleting ingredient:', error)
        }
    }

    async function updateRecipeQuantity(recipeId: string, quantity: number, unit: string) {
        setRecipeItems(recipeItems.map(r =>
            r.id === recipeId ? { ...r, quantity, unit } : r
        ))

        try {
            await (supabase
                .from('recipes') as any)
                .update({ quantity, unit })
                .eq('id', recipeId)
        } catch (error) {
            console.error('Error updating recipe:', error)
        }
    }

    const calculatedCost = recipeItems.reduce((total, item) => {
        const cost = item.material.cost_price || 0
        return total + (cost * item.quantity)
    }, 0)

    const margin = product?.retail_price
        ? ((product.retail_price - calculatedCost) / product.retail_price) * 100
        : 0

    if (loading) return <div className="product-detail-page flex items-center justify-center text-gray-500 h-screen">{t('common.loading')}</div>

    if (!product) return (
        <div className="product-detail-page flex items-center justify-center p-8">
            <div className="card max-w-md w-full flex flex-col items-center p-8">
                <AlertTriangle size={64} className="mb-6 text-orange-500 opacity-80" />
                <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">{t('product_detail.messages.not_found')}</h2>
                <p className="mb-8 text-center text-gray-500 font-mono text-sm bg-gray-50 px-4 py-2 rounded">
                    ID: {id}
                </p>
                <button
                    onClick={() => navigate('/inventory')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    {t('product_detail.messages.back_to_list')}
                </button>
            </div>
        </div>
    )

    return (
        <div className="product-detail-page">
            {/* Header */}
            <header className="detail-header">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/inventory')} className="btn-icon" title={t('product_detail.back')}>
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">{product.name}</h1>
                        <span className="sku-badge">SKU: {product.sku}</span>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    title={t('product_detail.save_changes')}
                >
                    <Save size={18} />
                    {saving ? t('product_detail.saving') : t('common.save')}
                </button>
            </header>

            {/* Tabs */}
            <div className="detail-tabs">
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Settings size={16} /> {t('product_detail.tabs.general')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'units' ? 'active' : ''}`}
                    onClick={() => setActiveTab('units')}
                >
                    <Scale size={16} /> {t('product_detail.tabs.units')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'recipe' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recipe')}
                >
                    <Layers size={16} /> {t('product_detail.tabs.recipe')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'costing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('costing')}
                >
                    <DollarSign size={16} /> {t('product_detail.tabs.costing')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stock')}
                >
                    <Clock size={16} /> {t('product_detail.tabs.stock')}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prices')}
                >
                    <DollarSign size={16} /> {t('product_detail.tabs.prices')}
                </button>
            </div>

            {/* Content */}
            <div className="detail-content">

                {activeTab === 'general' && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="card">
                            <h3 className="card-title">Identité du Produit</h3>
                            <div className="form-section">
                                <div className="form-group">
                                    <label htmlFor="prod-name">Nom du produit</label>
                                    <input
                                        id="prod-name"
                                        className="form-input"
                                        value={product.name}
                                        onChange={e => setProduct({ ...product, name: e.target.value })}
                                        placeholder="Ex: Baguette Tradition"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="prod-sku">SKU</label>
                                        <input
                                            id="prod-sku"
                                            className="form-input font-mono"
                                            value={product.sku}
                                            onChange={e => setProduct({ ...product, sku: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="prod-cat">Catégorie</label>
                                        <select
                                            id="prod-cat"
                                            className="form-select"
                                            value={product.category_id || ''}
                                            onChange={e => setProduct({ ...product, category_id: e.target.value })}
                                        >
                                            <option value="">Sélectionner...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="prod-desc">Description</label>
                                    <textarea
                                        id="prod-desc"
                                        className="form-textarea"
                                        rows={4}
                                        value={product.description || ''}
                                        onChange={e => setProduct({ ...product, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="card-title">Finance & POS</h3>
                            <div className="form-section">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="prod-price">Prix de Vente</label>
                                        <div className="form-input-prefix">
                                            <span>Rp</span>
                                            <input
                                                id="prod-price"
                                                type="number"
                                                className="form-input"
                                                value={product.retail_price || 0}
                                                onChange={e => setProduct({ ...product, retail_price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="prod-cost">Coût Fixe</label>
                                        <div className="form-input-prefix">
                                            <span>Rp</span>
                                            <input
                                                id="prod-cost"
                                                type="number"
                                                className="form-input"
                                                value={product.cost_price || 0}
                                                onChange={e => setProduct({ ...product, cost_price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                <div className="form-group">
                                    <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded"
                                            checked={product.pos_visible}
                                            onChange={e => setProduct({ ...product, pos_visible: e.target.checked })}
                                        />
                                        <div>
                                            <span className="font-medium text-gray-900">Visible sur le POS</span>
                                            <p className="text-xs text-gray-500 mt-1">Si décoché, le produit ne sera pas proposé aux vendeurs.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'units' && (
                    <div className="card">
                        <div className="card-title">
                            <h3>Gestion des Unités (UOM)</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Définissez ici les unités d'achat ou de consommation (ex: Carton, Pack) et leur relation avec l'unité de base.
                        </p>

                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-blue-900">Unité de Base (Stock)</h4>
                                <p className="text-sm text-blue-700">Toutes les conversions se font par rapport à cette unité.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    value={product.unit}
                                    onChange={e => setProduct({ ...product, unit: e.target.value })}
                                    className="form-input border-blue-300 w-24 text-center font-bold"
                                    title="Unité de base"
                                />
                                <span className="text-xs text-blue-500">(ex: gr, ml, pcs)</span>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Nom de l'Unité</th>
                                        <th>Facteur de Conversion</th>
                                        <th>Explication</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uoms.map(uom => (
                                        <tr key={uom.id}>
                                            <td className="font-medium">{uom.unit_name}</td>
                                            <td className="font-mono text-gray-600">{uom.conversion_factor}</td>
                                            <td className="text-sm text-gray-500">
                                                1 {uom.unit_name} = <b>{uom.conversion_factor}</b> {product.unit}
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => deleteUOM(uom.id)}
                                                    className="p-2 hover:bg-red-50 text-red-500 rounded transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {uoms.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                                Aucune unité alternative définie.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={addUOM}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Plus size={16} /> Ajouter une Unité
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'recipe' && (
                    <div className="card">
                        <div className="card-title">
                            <h3>Ingrédients de la recette</h3>
                            <button
                                className="btn-secondary flex items-center gap-2 text-sm"
                                onClick={() => setShowIngredientSearch(!showIngredientSearch)}
                            >
                                <Plus size={14} /> Ajouter un ingrédient
                            </button>
                        </div>

                        {showIngredientSearch && (
                            <div className="mb-4">
                                <div className="ingredient-picker">
                                    {allIngredients.map(ing => (
                                        <button
                                            key={ing.id}
                                            className="ingredient-btn"
                                            onClick={() => addIngredient(ing.id)}
                                            title={`Ajouter ${ing.name}`}
                                        >
                                            <div className="font-medium">{ing.name}</div>
                                            <div className="text-xs text-gray-500">Stock: {ing.current_stock} {ing.unit}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Matériau</th>
                                        <th>Quantité</th>
                                        <th>Unité</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipeItems.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="font-medium">{item.material.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    Base: {item.material.unit}
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    aria-label="Quantity"
                                                    title="Quantité"
                                                    placeholder="0"
                                                    className="form-input w-24 text-right py-1"
                                                    value={item.quantity}
                                                    step="0.01"
                                                    onChange={e => updateRecipeQuantity(item.id, parseFloat(e.target.value), item.unit || item.material.unit || '')}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input w-20 py-1"
                                                    value={item.unit || ''}
                                                    placeholder={item.material.unit}
                                                    title="Entrez l'unité"
                                                    onChange={e => updateRecipeQuantity(item.id, item.quantity, e.target.value)}
                                                />
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    onClick={() => removeIngredient(item.id)}
                                                    title="Retirer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {recipeItems.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                                Aucun ingrédient. Ajoutez des matières premières pour définir la recette.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'costing' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card lg:col-span-2">
                            <h3 className="card-title">{t('product_detail.costing.detail_title')}</h3>
                            <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200">
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>{t('product_detail.costing.ingredient')}</th>
                                            <th className="text-right">{t('product_detail.costing.qty_used')}</th>
                                            <th>{t('product_detail.recipe.unit')}</th>
                                            <th className="text-right">{t('product_detail.costing.unit_cost')}</th>
                                            <th className="text-right">{t('product_detail.costing.subtotal')}</th>
                                            <th className="text-right">{t('product_detail.costing.pct_of_cost')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recipeItems.map(item => {
                                            const unitCost = item.material.cost_price || 0
                                            const lineCost = unitCost * item.quantity
                                            const percentage = calculatedCost > 0 ? (lineCost / calculatedCost) * 100 : 0
                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="font-medium">{item.material.name}</div>
                                                        <div className="text-xs text-gray-400">{item.material.sku}</div>
                                                    </td>
                                                    <td className="text-right font-mono">{item.quantity}</td>
                                                    <td className="text-gray-600">{item.unit || item.material.unit}</td>
                                                    <td className="text-right text-gray-600">{formattedPrice(unitCost)}</td>
                                                    <td className="text-right font-semibold">{formattedPrice(lineCost)}</td>
                                                    <td className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-16 progress-bar-container">
                                                                <div
                                                                    className="progress-bar-fill bg-blue-500"
                                                                    style={{ '--progress-width': `${Math.min(percentage, 100)}%` } as React.CSSProperties}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {recipeItems.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                                    {t('product_detail.costing.no_ingredients_costing')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {recipeItems.length > 0 && (
                                        <tfoot className="bg-gray-50 font-semibold">
                                            <tr>
                                                <td colSpan={4} className="text-right py-3 pr-4">{t('product_detail.costing.total_material_cost')}</td>
                                                <td className="text-right py-3 pr-4 text-lg">{formattedPrice(calculatedCost)}</td>
                                                <td className="text-right py-3 pr-4 text-gray-500">100%</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="card-title">{t('product_detail.costing.financial_summary')}</h3>
                            <div className="my-4 space-y-3">
                                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                    <span className="text-gray-600">{t('product_detail.costing.material_cost')}</span>
                                    <span className="font-bold">{formattedPrice(calculatedCost)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                    <span className="text-gray-600">{t('product_detail.costing.selling_price')}</span>
                                    <span className="font-bold">{formattedPrice(product.retail_price || 0)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                    <span className="text-gray-600">{t('product_detail.costing.gross_profit')}</span>
                                    <span className={`font-bold ${(product.retail_price || 0) - calculatedCost < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {formattedPrice((product.retail_price || 0) - calculatedCost)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-4 bg-gray-50 px-4 rounded-lg mt-4">
                                    <span className="font-medium">{t('product_detail.costing.gross_margin')}</span>
                                    <span className={`font-bold text-lg ${margin < 30 ? 'text-red-500' : 'text-green-600'}`}>
                                        {margin.toFixed(2)} %
                                    </span>
                                </div>
                            </div>
                            {margin < 0 && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
                                    <AlertTriangle size={16} /> <strong>{t('product_detail.costing.warning_loss')}</strong>
                                </div>
                            )}
                            {margin >= 0 && margin < 30 && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex gap-2">
                                    <AlertTriangle size={16} /> <strong>{t('product_detail.costing.warning_low_margin')}</strong>
                                </div>
                            )}
                        </div>

                        <div className="card">
                            <h3 className="card-title">{t('product_detail.costing.margin_analysis')}</h3>
                            <div className="mt-4">
                                <div className="progress-bar-container h-8">
                                    <div
                                        className={`progress-bar-fill ${margin < 0 ? 'bg-red-500' : margin < 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{ '--progress-width': `${Math.max(0, Math.min(margin, 100))}%` } as React.CSSProperties}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white drop-shadow">
                                        {/* Overlay text logic would need relative parent, skipping purely visual overlay for now */}
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>0%</span>
                                    <span className="text-yellow-600 font-medium">30% ({t('product_detail.costing.threshold')})</span>
                                    <span>100%</span>
                                </div>
                                <div className="text-center mt-2 font-bold text-lg">
                                    {margin.toFixed(1)}%
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{recipeItems.length}</div>
                                    <div className="text-xs text-blue-500 font-medium">{t('product_detail.costing.ingredients_count')}</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="text-xl font-bold text-purple-600">
                                        {recipeItems.length > 0 ? formattedPrice(calculatedCost / recipeItems.length) : '-'}
                                    </div>
                                    <div className="text-xs text-purple-500 font-medium">{t('product_detail.costing.avg_cost_per_ingredient')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="card-title">{t('product_detail.history.title')}</h3>
                            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                <span className="text-blue-700 text-sm">{t('product_detail.history.current_stock')}: </span>
                                <span className="font-bold text-lg text-blue-900 ml-2">{product.current_stock} {product.unit}</span>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>{t('product_detail.history.date')}</th>
                                        <th>{t('product_detail.history.type')}</th>
                                        <th className="text-right">{t('product_detail.history.quantity')}</th>
                                        <th className="pl-6">{t('product_detail.history.reason_ref')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockHistory.map(hist => (
                                        <tr key={hist.id}>
                                            <td className="text-gray-600">
                                                {new Date(hist.created_at).toLocaleDateString()} <br />
                                                <span className="text-xs text-gray-400">{new Date(hist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-1 rounded text-xs uppercase font-semibold ${hist.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {hist.movement_type}
                                                </span>
                                            </td>
                                            <td className={`text-right font-bold ${hist.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {hist.quantity > 0 ? '+' : ''}{hist.quantity}
                                            </td>
                                            <td className="pl-6 text-gray-500 max-w-xs truncate" title={hist.reason || ''}>
                                                {hist.reason || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {stockHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                                Aucun historique de mouvement.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'prices' && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="card-title">{t('product_detail.prices.title')}</h3>
                            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                                <span className="text-green-700 text-sm">{t('product_detail.prices.current_price_est')}: </span>
                                <span className="font-bold text-lg text-green-900 ml-2">{formattedPrice(product.cost_price || 0)}</span>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>{t('product_detail.prices.order_date')}</th>
                                        <th>{t('product_detail.prices.supplier')}</th>
                                        <th className="text-right">{t('inventory.quantity')}</th>
                                        <th className="text-right">{t('product_detail.prices.unit_price')}</th>
                                        <th className="text-right">{t('product_detail.prices.total_line')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priceHistory.map((item, index) => {
                                        const prevItem = priceHistory[index + 1]
                                        const priceDiff = prevItem ? item.unit_price - prevItem.unit_price : 0

                                        return (
                                            <tr key={item.id}>
                                                <td className="text-gray-600">
                                                    {new Date(item.purchase_order?.order_date || item.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="font-medium text-gray-800">
                                                    {item.purchase_order?.supplier?.name || 'Fournisseur Inconnu'}
                                                </td>
                                                <td className="text-right font-mono">
                                                    {item.quantity_ordered} {product.unit}
                                                </td>
                                                <td className="text-right font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {formattedPrice(item.unit_price)}
                                                        {priceDiff !== 0 && (
                                                            <span className={`text-xs ${priceDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                                {priceDiff > 0 ? '▲' : '▼'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-right text-gray-500">
                                                    {formattedPrice(item.total)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {priceHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">
                                                Aucun historique d'achat trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function formattedPrice(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}
