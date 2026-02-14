/**
 * Product Form Page
 * Epic 10: Story 10.9
 *
 * Create and edit products with full form
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { saveProduct } from '@/services/products/catalogSyncService'
import type { IOfflineProduct } from '@/types/offline'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'

import BasicInfoSection from './product-form/BasicInfoSection'
import PricingSection from './product-form/PricingSection'
import StockImageOptionsSection from './product-form/StockImageOptionsSection'

interface Category { id: string; name: string }

interface ProductForm {
    sku: string; name: string; description: string; category_id: string
    product_type: 'finished' | 'semi_finished' | 'raw_material'
    unit: string; cost_price: number; sale_price: number; retail_price: number
    wholesale_price: number; min_stock_level: number; stock_quantity: number
    pos_visible: boolean; is_active: boolean; deduct_ingredients: boolean; image_url: string
}

export default function ProductFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [form, setForm] = useState<ProductForm>({
        sku: '', name: '', description: '', category_id: '',
        product_type: 'finished', unit: 'piece', cost_price: 0,
        sale_price: 0, retail_price: 0, wholesale_price: 0,
        min_stock_level: 0, stock_quantity: 0, pos_visible: true,
        is_active: true, deduct_ingredients: false, image_url: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => { loadData() }, [id])

    const loadData = async () => {
        try {
            const { data: cats } = await supabase.from('categories').select('id, name').order('name')
            if (cats) setCategories(cats)
            if (id) {
                const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()
                if (error) throw error
                if (product) {
                    setForm({
                        sku: product.sku || '', name: product.name || '', description: product.description || '',
                        category_id: product.category_id || '', product_type: product.product_type || 'finished',
                        unit: product.unit || 'piece', cost_price: product.cost_price || 0,
                        sale_price: product.retail_price || 0, retail_price: product.retail_price || 0,
                        wholesale_price: product.wholesale_price || 0, min_stock_level: product.min_stock_level || 0,
                        stock_quantity: product.current_stock || 0, pos_visible: product.pos_visible !== false,
                        is_active: product.is_active !== false, deduct_ingredients: product.deduct_ingredients === true,
                        image_url: product.image_url || ''
                    })
                }
            } else {
                const { data: lastProduct } = await supabase.from('products').select('sku').order('created_at', { ascending: false }).limit(1).single()
                if (lastProduct?.sku) {
                    const match = lastProduct.sku.match(/PRD-(\d+)/)
                    if (match) {
                        const nextNum = parseInt(match[1]) + 1
                        setForm(prev => ({ ...prev, sku: `PRD-${String(nextNum).padStart(4, '0')}` }))
                    }
                } else {
                    setForm(prev => ({ ...prev, sku: 'PRD-0001' }))
                }
            }
        } catch (error) {
            logError('Error loading data:', error)
            toast.error('Error loading data')
        } finally { setLoading(false) }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!form.sku.trim()) newErrors.sku = 'SKU required'
        if (!form.name.trim()) newErrors.name = 'Name required'
        if (!form.unit.trim()) newErrors.unit = 'Unit required'
        if (form.sale_price < 0) newErrors.sale_price = 'Invalid price'
        if (form.cost_price < 0) newErrors.cost_price = 'Invalid cost'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) { toast.error('Please correct the errors'); return }
        setSaving(true)
        try {
            const productId = id || crypto.randomUUID()
            const productData = {
                id: productId, sku: form.sku.trim(), name: form.name.trim(),
                description: form.description.trim() || null, category_id: form.category_id || null,
                product_type: form.product_type, unit: form.unit, cost_price: form.cost_price,
                retail_price: form.retail_price || form.sale_price, wholesale_price: form.wholesale_price || null,
                current_stock: form.stock_quantity, min_stock_level: form.min_stock_level || null,
                pos_visible: form.pos_visible, is_active: form.is_active, image_url: form.image_url || null,
                updated_at: new Date().toISOString()
            }
            const result = await saveProduct(productData as Partial<IOfflineProduct> & { id: string })
            if (!result.success) throw new Error(result.error)
            if (result.synced) { toast.success(isEditing ? 'Product updated' : 'Product created') }
            else { toast.success(isEditing ? 'Product updated locally (pending sync)' : 'Product created locally (pending sync)') }
            navigate('/products')
        } catch (error) {
            logError('Error saving product:', error)
            toast.error('Error during save')
        } finally { setSaving(false) }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${form.sku || Date.now()}.${fileExt}`
            const filePath = `products/${fileName}`
            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file, { upsert: true })
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)
            setForm(prev => ({ ...prev, image_url: publicUrl }))
            toast.success('Image uploaded')
        } catch (error) {
            logError('Error uploading image:', error)
            toast.error('Error during upload')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5 max-w-[900px] mx-auto text-[var(--theme-text-muted)]">
                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                <span>Loading...</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-8 max-w-[900px] mx-auto max-md:p-4">
            <header className="flex items-center gap-4 mb-8">
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--onyx-surface)] border border-white/10 text-[var(--theme-text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)] shadow-sm"
                    onClick={() => navigate('/products')}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-display text-3xl font-semibold text-white m-0">{isEditing ? 'Edit Product' : 'New Product'}</h1>
            </header>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <BasicInfoSection
                    form={form}
                    categories={categories}
                    errors={errors}
                    onChange={(updates) => setForm(prev => ({ ...prev, ...updates }))}
                />

                <PricingSection
                    salePrice={form.sale_price}
                    wholesalePrice={form.wholesale_price}
                    costPrice={form.cost_price}
                    errors={errors}
                    onChange={(updates) => setForm(prev => ({ ...prev, ...updates }))}
                />

                <StockImageOptionsSection
                    stockQuantity={form.stock_quantity}
                    minStockLevel={form.min_stock_level}
                    imageUrl={form.image_url}
                    posVisible={form.pos_visible}
                    isActive={form.is_active}
                    deductIngredients={form.deduct_ingredients}
                    onStockChange={(updates) => setForm(prev => ({ ...prev, ...updates }))}
                    onImageChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                    onImageUpload={handleImageUpload}
                    onOptionsChange={(updates) => setForm(prev => ({ ...prev, ...updates }))}
                />

                {/* Actions */}
                <div className="flex justify-end gap-4 p-6 bg-[var(--onyx-surface)] border border-white/5 rounded-xl shadow-sm max-md:flex-col">
                    <button
                        type="button"
                        className="py-3 px-8 rounded-xl font-body text-sm font-semibold cursor-pointer border border-white/10 bg-transparent text-white transition-all hover:bg-white/5 max-md:w-full"
                        onClick={() => navigate('/products')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 py-3 px-10 rounded-xl font-body text-sm font-bold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-[var(--color-gold)] text-black shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] disabled:opacity-50 disabled:transform-none max-md:w-full"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
