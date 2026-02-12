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
import { cn } from '@/lib/utils'

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
        <div className="p-6 max-w-[1400px] mx-auto max-md:p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 gap-4 flex-wrap max-md:flex-col max-md:items-start">
                <div className="flex items-center gap-3">
                    <button className="btn btn-ghost" onClick={() => navigate('/customers')} title="Back" aria-label="Back">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground m-0 [&>svg]:text-primary">
                            <Tag size={28} />
                            Customer Categories
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage categories and their pricing
                        </p>
                    </div>
                </div>
                <button className="btn btn-primary max-md:w-full" onClick={openCreateModal}>
                    <Plus size={18} />
                    New Category
                </button>
            </header>

            {/* Categories Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-muted-foreground gap-4">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white rounded-xl border border-dashed border-border [&>svg]:text-slate-300 [&>svg]:mb-4">
                    <Tag size={64} />
                    <h3 className="m-0 mb-2 text-slate-600 text-lg">No categories</h3>
                    <p className="m-0 mb-6 text-slate-400 text-sm">Create categories to organize your customers</p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={18} />
                        Create a category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 max-md:grid-cols-1">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={cn(
                                'bg-white rounded-xl border border-border p-5 transition-all hover:border-primary hover:shadow-[0_4px_12px_rgba(99,102,241,0.15)]',
                                !category.is_active && 'opacity-60'
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                                    style={{ backgroundColor: category.color }}
                                >
                                    {getCategoryIcon(category.slug)}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        className="btn-icon"
                                        onClick={() => openEditModal(category)}
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn-icon hover:!bg-red-50 hover:!text-red-600"
                                        onClick={() => handleDelete(category)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="m-0 mb-1 text-lg font-semibold text-foreground">{category.name}</h3>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded font-mono text-xs text-muted-foreground mb-3">
                                {category.slug}
                            </span>

                            {category.description && (
                                <p className="m-0 mb-4 text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                            )}

                            <div className="p-3 bg-slate-50 rounded-lg mb-4">
                                <span className="block text-sm font-medium text-slate-600">{getPricingLabel(category.price_modifier_type)}</span>
                                {category.price_modifier_type === 'discount_percentage' && category.discount_percentage && (
                                    <span className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                                        <Percent size={14} />
                                        {category.discount_percentage}% discount
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <span className={cn(
                                    'px-2 py-1 rounded text-[0.7rem] font-medium',
                                    category.is_active ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-600'
                                )}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)} title="Close" aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
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
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={cn(
                                                'w-8 h-8 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:scale-110',
                                                formData.color === color && 'border-foreground shadow-[0_0_0_2px_white,0_0_0_4px_currentColor]'
                                            )}
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
                                <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
                                    {PRICING_TYPES.map(pricing => (
                                        <div
                                            key={pricing.value}
                                            className={cn(
                                                'flex items-start gap-3 p-3 border-2 border-border rounded-[10px] cursor-pointer transition-all hover:border-primary hover:bg-slate-50',
                                                formData.price_modifier_type === pricing.value && 'border-primary bg-indigo-50'
                                            )}
                                            onClick={() => setFormData({ ...formData, price_modifier_type: pricing.value as CategoryFormData['price_modifier_type'] })}
                                        >
                                            <div className={cn(
                                                'w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-muted-foreground shrink-0',
                                                formData.price_modifier_type === pricing.value && 'bg-primary text-white'
                                            )}>
                                                {pricing.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-sm font-semibold text-foreground">{pricing.label}</span>
                                                <span className="block text-[0.7rem] text-muted-foreground mt-0.5">{pricing.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.price_modifier_type === 'discount_percentage' && (
                                <div className="form-group">
                                    <label>Discount percentage</label>
                                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                        <input
                                            type="number"
                                            aria-label="Discount percentage"
                                            value={formData.discount_percentage}
                                            onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                                            min="0"
                                            max="100"
                                            step="1"
                                            className="flex-1 !border-none !rounded-none !shadow-none"
                                        />
                                        <span className="px-4 bg-slate-100 text-muted-foreground font-medium h-full flex items-center py-3">%</span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="flex !flex-row items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-[18px] h-[18px] accent-primary"
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
