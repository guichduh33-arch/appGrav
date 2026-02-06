import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Save, Tag, Percent, Gift, ShoppingBag,
    Calendar, Clock, Search, X, Plus, Sparkles, Info
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Product, PromotionType } from '../../types/database'
import { formatCurrency } from '../../utils/helpers'
import { toast } from 'sonner'
import './PromotionFormPage.css'

interface PromotionFormData {
    code: string
    name: string
    description: string
    promotion_type: PromotionType
    discount_percentage: number
    discount_amount: number
    buy_quantity: number
    get_quantity: number
    min_purchase_amount: number
    max_uses_total: number | null
    max_uses_per_customer: number | null
    start_date: string
    end_date: string
    days_of_week: number[]
    time_start: string
    time_end: string
    priority: number
    is_stackable: boolean
    is_active: boolean
}

const PROMOTION_TYPES: { type: PromotionType; label: string; desc: string; icon: typeof Percent }[] = [
    { type: 'percentage', label: 'Discount %', desc: 'Percentage discount', icon: Percent },
    { type: 'fixed_amount', label: 'Fixed amount', desc: 'Discount in Rupiah', icon: Tag },
    { type: 'buy_x_get_y', label: 'Buy X, Get Y', desc: 'Quantity offer', icon: ShoppingBag },
    { type: 'free_product', label: 'Free product', desc: 'Gift with purchase', icon: Gift }
]

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', full: 'Sunday' },
    { value: 1, label: 'Mon', full: 'Monday' },
    { value: 2, label: 'Tue', full: 'Tuesday' },
    { value: 3, label: 'Wed', full: 'Wednesday' },
    { value: 4, label: 'Thu', full: 'Thursday' },
    { value: 5, label: 'Fri', full: 'Friday' },
    { value: 6, label: 'Sat', full: 'Saturday' }
]

const initialFormData: PromotionFormData = {
    code: '',
    name: '',
    description: '',
    promotion_type: 'percentage',
    discount_percentage: 10,
    discount_amount: 0,
    buy_quantity: 2,
    get_quantity: 1,
    min_purchase_amount: 0,
    max_uses_total: null,
    max_uses_per_customer: null,
    start_date: '',
    end_date: '',
    days_of_week: [],
    time_start: '',
    time_end: '',
    priority: 0,
    is_stackable: false,
    is_active: true
}

