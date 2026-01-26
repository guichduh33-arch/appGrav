import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Trash2,
    Plus,
    Calendar,
    Search,
    Package,
    AlertTriangle,
    X,
    Save
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { formatCurrency, formatDateTime } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './WastedPage.css'

interface WasteRecord {
    id: string
    product_id: string
    product: { id: string; name: string; sku: string; unit: string } | null
    quantity: number
    reason: string
    notes: string | null
    performed_by: string | null
    created_at: string
    unit_cost: number | null
}

interface Product {
    id: string
    name: string
    sku: string
    unit: string
    cost_price: number
    current_stock: number
}

const WASTE_REASONS = [
    { value: 'expired', labelKey: 'inventory.wasted.reason_expired' },
    { value: 'damaged', labelKey: 'inventory.wasted.reason_damaged' },
    { value: 'quality', labelKey: 'inventory.wasted.reason_quality' },
    { value: 'spillage', labelKey: 'inventory.wasted.reason_spillage' },
    { value: 'theft', labelKey: 'inventory.wasted.reason_theft' },
    { value: 'other', labelKey: 'inventory.wasted.reason_other' }
]

export default function WastedPage() {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('week')

    // Form state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('expired')
    const [notes, setNotes] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [dateFilter])

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Load waste records
            let query = supabase
                .from('stock_movements')
                .select(`
                    id,
                    product_id,
                    product:products(id, name, sku, unit),
                    quantity,
                    notes,
                    performed_by,
                    created_at,
                    unit_cost
                `)
                .eq('movement_type', 'waste')
                .order('created_at', { ascending: false })

            // Apply date filter
            const now = new Date()
            if (dateFilter === 'today') {
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
                query = query.gte('created_at', today)
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                query = query.gte('created_at', weekAgo)
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                query = query.gte('created_at', monthAgo)
            }

            const { data: wasteData, error: wasteError } = await query

            if (wasteError) throw wasteError
            // Map data to WasteRecord format - extract reason from notes if present
            const rawData = wasteData as unknown as Array<{
                id: string;
                product_id: string;
                product: { id: string; name: string; sku: string; unit: string } | null;
                quantity: number;
                notes?: string | null;
                performed_by?: string | null;
                created_at: string;
                unit_cost?: number | null;
            }>;
            const mappedData: WasteRecord[] = rawData.map((r) => ({
                id: r.id,
                product_id: r.product_id,
                product: r.product,
                quantity: r.quantity,
                reason: r.notes?.split(':')[0] || 'other',
                notes: r.notes ?? null,
                performed_by: r.performed_by ?? null,
                created_at: r.created_at,
                unit_cost: r.unit_cost ?? null
            }))
            setWasteRecords(mappedData)

            // Load products for the form
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, name, sku, unit, cost_price, current_stock')
                .eq('is_active', true)
                .order('name')

            if (productsError) throw productsError
            setProducts(productsData || [])
        } catch (err) {
            console.error('Error loading data:', err)
            toast.error(t('common.error', 'Error loading data'))
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate stats
    const stats = {
        totalRecords: wasteRecords.length,
        totalQuantity: wasteRecords.reduce((sum, r) => sum + Math.abs(r.quantity), 0),
        totalCost: wasteRecords.reduce((sum, r) => sum + (Math.abs(r.quantity) * (r.unit_cost || 0)), 0),
        byReason: WASTE_REASONS.map(r => ({
            reason: r.value,
            count: wasteRecords.filter(wr => wr.reason === r.value).length
        }))
    }

    // Filter records
    const filteredRecords = wasteRecords.filter(record => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            return (
                record.product?.name.toLowerCase().includes(search) ||
                record.product?.sku.toLowerCase().includes(search) ||
                record.reason.toLowerCase().includes(search)
            )
        }
        return true
    })

    // Filter products for dropdown
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )

    const handleSave = async () => {
        if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
            toast.error(t('inventory.wasted.error_required', 'Please select a product and enter a quantity'))
            return
        }

        const qty = parseFloat(quantity)
        if (qty > selectedProduct.current_stock) {
            toast.error(t('inventory.wasted.error_insufficient', 'Quantity exceeds current stock'))
            return
        }

        setIsSaving(true)
        try {
            const movementId = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
            const combinedNotes = `${reason}${notes ? ': ' + notes : ''}`

            const { error } = await supabase
                .from('stock_movements')
                .insert({
                    movement_id: movementId,
                    product_id: selectedProduct.id,
                    movement_type: 'waste',
                    quantity: -qty, // Negative for waste
                    notes: combinedNotes,
                    performed_by: user?.id,
                    unit_cost: selectedProduct.cost_price || 0
                } as never)

            if (error) throw error

            // Update product stock
            const { error: updateError } = await supabase
                .from('products')
                .update({ current_stock: selectedProduct.current_stock - qty })
                .eq('id', selectedProduct.id)

            if (updateError) throw updateError

            toast.success(t('inventory.wasted.success', 'Waste recorded successfully'))
            setShowModal(false)
            resetForm()
            loadData()
        } catch (err) {
            console.error('Error saving waste:', err)
            toast.error(t('common.error', 'Error saving waste record'))
        } finally {
            setIsSaving(false)
        }
    }

    const resetForm = () => {
        setSelectedProduct(null)
        setQuantity('')
        setReason('expired')
        setNotes('')
        setProductSearch('')
    }

    const getReasonLabel = (reasonValue: string) => {
        const found = WASTE_REASONS.find(r => r.value === reasonValue)
        return found ? t(found.labelKey, reasonValue) : reasonValue
    }

    return (
        <div className="wasted-page">
            {/* Stats */}
            <div className="wasted-stats">
                <div className="wasted-stat">
                    <div className="wasted-stat__icon total">
                        <Trash2 size={20} />
                    </div>
                    <div className="wasted-stat__info">
                        <span className="wasted-stat__value">{stats.totalRecords}</span>
                        <span className="wasted-stat__label">{t('inventory.wasted.total_records', 'Total Records')}</span>
                    </div>
                </div>
                <div className="wasted-stat">
                    <div className="wasted-stat__icon quantity">
                        <Package size={20} />
                    </div>
                    <div className="wasted-stat__info">
                        <span className="wasted-stat__value">{stats.totalQuantity.toFixed(0)}</span>
                        <span className="wasted-stat__label">{t('inventory.wasted.total_quantity', 'Total Units Lost')}</span>
                    </div>
                </div>
                <div className="wasted-stat">
                    <div className="wasted-stat__icon cost">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="wasted-stat__info">
                        <span className="wasted-stat__value">{formatCurrency(stats.totalCost)}</span>
                        <span className="wasted-stat__label">{t('inventory.wasted.total_cost', 'Total Cost Lost')}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="wasted-toolbar">
                <div className="wasted-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('inventory.wasted.search_placeholder', 'Search by product, reason...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="wasted-filters">
                    <button
                        className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setDateFilter('today')}
                    >
                        {t('inventory.wasted.today', 'Today')}
                    </button>
                    <button
                        className={`filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
                        onClick={() => setDateFilter('week')}
                    >
                        {t('inventory.wasted.week', '7 Days')}
                    </button>
                    <button
                        className={`filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
                        onClick={() => setDateFilter('month')}
                    >
                        {t('inventory.wasted.month', '30 Days')}
                    </button>
                    <button
                        className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDateFilter('all')}
                    >
                        {t('common.all', 'All')}
                    </button>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    {t('inventory.wasted.add_waste', 'Record Waste')}
                </button>
            </div>

            {/* Table */}
            <div className="wasted-table-wrapper">
                {isLoading ? (
                    <div className="wasted-loading">
                        <div className="spinner" />
                        <span>{t('common.loading', 'Loading...')}</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="wasted-empty">
                        <Trash2 size={48} />
                        <h3>{t('inventory.wasted.no_records', 'No waste records found')}</h3>
                        <p>{t('inventory.wasted.no_records_desc', 'Click "Record Waste" to add a new entry')}</p>
                    </div>
                ) : (
                    <table className="wasted-table">
                        <thead>
                            <tr>
                                <th>{t('inventory.wasted.date', 'Date')}</th>
                                <th>{t('inventory.wasted.product', 'Product')}</th>
                                <th>{t('inventory.wasted.quantity', 'Quantity')}</th>
                                <th>{t('inventory.wasted.reason', 'Reason')}</th>
                                <th>{t('inventory.wasted.cost', 'Cost')}</th>
                                <th>{t('inventory.wasted.recorded_by', 'Recorded By')}</th>
                                <th>{t('inventory.wasted.notes', 'Notes')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr key={record.id}>
                                    <td className="cell-date">
                                        <Calendar size={14} />
                                        {formatDateTime(record.created_at)}
                                    </td>
                                    <td className="cell-product">
                                        <div className="product-info">
                                            <span className="product-name">{record.product?.name}</span>
                                            <span className="product-sku">{record.product?.sku}</span>
                                        </div>
                                    </td>
                                    <td className="cell-quantity">
                                        <span className="quantity-value">
                                            {Math.abs(record.quantity)} {record.product?.unit}
                                        </span>
                                    </td>
                                    <td className="cell-reason">
                                        <span className={`reason-badge reason-${record.reason}`}>
                                            {getReasonLabel(record.reason)}
                                        </span>
                                    </td>
                                    <td className="cell-cost">
                                        {formatCurrency(Math.abs(record.quantity) * (record.unit_cost || 0))}
                                    </td>
                                    <td className="cell-user">
                                        {record.performed_by || '-'}
                                    </td>
                                    <td className="cell-notes">
                                        {record.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Waste Modal */}
            {showModal && (
                <div className="wasted-modal-overlay">
                    <div className="wasted-modal">
                        <div className="wasted-modal__header">
                            <h3>{t('inventory.wasted.add_waste', 'Record Waste')}</h3>
                            <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }} title={t('common.close', 'Fermer')} aria-label={t('common.close', 'Fermer')}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="wasted-modal__body">
                            {/* Product Selection */}
                            <div className="form-group">
                                <label>{t('inventory.wasted.select_product', 'Product')} *</label>
                                <div className="product-selector">
                                    <input
                                        type="text"
                                        placeholder={t('inventory.wasted.search_product', 'Search product...')}
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                    {productSearch && !selectedProduct && (
                                        <div className="product-dropdown">
                                            {filteredProducts.slice(0, 10).map(product => (
                                                <div
                                                    key={product.id}
                                                    className="product-option"
                                                    onClick={() => {
                                                        setSelectedProduct(product)
                                                        setProductSearch(product.name)
                                                    }}
                                                >
                                                    <span className="product-option__name">{product.name}</span>
                                                    <span className="product-option__stock">
                                                        Stock: {product.current_stock} {product.unit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedProduct && (
                                    <div className="selected-product">
                                        <span>{selectedProduct.name}</span>
                                        <span className="stock-info">
                                            {t('inventory.wasted.current_stock', 'Current stock')}: {selectedProduct.current_stock} {selectedProduct.unit}
                                        </span>
                                        <button onClick={() => { setSelectedProduct(null); setProductSearch(''); }} title={t('common.clear', 'Effacer')} aria-label={t('common.clear', 'Effacer')}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>{t('inventory.wasted.quantity', 'Quantity')} *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    max={selectedProduct?.current_stock || 0}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            {/* Reason */}
                            <div className="form-group">
                                <label>{t('inventory.wasted.reason', 'Reason')} *</label>
                                <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label={t('inventory.wasted.select_reason', 'Sélectionner une raison')}>
                                    {WASTE_REASONS.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {t(r.labelKey, r.value)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes */}
                            <div className="form-group">
                                <label>{t('inventory.wasted.notes', 'Notes')}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t('inventory.wasted.notes_placeholder', 'Additional details...')}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="wasted-modal__footer">
                            <button className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                                <Save size={18} />
                                {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
