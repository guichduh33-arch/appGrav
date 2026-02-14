import { Warehouse, Image as ImageIcon, Upload, X, FileText } from 'lucide-react'

const INPUT_CLASS = "py-3 px-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none transition-all focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
const LABEL_CLASS = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"

interface StockImageOptionsSectionProps {
    stockQuantity: number
    minStockLevel: number
    imageUrl: string
    posVisible: boolean
    isActive: boolean
    deductIngredients: boolean
    onStockChange: (updates: { stock_quantity?: number; min_stock_level?: number }) => void
    onImageChange: (url: string) => void
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onOptionsChange: (updates: { pos_visible?: boolean; is_active?: boolean; deduct_ingredients?: boolean }) => void
}

export default function StockImageOptionsSection({
    stockQuantity,
    minStockLevel,
    imageUrl,
    posVisible,
    isActive,
    deductIngredients,
    onStockChange,
    onImageChange,
    onImageUpload,
    onOptionsChange,
}: StockImageOptionsSectionProps) {
    return (
        <>
            {/* Stock Section */}
            <section className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-white/5 text-white">
                    <Warehouse size={20} className="text-[var(--color-gold)]" /> Stock
                </h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 max-md:grid-cols-1">
                    <div className="flex flex-col gap-1.5">
                        <label className={LABEL_CLASS}>Current stock</label>
                        <input
                            type="number"
                            value={stockQuantity}
                            onChange={e => onStockChange({ stock_quantity: parseFloat(e.target.value) || 0 })}
                            step="0.01"
                            className={INPUT_CLASS}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={LABEL_CLASS}>Minimum stock</label>
                        <input
                            type="number"
                            value={minStockLevel}
                            onChange={e => onStockChange({ min_stock_level: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="1"
                            className={INPUT_CLASS}
                        />
                    </div>
                </div>
            </section>

            {/* Image Section */}
            <section className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-white/5 text-white">
                    <ImageIcon size={20} className="text-[var(--color-gold)]" /> Image
                </h2>
                <div className="flex justify-center">
                    {imageUrl ? (
                        <div className="relative w-[240px] h-[240px] rounded-xl overflow-hidden border border-white/10 shadow-md group">
                            <img src={imageUrl} alt="Product" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <button
                                type="button"
                                className="absolute top-3 right-3 w-9 h-9 border-none rounded-full bg-black/60 text-white cursor-pointer flex items-center justify-center transition-all hover:bg-red-500 shadow-lg"
                                onClick={() => onImageChange('')}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <label className="w-[240px] h-[240px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 text-[var(--theme-text-muted)] cursor-pointer transition-all hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5">
                            <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-1">
                                <Upload size={24} />
                            </div>
                            <span className="font-body text-sm font-medium">Click to add an image</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">PNG, JPG up to 5MB</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                hidden
                            />
                        </label>
                    )}
                </div>
            </section>

            {/* Options Section */}
            <section className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold m-0 mb-6 pb-4 border-b border-white/5 text-white">
                    <FileText size={20} className="text-[var(--color-gold)]" /> Options
                </h2>
                <div className="flex gap-10 flex-wrap max-md:flex-col max-md:gap-5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={posVisible}
                            onChange={e => onOptionsChange({ pos_visible: e.target.checked })}
                            className="w-5 h-5 accent-[var(--color-gold)] cursor-pointer"
                        />
                        <span className="text-[0.95rem] font-medium text-white">Visible on POS</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={e => onOptionsChange({ is_active: e.target.checked })}
                            className="w-5 h-5 accent-[var(--color-gold)] cursor-pointer"
                        />
                        <span className="text-[0.95rem] font-medium text-white">Product active</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={deductIngredients}
                            onChange={e => onOptionsChange({ deduct_ingredients: e.target.checked })}
                            className="w-5 h-5 accent-[var(--color-gold)] cursor-pointer mt-1"
                        />
                        <div className="flex flex-col">
                            <span className="text-[0.95rem] font-medium text-white">Deduct ingredients on sale</span>
                            <small className="block mt-1 text-[var(--theme-text-muted)] text-xs leading-relaxed">
                                For products made to order (coffee, sandwiches, etc.)
                            </small>
                        </div>
                    </label>
                </div>
            </section>
        </>
    )
}
