import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Plus, Search, Edit, Trash2, Eye, Package, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import {
    ProductCombo,
    ProductComboGroup,
    ProductComboGroupItem,
    Product
} from '../../types/database'
import { logError } from '@/utils/logger'
import { cn } from '@/lib/utils'

interface GroupItemWithProduct extends ProductComboGroupItem {
    product: Product
}

interface ComboGroupWithItems extends ProductComboGroup {
    items: GroupItemWithProduct[]
}

interface ComboWithGroups extends ProductCombo {
    groups: ComboGroupWithItems[]
    combo_price: number
    available_at_pos: boolean
}

export default function CombosPage() {
    const navigate = useNavigate()
    const [combos, setCombos] = useState<ComboWithGroups[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchCombos()
    }, [])

    const fetchCombos = async () => {
        try {
            const { data: combosData, error: combosError } = await supabase
                .from('product_combos')
                .select('*')
                .order('sort_order', { ascending: true })

            if (combosError) throw combosError

            if (combosData) {
                // Fetch groups and items for each combo
                const combosWithGroups = await Promise.all(
                    combosData.map(async (combo) => {
                        // Fetch groups for this combo
                        const { data: groupsData } = await supabase
                            .from('product_combo_groups')
                            .select('*')
                            .eq('combo_id', combo.id)
                            .order('sort_order', { ascending: true })

                        const groups = groupsData || []

                        // For each group, fetch its items
                        const groupsWithItems = await Promise.all(
                            groups.map(async (group) => {
                                const { data: itemsData } = await supabase
                                    .from('product_combo_group_items')
                                    .select(`
                                        *,
                                        product:products(*)
                                    `)
                                    .eq('group_id', group.id)
                                    .order('sort_order', { ascending: true })

                                return {
                                    ...group,
                                    items: itemsData || []
                                }
                            })
                        )

                        // Map combo fields to match interface
                        type RawGroup = ProductComboGroup & { items?: Array<ProductComboGroupItem & { product?: Product }> };
                        const rawGroups = groupsWithItems as RawGroup[];
                        const mappedGroups = rawGroups.map((g) => ({
                            ...g,
                            items: (g.items || []).map((item) => ({
                                ...item,
                                price_adjustment: item.price_adjustment ?? 0,
                                is_default: item.is_default ?? false,
                                product: item.product
                            }))
                        }))
                        return {
                            ...combo,
                            combo_price: combo.combo_price ?? 0,
                            available_at_pos: combo.available_at_pos ?? true,
                            groups: mappedGroups
                        }
                    })
                )
                setCombos(combosWithGroups)
            }
        } catch (error) {
            logError('Error fetching combos:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCombos = combos.filter(combo =>
        combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        combo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this combo?')) return

        try {
            const { error } = await supabase
                .from('product_combos')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchCombos()
        } catch (error) {
            logError('Error deleting combo:', error)
        }
    }

    const handleToggleActive = async (combo: ComboWithGroups) => {
        try {
            const { error } = await supabase
                .from('product_combos')
                .update({ is_active: !combo.is_active })
                .eq('id', combo.id)

            if (error) throw error

            await fetchCombos()
        } catch (error) {
            logError('Error updating combo:', error)
        }
    }

    const getMinPrice = (combo: ComboWithGroups) => {
        // Base price + sum of minimum price adjustments (default or cheapest options)
        let minAdjustment = 0
        combo.groups.forEach(group => {
            if (group.items.length > 0) {
                // Find default item or cheapest item
                const defaultItem = group.items.find(item => item.is_default)
                const cheapestItem = group.items.reduce((min, item) =>
                    (item.price_adjustment ?? 0) < (min.price_adjustment ?? 0) ? item : min
                )
                const selectedItem = defaultItem || cheapestItem
                minAdjustment += selectedItem.price_adjustment ?? 0
            }
        })
        return combo.combo_price + minAdjustment
    }

    const getMaxPrice = (combo: ComboWithGroups) => {
        // Base price + sum of maximum price adjustments (most expensive options)
        let maxAdjustment = 0
        combo.groups.forEach(group => {
            if (group.items.length > 0) {
                const maxItem = group.items.reduce((max, item) =>
                    (item.price_adjustment ?? 0) > (max.price_adjustment ?? 0) ? item : max
                )
                maxAdjustment += maxItem.price_adjustment ?? 0
            }
        })
        return combo.combo_price + maxAdjustment
    }

    const getRegularPrice = (combo: ComboWithGroups) => {
        // Calculate regular retail price (using default items)
        let totalRetailPrice = 0
        combo.groups.forEach(group => {
            const defaultItem = group.items.find(item => item.is_default)
            if (defaultItem && defaultItem.product) {
                totalRetailPrice += defaultItem.product.retail_price || 0
            }
        })
        return totalRetailPrice
    }

    const getSavings = (combo: ComboWithGroups) => {
        const regularPrice = getRegularPrice(combo)
        const minComboPrice = getMinPrice(combo)
        return regularPrice - minComboPrice
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto md:p-4 font-body">
            {/* Header */}
            <header className="flex justify-between items-start mb-8 gap-4 flex-wrap md:flex-col">
                <div className="flex-1">
                    <h1 className="flex items-center gap-3 font-display text-[2.5rem] font-semibold text-[var(--theme-text-primary)] m-0 mb-2 md:text-3xl [&&gt;svg]:text-[var(--color-gold)]">
                        <Box size={32} />
                        Combo Management
                    </h1>
                    <p className="text-[var(--theme-text-secondary)] text-lg opacity-80 max-w-2xl">
                        Create artisan bundles and curated sets at premium value
                    </p>
                </div>
                <button
                    className="inline-flex items-center gap-2 py-3 px-8 rounded-lg font-body text-sm font-semibold cursor-pointer border-2 border-transparent transition-all duration-[250ms] bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[0_4px_12px_rgba(201,165,92,0.25)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(201,165,92,0.35)] shrink-0 active:scale-[0.98]"
                    onClick={() => navigate('/products/combos/new')}
                >
                    <Plus size={20} />
                    Create New Combo
                </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-10 md:grid-cols-1">
                {[
                    { label: 'Total Curated Combos', value: combos.length, icon: <Box size={26} />, color: 'var(--color-gold)' },
                    { label: 'Artisan Active Sets', value: combos.filter(c => c.is_active).length, icon: <Package size={24} />, color: '#10b981' },
                    { label: 'Archived / Inactive', value: combos.filter(c => !c.is_active).length, icon: <AlertCircle size={24} />, color: '#f59e0b' }
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-5 p-6 bg-[var(--theme-bg-secondary)] rounded-xl border border-[var(--theme-border)] shadow-sm hover:border-[var(--color-gold-light)] hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                        >
                            {stat.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[var(--theme-text-primary)] text-3xl font-display font-bold leading-none">{stat.value}</span>
                            <span className="text-[var(--theme-text-secondary)] text-sm uppercase tracking-widest font-semibold mt-1 opacity-70">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-8 items-center flex-wrap md:flex-col">
                <div className="flex-1 min-w-[320px] flex items-center gap-4 px-5 py-3 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] rounded-xl transition-all duration-300 focus-within:border-[var(--color-gold)] focus-within:shadow-[0_0_0_4px_rgba(201,165,92,0.1)] [&&gt;svg]:text-[var(--theme-text-secondary)] [&&gt;svg]:shrink-0 md:w-full md:min-w-0">
                    <Search size={22} className="opacity-60" />
                    <input
                        type="text"
                        placeholder="Search for an artisan combo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none text-[var(--theme-text-primary)] outline-none text-base placeholder:text-[var(--theme-text-muted)] placeholder:opacity-50"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-[var(--theme-text-muted)] animate-pulse">
                    <div className="w-12 h-12 border-4 border-[var(--theme-border)] border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span className="text-lg">Discovering curated combos...</span>
                </div>
            ) : filteredCombos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10 bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] shadow-inner">
                    <div className="w-20 h-20 rounded-full bg-[var(--theme-bg-tertiary)] flex items-center justify-center mb-6 text-[var(--theme-text-muted)] opacity-50">
                        <Box size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-semibold text-[var(--theme-text-primary)] mb-3">No Artisanal Combos Found</h3>
                    <p className="text-[var(--theme-text-secondary)] max-w-sm mx-auto leading-relaxed opacity-70">
                        {searchTerm
                            ? "We couldn't find any bundle matching your current selection."
                            : "Your curated collection is currently empty. Begin by crafting your first artisan bundle."}
                    </p>
                    {searchTerm && (
                        <button
                            className="mt-6 text-[var(--color-gold)] font-semibold hover:underline"
                            onClick={() => setSearchTerm('')}
                        >
                            Clear search filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-8 md:grid-cols-1">
                    {filteredCombos.map(combo => {
                        const regularPrice = getRegularPrice(combo)
                        const minPrice = getMinPrice(combo)
                        const maxPrice = getMaxPrice(combo)
                        const savings = getSavings(combo)
                        const savingsPercentage = regularPrice > 0
                            ? ((savings / regularPrice) * 100).toFixed(0)
                            : 0

                        return (
                            <div
                                key={combo.id}
                                className={cn(
                                    "bg-[var(--theme-bg-secondary)] rounded-2xl border border-[var(--theme-border)] overflow-hidden cursor-pointer transition-all duration-[350ms] group relative shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-[var(--color-gold-light)]",
                                    !combo.is_active && 'opacity-60 grayscale-[0.3]'
                                )}
                                onClick={() => navigate(`/products/combos/${combo.id}/edit`)}
                            >
                                {combo.image_url ? (
                                    <div className="w-full h-56 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg-secondary)] via-transparent to-transparent z-10" />
                                        <img
                                            src={combo.image_url}
                                            alt={combo.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {!combo.is_active && (
                                            <div className="absolute top-4 left-4 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[0.7rem] uppercase tracking-widest font-bold">
                                                Inactive Set
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-[var(--theme-bg-tertiary)] flex items-center justify-center relative">
                                        <Box size={48} className="text-[var(--theme-text-muted)] opacity-20" />
                                        {!combo.is_active && (
                                            <div className="absolute top-4 left-4 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[0.7rem] uppercase tracking-widest font-bold">
                                                Inactive Set
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-7 flex flex-col gap-5">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-display text-2xl font-bold text-[var(--theme-text-primary)] transition-colors group-hover:text-[var(--color-gold)]">{combo.name}</h3>
                                        <div className={cn(
                                            "px-3 py-1 rounded-lg text-[0.65rem] uppercase tracking-widest font-bold border",
                                            combo.available_at_pos
                                                ? "bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)] text-green-500"
                                                : "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-amber-500"
                                        )}>
                                            {combo.available_at_pos ? 'POS Visible' : 'POS Hidden'}
                                        </div>
                                    </div>

                                    {combo.description && (
                                        <p className="text-[var(--theme-text-secondary)] text-sm leading-relaxed line-clamp-2 opacity-80">{combo.description}</p>
                                    )}

                                    <div className="bg-[var(--theme-bg-tertiary)] rounded-xl p-5 border border-[var(--theme-border)]">
                                        <h4 className="font-body text-[0.7rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] mb-4 flex items-center gap-2">
                                            <Package size={14} className="text-[var(--color-gold)]" /> Artisan Selections
                                        </h4>
                                        {combo.groups.length === 0 ? (
                                            <p className="text-[var(--theme-text-muted)] text-xs italic">No selection groups configured yet.</p>
                                        ) : (
                                            <div className="flex flex-col gap-4">
                                                {combo.groups.map((group, groupIdx) => (
                                                    <div key={groupIdx} className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <strong className="text-sm font-semibold text-[var(--theme-text-primary)]">{group.name}</strong>
                                                            {!group.is_required && (
                                                                <span className="text-[0.6rem] px-2 py-0.5 rounded-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">Optional</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {group.items.slice(0, 3).map((item, itemIdx) => (
                                                                <div
                                                                    key={itemIdx}
                                                                    className={cn(
                                                                        "text-[0.65rem] px-2.5 py-1.5 rounded-lg border flex items-center gap-2 transition-all",
                                                                        item.is_default
                                                                            ? "bg-[rgba(201,165,92,0.12)] border-[var(--color-gold-light)] text-[var(--color-gold)] font-bold shadow-[0_2px_8px_rgba(201,165,92,0.1)]"
                                                                            : "bg-[var(--theme-bg-secondary)] border-[var(--theme-border)] text-[var(--theme-text-secondary)]"
                                                                    )}
                                                                >
                                                                    <span className="truncate max-w-[100px]">{item.product?.name || 'Selection'}</span>
                                                                    {(item.price_adjustment ?? 0) !== 0 && (
                                                                        <span className="font-bold opacity-80">
                                                                            {(item.price_adjustment ?? 0) > 0 ? '+' : ''}{Math.abs(item.price_adjustment ?? 0) < 1000 ? item.price_adjustment : formatCurrency(item.price_adjustment ?? 0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {group.items.length > 3 && (
                                                                <div className="text-[0.65rem] px-2 py-1.5 rounded-lg bg-[var(--theme-bg-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-muted)]">
                                                                    +{group.items.length - 3} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-6 border-t border-[var(--theme-border)] flex flex-col gap-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-1">
                                                {regularPrice > 0 && (
                                                    <div className="flex items-center gap-2 opacity-40">
                                                        <span className="text-[0.65rem] uppercase tracking-wider font-bold">Value price:</span>
                                                        <span className="text-sm line-through font-medium">{formatCurrency(regularPrice)}</span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--theme-text-muted)] mb-1">Bundle Set Price</span>
                                                    <span className="text-3xl font-display font-bold text-[var(--color-gold)]">
                                                        {minPrice === maxPrice ? (
                                                            formatCurrency(minPrice)
                                                        ) : (
                                                            <span className="text-2xl">
                                                                {formatCurrency(minPrice)} <span className="text-sm opacity-50 px-1 font-body">to</span> {formatCurrency(maxPrice)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            {savings > 0 && (
                                                <div className="bg-[var(--color-gold)] text-white px-4 py-2 rounded-xl flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(201,165,92,0.3)] animate-pulse-slow">
                                                    <span className="text-[0.6rem] uppercase tracking-wider font-bold leading-none mb-0.5">Save</span>
                                                    <span className="text-sm font-bold leading-none">{savingsPercentage}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 z-30">
                                    <button
                                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-[var(--color-gold)] hover:scale-110 shadow-lg"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/products/combos/${combo.id}`) }}
                                        title="View set collection"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-[var(--color-gold)] hover:scale-110 shadow-lg"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/products/combos/${combo.id}/edit`) }}
                                        title="Curate set"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className={cn(
                                            "w-10 h-10 rounded-full backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg",
                                            combo.is_active ? "bg-white/10 hover:bg-amber-500" : "bg-green-500/80 hover:bg-green-600"
                                        )}
                                        onClick={(e) => { e.stopPropagation(); handleToggleActive(combo) }}
                                        title={combo.is_active ? 'Archive Set' : 'Activate Set'}
                                    >
                                        <Package size={18} />
                                    </button>
                                    <button
                                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-destructive hover:scale-110 shadow-lg"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(combo.id) }}
                                        title="Dissolve combo"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}