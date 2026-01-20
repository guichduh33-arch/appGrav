import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, Plus, Trash2, Save, Send, Search,
    User, Calendar, Percent, Package
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import './B2BOrderFormPage.css'

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    address: string | null
    payment_terms: 'cod' | 'net15' | 'net30' | 'net60' | null
    customer_type: 'retail' | 'wholesale'
}

interface Product {
    id: string
    name: string
    sku: string
    retail_price: number | null
    wholesale_price: number | null
    unit: string
    current_stock: number
}

interface OrderItem {
    id?: string
    product_id: string | null
    product_name: string
    product_sku: string
    quantity: number
    unit: string
    unit_price: number
    discount_percentage: number
    discount_amount: number
    line_total: number
}

export default function B2BOrderFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id

    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        customer_id: '',
        requested_delivery_date: '',
        delivery_address: '',
        delivery_notes: '',
        notes: '',
        internal_notes: '',
        discount_type: '' as '' | 'percentage' | 'fixed',
        discount_value: 0,
        tax_rate: 10,
        payment_terms: '' as '' | 'cod' | 'net15' | 'net30' | 'net60'
    })

    const [items, setItems] = useState<OrderItem[]>([{
        product_id: null,
        product_name: '',
        product_sku: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        discount_percentage: 0,
        discount_amount: 0,
        line_total: 0
    }])

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [productSearch, setProductSearch] = useState('')
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null)

    useEffect(() => {
        fetchCustomers()
        fetchProducts()
        if (isEditing) {
            fetchOrder()
        }
    }, [id])

    const fetchCustomers = async () => {
        try {
            // Fetch all active customers for B2B orders
            // This includes wholesale and retail customers who may need formal orders/invoices
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('is_active', true)
                .order('company_name', { ascending: true, nullsFirst: false })
                .order('name')

            if (error) throw error
            if (data) setCustomers(data)
        } catch (error) {
            console.error('Error fetching customers:', error)
        }
    }

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, sku, retail_price, wholesale_price, unit, current_stock')
                .eq('is_active', true)
                .eq('product_type', 'finished')
                .eq('available_for_sale', true)
                .order('name')

            if (error) throw error
            if (data) setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const fetchOrder = async () => {
        setLoading(true)
        try {
            const { data: order, error: orderError } = await supabase
                .from('b2b_orders')
                .select(`
                    *,
                    customer:customers(*)
                `)
                .eq('id', id)
                .single()

            if (orderError) throw orderError

            const { data: orderItems, error: itemsError } = await supabase
                .from('b2b_order_items')
                .select('*')
                .eq('order_id', id as string)

            if (itemsError) throw itemsError

            const typedOrder = order as Record<string, unknown>
            setFormData({
                customer_id: typedOrder.customer_id as string,
                requested_delivery_date: ((typedOrder.requested_delivery_date as string)?.split('T')[0]) || '',
                delivery_address: (typedOrder.delivery_address as string) || '',
                delivery_notes: (typedOrder.delivery_notes as string) || '',
                notes: (typedOrder.notes as string) || '',
                internal_notes: (typedOrder.internal_notes as string) || '',
                discount_type: (typedOrder.discount_type as string) || '',
                discount_value: (typedOrder.discount_value as number) || 0,
                tax_rate: (typedOrder.tax_rate as number) || 10,
                payment_terms: (typedOrder.payment_terms as string) || ''
            })

            setSelectedCustomer(typedOrder.customer as Customer)

            if (orderItems && orderItems.length > 0) {
                const typedItems = orderItems as Record<string, unknown>[]
                setItems(typedItems.map(item => ({
                    id: item.id as string,
                    product_id: item.product_id as string | null,
                    product_name: item.product_name as string,
                    product_sku: (item.product_sku as string) || '',
                    quantity: parseFloat(String(item.quantity)),
                    unit: item.unit as string,
                    unit_price: parseFloat(String(item.unit_price)),
                    discount_percentage: parseFloat(String(item.discount_percentage || 0)),
                    discount_amount: parseFloat(String(item.discount_amount)),
                    line_total: parseFloat(String(item.line_total))
                })))
            }
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCustomerChange = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId)
        setSelectedCustomer(customer || null)
        setFormData({
            ...formData,
            customer_id: customerId,
            delivery_address: customer?.address || '',
            payment_terms: customer?.payment_terms || ''
        })
    }

    const calculateLineTotal = (item: OrderItem): number => {
        const subtotal = item.quantity * item.unit_price
        const discountAmount = item.discount_percentage > 0
            ? subtotal * (item.discount_percentage / 100)
            : item.discount_amount
        return subtotal - discountAmount
    }

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        // Recalculate discount and line total
        if (['quantity', 'unit_price', 'discount_percentage'].includes(field)) {
            const subtotal = newItems[index].quantity * newItems[index].unit_price
            newItems[index].discount_amount = subtotal * (newItems[index].discount_percentage / 100)
            newItems[index].line_total = calculateLineTotal(newItems[index])
        }

        setItems(newItems)
    }

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...items]
        newItems[index] = {
            ...newItems[index],
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            unit: product.unit,
            unit_price: product.wholesale_price || product.retail_price || 0,
            line_total: (product.wholesale_price || product.retail_price || 0) * newItems[index].quantity
        }
        setItems(newItems)
        setShowProductSearch(null)
        setProductSearch('')
    }

    const addItem = () => {
        setItems([...items, {
            product_id: null,
            product_name: '',
            product_sku: '',
            quantity: 1,
            unit: 'pcs',
            unit_price: 0,
            discount_percentage: 0,
            discount_amount: 0,
            line_total: 0
        }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
        let discountAmount = 0
        if (formData.discount_type === 'percentage') {
            discountAmount = subtotal * (formData.discount_value / 100)
        } else if (formData.discount_type === 'fixed') {
            discountAmount = formData.discount_value
        }
        const taxableAmount = subtotal - discountAmount
        const taxAmount = taxableAmount * (formData.tax_rate / 100)
        const total = taxableAmount + taxAmount

        return { subtotal, discountAmount, taxAmount, total }
    }

    const handleSubmit = async (status: 'draft' | 'confirmed' = 'draft') => {
        if (!formData.customer_id) {
            alert('Veuillez sélectionner un client')
            return
        }

        if (items.some(item => !item.product_name || item.quantity <= 0)) {
            alert('Veuillez remplir tous les articles correctement')
            return
        }

        setSaving(true)
        try {
            const totals = calculateTotals()

            // Calculate due date based on payment terms
            let dueDate = null
            if (formData.payment_terms && formData.payment_terms !== 'cod') {
                const days = parseInt(formData.payment_terms.replace('net', ''))
                const due = new Date()
                due.setDate(due.getDate() + days)
                dueDate = due.toISOString().split('T')[0]
            }

            const orderData = {
                customer_id: formData.customer_id,
                status,
                requested_delivery_date: formData.requested_delivery_date || null,
                delivery_address: formData.delivery_address || null,
                delivery_notes: formData.delivery_notes || null,
                subtotal: totals.subtotal,
                discount_type: formData.discount_type || null,
                discount_value: formData.discount_value,
                discount_amount: totals.discountAmount,
                tax_rate: formData.tax_rate,
                tax_amount: totals.taxAmount,
                total_amount: totals.total,
                payment_terms: formData.payment_terms || null,
                due_date: dueDate,
                amount_due: totals.total,
                notes: formData.notes || null,
                internal_notes: formData.internal_notes || null
            }

            let orderId = id

            if (isEditing) {
                const { error } = await supabase
                    .from('b2b_orders')
                    .update(orderData)
                    .eq('id', id)

                if (error) throw error

                // Delete existing items
                await supabase
                    .from('b2b_order_items')
                    .delete()
                    .eq('order_id', id)
            } else {
                const { data: newOrder, error } = await supabase
                    .from('b2b_orders')
                    .insert([orderData])
                    .select()
                    .single()

                if (error) throw error
                orderId = newOrder.id
            }

            // Insert items
            const itemsToInsert = items.map(item => ({
                order_id: orderId,
                product_id: item.product_id,
                product_name: item.product_name,
                product_sku: item.product_sku,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                discount_percentage: item.discount_percentage,
                discount_amount: item.discount_amount,
                line_total: item.line_total
            }))

            const { error: itemsError } = await supabase
                .from('b2b_order_items')
                .insert(itemsToInsert)

            if (itemsError) throw itemsError

            navigate('/b2b/orders')
        } catch (error: any) {
            console.error('Error saving order:', error)
            alert(`Erreur lors de l'enregistrement: ${error?.message || 'Erreur inconnue'}`)
        } finally {
            setSaving(false)
        }
    }

    const totals = calculateTotals()

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )

    if (loading) {
        return (
            <div className="b2b-form-loading">
                <div className="spinner"></div>
                <span>Chargement de la commande...</span>
            </div>
        )
    }

    return (
        <div className="b2b-order-form-page">
            {/* Header */}
            <div className="b2b-order-form__header">
                <button className="btn btn-ghost" onClick={() => navigate('/b2b/orders')}>
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <h1 className="b2b-order-form__title">
                    {isEditing ? 'Modifier la Commande' : 'Nouvelle Commande B2B'}
                </h1>
            </div>

            <div className="b2b-order-form__content">
                {/* Main Form */}
                <div className="b2b-order-form__main">
                    {/* Customer Section */}
                    <div className="b2b-form-section">
                        <h2 className="b2b-form-section__title">
                            <User size={20} />
                            Client
                        </h2>
                        <div className="b2b-form-grid">
                            <div className="form-group form-group--full">
                                <label>Client B2B *</label>
                                <select
                                    value={formData.customer_id}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionner un client...</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.company_name || customer.name}
                                            {customer.company_name && ` (${customer.name})`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedCustomer && (
                                <div className="b2b-customer-info">
                                    <div className="b2b-customer-info__item">
                                        <span className="label">Contact:</span>
                                        <span>{selectedCustomer.name}</span>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <div className="b2b-customer-info__item">
                                            <span className="label">Téléphone:</span>
                                            <span>{selectedCustomer.phone}</span>
                                        </div>
                                    )}
                                    {selectedCustomer.email && (
                                        <div className="b2b-customer-info__item">
                                            <span className="label">Email:</span>
                                            <span>{selectedCustomer.email}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Section */}
                    <div className="b2b-form-section">
                        <h2 className="b2b-form-section__title">
                            <Calendar size={20} />
                            Livraison
                        </h2>
                        <div className="b2b-form-grid">
                            <div className="form-group">
                                <label>Date de livraison souhaitée</label>
                                <input
                                    type="date"
                                    value={formData.requested_delivery_date}
                                    onChange={(e) => setFormData({ ...formData, requested_delivery_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Conditions de paiement</label>
                                <select
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value as any })}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="cod">Paiement à la livraison</option>
                                    <option value="net15">Net 15 jours</option>
                                    <option value="net30">Net 30 jours</option>
                                    <option value="net60">Net 60 jours</option>
                                </select>
                            </div>
                            <div className="form-group form-group--full">
                                <label>Adresse de livraison</label>
                                <textarea
                                    rows={2}
                                    value={formData.delivery_address}
                                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                                    placeholder="Adresse complète de livraison..."
                                />
                            </div>
                            <div className="form-group form-group--full">
                                <label>Instructions de livraison</label>
                                <textarea
                                    rows={2}
                                    value={formData.delivery_notes}
                                    onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                                    placeholder="Instructions spéciales pour la livraison..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="b2b-form-section">
                        <div className="b2b-form-section__header">
                            <h2 className="b2b-form-section__title">
                                <Package size={20} />
                                Articles
                            </h2>
                            <button className="btn btn-secondary btn-sm" onClick={addItem}>
                                <Plus size={16} />
                                Ajouter
                            </button>
                        </div>

                        <div className="b2b-items-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th style={{ width: '80px' }}>Qté</th>
                                        <th style={{ width: '100px' }}>Prix Unit.</th>
                                        <th style={{ width: '80px' }}>Remise %</th>
                                        <th style={{ width: '120px' }}>Total</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="b2b-product-selector">
                                                    <div
                                                        className="b2b-product-selector__input"
                                                        onClick={() => setShowProductSearch(showProductSearch === index ? null : index)}
                                                    >
                                                        {item.product_name || (
                                                            <span className="placeholder">Rechercher un produit...</span>
                                                        )}
                                                    </div>
                                                    {showProductSearch === index && (
                                                        <div className="b2b-product-dropdown">
                                                            <div className="b2b-product-dropdown__search">
                                                                <Search size={16} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Rechercher..."
                                                                    value={productSearch}
                                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <div className="b2b-product-dropdown__list">
                                                                {filteredProducts.map(product => (
                                                                    <div
                                                                        key={product.id}
                                                                        className="b2b-product-dropdown__item"
                                                                        onClick={() => handleProductSelect(index, product)}
                                                                    >
                                                                        <div className="b2b-product-dropdown__name">
                                                                            {product.name}
                                                                        </div>
                                                                        <div className="b2b-product-dropdown__meta">
                                                                            <span>{product.sku}</span>
                                                                            <span>{formatCurrency(product.wholesale_price || product.retail_price || 0)}</span>
                                                                            <span>Stock: {product.current_stock}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.unit_price}
                                                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={item.discount_percentage}
                                                    onChange={(e) => handleItemChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(item.line_total)}</strong>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => removeItem(index)}
                                                    disabled={items.length === 1}
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

                    {/* Notes Section */}
                    <div className="b2b-form-section">
                        <h2 className="b2b-form-section__title">Notes</h2>
                        <div className="b2b-form-grid">
                            <div className="form-group">
                                <label>Notes (visibles sur le bon de commande)</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Notes pour le client..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes internes</label>
                                <textarea
                                    rows={3}
                                    value={formData.internal_notes}
                                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                                    placeholder="Notes internes (non visibles par le client)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary */}
                <div className="b2b-order-form__sidebar">
                    <div className="b2b-order-summary">
                        <h3>Résumé</h3>

                        <div className="b2b-summary-line">
                            <span>Sous-total</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>

                        {/* Discount */}
                        <div className="b2b-summary-discount">
                            <div className="b2b-discount-type">
                                <button
                                    className={`btn-chip ${formData.discount_type === 'percentage' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, discount_type: 'percentage' })}
                                >
                                    <Percent size={14} />
                                    %
                                </button>
                                <button
                                    className={`btn-chip ${formData.discount_type === 'fixed' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, discount_type: 'fixed' })}
                                >
                                    Fixe
                                </button>
                                {formData.discount_type && (
                                    <button
                                        className="btn-chip btn-chip--clear"
                                        onClick={() => setFormData({ ...formData, discount_type: '', discount_value: 0 })}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {formData.discount_type && (
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                    placeholder={formData.discount_type === 'percentage' ? '% remise' : 'Montant'}
                                />
                            )}
                        </div>

                        {totals.discountAmount > 0 && (
                            <div className="b2b-summary-line b2b-summary-line--discount">
                                <span>Remise</span>
                                <span>-{formatCurrency(totals.discountAmount)}</span>
                            </div>
                        )}

                        <div className="b2b-summary-line">
                            <span>TVA ({formData.tax_rate}%)</span>
                            <span>{formatCurrency(totals.taxAmount)}</span>
                        </div>

                        <div className="b2b-summary-divider"></div>

                        <div className="b2b-summary-total">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>

                        <div className="b2b-summary-actions">
                            <button
                                className="btn btn-secondary btn-block"
                                onClick={() => handleSubmit('draft')}
                                disabled={saving}
                            >
                                <Save size={18} />
                                Enregistrer Brouillon
                            </button>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={() => handleSubmit('confirmed')}
                                disabled={saving}
                            >
                                <Send size={18} />
                                Confirmer Commande
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
