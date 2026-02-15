
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCheck, Search, Eye, EyeOff, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount, Product, ISection, StockLocation } from '../../types/database'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

// Extended item type for UI (adds product relation and computed unit)
interface CountItemWithProduct {
    id: string
    count_id: string
    product_id: string
    system_quantity: number
    counted_quantity: number | null
    difference: number | null
    notes: string | null
    reason: string | null
    product: Product
    unit?: string // Computed from product
}

const VARIANCE_REASONS = [
    { value: '', label: '-' },
    { value: 'breakage', label: 'Breakage' },
    { value: 'expired', label: 'Expired' },
    { value: 'theft', label: 'Theft' },
    { value: 'miscount', label: 'Miscount' },
    { value: 'damage', label: 'Damage' },
    { value: 'other', label: 'Other' },
]

interface InventoryCountWithSection extends InventoryCount {
    section?: ISection | null
    location?: StockLocation | null
}

export default function StockOpnameForm() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Header Data
    const [session, setSession] = useState<InventoryCountWithSection | null>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'saving'>('loading')

    // Items Data
    const [items, setItems] = useState<CountItemWithProduct[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // UI State
    const [blindMode, setBlindMode] = useState(false) // If true, hide system stock

    useEffect(() => {
        if (id) loadSessionData()
    }, [id])

    async function loadSessionData() {
        if (!id) return
        setStatus('loading')
        try {
            // 1. Get Session Info with section and location
            const { data: sess, error: sErr } = await supabase
                .from('inventory_counts')
                .select('*, section:sections(*), location:stock_locations(*)')
                .eq('id', id)
                .single()
            if (sErr) throw sErr
            setSession(sess as InventoryCountWithSection)

            // 2. Get Items
            const { data: existingItems, error: iErr } = await supabase
                .from('inventory_count_items')
                .select('*, product:products(*)')
                .eq('count_id', id)

            if (iErr) throw iErr

            // 3. If Draft and No items, initialize items from Product Snapshots
            if (sess.status === 'draft' && (!existingItems || existingItems.length === 0)) {
                await initializeItems(id, sess.section_id)
            } else {
                // Add unit from product to each item - map to proper type
                type RawItem = CountItemWithProduct & { product?: Product };
                const rawItems = existingItems as RawItem[];
                const itemsWithUnit = rawItems.map((item) => ({
                    ...item,
                    unit: item.product?.unit || 'pcs',
                    product: item.product!
                }))
                setItems(itemsWithUnit)
            }
        } catch (error) {
            logError('Error loading session:', error)
            alert('Error loading session')
        } finally {
            setStatus('ready')
        }
    }

    async function initializeItems(sessionId: string, sectionId: string | null) {
        let products: Product[] = []

        if (sectionId) {
            // Get product IDs that belong to this section via product_sections junction table
            const { data: productSections } = await supabase
                .from('product_sections')
                .select('product_id')
                .eq('section_id', sectionId)

            if (productSections && productSections.length > 0) {
                const productIds = productSections.map(ps => ps.product_id)

                // Fetch the actual products
                const { data: sectionProducts } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', productIds)
                    .neq('is_active', false)

                products = sectionProducts || []
            }
        } else {
            // Fallback: get all active products if no section specified
            const { data } = await supabase
                .from('products')
                .select('*')
                .neq('is_active', false)
            products = data || []
        }

        if (!products || products.length === 0) return

        const records = products.map(p => ({
            count_id: sessionId,
            product_id: p.id,
            system_quantity: p.current_stock || 0
        }))

        const { error } = await supabase
            .from('inventory_count_items')
            .insert(records as never)
            .select('*, product:products(*)')

        if (error) {
            logError('Init Error:', error)
            throw error
        }

        const { data: reloaded } = await supabase
            .from('inventory_count_items')
            .select('*, product:products(*)')
            .eq('count_id', sessionId)

        type RawItem = CountItemWithProduct & { product?: Product };
        const rawItems = reloaded as RawItem[];
        const itemsWithUnit = rawItems.map((item) => ({
            ...item,
            unit: item.product?.unit || 'pcs',
            product: item.product!
        }))
        setItems(itemsWithUnit)
    }

    async function handleUpdateCount(itemId: string, actual: number | null) {
        const newItems = items.map(i => {
            if (i.id === itemId) {
                const diff = actual !== null ? (actual - i.system_quantity) : null
                return { ...i, counted_quantity: actual, difference: diff }
            }
            return i
        })
        setItems(newItems)
    }

    function handleReasonChange(itemId: string, reason: string) {
        setItems(prev => prev.map(i =>
            i.id === itemId ? { ...i, reason: reason || null } : i
        ))
    }

    async function saveDraft() {
        if (!session) return
        setStatus('saving')
        try {
            const updates = items.map(i => ({
                id: i.id,
                count_id: session.id,
                product_id: i.product_id,
                system_quantity: i.system_quantity,
                counted_quantity: i.counted_quantity,
                difference: i.difference,
                reason: i.reason,
            }))

            const { error } = await supabase
                .from('inventory_count_items')
                .upsert(updates as never)

            if (error) throw error

            alert('Draft saved')
        } catch (e) {
            alert('Save error: ' + (e instanceof Error ? e.message : 'Unknown error'))
        } finally {
            setStatus('ready')
        }
    }

    async function finalizeCount() {
        if (!confirm("Warning: This action is irreversible.\nStock variances will be applied immediately.")) return

        setStatus('saving')
        try {
            // First save the draft to ensure all counted_quantity values are persisted
            await saveDraft()

            // Call the database function to finalize and create stock movements
            // Note: User identity is securely determined server-side via auth.uid()
            const { error } = await supabase
                .rpc('finalize_inventory_count', {
                    count_uuid: id!
                })

            if (error) throw error

            alert('Inventory validated and stock updated!')
            navigate('/inventory/stock-opname')
        } catch (e) {
            alert('Validation error: ' + (e instanceof Error ? e.message : 'Unknown error'))
            setStatus('ready')
        }
    }

    const filteredItems = items.filter(i =>
        i.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!session) return (
        <div className="flex h-screen flex-col bg-[var(--theme-bg-primary)]">
            <div className="p-8 text-center text-[var(--theme-text-muted)]">Loading...</div>
        </div>
    )

    const isLocked = session.status !== 'draft'

    return (
        <div className="flex h-screen flex-col bg-[var(--theme-bg-primary)]">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[var(--theme-bg-primary)] px-8 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/inventory/stock-opname')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-[var(--theme-text-muted)] transition-colors hover:bg-white/5 hover:text-white hover:border-white/20"
                        aria-label="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="font-display text-xl text-white">{session.count_number ?? ''}</h1>
                            <StatusBadge status={session.status ?? 'draft'} />
                            {session.section && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                                    {session.section.name}
                                </span>
                            )}
                            {session.location && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[var(--theme-text-secondary)] border border-white/10">
                                    <MapPin size={10} /> {session.location.name}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-[var(--theme-text-muted)] mt-0.5">
                            {session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {!isLocked && (
                        <>
                            <button
                                onClick={saveDraft}
                                disabled={status === 'saving'}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-transparent border border-white/10 rounded-lg hover:border-white/20 transition-colors disabled:opacity-40"
                            >
                                <Save size={16} /> Save
                            </button>
                            <button
                                onClick={finalizeCount}
                                disabled={status === 'saving'}
                                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-black bg-[var(--color-gold)] rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
                            >
                                <CheckCheck size={16} /> Finalize
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-auto px-8 py-6">

                {/* Controls */}
                <div className="mb-6 flex items-center justify-between rounded-xl border border-white/5 bg-[var(--onyx-surface)] p-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" size={18} />
                        <input
                            className="w-full rounded-xl bg-black/40 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--theme-text-muted)] outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 transition-colors"
                            placeholder="Search for a product..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <button
                                onClick={() => setBlindMode(!blindMode)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all',
                                    blindMode
                                        ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold'
                                        : 'bg-transparent text-white border-white/10 hover:border-white/20'
                                )}
                            >
                                {blindMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                {blindMode ? 'Blind Mode (ON)' : 'Blind Mode (OFF)'}
                            </button>
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-white/5 bg-[var(--onyx-surface)] shadow-lg">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Product</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">System Stock</th>
                                <th className="w-[180px] px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]/70 bg-[var(--color-gold)]/5">Actual (Physical)</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Variance</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredItems.map(item => (
                                <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{item.product.name}</div>
                                        <div className="text-xs text-[var(--theme-text-muted)] mt-0.5">{item.product.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {blindMode && !isLocked ? (
                                            <span className="text-[var(--theme-text-muted)] italic">Hidden</span>
                                        ) : (
                                            <span className="font-medium text-[var(--theme-text-secondary)]">{item.system_quantity} {item.unit}</span>
                                        )}
                                    </td>
                                    <td className="w-[180px] px-6 py-4 text-right bg-[var(--color-gold)]/5">
                                        {isLocked ? (
                                            <span className="font-bold text-white">{item.counted_quantity}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="w-full rounded-xl bg-black/40 border border-white/10 p-2 text-right font-mono font-semibold text-white transition-all outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 placeholder:text-[var(--theme-text-muted)]"
                                                value={item.counted_quantity ?? ''}
                                                placeholder="-"
                                                onChange={e => handleUpdateCount(item.id, e.target.value ? parseFloat(e.target.value) : null)}
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.difference !== null && !blindMode ? (
                                            <span className={cn(
                                                'font-semibold',
                                                item.difference === 0 && 'text-[var(--theme-text-muted)]',
                                                item.difference > 0 && 'text-success',
                                                item.difference < 0 && 'text-destructive'
                                            )}>
                                                {item.difference > 0 ? '+' : ''}{item.difference} {item.unit}
                                            </span>
                                        ) : (
                                            <span className="text-white/10">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isLocked ? (
                                            <span className="text-sm text-white/80">{item.reason ? VARIANCE_REASONS.find(r => r.value === item.reason)?.label ?? item.reason : '-'}</span>
                                        ) : item.difference && item.difference !== 0 ? (
                                            <select
                                                className="w-full rounded-xl bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20"
                                                value={item.reason ?? ''}
                                                onChange={e => handleReasonChange(item.id, e.target.value)}
                                            >
                                                {VARIANCE_REASONS.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-white/10">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'draft':
            return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[var(--theme-text-secondary)] border border-white/10">Draft</span>
        case 'completed':
            return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-success/30 bg-success/10 text-success">Validated</span>
        case 'cancelled':
            return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-destructive/30 bg-destructive/10 text-destructive">Cancelled</span>
        default:
            return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">{status}</span>
    }
}
