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
            <header className="relative flex justify-between items-start mb-8 gap-4 flex-wrap md:flex-col bg-[var(--theme-bg-secondary)] rounded-2xl p-6 border border-[var(--theme-border)] shadow-sm">
                <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-60" />
                <div className="flex-1">
                    <h1 className="flex items-center gap-3 font-display text-3xl font-semibold text-[var(--theme-text-primary)] m-0 mb-1 md:text-2xl [&>svg]:text-[var(--color-gold)]">
                        <Package size={28} />
                        Product Catalog
                    </h1>
                    <p className="font-display italic text-[var(--theme-text-secondary)] text-sm m-0">
                        Manage your products, prices and customer category pricing
                    </p>
                </div>
                <div className="flex gap-2.5 flex-wrap items-center">
                    {localCount > 0 && products.length === 0 && (
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={handleSyncToCloud}
                            disabled={syncingToCloud}
                            title="Push local products to Supabase"
                        >
                            <Cloud size={16} className={syncingToCloud ? 'animate-spin' : ''} />
                            {syncingToCloud ? 'Syncing...' : 'Push to Cloud'}
                        </button>
                    )}
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold-light)] hover:text-[var(--theme-text-primary)]"
                        onClick={handleExport}
                        disabled={exporting}
                        title="Export products"
                    >
                        <Download size={14} />
                        {exporting ? 'Export...' : 'Products'}
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold-light)] hover:text-[var(--theme-text-primary)]"
                        onClick={() => setShowImportModal(true)}
                        title="Import products"
                    >
                        <Upload size={14} />
                        Import
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold-light)] hover:text-[var(--theme-text-primary)]"
                        onClick={handleExportRecipes}
                        disabled={exportingRecipes}
                        title="Export recipes"
                    >
                        <ChefHat size={14} />
                        {exportingRecipes ? 'Export...' : 'Recipes'}
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-[var(--theme-border)] bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold-light)] hover:text-[var(--theme-text-primary)]"
                        onClick={() => setShowRecipeImportModal(true)}
                        title="Import recipes"
                    >
                        <ChefHat size={14} />
                        <Upload size={12} style={{ marginLeft: -2 }} />
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-body text-sm font-semibold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-gradient-to-b from-gold to-gold-dark text-white shadow-[0_2px_8px_rgba(201,165,92,0.3)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(201,165,92,0.4)]"
                        onClick={() => navigate('/products/new')}
                    >
                        <Plus size={16} />
                        New Product
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8 lg:grid-cols-2 md:grid-cols-2">
                {([
                    { tab: 'all' as TabType, icon: <Package size={22} />, value: stats.all, label: 'All Products' },
                    { tab: 'finished' as TabType, icon: <Coffee size={22} />, value: stats.finished, label: 'Finished' },
                    { tab: 'semi_finished' as TabType, icon: <Croissant size={22} />, value: stats.semiFinished, label: 'Semi-Finished' },
                    { tab: 'raw_material' as TabType, icon: <Package size={22} />, value: stats.rawMaterial, label: 'Raw Materials' },
                ]).map(stat => (
                    <div
                        key={stat.tab}
                        className={cn(
                            'relative overflow-hidden flex items-center gap-4 p-5 bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] cursor-pointer transition-all duration-300 shadow-sm group',
                            'hover:border-[var(--color-gold-light)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(201,165,92,0.1)]',
                            'md:p-4 [&>svg]:text-[var(--color-gold)] [&>svg]:shrink-0',
                            activeTab === stat.tab && 'border-[var(--color-gold)] bg-gradient-to-br from-[rgba(201,165,92,0.08)] to-[var(--theme-bg-secondary)] shadow-[0_0_0_1px_rgba(201,165,92,0.3)]'
                        )}
                        onClick={() => setActiveTab(stat.tab)}
                    >
                        {activeTab === stat.tab && (
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
                        )}
                        {stat.icon}
                        <div className="flex flex-col">
                            <span className="font-display text-3xl font-bold text-[var(--theme-text-primary)] md:text-2xl">{stat.value}</span>
                            <span className="font-body text-[0.65rem] text-[var(--theme-text-secondary)] uppercase tracking-[0.08em]">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 items-center flex-wrap md:flex-col">
                <div className="flex-1 min-w-[280px] flex items-center gap-3 px-4 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-200 focus-within:border-[var(--color-gold)] focus-within:shadow-[0_0_0_3px_rgba(201,165,92,0.12)] [&>svg]:text-[var(--theme-text-muted)] [&>svg]:shrink-0 md:w-full md:min-w-0">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 border-none py-3 font-body text-sm bg-transparent text-[var(--theme-text-primary)] outline-none placeholder:text-[var(--theme-text-muted)] placeholder:opacity-60"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="py-3 px-4 border border-[var(--theme-border)] rounded-xl bg-[var(--theme-bg-secondary)] font-body text-sm text-[var(--theme-text-primary)] min-w-[180px] cursor-pointer transition-all duration-200 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%239CA3AF%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center] pr-10 focus:outline-none focus:border-[var(--color-gold)] focus:shadow-[0_0_0_3px_rgba(201,165,92,0.12)] md:w-full md:min-w-0"
                    aria-label="Filter by category"
                >
                    <option value="all">All categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="flex bg-[var(--theme-bg-secondary)] rounded-xl p-1 border border-[var(--theme-border)]">
                    <button
                        className={cn(
                            'py-2 px-2.5 border-none bg-transparent rounded-lg cursor-pointer text-[var(--theme-text-secondary)] transition-all duration-200 flex items-center justify-center hover:text-[var(--theme-text-primary)]',
                            viewMode === 'grid' && 'bg-[var(--theme-bg-tertiary)] text-[var(--color-gold)] shadow-sm'
                        )}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                        aria-label="Grid view"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        className={cn(
                            'py-2 px-2.5 border-none bg-transparent rounded-lg cursor-pointer text-[var(--theme-text-secondary)] transition-all duration-200 flex items-center justify-center hover:text-[var(--theme-text-primary)]',
                            viewMode === 'list' && 'bg-[var(--theme-bg-tertiary)] text-[var(--color-gold)] shadow-sm'
                        )}
                        onClick={() => setViewMode('list')}
                        title="List view"
                        aria-label="List view"
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 md:grid-cols-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] overflow-hidden animate-pulse">
                            <div className="h-[160px] bg-[var(--theme-bg-tertiary)]" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-3/4 bg-[var(--theme-bg-tertiary)] rounded" />
                                <div className="h-3 w-1/2 bg-[var(--theme-bg-tertiary)] rounded" />
                                <div className="h-3 w-1/3 bg-[var(--theme-bg-tertiary)] rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 bg-[var(--theme-bg-secondary)] rounded-2xl border border-dashed border-[var(--theme-border)] text-[var(--theme-text-secondary)] gap-4">
                    <div className="w-20 h-20 rounded-full bg-[var(--theme-bg-tertiary)] flex items-center justify-center">
                        <Package size={36} className="text-[var(--color-gold)] opacity-60" />
                    </div>
                    <h3 className="m-0 font-display text-lg text-[var(--theme-text-primary)]">No product found</h3>
                    <p className="m-0 font-body text-sm text-center max-w-[300px]">
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Try modifying your search or filters'
                            : 'Start by adding your first product'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 md:grid-cols-1">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className={cn(
                                'bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] overflow-hidden cursor-pointer transition-all duration-300 relative shadow-sm group',
                                'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[var(--color-gold-light)]',
                                !product.is_active && 'opacity-50'
                            )}
                            onClick={() => navigate(`/products/${product.id}`)}
                        >
                            <div className="h-[160px] bg-gradient-to-br from-[var(--theme-bg-tertiary)] to-[rgba(201,165,92,0.03)] relative flex items-center justify-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-[var(--theme-text-muted)] opacity-40 [&>svg]:w-10 [&>svg]:h-10">
                                        {getProductTypeIcon(product.product_type)}
                                    </div>
                                )}
                                <span className={cn(
                                    'absolute top-3 left-3 flex items-center gap-1 py-1 px-2.5 rounded-full font-body text-[0.6rem] font-semibold uppercase tracking-[0.04em] backdrop-blur-sm',
                                    getTypeBadgeClasses(product.product_type)
                                )}>
                                    {getProductTypeIcon(product.product_type)}
                                    {getProductTypeLabel(product.product_type)}
                                </span>
                                {/* Hover action buttons */}
                                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <button
                                        className="w-8 h-8 p-0 rounded-lg bg-black/50 backdrop-blur-sm border-none text-white/80 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:text-white"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/products/${product.id}`)
                                        }}
                                        title="View details"
                                        aria-label="View details"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 p-0 rounded-lg bg-black/50 backdrop-blur-sm border-none text-white/80 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:text-white"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/products/${product.id}/edit`)
                                        }}
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 p-0 rounded-lg bg-black/50 backdrop-blur-sm border-none text-white/80 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:text-white"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/products/${product.id}/pricing`)
                                        }}
                                        title="Price by category"
                                        aria-label="Price by category"
                                    >
                                        <DollarSign size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="m-0 mb-1 font-display text-base font-semibold text-[var(--theme-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</h3>
                                <span className="block font-mono text-[0.65rem] text-[var(--theme-text-muted)] mb-2">{product.sku}</span>
                                {product.category && (
                                    <span
                                        className="inline-flex items-center gap-1 py-0.5 px-2 rounded-full font-body text-[0.65rem] text-white mb-2"
                                        style={{ backgroundColor: product.category.color || '#6366f1' }}
                                    >
                                        <Tag size={10} />
                                        {product.category.name}
                                    </span>
                                )}
                                <div className="flex gap-4 mt-2 pt-2 border-t border-[var(--theme-border)]">
                                    <div className="flex flex-col">
                                        <span className="font-body text-[0.55rem] text-[var(--theme-text-muted)] uppercase tracking-[0.08em]">Retail</span>
                                        <span className="font-mono text-sm font-semibold text-[var(--color-gold)]">{formatCurrency(product.retail_price)}</span>
                                    </div>
                                    {product.wholesale_price && (
                                        <div className="flex flex-col">
                                            <span className="font-body text-[0.55rem] text-[var(--theme-text-muted)] uppercase tracking-[0.08em]">Wholesale</span>
                                            <span className="font-mono text-sm font-semibold text-[var(--theme-text-primary)]">{formatCurrency(product.wholesale_price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1.5 py-2.5 px-4 bg-[var(--theme-bg-tertiary)]/50 border-t border-[var(--theme-border)]">
                                <span className={cn(
                                    'py-0.5 px-2.5 rounded-full font-body text-[0.6rem] font-semibold',
                                    product.is_active ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'
                                )}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className={cn(
                                    'py-0.5 px-2.5 rounded-full font-body text-[0.6rem] font-medium bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)]',
                                    product.pos_visible && 'bg-info-bg text-info-text'
                                )}>
                                    {product.pos_visible ? 'POS' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Product</th>
                                <th className="text-left py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">SKU</th>
                                <th className="text-left py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Type</th>
                                <th className="text-left py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Category</th>
                                <th className="text-right py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Retail</th>
                                <th className="text-right py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Wholesale</th>
                                <th className="text-left py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Status</th>
                                <th className="text-left py-3.5 px-4 bg-[var(--theme-bg-tertiary)] font-body text-[0.65rem] font-bold text-[var(--theme-text-muted)] uppercase tracking-[0.08em] border-b border-[var(--theme-border)] sticky top-0 backdrop-blur-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr
                                    key={product.id}
                                    className={cn(
                                        'cursor-pointer transition-all duration-200 hover:bg-[rgba(201,165,92,0.04)] border-l-2 border-l-transparent hover:border-l-[var(--color-gold)]',
                                        !product.is_active && 'opacity-40'
                                    )}
                                    onClick={() => navigate(`/products/${product.id}`)}
                                >
                                    <td className="py-3 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <span className="font-display font-semibold text-[var(--theme-text-primary)]">{product.name}</span>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-[var(--theme-text-muted)] text-xs border-b border-[var(--theme-border)]">{product.sku}</td>
                                    <td className="py-3 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <span className={cn(
                                            'inline-flex items-center gap-1 py-0.5 px-2 rounded-full font-body text-[0.6rem] font-semibold',
                                            getTypeBadgeClasses(product.product_type)
                                        )}>
                                            {getProductTypeIcon(product.product_type)}
                                            {getProductTypeLabel(product.product_type)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        {product.category && (
                                            <span
                                                className="inline-block py-0.5 px-2 rounded-full font-body text-[0.6rem] text-white"
                                                style={{ backgroundColor: product.category.color || '#6366f1' }}
                                            >
                                                {product.category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right py-3 px-4 font-mono text-sm font-medium text-[var(--color-gold)] border-b border-[var(--theme-border)]">
                                        {formatCurrency(product.retail_price)}
                                    </td>
                                    <td className="text-right py-3 px-4 font-mono text-sm font-medium text-[var(--theme-text-primary)] border-b border-[var(--theme-border)]">
                                        {product.wholesale_price ? formatCurrency(product.wholesale_price) : '—'}
                                    </td>
                                    <td className="py-3 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <span className={cn(
                                            'py-0.5 px-2.5 rounded-full font-body text-[0.6rem] font-semibold',
                                            product.is_active ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-danger-text'
                                        )}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-body border-b border-[var(--theme-border)] text-sm">
                                        <div className="flex gap-1">
                                            <button
                                                className="w-8 h-8 p-0 rounded-lg bg-transparent border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/products/${product.id}`)
                                                }}
                                                title="View"
                                                aria-label="View"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                className="w-8 h-8 p-0 rounded-lg bg-transparent border border-[var(--theme-border)] text-[var(--theme-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-gold)] hover:border-[var(--color-gold)] hover:text-white"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/products/${product.id}/pricing`)
                                                }}
                                                title="Prices"
                                                aria-label="Prices"
                                            >
                                                <DollarSign size={14} />
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
