import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, DollarSign, Clock, RotateCcw, FileText, Send, CheckCircle, Package, XCircle, CreditCard, Undo2, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '@/utils/helpers'
import './PurchaseOrderDetailPage.css'

interface PurchaseOrder {
    id: string
    po_number: string
    supplier_id: string
    supplier?: { name: string; email: string; phone: string }
    status: string
    order_date: string
    expected_delivery_date: string | null
    actual_delivery_date: string | null
    subtotal: number
    discount_amount: number
    tax_amount: number
    total_amount: number
    payment_status: string
    payment_date: string | null
    notes: string | null
}

interface POItem {
    id: string
    product_name: string
    description: string | null
    quantity: number
    unit_price: number
    discount_amount: number
    tax_rate: number
    line_total: number
    quantity_received: number
    quantity_returned: number
}

interface POHistoryMetadata {
    items_added?: Array<{ name: string; quantity: number; unit_price: number }>
    items_removed?: Array<{ name: string; quantity: number }>
    items_modified?: Array<{ name: string; field: string; old_value: string; new_value: string }>
    quantity_received?: number
    product_name?: string
    return_quantity?: number
    return_reason?: string
    payment_amount?: number
    payment_method?: string
    old_total?: number
    new_total?: number
    [key: string]: unknown
}

interface POHistory {
    id: string
    action_type: string
    previous_status: string | null
    new_status: string | null
    description: string
    metadata: POHistoryMetadata | null
    changed_by_name?: string
    created_at: string
}

interface POReturn {
    id: string
    purchase_order_item_id: string
    item?: { product_name: string }
    quantity_returned: number
    reason: string
    reason_details: string | null
    return_date: string
    refund_amount: number | null
    status: string
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    confirmed: 'Confirmé',
    partially_received: 'Partiellement Reçu',
    received: 'Reçu',
    cancelled: 'Annulé',
    modified: 'Modifié'
}

const RETURN_REASON_LABELS: Record<string, string> = {
    damaged: 'Endommagé',
    wrong_item: 'Mauvais article',
    quality_issue: 'Problème de qualité',
    excess_quantity: 'Quantité excessive',
    other: 'Autre'
}

