import {
    LayoutGrid,
    DollarSign,
    Package,
    ShieldAlert,
    ShoppingCart,
    FileText,
    TrendingUp,
    Calendar,
    Users,
    AlertTriangle,
    History,
    ClipboardList
} from 'lucide-react';

export type ReportDefinition = {
    id: string;
    title: string;
    description: string;
    icon: any;
    component?: React.ReactNode;
};

// Helper to handle icon imports if needed, for now using lucide directly.
const UnwantedIcon = AlertTriangle; // Placeholder

export type ReportCategory = {
    id: string;
    title: string;
    icon: any;
    reports: ReportDefinition[];
};

export const REPORT_CATEGORIES: ReportCategory[] = [
    {
        id: 'overview',
        title: 'reporting.tabs.overview', // utilizing existing translation keys where possible
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
        title: 'reporting.tabs.sales',
        icon: DollarSign,
        reports: [
            {
                id: 'sales_dashboard',
                title: 'Sales Dashboard',
                description: 'Comprehensive sales analytics and charts',
                icon: TrendingUp
            },
            {
                id: 'daily_sales',
                title: 'Daily Sales',
                description: 'Sales breakdown by day and time',
                icon: Calendar
            },
            {
                id: 'product_performance',
                title: 'Product Performance',
                description: 'Top selling items and profit margins',
                icon: Package
            },
            {
                id: 'employee_sales',
                title: 'Employee Sales',
                description: 'Staff performance and shift stats',
                icon: Users
            }
        ]
    },
    {
        id: 'inventory',
        title: 'reporting.tabs.inventory',
        icon: Package,
        reports: [
            {
                id: 'inventory_dashboard',
                title: 'Inventory Dashboard',
                description: 'Stock valuation and overflow',
                icon: LayoutGrid
            },
            {
                id: 'low_stock',
                title: 'Low Stock Alert',
                description: 'Items below minimum quantity',
                icon: AlertTriangle
            },
            {
                id: 'stock_movement',
                title: 'Stock Movement',
                description: 'In/Out logs and adjustments',
                icon: History
            },
            {
                id: 'wastage',
                title: 'Wastage Report',
                description: 'Tracking lost, damaged, or expired stock',
                icon: UnwantedIcon
            }
        ]
    },
    {
        id: 'purchase',
        title: 'Purchases', // Need translation
        icon: ShoppingCart,
        reports: [
            {
                id: 'purchase_orders',
                title: 'Purchase Orders',
                description: 'History of supplier orders and receipts',
                icon: ClipboardList
            },
            {
                id: 'supplier_stats',
                title: 'Supplier Performance',
                description: 'Cost analysis by supplier',
                icon: Users
            }
        ]
    },
    {
        id: 'logs',
        title: 'Logs & Audit', // Need translation
        icon: ShieldAlert,
        reports: [
            {
                id: 'audit_log',
                title: 'Security Audit',
                description: 'Sensitive actions and system modifications',
                icon: ShieldAlert
            },
            {
                id: 'shift_logs',
                title: 'Shift Logs',
                description: 'Register open/close periods',
                icon: FileText
            }
        ]
    }
];


