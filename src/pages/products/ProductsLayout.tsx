import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Package, Box, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = {
    id: string
    label: string
    icon: React.ReactNode
    path: string
}

const TABS: Tab[] = [
    {
        id: 'products',
        label: 'Products',
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
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b-2 border-slate-200 flex gap-2 px-4 md:px-8 sticky top-0 z-10 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={cn(
                            'flex items-center gap-2 py-3.5 md:py-4 px-4 md:px-6 bg-transparent text-sm md:text-[0.95rem] font-medium cursor-pointer relative transition-all duration-200 border-b-[3px] border-transparent whitespace-nowrap [&>svg]:shrink-0',
                            activeTab === tab.id
                                ? 'text-indigo-500 border-b-indigo-500'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        )}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}
