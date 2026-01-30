import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Send, Percent } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '@/utils/helpers'
import './PurchaseOrderFormPage.css'

interface Supplier {
    id: string
    name: string
}

interface Product {
    id: string
    name: string
    cost_price: number | null
    unit: string | null
    product_type?: string | null
}

interface POItem {
    id?: string
    product_id: string | null
    product_name: string
    description: string
    quantity: number
    unit: string
    unit_price: number
    discount_amount: number
    discount_percentage: number | null
    tax_rate: number
    line_total: number
}

export default function PurchaseOrderFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id

    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        supplier_id: '',
        expected_delivery_date: '',
        notes: '',
        discount_amount: 0,
        discount_percentage: null as number | null,
        status: 'draft' as const
    })

    const [items, setItems] = useState<POItem[]>([{
        product_id: null,
        product_name: '',
        description: '',
        quantity: 1,
        unit: 'kg',
        unit_price: 0,
        discount_amount: 0,
        discount_percentage: null,
        tax_rate: 10,
        line_total: 0
    }])

    const [showDiscountModal, setShowDiscountModal] = useState(false)

    // Store original data for comparison when editing
    const [originalItems, setOriginalItems] = useState<POItem[]>([])
    const [originalTotal, setOriginalTotal] = useState<number>(0)

    useEffect(() => {
        fetchSuppliers()
        fetchProducts()
        if (isEditing) {
            fetchPurchaseOrder()
        }
    }, [id])

    const fetchSuppliers = async () => {
        try {
            const { data, error } = await supabase
                .from('suppliers')
                .select('id, name')
                .neq('is_active', false)
                .order('name')

            if (error) throw error
            if (data) setSuppliers(data)
        } catch (error) {
            console.error('Error fetching suppliers:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            // First, try to load products with product_type filter
            let { data, error } = await supabase
                .from('products')
                .select('id, name, cost_price, product_type, unit')
                .neq('is_active', false)
                .order('name')

            if (error) {
                console.error('Error fetching products:', error)
                throw error
            }

            // Filter raw materials in JavaScript if product_type exists
            if (data && data.length > 0) {
                // Check if product_type field exists and filter
                const filtered = data.filter(p => p.product_type === 'raw_material')
                setProducts(filtered as Product[])
            } else if (data) {
                setProducts(data as Product[])
            }
        } catch (error) {
            console.error('Error fetching products:', error)
            alert(`Erreur lors du chargement des produits:\n${error instanceof Error ? error.message : 'Erreur inconnue'}`)
        }
    }

    const fetchPurchaseOrder = async () => {
        try {
            const { data: po, error: poError } = await supabase
                .from('purchase_orders')
                .select('*')
                .eq('id', id!)
                .single()

            if (poError) throw poError

            const { data: poItems, error: itemsError } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('purchase_order_id', id!)

            if (itemsError) throw itemsError

            setFormData({
                supplier_id: po.supplier_id,
                expected_delivery_date: (po.expected_delivery_date || '').split('T')[0],
                notes: po.notes || '',
                discount_amount: po.discount_amount ?? 0,
                discount_percentage: po.discount_percentage ?? null,
                status: po.status as 'draft'
            })

            if (poItems && poItems.length > 0) {
                type RawPOItem = {
                    id: string;
                    product_id: string;
                    product_name?: string;
                    description?: string;
                    notes?: string | null;
                    quantity?: number;
                    quantity_ordered?: number;
                    unit?: string;
                    unit_price?: number;
                    discount_amount?: number;
                    discount_percentage?: number | null;
                    tax_rate?: number;
                    line_total?: number;
                    total_price?: number;
                };
                const rawItems = poItems as unknown as RawPOItem[];

                // Fetch product details to get unit if not in PO items
                const productIds = rawItems.map(item => item.product_id).filter(Boolean)
                const { data: productsData } = await supabase
                    .from('products')
                    .select('id, unit')
                    .in('id', productIds)

                const productUnitsMap = new Map(productsData?.map(p => [p.id, p.unit]) || [])

                const mappedItems = rawItems.map((item) => ({
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name || '',
                    description: item.description || item.notes || '',
                    quantity: parseFloat(String(item.quantity || item.quantity_ordered || 0)),
                    unit: item.unit || (item.product_id ? productUnitsMap.get(item.product_id) : undefined) || 'kg',
                    unit_price: parseFloat(String(item.unit_price || 0)),
                    discount_amount: parseFloat(String(item.discount_amount || 0)),
                    discount_percentage: item.discount_percentage || null,
                    tax_rate: parseFloat(String(item.tax_rate || 10)),
                    line_total: parseFloat(String(item.line_total || item.total_price || 0))
                }))
                setItems(mappedItems)
                // Store original items for comparison when saving
                setOriginalItems(JSON.parse(JSON.stringify(mappedItems)))
                setOriginalTotal(po.total_amount || 0)
            }
        } catch (error) {
            console.error('Error fetching purchase order:', error)
        }
    }

    const calculateLineTotal = (item: POItem): number => {
        const subtotal = item.quantity * item.unit_price
        const discountAmount = item.discount_percentage
            ? subtotal * (item.discount_percentage / 100)
            : item.discount_amount
        return subtotal - discountAmount
    }

    const handleItemChange = (index: number, field: keyof POItem, value: string | number | null) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        // If product selected, auto-fill details
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index].product_name = product.name
                newItems[index].unit = product.unit ?? 'kg'
                newItems[index].unit_price = product.cost_price || 0
            }
        }

        // Recalculate line total
        newItems[index].line_total = calculateLineTotal(newItems[index])

        setItems(newItems)
    }

    const handleAddItem = () => {
        setItems([...items, {
            product_id: null,
            product_name: '',
            description: '',
            quantity: 1,
            unit: 'kg',
            unit_price: 0,
            discount_amount: 0,
            discount_percentage: null,
            tax_rate: 10,
            line_total: 0
        }])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
        const orderDiscount = formData.discount_percentage
            ? subtotal * (formData.discount_percentage / 100)
            : formData.discount_amount
        const afterDiscount = subtotal - orderDiscount
        const tax = items.reduce((sum, item) => sum + (item.line_total * item.tax_rate / 100), 0)
        const total = afterDiscount + tax

        return { subtotal, orderDiscount, tax, total }
    }

    const generatePONumber = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const { data, error } = await supabase
            .from('purchase_orders')
            .select('po_number')
            .like('po_number', `PO-${year}-%`)
            .order('po_number', { ascending: false })
            .limit(1)

        if (error || !data || data.length === 0) {
            return `PO-${year}-0001`
        }

        const lastNumber = parseInt(data[0].po_number.split('-')[2])
        const nextNumber = (lastNumber + 1).toString().padStart(4, '0')
        return `PO-${year}-${nextNumber}`
    }

    // Helper function to build modification metadata for history
    const buildModificationMetadata = (
        oldItems: POItem[],
        newItems: POItem[],
        oldTotal: number,
        newTotal: number
    ) => {
        const itemsAdded: Array<{ name: string; quantity: number; unit_price: number }> = []
        const itemsRemoved: Array<{ name: string; quantity: number }> = []
        const itemsModified: Array<{ name: string; field: string; old_value: string; new_value: string }> = []

        // Create maps by product_name for comparison
        const oldItemsMap = new Map(oldItems.map(item => [item.product_name, item]))
        const newItemsMap = new Map(newItems.map(item => [item.product_name, item]))

        // Find added items
        newItems.forEach(newItem => {
            if (!oldItemsMap.has(newItem.product_name)) {
                itemsAdded.push({
                    name: newItem.product_name,
                    quantity: newItem.quantity,
                    unit_price: newItem.unit_price
                })
            }
        })

        // Find removed items
        oldItems.forEach(oldItem => {
            if (!newItemsMap.has(oldItem.product_name)) {
                itemsRemoved.push({
                    name: oldItem.product_name,
                    quantity: oldItem.quantity
                })
            }
        })

        // Find modified items
        oldItems.forEach(oldItem => {
            const newItem = newItemsMap.get(oldItem.product_name)
            if (newItem) {
                if (oldItem.quantity !== newItem.quantity) {
                    itemsModified.push({
                        name: oldItem.product_name,
                        field: 'quantité',
                        old_value: String(oldItem.quantity),
                        new_value: String(newItem.quantity)
                    })
                }
                if (oldItem.unit_price !== newItem.unit_price) {
                    itemsModified.push({
                        name: oldItem.product_name,
                        field: 'prix unitaire',
                        old_value: formatCurrency(oldItem.unit_price),
                        new_value: formatCurrency(newItem.unit_price)
                    })
                }
                if (oldItem.discount_amount !== newItem.discount_amount) {
                    itemsModified.push({
                        name: oldItem.product_name,
                        field: 'remise',
                        old_value: formatCurrency(oldItem.discount_amount),
                        new_value: formatCurrency(newItem.discount_amount)
                    })
                }
            }
        })

        const hasChanges = itemsAdded.length > 0 || itemsRemoved.length > 0 || itemsModified.length > 0 || oldTotal !== newTotal

        return {
            hasChanges,
            items_added: itemsAdded.length > 0 ? itemsAdded : undefined,
            items_removed: itemsRemoved.length > 0 ? itemsRemoved : undefined,
            items_modified: itemsModified.length > 0 ? itemsModified : undefined,
            old_total: oldTotal !== newTotal ? oldTotal : undefined,
            new_total: oldTotal !== newTotal ? newTotal : undefined
        }
    }

    // Helper function to build human-readable modification description
    const buildModificationDescription = (metadata: ReturnType<typeof buildModificationMetadata>) => {
        const parts: string[] = []

        if (metadata.items_added && metadata.items_added.length > 0) {
            parts.push(`${metadata.items_added.length} article(s) ajouté(s)`)
        }
        if (metadata.items_removed && metadata.items_removed.length > 0) {
            parts.push(`${metadata.items_removed.length} article(s) supprimé(s)`)
        }
        if (metadata.items_modified && metadata.items_modified.length > 0) {
            parts.push(`${metadata.items_modified.length} modification(s)`)
        }
        if (metadata.old_total !== undefined && metadata.new_total !== undefined) {
            parts.push(`Total: ${formatCurrency(metadata.old_total)} → ${formatCurrency(metadata.new_total)}`)
        }

        return parts.length > 0 ? parts.join(', ') : 'Modification du bon de commande'
    }

    const handleSubmit = async (sendToSupplier: boolean = false) => {
        if (!formData.supplier_id) {
            alert('Veuillez sélectionner un fournisseur')
            return
        }

        if (items.some(item => !item.product_name || item.quantity <= 0 || item.unit_price < 0)) {
            alert('Veuillez remplir tous les articles correctement')
            return
        }

        setLoading(true)
        try {
            const totals = calculateTotals()
            const status = sendToSupplier ? 'sent' : formData.status

            if (isEditing) {
                // Update existing PO
                const { error: poError } = await supabase
                    .from('purchase_orders')
                    .update({
                        supplier_id: formData.supplier_id,
                        expected_delivery_date: formData.expected_delivery_date || null,
                        subtotal: totals.subtotal,
                        discount_amount: totals.orderDiscount,
                        discount_percentage: formData.discount_percentage,
                        tax_amount: totals.tax,
                        total_amount: totals.total,
                        notes: formData.notes,
                        status
                    })
                    .eq('id', id!)

                if (poError) throw poError

                // Delete old items
                await supabase
                    .from('purchase_order_items')
                    .delete()
                    .eq('purchase_order_id', id!)

                // Insert new items
                const itemsToInsert = items.map(item => ({
                    purchase_order_id: id!,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unit_price: item.unit_price,
                    discount_amount: item.discount_amount,
                    discount_percentage: item.discount_percentage,
                    tax_rate: item.tax_rate,
                    line_total: item.line_total
                }))

                const { error: itemsError } = await supabase
                    .from('purchase_order_items')
                    .insert(itemsToInsert as never)

                if (itemsError) throw itemsError

                // Log detailed modification history
                const historyMetadata = buildModificationMetadata(originalItems, items, originalTotal, totals.total)
                if (historyMetadata.hasChanges) {
                    await supabase
                        .from('purchase_order_history')
                        .insert({
                            purchase_order_id: id!,
                            action_type: 'modified',
                            description: buildModificationDescription(historyMetadata),
                            metadata: historyMetadata
                        } as never)
                }
            } else {
                // Create new PO
                const poNumber = await generatePONumber()

                const { data: newPO, error: poError } = await supabase
                    .from('purchase_orders')
                    .insert({
                        po_number: poNumber,
                        supplier_id: formData.supplier_id,
                        expected_delivery_date: formData.expected_delivery_date || null,
                        subtotal: totals.subtotal,
                        discount_amount: totals.orderDiscount,
                        discount_percentage: formData.discount_percentage,
                        tax_amount: totals.tax,
                        total_amount: totals.total,
                        notes: formData.notes,
                        status
                    } as any)
                    .select()
                    .single()

                if (poError || !newPO) throw poError

                const itemsToInsert = items.map(item => ({
                    purchase_order_id: newPO.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unit_price: item.unit_price,
                    discount_amount: item.discount_amount,
                    discount_percentage: item.discount_percentage,
                    tax_rate: item.tax_rate,
                    line_total: item.line_total
                }))

                const { error: itemsError } = await supabase
                    .from('purchase_order_items')
                    .insert(itemsToInsert as never)

                if (itemsError) throw itemsError
            }

            navigate('/purchasing/purchase-orders')
        } catch (error: any) {
            console.error('Error saving purchase order:', error)
            const errorMessage = error?.message || error?.error_description || error?.hint || JSON.stringify(error)
            alert(`Erreur lors de l'enregistrement du bon de commande:\n${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    const applyGlobalDiscount = () => {
        const totals = calculateTotals()
        setFormData({
            ...formData,
            discount_amount: formData.discount_percentage
                ? totals.subtotal * (formData.discount_percentage / 100)
                : formData.discount_amount
        })
        setShowDiscountModal(false)
    }

    const totals = calculateTotals()

    return (
        <div className="po-form-page">
            {/* Header */}
            <div className="po-form-page__header">
                <button className="btn btn-secondary" onClick={() => navigate('/purchasing/purchase-orders')}>
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <h1 className="po-form-page__title">
                    {isEditing ? 'Modifier Bon de Commande' : 'Nouveau Bon de Commande'}
                </h1>
            </div>

            <div className="po-form-page__content">
                {/* Main Form */}
                <div className="po-form-page__main">
                    {/* Supplier & Dates */}
                    <div className="po-form-section">
                        <h2>Informations générales</h2>
                        <div className="po-form-grid">
                            <div className="form-group">
                                <label>Fournisseur *</label>
                                <select
                                    required
                                    value={formData.supplier_id}
                                    onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                    aria-label="Fournisseur"
                                >
                                    <option value="">Sélectionner un fournisseur</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date de livraison prévue</label>
                                <input
                                    type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={e => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                    aria-label="Date de livraison prévue"
                                />
                            </div>
                            <div className="form-group form-group--full">
                                <label>Notes</label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Notes internes pour ce bon de commande..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="po-form-section">
                        <div className="po-form-section__header">
                            <h2>Articles</h2>
                            <button className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                                <Plus size={16} />
                                Ajouter Article
                            </button>
                        </div>

                        <div className="po-items-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Description</th>
                                        <th style={{ width: '100px' }}>Quantité</th>
                                        <th style={{ width: '80px' }}>Unité</th>
                                        <th style={{ width: '120px' }}>Prix Unit.</th>
                                        <th style={{ width: '100px' }}>Remise</th>
                                        <th style={{ width: '80px' }}>TVA %</th>
                                        <th style={{ width: '120px' }}>Total</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    value={item.product_id || ''}
                                                    onChange={e => handleItemChange(index, 'product_id', e.target.value || null)}
                                                    aria-label="Sélectionner un produit"
                                                >
                                                    <option value="">Produit personnalisé</option>
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {!item.product_id && (
                                                    <input
                                                        type="text"
                                                        placeholder="Nom du produit"
                                                        value={item.product_name}
                                                        onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                    aria-label="Description"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    aria-label="Quantité"
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={item.unit}
                                                    onChange={e => handleItemChange(index, 'unit', e.target.value)}
                                                    aria-label="Unité"
                                                >
                                                    <option value="kg">kg</option>
                                                    <option value="g">g</option>
                                                    <option value="L">L</option>
                                                    <option value="mL">mL</option>
                                                    <option value="pcs">pcs</option>
                                                    <option value="box">box</option>
                                                    <option value="bag">bag</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={item.unit_price}
                                                    onChange={e => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    aria-label="Prix Unitaire"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discount_amount}
                                                    onChange={e => handleItemChange(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                                                    aria-label="Montant de la remise"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={item.tax_rate}
                                                    onChange={e => handleItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                                    aria-label="Taux de TVA"
                                                />
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(item.line_total)}</strong>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1}
                                                    aria-label="Supprimer la ligne"
                                                    title="Supprimer la ligne"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="po-form-page__sidebar">
                    <div className="po-summary">
                        <h3>Résumé</h3>

                        <div className="po-summary__line">
                            <span>Sous-total</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>

                        <button
                            className="po-summary__discount-btn"
                            onClick={() => setShowDiscountModal(true)}
                        >
                            <Percent size={16} />
                            Remise globale
                        </button>

                        {totals.orderDiscount > 0 && (
                            <div className="po-summary__line po-summary__line--discount">
                                <span>Remise</span>
                                <span>-{formatCurrency(totals.orderDiscount)}</span>
                            </div>
                        )}

                        <div className="po-summary__line">
                            <span>TVA</span>
                            <span>{formatCurrency(totals.tax)}</span>
                        </div>

                        <div className="po-summary__divider"></div>

                        <div className="po-summary__total">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>

                        <div className="po-summary__actions">
                            <button
                                className="btn btn-secondary btn-block"
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                            >
                                <Save size={18} />
                                Enregistrer Brouillon
                            </button>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={() => handleSubmit(true)}
                                disabled={loading}
                            >
                                <Send size={18} />
                                Enregistrer et Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div className="modal-backdrop is-active" onClick={() => setShowDiscountModal(false)}>
                    <div className="modal is-active" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Remise Globale</h2>
                        </div>
                        <div className="modal__body">
                            <div className="form-group">
                                <label>Montant fixe (IDR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={formData.discount_amount}
                                    onChange={e => setFormData({
                                        ...formData,
                                        discount_amount: parseFloat(e.target.value) || 0,
                                        discount_percentage: null
                                    })}
                                    aria-label="Montant fixe de remise"
                                />
                            </div>
                            <div className="form-group">
                                <label>Pourcentage (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.discount_percentage || ''}
                                    onChange={e => setFormData({
                                        ...formData,
                                        discount_percentage: parseFloat(e.target.value) || null,
                                        discount_amount: 0
                                    })}
                                    aria-label="Pourcentage de remise"
                                />
                            </div>
                        </div>
                        <div className="modal__footer">
                            <button className="btn btn-secondary" onClick={() => setShowDiscountModal(false)}>
                                Annuler
                            </button>
                            <button className="btn btn-primary" onClick={applyGlobalDiscount}>
                                Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