export default function PromotionFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<PromotionFormData>(initialFormData)
    const [errors, setErrors] = useState<Partial<Record<keyof PromotionFormData, string>>>({})

    // Product selection
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
    const [freeProducts, setFreeProducts] = useState<Product[]>([])
    const [showProductSearch, setShowProductSearch] = useState<'applicable' | 'free' | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
        if (isEditing) {
            fetchPromotion()
        }
    }, [id])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .order('name')

            if (error) throw error
            if (data) setProducts(data)
        } catch (error) {
            toast.error('Error loading products')
        }
    }

    const fetchPromotion = async () => {
        if (!id) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (data) {
                const d = data as any
                setForm({
                    code: d.code || '',
                    name: data.name,
                    description: data.description || '',
                    promotion_type: data.promotion_type as PromotionType,
                    discount_percentage: data.discount_percentage || 0,
                    discount_amount: data.discount_amount || 0,
                    buy_quantity: data.buy_quantity || 2,
                    get_quantity: data.get_quantity || 1,
                    min_purchase_amount: data.min_purchase_amount || 0,
                    max_uses_total: d.max_uses_total || null,
                    max_uses_per_customer: d.max_uses_per_customer || null,
                    start_date: data.start_date || '',
                    end_date: data.end_date || '',
                    days_of_week: data.days_of_week || [],
                    time_start: d.time_start || '',
                    time_end: d.time_end || '',
                    priority: data.priority || 0,
                    is_stackable: d.is_stackable ?? false,
                    is_active: data.is_active ?? true
                })

                // Fetch associated products
                const { data: promoProducts } = await supabase
                    .from('promotion_products')
                    .select('product:products(*)')
                    .eq('promotion_id', id)

                if (promoProducts) {
                    type PromoProductRow = { product: Product | null };
                    const rawData = promoProducts as unknown as PromoProductRow[];
                    setSelectedProducts(rawData.map((pp) => pp.product).filter((p): p is Product => p !== null))
                }

                const { data: promoFreeProducts } = await supabase
                    .from('promotion_free_products')
                    .select('product:products(*)')
                    .eq('promotion_id', id)

                if (promoFreeProducts) {
                    type PromoFreeProductRow = { product: Product | null };
                    const rawFreeData = promoFreeProducts as unknown as PromoFreeProductRow[];
                    setFreeProducts(rawFreeData.map((pp) => pp.product).filter((p): p is Product => p !== null))
                }
            }
        } catch (error) {
            toast.error('Error loading promotion')
        } finally {
            setLoading(false)
        }
    }

    const updateField = useCallback(<K extends keyof PromotionFormData>(
        field: K,
        value: PromotionFormData[K]
    ) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }, [errors])

    const toggleDay = (day: number) => {
        setForm(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day].sort()
        }))
    }

    const addProduct = (product: Product, type: 'applicable' | 'free') => {
        if (type === 'applicable') {
            if (!selectedProducts.find(p => p.id === product.id)) {
                setSelectedProducts(prev => [...prev, product])
            }
        } else {
            if (!freeProducts.find(p => p.id === product.id)) {
                setFreeProducts(prev => [...prev, product])
            }
        }
        setShowProductSearch(null)
        setSearchTerm('')
    }

    const removeProduct = (productId: string, type: 'applicable' | 'free') => {
        if (type === 'applicable') {
            setSelectedProducts(prev => prev.filter(p => p.id !== productId))
        } else {
            setFreeProducts(prev => prev.filter(p => p.id !== productId))
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof PromotionFormData, string>> = {}

        if (!form.code.trim()) newErrors.code = 'Code required'
        if (!form.name.trim()) newErrors.name = 'Name required'

        if (form.promotion_type === 'percentage' && (form.discount_percentage <= 0 || form.discount_percentage > 100)) {
            newErrors.discount_percentage = 'Between 1% and 100%'
        }
        if (form.promotion_type === 'fixed_amount' && form.discount_amount <= 0) {
            newErrors.discount_amount = 'Amount required'
        }
        if (form.promotion_type === 'buy_x_get_y' && (form.buy_quantity < 1 || form.get_quantity < 1)) {
            newErrors.buy_quantity = 'Quantities required'
        }

        if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
            newErrors.end_date = 'End date after start date'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)
        try {
            const promotionData = {
                code: form.code,
                name: form.name,
                description: form.description || null,
                promotion_type: form.promotion_type,
                discount_percentage: form.promotion_type === 'percentage' ? form.discount_percentage : null,
                discount_amount: form.promotion_type === 'fixed_amount' ? form.discount_amount : null,
                buy_quantity: form.promotion_type === 'buy_x_get_y' ? form.buy_quantity : null,
                get_quantity: form.promotion_type === 'buy_x_get_y' ? form.get_quantity : null,
                min_purchase_amount: form.min_purchase_amount || null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                days_of_week: form.days_of_week.length > 0 ? form.days_of_week : null,
                time_start: form.time_start || null,
                time_end: form.time_end || null,
                max_uses_total: form.max_uses_total,
                max_uses_per_customer: form.max_uses_per_customer,
                priority: form.priority,
                is_stackable: form.is_stackable,
                is_active: form.is_active
            }

            let promotionId: string

            if (isEditing) {
                const { error } = await supabase
                    .from('promotions')
                    .update(promotionData as never)
                    .eq('id', id!)

                if (error) throw error
                promotionId = id!

                // Clean up existing relations
                await supabase.from('promotion_products').delete().eq('promotion_id', promotionId)
                await supabase.from('promotion_free_products').delete().eq('promotion_id', promotionId)
            } else {
                const { data, error } = await supabase
                    .from('promotions')
                    .insert(promotionData as never)
                    .select()
                    .single()

                if (error) throw error
                promotionId = data.id
            }

            // Insert product relations
            if (selectedProducts.length > 0) {
                await supabase.from('promotion_products').insert(
                    selectedProducts.map(p => ({
                        promotion_id: promotionId,
                        product_id: p.id
                    })) as any
                )
            }

            if (freeProducts.length > 0) {
                await supabase.from('promotion_free_products').insert(
                    freeProducts.map(p => ({
                        promotion_id: promotionId,
                        product_id: p.id,
                        quantity: 1
                    })) as any
                )
            }

            toast.success(isEditing ? 'Promotion updated' : 'Promotion created')
            navigate('/products/promotions')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error saving promotion')
        } finally {
            setSaving(false)
        }
    }

    const getPreviewValue = (): string => {
        switch (form.promotion_type) {
            case 'percentage':
                return `-${form.discount_percentage}%`
            case 'fixed_amount':
                return `-${formatCurrency(form.discount_amount)}`
            case 'buy_x_get_y':
                return `${form.buy_quantity} + ${form.get_quantity} free`
            case 'free_product':
                return 'Free gift'
            default:
                return ''
        }
    }

    if (loading) {
        return (
            <div className="promo-form-page">
                <div className="promo-loading">
                    <div className="promo-loading-spinner" />
                    <span className="promo-loading-text">Loading promotion...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="promo-form-page">
            {/* Header */}
            <header className="promo-form-header">
                <button
                    type="button"
                    className="btn-back-promo"
                    onClick={() => navigate('/products/promotions')}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <div className="promo-form-title">
                    <h1>
                        <Sparkles size={28} />
                        {isEditing ? 'Edit Promotion' : 'New Promotion'}
                    </h1>
                    <span>Create irresistible offers for your customers</span>
                </div>
            </header>

            {/* Form Container */}
            <div className="promo-form-container">
                <form onSubmit={handleSubmit} className="promo-form">
                    {/* Left Column - Basic Info */}
                    <div className="promo-section">
                        <h2 className="promo-section-title">
                            <Tag size={20} />
                            Basic Information
                        </h2>

                        <div className="promo-field">
                            <label className="promo-label promo-label-required">Promotion code</label>
                            <input
                                type="text"
                                className={`promo-input ${errors.code ? 'error' : ''}`}
                                value={form.code}
                                onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                                placeholder="Ex: CROISSANT20"
                                maxLength={20}
                            />
                            {errors.code && <span className="promo-error-text"><Info size={12} />{errors.code}</span>}
                            <span className="promo-hint">Unique code to apply the promotion</span>
                        </div>

                        <div className="promo-field">
                            <label className="promo-label promo-label-required">Offer Name</label>
                            <input
                                type="text"
                                className={`promo-input ${errors.name ? 'error' : ''}`}
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                placeholder="Ex: Baker's Breakfast Special"
                            />
                            {errors.name && <span className="promo-error-text"><Info size={12} />{errors.name}</span>}
                        </div>

                        <div className="promo-field">
                            <label className="promo-label">Description</label>
                            <textarea
                                className="promo-textarea"
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Describe your promotional offer..."
                                rows={3}
                            />
                        </div>

                        {/* Promotion Type Selection */}
                        <div className="promo-field">
                            <label className="promo-label promo-label-required">Promotion type</label>
                            <div className="promo-type-grid">
                                {PROMOTION_TYPES.map(({ type, label, desc, icon: Icon }) => (
                                    <div
                                        key={type}
                                        className={`promo-type-card ${form.promotion_type === type ? 'selected' : ''}`}
                                        onClick={() => updateField('promotion_type', type)}
                                    >
                                        <div className="promo-type-icon">
                                            <Icon size={24} />
                                        </div>
                                        <div className="promo-type-name">{label}</div>
                                        <div className="promo-type-desc">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Fields based on type */}
                        <div className="promo-conditional">
                            <div className="promo-conditional-title">
                                <Sparkles size={16} />
                                Discount settings
                            </div>

                            {form.promotion_type === 'percentage' && (
                                <div className="promo-field">
                                    <label className="promo-label promo-label-required">Discount percentage</label>
                                    <input
                                        type="number"
                                        className={`promo-input ${errors.discount_percentage ? 'error' : ''}`}
                                        value={form.discount_percentage}
                                        onChange={(e) => updateField('discount_percentage', Number(e.target.value))}
                                        min={1}
                                        max={100}
                                    />
                                    {errors.discount_percentage && (
                                        <span className="promo-error-text"><Info size={12} />{errors.discount_percentage}</span>
                                    )}
                                </div>
                            )}

                            {form.promotion_type === 'fixed_amount' && (
                                <div className="promo-field">
                                    <label className="promo-label promo-label-required">Discount amount (IDR)</label>
                                    <input
                                        type="number"
                                        className={`promo-input ${errors.discount_amount ? 'error' : ''}`}
                                        value={form.discount_amount}
                                        onChange={(e) => updateField('discount_amount', Number(e.target.value))}
                                        min={0}
                                        step={1000}
                                    />
                                    {errors.discount_amount && (
                                        <span className="promo-error-text"><Info size={12} />{errors.discount_amount}</span>
                                    )}
                                </div>
                            )}

                            {form.promotion_type === 'buy_x_get_y' && (
                                <div className="promo-row">
                                    <div className="promo-field">
                                        <label className="promo-label promo-label-required">Buy (X)</label>
                                        <input
                                            type="number"
                                            className={`promo-input ${errors.buy_quantity ? 'error' : ''}`}
                                            value={form.buy_quantity}
                                            onChange={(e) => updateField('buy_quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="promo-field">
                                        <label className="promo-label promo-label-required">Get free (Y)</label>
                                        <input
                                            type="number"
                                            className="promo-input"
                                            value={form.get_quantity}
                                            onChange={(e) => updateField('get_quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                </div>
                            )}

                            {form.promotion_type === 'free_product' && (
                                <div className="promo-products-panel">
                                    <div className="promo-products-header">
                                        <div>
                                            <div className="promo-products-title">Free products</div>
                                            <div className="promo-products-subtitle">Select gifts</div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-add-product"
                                            onClick={() => setShowProductSearch('free')}
                                        >
                                            <Plus size={16} />
                                            Add
                                        </button>
                                    </div>

                                    {showProductSearch === 'free' && (
                                        <div className="promo-product-search">
                                            <div className="promo-search-input-wrap">
                                                <Search size={18} />
                                                <input
                                                    type="text"
                                                    className="promo-search-input"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search for a product..."
                                                    autoFocus
                                                />
                                            </div>
                                            {searchTerm && (
                                                <div className="promo-search-results">
                                                    {filteredProducts.slice(0, 8).map(product => (
                                                        <div
                                                            key={product.id}
                                                            className="promo-search-item"
                                                            onClick={() => addProduct(product, 'free')}
                                                        >
                                                            <div>
                                                                <div className="promo-search-item-name">{product.name}</div>
                                                                <div className="promo-search-item-sku">{product.sku}</div>
                                                            </div>
                                                            <div className="promo-search-item-price">
                                                                {formatCurrency(product.retail_price || 0)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="promo-selected-products">
                                        {freeProducts.length === 0 ? (
                                            <div className="promo-no-products">
                                                No free product selected
                                            </div>
                                        ) : (
                                            freeProducts.map(product => (
                                                <div key={product.id} className="promo-selected-item">
                                                    <div className="promo-selected-item-info">
                                                        <div className="promo-selected-item-name">{product.name}</div>
                                                        <div className="promo-selected-item-sku">{product.sku}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-remove-product"
                                                        onClick={() => removeProduct(product.id, 'free')}
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Constraints & Limits */}
                    <div className="promo-section">
                        <h2 className="promo-section-title">
                            <Calendar size={20} />
                            Time Constraints
                        </h2>

                        <div className="promo-row">
                            <div className="promo-field">
                                <label className="promo-label">Start date</label>
                                <input
                                    type="date"
                                    className="promo-input"
                                    value={form.start_date}
                                    onChange={(e) => updateField('start_date', e.target.value)}
                                />
                            </div>
                            <div className="promo-field">
                                <label className="promo-label">End date</label>
                                <input
                                    type="date"
                                    className={`promo-input ${errors.end_date ? 'error' : ''}`}
                                    value={form.end_date}
                                    onChange={(e) => updateField('end_date', e.target.value)}
                                />
                                {errors.end_date && (
                                    <span className="promo-error-text"><Info size={12} />{errors.end_date}</span>
                                )}
                            </div>
                        </div>

                        <div className="promo-field">
                            <label className="promo-label">Days of the week</label>
                            <div className="promo-days-grid">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        className={`promo-day-btn ${form.days_of_week.includes(day.value) ? 'active' : ''}`}
                                        onClick={() => toggleDay(day.value)}
                                        title={day.full}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            <span className="promo-hint">Leave blank for all days</span>
                        </div>

                        <div className="promo-row">
                            <div className="promo-field">
                                <label className="promo-label">Start time</label>
                                <input
                                    type="time"
                                    className="promo-input"
                                    value={form.time_start}
                                    onChange={(e) => updateField('time_start', e.target.value)}
                                />
                            </div>
                            <div className="promo-field">
                                <label className="promo-label">End time</label>
                                <input
                                    type="time"
                                    className="promo-input"
                                    value={form.time_end}
                                    onChange={(e) => updateField('time_end', e.target.value)}
                                />
                            </div>
                        </div>

                        <h2 className="promo-section-title" style={{ marginTop: '2rem' }}>
                            <Clock size={20} />
                            Usage Limits
                        </h2>

                        <div className="promo-field">
                            <label className="promo-label">Minimum purchase (IDR)</label>
                            <input
                                type="number"
                                className="promo-input"
                                value={form.min_purchase_amount}
                                onChange={(e) => updateField('min_purchase_amount', Number(e.target.value))}
                                min={0}
                                step={1000}
                            />
                        </div>

                        <div className="promo-row">
                            <div className="promo-field">
                                <label className="promo-label">Max uses (total)</label>
                                <input
                                    type="number"
                                    className="promo-input"
                                    value={form.max_uses_total || ''}
                                    onChange={(e) => updateField('max_uses_total', e.target.value ? Number(e.target.value) : null)}
                                    min={0}
                                    placeholder="Unlimited"
                                />
                            </div>
                            <div className="promo-field">
                                <label className="promo-label">Max per customer</label>
                                <input
                                    type="number"
                                    className="promo-input"
                                    value={form.max_uses_per_customer || ''}
                                    onChange={(e) => updateField('max_uses_per_customer', e.target.value ? Number(e.target.value) : null)}
                                    min={0}
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>

                        <div className="promo-field">
                            <label className="promo-label">Priority</label>
                            <input
                                type="number"
                                className="promo-input"
                                value={form.priority}
                                onChange={(e) => updateField('priority', Number(e.target.value))}
                                min={0}
                            />
                            <span className="promo-hint">Higher priority promotions apply first</span>
                        </div>

                        {/* Toggles */}
                        <div
                            className={`promo-toggle ${form.is_stackable ? 'active' : ''}`}
                            onClick={() => updateField('is_stackable', !form.is_stackable)}
                        >
                            <div className="promo-toggle-track">
                                <div className="promo-toggle-thumb" />
                            </div>
                            <div>
                                <div className="promo-toggle-label">Stackable</div>
                                <div className="promo-toggle-desc">Can be combined with other promotions</div>
                            </div>
                        </div>

                        <div
                            className={`promo-toggle ${form.is_active ? 'active' : ''}`}
                            onClick={() => updateField('is_active', !form.is_active)}
                        >
                            <div className="promo-toggle-track">
                                <div className="promo-toggle-thumb" />
                            </div>
                            <div>
                                <div className="promo-toggle-label">Active</div>
                                <div className="promo-toggle-desc">Promotion is available for customers</div>
                            </div>
                        </div>

                        {/* Applicable Products */}
                        <div className="promo-products-panel" style={{ marginTop: '1.5rem' }}>
                            <div className="promo-products-header">
                                <div>
                                    <div className="promo-products-title">Applicable products</div>
                                    <div className="promo-products-subtitle">Leave blank for all products</div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-add-product"
                                    onClick={() => setShowProductSearch('applicable')}
                                >
                                    <Plus size={16} />
                                    Add
                                </button>
                            </div>

                            {showProductSearch === 'applicable' && (
                                <div className="promo-product-search">
                                    <div className="promo-search-input-wrap">
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            className="promo-search-input"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search for a product..."
                                            autoFocus
                                        />
                                    </div>
                                    {searchTerm && (
                                        <div className="promo-search-results">
                                            {filteredProducts.slice(0, 8).map(product => (
                                                <div
                                                    key={product.id}
                                                    className="promo-search-item"
                                                    onClick={() => addProduct(product, 'applicable')}
                                                >
                                                    <div>
                                                        <div className="promo-search-item-name">{product.name}</div>
                                                        <div className="promo-search-item-sku">{product.sku}</div>
                                                    </div>
                                                    <div className="promo-search-item-price">
                                                        {formatCurrency(product.retail_price || 0)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="promo-selected-products">
                                {selectedProducts.length === 0 ? (
                                    <div className="promo-no-products">
                                        All products are eligible
                                    </div>
                                ) : (
                                    selectedProducts.map(product => (
                                        <div key={product.id} className="promo-selected-item">
                                            <div className="promo-selected-item-info">
                                                <div className="promo-selected-item-name">{product.name}</div>
                                                <div className="promo-selected-item-sku">{product.sku}</div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-remove-product"
                                                onClick={() => removeProduct(product.id, 'applicable')}
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {form.name && (
                        <div className="promo-preview-section promo-section">
                            <div className="promo-preview-card">
                                <div className="promo-preview-badge">{form.code || 'CODE'}</div>
                                <div className="promo-preview-value">{getPreviewValue()}</div>
                                <div className="promo-preview-desc">{form.name}</div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="promo-form-actions">
                        <button
                            type="button"
                            className="btn-promo-secondary"
                            onClick={() => navigate('/products/promotions')}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-promo-primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="promo-spinner-sm" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    {isEditing ? 'Update' : 'Create Promotion'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
