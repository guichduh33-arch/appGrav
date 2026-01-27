
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCheck, Search, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount, Product } from '../../types/database'
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

export default function StockOpnameForm() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Header Data
    const [session, setSession] = useState<InventoryCount | null>(null)
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
            // 1. Get Session Info
            const { data: sess, error: sErr } = await supabase
                .from('inventory_counts')
                .select('*')
                .eq('id', id)
                .single<InventoryCount>()
            if (sErr) throw sErr
            setSession(sess)

            // 2. Get Items
            const { data: existingItems, error: iErr } = await supabase
                .from('inventory_count_items')
                .select('*, product:products(*)')
                .eq('count_id', id)

            if (iErr) throw iErr

            // 3. If Draft and No items, initialize items from Product Snapshots
            if (sess.status === 'draft' && (!existingItems || existingItems.length === 0)) {
                await initializeItems(id)
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
            alert('Erreur chargement session')
        } finally {
            setStatus('ready')
        }
    }

    async function initializeItems(sessionId: string) {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)

        if (!products) return

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

            alert('Brouillon sauvegardé')
        } catch (e) {
            alert('Erreur sauvegarde: ' + (e instanceof Error ? e.message : 'Erreur inconnue'))
        } finally {
            setStatus('ready')
        }
    }

    async function finalizeCount() {
        if (!confirm("Attention: Cette action est irréversible.\nLes écarts de stock seront appliqués immédiatement.")) return

        setStatus('saving')
        try {
            await saveDraft()

            // Update status to completed
            const { error } = await supabase
                .from('inventory_counts')
                .update({ status: 'completed' })
                .eq('id', id!)

            if (error) throw error

            alert('Inventaire validé et stocks mis à jour !')
            navigate('/inventory/stock-opname')
        } catch (e) {
            alert('Erreur validation: ' + (e instanceof Error ? e.message : 'Erreur inconnue'))
            setStatus('ready')
        }
    }

    const filteredItems = items.filter(i =>
        i.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!session) return <div className="opname-container"><div className="p-8 text-center text-gray-500">Chargement...</div></div>

    const isLocked = session.status !== 'draft'

    return (
        <div className="opname-container">
            <header className="opname-header sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/inventory/stock-opname')} className="btn-back" aria-label="Retour">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{session.count_number ?? ''}</h1>
                            <StatusBadge status={session.status ?? 'draft'} />
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
                                <Save size={16} /> Enregistrer
                            </button>
                            <button
                                onClick={finalizeCount}
                                disabled={status === 'saving'}
                                className="btn btn-primary"
                            >
                                <CheckCheck size={16} /> Finaliser
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
                            placeholder="Rechercher un produit..."
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
                                {blindMode ? 'Mode Aveugle (ON)' : 'Mode Aveugle (OFF)'}
                            </button>
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="opname-table-card">
                    <table className="opname-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th className="text-right">Stock Système</th>
                                <th className="text-right real-stock-col">Réel (Physique)</th>
                                <th className="text-right">Ecart</th>
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
                                            <span className="text-muted italic">Masqué</span>
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
            return <span className="status-badge draft">Brouillon</span>
        case 'completed':
            return <span className="status-badge completed">Validé</span>
        case 'cancelled':
            return <span className="status-badge cancelled">Annulé</span>
        default:
            return <span className="status-badge">{status}</span>
    }
}
