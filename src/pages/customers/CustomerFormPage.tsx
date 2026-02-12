import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Save, User, Building2, Phone, Mail, MapPin,
    QrCode, Calendar, Star, Crown, Tag, Percent, Trash2
} from 'lucide-react'
import {
    useCustomerCategories,
    useCustomerById,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer,
    type ICustomerCategory,
} from '@/hooks/customers'
import { cn } from '@/lib/utils'

interface CustomerFormData {
    name: string
    company_name: string
    phone: string
    email: string
    address: string
    customer_type: string
    category_id: string
    date_of_birth: string
    notes: string
    is_active: boolean
    // B2B specific
    tax_id: string
    payment_terms: string  // 'cod' | 'net15' | 'net30' | 'net60'
    credit_limit: number
}

export default function CustomerFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)

    const { data: categories = [] } = useCustomerCategories(true)
    const { data: customer, isLoading: loading } = useCustomerById(id)
    const createCustomer = useCreateCustomer()
    const updateCustomer = useUpdateCustomer()
    const deleteCustomer = useDeleteCustomer()

    const saving = createCustomer.isPending || updateCustomer.isPending

    const [customerQR, setCustomerQR] = useState<string | null>(null)
    const [membershipNumber, setMembershipNumber] = useState<string | null>(null)

    const [formData, setFormData] = useState<CustomerFormData>({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        address: '',
        customer_type: 'retail',
        category_id: '',
        date_of_birth: '',
        notes: '',
        is_active: true,
        tax_id: '',
        payment_terms: 'cod',
        credit_limit: 0
    })

    // Populate form when customer data loads (edit mode)
    useEffect(() => {
        if (customer) {
            // Cast to access fields not declared on ICustomerWithCategory
            const raw = customer as unknown as Record<string, unknown>
            setFormData({
                name: customer.name || '',
                company_name: customer.company_name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                customer_type: customer.customer_type || 'retail',
                category_id: customer.category_id || '',
                date_of_birth: (raw.date_of_birth as string) || '',
                notes: (raw.notes as string) || '',
                is_active: customer.is_active ?? true,
                tax_id: (raw.tax_id as string) || '',
                payment_terms: (raw.payment_terms as string) || 'cod',
                credit_limit: (raw.credit_limit as number) || 0
            })
            setCustomerQR((raw.loyalty_qr_code as string) || null)
            setMembershipNumber(customer.membership_number)
        }
    }, [customer])

    // Auto-select default category for new customers
    useEffect(() => {
        if (!id && categories.length > 0) {
            const standardCat = categories.find((c: ICustomerCategory) => c.slug === 'standard')
            if (standardCat) {
                setFormData(prev => ({ ...prev, category_id: standardCat.id }))
            }
        }
    }, [categories, id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find((c: ICustomerCategory) => c.id === categoryId)
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            customer_type: category?.slug === 'wholesale' ? 'wholesale' : 'retail'
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            return
        }

        // Build customer data - only include category_id if it's a valid UUID
        const customerData: Record<string, unknown> = {
            name: formData.name.trim(),
            company_name: formData.company_name.trim() || null,
            phone: formData.phone.trim() || null,
            email: formData.email.trim() || null,
            address: formData.address.trim() || null,
            customer_type: formData.customer_type,
            date_of_birth: formData.date_of_birth || null,
            notes: formData.notes.trim() || null,
            is_active: formData.is_active,
            tax_id: formData.tax_id.trim() || null,
            payment_terms: formData.payment_terms || 'cod',  // ENUM: 'cod', 'net15', 'net30', 'net60'
            credit_limit: formData.credit_limit || 0
        }

        // Only include category_id if it's a valid UUID
        if (formData.category_id && formData.category_id.length === 36) {
            customerData.category_id = formData.category_id
        } else {
            customerData.category_id = null
        }

        try {
            if (isEditing) {
                await updateCustomer.mutateAsync({ id: id as string, ...customerData })
            } else {
                await createCustomer.mutateAsync(customerData)
            }
            navigate('/customers')
        } catch {
            // Error toast is handled by the mutation hooks
        }
    }

    const handleDelete = async () => {
        if (!id) return

        if (!confirm('Are you sure you want to delete this customer?')) {
            return
        }

        try {
            await deleteCustomer.mutateAsync(id)
            navigate('/customers')
        } catch {
            // Error toast is handled by the mutation hook
        }
    }

    const selectedCategory = categories.find((c: ICustomerCategory) => c.id === formData.category_id)

    if (loading) {
        return (
            <div className="p-6 max-w-[1200px] mx-auto max-md:p-4">
                <div className="flex flex-col items-center justify-center py-16 px-8 text-muted-foreground gap-4">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-[1200px] mx-auto max-md:p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 gap-4 flex-wrap max-md:flex-col max-md:items-start">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        title="Back"
                        aria-label="Back"
                        onClick={() => navigate('/customers')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">
                            {isEditing ? 'Edit Customer' : 'New Customer'}
                        </h1>
                        {membershipNumber && (
                            <span className="flex items-center gap-1.5 mt-1 px-2 py-1 bg-slate-100 rounded font-mono text-xs text-muted-foreground w-fit">
                                <QrCode size={14} />
                                {membershipNumber}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 max-md:w-full max-md:[&>.btn]:flex-1">
                    {isEditing && (
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                    {/* Main Info */}
                    <div className="bg-white rounded-xl border border-border p-6">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-5 pb-3 border-b border-slate-100 [&>svg]:text-primary">
                            <User size={20} />
                            General Information
                        </h2>

                        <div className="form-group">
                            <label htmlFor="name">Full name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Customer name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="company_name">
                                <Building2 size={14} />
                                Company name
                            </label>
                            <input
                                type="text"
                                id="company_name"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="Company (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                            <div className="form-group">
                                <label htmlFor="phone">
                                    <Phone size={14} />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+62 xxx xxx xxx"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">
                                    <Mail size={14} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">
                                <MapPin size={14} />
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Full address"
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date_of_birth">
                                <Calendar size={14} />
                                Date of birth
                            </label>
                            <input
                                type="date"
                                id="date_of_birth"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Category & Loyalty */}
                    <div className="bg-white rounded-xl border border-border p-6">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-5 pb-3 border-b border-slate-100 [&>svg]:text-primary">
                            <Tag size={20} />
                            Category & Loyalty
                        </h2>

                        <div className="form-group">
                            <label>Customer Category</label>
                            <div className="flex flex-col gap-2">
                                {categories.map(category => (
                                    <div
                                        key={category.id}
                                        className={cn(
                                            'flex items-center gap-3 py-3.5 px-4 border-2 border-border rounded-[10px] cursor-pointer transition-all',
                                            'hover:border-[var(--category-color)] hover:bg-[color-mix(in_srgb,var(--category-color)_5%,white)]',
                                            formData.category_id === category.id && 'border-[var(--category-color)] bg-[color-mix(in_srgb,var(--category-color)_10%,white)]'
                                        )}
                                        onClick={() => handleCategoryChange(category.id)}
                                        style={{ '--category-color': category.color } as React.CSSProperties}
                                    >
                                        <div
                                            className={cn(
                                                'w-4 h-4 rounded-full border-2 border-border shrink-0 relative transition-all',
                                                formData.category_id === category.id && 'border-[var(--category-color)] bg-[var(--category-color)] after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-white'
                                            )}
                                        />
                                        <div className="flex-1">
                                            <span className="block font-semibold text-foreground text-sm">{category.name}</span>
                                            <span className="block text-xs text-muted-foreground mt-0.5">
                                                {category.price_modifier_type === 'retail' && 'Standard price'}
                                                {category.price_modifier_type === 'wholesale' && 'Wholesale price'}
                                                {category.price_modifier_type === 'discount_percentage' && `${category.discount_percentage}% discount`}
                                                {category.price_modifier_type === 'custom' && 'Custom price'}
                                            </span>
                                        </div>
                                        {category.discount_percentage && category.discount_percentage > 0 && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-semibold">
                                                <Percent size={12} />
                                                {category.discount_percentage}%
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedCategory && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-sm font-medium"
                                    style={{ backgroundColor: selectedCategory.color }}
                                >
                                    <Crown size={16} />
                                    {selectedCategory.name}
                                </div>
                                {selectedCategory.description && (
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {selectedCategory.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* QR Code Display */}
                        {isEditing && customerQR && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-4">
                                    <QrCode size={18} />
                                    Loyalty QR Code
                                </h3>
                                <div className="flex gap-6 items-start max-md:flex-col max-md:items-center max-md:text-center">
                                    <div className="flex flex-col items-center p-6 bg-white border-2 border-dashed border-border rounded-xl [&>svg]:text-slate-400">
                                        <QrCode size={100} />
                                        <span className="mt-3 font-mono text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded">
                                            {customerQR}
                                        </span>
                                    </div>
                                    <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
                                        The customer can present this QR code during purchases
                                        to accumulate loyalty points.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="flex !flex-row items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-[18px] h-[18px] accent-primary"
                                />
                                <span>Active customer</span>
                            </label>
                        </div>
                    </div>

                    {/* B2B Settings */}
                    {formData.customer_type === 'wholesale' && (
                        <div className="bg-white rounded-xl border border-border p-6">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-5 pb-3 border-b border-slate-100 [&>svg]:text-primary">
                                <Building2 size={20} />
                                B2B Settings
                            </h2>

                            <div className="form-group">
                                <label htmlFor="tax_id">Tax ID / NPWP</label>
                                <input
                                    type="text"
                                    id="tax_id"
                                    name="tax_id"
                                    value={formData.tax_id}
                                    onChange={handleChange}
                                    placeholder="Tax identification number"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                <div className="form-group">
                                    <label htmlFor="payment_terms">Payment terms</label>
                                    <select
                                        id="payment_terms"
                                        name="payment_terms"
                                        value={formData.payment_terms}
                                        onChange={handleChange}
                                    >
                                        <option value="cod">Cash on Delivery (COD)</option>
                                        <option value="net15">Net 15 days</option>
                                        <option value="net30">Net 30 days</option>
                                        <option value="net60">Net 60 days</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="credit_limit">Credit limit (IDR)</label>
                                    <input
                                        type="number"
                                        id="credit_limit"
                                        name="credit_limit"
                                        value={formData.credit_limit}
                                        onChange={handleChange}
                                        min="0"
                                        step="100000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-white rounded-xl border border-border p-6 col-span-2 max-lg:col-span-1">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-5 pb-3 border-b border-slate-100 [&>svg]:text-primary">
                            <Star size={20} />
                            Notes
                        </h2>
                        <div className="form-group">
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Internal notes about this customer..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