export default function PurchaseOrderDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
    const [items, setItems] = useState<POItem[]>([])
    const [history, setHistory] = useState<POHistory[]>([])
    const [returns, setReturns] = useState<POReturn[]>([])
    const [loading, setLoading] = useState(true)
    const [showReturnModal, setShowReturnModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState<POItem | null>(null)
    const [returnForm, setReturnForm] = useState({
        quantity: 0,
        reason: 'damaged' as string,
        reason_details: '',
        refund_amount: 0
    })

    useEffect(() => {
        if (id) {
            fetchPurchaseOrderDetails()
        }
    }, [id])

    const fetchPurchaseOrderDetails = async () => {
        try {
            // Fetch PO
            const { data: po, error: poError } = await supabase
                .from('purchase_orders')
                .select(`
                    *,
                    supplier:suppliers(name, email, phone)
                `)
                .eq('id', id!)
                .single()

            if (poError) throw poError
            // Map database fields to interface
            const poAny = po as any
            const mappedPO: PurchaseOrder = {
                id: poAny.id,
                po_number: poAny.po_number,
                supplier_id: poAny.supplier_id,
                supplier: poAny.supplier,
                status: poAny.status,
                order_date: poAny.order_date,
                expected_delivery_date: poAny.expected_date,
                actual_delivery_date: poAny.received_date,
                subtotal: poAny.subtotal || 0,
                discount_amount: poAny.discount || 0,
                tax_amount: poAny.tax_amount || 0,
                total_amount: poAny.total || poAny.subtotal || 0,
                payment_status: poAny.payment_status || 'unpaid',
                payment_date: poAny.payment_date,
                notes: poAny.notes,
            }
            setPurchaseOrder(mappedPO)

            // Fetch Items
            const { data: poItems, error: itemsError } = await supabase
                .from('purchase_order_items')
                .select('*, product:products(name)')
                .eq('purchase_order_id', id!)

            if (itemsError) throw itemsError
            if (poItems) {
                const mappedItems: POItem[] = (poItems as any[]).map((item) => ({
                    id: item.id,
                    product_name: item.product?.name || item.product_name || 'Unknown',
                    description: item.description || item.notes || null,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_amount: item.discount_amount || 0,
                    tax_rate: item.tax_rate || 0,
                    line_total: item.line_total,
                    quantity_received: item.quantity_received || 0,
                    quantity_returned: item.quantity_returned || 0,
                }))
                setItems(mappedItems)
            }

            // Fetch History
            const { data: poHistory, error: historyError } = await supabase
                .from('purchase_order_history')
                .select('*')
                .eq('purchase_order_id', id!)
                .order('created_at', { ascending: false })

            if (historyError) throw historyError
            if (poHistory) {
                const mappedHistory: POHistory[] = (poHistory as any[]).map((h) => ({
                    id: h.id,
                    action_type: h.action_type,
                    previous_status: h.previous_status || null,
                    new_status: h.new_status || null,
                    description: h.description || h.action_type,
                    created_at: h.created_at,
                }))
                setHistory(mappedHistory)
            }

            // Fetch Returns
            const { data: poReturns, error: returnsError } = await supabase
                .from('purchase_order_returns')
                .select('*, item:purchase_order_items(product_name)')
                .eq('purchase_order_id', id!)
                .order('return_date', { ascending: false })

            if (returnsError) throw returnsError
            if (poReturns) {
                const mappedReturns: POReturn[] = (poReturns as any[]).map((r) => ({
                    id: r.id,
                    purchase_order_item_id: r.purchase_order_item_id,
                    item: { product_name: r.item?.product_name || 'Unknown' },
                    quantity_returned: r.quantity_returned,
                    reason: r.reason,
                    reason_details: r.reason_details || null,
                    return_date: r.return_date,
                    refund_amount: r.refund_amount || null,
                    status: r.status,
                }))
                setReturns(mappedReturns)
            }

        } catch (error) {
            console.error('Error fetching purchase order details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsPaid = async () => {
        if (!purchaseOrder) return

        try {
            const { error } = await supabase
                .from('purchase_orders')
                .update({
                    payment_status: 'paid',
                    payment_date: new Date().toISOString()
                } as never)
                .eq('id', id!)

            if (error) throw error
            await fetchPurchaseOrderDetails()
        } catch (error) {
            console.error('Error updating payment status:', error)
        }
    }

    const handleReceiveItem = async (itemId: string, quantityReceived: number) => {
        try {
            // Find the item and get current received quantity
            const item = items.find(i => i.id === itemId)
            if (!item) return

            const previousReceived = parseFloat(item.quantity_received.toString()) || 0
            const newReceived = quantityReceived
            const delta = newReceived - previousReceived

            // Only create stock movement if there's a change
            if (delta !== 0) {
                // Get product_id from purchase_order_items
                const { data: poItem } = await supabase
                    .from('purchase_order_items')
                    .select('product_id, unit_price')
                    .eq('id', itemId)
                    .single()

                if (poItem?.product_id) {
                    // Get current stock
                    const { data: product } = await supabase
                        .from('products')
                        .select('current_stock')
                        .eq('id', poItem.product_id)
                        .single()

                    const currentStock = product?.current_stock || 0
                    const newStock = currentStock + delta

                    // Create stock movement
                    const movementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
                    const { error: mvError } = await supabase
                        .from('stock_movements')
                        .insert({
                            movement_id: movementId,
                            product_id: poItem.product_id,
                            movement_type: 'stock_in',
                            quantity: delta,
                            stock_before: currentStock,
                            stock_after: newStock,
                            unit_cost: poItem.unit_price,
                            reference_type: 'purchase_order',
                            reference_id: id,
                            reason: `Réception PO ${purchaseOrder?.po_number || ''}`,
                            notes: `${item.product_name} - ${delta > 0 ? '+' : ''}${delta}`
                        } as never)

                    if (mvError) {
                        console.error('Stock movement error:', mvError)
                        alert(`Erreur mouvement stock: ${mvError.message}`)
                    }

                    // Update product stock
                    const { error: stockError } = await supabase
                        .from('products')
                        .update({ current_stock: newStock } as never)
                        .eq('id', poItem.product_id)

                    if (stockError) {
                        console.error('Stock update error:', stockError)
                    }
                }
            }

            // Update quantity received in PO item
            const { error } = await supabase
                .from('purchase_order_items')
                .update({ quantity_received: quantityReceived } as never)
                .eq('id', itemId)

            if (error) throw error

            // Check if all items received
            const allReceived = items.every(item =>
                item.id === itemId
                    ? quantityReceived >= parseFloat(item.quantity.toString())
                    : parseFloat(item.quantity_received.toString()) >= parseFloat(item.quantity.toString())
            )

            if (allReceived) {
                await supabase
                    .from('purchase_orders')
                    .update({
                        status: 'received',
                        received_date: new Date().toISOString()
                    } as never)
                    .eq('id', id!)
            } else {
                await supabase
                    .from('purchase_orders')
                    .update({ status: 'partial' } as never)
                    .eq('id', id!)
            }

            await fetchPurchaseOrderDetails()
        } catch (error) {
            console.error('Error receiving item:', error)
        }
    }

    const handleOpenReturnModal = (item: POItem) => {
        setSelectedItem(item)
        setReturnForm({
            quantity: 0,
            reason: 'damaged',
            reason_details: '',
            refund_amount: 0
        })
        setShowReturnModal(true)
    }

    const handleSubmitReturn = async () => {
        if (!selectedItem || returnForm.quantity <= 0) {
            alert('Veuillez entrer une quantité valide')
            return
        }

        try {
            const { error } = await supabase
                .from('purchase_order_returns')
                .insert({
                    purchase_order_id: id!,
                    purchase_order_item_id: selectedItem.id,
                    quantity_returned: returnForm.quantity,
                    reason: returnForm.reason || 'other',
                    reason_details: returnForm.reason_details || null,
                    refund_amount: returnForm.refund_amount || null,
                    return_date: new Date().toISOString(),
                } as never)

            if (error) throw error

            await fetchPurchaseOrderDetails()
            setShowReturnModal(false)
        } catch (error) {
            console.error('Error submitting return:', error)
            alert('Erreur lors de l\'enregistrement du retour')
        }
    }

    if (loading) {
        return <div className="po-detail-loading">Chargement...</div>
    }

    if (!purchaseOrder) {
        return <div className="po-detail-error">Bon de commande non trouvé</div>
    }

    return (
        <div className="po-detail-page">
            {/* Header */}
            <div className="po-detail-page__header">
                <button className="btn btn-secondary" onClick={() => navigate('/purchasing/purchase-orders')}>
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <div className="po-detail-page__title-section">
                    <h1 className="po-detail-page__title">{purchaseOrder.po_number}</h1>
                    <span className={`status-badge status-badge--${purchaseOrder.status}`}>
                        {STATUS_LABELS[purchaseOrder.status]}
                    </span>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/purchasing/purchase-orders/${id}/edit`)}
                >
                    <Edit2 size={20} />
                    Modifier
                </button>
            </div>

            <div className="po-detail-page__content">
                {/* Main Content */}
                <div className="po-detail-page__main">
                    {/* PO Info */}
                    <div className="po-detail-card">
                        <h2>Informations de commande</h2>
                        <div className="po-detail-grid">
                            <div className="po-detail-field">
                                <label>Fournisseur</label>
                                <div className="po-detail-value">
                                    <strong>{purchaseOrder.supplier?.name}</strong>
                                </div>
                                {purchaseOrder.supplier?.email && (
                                    <div className="po-detail-value-sub">{purchaseOrder.supplier.email}</div>
                                )}
                                {purchaseOrder.supplier?.phone && (
                                    <div className="po-detail-value-sub">{purchaseOrder.supplier.phone}</div>
                                )}
                            </div>
                            <div className="po-detail-field">
                                <label>Date de commande</label>
                                <div className="po-detail-value">
                                    {new Date(purchaseOrder.order_date).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                            <div className="po-detail-field">
                                <label>Livraison prévue</label>
                                <div className="po-detail-value">
                                    {purchaseOrder.expected_delivery_date
                                        ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('fr-FR')
                                        : '-'}
                                </div>
                            </div>
                            <div className="po-detail-field">
                                <label>Livraison effective</label>
                                <div className="po-detail-value">
                                    {purchaseOrder.actual_delivery_date
                                        ? new Date(purchaseOrder.actual_delivery_date).toLocaleDateString('fr-FR')
                                        : '-'}
                                </div>
                            </div>
                            {purchaseOrder.notes && (
                                <div className="po-detail-field po-detail-field--full">
                                    <label>Notes</label>
                                    <div className="po-detail-value">{purchaseOrder.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="po-detail-card">
                        <h2>Articles commandés</h2>
                        <div className="po-items-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Quantité</th>
                                        <th>Prix Unit.</th>
                                        <th>Remise</th>
                                        <th>TVA</th>
                                        <th>Total</th>
                                        <th>Reçu</th>
                                        <th>Retourné</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{item.product_name}</strong>
                                                {item.description && (
                                                    <div className="po-item-desc">{item.description}</div>
                                                )}
                                            </td>
                                            <td>{parseFloat(item.quantity.toString()).toFixed(2)}</td>
                                            <td>{formatCurrency(parseFloat(item.unit_price.toString()))}</td>
                                            <td>{formatCurrency(parseFloat(item.discount_amount.toString()))}</td>
                                            <td>{parseFloat(item.tax_rate.toString())}%</td>
                                            <td><strong>{formatCurrency(parseFloat(item.line_total.toString()))}</strong></td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={parseFloat(item.quantity.toString())}
                                                    step="0.01"
                                                    value={parseFloat(item.quantity_received.toString())}
                                                    onChange={e => handleReceiveItem(item.id, parseFloat(e.target.value) || 0)}
                                                    className="po-receive-input"
                                                />
                                            </td>
                                            <td>{parseFloat(item.quantity_returned.toString()).toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleOpenReturnModal(item)}
                                                    disabled={parseFloat(item.quantity_received.toString()) === 0}
                                                >
                                                    <RotateCcw size={14} />
                                                    Retour
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Returns */}
                    {returns.length > 0 && (
                        <div className="po-detail-card">
                            <h2>Retours</h2>
                            <div className="po-returns-list">
                                {returns.map(ret => (
                                    <div key={ret.id} className="po-return-item">
                                        <div className="po-return-item__header">
                                            <span className="po-return-item__product">{ret.item?.product_name}</span>
                                            <span className={`status-badge status-badge--${ret.status}`}>
                                                {ret.status}
                                            </span>
                                        </div>
                                        <div className="po-return-item__body">
                                            <div>Quantité: <strong>{parseFloat(ret.quantity_returned.toString())}</strong></div>
                                            <div>Raison: <strong>{RETURN_REASON_LABELS[ret.reason]}</strong></div>
                                            {ret.reason_details && <div>Détails: {ret.reason_details}</div>}
                                            {ret.refund_amount && (
                                                <div>Remboursement: <strong>{formatCurrency(parseFloat(ret.refund_amount.toString()))}</strong></div>
                                            )}
                                            <div className="po-return-item__date">
                                                {new Date(ret.return_date).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* History */}
                    <div className="po-detail-card">
                        <h2>Historique</h2>
                        <div className="po-history-timeline">
                            {history.map(entry => (
                                <div key={entry.id} className="po-history-item">
                                    <div className="po-history-item__icon">
                                        <Clock size={16} />
                                    </div>
                                    <div className="po-history-item__content">
                                        <div className="po-history-item__description">{entry.description}</div>
                                        <div className="po-history-item__date">
                                            {new Date(entry.created_at).toLocaleString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="po-detail-page__sidebar">
                    {/* Summary */}
                    <div className="po-detail-card">
                        <h3>Résumé financier</h3>
                        <div className="po-summary-line">
                            <span>Sous-total</span>
                            <span>{formatCurrency(parseFloat(purchaseOrder.subtotal.toString()))}</span>
                        </div>
                        {parseFloat(purchaseOrder.discount_amount.toString()) > 0 && (
                            <div className="po-summary-line po-summary-line--discount">
                                <span>Remise</span>
                                <span>-{formatCurrency(parseFloat(purchaseOrder.discount_amount.toString()))}</span>
                            </div>
                        )}
                        <div className="po-summary-line">
                            <span>TVA</span>
                            <span>{formatCurrency(parseFloat(purchaseOrder.tax_amount.toString()))}</span>
                        </div>
                        <div className="po-summary-divider"></div>
                        <div className="po-summary-total">
                            <span>Total</span>
                            <span>{formatCurrency(parseFloat(purchaseOrder.total_amount.toString()))}</span>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="po-detail-card">
                        <h3>Statut de paiement</h3>
                        <div className="po-payment-status">
                            <span className={`status-badge status-badge--${purchaseOrder.payment_status}`}>
                                {purchaseOrder.payment_status === 'paid' ? 'Payé' :
                                 purchaseOrder.payment_status === 'partially_paid' ? 'Partiellement Payé' : 'Non Payé'}
                            </span>
                            {purchaseOrder.payment_date && (
                                <div className="po-payment-date">
                                    Payé le {new Date(purchaseOrder.payment_date).toLocaleDateString('fr-FR')}
                                </div>
                            )}
                        </div>
                        {purchaseOrder.payment_status !== 'paid' && (
                            <button
                                className="btn btn-success btn-block"
                                onClick={handleMarkAsPaid}
                                style={{ marginTop: 'var(--space-md)' }}
                            >
                                <DollarSign size={18} />
                                Marquer comme payé
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && selectedItem && (
                <div className="modal-backdrop is-active" onClick={() => setShowReturnModal(false)}>
                    <div className="modal is-active" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Retour d'article</h2>
                            <p className="modal__subtitle">{selectedItem.product_name}</p>
                        </div>
                        <div className="modal__body">
                            <div className="form-group">
                                <label>Quantité à retourner *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max={parseFloat(selectedItem.quantity_received.toString()) - parseFloat(selectedItem.quantity_returned.toString())}
                                    step="0.01"
                                    value={returnForm.quantity}
                                    onChange={e => setReturnForm({ ...returnForm, quantity: parseFloat(e.target.value) || 0 })}
                                />
                                <small>Maximum: {(parseFloat(selectedItem.quantity_received.toString()) - parseFloat(selectedItem.quantity_returned.toString())).toFixed(2)}</small>
                            </div>
                            <div className="form-group">
                                <label>Raison *</label>
                                <select
                                    value={returnForm.reason}
                                    onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                                >
                                    <option value="damaged">Endommagé</option>
                                    <option value="wrong_item">Mauvais article</option>
                                    <option value="quality_issue">Problème de qualité</option>
                                    <option value="excess_quantity">Quantité excessive</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Détails</label>
                                <textarea
                                    rows={3}
                                    value={returnForm.reason_details}
                                    onChange={e => setReturnForm({ ...returnForm, reason_details: e.target.value })}
                                    placeholder="Décrivez le problème..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Montant du remboursement</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={returnForm.refund_amount}
                                    onChange={e => setReturnForm({ ...returnForm, refund_amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>
                                Annuler
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmitReturn}>
                                Enregistrer le retour
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
