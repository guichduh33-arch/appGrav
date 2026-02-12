import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { exportProducts, pushLocalProductsToCloud } from '@/services/products/productImportExport'
import { exportRecipes } from '@/services/products/recipeImportExport'
import { db } from '@/lib/db'
import {
    Cloud, Package, Coffee, Croissant, Search, Plus,
    Eye, Edit, Tag, DollarSign, LayoutGrid, List,
    Upload, Download, ChefHat
} from 'lucide-react'
import ProductImportModal from '@/components/products/ProductImportModal'
import RecipeImportModal from '@/components/products/RecipeImportModal'
import { toast } from 'sonner'
import './ProductsPage.css'

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
            console.error('Error fetching products:', error)
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

    return (
        <div className="products-page">
            {/* Header */}
            <header className="products-header">
                <div className="products-header__info">
                    <h1 className="products-header__title">
                        <Package size={28} />
                        Product Management
                    </h1>
                    <p className="products-header__subtitle">
                        Manage your products, prices and customer category pricing
                    </p>
                </div>
                <div className="products-header__actions">
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
                        className="btn btn-primary"
                        onClick={() => navigate('/products/new')}
                    >
                        <Plus size={18} />
                        New Product
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="products-stats">
                <div
                    className={`stat-card ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    <Package size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.all}</span>
                        <span className="stat-label">All Products</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'finished' ? 'active' : ''}`}
                    onClick={() => setActiveTab('finished')}
                >
                    <Coffee size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.finished}</span>
                        <span className="stat-label">Finished Products</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'semi_finished' ? 'active' : ''}`}
                    onClick={() => setActiveTab('semi_finished')}
                >
                    <Croissant size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.semiFinished}</span>
                        <span className="stat-label">Semi-Finished</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'raw_material' ? 'active' : ''}`}
                    onClick={() => setActiveTab('raw_material')}
                >
                    <Package size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.rawMaterial}</span>
                        <span className="stat-label">Raw Materials</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="products-filters">
                <div className="products-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="products-filter"
                    aria-label="Filter by category"
                >
                    <option value="all">All categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                        aria-label="Grid view"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
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
                <div className="products-loading">
                    <div className="spinner"></div>
                    <span>Loading products...</span>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="products-empty">
                    <Package size={64} />
                    <h3>No product found</h3>
                    <p>
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Try modifying your filters'
                            : 'Start by adding your first product'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            className={`product-card ${!product.is_active ? 'inactive' : ''}`}
                            onClick={() => navigate(`/products/${product.id}`)}
                        >
                            <div className="product-card__image">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} />
                                ) : (
                                    <div className="product-card__placeholder">
                                        {getProductTypeIcon(product.product_type)}
                                    </div>
                                )}
                                <span className={`product-type-badge ${product.product_type}`}>
                                    {getProductTypeIcon(product.product_type)}
                                    {getProductTypeLabel(product.product_type)}
                                </span>
                            </div>
                            <div className="product-card__content">
                                <h3 className="product-card__name">{product.name}</h3>
                                <span className="product-card__sku">{product.sku}</span>
                                {product.category && (
                                    <span
                                        className="product-card__category"
                                        style={{ backgroundColor: product.category.color || '#6366f1' }}
                                    >
                                        <Tag size={12} />
                                        {product.category.name}
                                    </span>
                                )}
                                <div className="product-card__prices">
                                    <div className="price">
                                        <span className="price-label">Retail</span>
                                        <span className="price-value">{formatCurrency(product.retail_price)}</span>
                                    </div>
                                    {product.wholesale_price && (
                                        <div className="price">
                                            <span className="price-label">Wholesale</span>
                                            <span className="price-value">{formatCurrency(product.wholesale_price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="product-card__footer">
                                <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`pos-badge ${product.pos_visible ? 'visible' : ''}`}>
                                    {product.pos_visible ? 'POS' : 'Hidden'}
                                </span>
                            </div>
                            <div className="product-card__actions">
                                <button
                                    className="btn-icon"
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
                                    className="btn-icon"
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
                                    className="btn-icon"
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
                <div className="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th className="text-right">Retail Price</th>
                                <th className="text-right">Wholesale Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr
                                    key={product.id}
                                    className={!product.is_active ? 'inactive' : ''}
                                    onClick={() => navigate(`/products/${product.id}`)}
                                >
                                    <td className="product-name-cell">
                                        <span className="product-name">{product.name}</span>
                                    </td>
                                    <td className="sku-cell">{product.sku}</td>
                                    <td>
                                        <span className={`type-badge ${product.product_type}`}>
                                            {getProductTypeIcon(product.product_type)}
                                            {getProductTypeLabel(product.product_type)}
                                        </span>
                                    </td>
                                    <td>
                                        {product.category && (
                                            <span
                                                className="category-badge"
                                                style={{ backgroundColor: product.category.color || '#6366f1' }}
                                            >
                                                {product.category.name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right price-cell">
                                        {formatCurrency(product.retail_price)}
                                    </td>
                                    <td className="text-right price-cell">
                                        {product.wholesale_price ? formatCurrency(product.wholesale_price) : '-'}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
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
                                            className="btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/products/${product.id}/pricing`)
                                            }}
                                            title="Prices"
                                            aria-label="Prices"
                                        >
                                            <DollarSign size={16} />
                                        </button>
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
