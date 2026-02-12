import {
    LayoutGrid,
    DollarSign,
    Package,
    ShieldAlert,
    ShoppingCart,
    FileText,
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    AlertTriangle,
    History,
    ClipboardList,
    Clock,
    CreditCard,
    List
} from 'lucide-react';

export type ReportDefinition = {
    id: string;
    title: string;
    description: string;
    icon: any;
    component?: React.ReactNode;
    /** Hide report from navigation (e.g., feature not yet implemented) */
    hidden?: boolean;
    /** Show placeholder message instead of component */
    placeholder?: string;
};


export type ReportCategory = {
    id: string;
    title: string;
    icon: any;
    reports: ReportDefinition[];
};

export const REPORT_CATEGORIES: ReportCategory[] = [
    {
        id: 'overview',
        title: 'Overview',
        icon: LayoutGrid,
        reports: [
            {
                id: 'dashboard',
                title: 'General Dashboard',
                description: 'High-level business performance metrics',
                icon: LayoutGrid
            }
        ]
    },
    {
        id: 'sales',
        title: 'Sales',
        icon: DollarSign,
        reports: [
            {
                id: 'sales_dashboard',
                title: 'All in 1 Sales Summary',
                description: 'Comprehensive sales overview',
                icon: FileText
            },
            {
                id: 'daily_sales',
                title: 'Daily Sales',
                description: 'Sales breakdown by day',
                icon: Calendar
            },
            {
                id: 'sales_by_date',
                title: 'Sales By Date',
                description: 'Detailed sales log by date',
                icon: Calendar,
                hidden: true,
                placeholder: 'This report is planned for a future release.'
            },
            {
                id: 'sales_items_by_date',
                title: 'Sales Items By Date',
                description: 'Itemized sales log',
                icon: List,
                hidden: true,
                placeholder: 'This report is planned for a future release.'
            },
            {
                id: 'product_performance',
                title: 'Product Sales By SKU',
                description: 'Revenue and quantity per product',
                icon: Package
            },
            {
                id: 'sales_by_category',
                title: 'Product Sales By Category',
                description: 'Performance by product category',
                icon: LayoutGrid
            },
            {
                id: 'sales_by_brand',
                title: 'Product Sales By Brand',
                description: 'Performance by brand',
                icon: LayoutGrid,
                hidden: true,
                placeholder: 'This report is planned for a future release.'
            },
            {
                id: 'sales_by_customer',
                title: 'Sales By Customer',
                description: 'Revenue per customer',
                icon: Users
            },
            {
                id: 'sales_by_hour',
                title: 'Sales Details By Hours',
                description: 'Peak hour analysis',
                icon: Clock
            },
            {
                id: 'sales_cancellation',
                title: 'Sales Cancellation Details',
                description: 'Voided and cancelled orders',
                icon: AlertTriangle
            },
            {
                id: 'profit_loss',
                title: 'Profit Loss',
                description: 'Income vs Expense analysis',
                icon: TrendingUp
            }
        ]
    },
    {
        id: 'inventory',
        title: 'Inventory',
        icon: Package,
        reports: [
            {
                id: 'inventory_dashboard',
                title: 'Product Stock Balance',
                description: 'Current stock levels and valuation',
                icon: LayoutGrid
            },
            {
                id: 'stock_movement',
                title: 'Stock Movement',
                description: 'History of all stock changes',
                icon: History
            },
            {
                id: 'incoming_stock',
                title: 'Incoming Stocks',
                description: 'Purchases and internal transfers in',
                icon: TrendingUp,
                hidden: true,
                placeholder: 'This report is planned for a future release.'
            },
            {
                id: 'outgoing_stock',
                title: 'Outgoing Stocks',
                description: 'Sales, wastage, and transfers out',
                icon: TrendingDown,
                hidden: true,
                placeholder: 'This report is planned for a future release.'
            },
            {
                id: 'stock_warning',
                title: 'Product Stock Warning',
                description: 'Low stock and reorder alerts',
                icon: AlertTriangle
            },
            {
                id: 'unsold_products',
                title: 'Product Unsold',
                description: 'Items with no sales in period',
                icon: AlertTriangle
            },
            {
                id: 'expired_stock',
                title: 'Expired Stock',
                description: 'tracked lots that have expired',
                icon: AlertTriangle
            }
        ]
    },
    {
        id: 'purchase',
        title: 'Purchases',
        icon: ShoppingCart,
        reports: [
            {
                id: 'purchase_details',
                title: 'Purchase Details',
                description: 'Detailed purchase logs',
                icon: ClipboardList
            },
            {
                id: 'purchase_by_date',
                title: 'Purchase By Date',
                description: 'Purchase history timeline',
                icon: Calendar
            },
            {
                id: 'purchase_by_supplier',
                title: 'Purchase By Supplier',
                description: 'Supplier performance and costs',
                icon: Users
            },
            {
                id: 'purchase_returns',
                title: 'Purchase Returns',
                description: 'Items returned to suppliers',
                icon: TrendingDown,
                hidden: true,
                placeholder: 'This report is planned for a future release.'
            },
            {
                id: 'outstanding_purchase_payment',
                title: 'Outstanding Payment',
                description: 'Unpaid purchase invoices',
                icon: DollarSign
            }
        ]
    },
    {
        id: 'finance',
        title: 'Finance & Payments',
        icon: CreditCard,
        reports: [
            {
                id: 'payment_by_method',
                title: 'Payment By Method',
                description: 'Cash, Card, QRIS, etc.',
                icon: CreditCard
            },
            {
                id: 'cash_balance',
                title: 'Sales Cash Balance',
                description: 'Cash drawer reconciliation',
                icon: DollarSign
            },
            {
                id: 'receivables',
                title: 'Receivables',
                description: 'Customer debts and credit',
                icon: FileText
            },
            {
                id: 'expenses',
                title: 'Expenses by Date',
                description: 'Operational expenses',
                icon: TrendingDown,
                hidden: true,
                placeholder: 'Expenses tracking will be available when the Accounting module (Epic 9) is implemented.'
            },
            {
                id: 'discounts_voids',
                title: 'Discounts & Voids',
                description: 'Analysis of discounts, voids and refunds',
                icon: AlertTriangle
            }
        ]
    },
    {
        id: 'logs',
        title: 'Logs & Audit',
        icon: ShieldAlert,
        reports: [
            {
                id: 'price_changes',
                title: 'Price Changes',
                description: 'History of product price updates',
                icon: DollarSign
            },
            {
                id: 'deleted_products',
                title: 'Product Deleted',
                description: 'Log of removed items',
                icon: FileText
            },
            {
                id: 'audit_log',
                title: 'General Audit Log',
                description: 'System-wide security events',
                icon: ShieldAlert
            },
            {
                id: 'alerts_dashboard',
                title: 'Alerts Dashboard',
                description: 'Smart anomaly detection alerts',
                icon: ShieldAlert
            }
        ]
    }
];


