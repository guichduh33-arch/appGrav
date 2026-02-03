import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Send, Percent, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '@/utils/helpers'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSuppliers } from '@/hooks/purchasing/useSuppliers'
import {
    usePurchaseOrder,
    useCreatePurchaseOrder,
    useUpdatePurchaseOrder,
    calculateLineTotal,
    type IPOItem
} from '@/hooks/purchasing/usePurchaseOrders'
import { toast } from 'sonner'
import './PurchaseOrderFormPage.css'

interface Product {
    id: string
    name: string
    cost_price: number | null
    unit: string | null
    product_type?: string | null
}

const DEFAULT_ITEM: IPOItem = {
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
}

export default function PurchaseOrderFormPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id
    const { isOnline } = useNetworkStatus()
    const hasCheckedInitialOnlineStatus = useRef(false)

    // React Query hooks
    const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers({ isActive: true })
    const { data: purchaseOrder, isLoading: poLoading } = usePurchaseOrder(id || null)
    const createMutation = useCreatePurchaseOrder()
    const updateMutation = useUpdatePurchaseOrder()

    // Local state for products (raw materials only)
    const [products, setProducts] = useState<Product[]>([])
    const [productsLoading, setProductsLoading] = useState(true)

    const [formData, setFormData] = useState({
        supplier_id: '',
        expected_delivery_date: '',
        notes: '',
        discount_amount: 0,
        discount_percentage: null as number | null,
        status: 'draft' as const
    })

    const [items, setItems] = useState<IPOItem[]>([{ ...DEFAULT_ITEM }])
    const [showDiscountModal, setShowDiscountModal] = useState(false)

    // Check online status on mount
    useEffect(() => {
        if (!hasCheckedInitialOnlineStatus.current) {
            hasCheckedInitialOnlineStatus.current = true
            if (!isOnline) {
                toast.error(t('purchasing.orders.offlineWarning'))
            }
        }
    }, [isOnline, t])

    // Load products (raw materials only)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, cost_price, product_type, unit')
                    .neq('is_active', false)
                    .order('name')

                if (error) throw error

                // Filter raw materials in JavaScript
                if (data && data.length > 0) {
                    const filtered = data.filter(p => p.product_type === 'raw_material')
                    setProducts(filtered as Product[])
                } else if (data) {
                    setProducts(data as Product[])
                }
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setProductsLoading(false)
            }
        }
        fetchProducts()
    }, [])

    // Populate form when editing
    useEffect(() => {
        if (purchaseOrder && isEditing) {
            setFormData({
                supplier_id: purchaseOrder.supplier_id,
                expected_delivery_date: (purchaseOrder.expected_delivery_date || '').split('T')[0],
                notes: purchaseOrder.notes || '',
                discount_amount: purchaseOrder.discount_amount ?? 0,
                discount_percentage: purchaseOrder.discount_percentage ?? null,
                status: purchaseOrder.status as 'draft'
            })

            if (purchaseOrder.items && purchaseOrder.items.length > 0) {
                setItems(purchaseOrder.items.map(item => ({
                    ...item,
                    quantity: parseFloat(String(item.quantity || 0)),
                    unit_price: parseFloat(String(item.unit_price || 0)),
                    discount_amount: parseFloat(String(item.discount_amount || 0)),
                    tax_rate: parseFloat(String(item.tax_rate || 10)),
                    line_total: parseFloat(String(item.line_total || 0))
                })))
            }
        }
    }, [purchaseOrder, isEditing])

    // Calculate line total for a single item
    const calculateItemLineTotal = (item: IPOItem): number => {
        return calculateLineTotal(item)
    }

    const handleItemChange = (index: number, field: keyof IPOItem, value: string | number | null) => {
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
        newItems[index].line_total = calculateItemLineTotal(newItems[index])

        setItems(newItems)
    }

    const handleAddItem = () => {
        setItems([...items, { ...DEFAULT_ITEM }])
    }

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    // Memoized totals calculation
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
        const orderDiscount = formData.discount_percentage
            ? subtotal * (formData.discount_percentage / 100)
            : formData.discount_amount
        const afterDiscount = subtotal - orderDiscount
        const tax = items.reduce((sum, item) => sum + (item.line_total * item.tax_rate / 100), 0)
        const total = afterDiscount + tax

        return { subtotal, orderDiscount, tax, total }
    }, [items, formData.discount_amount, formData.discount_percentage])

    const handleSubmit = async (sendToSupplier: boolean = false) => {
        if (!isOnline) {
            toast.error(t('purchasing.orders.offlineWarning'))
            return
        }

        if (!formData.supplier_id) {
            toast.error(t('purchasing.orders.form.requiredFields'))
            return
        }

        if (items.some(item => !item.product_name || item.quantity <= 0 || item.unit_price < 0)) {
            toast.error(t('purchasing.orders.form.requiredFields'))
            return
        }

        try {
            // Prepare items with recalculated line totals
            const preparedItems = items.map(item => ({
                ...item,
                line_total: calculateItemLineTotal(item)
            }))

            if (isEditing) {
                await updateMutation.mutateAsync({
                    id: id!,
                    supplier_id: formData.supplier_id,
                    expected_delivery_date: formData.expected_delivery_date || null,
                    notes: formData.notes,
                    discount_amount: formData.discount_amount,
                    discount_percentage: formData.discount_percentage,
                    items: preparedItems,
                    status: sendToSupplier ? 'sent' : formData.status
                })
                toast.success(t('purchasing.orders.updateSuccess'))
            } else {
                await createMutation.mutateAsync({
                    supplier_id: formData.supplier_id,
                    expected_delivery_date: formData.expected_delivery_date || null,
                    notes: formData.notes,
                    discount_amount: formData.discount_amount,
                    discount_percentage: formData.discount_percentage,
                    items: preparedItems,
                    sendToSupplier
                })
                toast.success(t('purchasing.orders.createSuccess'))
            }

            navigate('/purchasing/purchase-orders')
        } catch (error: any) {
            console.error('Error saving purchase order:', error)
            const errorKey = isEditing ? 'purchasing.orders.updateError' : 'purchasing.orders.createError'
            toast.error(t(errorKey))
        }
    }

    const applyGlobalDiscount = () => {
        setFormData({
            ...formData,
            discount_amount: formData.discount_percentage
                ? totals.subtotal * (formData.discount_percentage / 100)
                : formData.discount_amount
        })
        setShowDiscountModal(false)
    }

    const isLoading = suppliersLoading || productsLoading || (isEditing && poLoading)
    const isSaving = createMutation.isPending || updateMutation.isPending

    if (isLoading) {
        return (
            <div className="po-form-page">
                <div className="po-form-page__loading">{t('common.loading')}</div>
            </div>
        )
    }

    return (
        <div className="po-form-page">
            {/* Offline Warning Banner */}
            {!isOnline && (
                <div className="po-form-page__offline-banner">
                    <WifiOff size={20} />
                    <span>{t('purchasing.orders.offlineWarning')}</span>
                </div>
            )}

            {/* Header */}
            <div className="po-form-page__header">
                <button className="btn btn-secondary" onClick={() => navigate('/purchasing/purchase-orders')}>
                    <ArrowLeft size={20} />
                    {t('common.cancel')}
                </button>
                <h1 className="po-form-page__title">
                    {isEditing ? t('purchasing.orders.editOrder') : t('purchasing.orders.newOrder')}
                </h1>
            </div>

            <div className="po-form-page__content">
                {/* Main Form */}
                <div className="po-form-page__main">
                    {/* Supplier & Dates */}
                    <div className="po-form-section">
                        <h2>{t('purchasing.orders.form.supplier')}</h2>
                        <div className="po-form-grid">
                            <div className="form-group">
                                <label>{t('purchasing.orders.form.supplier')} *</label>
                                <select
                                    required
                                    value={formData.supplier_id}
                                    onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                    disabled={!isOnline}
                                    aria-label={t('purchasing.orders.form.selectSupplier')}
                                >
                                    <option value="">{t('purchasing.orders.form.selectSupplier')}</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('purchasing.orders.form.expectedDelivery')}</label>
                                <input
                                    type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={e => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                    disabled={!isOnline}
                                    aria-label={t('purchasing.orders.form.expectedDelivery')}
                                />
                            </div>
                            <div className="form-group form-group--full">
                                <label>{t('purchasing.orders.form.notes')}</label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder={t('purchasing.orders.form.notesPlaceholder')}
                                    disabled={!isOnline}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="po-form-section">
                        <div className="po-form-section__header">
                            <h2>{t('purchasing.orders.form.items')}</h2>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={handleAddItem}
                                disabled={!isOnline}
                            >
                                <Plus size={16} />
                                {t('purchasing.orders.form.addItem')}
                            </button>
                        </div>

                        <div className="po-items-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('purchasing.orders.form.product')}</th>
                                        <th>Description</th>
                                        <th style={{ width: '100px' }}>{t('purchasing.orders.form.quantity')}</th>
                                        <th style={{ width: '80px' }}>Unité</th>
                                        <th style={{ width: '120px' }}>{t('purchasing.orders.form.unitPrice')}</th>
                                        <th style={{ width: '100px' }}>{t('purchasing.orders.form.discount')}</th>
                                        <th style={{ width: '80px' }}>{t('purchasing.orders.form.tax')} %</th>
                                        <th style={{ width: '120px' }}>{t('purchasing.orders.form.lineTotal')}</th>
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
                                                    disabled={!isOnline}
                                                    aria-label={t('purchasing.orders.form.selectProduct')}
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
                                                        disabled={!isOnline}
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
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    aria-label={t('purchasing.orders.form.quantity')}
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={item.unit}
                                                    onChange={e => handleItemChange(index, 'unit', e.target.value)}
                                                    aria-label="Unité"
                                                    disabled={!isOnline}
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
                                                    aria-label={t('purchasing.orders.form.unitPrice')}
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.discount_amount}
                                                    onChange={e => handleItemChange(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                                                    aria-label={t('purchasing.orders.form.discount')}
                                                    disabled={!isOnline}
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
                                                    aria-label={t('purchasing.orders.form.tax')}
                                                    disabled={!isOnline}
                                                />
                                            </td>
                                            <td>
                                                <strong>{formatCurrency(item.line_total)}</strong>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1 || !isOnline}
                                                    aria-label={t('common.delete')}
                                                    title={t('common.delete')}
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
                            <span>{t('purchasing.orders.form.subtotal')}</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>

                        <button
                            className="po-summary__discount-btn"
                            onClick={() => setShowDiscountModal(true)}
                            disabled={!isOnline}
                        >
                            <Percent size={16} />
                            {t('purchasing.orders.form.discount')}
                        </button>

                        {totals.orderDiscount > 0 && (
                            <div className="po-summary__line po-summary__line--discount">
                                <span>{t('purchasing.orders.form.discountAmount')}</span>
                                <span>-{formatCurrency(totals.orderDiscount)}</span>
                            </div>
                        )}

                        <div className="po-summary__line">
                            <span>{t('purchasing.orders.form.taxAmount')}</span>
                            <span>{formatCurrency(totals.tax)}</span>
                        </div>

                        <div className="po-summary__divider"></div>

                        <div className="po-summary__total">
                            <span>{t('purchasing.orders.form.totalAmount')}</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>

                        <div className="po-summary__actions">
                            <button
                                className="btn btn-secondary btn-block"
                                onClick={() => handleSubmit(false)}
                                disabled={isSaving || !isOnline}
                            >
                                <Save size={18} />
                                {t('purchasing.orders.actions.saveDraft')}
                            </button>
                            <button
                                className="btn btn-primary btn-block"
                                onClick={() => handleSubmit(true)}
                                disabled={isSaving || !isOnline}
                            >
                                <Send size={18} />
                                {t('purchasing.orders.actions.saveAndSend')}
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
                            <h2 className="modal__title">{t('purchasing.orders.form.discount')}</h2>
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
                                {t('common.cancel')}
                            </button>
                            <button className="btn btn-primary" onClick={applyGlobalDiscount}>
                                {t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
