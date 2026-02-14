import { Cloud, Package, Download, Upload, ChefHat, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProductsHeaderProps {
    localCount: number
    productsCount: number
    syncingToCloud: boolean
    exporting: boolean
    exportingRecipes: boolean
    onSyncToCloud: () => void
    onExport: () => void
    onExportRecipes: () => void
    onShowImportModal: () => void
    onShowRecipeImportModal: () => void
}

export default function ProductsHeader({
    localCount,
    productsCount,
    syncingToCloud,
    exporting,
    exportingRecipes,
    onSyncToCloud,
    onExport,
    onExportRecipes,
    onShowImportModal,
    onShowRecipeImportModal,
}: ProductsHeaderProps) {
    const navigate = useNavigate()

    return (
        <header className="relative flex justify-between items-start mb-8 gap-4 flex-wrap md:flex-col bg-[var(--onyx-surface)] rounded-2xl p-6 border border-white/5 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-60" />
            <div className="flex-1">
                <h1 className="flex items-center gap-3 font-display text-3xl font-semibold text-white m-0 mb-1 md:text-2xl [&>svg]:text-[var(--color-gold)]">
                    <Package size={28} />
                    Product Catalog
                </h1>
                <p className="font-display italic text-[var(--theme-text-secondary)] text-sm m-0">
                    Manage your products, prices and customer category pricing
                </p>
            </div>
            <div className="flex gap-2.5 flex-wrap items-center">
                {localCount > 0 && productsCount === 0 && (
                    <button
                        type="button"
                        className="btn btn-warning"
                        onClick={onSyncToCloud}
                        disabled={syncingToCloud}
                        title="Push local products to Supabase"
                    >
                        <Cloud size={16} className={syncingToCloud ? 'animate-spin' : ''} />
                        {syncingToCloud ? 'Syncing...' : 'Push to Cloud'}
                    </button>
                )}
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-white/10 bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold)]/40 hover:text-white"
                    onClick={onExport}
                    disabled={exporting}
                    title="Export products"
                >
                    <Download size={14} />
                    {exporting ? 'Export...' : 'Products'}
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-white/10 bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold)]/40 hover:text-white"
                    onClick={onShowImportModal}
                    title="Import products"
                >
                    <Upload size={14} />
                    Import
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-white/10 bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold)]/40 hover:text-white"
                    onClick={onExportRecipes}
                    disabled={exportingRecipes}
                    title="Export recipes"
                >
                    <ChefHat size={14} />
                    {exportingRecipes ? 'Export...' : 'Recipes'}
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl font-body text-xs font-medium cursor-pointer border border-white/10 bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] transition-all duration-200 hover:border-[var(--color-gold)]/40 hover:text-white"
                    onClick={onShowRecipeImportModal}
                    title="Import recipes"
                >
                    <ChefHat size={14} />
                    <Upload size={12} style={{ marginLeft: -2 }} />
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-body text-sm font-bold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-[var(--color-gold)] text-black shadow-[0_2px_8px_rgba(201,165,92,0.3)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(201,165,92,0.4)]"
                    onClick={() => navigate('/products/new')}
                >
                    <Plus size={16} />
                    New Product
                </button>
            </div>
        </header>
    )
}
