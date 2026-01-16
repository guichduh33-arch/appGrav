
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, Clock, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount } from '../../types/database'
import './InventoryPage.css' // Reuse styles

export default function StockOpnameList() {
    const navigate = useNavigate()
    const [counts, setCounts] = useState<InventoryCount[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCounts()
    }, [])

    async function fetchCounts() {
        setLoading(true)
        const { data, error } = await supabase
            .from('inventory_counts')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setCounts(data)
        }
        setLoading(false)
    }

    async function createNewSession() {
        try {
            // Create a new draft session
            const { data, error } = await supabase
                .from('inventory_counts')
                .insert({
                    notes: 'Nouvel inventaire',
                    status: 'draft'
                } as any)
                .select()
                .single()

            if (error) throw error
            if (data) {
                navigate(`/inventory/stock-opname/${(data as any).id}`)
            }
        } catch (error: any) {
            alert('Erreur: ' + error.message)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

    return (
        <div className="inventory-page">
            <header className="inventory-header">
                <div>
                    <h1 className="text-2xl font-bold">Inventaires Physiques (Opname)</h1>
                    <p className="text-gray-500">Historique des comptages</p>
                </div>
                <button
                    onClick={createNewSession}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Nouvel Inventaire
                </button>
            </header>

            <main className="inventory-content p-6">
                <div className="card">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 uppercase text-sm text-gray-600">
                            <tr>
                                <th className="p-3">Numéro</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Statut</th>
                                <th className="p-3">Notes</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counts.map(session => (
                                <tr key={session.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{session.count_number}</td>
                                    <td className="p-3">
                                        {new Date(session.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={session.status} />
                                    </td>
                                    <td className="p-3 text-gray-500 italic">
                                        {session.notes || '-'}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => navigate(`/inventory/stock-opname/${session.id}`)}
                                            className="btn-secondary btn-sm"
                                        >
                                            {session.status === 'draft' ? 'Continuer' : 'Voir Détails'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {counts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Aucun inventaire trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'draft':
            return <span className="flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs font-bold uppercase"><Clock size={12} /> Brouillon</span>
        case 'completed':
            return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle size={12} /> Validé</span>
        case 'cancelled':
            return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold uppercase"><XCircle size={12} /> Annulé</span>
        default:
            return <span>{status}</span>
    }
}
