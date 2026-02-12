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
import { cn } from '@/lib/utils'

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
        <div className="flex flex-col h-full bg-gray-50">
            <div className="px-4 md:px-8 pt-4 md:pt-6 pb-3 md:pb-4 bg-white border-b border-gray-200">
                <h1 className="text-2xl md:text-[1.75rem] font-bold text-gray-900 mb-1">Stock & Inventory</h1>
                <p className="text-[0.9375rem] text-gray-500">Manage stock, track movements, and monitor inventory</p>
            </div>
            <div className="flex gap-1 px-4 md:px-8 bg-white border-b border-gray-200 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={cn(
                            'flex items-center gap-2 py-3 md:py-3.5 px-4 md:px-5 text-sm md:text-[0.9375rem] font-medium bg-transparent border-b-2 border-transparent cursor-pointer transition-all duration-200 whitespace-nowrap [&>svg]:shrink-0',
                            activeTab === tab.id
                                ? 'text-blue-500 border-b-blue-500'
                                : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                        )}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.icon}
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6">
                <Outlet />
            </div>
        </div>
    )
}
