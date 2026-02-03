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
import { formatCurrency } from '@/utils/helpers'
import toast from 'react-hot-toast'
import './ProductFormPage.css'

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
    { value: 'finished', label: 'Produit fini', description: 'Produit vendu tel quel' },
    { value: 'semi_finished', label: 'Semi-fini', description: 'Produit intermédiaire' },
    { value: 'raw_material', label: 'Matière première', description: 'Ingrédient de base' }
]

const UNITS = [
    'pièce', 'kg', 'g', 'L', 'mL', 'unité', 'portion', 'boîte', 'sachet'
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
        unit: 'pièce',
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
                        unit: product.unit || 'pièce',
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
            console.error('Error loading data:', error)
            toast.error('Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!form.sku.trim()) {
            newErrors.sku = 'SKU obligatoire'
        }
        if (!form.name.trim()) {
            newErrors.name = 'Nom obligatoire'
        }
        if (!form.unit.trim()) {
            newErrors.unit = 'Unité obligatoire'
        }
        if (form.sale_price < 0) {
            newErrors.sale_price = 'Prix invalide'
        }
        if (form.cost_price < 0) {
            newErrors.cost_price = 'Coût invalide'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) {
            toast.error('Veuillez corriger les erreurs')
            return
        }

        setSaving(true)
        try {
            const productData = {
                sku: form.sku.trim(),
                name: form.name.trim(),
                description: form.description.trim() || null,
                category_id: form.category_id || null,
                product_type: form.product_type,
                unit: form.unit,
                cost_price: form.cost_price,
                sale_price: form.sale_price,
                retail_price: form.retail_price || form.sale_price,
                wholesale_price: form.wholesale_price || null,
                min_stock_level: form.min_stock_level || null,
                stock_quantity: form.stock_quantity,
                pos_visible: form.pos_visible,
                is_active: form.is_active,
                deduct_ingredients: form.deduct_ingredients,
                image_url: form.image_url || null,
                updated_at: new Date().toISOString()
            }

            if (isEditing) {
                const { error } = await supabase
                    .from('products')
                    .update(productData as never)
                    .eq('id', id!)

                if (error) throw error
                toast.success('Produit mis à jour')
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert(productData)

                if (error) throw error
                toast.success('Produit créé')
            }

            navigate('/products')
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error('Erreur lors de l\'enregistrement')
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
            toast.success('Image uploadée')
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Erreur lors de l\'upload')
        }
    }

    const calculateMargin = (): number => {
        if (form.cost_price <= 0 || form.sale_price <= 0) return 0
        return ((form.sale_price - form.cost_price) / form.sale_price) * 100
    }

    if (loading) {
        return (
            <div className="product-form-page loading">
                <div className="spinner" />
                <span>Chargement...</span>
            </div>
        )
    }

    return (
        <div className="product-form-page">
            <header className="product-form-page__header">
                <button className="btn btn-ghost" onClick={() => navigate('/products')}>
                    <ArrowLeft size={20} />
                </button>
                <h1>{isEditing ? 'Modifier le produit' : 'Nouveau produit'}</h1>
            </header>

            <form className="product-form" onSubmit={handleSubmit}>
                {/* Basic Info Section */}
                <section className="form-section">
                    <h2><Package size={20} /> Informations de base</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>SKU *</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={e => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                                placeholder="PRD-0001"
                                className={errors.sku ? 'error' : ''}
                            />
                            {errors.sku && <span className="error-text">{errors.sku}</span>}
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Nom du produit"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Description du produit..."
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Catégorie</label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm({ ...form, category_id: e.target.value })}
                            >
                                <option value="">Sans catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Type de produit</label>
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
                            <label>Unité *</label>
                            <select
                                value={form.unit}
                                onChange={e => setForm({ ...form, unit: e.target.value })}
                                className={errors.unit ? 'error' : ''}
                            >
                                {UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="form-section">
                    <h2><DollarSign size={20} /> Prix</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Prix de vente</label>
                            <input
                                type="number"
                                value={form.sale_price}
                                onChange={e => setForm({ ...form, sale_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="100"
                                className={errors.sale_price ? 'error' : ''}
                            />
                            <small>{formatCurrency(form.sale_price)}</small>
                        </div>
                        <div className="form-group">
                            <label>Prix de gros</label>
                            <input
                                type="number"
                                value={form.wholesale_price}
                                onChange={e => setForm({ ...form, wholesale_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="100"
                            />
                            <small>{formatCurrency(form.wholesale_price)}</small>
                        </div>
                        <div className="form-group">
                            <label>Prix de revient</label>
                            <input
                                type="number"
                                value={form.cost_price}
                                onChange={e => setForm({ ...form, cost_price: parseFloat(e.target.value) || 0 })}
                                min="0"
                                step="100"
                                className={errors.cost_price ? 'error' : ''}
                            />
                            <small>{formatCurrency(form.cost_price)}</small>
                        </div>
                    </div>

                    {form.cost_price > 0 && form.sale_price > 0 && (
                        <div className="margin-display">
                            <Tag size={16} />
                            <span>Marge: {calculateMargin().toFixed(1)}%</span>
                            <span className="margin-amount">
                                ({formatCurrency(form.sale_price - form.cost_price)})
                            </span>
                        </div>
                    )}
                </section>

                {/* Stock Section */}
                <section className="form-section">
                    <h2><Warehouse size={20} /> Stock</h2>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Stock actuel</label>
                            <input
                                type="number"
                                value={form.stock_quantity}
                                onChange={e => setForm({ ...form, stock_quantity: parseFloat(e.target.value) || 0 })}
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock minimum</label>
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
                <section className="form-section">
                    <h2><ImageIcon size={20} /> Image</h2>

                    <div className="image-upload">
                        {form.image_url ? (
                            <div className="image-preview">
                                <img src={form.image_url} alt="Produit" />
                                <button
                                    type="button"
                                    className="btn-remove-image"
                                    onClick={() => setForm({ ...form, image_url: '' })}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="image-upload-zone">
                                <Upload size={24} />
                                <span>Cliquer pour ajouter une image</span>
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
                <section className="form-section">
                    <h2><FileText size={20} /> Options</h2>

                    <div className="form-options">
                        <label className="checkbox-option">
                            <input
                                type="checkbox"
                                checked={form.pos_visible}
                                onChange={e => setForm({ ...form, pos_visible: e.target.checked })}
                            />
                            <span>Visible au POS</span>
                        </label>
                        <label className="checkbox-option">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                            />
                            <span>Produit actif</span>
                        </label>
                        <label className="checkbox-option">
                            <input
                                type="checkbox"
                                checked={form.deduct_ingredients}
                                onChange={e => setForm({ ...form, deduct_ingredients: e.target.checked })}
                            />
                            <span>Déduire les ingrédients à la vente</span>
                            <small style={{ display: 'block', marginTop: '4px', color: '#6b7280' }}>
                                Pour les produits faits à la demande (café, sandwiches, etc.)
                            </small>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/products')}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    )
}
