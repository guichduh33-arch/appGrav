import { Plus, X, Search, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/helpers'
import { Product } from '@/types/database'

interface GroupItem {
    id?: string
    product_id: string
    product?: Product
    price_adjustment: number
    is_default: boolean
    sort_order: number
}

interface ComboGroup {
    id?: string
    group_name: string
    group_type: 'single' | 'multiple'
    is_required: boolean
    min_selections: number
    max_selections: number
    sort_order: number
    items: GroupItem[]
    expanded?: boolean
}

interface ComboFormGroupEditorProps {
    groups: ComboGroup[]
    showProductSearch: number | null
    searchTerm: string
    filteredProducts: Product[]
    onAddGroup: () => void
    onRemoveGroup: (index: number) => void
    onUpdateGroup: (index: number, updates: Partial<ComboGroup>) => void
    onToggleExpanded: (index: number) => void
    onAddProduct: (groupIndex: number, product: Product) => void
    onRemoveProduct: (groupIndex: number, itemIndex: number) => void
    onUpdateGroupItem: (groupIndex: number, itemIndex: number, updates: Partial<GroupItem>) => void
    onSetDefault: (groupIndex: number, itemIndex: number) => void
    onShowProductSearch: (groupIndex: number | null) => void
    onSearchTermChange: (term: string) => void
}

const INPUT_CLASS = "w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
const LABEL_CLASS = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] block"

