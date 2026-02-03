import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Boxes,
    TruckIcon,
    Trash2,
    Factory,
    ClipboardCheck,
    ArrowLeftRight,
    ArrowRightLeft
} from 'lucide-react'
import './InventoryLayout.css'

type Tab = {
    id: string
    labelKey: string
    icon: React.ReactNode
    path: string
}

const TABS: Tab[] = [
    {
        id: 'stock',
        labelKey: 'inventory.tabs.stock',
        icon: <Boxes size={18} />,
        path: '/inventory'
    },
    {
        id: 'incoming',
        labelKey: 'inventory.tabs.incoming',
        icon: <TruckIcon size={18} />,
        path: '/inventory/incoming'
    },
    {
        id: 'transfers',
        labelKey: 'inventory.tabs.transfers',
        icon: <ArrowRightLeft size={18} />,
        path: '/inventory/transfers'
    },
    {
        id: 'wasted',
        labelKey: 'inventory.tabs.wasted',
        icon: <Trash2 size={18} />,
        path: '/inventory/wasted'
    },
    {
        id: 'production',
        labelKey: 'inventory.tabs.production',
        icon: <Factory size={18} />,
        path: '/inventory/production'
    },
    {
        id: 'opname',
        labelKey: 'inventory.tabs.opname',
        icon: <ClipboardCheck size={18} />,
        path: '/inventory/opname'
    },
    {
        id: 'movements',
        labelKey: 'inventory.tabs.movements',
        icon: <ArrowLeftRight size={18} />,
        path: '/inventory/movements'
    }
]

export default function InventoryLayout() {
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()

    const getActiveTab = (): string => {
        const path = location.pathname
        if (path.startsWith('/inventory/incoming')) return 'incoming'
        if (path.startsWith('/inventory/transfers')) return 'transfers'
        if (path.startsWith('/inventory/wasted')) return 'wasted'
        if (path.startsWith('/inventory/production')) return 'production'
        if (path.startsWith('/inventory/opname') || path.startsWith('/inventory/stock-opname')) return 'opname'
        if (path.startsWith('/inventory/movements')) return 'movements'
        return 'stock'
    }

    const activeTab = getActiveTab()

    return (
        <div className="inventory-layout">
            <div className="inventory-layout__header">
                <h1 className="inventory-layout__title">{t('inventory.title', 'Stock & Inventory')}</h1>
                <p className="inventory-layout__subtitle">{t('inventory.subtitle', 'Manage stock, track movements, and monitor inventory')}</p>
            </div>
            <div className="inventory-layout__tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`inventory-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.icon}
                        <span>{t(tab.labelKey, tab.id)}</span>
                    </button>
                ))}
            </div>
            <div className="inventory-layout__content">
                <Outlet />
            </div>
        </div>
    )
}
