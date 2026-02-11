import { RefreshCw, Check, Clock, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    formatCurrency,
    formatTime,
    formatDate,
    getOrderTypeIcon,
    getOrderTypeLabel,
    getStatusLabel,
    getPaymentIcon,
    getPaymentMethodLabel,
    ITEMS_PER_PAGE,
} from './ordersPageHelpers';
import type { Order } from './ordersPageHelpers';

interface OrdersTableProps {
    paginatedOrders: Order[];
    filteredTotal: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    onSelectOrder: (order: Order) => void;
    onPageChange: (page: number) => void;
}

const OrdersTable = ({
    paginatedOrders,
    filteredTotal,
    currentPage,
    totalPages,
    isLoading,
    onSelectOrder,
    onPageChange,
}: OrdersTableProps) => {
    if (isLoading) {
        return (
            <div className="orders-table-container">
                <div className="orders-loading">
                    <RefreshCw size={32} className="spinning" />
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    if (paginatedOrders.length === 0) {
        return (
            <div className="orders-table-container">
                <div className="orders-empty">
                    <div className="orders-empty__icon">{'\uD83D\uDCCB'}</div>
                    <div className="orders-empty__text">No orders found</div>
                    <div className="orders-empty__subtext">Adjust your filters to see more results</div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-table-container">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedOrders.map(order => (
                        <tr
                            key={order.id}
                            className={order.payment_status !== 'paid' ? 'is-unpaid' : ''}
                            onClick={() => onSelectOrder(order)}
                        >
                            <td>
                                <span className="order-number">#{order.order_number}</span>
                            </td>
                            <td>
                                <div>{formatTime(order.created_at)}</div>
                                <div className="order-date-sub">
                                    {formatDate(order.created_at)}
                                </div>
                            </td>
                            <td>
                                <span className={`order-type-badge ${order.order_type}`}>
                                    {getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}
                                    {order.table_number && ` - T${order.table_number}`}
                                </span>
                            </td>
                            <td>
                                <span className="order-customer">
                                    {order.customer_name || '-'}
                                </span>
                            </td>
                            <td>
                                <span className="order-items-count">
                                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                </span>
                            </td>
                            <td>
                                <span className="order-amount">{formatCurrency(order.total)}</span>
                            </td>
                            <td>
                                <span className={`order-status ${order.status}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </td>
                            <td>
                                <div className="payment-info">
                                    <span className={`payment-status ${order.payment_status}`}>
                                        {order.payment_status === 'paid' ? (
                                            <><Check size={14} /> Paid</>
                                        ) : (
                                            <><Clock size={14} /> Unpaid</>
                                        )}
                                    </span>
                                    {order.payment_status === 'paid' && order.payment_method && (
                                        <span className="payment-method">
                                            {getPaymentIcon(order.payment_method)}
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td>
                                <button
                                    className="btn-view-order"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectOrder(order);
                                    }}
                                >
                                    <Eye size={14} /> Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="orders-pagination">
                <div className="pagination-info">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredTotal)} of {filteredTotal} orders
                </div>
                <div className="pagination-buttons">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <button
                                key={pageNum}
                                className={`pagination-btn ${currentPage === pageNum ? 'is-active' : ''}`}
                                onClick={() => onPageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-label="Next Page"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrdersTable;
