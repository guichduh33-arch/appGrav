import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { exportProducts, pushLocalProductsToCloud } from '@/services/products/productImportExport'
import { exportRecipes } from '@/services/products/recipeImportExport'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'
import {
    Cloud, Package, Coffee, Croissant, Search, Plus,
    Eye, Edit, Tag, DollarSign, LayoutGrid, List,
    Upload, Download, ChefHat
} from 'lucide-react'
import ProductImportModal from '@/components/products/ProductImportModal'
import RecipeImportModal from '@/components/products/RecipeImportModal'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'

interface Category {
    id: string
    name: string
    color: string | null
}

interface Product {
    id: string
    name: string
    sku: string
    category_id: string | null
    category?: Category
    product_type: string
    retail_price: number
    wholesale_price: number | null
    cost_price: number
    pos_visible: boolean
    is_active: boolean
    image_url: string | null
}

type ViewMode = 'grid' | 'list'
type TabType = 'all' | 'finished' | 'semi_finished' | 'raw_material'

export default function ProductsPage() {
    const navigate = useNavigate()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [showImportModal, setShowImportModal] = useState(false)
    const [showRecipeImportModal, setShowRecipeImportModal] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [exportingRecipes, setExportingRecipes] = useState(false)
    const [syncingToCloud, setSyncingToCloud] = useState(false)
    const [localCount, setLocalCount] = useState(0)

    useEffect(() => {
        const checkLocalData = async () => {
            const count = await db.offline_products.count()
            setLocalCount(count)
        }
        checkLocalData()
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                supabase
                    .from('products')
                    .select(`
                        id, name, sku, category_id, product_type,
                        retail_price, wholesale_price, cost_price,
                        pos_visible, is_active, image_url,
                        category:categories(id, name, color)
                    `)
                    .order('name')
                    .returns<Product[]>(),
                supabase
                    .from('categories')
                    .select('id, name, color')
                    .order('name')
            ])

            if (productsRes.data) setProducts(productsRes.data)
            if (categoriesRes.data) setCategories(categoriesRes.data)
        } catch (error) {
            logError('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            const result = await exportProducts()
            if (result.success) {
                toast.success('Export successful')
            } else {
                toast.error(result.error || 'Error during export')
            }
        } catch {
            toast.error('Error during export')
        } finally {
            setExporting(false)
        }
    }

    const handleExportRecipes = async () => {
        setExportingRecipes(true)
        try {
            const result = await exportRecipes()
            if (result.success) {
                toast.success('Recipes export successful')
            } else {
                toast.error(result.error || 'Error during recipes export')
            }
        } catch {
            toast.error('Error during recipes export')
        } finally {
            setExportingRecipes(false)
        }
    }

    const handleSyncToCloud = async () => {
        if (syncingToCloud) return
        setSyncingToCloud(true)
        const loadingToast = toast.loading('Syncing products to cloud...')

        try {
            const result = await pushLocalProductsToCloud()
            toast.dismiss(loadingToast)

            if (result.success) {
                toast.success(`${result.created} products synced successfully`)
                // Refresh data to show what's now in Supabase
                fetchData()
            } else {
                toast.error(result.errors[0]?.error || 'Error during synchronization')
            }
        } catch {
            toast.dismiss(loadingToast)
            toast.error('Unexpected error during synchronization')
        } finally {
            setSyncingToCloud(false)
        }
    }

    const stats = useMemo(() => {
        const all = products.length
        const finished = products.filter((p: Product) => p.product_type === 'finished').length
        const semiFinished = products.filter((p: Product) => p.product_type === 'semi_finished').length
        const rawMaterial = products.filter((p: Product) => p.product_type === 'raw_material').length
        return { all, finished, semiFinished, rawMaterial }
    }, [products])

    const filteredProducts = useMemo(() => {
        return products.filter((product: Product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter

            const matchesTab = activeTab === 'all' || product.product_type === activeTab

            return matchesSearch && matchesCategory && matchesTab
        })
    }, [products, searchTerm, categoryFilter, activeTab])

    const getProductTypeIcon = (type: string) => {
        switch (type) {
            case 'finished': return <Coffee size={16} />
            case 'semi_finished': return <Croissant size={16} />
            case 'raw_material': return <Package size={16} />
            default: return <Package size={16} />
        }
    }

    const getProductTypeLabel = (type: string) => {
        switch (type) {
            case 'finished': return 'Finished Product'
            case 'semi_finished': return 'Semi-Finished'
            case 'raw_material': return 'Raw Material'
            default: return type
        }
    }

    const getTypeBadgeClasses = (type: string) => {
        switch (type) {
            case 'finished': return 'bg-success-bg text-success-text border border-success-border'
            case 'semi_finished': return 'bg-warning-bg text-warning-text border border-warning-border'
            case 'raw_material': return 'bg-info-bg text-info-text border border-info-border'
            default: return ''
        }
    }
    return (
        <div className="p-8 max-w-[1600px] mx-auto md:p-4">
            {/* Header */}
            <header className="flex justify-between items-start mb-8 gap-4 flex-wrap md:flex-col">
                <div className="flex-1">
                    <h1 className="flex items-center gap-3 font-display text-[2rem] font-semibold text-[var(--theme-text-primary)] m-0 mb-1 md:text-2xl [&>svg]:text-[var(--color-gold)]">
                        <Package size={28} />
                        Product Management
                    </h1>
                    <p className="font-display italic text-[var(--theme-text-secondary)] text-base m-0">
                        Manage your products, prices and customer category pricing
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {localCount > 0 && products.length === 0 && (
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={handleSyncToCloud}
                            disabled={syncingToCloud}
                            title="Push local products to Supabase"
                        >
                            <Cloud size={18} className={syncingToCloud ? 'animate-spin' : ''} />
                            {syncingToCloud ? 'Sync in progress...' : 'Push to Cloud'}
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleExport}
                        disabled={exporting}
                        title="Export products"
                    >
                        <Download size={18} />
                        {exporting ? 'Export...' : 'Products'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowImportModal(true)}
                        title="Import products"
                    >
                        <Upload size={18} />
                        Products
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleExportRecipes}
                        disabled={exportingRecipes}
                        title="Export recipes"
                    >
                        <ChefHat size={18} />
                        {exportingRecipes ? 'Export...' : 'Recipes'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowRecipeImportModal(true)}
                        title="Import recipes"
                    >
                        <ChefHat size={18} />
                        <Upload size={14} style={{ marginLeft: -4 }} />
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 py-3 px-5 rounded-lg font-body text-sm font-semibold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-gradient-to-b from-gold to-gold-dark text-white shadow-[0_2px_8px_rgba(201,165,92,0.3)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(201,165,92,0.4)]"
                        onClick={() => navigate('/products/new')}
                    >
                        <Plus size={18} />
                        New Product
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8 lg:grid-cols-2 md:grid-cols-2">
                {([
                    { tab: 'all' as TabType, icon: <Package size={24} />, value: stats.all, label: 'All Products' },
                    { tab: 'finished' as TabType, icon: <Coffee size={24} />, value: stats.finished, label: 'Finished Products' },
                    { tab: 'semi_finished' as TabType, icon: <Croissant size={24} />, value: stats.semiFinished, label: 'Semi-Finished' },
                    { tab: 'raw_material' as TabType, icon: <Package size={24} />, value: stats.rawMaterial, label: 'Raw Materials' },
                ]).map(stat => (
                    <div
                        key={stat.tab}
                        className={cn(
                            'flex items-center gap-4 p-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-[var(--theme-border)] cursor-pointer transition-all duration-[250ms] shadow-sm hover:border-[var(--color-gold-light)] hover:-translate-y-0.5 hover:shadow-md md:p-4 [&>svg]:text-[var(--color-gold)] [&>svg]:shrink-0',
                            activeTab === stat.tab && 'border-[var(--color-gold)] bg-gradient-to-br from-[rgba(201,165,92,0.12)] to-[var(--theme-bg-secondary)] shadow-[0_0_0_2px_rgba(201,165,92,0.3)]'
                        )}
                        onClick={() => setActiveTab(stat.tab)}
                    >
                        {stat.icon}
                        <div className="flex flex-col">
                            <span className="font-display text-[1.75rem] font-bold text-[var(--theme-text-primary)] md:text-2xl">{stat.value}</span>
                            <span className="font-body text-xs text-[var(--theme-text-secondary)] uppercase tracking-[0.05em]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 items-center flex-wrap md:flex-col">
                <div className="flex-1 min-w-[280px] flex items-center gap-3 px-4 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-lg transition-all duration-200 focus-within:border-[var(--color-gold)] focus-within:shadow-[0_0_0_3px_rgba(201,165,92,0.15)] [&>svg]:text-[var(--theme-text-secondary)] [&>svg]:shrink-0 md:w-full md:min-w-0">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none py-3.5 font-body text-sm bg-transparent text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-muted)] placeholder:opacity-70"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="py-3.5 px-4 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-bg-secondary)] font-body text-sm text-[var(--theme-text-primary)] min-w-[180px] cursor-pointer transition-all duration-200 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(201,165,92,0.15)] md:w-full md:min-w-0"
                    aria-label="Filter by category"
                >
                    <option value="all">All categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="flex bg-[var(--theme-bg-secondary)] rounded-md p-1 border border-[var(--theme-border)]">
                    <button
                        className={cn(
                            'py-2 px-2.5 border-none bg-transparent rounded-sm cursor-pointer text-[var(--theme-text-secondary)] transition-all duration-200 flex items-center justify-center hover:text-[var(--theme-text-primary)]',
                            viewMode === 'grid' && 'bg-[var(--theme-bg-tertiary)] text-[var(--color-gold)] shadow-sm'
                        )}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                        aria-label="Grid view"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={cn(
                            'py-2 px-2.5 border-none bg-transparent rounded-sm cursor-pointer text-[var(--theme-text-secondary)] transition-all duration-200 flex items-center justify-center hover:text-[var(--theme-text-primary)]',
                            viewMode === 'list' && 'bg-[var(--theme-bg-tertiary)] text-[var(--color-gold)] shadow-sm'
                        )}
                        onClick={() => setViewMode('list')}
                        title="List view"
                        aria-label="List view"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 bg-[var(--theme-bg-secondary)] rounded-xl border-2 border-dashed border-[var(--theme-border)] text-[var(--theme-text-secondary)] gap-4">
                    <div className="w-10 h-10 border-[3px] border-[var(--theme-border)] border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span>Loading products...</span>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 bg-[var(--theme-bg-secondary)] rounded-xl border-2 border-dashed border-[var(--theme-border)] text-[var(--theme-text-secondary)] gap-4">
                    <Package size={64} />
                    <h3 className="m-0 font-display text-[var(--theme-text-primary)]">No product found</h3>
                    <p className="m-0 font-body">
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Try modifying your filters'
                            : 'Start by adding your first product'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 md:grid-cols-1">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className={cn(
                                'bg-[var(--theme-bg-secondary)] rounded-lg border border-[var(--theme-border)] overflow-hidden cursor-pointer transition-all duration-[250ms] relative shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-[var(--color-gold-light)] group',
                                !product.is_active && 'opacity-60'
                            )}
                            onClick={() => navigate(`/products/${product.id}`)}
                        >
                            <div className="h-[140px] bg-gradient-to-br from-[var(--theme-bg-tertiary)] to-[var(--theme-bg-secondary)] relative flex items-center justify-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-[var(--theme-text-muted)] [&>svg]:w-12 [&>svg]:h-12">
                                        {getProductTypeIcon(product.product_type)}
                                    </div>
                                )}
                                <span className={cn(
                                    'absolute top-2.5 left-2.5 flex items-center gap-1 py-1 px-2.5 rounded-md font-body text-[0.65rem] font-semibold uppercase tracking-[0.03em]',
                                    getTypeBadgeClasses(product.product_type)
                                )}>
                                    {getProductTypeIcon(product.product_type)}
                                    {getProductTypeLabel(product.product_type)}
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="m-0 mb-1 font-display text-[1.1rem] font-semibold text-[var(--theme-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</h3>
                                <span className="block font-mono text-[0.7rem] text-[var(--theme-text-secondary)] mb-2">{product.sku}</span>
                                {product.category && (
                                    <span
                                        className="inline-flex items-center gap-1 py-0.5 px-2 rounded-sm font-body text-[0.7rem] text-white mb-3"
                                        style={{ backgroundColor: product.category.color || '#6366f1' }}
                                    >
                                        <Tag size={12} />
                                        {product.category.name}
                                    </span>
                                )}
                                <div className="flex gap-4 mt-2">
                                    <div className="flex flex-col">
                                        <span className="font-body text-[0.6rem] text-[var(--theme-text-secondary)] uppercase tracking-[0.05em]">Retail</span>
                                        <span className="font-mono text-[0.95rem] font-semibold text-[var(--theme-text-primary)]">{formatCurrency(product.retail_price)}</span>
                                    </div>
                                    {product.wholesale_price && (
                                        <div className="flex flex-col">
                                            <span className="font-body text-[0.6rem] text-[var(--theme-text-secondary)] uppercase tracking-[0.05em]">Wholesale</span>
                                            <span className="font-mono text-[0.95rem] font-semibold text-[var(--theme-text-primary)]">{formatCurrency(product.wholesale_price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 py-3 px-4 bg-[var(--theme-bg-tertiary)] border-t border-[var(--theme-border)]">
                                <span className={cn(
                                    'py-0.5 px-2 rounded-sm font-body text-[0.7rem] font-semibold',
                                    product.is_active ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'
                                )}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className={cn(
                                    'py-0.5 px-2 rounded-sm font-body text-[0.7rem] font-medium bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)]',
                                    product.pos_visible && 'bg-info-bg text-info-text'
                                )}>
                                    {product.pos_visible ? 'POS' : 'Hidden'}
                                </span>
                            </div>
                            <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <button
                                    className="w-[34px] h-[34px] p-0 rounded-md bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 shadow-sm hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/products/${product.id}`)
                                    }}
                                    title="View details"
                                    aria-label="View details"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    className="w-[34px] h-[34px] p-0 rounded-md bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 shadow-sm hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/products/${product.id}/edit`)
                                    }}
                                    title="Edit"
                                    aria-label="Edit"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="w-[34px] h-[34px] p-0 rounded-md bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 shadow-sm hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/products/${product.id}/pricing`)
                                    }}
                                    title="Price by category"
                                    aria-label="Price by category"
                                >
                                    <DollarSign size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--theme-bg-secondary)] rounded-lg border border-[var(--theme-border)] overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Product</th>
                                <th className="text-left p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">SKU</th>
                                <th className="text-left p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Type</th>
                                <th className="text-left p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Category</th>
                                <th className="text-right p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Retail Price</th>
                                <th className="text-right p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Wholesale Price</th>
                                <th className="text-left p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Status</th>
                                <th className="text-left p-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.7rem] font-bold text-[var(--theme-text-secondary)] uppercase tracking-[0.05em] border-b-2 border-[var(--theme-border)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr
                                    key={product.id}
                                    className={cn(
                                        'cursor-pointer transition-colors duration-200 hover:bg-[var(--theme-bg-tertiary)]',
                                        !product.is_active && 'opacity-50'
                                    )}
                                    onClick={() => navigate(`/products/${product.id}`)}
                                >
                                    <td className="py-3.5 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <span className="font-display font-semibold text-[var(--theme-text-primary)]">{product.name}</span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-[var(--theme-text-secondary)] text-xs border-b border-[var(--theme-border)]">{product.sku}</td>
                                    <td className="py-3.5 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 py-1 px-2.5 rounded-md font-body text-[0.7rem] font-semibold',
                                            getTypeBadgeClasses(product.product_type)
                                        )}>
                                            {getProductTypeIcon(product.product_type)}
                                            {getProductTypeLabel(product.product_type)}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        {product.category && (
                                            <span
                                                className="inline-block py-0.5 px-2 rounded-sm font-body text-[0.7rem] text-white"
                                                style={{ backgroundColor: product.category.color || '#6366f1' }}
                                            >
                                                {product.category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right py-3.5 px-4 font-mono font-medium text-[var(--theme-text-primary)] border-b border-[var(--theme-border)]">
                                        {formatCurrency(product.retail_price)}
                                    </td>
                                    <td className="text-right py-3.5 px-4 font-mono font-medium text-[var(--theme-text-primary)] border-b border-[var(--theme-border)]">
                                        {product.wholesale_price ? formatCurrency(product.wholesale_price) : '-'}
                                    </td>
                                    <td className="py-3.5 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <span className={cn(
                                            'py-0.5 px-2 rounded-sm font-body text-[0.7rem] font-semibold',
                                            product.is_active ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'
                                        )}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <div className="flex gap-1.5">
                                            <button
                                                className="w-[34px] h-[34px] p-0 rounded-md bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 shadow-sm hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/products/${product.id}`)
                                                }}
                                                title="View"
                                                aria-label="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="w-[34px] h-[34px] p-0 rounded-md bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 shadow-sm hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/products/${product.id}/pricing`)
                                                }}
                                                title="Prices"
                                                aria-label="Prices"
                                            >
                                                <DollarSign size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <ProductImportModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        fetchData()
                    }}
                />
            )}

            {/* Recipe Import Modal */}
            {showRecipeImportModal && (
                <RecipeImportModal
                    onClose={() => setShowRecipeImportModal(false)}
                    onSuccess={() => {
                        toast.success('Recipes imported successfully')
                    }}
                />
            )}
        </div>
    )
}
