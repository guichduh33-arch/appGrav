/**
 * Product Form Page
 * Epic 10: Story 10.9
 *
 * Create and edit products with full form
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Save, Package, DollarSign, Warehouse,
    Tag, Image as ImageIcon, Upload, X, FileText
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { saveProduct } from '@/services/products/catalogSyncService'
import type { IOfflineProduct } from '@/types/offline'
import { formatCurrency } from '@/utils/helpers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

interface Category {
    id: string
    name: string
}

interface ProductForm {
    sku: string
    name: string
    description: string
    category_id: string
    product_type: 'finished' | 'semi_finished' | 'raw_material'
    unit: string
    cost_price: number
    sale_price: number
    retail_price: number
    wholesale_price: number
    min_stock_level: number
    stock_quantity: number
    pos_visible: boolean
    is_active: boolean
    deduct_ingredients: boolean
    image_url: string
}

const PRODUCT_TYPES = [
    { value: 'finished', label: 'Finished product', description: 'Product sold as is' },
    { value: 'semi_finished', label: 'Semi-finished', description: 'Intermediate product' },
    { value: 'raw_material', label: 'Raw material', description: 'Basic ingredient' }
]

const UNITS = [
    'piece', 'kg', 'g', 'L', 'mL', 'unit', 'portion', 'box', 'pouch'
]

export default function ProductFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])

    const [form, setForm] = useState<ProductForm>({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        product_type: 'finished',
        unit: 'piece',
        cost_price: 0,
        sale_price: 0,
        retail_price: 0,
        wholesale_price: 0,
        min_stock_level: 0,
        stock_quantity: 0,
        pos_visible: true,
        is_active: true,
        deduct_ingredients: false,
        image_url: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            // Load categories
            const { data: cats } = await supabase
                .from('categories')
                .select('id, name')
                .order('name')

            if (cats) setCategories(cats)

            // Load product if editing
            if (id) {
                const { data: product, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                if (product) {
                    setForm({
                        sku: product.sku || '',
                        name: product.name || '',
                        description: product.description || '',
                        category_id: product.category_id || '',
                        product_type: product.product_type || 'finished',
                        unit: product.unit || 'piece',
                        cost_price: product.cost_price || 0,
                        sale_price: product.retail_price || 0,
                        retail_price: product.retail_price || 0,
                        wholesale_price: product.wholesale_price || 0,
                        min_stock_level: product.min_stock_level || 0,
                        stock_quantity: product.current_stock || 0,
                        pos_visible: product.pos_visible !== false,
                        is_active: product.is_active !== false,
                        deduct_ingredients: product.deduct_ingredients === true,
                        image_url: product.image_url || ''
                    })
                }
            } else {
                // Generate SKU for new product
                const { data: lastProduct } = await supabase
                    .from('products')
                    .select('sku')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (lastProduct?.sku) {
                    const match = lastProduct.sku.match(/PRD-(\d+)/)
                    if (match) {
                        const nextNum = parseInt(match[1]) + 1
                        setForm(prev => ({
                            ...prev,
                            sku: `PRD-${String(nextNum).padStart(4, '0')}`
                        }))
                    }
                } else {
                    setForm(prev => ({ ...prev, sku: 'PRD-0001' }))
                }
            }
        } catch (error) {
            logError('Error loading data:', error)
            toast.error('Error loading data')
        } finally {
            setLoading(false)
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!form.sku.trim()) {
            newErrors.sku = 'SKU required'
        }
        if (!form.name.trim()) {
            newErrors.name = 'Name required'
        }
        if (!form.unit.trim()) {
            newErrors.unit = 'Unit required'
        }
        if (form.sale_price < 0) {
            newErrors.sale_price = 'Invalid price'
        }
        if (form.cost_price < 0) {
            newErrors.cost_price = 'Invalid cost'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            toast.error('Please correct the errors')
            return
        }

        setSaving(true)
        try {
            const productId = id || crypto.randomUUID()
            const productData = {
                id: productId,
                sku: form.sku.trim(),
                name: form.name.trim(),
                description: form.description.trim() || null,
                category_id: form.category_id || null,
                product_type: form.product_type,
                unit: form.unit,
                cost_price: form.cost_price,
                retail_price: form.retail_price || form.sale_price,
                wholesale_price: form.wholesale_price || null,
                current_stock: form.stock_quantity,
                min_stock_level: form.min_stock_level || null,
                pos_visible: form.pos_visible,
                is_active: form.is_active,
                image_url: form.image_url || null,
                updated_at: new Date().toISOString()
            }

            const result = await saveProduct(productData as Partial<IOfflineProduct> & { id: string })

            if (!result.success) {
                throw new Error(result.error)
            }

            if (result.synced) {
                toast.success(isEditing ? 'Product updated' : 'Product created')
            } else {
                toast.success(isEditing ? 'Product updated locally (pending sync)' : 'Product created locally (pending sync)')
            }

            navigate('/products')
        } catch (error) {
            logError('Error saving product:', error)
            toast.error('Error during save')
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${form.sku || Date.now()}.${fileExt}`
            const filePath = `products/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            setForm(prev => ({ ...prev, image_url: publicUrl }))
            toast.success('Image uploaded')
        } catch (error) {
            logError('Error uploading image:', error)
            toast.error('Error during upload')
        }
    }

    const calculateMargin = (): number => {
        if (form.cost_price <= 0 || form.sale_price <= 0) return 0
        return ((form.sale_price - form.cost_price) / form.sale_price) * 100
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5 max-w-[900px] mx-auto text-muted-foreground">
                <div className="spinner" />
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-[900px] mx-auto max-md:p-4">
            <header className="flex items-center gap-4 mb-8">
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] transition-all hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--color-gold)] shadow-sm"
                    onClick={() => navigate('/products')}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-display text-3xl font-semibold text-[var(--theme-text-primary)] m-0">{isEditing ? 'Edit Product' : 'New Product'}</h1>
            </header>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <section className="bg-[var(--theme-bg-secondary)] rounded-xl p-6 border border-[var(--theme-border)] shadow-sm">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-[var(--theme-border)] text-[var(--theme-text-primary)]">
                        <Package size={20} className="text-[var(--color-gold)]" /> Basic information
                    </h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">SKU *</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={e => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                                placeholder="PRD-0001"
                                className={cn(
                                    "py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15)]",
                                    errors.sku && 'border-destructive'
                                )}
                            />
                            {errors.sku && <span className="text-destructive text-xs mt-1">{errors.sku}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Product name"
                                className={cn(
                                    "py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15)]",
                                    errors.name && 'border-destructive'
                                )}
                            />
                            {errors.name && <span className="text-destructive text-xs mt-1">{errors.name}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-5">
                        <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Product description..."
                            rows={3}
                            className="py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15)] resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mt-5 max-md:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Category</label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                                className="py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
                            >
                                <option value="">No category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Product Type</label>
                            <select
                                value={form.product_type}
                                onChange={e => setForm({ ...form, product_type: e.target.value as ProductForm['product_type'] })}
                                className="py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10"
                            >
                                {PRODUCT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Unit *</label>
                            <select
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                                className={cn(
                                    "py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10",
                                    errors.unit && 'border-destructive'
                                )}
                            >
                                {UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="bg-[var(--theme-bg-secondary)] rounded-xl p-6 border border-[var(--theme-border)] shadow-sm">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-[var(--theme-border)] text-[var(--theme-text-primary)]">
                        <DollarSign size={20} className="text-[var(--color-gold)]" /> Price
                    </h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Retail price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-sm">Rp</span>
                                <input
                                    type="number"
                                    value={form.sale_price}
                                    onChange={e => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="100"
                                    className={cn(
                                        "w-full py-3 pl-10 pr-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)]",
                                        errors.sale_price && 'border-destructive'
                                    )}
                                />
                            </div>
                            <small className="text-[var(--theme-text-muted)] text-xs mt-1">{formatCurrency(form.sale_price)}</small>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Wholesale price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-sm">Rp</span>
                                <input
                                    type="number"
                                    value={form.wholesale_price}
                                    onChange={e => setForm({ ...form, wholesale_price: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="100"
                                    className="w-full py-3 pl-10 pr-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)]"
                                />
                            </div>
                            <small className="text-[var(--theme-text-muted)] text-xs mt-1">{formatCurrency(form.wholesale_price)}</small>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Cost price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] text-sm">Rp</span>
                                <input
                                    type="number"
                                    value={form.cost_price}
                                    onChange={e => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="100"
                                    className={cn(
                                        "w-full py-3 pl-10 pr-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)]",
                                        errors.cost_price && 'border-destructive'
                                    )}
                                />
                            </div>
                            <small className="text-[var(--theme-text-muted)] text-xs mt-1">{formatCurrency(form.cost_price)}</small>
                        </div>
                    </div>

                    {form.cost_price > 0 && form.sale_price > 0 && (
                        <div className="flex items-center gap-3 px-5 py-4 mt-6 bg-[rgba(34,197,94,0.1)] rounded-xl text-green-500 font-medium border border-[rgba(34,197,94,0.2)]">
                            <Tag size={18} className="text-green-500" />
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold">Margin: {calculateMargin().toFixed(1)}%</span>
                                <span className="text-[var(--theme-text-muted)] text-sm">
                                    ({formatCurrency(form.sale_price - form.cost_price)})
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Stock Section */}
                <section className="bg-[var(--theme-bg-secondary)] rounded-xl p-6 border border-[var(--theme-border)] shadow-sm">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-[var(--theme-border)] text-[var(--theme-text-primary)]">
                        <Warehouse size={20} className="text-[var(--color-gold)]" /> Stock
                    </h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Current stock</label>
                            <input
                                type="number"
                                value={form.stock_quantity}
                                onChange={e => setForm({ ...form, stock_quantity: parseFloat(e.target.value) || 0 })}
                                step="0.01"
                                className="py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)]"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider">Minimum stock</label>
                            <input
                                type="number"
                                value={form.min_stock_level}
                                onChange={e => setForm({ ...form, min_stock_level: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="1"
                                className="py-3 px-4 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] outline-none transition-all focus:border-[var(--color-gold)]"
                            />
                        </div>
                    </div>
                </section>

                {/* Image Section */}
                <section className="bg-[var(--theme-bg-secondary)] rounded-xl p-6 border border-[var(--theme-border)] shadow-sm">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-[var(--theme-border)] text-[var(--theme-text-primary)]">
                        <ImageIcon size={20} className="text-[var(--color-gold)]" /> Image
                    </h2>

                    <div className="flex justify-center">
                        {form.image_url ? (
                            <div className="relative w-[240px] h-[240px] rounded-xl overflow-hidden border border-[var(--theme-border)] shadow-md group">
                                <img src={form.image_url} alt="Product" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 w-9 h-9 border-none rounded-full bg-black/60 text-white cursor-pointer flex items-center justify-center transition-all hover:bg-destructive shadow-lg"
                                    onClick={() => setForm({ ...form, image_url: '' })}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <label className="w-[240px] h-[240px] border-2 border-dashed border-[var(--theme-border)] rounded-xl flex flex-col items-center justify-center gap-3 text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] hover:bg-[rgba(201,165,92,0.05)]">
                                <div className="w-12 h-12 rounded-full bg-[var(--theme-bg-tertiary)] flex items-center justify-center mb-1">
                                    <Upload size={24} />
                                </div>
                                <span className="font-body text-sm font-medium">Click to add an image</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-60">PNG, JPG up to 5MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    hidden
                                />
                            </label>
                        )}
                    </div>
                </section>

                {/* Options Section */}
                <section className="bg-[var(--theme-bg-secondary)] rounded-xl p-6 border border-[var(--theme-border)] shadow-sm">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-[var(--theme-border)] text-[var(--theme-text-primary)]">
                        <FileText size={20} className="text-[var(--color-gold)]" /> Options
                    </h2>

                    <div className="flex gap-10 flex-wrap max-md:flex-col max-md:gap-5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={form.pos_visible}
                                    onChange={e => setForm({ ...form, pos_visible: e.target.checked })}
                                    className="w-5 h-5 accent-[var(--color-gold)] cursor-pointer"
                                />
                            </div>
                            <span className="text-[0.95rem] font-medium text-[var(--theme-text-primary)]">Visible on POS</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                className="w-5 h-5 accent-[var(--color-gold)] cursor-pointer"
                            />
                            <span className="text-[0.95rem] font-medium text-[var(--theme-text-primary)]">Product active</span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.deduct_ingredients}
                                onChange={e => setForm({ ...form, deduct_ingredients: e.target.checked })}
                                className="w-5 h-5 accent-[var(--color-gold)] cursor-pointer mt-1"
                            />
                            <div className="flex flex-col">
                                <span className="text-[0.95rem] font-medium text-[var(--theme-text-primary)]">Deduct ingredients on sale</span>
                                <small className="block mt-1 text-[var(--theme-text-muted)] text-xs leading-relaxed">
                                    For products made to order (coffee, sandwiches, etc.)
                                </small>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex justify-end gap-4 p-6 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl shadow-sm max-md:flex-col">
                    <button
                        type="button"
                        className="py-3 px-8 rounded-lg font-body text-sm font-semibold cursor-pointer border-2 border-[var(--theme-border)] bg-transparent text-[var(--theme-text-primary)] transition-all hover:bg-[var(--theme-bg-tertiary)] max-md:w-full"
                        onClick={() => navigate('/products')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 py-3 px-10 rounded-lg font-body text-sm font-semibold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] disabled:opacity-50 disabled:transform-none max-md:w-full"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Product</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
