
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { InventoryCount } from '../../types/database'
import './StockOpname.css'

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
            // Create a new draft session with unique count number
            const countNumber = `INV-${Date.now()}`
            const sessionData = {
                count_number: countNumber,
                notes: 'Nouvel inventaire',
                status: 'draft' as const
            }
            const { data, error } = await supabase
                .from('inventory_counts')
                .insert(sessionData)
                .select()
                .single()

            if (error) throw error
            if (data) {
                navigate(`/inventory/stock-opname/${data.id}`)
            }
        } catch (error: unknown) {
            alert('Erreur: ' + (error instanceof Error ? error.message : String(error)))
        }
    }

    if (loading) return <div className="opname-container"><div className="p-8 text-center text-gray-500">Chargement...</div></div>

    return (
        <div className="opname-container">
            <header className="opname-header">
                <div className="opname-title">
                    <h1>Inventaires Physiques (Opname)</h1>
                    <p className="opname-subtitle">Historique des comptages</p>
                </div>
                <button
                    onClick={createNewSession}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Nouvel Inventaire
                </button>
            </header>

            <main className="opname-content">
                <div className="opname-table-card">
                    <table className="opname-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Date</th>
                                <th>Statut</th>
                                <th>Notes</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counts.map(session => (
                                <tr key={session.id}>
                                    <td className="font-medium">{session.count_number ?? ''}</td>
                                    <td>
                                        {session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}
                                    </td>
                                    <td>
                                        <StatusBadge status={session.status ?? 'draft'} />
                                    </td>
                                    <td className="text-muted italic">
                                        {session.notes || '-'}
                                    </td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => navigate(`/inventory/stock-opname/${session.id}`)}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            {session.status === 'draft' ? 'Continuer' : 'Voir Détails'}
                                            <ArrowRight size={14} className="ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {counts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Aucun inventaire trouvé. Commencez par en créer un.
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
            return <span className="status-badge draft"><Clock size={12} /> Brouillon</span>
        case 'completed':
            return <span className="status-badge completed"><CheckCircle size={12} /> Validé</span>
        case 'cancelled':
            return <span className="status-badge cancelled"><XCircle size={12} /> Annulé</span>
        default:
            return <span className="status-badge">{status}</span>
    }
}
