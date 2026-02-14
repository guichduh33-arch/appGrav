
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Product, Recipe, ProductUOM, Category, Section } from '../../types/database'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../hooks/products'

// Sub-components
import { ProductDetailHeader } from './components/ProductDetailHeader'
import { ProductDetailTabs, type Tab } from './components/ProductDetailTabs'

// Tabs
import { GeneralTab } from './tabs/GeneralTab'
import { UnitsTab } from './tabs/UnitsTab'
import { RecipeTab } from './tabs/RecipeTab'
import { CostingTab } from './tabs/CostingTab'
import { PricesTab } from './tabs/PricesTab'
import { VariantsTab } from './tabs/VariantsTab'
import { logError } from '@/utils/logger'

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<Tab>('general')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Data states
    const [product, setProduct] = useState<Product | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [sections, setSections] = useState<Section[]>([])
    const [productSections, setProductSections] = useState<string[]>([])
    const [primarySectionId, setPrimarySectionId] = useState<string | null>(null)
    const [recipeItems, setRecipeItems] = useState<(Recipe & { material: Product })[]>([])
    const [priceHistory, setPriceHistory] = useState<any[]>([])
    const [uoms, setUoms] = useState<ProductUOM[]>([])

    const [allIngredients, setAllIngredients] = useState<Product[]>([])
    const [showIngredientSearch, setShowIngredientSearch] = useState(false)

    useEffect(() => {
        if (id) fetchProductData()
    }, [id])

    async function fetchProductData() {
        if (!id) return
        setLoading(true)
        try {
            const { data: prod, error: pError } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (pError || !prod) {
                const mockRaw = MOCK_PRODUCTS.find(p => p.id === id)
                if (mockRaw) {
                    const mockIndex = MOCK_PRODUCTS.findIndex(p => p.id === id)
                    const mockProduct = {
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
                        deduct_ingredients: null,
                        deleted_at: null,
                        is_made_to_order: false,
                        section_id: null,
                    } as Product
                    setProduct(mockProduct)
                    setCategories(MOCK_CATEGORIES)
                    setSections([])
                    setRecipeItems([])
                    setUoms([])
                    setAllIngredients(MOCK_PRODUCTS.filter((_, i) => i % 3 === 0).map((p) => ({
                        ...p,
                        description: '',
                        product_type: 'raw_material' as const,
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
                        deduct_ingredients: null,
                    } as Product)))
                    return
                }
                if (pError) throw pError
            }

            setProduct(prod)

            const { data: cats } = await supabase.from('categories').select('*').order('name')
            if (cats) setCategories(cats)

            const { data: sects } = await supabase
                .from('sections')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
            if (sects) setSections(sects)

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

            const { data: recipes, error: rError } = await supabase
                .from('recipes')
                .select('*, material:products!material_id(*)')
                .eq('product_id', id)
            if (rError) throw rError
            setRecipeItems(recipes || [])

            const { data: uomData } = await supabase
                .from('product_uoms')
                .select('*')
                .eq('product_id', id)
            if (uomData) setUoms(uomData as ProductUOM[])

            const { data: ingredients } = await supabase
                .from('products')
                .select('*')
                .eq('product_type', 'raw_material')
                .neq('id', id)
                .order('name')
            if (ingredients) setAllIngredients(ingredients)

            const { data: prices } = await supabase
                .from('purchase_order_items')
                .select('*, purchase_order:purchase_orders(order_date, supplier:suppliers(name))')
                .eq('product_id', id)
                .order('created_at', { ascending: false })
            if (prices) setPriceHistory(prices)

        } catch (error) {
            logError('Error fetching product details:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!product) return
        setSaving(true)
        try {
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
                    deduct_ingredients: product.deduct_ingredients,
                    unit: product.unit
                })
                .eq('id', product.id)

            if (error) throw error

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

            alert('Product updated successfully')
        } catch (error) {
            alert('Error saving product: ' + (error instanceof Error ? error.message : 'Unknown error'))
        } finally {
            setSaving(false)
        }
    }

    async function addUOM() {
        if (!product) return
        const unitName = prompt("Nom de l'unite (ex: Carton):")
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
        } catch (error) {
            alert('Error adding unit: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
    }

    async function deleteUOM(uomId: string) {
        if (!confirm('Are you sure you want to delete this unit?')) return
        try {
            const { error } = await supabase.from('product_uoms').delete().eq('id', uomId)
            if (error) throw error
            setUoms(uoms.filter(u => u.id !== uomId))
        } catch (error) {
            alert('Error deleting unit: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
            setRecipeItems([...recipeItems, data])
            setShowIngredientSearch(false)
        } catch (error) {
            logError('Error adding ingredient:', error)
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
            logError('Error deleting ingredient:', error)
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
            logError('Error updating recipe:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--theme-bg-primary)] flex flex-col items-center justify-center">
                <div className="text-[var(--theme-text-muted)] text-sm uppercase tracking-widest">Loading...</div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[var(--theme-bg-primary)] flex flex-col items-center justify-center p-8">
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl max-w-md w-full flex flex-col items-center p-8">
                    <AlertTriangle size={64} className="mb-6 text-[var(--color-gold)] opacity-80" />
                    <h2 className="text-2xl font-bold mb-2 text-white text-center">Product not found</h2>
                    <p className="mb-8 text-center text-[var(--theme-text-muted)] font-mono text-sm bg-black/40 px-4 py-2 rounded">
                        ID: {id}
                    </p>
                    <button
                        onClick={() => navigate('/inventory')}
                        className="bg-transparent border border-white/10 text-white hover:border-white/20 px-6 py-3 rounded-sm flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to list
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] flex flex-col">
            <ProductDetailHeader product={product} saving={saving} onSave={handleSave} />
            <ProductDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content */}
            <div className="flex-1 p-10 max-w-6xl mx-auto w-full pb-24">
                {activeTab === 'general' && (
                    <GeneralTab
                        product={product}
                        categories={categories}
                        sections={sections}
                        selectedSections={productSections}
                        primarySectionId={primarySectionId}
                        uoms={uoms}
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
                {activeTab === 'variants' && id && (
                    <VariantsTab productId={id} />
                )}
            </div>
        </div>
    )
}
