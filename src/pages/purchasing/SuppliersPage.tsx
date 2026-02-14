import { useState } from 'react'
import { Plus, Search, Building2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSuppliers, type ISupplier } from '@/hooks/purchasing/useSuppliers'
import {
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
    useToggleSupplierActive,
} from '@/hooks/purchasing/useSuppliersCrud'
import type { ISupplierFormData } from '@/hooks/purchasing/useSuppliersCrud'
import { logError } from '@/utils/logger'
import { SupplierCard } from './suppliers/SupplierCard'
import { SupplierFormModal } from './suppliers/SupplierFormModal'

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
            logError('Error saving supplier:', error)
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
            logError('Error deleting supplier:', error)
            toast.error('Error deleting supplier')
        }
    }

    const handleToggleActive = async (supplier: Supplier) => {
        try {
            await toggleActiveMutation.mutateAsync({ id: supplier.id, isActive: supplier.is_active })
        } catch (error) {
            logError('Error toggling supplier status:', error)
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
        <div className="min-h-screen bg-[var(--theme-bg-primary)] p-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">
                        Supplier{' '}
                        <span className="font-bold">Management</span>
                    </h1>
                    <p className="text-sm text-[var(--muted-smoke)]">
                        Manage your suppliers and their contact information
                    </p>
                </div>
                <button
                    className="bg-[var(--color-gold)] px-5 py-2.5 rounded-xl text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-gold)]/90 transition-all flex items-center gap-2 shadow-lg shadow-[var(--color-gold)]/10"
                    onClick={() => handleOpenModal()}
                >
                    <Plus size={16} />
                    Add New Supplier
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-10">
                {[
                    { icon: Building2, label: 'Total Suppliers', value: suppliers.length, color: 'text-[var(--color-gold)]', bg: 'bg-[var(--color-gold)]/10' },
                    { icon: CheckCircle, label: 'Active', value: activeSuppliers.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { icon: XCircle, label: 'Inactive', value: inactiveSuppliers.length, color: 'text-[var(--muted-smoke)]', bg: 'bg-white/5' },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-4 p-5 bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xl font-bold text-white leading-none mb-1">{stat.value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-smoke)]">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-smoke)]" />
                <input
                    type="text"
                    placeholder="Search suppliers, categories, or contact person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search"
                    className="w-full py-2.5 px-4 pl-11 bg-[var(--onyx-surface)] border border-white/10 rounded-xl text-white text-sm placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 transition-all"
                />
            </div>

            {/* Suppliers List */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-lg text-[var(--muted-smoke)]">Loading...</div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[var(--onyx-surface)] border-2 border-dashed border-white/10 rounded-xl text-center">
                    <Building2 size={48} className="text-white/10 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">No suppliers</h3>
                    <p className="text-sm text-[var(--muted-smoke)] mb-6">Start by adding your first supplier</p>
                    <button
                        className="bg-[var(--color-gold)] px-5 py-2.5 rounded-xl text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--color-gold)]/90 transition-all flex items-center gap-2"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus size={16} />
                        Add New Supplier
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
                    {filteredSuppliers.map(supplier => (
                        <SupplierCard
                            key={supplier.id}
                            supplier={supplier}
                            onEdit={() => handleOpenModal(supplier)}
                            onDelete={() => handleDelete(supplier.id)}
                            onToggleActive={() => handleToggleActive(supplier)}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <SupplierFormModal
                    isEditing={!!editingSupplier}
                    formData={formData}
                    onFormChange={setFormData}
                    onSubmit={handleSubmit}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}
