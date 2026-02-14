import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Save, DollarSign, Users, Tag,
    Building2, Crown, UserCheck, Plus
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { saveProductCategoryPrice } from '@/services/products/catalogSyncService'
import type { IOfflineProductCategoryPrice } from '@/types/offline'
import { formatCurrency } from '../../utils/helpers'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'

import CategoryPriceRow from './category-pricing/CategoryPriceRow'

interface Product {
    id: string; name: string; sku: string
    retail_price: number; wholesale_price: number | null
}

interface CustomerCategory {
    id: string; name: string; slug: string; color: string
    price_modifier_type: string; discount_percentage: number | null
}

interface CategoryPrice {
    id?: string; customer_category_id: string; price: number
    is_active: boolean; isNew?: boolean; isModified?: boolean
}

function getCategoryIcon(slug: string) {
    switch (slug) {
        case 'wholesale': return <Building2 size={18} />
        case 'vip': return <Crown size={18} />
        case 'staff': return <UserCheck size={18} />
        default: return <Users size={18} />
    }
}

export default function ProductCategoryPricingPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [product, setProduct] = useState<Product | null>(null)
    const [categories, setCategories] = useState<CustomerCategory[]>([])
    const [categoryPrices, setCategoryPrices] = useState<CategoryPrice[]>([])

    useEffect(() => { if (id) fetchData() }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [productRes, categoriesRes, pricesRes] = await Promise.all([
                supabase.from('products').select('id, name, sku, retail_price, wholesale_price').eq('id', id!).single(),
                supabase.from('customer_categories').select('*').eq('is_active', true).order('name'),
                supabase.from('product_category_prices').select('*').eq('product_id', id!)
            ])
            if (productRes.error) throw productRes.error
            if (productRes.data) setProduct({
                id: productRes.data.id, name: productRes.data.name,
                sku: productRes.data.sku ?? '', retail_price: productRes.data.retail_price ?? 0,
                wholesale_price: productRes.data.wholesale_price ?? null
            })
            if (categoriesRes.data) setCategories(categoriesRes.data)
            if (pricesRes.data) {
                setCategoryPrices(pricesRes.data.map(p => ({
                    id: p.id, customer_category_id: p.customer_category_id,
                    price: p.price, is_active: p.is_active ?? true
                })))
            }
        } catch (error) {
            logError('Error fetching data:', error)
            toast.error('Error during loading')
            navigate('/products')
        } finally { setLoading(false) }
    }

    const getCalculatedPrice = (category: CustomerCategory) => {
        if (!product) return 0
        switch (category.price_modifier_type) {
            case 'wholesale': return product.wholesale_price || product.retail_price
            case 'discount_percentage': return product.retail_price * (1 - (category.discount_percentage || 0) / 100)
            default: return product.retail_price
        }
    }

    const getCategoryPrice = (categoryId: string) => categoryPrices.find(p => p.customer_category_id === categoryId)

    const handlePriceChange = (categoryId: string, price: number) => {
        const existing = categoryPrices.find(p => p.customer_category_id === categoryId)
        if (existing) {
            setCategoryPrices(categoryPrices.map(p => p.customer_category_id === categoryId ? { ...p, price, isModified: true } : p))
        } else {
            setCategoryPrices([...categoryPrices, { customer_category_id: categoryId, price, is_active: true, isNew: true }])
        }
    }

    const handleToggleActive = (categoryId: string) => {
        const existing = categoryPrices.find(p => p.customer_category_id === categoryId)
        if (existing) {
            setCategoryPrices(categoryPrices.map(p => p.customer_category_id === categoryId ? { ...p, is_active: !p.is_active, isModified: true } : p))
        }
    }

    const handleRemovePrice = (categoryId: string) => {
        const existing = categoryPrices.find(p => p.customer_category_id === categoryId)
        if (existing?.isNew) {
            setCategoryPrices(categoryPrices.filter(p => p.customer_category_id !== categoryId))
        } else if (existing?.id) {
            setCategoryPrices(categoryPrices.map(p => p.customer_category_id === categoryId ? { ...p, is_active: false, isModified: true } : p))
        }
    }

    const handleAddCategory = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId)
        if (!category || !product) return
        setCategoryPrices([...categoryPrices, {
            customer_category_id: categoryId, price: getCalculatedPrice(category), is_active: true, isNew: true
        }])
    }

    const handleSave = async () => {
        if (!product) return
        setSaving(true)
        try {
            for (const cp of categoryPrices) {
                if ((cp.isNew && cp.is_active) || cp.isModified) {
                    const priceId = cp.id || crypto.randomUUID()
                    const priceData = {
                        id: priceId, product_id: product.id, customer_category_id: cp.customer_category_id,
                        price: cp.price, is_active: cp.is_active
                    }
                    const result = await saveProductCategoryPrice(priceData as Partial<IOfflineProductCategoryPrice> & { id: string })
                    if (!result.success) throw new Error(result.error)
                }
            }
            toast.success('Prices saved successfully')
            fetchData()
        } catch (error) {
            logError('Error saving prices:', error)
            toast.error('Error during save')
        } finally { setSaving(false) }
    }

    const categoriesWithPrices = categories.filter(c => categoryPrices.some(p => p.customer_category_id === c.id))
    const categoriesWithoutPrices = categories.filter(c => !categoryPrices.some(p => p.customer_category_id === c.id))

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--theme-bg-primary)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-[var(--theme-text-muted)]">
                    <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    if (!product) return null

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-8 max-w-[1200px] mx-auto max-md:p-4">
            <header className="flex justify-between items-start mb-8 gap-4 flex-wrap max-md:flex-col">
                <div className="flex items-start gap-4">
                    <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--onyx-surface)] border border-white/10 text-[var(--theme-text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)]"
                        onClick={() => navigate('/products')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-display font-bold text-white m-0 mb-1">
                            <DollarSign size={28} className="text-[var(--color-gold)]" /> Customer Category Pricing
                        </h1>
                        <p className="flex items-center gap-2 text-[var(--theme-text-secondary)] text-sm m-0">
                            <Tag size={14} /> {product.name}
                            <span className="font-mono text-[var(--theme-text-muted)]">({product.sku})</span>
                        </p>
                    </div>
                </div>
                <button
                    className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-body text-sm font-bold bg-[var(--color-gold)] text-black transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(201,165,92,0.4)] disabled:opacity-50"
                    onClick={handleSave} disabled={saving}
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save'}
                </button>
            </header>

            {/* Reference Prices */}
            <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6 mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)] mb-4">Reference Prices</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                    <div className="flex flex-col p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Retail Price</span>
                        <span className="text-xl font-bold text-[var(--color-gold)] font-mono">{formatCurrency(product.retail_price)}</span>
                    </div>
                    <div className="flex flex-col p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Wholesale Price</span>
                        <span className="text-xl font-bold text-white font-mono">
                            {product.wholesale_price ? formatCurrency(product.wholesale_price) : <span className="text-[var(--theme-text-muted)] italic text-base">Not defined</span>}
                        </span>
                    </div>
                </div>
            </div>

            {/* Category Prices */}
            <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)] mb-2">Pricing by Category</h2>
                <p className="text-[var(--theme-text-secondary)] text-sm mb-6">
                    Define specific prices for each customer category.
                </p>

                {categoriesWithPrices.length > 0 ? (
                    <div className="flex flex-col gap-4 mb-6">
                        {categoriesWithPrices.map(category => {
                            const cp = getCategoryPrice(category.id)
                            if (!cp) return null
                            return (
                                <CategoryPriceRow
                                    key={category.id}
                                    category={category}
                                    price={cp.price}
                                    isActive={cp.is_active}
                                    calculatedPrice={getCalculatedPrice(category)}
                                    onPriceChange={(price) => handlePriceChange(category.id, price)}
                                    onToggleActive={() => handleToggleActive(category.id)}
                                    onRemove={() => handleRemovePrice(category.id)}
                                />
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-12 text-[var(--theme-text-muted)] text-center">
                        <DollarSign size={48} className="opacity-20 mb-4" />
                        <h3 className="text-lg font-display font-semibold text-white mb-1">No custom price</h3>
                        <p className="text-sm">Add specific prices for each customer category</p>
                    </div>
                )}

                {categoriesWithoutPrices.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)] mb-4">
                            <Plus size={14} /> Add a Category
                        </h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                            {categoriesWithoutPrices.map(category => (
                                <button
                                    key={category.id}
                                    className="flex items-center gap-3 p-3 bg-transparent border-2 border-dashed border-white/10 rounded-xl cursor-pointer transition-all text-left hover:border-[var(--color-gold)]/40 hover:bg-white/[0.02] group"
                                    onClick={() => handleAddCategory(category.id)}
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: category.color }}>
                                        {getCategoryIcon(category.slug)}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="font-medium text-white text-sm">{category.name}</span>
                                        <span className="text-xs text-[var(--theme-text-muted)]">Auto price: {formatCurrency(getCalculatedPrice(category))}</span>
                                    </div>
                                    <Plus size={16} className="text-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
