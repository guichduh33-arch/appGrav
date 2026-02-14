import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { exportProducts, pushLocalProductsToCloud } from '@/services/products/productImportExport'
import { exportRecipes } from '@/services/products/recipeImportExport'
import { db } from '@/lib/db'
import { Package } from 'lucide-react'
import ProductImportModal from '@/components/products/ProductImportModal'
import RecipeImportModal from '@/components/products/RecipeImportModal'
import { toast } from 'sonner'
import { logError } from '@/utils/logger'

import ProductsHeader from './products-list/ProductsHeader'
import ProductsStats from './products-list/ProductsStats'
import ProductsFilters from './products-list/ProductsFilters'
import ProductGridView from './products-list/ProductGridView'
import ProductListView from './products-list/ProductListView'

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
            if (result.success) { toast.success('Export successful') }
            else { toast.error(result.error || 'Error during export') }
        } catch { toast.error('Error during export') }
        finally { setExporting(false) }
    }

    const handleExportRecipes = async () => {
        setExportingRecipes(true)
        try {
            const result = await exportRecipes()
            if (result.success) { toast.success('Recipes export successful') }
            else { toast.error(result.error || 'Error during recipes export') }
        } catch { toast.error('Error during recipes export') }
        finally { setExportingRecipes(false) }
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
                fetchData()
            } else {
                toast.error(result.errors[0]?.error || 'Error during synchronization')
            }
        } catch {
            toast.dismiss(loadingToast)
            toast.error('Unexpected error during synchronization')
        } finally { setSyncingToCloud(false) }
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

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-8 max-w-[1600px] mx-auto md:p-4">
            <ProductsHeader
                localCount={localCount}
                productsCount={products.length}
                syncingToCloud={syncingToCloud}
                exporting={exporting}
                exportingRecipes={exportingRecipes}
                onSyncToCloud={handleSyncToCloud}
                onExport={handleExport}
                onExportRecipes={handleExportRecipes}
                onShowImportModal={() => setShowImportModal(true)}
                onShowRecipeImportModal={() => setShowRecipeImportModal(true)}
            />

            <ProductsStats stats={stats} activeTab={activeTab} onTabChange={setActiveTab} />

            <ProductsFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 md:grid-cols-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-[var(--onyx-surface)] rounded-2xl border border-white/5 overflow-hidden animate-pulse">
                            <div className="h-[160px] bg-white/[0.02]" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-3/4 bg-white/[0.04] rounded" />
                                <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                                <div className="h-3 w-1/3 bg-white/[0.04] rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 bg-[var(--onyx-surface)] rounded-2xl border border-dashed border-white/10 text-[var(--theme-text-secondary)] gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center">
                        <Package size={36} className="text-[var(--color-gold)] opacity-60" />
                    </div>
                    <h3 className="m-0 font-display text-lg text-white">No product found</h3>
                    <p className="m-0 font-body text-sm text-center max-w-[300px]">
                        {searchTerm || categoryFilter !== 'all'
                            ? 'Try modifying your search or filters'
                            : 'Start by adding your first product'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <ProductGridView products={filteredProducts} />
            ) : (
                <ProductListView products={filteredProducts} />
            )}

            {showImportModal && (
                <ProductImportModal
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => { fetchData() }}
                />
            )}
            {showRecipeImportModal && (
                <RecipeImportModal
                    onClose={() => setShowRecipeImportModal(false)}
                    onSuccess={() => { toast.success('Recipes imported successfully') }}
                />
            )}
        </div>
    )
}
