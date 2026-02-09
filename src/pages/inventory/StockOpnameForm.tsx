
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCheck, Search, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount, Product, ISection } from '../../types/database'
import './StockOpname.css'

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
                // Add unit from product to each item
                const rawItems = existingItems as unknown as Array<CountItemWithProduct & { product?: Product }>;
                const itemsWithUnit = rawItems.map((item) => ({
                    ...item,
                    unit: item.product?.unit || 'pcs'
                })) as CountItemWithProduct[]
                setItems(itemsWithUnit)
            }
        } catch (error) {
            console.error('Error loading session:', error)
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
            console.error('Init Error:', error)
            throw error
        }

        const { data: reloaded } = await supabase
            .from('inventory_count_items')
            .select('*, product:products(*)')
            .eq('count_id', sessionId)

        const rawItems = reloaded as unknown as Array<CountItemWithProduct & { product?: Product }>;
        const itemsWithUnit = rawItems.map((item) => ({
            ...item,
            unit: item.product?.unit || 'pcs'
        })) as CountItemWithProduct[]
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

    if (!session) return <div className="opname-container"><div className="p-8 text-center text-gray-500">Loading...</div></div>

    const isLocked = session.status !== 'draft'

    return (
        <div className="opname-container">
            <header className="opname-header sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/inventory/stock-opname')} className="btn-back" aria-label="Back">
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
                        <p className="opname-subtitle">
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

            <div className="opname-content">

                {/* Controls */}
                <div className="controls-bar">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            className="search-input"
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
                <div className="opname-table-card">
                    <table className="opname-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th className="text-right">System Stock</th>
                                <th className="text-right real-stock-col">Actual (Physical)</th>
                                <th className="text-right">Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="font-medium text-gray-900">{item.product.name}</div>
                                        <div className="text-xs text-gray-500">{item.product.sku}</div>
                                    </td>
                                    <td className="text-right">
                                        {blindMode && !isLocked ? (
                                            <span className="text-muted italic">Hidden</span>
                                        ) : (
                                            <span className="font-medium">{item.system_quantity} {item.unit}</span>
                                        )}
                                    </td>
                                    <td className="text-right real-stock-col">
                                        {isLocked ? (
                                            <span className="font-bold">{item.counted_quantity}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="count-input"
                                                value={item.counted_quantity ?? ''}
                                                placeholder="-"
                                                onChange={e => handleUpdateCount(item.id, e.target.value ? parseFloat(e.target.value) : null)}
                                            />
                                        )}
                                    </td>
                                    <td className="text-right">
                                        {item.difference !== null && !blindMode ? (
                                            <span className={item.difference === 0 ? 'variance-neutral' : (item.difference > 0 ? 'variance-positive' : 'variance-negative')}>
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
            return <span className="status-badge draft">Draft</span>
        case 'completed':
            return <span className="status-badge completed">Validated</span>
        case 'cancelled':
            return <span className="status-badge cancelled">Cancelled</span>
        default:
            return <span className="status-badge">{status}</span>
    }
}
