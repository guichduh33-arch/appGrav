import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Tag } from 'lucide-react'
import {
    useCustomerCategories,
    useCreateCustomerCategory,
    useUpdateCustomerCategory,
    useDeleteCustomerCategory,
    type ICustomerCategory,
} from '@/hooks/customers'
import { toast } from 'sonner'
import { CategoryCard } from '@/components/customers/CategoryCard'
import { CategoryFormModal } from '@/components/customers/CategoryFormModal'

interface CategoryFormData {
    name: string
    slug: string
    description: string
    color: string
    price_modifier_type: 'retail' | 'wholesale' | 'discount_percentage' | 'custom'
    discount_percentage: number
    is_active: boolean
}

const DEFAULT_FORM: CategoryFormData = {
    name: '', slug: '', description: '', color: '#6366f1',
    price_modifier_type: 'retail', discount_percentage: 0, is_active: true,
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
            name: category.name, slug: category.slug,
            description: category.description || '', color: category.color,
            price_modifier_type: category.price_modifier_type,
            discount_percentage: category.discount_percentage || 0,
            is_active: category.is_active,
        })
        setShowModal(true)
    }

    const handleSubmit = async () => {
        if (!formData.name.trim()) { toast.error('Name is required'); return }
        if (!formData.slug.trim()) { toast.error('Code is required'); return }
        if (formData.price_modifier_type === 'discount_percentage' && formData.discount_percentage <= 0) {
            toast.error('Please set a discount percentage'); return
        }
        const categoryData = {
            name: formData.name.trim(),
            slug: formData.slug.trim().toLowerCase(),
            description: formData.description.trim() || null,
            color: formData.color,
            price_modifier_type: formData.price_modifier_type,
            discount_percentage: formData.price_modifier_type === 'discount_percentage' ? formData.discount_percentage : null,
            is_active: formData.is_active,
        }
        if (editingCategory) {
            await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryData })
        } else {
            await createCategory.mutateAsync(categoryData)
        }
        setShowModal(false)
    }

    const handleDelete = async (category: ICustomerCategory) => {
        if (!confirm(`Delete category "${category.name}"?`)) return
        await deleteCategory.mutateAsync(category.id)
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-w-[1400px] mx-auto max-md:p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-8 gap-4 flex-wrap max-md:flex-col max-md:items-start">
                <div className="flex items-center gap-3">
                    <button
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-transparent text-white hover:bg-white/5 transition-all"
                        onClick={() => navigate('/customers')}
                        title="Back"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="flex items-center gap-3 text-2xl font-display font-bold text-white m-0">
                            <Tag size={28} className="text-[var(--color-gold)]" />
                            Customer Categories
                        </h1>
                        <p className="text-[var(--theme-text-muted)] mt-1.5 text-sm">
                            Manage categories and their pricing
                        </p>
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black hover:brightness-110 transition-all max-md:w-full justify-center"
                    onClick={openCreateModal}
                >
                    <Plus size={16} />
                    New Category
                </button>
            </header>

            {/* Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-[var(--muted-smoke)] gap-4">
                    <div className="spinner" />
                    <span>Loading...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-[var(--onyx-surface)] rounded-xl border border-dashed border-white/10">
                    <Tag size={64} className="text-white/10 mb-4" />
                    <h3 className="m-0 mb-2 text-[var(--muted-smoke)] text-lg font-display">No categories</h3>
                    <p className="m-0 mb-6 text-[var(--theme-text-muted)] text-sm">Create categories to organize your customers</p>
                    <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-gold)] text-black"
                        onClick={openCreateModal}
                    >
                        <Plus size={16} />
                        Create a category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 max-md:grid-cols-1">
                    {categories.map(category => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            onEdit={() => openEditModal(category)}
                            onDelete={() => handleDelete(category)}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <CategoryFormModal
                    isEditing={!!editingCategory}
                    formData={formData}
                    onChange={setFormData}
                    saving={saving}
                    onSubmit={handleSubmit}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}
