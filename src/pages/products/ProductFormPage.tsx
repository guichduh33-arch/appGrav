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
        <div className="p-5 max-w-[900px] mx-auto max-md:p-4">
            <header className="flex items-center gap-4 mb-6">
                <button className="btn btn-ghost" onClick={() => navigate('/products')}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-semibold m-0">{isEditing ? 'Edit Product' : 'New Product'}</h1>
            </header>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <section className="bg-white rounded-xl p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold m-0 mb-4 pb-3 border-b border-gray-200 text-gray-700">
                        <Package size={20} /> Basic information
                    </h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-1">
                        <div className="form-group">
                            <label>SKU *</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={e => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                                placeholder="PRD-0001"
                                className={cn(errors.sku && 'border-destructive')}
                            />
                            {errors.sku && <span className="text-destructive text-xs">{errors.sku}</span>}
                        </div>
                        <div className="form-group">
                            <label>Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Product name"
                                className={cn(errors.name && 'border-destructive')}
                            />
                            {errors.name && <span className="text-destructive text-xs">{errors.name}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Product description..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-1">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                            >
                                <option value="">No category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Product Type</label>
                            <select
                                value={form.product_type}
                                onChange={e => setForm({ ...form, product_type: e.target.value as ProductForm['product_type'] })}
                            >
                                {PRODUCT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Unit *</label>
                            <select
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                                className={cn(errors.unit && 'border-destructive')}
                            >
                                {UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="bg-white rounded-xl p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold m-0 mb-4 pb-3 border-b border-gray-200 text-gray-700">
                        <DollarSign size={20} /> Price
                    </h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-1">
                        <div className="form-group">
                            <label>Retail price</label>
                            <input
                                type="number"
                                value={form.sale_price}
                                onChange={e => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="100"
                                className={cn(errors.sale_price && 'border-destructive')}
                            />
                            <small className="text-muted-foreground text-xs">{formatCurrency(form.sale_price)}</small>
                        </div>
                        <div className="form-group">
                            <label>Wholesale price</label>
                            <input
                                type="number"
                                value={form.wholesale_price}
                                onChange={e => setForm({ ...form, wholesale_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="100"
                            />
                            <small className="text-muted-foreground text-xs">{formatCurrency(form.wholesale_price)}</small>
                        </div>
                        <div className="form-group">
                            <label>Cost price</label>
                            <input
                                type="number"
                                value={form.cost_price}
                                onChange={e => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="100"
                                className={cn(errors.cost_price && 'border-destructive')}
                            />
                            <small className="text-muted-foreground text-xs">{formatCurrency(form.cost_price)}</small>
                        </div>
                    </div>

                    {form.cost_price > 0 && form.sale_price > 0 && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-lg text-green-600 font-medium">
                            <Tag size={16} />
                            <span>Margin: {calculateMargin().toFixed(1)}%</span>
                            <span className="text-green-700 text-sm">
                                ({formatCurrency(form.sale_price - form.cost_price)})
                            </span>
                        </div>
                    )}
                </section>

                {/* Stock Section */}
                <section className="bg-white rounded-xl p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold m-0 mb-4 pb-3 border-b border-gray-200 text-gray-700">
                        <Warehouse size={20} /> Stock
                    </h2>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 max-md:grid-cols-1">
                        <div className="form-group">
                            <label>Current stock</label>
                            <input
                                type="number"
                                value={form.stock_quantity}
                                onChange={e => setForm({ ...form, stock_quantity: parseFloat(e.target.value) || 0 })}
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Minimum stock</label>
                            <input
                                type="number"
                                value={form.min_stock_level}
                                onChange={e => setForm({ ...form, min_stock_level: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="1"
                            />
                        </div>
                    </div>
                </section>

                {/* Image Section */}
                <section className="bg-white rounded-xl p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold m-0 mb-4 pb-3 border-b border-gray-200 text-gray-700">
                        <ImageIcon size={20} /> Image
                    </h2>

                    <div className="flex justify-center">
                        {form.image_url ? (
                            <div className="relative w-[200px] h-[200px] rounded-xl overflow-hidden">
                                <img src={form.image_url} alt="Product" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 w-8 h-8 border-none rounded-full bg-black/60 text-white cursor-pointer flex items-center justify-center transition-colors hover:bg-destructive"
                                    onClick={() => setForm({ ...form, image_url: '' })}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="w-[200px] h-[200px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer transition-all hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50">
                                <Upload size={24} />
                                <span>Click to add an image</span>
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
                <section className="bg-white rounded-xl p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-semibold m-0 mb-4 pb-3 border-b border-gray-200 text-gray-700">
                        <FileText size={20} /> Options
                    </h2>

                    <div className="flex gap-6 flex-wrap max-md:flex-col max-md:gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.pos_visible}
                                onChange={e => setForm({ ...form, pos_visible: e.target.checked })}
                                className="w-5 h-5 accent-blue-500"
                            />
                            <span className="text-[0.95rem] text-gray-700">Visible on POS</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                className="w-5 h-5 accent-blue-500"
                            />
                            <span className="text-[0.95rem] text-gray-700">Product active</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.deduct_ingredients}
                                onChange={e => setForm({ ...form, deduct_ingredients: e.target.checked })}
                                className="w-5 h-5 accent-blue-500"
                            />
                            <span className="text-[0.95rem] text-gray-700">Deduct ingredients on sale</span>
                            <small className="block mt-1 text-muted-foreground">
                                For products made to order (coffee, sandwiches, etc.)
                            </small>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-5 bg-white rounded-xl shadow-sm max-md:flex-col">
                    <button
                        type="button"
                        className="btn btn-secondary max-md:w-full max-md:justify-center"
                        onClick={() => navigate('/products')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary max-md:w-full max-md:justify-center"
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    )
}
