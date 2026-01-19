import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Package, Box, Tag } from 'lucide-react'
import './ProductsLayout.css'

type Tab = {
    id: string
    label: string
    icon: React.ReactNode
    path: string
}

const TABS: Tab[] = [
    {
        id: 'products',
        label: 'Produits',
        icon: <Package size={18} />,
        path: '/products'
    },
    {
        id: 'combos',
        label: 'Combos',
        icon: <Box size={18} />,
        path: '/products/combos'
    },
    {
        id: 'promotions',
        label: 'Promotions',
        icon: <Tag size={18} />,
        path: '/products/promotions'
    }
]

export default function ProductsLayout() {
    const location = useLocation()
    const navigate = useNavigate()

    const getActiveTab = (): string => {
        const path = location.pathname
        if (path.startsWith('/products/combos')) return 'combos'
        if (path.startsWith('/products/promotions')) return 'promotions'
        return 'products'
    }

    const activeTab = getActiveTab()

    return (
        <div className="products-layout">
            <div className="products-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="products-content">
                <Outlet />
            </div>
        </div>
    )
}
