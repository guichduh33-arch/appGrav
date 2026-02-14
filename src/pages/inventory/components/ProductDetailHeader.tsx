import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '@/types/database'

interface ProductDetailHeaderProps {
    product: Product
    saving: boolean
    onSave: () => void
}

export function ProductDetailHeader({ product, saving, onSave }: ProductDetailHeaderProps) {
    const navigate = useNavigate()

    return (
        <header className="border-b border-white/5 px-10 py-6 sticky top-0 z-20 bg-[var(--theme-bg-primary)]/90 backdrop-blur-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/inventory')}
                        className="w-10 h-10 rounded border border-white/10 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 transition-colors"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight m-0">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest">
                                SKU Identity:
                            </span>
                            <span className="text-[10px] font-mono text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-0.5 border border-[var(--color-gold)]/20 rounded">
                                {product.sku}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black font-bold px-10 py-3 rounded-sm flex items-center gap-2 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                    title="Save changes"
                >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </header>
    )
}
