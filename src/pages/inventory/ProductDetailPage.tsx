
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Save, DollarSign,
    Layers, Settings, Scale, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, Recipe, ProductUOM, Category, Section } from '../../types/database'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../hooks/products'
import './ProductDetailPage.css'

// Tabs
import { GeneralTab } from './tabs/GeneralTab'
import { UnitsTab } from './tabs/UnitsTab'
import { RecipeTab } from './tabs/RecipeTab'
import { CostingTab } from './tabs/CostingTab'
import { PricesTab } from './tabs/PricesTab'

type Tab = 'general' | 'units' | 'recipe' | 'costing' | 'prices'

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
    const [sections, setSections] = useState<Section[]>([])
    const [productSections, setProductSections] = useState<string[]>([]) // Selected section IDs
    const [primarySectionId, setPrimarySectionId] = useState<string | null>(null)
    const [recipeItems, setRecipeItems] = useState<(Recipe & { material: Product })[]>([])
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
                    setSections([])
                    setRecipeItems([])
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

            // 3. Fetch Sections
            const { data: sects } = await supabase.from('sections').select('*').order('name')
            if (sects) setSections(sects)

            // 3b. Fetch Product Sections (many-to-many)
            const { data: prodSects } = await supabase
                .from('product_sections')
                .select('*')
                .eq('product_id', id)
            if (prodSects) {
                const typedSects = prodSects as { section_id: string; is_primary?: boolean }[]
                setProductSections(typedSects.map(ps => ps.section_id))
                const primary = typedSects.find(ps => ps.is_primary)
                setPrimarySectionId(primary?.section_id || (typedSects[0]?.section_id || null))
            }

            // 4. Fetch Recipe
            const { data: recipes, error: rError } = await supabase
                .from('recipes')
                .select('*, material:products!material_id(*)')
                .eq('product_id', id)
            if (rError) throw rError
            setRecipeItems(recipes || [])

            // 5. Fetch UOMs
            const { data: uomData } = await supabase
                .from('product_uoms')
                .select('*')
                .eq('product_id', id)
            if (uomData) setUoms(uomData)

            // 7. Fetch Potential Ingredients
            const { data: ingredients } = await supabase
                .from('products')
                .select('*')
                .eq('product_type', 'raw_material')
                .neq('id', id)
                .order('name')
            if (ingredients) setAllIngredients(ingredients)

            // 8. Fetch Price History (PO Items)
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
            // 1. Update product
            const { error } = await supabase
                .from('products')
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

            // 2. Save product sections (delete existing, insert new)
            await supabase
                .from('product_sections')
                .delete()
                .eq('product_id', product.id)

            if (productSections.length > 0) {
                const sectionsToInsert = productSections.map(sectionId => ({
                    product_id: product.id,
                    section_id: sectionId,
                    is_primary: sectionId === primarySectionId
                }))

                const { error: sectError } = await supabase
                    .from('product_sections')
                    .insert(sectionsToInsert)

                if (sectError) throw sectError
            }

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
                })
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

            const { data, error } = await supabase
                .from('recipes')
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
            await supabase
                .from('recipes')
                .update({ quantity, unit })
                .eq('id', recipeId)
        } catch (error) {
            console.error('Error updating recipe:', error)
        }
    }

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
                <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                    <Settings size={16} /> {t('product_detail.tabs.general')}
                </button>
                <button className={`tab-btn ${activeTab === 'units' ? 'active' : ''}`} onClick={() => setActiveTab('units')}>
                    <Scale size={16} /> {t('product_detail.tabs.units')}
                </button>
                <button className={`tab-btn ${activeTab === 'recipe' ? 'active' : ''}`} onClick={() => setActiveTab('recipe')}>
                    <Layers size={16} /> {t('product_detail.tabs.recipe')}
                </button>
                <button className={`tab-btn ${activeTab === 'costing' ? 'active' : ''}`} onClick={() => setActiveTab('costing')}>
                    <DollarSign size={16} /> {t('product_detail.tabs.costing')}
                </button>
                <button className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>
                    <DollarSign size={16} /> {t('product_detail.tabs.prices')}
                </button>
            </div>

            {/* Content */}
            <div className="detail-content">
                {activeTab === 'general' && (
                    <GeneralTab
                        product={product}
                        categories={categories}
                        sections={sections}
                        selectedSections={productSections}
                        primarySectionId={primarySectionId}
                        onSectionsChange={setProductSections}
                        onPrimarySectionChange={setPrimarySectionId}
                        onChange={setProduct}
                    />
                )}
                {activeTab === 'units' && (
                    <UnitsTab product={product} uoms={uoms} onProductChange={setProduct} onAddUOM={addUOM} onDeleteUOM={deleteUOM} />
                )}
                {activeTab === 'recipe' && (
                    <RecipeTab
                        recipeItems={recipeItems}
                        allIngredients={allIngredients}
                        showIngredientSearch={showIngredientSearch}
                        setShowIngredientSearch={setShowIngredientSearch}
                        onAddIngredient={addIngredient}
                        onRemoveIngredient={removeIngredient}
                        onUpdateQuantity={updateRecipeQuantity}
                        productType={product.product_type ?? undefined}
                    />
                )}
                {activeTab === 'costing' && (
                    <CostingTab product={product} recipeItems={recipeItems} />
                )}
                {activeTab === 'prices' && (
                    <PricesTab product={product} priceHistory={priceHistory} />
                )}
            </div>
        </div>
    )
}
