import { useState } from 'react'
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
import { useAuthStore } from '../../stores/authStore'
import { formatCurrency, formatDateTime } from '../../utils/helpers'
import { toast } from 'sonner'
import {
    useWasteRecords,
    useWasteProducts,
    useCreateWasteRecord,
    type IWasteProduct as Product,
    type TWasteDateFilter,
} from '@/hooks/inventory/useWasteRecords'
import './WastedPage.css'

const WASTE_REASONS = [
    { value: 'expired', label: 'Expired' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'spillage', label: 'Spillage' },
    { value: 'theft', label: 'Theft' },
    { value: 'other', label: 'Other' }
]

export default function WastedPage() {
    const { user } = useAuthStore()
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState<TWasteDateFilter>('week')

    // Form state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('expired')
    const [notes, setNotes] = useState('')
    const [productSearch, setProductSearch] = useState('')

    // React Query hooks
    const { data: wasteRecords = [], isLoading } = useWasteRecords(dateFilter)
    const { data: products = [] } = useWasteProducts()
    const createWasteMutation = useCreateWasteRecord()
    const isSaving = createWasteMutation.isPending

    // Calculate stats
    const stats = {
        totalRecords: wasteRecords.length,
        totalQuantity: wasteRecords.reduce((sum, r) => sum + Math.abs(r.quantity), 0),
        totalCost: wasteRecords.reduce((sum, r) => sum + (Math.abs(r.quantity) * (r.unit_cost || 0)), 0),
        byReason: WASTE_REASONS.map(r => ({
            reason: r.value,
            count: wasteRecords.filter(wr => wr.reason?.toLowerCase().startsWith(r.label.toLowerCase())).length
        }))
    }

    // Filter records
    const filteredRecords = wasteRecords.filter(record => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            return (
                record.product?.name.toLowerCase().includes(search) ||
                record.product?.sku.toLowerCase().includes(search) ||
                (record.reason?.toLowerCase().includes(search) ?? false)
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
            toast.error('Please select a product and enter a quantity')
            return
        }

        const qty = parseFloat(quantity)
        const currentStock = selectedProduct.current_stock ?? 0
        if (qty > currentStock) {
            toast.error('Quantity exceeds current stock')
            return
        }

        try {
            const combinedReason = `${getReasonLabel(reason)}${notes ? ': ' + notes : ''}`

            await createWasteMutation.mutateAsync({
                productId: selectedProduct.id,
                quantity: qty,
                reason: combinedReason,
                unit: selectedProduct.unit || 'pcs',
                currentStock,
                costPrice: selectedProduct.cost_price || 0,
                staffId: user?.id,
            })

            toast.success('Waste recorded successfully')
            setShowModal(false)
            resetForm()
        } catch (err) {
            logError('Error saving waste:', err)
            toast.error('Error saving waste record')
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
        return found ? found.label : reasonValue
    }

    // Extract reason type from full reason string (e.g., "Expired: some notes" -> "expired")
import { logError } from '@/utils/logger'
    const getReasonType = (reason: string | null): string => {
        if (!reason) return 'other'
        const lowerReason = reason.toLowerCase()
        const found = WASTE_REASONS.find(r => lowerReason.startsWith(r.label.toLowerCase()))
        return found ? found.value : 'other'
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
                        <span className="wasted-stat__label">Total Records</span>
                    </div>
                </div>
                <div className="wasted-stat">
                    <div className="wasted-stat__icon quantity">
                        <Package size={20} />
                    </div>
                    <div className="wasted-stat__info">
                        <span className="wasted-stat__value">{stats.totalQuantity.toFixed(0)}</span>
                        <span className="wasted-stat__label">Total Units Lost</span>
                    </div>
                </div>
                <div className="wasted-stat">
                    <div className="wasted-stat__icon cost">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="wasted-stat__info">
                        <span className="wasted-stat__value">{formatCurrency(stats.totalCost)}</span>
                        <span className="wasted-stat__label">Total Cost Lost</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="wasted-toolbar">
                <div className="wasted-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by product, reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="wasted-filters">
                    <button
                        className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setDateFilter('today')}
                    >
                        Today
                    </button>
                    <button
                        className={`filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
                        onClick={() => setDateFilter('week')}
                    >
                        7 Days
                    </button>
                    <button
                        className={`filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
                        onClick={() => setDateFilter('month')}
                    >
                        30 Days
                    </button>
                    <button
                        className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDateFilter('all')}
                    >
                        All
                    </button>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Record Waste
                </button>
            </div>

            {/* Table */}
            <div className="wasted-table-wrapper">
                {isLoading ? (
                    <div className="wasted-loading">
                        <div className="spinner" />
                        <span>Loading...</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="wasted-empty">
                        <Trash2 size={48} />
                        <h3>No waste records found</h3>
                        <p>Click "Record Waste" to add a new entry</p>
                    </div>
                ) : (
                    <table className="wasted-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Reason</th>
                                <th>Cost</th>
                                <th>Recorded By</th>
                                <th>Notes</th>
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
                                        <span className={`reason-badge reason-${getReasonType(record.reason)}`}>
                                            {record.reason?.split(':')[0] || 'Other'}
                                        </span>
                                    </td>
                                    <td className="cell-cost">
                                        {formatCurrency(Math.abs(record.quantity) * (record.unit_cost || 0))}
                                    </td>
                                    <td className="cell-user">
                                        {record.staff_name || '-'}
                                    </td>
                                    <td className="cell-notes">
                                        {record.reason || '-'}
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
                            <h3>Record Waste</h3>
                            <button className="btn-close" onClick={() => { setShowModal(false); resetForm(); }} title="Close" aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="wasted-modal__body">
                            {/* Product Selection */}
                            <div className="form-group">
                                <label>Product *</label>
                                <div className="product-selector">
                                    <input
                                        type="text"
                                        placeholder="Search product..."
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
                                            Current stock: {selectedProduct.current_stock} {selectedProduct.unit}
                                        </span>
                                        <button onClick={() => { setSelectedProduct(null); setProductSearch(''); }} title="Clear" aria-label="Clear">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label>Quantity *</label>
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
                                <label>Reason *</label>
                                <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Select reason">
                                    {WASTE_REASONS.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes */}
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional details..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="wasted-modal__footer">
                            <button className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