export default function ComboFormGroupEditor({
    groups, showProductSearch, searchTerm, filteredProducts,
    onAddGroup, onRemoveGroup, onUpdateGroup, onToggleExpanded,
    onAddProduct, onRemoveProduct, onUpdateGroupItem, onSetDefault,
    onShowProductSearch, onSearchTermChange
}: ComboFormGroupEditorProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-display font-semibold text-xl text-white m-0">Choice Groups</h2>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 py-2 px-5 rounded-xl font-body text-xs font-bold uppercase tracking-widest transition-all border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-black"
                    onClick={onAddGroup}
                >
                    <Plus size={16} />
                    Add Group
                </button>
            </div>

            <div className="space-y-6">
                {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-white/[0.02] rounded-xl border-2 border-dashed border-white/10 text-[var(--theme-text-muted)] text-center">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 opacity-30">
                            <Plus size={32} />
                        </div>
                        <h4 className="text-lg font-display font-semibold mb-2">No Groups Yet</h4>
                        <p className="text-sm max-w-xs opacity-60">Add groups like "Choice of Pastry" or "Select Beverage" to build your combo.</p>
                    </div>
                ) : (
                    groups.map((group, groupIndex) => (
                        <div key={groupIndex} className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10 shadow-sm">
                            {/* Group Header */}
                            <div className="flex items-center gap-4 px-6 py-4 bg-black/20 border-b border-white/5">
                                <button
                                    type="button"
                                    className="text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] transition-colors p-1"
                                    onClick={() => onToggleExpanded(groupIndex)}
                                >
                                    {group.expanded ? <ChevronUp size={22} strokeWidth={2.5} /> : <ChevronDown size={22} strokeWidth={2.5} />}
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none text-white font-display font-bold text-lg outline-none placeholder:text-[var(--theme-text-muted)]"
                                    value={group.group_name}
                                    onChange={(e) => onUpdateGroup(groupIndex, { group_name: e.target.value })}
                                    placeholder="Group Name (e.g., Choice of Bread)"
                                />
                                <button
                                    type="button"
                                    className="text-[var(--theme-text-muted)] hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                    onClick={() => onRemoveGroup(groupIndex)}
                                    title="Remove group"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {group.expanded && (
                                <div className="p-8 space-y-8">
                                    {/* Group Settings */}
                                    <div className="bg-black/20 rounded-xl p-6 border border-white/5 grid grid-cols-2 gap-8 max-md:grid-cols-1">
                                        <div className="space-y-4">
                                            <label htmlFor={`group-type-${groupIndex}`} className={LABEL_CLASS}>Type</label>
                                            <select
                                                id={`group-type-${groupIndex}`}
                                                value={group.group_type}
                                                className={INPUT_CLASS}
                                                onChange={(e) => {
                                                    const type = e.target.value as 'single' | 'multiple'
                                                    onUpdateGroup(groupIndex, {
                                                        group_type: type,
                                                        max_selections: type === 'single' ? 1 : group.max_selections
                                                    })
                                                }}
                                            >
                                                <option value="single">Single Choice</option>
                                                <option value="multiple">Multiple Selections</option>
                                            </select>
                                            <label className="flex items-center gap-3 cursor-pointer mt-4">
                                                <div className={cn(
                                                    "w-5 h-5 rounded border transition-all flex items-center justify-center",
                                                    group.is_required ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-black" : "bg-transparent border-white/20"
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={group.is_required}
                                                        onChange={(e) => onUpdateGroup(groupIndex, { is_required: e.target.checked })}
                                                    />
                                                    {group.is_required && <Plus size={12} strokeWidth={4} />}
                                                </div>
                                                <span className="text-sm font-medium text-[var(--theme-text-secondary)]">Required</span>
                                            </label>
                                        </div>

                                        {group.group_type === 'multiple' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label htmlFor={`min-sel-${groupIndex}`} className={LABEL_CLASS}>Min Selections</label>
                                                    <input
                                                        id={`min-sel-${groupIndex}`}
                                                        type="number"
                                                        value={group.min_selections}
                                                        onChange={(e) => onUpdateGroup(groupIndex, { min_selections: Number(e.target.value) })}
                                                        min="0"
                                                        className={INPUT_CLASS}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor={`max-sel-${groupIndex}`} className={LABEL_CLASS}>Max Selections</label>
                                                    <input
                                                        id={`max-sel-${groupIndex}`}
                                                        type="number"
                                                        value={group.max_selections}
                                                        onChange={(e) => onUpdateGroup(groupIndex, { max_selections: Number(e.target.value) })}
                                                        min="1"
                                                        className={INPUT_CLASS}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Products in Group */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-display font-bold text-sm tracking-wide text-white m-0">Products</h4>
                                            <button
                                                type="button"
                                                className="text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                                                onClick={() => onShowProductSearch(groupIndex)}
                                            >
                                                <Search size={14} /> Add Product
                                            </button>
                                        </div>

                                        {/* Product Search Dropdown */}
                                        {showProductSearch === groupIndex && (
                                            <div className="bg-black/40 border border-[var(--color-gold)]/30 rounded-xl overflow-hidden shadow-2xl">
                                                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                                                    <Search size={18} className="text-[var(--color-gold)] opacity-50" />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => onSearchTermChange(e.target.value)}
                                                        placeholder="Search products..."
                                                        autoFocus
                                                        className="flex-1 bg-transparent border-none text-white outline-none placeholder:text-[var(--theme-text-muted)]"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="p-1 hover:bg-white/5 rounded-md transition-colors"
                                                        onClick={() => onShowProductSearch(null)}
                                                    >
                                                        <X size={18} className="text-[var(--theme-text-muted)]" />
                                                    </button>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto p-2">
                                                    {filteredProducts.map(product => (
                                                        <div
                                                            key={product.id}
                                                            className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--color-gold)]/10 cursor-pointer group transition-colors"
                                                            onClick={() => onAddProduct(groupIndex, product)}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-sm text-white group-hover:text-[var(--color-gold)]">{product.name}</span>
                                                                <span className="text-[0.65rem] opacity-40 uppercase tracking-tighter text-[var(--theme-text-muted)]">SKU: {product.sku || 'N/A'}</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-[var(--theme-text-secondary)]">{formatCurrency(product.retail_price || 0)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Items */}
                                        <div className="space-y-4">
                                            {group.items.length === 0 ? (
                                                <div className="py-10 text-center opacity-30 italic text-sm text-[var(--theme-text-muted)]">No products in this group.</div>
                                            ) : (
                                                group.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="bg-black/20 p-5 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-6 hover:border-white/10 transition-all">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--color-gold)]">
                                                                <Package size={20} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-semibold text-white">{item.product?.name}</span>
                                                                    {item.is_default && (
                                                                        <span className="px-2 py-0.5 rounded bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 text-[var(--color-gold)] text-[0.6rem] font-black uppercase tracking-widest">Default</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[0.7rem] text-[var(--theme-text-muted)] opacity-60">Base: {formatCurrency(item.product?.retail_price || 0)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="text-[0.6rem] uppercase tracking-widest font-black text-[var(--theme-text-muted)]">Surcharge</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.price_adjustment}
                                                                    onChange={(e) => onUpdateGroupItem(groupIndex, itemIndex, { price_adjustment: Number(e.target.value) })}
                                                                    step="500"
                                                                    className="w-24 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-white focus:border-[var(--color-gold)] outline-none"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest transition-all",
                                                                        item.is_default
                                                                            ? "bg-[var(--color-gold)] text-black shadow-[0_2px_8px_rgba(201,165,92,0.3)]"
                                                                            : "bg-white/5 text-[var(--theme-text-muted)] hover:text-[var(--color-gold)] border border-white/10"
                                                                    )}
                                                                    onClick={() => onSetDefault(groupIndex, itemIndex)}
                                                                    disabled={item.is_default}
                                                                >
                                                                    {item.is_default ? 'Default' : 'Set Default'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="p-2 text-[var(--theme-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                    onClick={() => onRemoveProduct(groupIndex, itemIndex)}
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
