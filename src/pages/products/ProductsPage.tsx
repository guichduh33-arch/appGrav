import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    Package, Coffee, Croissant, Search, Plus, Filter,
    Eye, Edit, Tag, DollarSign, LayoutGrid, List
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
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
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('list')

    useEffect(() => {
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
                    .order('name'),
                supabase
                    .from('categories')
                    .select('id, name, color')
                    .order('name')
            ])

            if (productsRes.data) setProducts(productsRes.data as Product[])
            if (categoriesRes.data) setCategories(categoriesRes.data)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const all = products.length
        const finished = products.filter(p => p.product_type === 'finished').length
        const semiFinished = products.filter(p => p.product_type === 'semi_finished').length
        const rawMaterial = products.filter(p => p.product_type === 'raw_material').length
        return { all, finished, semiFinished, rawMaterial }
    }, [products])

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
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
            case 'finished': return 'Produit Fini'
            case 'semi_finished': return 'Semi-Fini'
            case 'raw_material': return 'Matière Première'
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
                        Gestion des Produits
                    </h1>
                    <p className="products-header__subtitle">
                        Gérez vos produits, prix et tarification par catégorie client
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/products/new')}
                >
                    <Plus size={18} />
                    Nouveau Produit
                </button>
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
                        <span className="stat-label">Tous les produits</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'finished' ? 'active' : ''}`}
                    onClick={() => setActiveTab('finished')}
                >
                    <Coffee size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.finished}</span>
                        <span className="stat-label">Produits Finis</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'semi_finished' ? 'active' : ''}`}
                    onClick={() => setActiveTab('semi_finished')}
                >
                    <Croissant size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.semiFinished}</span>
                        <span className="stat-label">Semi-Finis</span>
                    </div>
                </div>
                <div
                    className={`stat-card ${activeTab === 'raw_material' ? 'active' : ''}`}
                    onClick={() => setActiveTab('raw_material')}
                >
                    <Package size={24} />
                    <div className="stat-content">
                        <span className="stat-value">{stats.rawMaterial}</span>
                        <span className="stat-label">Matières Premières</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="products-filters">
                <div className="products-search">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="products-filter"
                >
                    <option value="all">Toutes catégories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Vue grille"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="Vue liste"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="products-loading">
                    <div className="spinner"></div>
                    <span>Chargement des produits...</span>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="products-empty">
                    <Package size={64} />
                    <h3>Aucun produit trouvé</h3>
                    <p>
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Essayez de modifier vos filtres'
                            : 'Commencez par ajouter votre premier produit'}
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
                                            <span className="price-label">Gros</span>
                                            <span className="price-value">{formatCurrency(product.wholesale_price)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="product-card__footer">
                                <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                    {product.is_active ? 'Actif' : 'Inactif'}
                                </span>
                                <span className={`pos-badge ${product.pos_visible ? 'visible' : ''}`}>
                                    {product.pos_visible ? 'POS' : 'Masqué'}
                                </span>
                            </div>
                            <div className="product-card__actions">
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/products/${product.id}`)
                                    }}
                                    title="Voir détails"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/products/${product.id}/edit`)
                                    }}
                                    title="Modifier"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/products/${product.id}/pricing`)
                                    }}
                                    title="Prix par catégorie"
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
                                <th>Produit</th>
                                <th>SKU</th>
                                <th>Type</th>
                                <th>Catégorie</th>
                                <th className="text-right">Prix Retail</th>
                                <th className="text-right">Prix Gros</th>
                                <th>Statut</th>
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
                                            {product.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/products/${product.id}`)
                                            }}
                                            title="Voir"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/products/${product.id}/pricing`)
                                            }}
                                            title="Prix"
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
        </div>
    )
}
