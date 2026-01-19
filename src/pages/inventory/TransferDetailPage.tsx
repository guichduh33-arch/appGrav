import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Edit, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import './TransferDetailPage.css'

interface Transfer {
    id: string
    transfer_number: string
    from_location_name: string
    to_location_name: string
    status: string
    responsible_person: string
    transfer_date: string
    total_items: number
    total_value: number
    notes: string | null
    items: Array<{
        id: string
        product_name: string
        quantity_requested: number
        quantity_received: number
        unit: string
        unit_cost: number
        line_total: number
    }>
}

export default function TransferDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useAuthStore()
    const [transfer, setTransfer] = useState<Transfer | null>(null)
    const [loading, setLoading] = useState(true)
    const [receiving, setReceiving] = useState(false)

    useEffect(() => {
        if (id) fetchTransfer()
    }, [id])

    const fetchTransfer = async () => {
        try {
            const { data: t, error: tError } = await supabase
                .from('internal_transfers')
                .select(`
                    *,
                    from_location:stock_locations!internal_transfers_from_location_id_fkey(name),
                    to_location:stock_locations!internal_transfers_to_location_id_fkey(name)
                `)
                .eq('id', id)
                .single()

            if (tError) throw tError

            const { data: items, error: iError } = await supabase
                .from('transfer_items')
                .select(`
                    *,
                    product:products(name)
                `)
                .eq('transfer_id', id)

            if (iError) throw iError

            setTransfer({
                id: t.id,
                transfer_number: t.transfer_number,
                from_location_name: t.from_location?.name,
                to_location_name: t.to_location?.name,
                status: t.status,
                responsible_person: t.responsible_person,
                transfer_date: t.transfer_date,
                total_items: t.total_items,
                total_value: t.total_value,
                notes: t.notes,
                items: items.map((i: any) => ({
                    id: i.id,
                    product_name: i.product.name,
                    quantity_requested: i.quantity_requested,
                    quantity_received: i.quantity_received,
                    unit: i.unit,
                    unit_cost: i.unit_cost,
                    line_total: i.line_total
                }))
            })
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erreur lors du chargement')
            navigate('/inventory/transfers')
        } finally {
            setLoading(false)
        }
    }

    const handleReceive = async () => {
        if (!transfer) return

        setReceiving(true)
        try {
            // Update items with received quantities
            for (const item of transfer.items) {
                await supabase
                    .from('transfer_items')
                    .update({ quantity_received: item.quantity_requested })
                    .eq('id', item.id)
            }

            // Update transfer status
            await supabase
                .from('internal_transfers')
                .update({
                    status: 'received',
                    received_by: user?.id,
                    received_by_name: user?.name,
                    received_at: new Date().toISOString()
                })
                .eq('id', transfer.id)

            toast.success('Transfert reçu avec succès')
            fetchTransfer()
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erreur lors de la réception')
        } finally {
            setReceiving(false)
        }
    }

    if (loading) return <div className="transfer-detail-loading">Chargement...</div>
    if (!transfer) return null

    const canReceive = transfer.status === 'pending' || transfer.status === 'in_transit'

    return (
        <div className="transfer-detail-page">
            <header className="transfer-detail-header">
                <button className="btn btn-ghost" onClick={() => navigate('/inventory/transfers')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="transfer-detail-title">{transfer.transfer_number}</h1>
                    <p className="transfer-detail-subtitle">Détails du transfert</p>
                </div>
                <div className="header-actions">
                    {canReceive && (
                        <button
                            className="btn btn-success"
                            onClick={handleReceive}
                            disabled={receiving}
                        >
                            <CheckCircle size={18} />
                            {receiving ? 'Réception...' : 'Marquer comme Reçu'}
                        </button>
                    )}
                    {transfer.status === 'draft' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate(`/inventory/transfers/${id}/edit`)}
                        >
                            <Edit size={18} />
                            Modifier
                        </button>
                    )}
                </div>
            </header>

            <div className="transfer-detail-content">
                <div className="transfer-info-card">
                    <h2>Informations</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">De:</span>
                            <span className="info-value">{transfer.from_location_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Vers:</span>
                            <span className="info-value">{transfer.to_location_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Date:</span>
                            <span className="info-value">{new Date(transfer.transfer_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Responsable:</span>
                            <span className="info-value">{transfer.responsible_person}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Statut:</span>
                            <span className="info-value status">{transfer.status}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Valeur:</span>
                            <span className="info-value">€{transfer.total_value.toFixed(2)}</span>
                        </div>
                    </div>
                    {transfer.notes && (
                        <div className="notes-section">
                            <span className="info-label">Notes:</span>
                            <p>{transfer.notes}</p>
                        </div>
                    )}
                </div>

                <div className="transfer-items-card">
                    <h2>Articles ({transfer.total_items})</h2>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Quantité Demandée</th>
                                <th>Quantité Reçue</th>
                                <th>Coût Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfer.items.map(item => (
                                <tr key={item.id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.quantity_requested} {item.unit}</td>
                                    <td>{item.quantity_received > 0 ? `${item.quantity_received} ${item.unit}` : '-'}</td>
                                    <td>€{item.unit_cost.toFixed(2)}</td>
                                    <td>€{item.line_total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
