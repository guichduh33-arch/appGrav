import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './SuppliersPage.css'

interface Supplier {
    id: string
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    postal_code: string | null
    country: string | null
    tax_id: string | null
    payment_terms: string | null
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

// Helper function to format payment terms for display
const formatPaymentTerms = (term: string | null): string => {
    if (!term) return ''
    const termMap: Record<string, string> = {
        'cod': 'Comptant (COD)',
        'net15': 'Net 15 jours',
        'net30': 'Net 30 jours',
        'net60': 'Net 60 jours'
    }
    return termMap[term] || term
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
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
        country: 'France',
        tax_id: '',
        payment_terms: 'net30',
        notes: '',
        is_active: true
    })

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .order('name')

            if (error) throw error
            if (data) {
                setSuppliers(data)
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error)
        } finally {
            setLoading(false)
        }
    }

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
                country: 'France',
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
                // Update existing supplier
                const { error } = await supabase
                    .from('suppliers')
                    .update(formData)
                    .eq('id', editingSupplier.id)

                if (error) throw error
            } else {
                // Create new supplier
                const { error } = await supabase
                    .from('suppliers')
                    .insert([formData])

                if (error) throw error
            }

            await fetchSuppliers()
            handleCloseModal()
        } catch (error: any) {
            console.error('Error saving supplier:', error)
            const errorMessage = error?.message || error?.error_description || 'Erreur inconnue'
            alert(`Erreur lors de l'enregistrement du fournisseur:\n${errorMessage}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('suppliers')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchSuppliers()
        } catch (error) {
            console.error('Error deleting supplier:', error)
            alert('Erreur lors de la suppression du fournisseur')
        }
    }

    const handleToggleActive = async (supplier: Supplier) => {
        try {
            const { error } = await supabase
                .from('suppliers')
                .update({ is_active: !supplier.is_active })
                .eq('id', supplier.id)

            if (error) throw error
            await fetchSuppliers()
        } catch (error) {
            console.error('Error toggling supplier status:', error)
        }
    }

    const filteredSuppliers = suppliers.filter(supplier =>
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
                        Fournisseurs
                    </h1>
                    <p className="suppliers-page__subtitle">
                        Gérez vos fournisseurs et leurs informations de contact
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Nouveau Fournisseur
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
                        <div className="suppliers-stat__label">Total Fournisseurs</div>
                    </div>
                </div>
                <div className="suppliers-stat">
                    <div className="suppliers-stat__icon suppliers-stat__icon--success">
                        <CheckCircle size={24} />
                    </div>
                    <div className="suppliers-stat__content">
                        <div className="suppliers-stat__value">{activeSuppliers.length}</div>
                        <div className="suppliers-stat__label">Actifs</div>
                    </div>
                </div>
                <div className="suppliers-stat">
                    <div className="suppliers-stat__icon suppliers-stat__icon--gray">
                        <XCircle size={24} />
                    </div>
                    <div className="suppliers-stat__content">
                        <div className="suppliers-stat__value">{inactiveSuppliers.length}</div>
                        <div className="suppliers-stat__label">Inactifs</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="suppliers-search">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="Rechercher un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Rechercher"
                />
            </div>

            {/* Suppliers List */}
            {loading ? (
                <div className="suppliers-loading">Chargement...</div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="suppliers-empty">
                    <Building2 size={48} />
                    <h3>Aucun fournisseur</h3>
                    <p>Commencez par ajouter votre premier fournisseur</p>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nouveau Fournisseur
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
                                        title={supplier.is_active ? 'Désactiver' : 'Activer'}
                                        aria-label={supplier.is_active ? 'Désactiver' : 'Activer'}
                                    >
                                        {supplier.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleOpenModal(supplier)}
                                        aria-label="Modifier"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className="btn-icon btn-icon--danger"
                                        onClick={() => handleDelete(supplier.id)}
                                        aria-label="Supprimer"
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
                                        <strong>Conditions:</strong> {formatPaymentTerms(supplier.payment_terms)}
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
                                {editingSupplier ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal__body">
                                <div className="supplier-form">
                                    {/* Basic Info */}
                                    <div className="supplier-form__section">
                                        <h3>Informations de base</h3>
                                        <div className="supplier-form__grid">
                                            <div className="form-group form-group--full">
                                                <label>Nom du fournisseur *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    aria-label="Nom du fournisseur"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Personne de contact</label>
                                                <input
                                                    type="text"
                                                    value={formData.contact_person || ''}
                                                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                                    aria-label="Personne de contact"
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
                                                <label>Téléphone</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone || ''}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    aria-label="Téléphone"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="supplier-form__section">
                                        <h3>Adresse</h3>
                                        <div className="supplier-form__grid">
                                            <div className="form-group form-group--full">
                                                <label>Adresse</label>
                                                <input
                                                    type="text"
                                                    value={formData.address || ''}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                    aria-label="Adresse"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Ville</label>
                                                <input
                                                    type="text"
                                                    value={formData.city || ''}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    aria-label="Ville"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Code Postal</label>
                                                <input
                                                    type="text"
                                                    value={formData.postal_code || ''}
                                                    onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
                                                    aria-label="Code Postal"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Pays</label>
                                                <input
                                                    type="text"
                                                    value={formData.country || ''}
                                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                                    aria-label="Pays"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Info */}
                                    <div className="supplier-form__section">
                                        <h3>Informations commerciales</h3>
                                        <div className="supplier-form__grid">
                                            <div className="form-group">
                                                <label>Numéro de TVA</label>
                                                <input
                                                    type="text"
                                                    value={formData.tax_id || ''}
                                                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                                    aria-label="Numéro de TVA"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Conditions de paiement</label>
                                                <select
                                                    value={formData.payment_terms || ''}
                                                    onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
                                                    aria-label="Conditions de paiement"
                                                >
                                                    <option value="cod">Comptant (COD)</option>
                                                    <option value="net15">Net 15 jours</option>
                                                    <option value="net30">Net 30 jours</option>
                                                    <option value="net60">Net 60 jours</option>
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
                                                    Fournisseur actif
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal__footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSupplier ? 'Enregistrer' : 'Créer Fournisseur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
