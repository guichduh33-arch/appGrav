import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSuppliers, type ISupplier } from '@/hooks/purchasing/useSuppliers'
import {
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
    useToggleSupplierActive,
} from '@/hooks/purchasing/useSuppliersCrud'
import type { ISupplierFormData } from '@/hooks/purchasing/useSuppliersCrud'
import './SuppliersPage.css'

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
        } catch (error: any) {
            console.error('Error saving supplier:', error)
            const errorMessage = error?.message || error?.error_description || 'Unknown error'
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
        <div className="suppliers-page">
            {/* Header */}
            <div className="suppliers-page__header">
                <div>
                    <h1 className="suppliers-page__title">
                        <Building2 size={32} />
                        Suppliers
                    </h1>
                    <p className="suppliers-page__subtitle">
                        Manage your suppliers and their contact information
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    New Supplier
                </button>
            </div>

            {/* Stats */}
            <div className="suppliers-stats">
                <div className="suppliers-stat">
                    <div className="suppliers-stat__icon suppliers-stat__icon--primary">
                        <Building2 size={24} />
                    </div>
                    <div className="suppliers-stat__content">
                        <div className="suppliers-stat__value">{suppliers.length}</div>
                        <div className="suppliers-stat__label">Total Suppliers</div>
                    </div>
                </div>
                <div className="suppliers-stat">
                    <div className="suppliers-stat__icon suppliers-stat__icon--success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="suppliers-stat__content">
                        <div className="suppliers-stat__value">{activeSuppliers.length}</div>
                        <div className="suppliers-stat__label">Active</div>
                    </div>
                </div>
                <div className="suppliers-stat">
                    <div className="suppliers-stat__icon suppliers-stat__icon--gray">
                        <XCircle size={24} />
                    </div>
                    <div className="suppliers-stat__content">
                        <div className="suppliers-stat__value">{inactiveSuppliers.length}</div>
                        <div className="suppliers-stat__label">Inactive</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="suppliers-search">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Search for a supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search"
                />
            </div>

            {/* Suppliers List */}
            {loading ? (
                <div className="suppliers-loading">Loading...</div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="suppliers-empty">
                    <Building2 size={48} />
                    <h3>No suppliers</h3>
                    <p>Start by adding your first supplier</p>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        New Supplier
                    </button>
                </div>
            ) : (
                <div className="suppliers-grid">
                    {filteredSuppliers.map(supplier => (
                        <div key={supplier.id} className={`supplier-card ${!supplier.is_active ? 'supplier-card--inactive' : ''}`}>
                            <div className="supplier-card__header">
                                <div className="supplier-card__name">
                                    <Building2 size={20} />
                                    {supplier.name}
                                </div>
                                <div className="supplier-card__actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleToggleActive(supplier)}
                                        title={supplier.is_active ? 'Deactivate' : 'Activate'}
                                        aria-label={supplier.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {supplier.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleOpenModal(supplier)}
                                        aria-label="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className="btn-icon btn-icon--danger"
                                        onClick={() => handleDelete(supplier.id)}
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="supplier-card__body">
                                {supplier.contact_person && (
                                    <div className="supplier-card__info">
                                        <strong>Contact:</strong> {supplier.contact_person}
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="supplier-card__info">
                                        <Mail size={16} />
                                        {supplier.email}
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="supplier-card__info">
                                        <Phone size={16} />
                                        {supplier.phone}
                                    </div>
                                )}
                                {supplier.city && (
                                    <div className="supplier-card__info">
                                        <MapPin size={16} />
                                        {supplier.city}, {supplier.country}
                                    </div>
                                )}
                                {supplier.payment_terms && (
                                    <div className="supplier-card__info">
                                        <strong>Terms:</strong> {formatPaymentTerms(supplier.payment_terms)}
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
                    <div className="modal modal-lg is-active" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">
                                {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal__body">
                                <div className="supplier-form">
                                    {/* Basic Info */}
                                    <div className="supplier-form__section">
                                        <h3>Basic Information</h3>
                                        <div className="supplier-form__grid">
                                            <div className="form-group form-group--full">
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
                                    <div className="supplier-form__section">
                                        <h3>Address</h3>
                                        <div className="supplier-form__grid">
                                            <div className="form-group form-group--full">
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
                                    <div className="supplier-form__section">
                                        <h3>Business Information</h3>
                                        <div className="supplier-form__grid">
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
                                            <div className="form-group form-group--full">
                                                <label>Notes</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.notes || ''}
                                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                    aria-label="Notes"
                                                />
                                            </div>
                                            <div className="form-group form-group--full">
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_active}
                                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                    />
                                                    Supplier active
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal__footer">
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
