
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCheck, Search, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount, InventoryCountItem, Product } from '../../types/database'
import './StockOpname.css' // We might create this, or assume shared styles

export default function StockOpnameForm() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Header Data
    const [session, setSession] = useState<InventoryCount | null>(null)
    const [status, setStatus] = useState<'loading' | 'ready' | 'saving'>('loading')

    // Items Data
    const [items, setItems] = useState<(InventoryCountItem & { product: Product })[]>([])
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
                .eq('inventory_count_id', id)
                .order('product(name)' as any) // workaround for sorting join
                .returns<(InventoryCountItem & { product: Product })[]>()

            if (iErr) throw iErr

            // 3. If Draft and No items, initialize items from Product Snapshots
            if (sess.status === 'draft' && (!existingItems || existingItems.length === 0)) {
                await initializeItems(id)
            } else {
                // Cast to any to handle the join type
                setItems(existingItems as any || [])
            }
        } catch (error) {
            console.error('Error loading session:', error)
            alert('Erreur chargement session')
        } finally {
            setStatus('ready')
        }
    }

    async function initializeItems(sessionId: string) {
        // Fetch all active products
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .returns<Product[]>()

        if (!products) return

        // Create item entries
        const records = products.map(p => ({
            inventory_count_id: sessionId,
            product_id: p.id,
            system_stock: p.current_stock, // SNAPSHOT
            unit: p.unit
        }))

        // Insert in batches if needed, but for now single call
        const { error } = await supabase
            .from('inventory_count_items')
            .insert(records as any)
            .select('*, product:products(*)')

        if (error) {
            console.error('Init Error:', error)
            throw error
        }

        // Reload items properly
        const { data: reloaded } = await supabase
            .from('inventory_count_items')
            .select('*, product:products(*)')
            .eq('inventory_count_id', sessionId)

        setItems(reloaded as any || [])
    }

    // --- Actions ---

    async function handleUpdateCount(itemId: string, actual: number | null) {
        // Optimistic update
        const newItems = items.map(i => {
            if (i.id === itemId) {
                const variance = actual !== null ? (actual - i.system_stock) : null
                return { ...i, actual_stock: actual, variance }
            }
            return i
        })
        setItems(newItems)

        // Debounce or just save on blur? For now simple implementation: won't save instantly to DB to avoid spam
        // But we rely on "Save Draft" button for persistence usually in Opname
    }

    async function saveDraft() {
        if (!session) return
        setStatus('saving')
        try {
            // Bulk update (upsert) currently changed or all?
            // Supabase upsert requires primary keys.
            const updates = items.map(i => ({
                id: i.id,
                inventory_count_id: session.id,
                product_id: i.product_id,
                system_stock: i.system_stock, // Keep original snapshot
                actual_stock: i.actual_stock,
                variance: i.variance,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase
                .from('inventory_count_items')
                .upsert(updates as any)

            if (error) throw error

            // Update session note maybe?
            alert('Brouillon sauvegardé')
        } catch (e: any) {
            alert('Erreur sauvegarde: ' + e.message)
        } finally {
            setStatus('ready')
        }
    }

    async function finalizeCount() {
        if (!confirm("Attention: Cette action est irréversible.\nLes écarts de stock seront appliqués immédiatement.")) return

        setStatus('saving')
        try {
            // 1. Ensure everything is saved first
            await saveDraft()

            // 2. Call RPC
            const { error } = await supabase.rpc('finalize_inventory_count', {
                count_uuid: id!,
                user_uuid: (await supabase.auth.getUser()).data.user?.id || ''
            } as any)

            if (error) throw error

            alert('Inventaire validé et stocks mis à jour !')
            navigate('/inventory/stock-opname')
        } catch (e: any) {
            alert('Erreur validation: ' + e.message)
            setStatus('ready')
        }
    }

    // --- Filtering ---
    const filteredItems = items.filter(i =>
        i.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!session) return <div>Chargement...</div>

    const isLocked = session.status !== 'draft'

    return (
        <div className="product-detail-page"> {/* Reusing layout class */}
            <header className="detail-header sticky top-0 bg-white z-10 shadow-sm p-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/inventory/stock-opname')} className="btn-icon" aria-label="Retour">
                        <ArrowLeft />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{session.count_number}</h1>
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${session.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {session.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            {new Date(session.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isLocked && (
                        <>
                            <button
                                onClick={saveDraft}
                                disabled={status === 'saving'}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Save size={16} /> Enregistrer
                            </button>
                            <button
                                onClick={finalizeCount}
                                disabled={status === 'saving'}
                                className="btn-primary flex items-center gap-2"
                            >
                                <CheckCheck size={16} /> Finaliser
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="p-6">

                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-1/3">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            className="pl-10 w-full"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <button
                                onClick={() => setBlindMode(!blindMode)}
                                className={`flex items-center gap-2 px-3 py-1 rounded border ${blindMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                            >
                                {blindMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                {blindMode ? 'Mode Aveugle (ON)' : 'Mode Aveugle (OFF)'}
                            </button>
                        </label>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3">Produit</th>
                                <th className="p-3 text-right">Stock Système</th>
                                <th className="p-3 text-right bg-blue-50 w-48">Réel (Physique)</th>
                                <th className="p-3 text-right">Ecart</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="font-medium">{item.product.name}</div>
                                        <div className="text-xs text-gray-500">{item.product.sku}</div>
                                    </td>
                                    <td className="p-3 text-right">
                                        {blindMode && !isLocked ? (
                                            <span className="text-gray-300 italic">Masqué</span>
                                        ) : (
                                            <span>{item.system_stock} {item.unit}</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right bg-blue-50">
                                        {isLocked ? (
                                            <span className="font-bold">{item.actual_stock}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="w-full text-right p-1 border border-blue-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                                                value={item.actual_stock ?? ''}
                                                placeholder="-"
                                                onChange={e => handleUpdateCount(item.id, e.target.value ? parseFloat(e.target.value) : null)}
                                            />
                                        )}
                                    </td>
                                    <td className={`p-3 text-right font-medium`}>
                                        {item.variance !== null && !blindMode ? (
                                            <span className={item.variance === 0 ? 'text-gray-400' : (item.variance > 0 ? 'text-green-600' : 'text-red-600')}>
                                                {item.variance > 0 ? '+' : ''}{item.variance} {item.unit}
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
