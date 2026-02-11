import type { ReactNode } from 'react';
import { createElement } from 'react';
import { Banknote, QrCode, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    modifiers: Record<string, unknown> | null;
    modifiers_total: number;
    item_status: import('../../components/orders/OrderItemStatusBadge').TItemStatus;
    dispatch_station?: string;
}

export interface Order {
    id: string;
    order_number: string;
    order_type: string;
    table_number: string | null;
    customer_name: string | null;
    status: string;
    payment_status: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total: number;
    payment_method: string | null;
    cash_received: number | null;
    change_given: number | null;
    created_at: string;
    completed_at: string | null;
    items: OrderItem[];
}

export type OrderStatus = 'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type OrderType = 'all' | 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
export type PaymentStatus = 'all' | 'paid' | 'unpaid';

export const ITEMS_PER_PAGE = 20;

export const ORDER_STATUSES: OrderStatus[] = [
    'all', 'pending', 'preparing', 'ready', 'completed', 'cancelled',
];

// ---------------------------------------------------------------------------
// Date / time formatters
// ---------------------------------------------------------------------------

export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

export const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ---------------------------------------------------------------------------
// Label / icon helpers
// ---------------------------------------------------------------------------

export const getOrderTypeLabel = (type: string): string => {
    switch (type) {
        case 'dine_in': return 'Dine In';
        case 'takeaway': return 'Takeaway';
        case 'delivery': return 'Delivery';
        case 'b2b': return 'B2B';
        default: return type;
    }
};

export const getOrderTypeIcon = (type: string): string => {
    switch (type) {
        case 'dine_in': return '\uD83C\uDF7D\uFE0F';
        case 'takeaway': return '\uD83D\uDCE6';
        case 'delivery': return '\uD83D\uDE97';
        case 'b2b': return '\uD83C\uDFE2';
        default: return '\uD83D\uDCCB';
    }
};

export const getStatusLabel = (status: string): string => {
    switch (status) {
        case 'pending': return 'Pending';
        case 'preparing': return 'Preparing';
        case 'ready': return 'Ready';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
};

export const getPaymentIcon = (method: string | null): ReactNode => {
    switch (method) {
        case 'cash':
            return createElement(Banknote, { size: 14, className: 'payment-method-icon payment-method-icon--cash' });
        case 'qris':
            return createElement(QrCode, { size: 14, className: 'payment-method-icon payment-method-icon--qris' });
        case 'card':
        case 'edc':
            return createElement(CreditCard, { size: 14, className: 'payment-method-icon payment-method-icon--card' });
        default:
            return createElement(CreditCard, { size: 14 });
    }
};

export const getPaymentMethodLabel = (method: string | null): string => {
    switch (method) {
        case 'cash': return 'Cash';
        case 'qris': return 'QRIS';
        case 'card': return 'Card';
        case 'edc': return 'EDC';
        case 'transfer': return 'Transfer';
        default: return method || '-';
    }
};

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

export const exportOrdersCsv = (
    filteredOrders: Order[],
    dateFrom: string,
    dateTo: string,
): void => {
    const headers = ['Order #', 'Date', 'Type', 'Customer', 'Amount', 'Status', 'Payment', 'Method'];
    const rows = filteredOrders.map(order => [
        order.order_number,
        formatFullDate(order.created_at),
        getOrderTypeLabel(order.order_type),
        order.customer_name || '-',
        String(order.total),
        getStatusLabel(order.status),
        order.payment_status === 'paid' ? 'Paid' : 'Unpaid',
        getPaymentMethodLabel(order.payment_method),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_${dateFrom}_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

export interface OrderStats {
    total: number;
    totalAmount: number;
    paid: number;
    unpaid: number;
    paidAmount: number;
    unpaidAmount: number;
}

export const computeStats = (filteredOrders: Order[]): OrderStats => {
    return {
        total: filteredOrders.length,
        totalAmount: filteredOrders.reduce((sum, o) => sum + o.total, 0),
        paid: filteredOrders.filter(o => o.payment_status === 'paid').length,
        unpaid: filteredOrders.filter(o => o.payment_status === 'unpaid' || o.payment_status === 'pending').length,
        paidAmount: filteredOrders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
        unpaidAmount: filteredOrders.filter(o => o.payment_status === 'unpaid' || o.payment_status === 'pending').reduce((sum, o) => sum + o.total, 0),
    };
};

export { formatCurrency };
