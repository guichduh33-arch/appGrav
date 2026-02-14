import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, Star } from 'lucide-react'
import {
    useCustomerCategories,
    useCustomerById,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer,
    type ICustomerCategory,
} from '@/hooks/customers'
import { CustomerFormHeader } from '@/components/customers/CustomerFormHeader'
import { CustomerBasicForm } from '@/components/customers/CustomerBasicForm'
import { CustomerCategoryForm } from '@/components/customers/CustomerCategoryForm'

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
    tax_id: string
    payment_terms: string
    credit_limit: number
}

const inputClass = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none'
const labelClass = 'block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-2'
const selectClass = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 outline-none cursor-pointer'

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
        name: '', company_name: '', phone: '', email: '', address: '',
        customer_type: 'retail', category_id: '', date_of_birth: '',
        notes: '', is_active: true, tax_id: '', payment_terms: 'cod', credit_limit: 0,
    })

    useEffect(() => {
        if (customer) {
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
                credit_limit: (raw.credit_limit as number) || 0,
            })
            setCustomerQR((raw.loyalty_qr_code as string) || null)
            setMembershipNumber(customer.membership_number)
        }
    }, [customer])

    useEffect(() => {
        if (!id && categories.length > 0) {
            const standardCat = categories.find((c: ICustomerCategory) => c.slug === 'standard')
            if (standardCat) setFormData(prev => ({ ...prev, category_id: standardCat.id }))
        }
    }, [categories, id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }))
    }

    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find((c: ICustomerCategory) => c.id === categoryId)
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            customer_type: category?.slug === 'wholesale' ? 'wholesale' : 'retail',
        }))
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!formData.name.trim()) return

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
            payment_terms: formData.payment_terms || 'cod',
            credit_limit: formData.credit_limit || 0,
        }
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
            // Error toast handled by mutation hooks
        }
    }

    const handleDelete = async () => {
        if (!id) return
        if (!confirm('Are you sure you want to delete this customer?')) return
        try {
            await deleteCustomer.mutateAsync(id)
            navigate('/customers')
        } catch {
            // Error toast handled by mutation hook
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-w-[1200px] mx-auto max-md:p-4">
                <div className="flex flex-col items-center justify-center py-16 px-8 text-[var(--muted-smoke)] gap-4">
                    <div className="spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6 max-w-[1200px] mx-auto max-md:p-4">
            <CustomerFormHeader
                isEditing={isEditing}
                membershipNumber={membershipNumber}
                saving={saving}
                onBack={() => navigate('/customers')}
                onSave={() => handleSubmit()}
                onDelete={isEditing ? handleDelete : undefined}
            />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                    <CustomerBasicForm formData={formData} onChange={handleChange} />

                    <CustomerCategoryForm
                        categories={categories}
                        selectedCategoryId={formData.category_id}
                        isActive={formData.is_active}
                        isEditing={isEditing}
                        customerQR={customerQR}
                        onCategoryChange={handleCategoryChange}
                        onActiveChange={handleChange}
                    />

                    {/* B2B Settings */}
                    {formData.customer_type === 'wholesale' && (
                        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
                            <h2 className="flex items-center gap-2 text-base font-display font-bold text-white mb-5 pb-3 border-b border-white/5">
                                <Building2 size={18} className="text-[var(--color-gold)]" />
                                B2B Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="tax_id" className={labelClass}>Tax ID / NPWP</label>
                                    <input type="text" id="tax_id" name="tax_id" value={formData.tax_id} onChange={handleChange} placeholder="Tax identification number" className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                    <div>
                                        <label htmlFor="payment_terms" className={labelClass}>Payment terms</label>
                                        <select id="payment_terms" name="payment_terms" value={formData.payment_terms} onChange={handleChange} className={selectClass}>
                                            <option value="cod">Cash on Delivery (COD)</option>
                                            <option value="net15">Net 15 days</option>
                                            <option value="net30">Net 30 days</option>
                                            <option value="net60">Net 60 days</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="credit_limit" className={labelClass}>Credit limit (IDR)</label>
                                        <input type="number" id="credit_limit" name="credit_limit" value={formData.credit_limit} onChange={handleChange} min="0" step="100000" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 col-span-2 max-lg:col-span-1">
                        <h2 className="flex items-center gap-2 text-base font-display font-bold text-white mb-5 pb-3 border-b border-white/5">
                            <Star size={18} className="text-[var(--color-gold)]" />
                            Notes
                        </h2>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Internal notes about this customer..."
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>
                </div>
            </form>
        </div>
    )
}
