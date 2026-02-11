import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Plus, Tag, Edit, Trash2, Percent, DollarSign,
    Building2, Crown, Users, UserCheck, Save, X
} from 'lucide-react'
import {
    useCustomerCategories,
    useCreateCustomerCategory,
    useUpdateCustomerCategory,
    useDeleteCustomerCategory,
    type ICustomerCategory,
} from '@/hooks/customers'
import { toast } from 'sonner'
import './CustomerCategoriesPage.css'

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
    { value: 'retail', label: 'Standard Price', icon: <DollarSign size={16} />, desc: 'Normal selling price' },
    { value: 'wholesale', label: 'Wholesale Price', icon: <Building2 size={16} />, desc: 'Wholesale price defined on products' },
    { value: 'discount_percentage', label: 'Discount %', icon: <Percent size={16} />, desc: 'Discount on selling price' },
    { value: 'custom', label: 'Custom Price', icon: <Tag size={16} />, desc: 'Price defined by product category' }
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
    const { data: categories = [], isLoading: loading } = useCustomerCategories()
    const createCategory = useCreateCustomerCategory()
    const updateCategory = useUpdateCustomerCategory()
    const deleteCategory = useDeleteCustomerCategory()
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<ICustomerCategory | null>(null)
    const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_FORM)
    const saving = createCategory.isPending || updateCategory.isPending

    const openCreateModal = () => {
        setEditingCategory(null)
        setFormData(DEFAULT_FORM)
        setShowModal(true)
    }

    const openEditModal = (category: ICustomerCategory) => {
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
            toast.error('Name is required')
            return
        }

        if (!formData.slug.trim()) {
            toast.error('Code is required')
            return
        }

        if (formData.price_modifier_type === 'discount_percentage' && formData.discount_percentage <= 0) {
            toast.error('Please set a discount percentage')
            return
        }

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
            await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryData })
        } else {
            await createCategory.mutateAsync(categoryData)
        }

        setShowModal(false)
    }

    const handleDelete = async (category: ICustomerCategory) => {
        if (!confirm(`Delete category "${category.name}"?`)) {
            return
        }

        await deleteCategory.mutateAsync(category.id)
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
                    <button className="btn btn-ghost" onClick={() => navigate('/customers')} title="Back" aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="categories-header__title">
                            <Tag size={28} />
                            Customer Categories
                        </h1>
                        <p className="categories-header__subtitle">
                            Manage categories and their pricing
                        </p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={18} />
                    New Category
                </button>
            </header>

            {/* Categories Grid */}
            {loading ? (
                <div className="categories-loading">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="categories-empty">
                    <Tag size={64} />
                    <h3>No categories</h3>
                    <p>Create categories to organize your customers</p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={18} />
                        Create a category
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
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-icon--danger"
                                        onClick={() => handleDelete(category)}
                                        title="Delete"
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
                                        {category.discount_percentage}% discount
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
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)} title="Close" aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name *</label>
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
                                    placeholder="Category description..."
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <div className="color-picker">
                                    {COLOR_OPTIONS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            title={`Color ${color}`}
                                            aria-label={`Select color ${color}`}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Pricing Type</label>
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
                                    <label>Discount percentage</label>
                                    <div className="input-with-suffix">
                                        <input
                                            type="number"
                                            aria-label="Discount percentage"
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
                                    <span>Active category</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={saving}
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
