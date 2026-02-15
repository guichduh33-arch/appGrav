import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Search } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable'
import { supabase } from '../../lib/supabase'
import {
    ProductCombo,
    ProductComboGroup,
    ProductComboGroupItem,
    Product
} from '../../types/database'
import { logError } from '@/utils/logger'
import { toast } from 'sonner'

import CombosHeader from './combos-list/CombosHeader'
import CombosStats from './combos-list/CombosStats'
import ComboCard from './combos-list/ComboCard'

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

    useEffect(() => { fetchCombos() }, [])

    const fetchCombos = async () => {
        try {
            const { data: combosData, error: combosError } = await supabase
                .from('product_combos')
                .select('*')
                .order('sort_order', { ascending: true })

            if (combosError) throw combosError

            if (combosData) {
                const combosWithGroups = await Promise.all(
                    combosData.map(async (combo) => {
                        const { data: groupsData } = await supabase
                            .from('product_combo_groups')
                            .select('*')
                            .eq('combo_id', combo.id)
                            .order('sort_order', { ascending: true })

                        const groups = groupsData || []
                        const groupsWithItems = await Promise.all(
                            groups.map(async (group) => {
                                const { data: itemsData } = await supabase
                                    .from('product_combo_group_items')
                                    .select(`*, product:products(*)`)
                                    .eq('group_id', group.id)
                                    .order('sort_order', { ascending: true })

                                return { ...group, items: itemsData || [] }
                            })
                        )

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
            const { error } = await supabase.from('product_combos').delete().eq('id', id)
            if (error) throw error
            await fetchCombos()
        } catch (error) { logError('Error deleting combo:', error) }
    }

    const handleToggleActive = async (combo: ComboWithGroups) => {
        try {
            const { error } = await supabase.from('product_combos').update({ is_active: !combo.is_active }).eq('id', combo.id)
            if (error) throw error
            await fetchCombos()
        } catch (error) { logError('Error updating combo:', error) }
    }

    const getMinPrice = (combo: ComboWithGroups) => {
        let minAdjustment = 0
        combo.groups.forEach(group => {
            if (group.items.length > 0) {
                const defaultItem = group.items.find(item => item.is_default)
                const cheapestItem = group.items.reduce((min, item) =>
                    (item.price_adjustment ?? 0) < (min.price_adjustment ?? 0) ? item : min
                )
                minAdjustment += (defaultItem || cheapestItem).price_adjustment ?? 0
            }
        })
        return combo.combo_price + minAdjustment
    }

    const getMaxPrice = (combo: ComboWithGroups) => {
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
        let totalRetailPrice = 0
        combo.groups.forEach(group => {
            const defaultItem = group.items.find(item => item.is_default)
            if (defaultItem && defaultItem.product) {
                totalRetailPrice += defaultItem.product.retail_price || 0
            }
        })
        return totalRetailPrice
    }

    const getSavings = (combo: ComboWithGroups) => getRegularPrice(combo) - getMinPrice(combo)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const isDraggable = !searchTerm

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = combos.findIndex(c => c.id === active.id)
        const newIndex = combos.findIndex(c => c.id === over.id)
        const reordered = arrayMove(combos, oldIndex, newIndex)
        setCombos(reordered)

        try {
            const updates = reordered.map((c, i) => ({ id: c.id, sort_order: i }))
            for (const u of updates) {
                const { error } = await supabase
                    .from('product_combos')
                    .update({ sort_order: u.sort_order })
                    .eq('id', u.id)
                if (error) throw error
            }
            toast.success('Order updated')
        } catch (error) {
            logError('Reorder error:', error)
            toast.error('Failed to update order')
            fetchCombos()
        }
    }

    return (
        <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-8 max-w-[1600px] mx-auto max-md:p-4 font-body">
            <CombosHeader onCreateNew={() => navigate('/products/combos/new')} />
            <CombosStats
                total={combos.length}
                active={combos.filter(c => c.is_active).length}
                inactive={combos.filter(c => !c.is_active).length}
            />

            {/* Search */}
            <div className="flex gap-4 mb-8 items-center flex-wrap max-md:flex-col">
                <div className="flex-1 min-w-[320px] flex items-center gap-4 px-5 py-3 bg-[var(--onyx-surface)] border border-white/5 rounded-xl transition-all duration-300 focus-within:border-[var(--color-gold)] focus-within:ring-1 focus-within:ring-[var(--color-gold)]/20 max-md:w-full max-md:min-w-0">
                    <Search size={22} className="text-[var(--theme-text-muted)] shrink-0" />
                    <input
                        type="text"
                        placeholder="Search for a combo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none text-white outline-none text-base placeholder:text-[var(--theme-text-muted)]"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-[var(--theme-text-muted)]">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
                    <span className="text-lg">Loading combos...</span>
                </div>
            ) : filteredCombos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-10 bg-[var(--onyx-surface)] rounded-2xl border border-white/5">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-6 text-[var(--theme-text-muted)] opacity-50">
                        <Box size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-semibold text-white mb-3">No Combos Found</h3>
                    <p className="text-[var(--theme-text-secondary)] max-w-sm mx-auto leading-relaxed opacity-70">
                        {searchTerm
                            ? "No combos matching your search."
                            : "Your collection is empty. Create your first combo."}
                    </p>
                    {searchTerm && (
                        <button
                            className="mt-6 text-[var(--color-gold)] font-semibold hover:underline"
                            onClick={() => setSearchTerm('')}
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredCombos.map(c => c.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-8 max-md:grid-cols-1">
                            {filteredCombos.map(combo => {
                                const regularPrice = getRegularPrice(combo)
                                const minPrice = getMinPrice(combo)
                                const maxPrice = getMaxPrice(combo)
                                const savings = getSavings(combo)
                                const savingsPercentage = regularPrice > 0
                                    ? ((savings / regularPrice) * 100).toFixed(0)
                                    : 0

                                return (
                                    <ComboCard
                                        key={combo.id}
                                        combo={combo}
                                        minPrice={minPrice}
                                        maxPrice={maxPrice}
                                        regularPrice={regularPrice}
                                        savings={savings}
                                        savingsPercentage={savingsPercentage}
                                        onView={(id) => navigate(`/products/combos/${id}`)}
                                        onEdit={(id) => navigate(`/products/combos/${id}/edit`)}
                                        onToggleActive={() => handleToggleActive(combo)}
                                        onDelete={handleDelete}
                                        isDraggable={isDraggable}
                                    />
                                )
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    )
}
