import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useSuppliers, type ISupplier } from '@/hooks/purchasing/useSuppliers'
import {
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
    useToggleSupplierActive,
} from '@/hooks/purchasing/useSuppliersCrud'
import type { ISupplierFormData } from '@/hooks/purchasing/useSuppliersCrud'

// Extended supplier type for the page (the DB returns all columns via select('*'))
interface Supplier extends ISupplier {
    contact_person: string | null
    city: string | null
    postal_code: string | null
    country: string | null
    tax_id: string | null
    payment_terms: string | null
    notes: string | null
}

// Helper function to format payment terms for display
const formatPaymentTerms = (term: string | null): string => {
    if (!term) return ''
    const termMap: Record<string, string> = {
        'cod': 'Cash on Delivery (COD)',
        'net15': 'Net 15 days',
        'net30': 'Net 30 days',
        'net60': 'Net 60 days'
    }
    return termMap[term] || term
}

export default function SuppliersPage() {
    // React Query hooks
    const { data: suppliers = [], isLoading: loading } = useSuppliers()
    const createSupplierMutation = useCreateSupplier()
    const updateSupplierMutation = useUpdateSupplier()
    const deleteSupplierMutation = useDeleteSupplier()
    const toggleActiveMutation = useToggleSupplierActive()

    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [formData, setFormData] = useState<Partial<Supplier>>({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'Indonesia',
        tax_id: '',
        payment_terms: 'net30',
        notes: '',
        is_active: true
    })

    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier)
            setFormData(supplier)
        } else {
            setEditingSupplier(null)
            setFormData({
                name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postal_code: '',
                country: 'Indonesia',
                tax_id: '',
                payment_terms: 'net30',
                notes: '',
                is_active: true
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingSupplier(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingSupplier) {
                await updateSupplierMutation.mutateAsync({
                    id: editingSupplier.id,
                    data: formData as ISupplierFormData,
                })
            } else {
                await createSupplierMutation.mutateAsync(formData as ISupplierFormData)
            }
            handleCloseModal()
        } catch (error) {
            console.error('Error saving supplier:', error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            toast.error(`Error saving supplier: ${errorMessage}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) {
            return
        }

        try {
            await deleteSupplierMutation.mutateAsync(id)
        } catch (error) {
            console.error('Error deleting supplier:', error)
            toast.error('Error deleting supplier')
        }
    }

    const handleToggleActive = async (supplier: Supplier) => {
        try {
            await toggleActiveMutation.mutateAsync({ id: supplier.id, isActive: supplier.is_active })
        } catch (error) {
            console.error('Error toggling supplier status:', error)
        }
    }

    const filteredSuppliers = (suppliers as Supplier[]).filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const activeSuppliers = filteredSuppliers.filter(s => s.is_active)
    const inactiveSuppliers = filteredSuppliers.filter(s => !s.is_active)

    return (
        <div className="p-xl max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-xl">
                <div>
                    <h1 className="flex items-center gap-md text-3xl font-bold text-white m-0 mb-sm">
                        <Building2 size={32} />
                        Suppliers
                    </h1>
                    <p className="text-base text-muted-foreground m-0">
                        Manage your suppliers and their contact information
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    New Supplier
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-lg mb-xl">
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue-500/15 text-primary">
                        <Building2 size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-3xl font-bold text-white leading-none mb-1">{suppliers.length}</div>
                        <div className="text-sm text-muted-foreground">Total Suppliers</div>
                    </div>
                </div>
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-emerald-500/15 text-success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-3xl font-bold text-white leading-none mb-1">{activeSuppliers.length}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                </div>
                <div className="flex items-center gap-md p-lg bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg">
                    <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gray-500/15 text-muted-foreground">
                        <XCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="text-3xl font-bold text-white leading-none mb-1">{inactiveSuppliers.length}</div>
                        <div className="text-sm text-muted-foreground">Inactive</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-lg">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search for a supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search"
                    className="w-full py-3 px-4 pl-12 bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg text-white text-base focus:outline-none focus:border-primary"
                />
            </div>

            {/* Suppliers List */}
            {loading ? (
                <div className="flex items-center justify-center p-3xl text-lg text-muted-foreground">Loading...</div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-3xl bg-[var(--color-gray-800)] border-2 border-dashed border-[var(--color-gray-700)] rounded-xl text-center">
                    <Building2 size={48} className="text-[var(--color-gray-600)] mb-md" />
                    <h3 className="text-xl font-bold text-white m-0 mb-sm">No suppliers</h3>
                    <p className="text-base text-muted-foreground m-0 mb-lg">Start by adding your first supplier</p>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        New Supplier
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-lg">
                    {filteredSuppliers.map(supplier => (
                        <div
                            key={supplier.id}
                            className={cn(
                                "bg-[var(--color-gray-800)] border border-[var(--color-gray-700)] rounded-lg p-lg transition-all duration-200 hover:border-primary hover:shadow-md",
                                !supplier.is_active && "opacity-60 border-[var(--color-gray-600)] hover:opacity-80"
                            )}
                        >
                            <div className="flex justify-between items-start mb-md pb-md border-b border-[var(--color-gray-700)]">
                                <div className="flex items-center gap-2 text-lg font-bold text-white">
                                    <Building2 size={20} />
                                    {supplier.name}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-primary-light"
                                        onClick={() => handleToggleActive(supplier)}
                                        title={supplier.is_active ? 'Deactivate' : 'Activate'}
                                        aria-label={supplier.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {supplier.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    </button>
                                    <button
                                        className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-primary-light"
                                        onClick={() => handleOpenModal(supplier)}
                                        aria-label="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className="flex items-center justify-center w-8 h-8 bg-transparent border-none rounded-md text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-red-500/15 hover:text-danger"
                                        onClick={() => handleDelete(supplier.id)}
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-sm">
                                {supplier.contact_person && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-gray-300)]">
                                        <strong className="text-muted-foreground font-semibold">Contact:</strong> {supplier.contact_person}
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-gray-300)] [&>svg]:text-primary [&>svg]:shrink-0">
                                        <Mail size={16} />
                                        {supplier.email}
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-gray-300)] [&>svg]:text-primary [&>svg]:shrink-0">
                                        <Phone size={16} />
                                        {supplier.phone}
                                    </div>
                                )}
                                {supplier.city && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-gray-300)] [&>svg]:text-primary [&>svg]:shrink-0">
                                        <MapPin size={16} />
                                        {supplier.city}, {supplier.country}
                                    </div>
                                )}
                                {supplier.payment_terms && (
                                    <div className="flex items-center gap-2 text-sm text-[var(--color-gray-300)]">
                                        <strong className="text-muted-foreground font-semibold">Terms:</strong> {formatPaymentTerms(supplier.payment_terms)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop is-active" onClick={handleCloseModal}>
                    <div className="modal is-active w-[700px] max-w-[90vw] max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <div className="modal__header px-lg py-md">
                            <h2 className="modal__title">
                                {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal__body p-lg overflow-y-auto">
                                <div className="flex flex-col gap-lg max-h-[60vh] overflow-y-auto pr-sm">
                                    {/* Basic Info */}
                                    <div className="flex flex-col gap-md">
                                        <h3 className="text-base font-bold text-white m-0 pb-sm border-b border-[var(--color-gray-700)]">Basic Information</h3>
                                        <div className="grid grid-cols-2 gap-md max-md:grid-cols-1">
                                            <div className="form-group col-span-full">
                                                <label>Supplier Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    aria-label="Supplier name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact Person</label>
                                                <input
                                                    type="text"
                                                    value={formData.contact_person || ''}
                                                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                                    aria-label="Contact person"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    value={formData.email || ''}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    aria-label="Email"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone || ''}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    aria-label="Phone"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex flex-col gap-md">
                                        <h3 className="text-base font-bold text-white m-0 pb-sm border-b border-[var(--color-gray-700)]">Address</h3>
                                        <div className="grid grid-cols-2 gap-md max-md:grid-cols-1">
                                            <div className="form-group col-span-full">
                                                <label>Address</label>
                                                <input
                                                    type="text"
                                                    value={formData.address || ''}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                    aria-label="Address"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>City</label>
                                                <input
                                                    type="text"
                                                    value={formData.city || ''}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    aria-label="City"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Postal Code</label>
                                                <input
                                                    type="text"
                                                    value={formData.postal_code || ''}
                                                    onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                                                    aria-label="Postal Code"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Country</label>
                                                <input
                                                    type="text"
                                                    value={formData.country || ''}
                                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                                    aria-label="Country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Info */}
                                    <div className="flex flex-col gap-md">
                                        <h3 className="text-base font-bold text-white m-0 pb-sm border-b border-[var(--color-gray-700)]">Business Information</h3>
                                        <div className="grid grid-cols-2 gap-md max-md:grid-cols-1">
                                            <div className="form-group">
                                                <label>Tax ID</label>
                                                <input
                                                    type="text"
                                                    value={formData.tax_id || ''}
                                                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                                    aria-label="Tax ID"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Payment Terms</label>
                                                <select
                                                    value={formData.payment_terms || ''}
                                                    onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
                                                    aria-label="Payment terms"
                                                >
                                                    <option value="cod">Cash on Delivery (COD)</option>
                                                    <option value="net15">Net 15 days</option>
                                                    <option value="net30">Net 30 days</option>
                                                    <option value="net60">Net 60 days</option>
                                                </select>
                                            </div>
                                            <div className="form-group col-span-full">
                                                <label>Notes</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.notes || ''}
                                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                    aria-label="Notes"
                                                />
                                            </div>
                                            <div className="form-group col-span-full">
                                                <label className="flex items-center gap-sm cursor-pointer !text-white !font-medium">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_active}
                                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                        className="w-5 h-5 cursor-pointer"
                                                    />
                                                    Supplier active
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal__footer px-lg py-md">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSupplier ? 'Save' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
