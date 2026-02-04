import { useState, useEffect, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    TruckIcon,
    Package,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Search,
    Eye,
    FileText,
    ChevronDown,
    ChevronRight
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../utils/helpers'
import './IncomingStockPage.css'

interface PurchaseOrderWithItems {
    id: string
    po_number: string
    supplier: { id: string; name: string } | null
    status: string
    order_date: string
    expected_delivery_date: string | null
    actual_delivery_date: string | null
    total_amount: number
    notes: string | null
    purchase_order_items: {
        id: string
        product: { id: string; name: string; sku: string } | null
        quantity: number
        quantity_received: number
        unit_price: number
    }[]
}

type FilterStatus = 'all' | 'pending' | 'partial' | 'received'

export default function IncomingStockPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<PurchaseOrderWithItems[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

    // Load purchase orders
    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('purchase_orders')
                .select(`
                    id,
                    po_number,
                    supplier:suppliers(id, name),
                    status,
                    order_date,
                    expected_delivery_date,
                    actual_delivery_date,
                    total_amount,
                    notes,
                    purchase_order_items(
                        id,
                        product:products(id, name, sku),
                        quantity,
                        quantity_received,
                        unit_price
                    )
                `)
                .order('order_date', { ascending: false })

            if (error) throw error
            setOrders((data ?? []) as unknown as PurchaseOrderWithItems[])
        } catch (err) {
            console.error('Error loading orders:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending' || o.status === 'ordered').length,
        partial: orders.filter(o => o.status === 'partial').length,
        received: orders.filter(o => o.status === 'received').length
    }

    // Filter orders
    const filteredOrders = orders.filter(order => {
        // Status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'pending' && order.status !== 'pending' && order.status !== 'ordered') return false
            if (filterStatus === 'partial' && order.status !== 'partial') return false
            if (filterStatus === 'received' && order.status !== 'received') return false
        }

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            const matchesOrder = order.po_number.toLowerCase().includes(search)
            const matchesSupplier = order.supplier?.name.toLowerCase().includes(search)
            const matchesProduct = order.purchase_order_items.some(item =>
                item.product?.name.toLowerCase().includes(search) ||
                item.product?.sku.toLowerCase().includes(search)
            )
            if (!matchesOrder && !matchesSupplier && !matchesProduct) return false
        }

        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received': return 'status-received'
            case 'partial': return 'status-partial'
            case 'ordered': return 'status-ordered'
            default: return 'status-pending'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'received': return <CheckCircle size={16} />
            case 'partial': return <AlertCircle size={16} />
            default: return <Clock size={16} />
        }
    }

    const toggleExpanded = (orderId: string) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(orderId)) {
                newSet.delete(orderId)
            } else {
                newSet.add(orderId)
            }
            return newSet
        })
    }

    return (
        <div className="incoming-stock-page">
            {/* Stats */}
            <div className="incoming-stats">
                <div className="incoming-stat">
                    <div className="incoming-stat__icon total">
                        <FileText size={20} />
                    </div>
                    <div className="incoming-stat__info">
                        <span className="incoming-stat__value">{stats.total}</span>
                        <span className="incoming-stat__label">Total Orders</span>
                    </div>
                </div>
                <div className="incoming-stat">
                    <div className="incoming-stat__icon pending">
                        <Clock size={20} />
                    </div>
                    <div className="incoming-stat__info">
                        <span className="incoming-stat__value">{stats.pending}</span>
                        <span className="incoming-stat__label">Pending</span>
                    </div>
                </div>
                <div className="incoming-stat">
                    <div className="incoming-stat__icon partial">
                        <AlertCircle size={20} />
                    </div>
                    <div className="incoming-stat__info">
                        <span className="incoming-stat__value">{stats.partial}</span>
                        <span className="incoming-stat__label">Partial</span>
                    </div>
                </div>
                <div className="incoming-stat">
                    <div className="incoming-stat__icon received">
                        <CheckCircle size={20} />
                    </div>
                    <div className="incoming-stat__info">
                        <span className="incoming-stat__value">{stats.received}</span>
                        <span className="incoming-stat__label">Received</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="incoming-toolbar">
                <div className="incoming-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by order, supplier, product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="incoming-filters">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'partial' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('partial')}
                    >
                        Partial
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'received' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('received')}
                    >
                        Received
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="incoming-table-wrapper">
                {isLoading ? (
                    <div className="incoming-loading">
                        <div className="spinner" />
                        <span>Loading...</span>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="incoming-empty">
                        <TruckIcon size={48} />
                        <h3>No purchase orders found</h3>
                        <p>Purchase orders will appear here when created</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/purchasing/purchase-orders/new')}
                        >
                            Create Purchase Order
                        </button>
                    </div>
                ) : (
                    <table className="incoming-table">
                        <thead>
                            <tr>
                                <th className="th-expand"><span className="sr-only">Details</span></th>
                                <th>Order #</th>
                                <th>Supplier</th>
                                <th>Order Date</th>
                                <th>Expected</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const isExpanded = expandedOrders.has(order.id)
                                return (
                                    <Fragment key={order.id}>
                                        <tr className={`order-row ${isExpanded ? 'expanded' : ''}`}>
                                            <td className="cell-expand">
                                                <button
                                                    type="button"
                                                    className="btn-expand"
                                                    onClick={() => toggleExpanded(order.id)}
                                                    title={isExpanded ? 'Réduire' : 'Voir les produits'}
                                                >
                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                </button>
                                            </td>
                                            <td className="cell-order">
                                                <span className="order-number">{order.po_number}</span>
                                            </td>
                                            <td className="cell-supplier">
                                                {order.supplier?.name || '-'}
                                            </td>
                                            <td className="cell-date">
                                                <Calendar size={14} />
                                                {formatDate(order.order_date)}
                                            </td>
                                            <td className="cell-date">
                                                {order.expected_delivery_date ? (
                                                    <>
                                                        <TruckIcon size={14} />
                                                        {formatDate(order.expected_delivery_date)}
                                                    </>
                                                ) : '-'}
                                            </td>
                                            <td className="cell-items">
                                                <Package size={14} />
                                                {order.purchase_order_items.length} products
                                            </td>
                                            <td className="cell-total">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="cell-status">
                                                <span className={`status-badge ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="cell-actions">
                                                <button
                                                    type="button"
                                                    className="btn-icon-sm"
                                                    onClick={() => navigate(`/purchasing/purchase-orders/${order.id}`)}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="order-details-row">
                                                <td colSpan={9}>
                                                    <div className="order-products-detail">
                                                        <div className="products-detail-header">
                                                            <Package size={16} />
                                                            <span>Products in Order</span>
                                                        </div>
                                                        <table className="products-detail-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Product</th>
                                                                    <th>SKU</th>
                                                                    <th className="text-right">Qty Ordered</th>
                                                                    <th className="text-right">Qty Received</th>
                                                                    <th className="text-right">Unit Price</th>
                                                                    <th className="text-right">Total</th>
                                                                    <th>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.purchase_order_items.map(item => {
                                                                    const receptionPercent = item.quantity > 0
                                                                        ? Math.round((item.quantity_received / item.quantity) * 100)
                                                                        : 0
                                                                    const isComplete = item.quantity_received >= item.quantity
                                                                    const isPartial = item.quantity_received > 0 && item.quantity_received < item.quantity
                                                                    return (
                                                                        <tr key={item.id}>
                                                                            <td className="product-name">
                                                                                {item.product?.name || '-'}
                                                                            </td>
                                                                            <td className="product-sku">
                                                                                {item.product?.sku || '-'}
                                                                            </td>
                                                                            <td className="text-right">
                                                                                {item.quantity}
                                                                            </td>
                                                                            <td className="text-right">
                                                                                <span className={`qty-received ${isComplete ? 'complete' : isPartial ? 'partial' : 'pending'}`}>
                                                                                    {item.quantity_received}
                                                                                </span>
                                                                            </td>
                                                                            <td className="text-right">
                                                                                {formatCurrency(item.unit_price)}
                                                                            </td>
                                                                            <td className="text-right font-semibold">
                                                                                {formatCurrency(item.quantity * item.unit_price)}
                                                                            </td>
                                                                            <td>
                                                                                <div className="reception-progress">
                                                                                    <div
                                                                                        className={`progress-bar ${isComplete ? 'complete' : isPartial ? 'partial' : 'pending'}`}
                                                                                        style={{ '--progress-width': `${Math.min(receptionPercent, 100)}%` } as React.CSSProperties}
                                                                                    />
                                                                                    <span className="progress-text">{receptionPercent}%</span>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
