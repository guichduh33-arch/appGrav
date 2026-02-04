import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
    label: string
    icon: React.ReactNode
    path: string
}

const TABS: Tab[] = [
    {
        id: 'stock',
        label: 'Stock',
        icon: <Boxes size={18} />,
        path: '/inventory'
    },
    {
        id: 'incoming',
        label: 'Incoming',
        icon: <TruckIcon size={18} />,
        path: '/inventory/incoming'
    },
    {
        id: 'transfers',
        label: 'Transfers',
        icon: <ArrowRightLeft size={18} />,
        path: '/inventory/transfers'
    },
    {
        id: 'wasted',
        label: 'Wastage',
        icon: <Trash2 size={18} />,
        path: '/inventory/wasted'
    },
    {
        id: 'production',
        label: 'Production',
        icon: <Factory size={18} />,
        path: '/inventory/production'
    },
    {
        id: 'opname',
        label: 'Opname',
        icon: <ClipboardCheck size={18} />,
        path: '/inventory/opname'
    },
    {
        id: 'movements',
        label: 'Movements',
        icon: <ArrowLeftRight size={18} />,
        path: '/inventory/movements'
    }
]

export default function InventoryLayout() {
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
                <h1 className="inventory-layout__title">Stock & Inventory</h1>
                <p className="inventory-layout__subtitle">Manage stock, track movements, and monitor inventory</p>
            </div>
            <div className="inventory-layout__tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`inventory-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="inventory-layout__content">
                <Outlet />
            </div>
        </div>
    )
}
