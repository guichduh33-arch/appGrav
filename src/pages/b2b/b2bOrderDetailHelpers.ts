import {
    FileText, CheckCircle, Clock, Package, Truck, AlertCircle
} from 'lucide-react'
import type { ElementType } from 'react'

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: ElementType }> = {
    draft: { label: 'Draft', color: 'gray', icon: FileText },
    confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle },
    processing: { label: 'Processing', color: 'yellow', icon: Clock },
    ready: { label: 'Ready', color: 'purple', icon: Package },
    partially_delivered: { label: 'Partial Delivery', color: 'orange', icon: Truck },
    delivered: { label: 'Delivered', color: 'green', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'red', icon: AlertCircle }
}

export const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Cash',
    transfer: 'Transfer',
    check: 'Check',
    card: 'Card',
    qris: 'QRIS',
    credit: 'Credit'
}

export const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    unpaid: { label: 'Unpaid', color: 'red' },
    partial: { label: 'Partial', color: 'orange' },
    paid: { label: 'Paid', color: 'green' },
    overdue: { label: 'Overdue', color: 'red' }
}
