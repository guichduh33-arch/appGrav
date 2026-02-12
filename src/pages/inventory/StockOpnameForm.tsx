
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCheck, Search, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount, Product, ISection } from '../../types/database'
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
    product: Product
    unit?: string // Computed from product
}

interface InventoryCountWithSection extends InventoryCount {
    section?: ISection | null
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
            // 1. Get Session Info with section
            const { data: sess, error: sErr } = await supabase
                .from('inventory_counts')
                .select('*, section:sections(*)')
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
        // Optimistic update
        const newItems = items.map(i => {
            if (i.id === itemId) {
                const diff = actual !== null ? (actual - i.system_quantity) : null
                return { ...i, counted_quantity: actual, difference: diff }
            }
            return i
        })
        setItems(newItems)
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
                difference: i.difference
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

    if (!session) return <div className="flex h-screen flex-col bg-gray-50"><div className="p-8 text-center text-gray-500">Loading...</div></div>

    const isLocked = session.status !== 'draft'

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/inventory/stock-opname')}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{session.count_number ?? ''}</h1>
                            <StatusBadge status={session.status ?? 'draft'} />
                            {session.section && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {session.section.name}
                                </span>
                            )}
                        </div>
                        <p className="flex items-center gap-2 text-sm text-gray-500">
                            {session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isLocked && (
                        <>
                            <button
                                onClick={saveDraft}
                                disabled={status === 'saving'}
                                className="btn btn-secondary"
                            >
                                <Save size={16} /> Save
                            </button>
                            <button
                                onClick={finalizeCount}
                                disabled={status === 'saving'}
                                className="btn btn-primary"
                            >
                                <CheckCheck size={16} /> Finalize
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-auto px-8 py-6">

                {/* Controls */}
                <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Search for a product..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <button
                                onClick={() => setBlindMode(!blindMode)}
                                className={`btn btn-sm ${blindMode ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {blindMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                {blindMode ? 'Blind Mode (ON)' : 'Blind Mode (OFF)'}
                            </button>
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-600">Product</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-right text-sm font-semibold text-gray-600">System Stock</th>
                                <th className="w-[180px] border-b border-gray-200 bg-blue-50/50 p-4 text-right text-sm font-semibold text-gray-600">Actual (Physical)</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-right text-sm font-semibold text-gray-600">Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border-b border-gray-100 p-4 text-gray-700">
                                        <div className="font-medium text-gray-900">{item.product.name}</div>
                                        <div className="text-xs text-gray-500">{item.product.sku}</div>
                                    </td>
                                    <td className="border-b border-gray-100 p-4 text-right text-gray-700">
                                        {blindMode && !isLocked ? (
                                            <span className="text-muted italic">Hidden</span>
                                        ) : (
                                            <span className="font-medium">{item.system_quantity} {item.unit}</span>
                                        )}
                                    </td>
                                    <td className="w-[180px] border-b border-gray-100 bg-blue-50/50 p-4 text-right">
                                        {isLocked ? (
                                            <span className="font-bold">{item.counted_quantity}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="w-full rounded-md border border-gray-300 p-2 text-right font-mono font-semibold transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={item.counted_quantity ?? ''}
                                                placeholder="-"
                                                onChange={e => handleUpdateCount(item.id, e.target.value ? parseFloat(e.target.value) : null)}
                                            />
                                        )}
                                    </td>
                                    <td className="border-b border-gray-100 p-4 text-right">
                                        {item.difference !== null && !blindMode ? (
                                            <span className={cn(
                                                'font-semibold',
                                                item.difference === 0 && 'text-gray-400',
                                                item.difference > 0 && 'text-success',
                                                item.difference < 0 && 'text-destructive'
                                            )}>
                                                {item.difference > 0 ? '+' : ''}{item.difference} {item.unit}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
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
            return <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">Draft</span>
        case 'completed':
            return <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-success">Validated</span>
        case 'cancelled':
            return <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-destructive">Cancelled</span>
        default:
            return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
}
