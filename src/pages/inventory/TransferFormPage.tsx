import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Trash2, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import './TransferFormPage.css'

interface Location {
    id: string
    name: string
    code: string
    location_type: string
}

interface Product {
    id: string
    name: string
    sku: string
    cost_price: number | null
    stock_unit: string
}

interface TransferItem {
    id?: string
    product_id: string
    product_name: string
    quantity_requested: number
    unit: string
    unit_cost: number
    line_total: number
}

export default function TransferFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useAuthStore()
    const isEditing = Boolean(id)

    const [locations, setLocations] = useState<Location[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    const [fromLocationId, setFromLocationId] = useState('')
    const [toLocationId, setToLocationId] = useState('')
    const [responsiblePerson, setResponsiblePerson] = useState('')
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState<TransferItem[]>([])

    useEffect(() => {
        fetchLocations()
        fetchProducts()
        if (id) fetchTransfer()
    }, [id])

    const fetchLocations = async () => {
        const { data } = await supabase
            .from('stock_locations')
            .select('*')
            .neq('is_active', false)
            .order('name')
        if (data) setLocations(data as unknown as Location[])
    }

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name, sku, cost_price, unit')
            .neq('is_active', false)
            .order('name')
        if (data) setProducts(data as unknown as Product[])
    }

    const fetchTransfer = async () => {
        try {
            const { data: transfer, error: transferError } = await supabase
                .from('internal_transfers')
                .select('*')
                .eq('id', id!)
                .single()

            if (transferError) throw transferError

            const { data: transferItems, error: itemsError } = await supabase
                .from('transfer_items')
                .select(`
                    *,
                    product:products(name)
                `)
                .eq('transfer_id', id!)

            if (itemsError) throw itemsError

            const t = transfer as any
            setFromLocationId(transfer.from_location_id)
            setToLocationId(transfer.to_location_id)
            setResponsiblePerson(t.responsible_person || transfer.requested_by || '')
            setTransferDate(t.transfer_date || transfer.created_at?.split('T')[0] || '')
            setNotes(transfer.notes || '')

            const rawItems = transferItems as unknown as Array<{
                id: string;
                product_id: string;
                product: { name: string };
                quantity_requested: number;
                unit?: string;
                unit_cost?: number;
                line_total?: number;
            }>;
            setItems(rawItems.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product.name,
                quantity_requested: item.quantity_requested,
                unit: item.unit || 'pcs',
                unit_cost: item.unit_cost || 0,
                line_total: item.line_total || 0
            })))
        } catch (error) {
            console.error('Error fetching transfer:', error)
            toast.error('Erreur lors du chargement')
            navigate('/inventory/transfers')
        }
    }

    const addItem = () => {
        setItems([...items, {
            product_id: '',
            product_name: '',
            quantity_requested: 1,
            unit: 'unit',
            unit_cost: 0,
            line_total: 0
        }])
    }

    const updateItem = (index: number, field: keyof TransferItem, value: string | number | null) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === 'product_id') {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index].product_name = product.name
                newItems[index].unit = product.stock_unit || 'unit'
                newItems[index].unit_cost = product.cost_price || 0
            }
        }

        if (field === 'quantity_requested' || field === 'unit_cost') {
            newItems[index].line_total = newItems[index].quantity_requested * newItems[index].unit_cost
        }

        setItems(newItems)
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const getTotalValue = () => {
        return items.reduce((sum, item) => sum + item.line_total, 0)
    }

    const handleSubmit = async (sendDirectly: boolean = false) => {
        if (!fromLocationId || !toLocationId) {
            toast.error('Veuillez sélectionner les emplacements')
            return
        }

        if (!responsiblePerson.trim()) {
            toast.error('Veuillez indiquer le responsable')
            return
        }

        if (items.length === 0) {
            toast.error('Veuillez ajouter au moins un article')
            return
        }

        if (items.some(item => !item.product_id || item.quantity_requested <= 0)) {
            toast.error('Veuillez remplir tous les articles correctement')
            return
        }

        setLoading(true)
        try {
            const transferNumber = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
            const transferData = {
                transfer_number: transferNumber,
                from_location_id: fromLocationId,
                to_location_id: toLocationId,
                status: sendDirectly ? 'pending' : 'draft',
                notes: notes.trim() || null,
                requested_by: user?.id
            }

            if (isEditing) {
                const { error } = await supabase
                    .from('internal_transfers')
                    .update(transferData as never)
                    .eq('id', id!)

                if (error) throw error

                await supabase.from('transfer_items').delete().eq('transfer_id', id!)
            }

            let transferId = id

            if (!isEditing) {
                const { data: newTransfer, error } = await supabase
                    .from('internal_transfers')
                    .insert(transferData as never)
                    .select()
                    .single()

                if (error) throw error
                transferId = newTransfer.id
            }

            const itemsToInsert = items.map(item => ({
                transfer_id: transferId,
                product_id: item.product_id,
                quantity_requested: item.quantity_requested,
                quantity_received: sendDirectly ? item.quantity_requested : 0
            }))

            const { error: itemsError } = await supabase
                .from('transfer_items')
                .insert(itemsToInsert as never)

            if (itemsError) throw itemsError

            toast.success(isEditing ? 'Transfert mis à jour' : 'Transfert créé')
            navigate('/inventory/transfers')
        } catch (error) {
            console.error('Error saving transfer:', error)
            toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="transfer-form-page">
            <header className="transfer-form-header">
                <button className="btn btn-ghost" onClick={() => navigate('/inventory/transfers')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="transfer-form-title">
                        {isEditing ? 'Modifier Transfert' : 'Nouveau Transfert'}
                    </h1>
                    <p className="transfer-form-subtitle">
                        Transfert entre dépôt et section
                    </p>
                </div>
            </header>

            <div className="transfer-form-container">
                {/* General Info */}
                <div className="transfer-form-section">
                    <h2>Informations Générales</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>De (Origine) *</label>
                            <select value={fromLocationId} onChange={(e) => setFromLocationId(e.target.value)}>
                                <option value="">Sélectionner...</option>
                                {locations.filter(l => l.location_type === 'main_warehouse').map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Vers (Destination) *</label>
                            <select value={toLocationId} onChange={(e) => setToLocationId(e.target.value)}>
                                <option value="">Sélectionner...</option>
                                {locations.filter(l => l.location_type === 'section').map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Responsable Section *</label>
                            <input
                                type="text"
                                value={responsiblePerson}
                                onChange={(e) => setResponsiblePerson(e.target.value)}
                                placeholder="Nom du responsable"
                            />
                        </div>
                        <div className="form-group">
                            <label>Date de Transfert *</label>
                            <input
                                type="date"
                                value={transferDate}
                                onChange={(e) => setTransferDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Notes optionnelles..."
                        />
                    </div>
                </div>

                {/* Items */}
                <div className="transfer-form-section">
                    <div className="section-header">
                        <h2>Articles à Transférer</h2>
                        <button className="btn btn-secondary btn-sm" onClick={addItem}>
                            <Plus size={16} />
                            Ajouter Article
                        </button>
                    </div>

                    {items.length === 0 ? (
                        <div className="no-items">
                            <p>Aucun article. Cliquez sur "Ajouter Article" pour commencer.</p>
                        </div>
                    ) : (
                        <div className="items-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th style={{ width: '120px' }}>Quantité</th>
                                        <th style={{ width: '120px' }}>Coût Unit.</th>
                                        <th style={{ width: '120px' }}>Total</th>
                                        <th style={{ width: '60px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                                >
                                                    <option value="">Sélectionner produit...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} {p.sku && `(${p.sku})`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.quantity_requested}
                                                    onChange={(e) => updateItem(index, 'quantity_requested', Number(e.target.value))}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_cost}
                                                    onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                                                />
                                            </td>
                                            <td className="total-cell">€{item.line_total.toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {items.length > 0 && (
                        <div className="transfer-summary">
                            <div className="summary-row">
                                <span className="summary-label">Total Articles:</span>
                                <span className="summary-value">{items.length}</span>
                            </div>
                            <div className="summary-row total">
                                <span className="summary-label">Valeur Totale:</span>
                                <span className="summary-value">€{getTotalValue().toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="transfer-form-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/inventory/transfers')}>
                        Annuler
                    </button>
                    <div className="action-group">
                        <button
                            className="btn btn-outline"
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                        >
                            <Save size={18} />
                            Enregistrer Brouillon
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                        >
                            <Send size={18} />
                            {loading ? 'Enregistrement...' : 'Enregistrer et Envoyer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
