import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Plus, Tag, Edit, Trash2, Percent, DollarSign,
    Building2, Crown, Users, UserCheck, Save, X
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import './CustomerCategoriesPage.css'

interface CustomerCategory {
    id: string
    name: string
    slug: string
    description: string | null
    color: string
    price_modifier_type: 'retail' | 'wholesale' | 'discount_percentage' | 'custom'
    discount_percentage: number | null
    is_active: boolean
    created_at: string
}

interface CategoryFormData {
    name: string
    slug: string
    description: string
    color: string
    price_modifier_type: 'retail' | 'wholesale' | 'discount_percentage' | 'custom'
    discount_percentage: number
    is_active: boolean
}

const PRICING_TYPES = [
    { value: 'retail', label: 'Prix Standard', icon: <DollarSign size={16} />, desc: 'Prix de vente normal' },
    { value: 'wholesale', label: 'Prix de Gros', icon: <Building2 size={16} />, desc: 'Prix wholesale défini sur les produits' },
    { value: 'discount_percentage', label: 'Réduction %', icon: <Percent size={16} />, desc: 'Réduction sur le prix de vente' },
    { value: 'custom', label: 'Prix Personnalisé', icon: <Tag size={16} />, desc: 'Prix défini par catégorie produit' }
]

const COLOR_OPTIONS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1'
]

const DEFAULT_FORM: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    color: '#6366f1',
    price_modifier_type: 'retail',
    discount_percentage: 0,
    is_active: true
}

export default function CustomerCategoriesPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState<CustomerCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<CustomerCategory | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('customer_categories')
                .select('*')
                .order('name')

            if (error) throw error
            if (data) setCategories(data)
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingCategory(null)
        setFormData(DEFAULT_FORM)
        setShowModal(true)
    }

    const openEditModal = (category: CustomerCategory) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            color: category.color,
            price_modifier_type: category.price_modifier_type,
            discount_percentage: category.discount_percentage || 0,
            is_active: category.is_active
        })
        setShowModal(true)
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom est requis')
            return
        }

        if (!formData.slug.trim()) {
            toast.error('Le code est requis')
            return
        }

        if (formData.price_modifier_type === 'discount_percentage' && formData.discount_percentage <= 0) {
            toast.error('Veuillez définir un pourcentage de réduction')
            return
        }

        setSaving(true)
        try {
            const categoryData = {
                name: formData.name.trim(),
                slug: formData.slug.trim().toLowerCase(),
                description: formData.description.trim() || null,
                color: formData.color,
                price_modifier_type: formData.price_modifier_type,
                discount_percentage: formData.price_modifier_type === 'discount_percentage' ? formData.discount_percentage : null,
                is_active: formData.is_active
            }

            if (editingCategory) {
                const { error } = await supabase
                    .from('customer_categories')
                    .update(categoryData as never)
                    .eq('id', editingCategory.id)

                if (error) throw error
                toast.success('Catégorie mise à jour')
            } else {
                const { error } = await supabase
                    .from('customer_categories')
                    .insert(categoryData as never)

                if (error) throw error
                toast.success('Catégorie créée')
            }

            setShowModal(false)
            fetchCategories()
        } catch (error: unknown) {
            console.error('Error saving category:', error)
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement'
            toast.error(errorMessage)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (category: CustomerCategory) => {
        if (!confirm(`Supprimer la catégorie "${category.name}" ?`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('customer_categories')
                .delete()
                .eq('id', category.id)

            if (error) throw error
            toast.success('Catégorie supprimée')
            fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Erreur lors de la suppression')
        }
    }

    const getCategoryIcon = (slug: string) => {
        switch (slug) {
            case 'wholesale': return <Building2 size={20} />
            case 'vip': return <Crown size={20} />
            case 'staff': return <UserCheck size={20} />
            default: return <Users size={20} />
        }
    }

    const getPricingLabel = (type: string) => {
        const pricing = PRICING_TYPES.find(p => p.value === type)
        return pricing?.label || type
    }

    return (
        <div className="categories-page">
            {/* Header */}
            <header className="categories-header">
                <div className="categories-header__left">
                    <button className="btn btn-ghost" onClick={() => navigate('/customers')} title="Retour" aria-label="Retour">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="categories-header__title">
                            <Tag size={28} />
                            Catégories Clients
                        </h1>
                        <p className="categories-header__subtitle">
                            Gérez les catégories et leur tarification
                        </p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    Nouvelle Catégorie
                </button>
            </header>

            {/* Categories Grid */}
            {loading ? (
                <div className="categories-loading">
                    <div className="spinner"></div>
                    <span>Chargement...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="categories-empty">
                    <Tag size={64} />
                    <h3>Aucune catégorie</h3>
                    <p>Créez des catégories pour organiser vos clients</p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={18} />
                        Créer une catégorie
                    </button>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={`category-card ${!category.is_active ? 'inactive' : ''}`}
                        >
                            <div className="category-card__header">
                                <div
                                    className="category-card__icon"
                                    style={{ backgroundColor: category.color }}
                                >
                                    {getCategoryIcon(category.slug)}
                                </div>
                                <div className="category-card__actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => openEditModal(category)}
                                        title="Modifier"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-icon--danger"
                                        onClick={() => handleDelete(category)}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="category-card__name">{category.name}</h3>
                            <span className="category-card__code">{category.slug}</span>

                            {category.description && (
                                <p className="category-card__desc">{category.description}</p>
                            )}

                            <div className="category-card__pricing">
                                <span className="pricing-label">{getPricingLabel(category.price_modifier_type)}</span>
                                {category.price_modifier_type === 'discount_percentage' && category.discount_percentage && (
                                    <span className="pricing-discount">
                                        <Percent size={14} />
                                        {category.discount_percentage}% de réduction
                                    </span>
                                )}
                            </div>

                            <div className="category-card__footer">
                                <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                            </h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)} title="Fermer" aria-label="Fermer">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nom *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: VIP, Wholesale..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Code *</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                                        placeholder="Ex: vip, wholesale..."
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description de la catégorie..."
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label>Couleur</label>
                                <div className="color-picker">
                                    {COLOR_OPTIONS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            title={`Couleur ${color}`}
                                            aria-label={`Sélectionner la couleur ${color}`}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Type de Tarification</label>
                                <div className="pricing-options">
                                    {PRICING_TYPES.map(pricing => (
                                        <div
                                            key={pricing.value}
                                            className={`pricing-option ${formData.price_modifier_type === pricing.value ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, price_modifier_type: pricing.value as CategoryFormData['price_modifier_type'] })}
                                        >
                                            <div className="pricing-option__icon">{pricing.icon}</div>
                                            <div className="pricing-option__content">
                                                <span className="pricing-option__label">{pricing.label}</span>
                                                <span className="pricing-option__desc">{pricing.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.price_modifier_type === 'discount_percentage' && (
                                <div className="form-group">
                                    <label>Pourcentage de réduction</label>
                                    <div className="input-with-suffix">
                                        <input
                                            type="number"
                                            aria-label="Pourcentage de réduction"
                                            value={formData.discount_percentage}
                                            onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                                            min="0"
                                            max="100"
                                            step="1"
                                        />
                                        <span className="suffix">%</span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span>Catégorie active</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Annuler
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                <Save size={18} />
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
