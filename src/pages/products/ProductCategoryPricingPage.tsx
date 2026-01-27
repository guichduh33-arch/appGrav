import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Save, DollarSign, Users, Tag,
    Building2, Crown, UserCheck, Plus, Trash2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './ProductCategoryPricingPage.css'

interface Product {
    id: string
    name: string
    sku: string
    retail_price: number
    wholesale_price: number | null
}

interface CustomerCategory {
    id: string
    name: string
    slug: string
    color: string
    price_modifier_type: string
    discount_percentage: number | null
}

interface CategoryPrice {
    id?: string
    customer_category_id: string
    price: number
    is_active: boolean
    isNew?: boolean
    isModified?: boolean
}

export default function ProductCategoryPricingPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [product, setProduct] = useState<Product | null>(null)
    const [categories, setCategories] = useState<CustomerCategory[]>([])
    const [categoryPrices, setCategoryPrices] = useState<CategoryPrice[]>([])

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [productRes, categoriesRes, pricesRes] = await Promise.all([
                supabase
                    .from('products')
                    .select('id, name, sku, retail_price, wholesale_price')
                    .eq('id', id!)
                    .single(),
                supabase
                    .from('customer_categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('name'),
                supabase
                    .from('product_category_prices')
                    .select('*')
                    .eq('product_id', id!)
            ])

            if (productRes.error) throw productRes.error
            if (productRes.data) setProduct({
                id: productRes.data.id,
                name: productRes.data.name,
                sku: productRes.data.sku ?? '',
                retail_price: productRes.data.retail_price ?? 0,
                wholesale_price: productRes.data.wholesale_price ?? null
            })
            if (categoriesRes.data) setCategories(categoriesRes.data as unknown as CustomerCategory[])

            if (pricesRes.data) {
                setCategoryPrices(pricesRes.data.map(p => ({
                    id: p.id,
                    customer_category_id: p.customer_category_id,
                    price: p.price,
                    is_active: p.is_active ?? true
                })))
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Erreur lors du chargement')
            navigate('/products')
        } finally {
            setLoading(false)
        }
    }

    const getCategoryIcon = (slug: string) => {
        switch (slug) {
            case 'wholesale': return <Building2 size={18} />
            case 'vip': return <Crown size={18} />
            case 'staff': return <UserCheck size={18} />
            default: return <Users size={18} />
        }
    }

    const getCalculatedPrice = (category: CustomerCategory) => {
        if (!product) return 0

        switch (category.price_modifier_type) {
            case 'wholesale':
                return product.wholesale_price || product.retail_price
            case 'discount_percentage':
                return product.retail_price * (1 - (category.discount_percentage || 0) / 100)
            default:
                return product.retail_price
        }
    }

    const getCategoryPrice = (categoryId: string) => {
        return categoryPrices.find(p => p.customer_category_id === categoryId)
    }

    const handlePriceChange = (categoryId: string, price: number) => {
        const existing = categoryPrices.find(p => p.customer_category_id === categoryId)

        if (existing) {
            setCategoryPrices(categoryPrices.map(p =>
                p.customer_category_id === categoryId
                    ? { ...p, price, isModified: true }
                    : p
            ))
        } else {
            setCategoryPrices([
                ...categoryPrices,
                {
                    customer_category_id: categoryId,
                    price,
                    is_active: true,
                    isNew: true
                }
            ])
        }
    }

    const handleToggleActive = (categoryId: string) => {
        const existing = categoryPrices.find(p => p.customer_category_id === categoryId)

        if (existing) {
            setCategoryPrices(categoryPrices.map(p =>
                p.customer_category_id === categoryId
                    ? { ...p, is_active: !p.is_active, isModified: true }
                    : p
            ))
        }
    }

    const handleRemovePrice = (categoryId: string) => {
        const existing = categoryPrices.find(p => p.customer_category_id === categoryId)
        if (existing?.isNew) {
            setCategoryPrices(categoryPrices.filter(p => p.customer_category_id !== categoryId))
        } else if (existing?.id) {
            // Mark for deletion
            setCategoryPrices(categoryPrices.map(p =>
                p.customer_category_id === categoryId
                    ? { ...p, is_active: false, isModified: true }
                    : p
            ))
        }
    }

    const handleAddCategory = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId)
        if (!category || !product) return

        const calculatedPrice = getCalculatedPrice(category)

        setCategoryPrices([
            ...categoryPrices,
            {
                customer_category_id: categoryId,
                price: calculatedPrice,
                is_active: true,
                isNew: true
            }
        ])
    }

    const handleSave = async () => {
        if (!product) return

        setSaving(true)
        try {
            // Process each category price
            for (const cp of categoryPrices) {
                if (cp.isNew && cp.is_active) {
                    // Insert new
                    const { error } = await supabase
                        .from('product_category_prices')
                        .insert({
                            product_id: product.id,
                            customer_category_id: cp.customer_category_id,
                            price: cp.price,
                            is_active: true
                        })
                    if (error) throw error
                } else if (cp.id && cp.isModified) {
                    // Update existing
                    const { error } = await supabase
                        .from('product_category_prices')
                        .update({
                            price: cp.price,
                            is_active: cp.is_active
                        })
                        .eq('id', cp.id)
                    if (error) throw error
                }
            }

            toast.success('Prix enregistrés avec succès')
            fetchData() // Refresh
        } catch (error) {
            console.error('Error saving prices:', error)
            toast.error('Erreur lors de l\'enregistrement')
        } finally {
            setSaving(false)
        }
    }

    const categoriesWithPrices = categories.filter(c =>
        categoryPrices.some(p => p.customer_category_id === c.id)
    )

    const categoriesWithoutPrices = categories.filter(c =>
        !categoryPrices.some(p => p.customer_category_id === c.id)
    )

    if (loading) {
        return (
            <div className="pricing-page">
                <div className="pricing-loading">
                    <div className="spinner"></div>
                    <span>Chargement...</span>
                </div>
            </div>
        )
    }

    if (!product) return null

    return (
        <div className="pricing-page">
            {/* Header */}
            <header className="pricing-header">
                <div className="pricing-header__left">
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/products')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="pricing-header__title">
                            <DollarSign size={28} />
                            Prix par Catégorie Client
                        </h1>
                        <p className="pricing-header__product">
                            <Tag size={14} />
                            {product.name}
                            <span className="sku">({product.sku})</span>
                        </p>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={18} />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </header>

            {/* Reference Prices */}
            <div className="reference-prices">
                <h2>Prix de Référence</h2>
                <div className="reference-grid">
                    <div className="reference-card">
                        <span className="reference-label">Prix Retail</span>
                        <span className="reference-value">{formatCurrency(product.retail_price)}</span>
                    </div>
                    <div className="reference-card">
                        <span className="reference-label">Prix Wholesale</span>
                        <span className="reference-value">
                            {product.wholesale_price
                                ? formatCurrency(product.wholesale_price)
                                : 'Non défini'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Category Prices */}
            <div className="category-prices-section">
                <h2>Prix par Catégorie</h2>
                <p className="section-description">
                    Définissez des prix spécifiques pour chaque catégorie de client.
                    Si aucun prix n'est défini, le système utilisera la logique de la catégorie
                    (prix wholesale, réduction %, etc.)
                </p>

                {categoriesWithPrices.length > 0 ? (
                    <div className="category-prices-list">
                        {categoriesWithPrices.map(category => {
                            const cp = getCategoryPrice(category.id)
                            if (!cp) return null

                            const calculatedPrice = getCalculatedPrice(category)
                            const difference = cp.price - calculatedPrice
                            const percentDiff = ((cp.price - calculatedPrice) / calculatedPrice) * 100

                            return (
                                <div
                                    key={category.id}
                                    className={`category-price-card ${!cp.is_active ? 'inactive' : ''}`}
                                >
                                    <div className="category-price-card__header">
                                        <div
                                            className="category-icon"
                                            style={{ backgroundColor: category.color }}
                                        >
                                            {getCategoryIcon(category.slug)}
                                        </div>
                                        <div className="category-info">
                                            <span className="category-name">{category.name}</span>
                                            <span className="category-type">
                                                {category.price_modifier_type === 'retail' && 'Prix Standard'}
                                                {category.price_modifier_type === 'wholesale' && 'Prix de Gros'}
                                                {category.price_modifier_type === 'discount_percentage' &&
                                                    `${category.discount_percentage}% de réduction`}
                                                {category.price_modifier_type === 'custom' && 'Prix Personnalisé'}
                                            </span>
                                        </div>
                                        <div className="category-actions">
                                            <button
                                                className={`btn-toggle ${cp.is_active ? 'active' : ''}`}
                                                onClick={() => handleToggleActive(category.id)}
                                            >
                                                {cp.is_active ? 'Actif' : 'Inactif'}
                                            </button>
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleRemovePrice(category.id)}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="category-price-card__content">
                                        <div className="price-input-group">
                                            <label>Prix Personnalisé</label>
                                            <div className="price-input">
                                                <span className="currency">Rp</span>
                                                <input
                                                    type="number"
                                                    value={cp.price}
                                                    onChange={(e) => handlePriceChange(category.id, Number(e.target.value))}
                                                    min="0"
                                                    step="1000"
                                                />
                                            </div>
                                        </div>

                                        <div className="price-comparison">
                                            <div className="comparison-item">
                                                <span className="comparison-label">Prix calculé auto:</span>
                                                <span className="comparison-value">{formatCurrency(calculatedPrice)}</span>
                                            </div>
                                            <div className="comparison-item">
                                                <span className="comparison-label">Différence:</span>
                                                <span className={`comparison-value ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}`}>
                                                    {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                                                    <span className="percent">
                                                        ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="no-prices">
                        <DollarSign size={48} />
                        <h3>Aucun prix personnalisé</h3>
                        <p>Ajoutez des prix spécifiques pour chaque catégorie client</p>
                    </div>
                )}

                {/* Add Category */}
                {categoriesWithoutPrices.length > 0 && (
                    <div className="add-category-section">
                        <h3>
                            <Plus size={18} />
                            Ajouter une Catégorie
                        </h3>
                        <div className="available-categories">
                            {categoriesWithoutPrices.map(category => (
                                <button
                                    key={category.id}
                                    className="category-add-btn"
                                    onClick={() => handleAddCategory(category.id)}
                                    style={{ '--category-color': category.color } as React.CSSProperties}
                                >
                                    <div
                                        className="category-add-icon"
                                        style={{ backgroundColor: category.color }}
                                    >
                                        {getCategoryIcon(category.slug)}
                                    </div>
                                    <div className="category-add-info">
                                        <span className="category-add-name">{category.name}</span>
                                        <span className="category-add-price">
                                            Prix auto: {formatCurrency(getCalculatedPrice(category))}
                                        </span>
                                    </div>
                                    <Plus size={16} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
