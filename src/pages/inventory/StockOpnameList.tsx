
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, Clock, XCircle, ArrowRight, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSections } from '@/hooks/inventory/useSections'
import type { InventoryCount, ISection } from '../../types/database'
import './StockOpname.css'

interface InventoryCountWithSection extends InventoryCount {
    section?: ISection | null
}

export default function StockOpnameList() {
    const navigate = useNavigate()
    const [counts, setCounts] = useState<InventoryCountWithSection[]>([])
    const [loading, setLoading] = useState(true)
    const [showSectionDialog, setShowSectionDialog] = useState(false)
    const [selectedSection, setSelectedSection] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)

    const { data: sections = [], isLoading: sectionsLoading } = useSections({ isActive: true })

    useEffect(() => {
        fetchCounts()
    }, [])

    async function fetchCounts() {
        setLoading(true)
        const { data, error } = await supabase
            .from('inventory_counts')
            .select('*, section:sections(*)')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setCounts(data as InventoryCountWithSection[])
        }
        setLoading(false)
    }

    function openSectionDialog() {
        setSelectedSection(null)
        setShowSectionDialog(true)
    }

    async function createNewSession() {
        if (!selectedSection) {
            alert('Please select a section')
            return
        }

        setCreating(true)
        try {
            // Create a new draft session with unique count number
            const countNumber = `INV-${Date.now()}`
            const sessionData = {
                count_number: countNumber,
                notes: 'New inventory',
                status: 'draft' as const,
                section_id: selectedSection
            }
            const { data, error } = await supabase
                .from('inventory_counts')
                .insert(sessionData)
                .select()
                .single()

            if (error) throw error
            if (data) {
                setShowSectionDialog(false)
                navigate(`/inventory/stock-opname/${data.id}`)
            }
        } catch (error: unknown) {
            alert('Error: ' + (error instanceof Error ? error.message : String(error)))
        } finally {
            setCreating(false)
        }
    }

    if (loading) return <div className="opname-container"><div className="p-8 text-center text-gray-500">Loading...</div></div>

    return (
        <div className="opname-container">
            <header className="opname-header">
                <div className="opname-title">
                    <h1>Physical Inventory (Opname)</h1>
                    <p className="opname-subtitle">Count history</p>
                </div>
                <button
                    onClick={openSectionDialog}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> New Inventory
                </button>
            </header>

            <main className="opname-content">
                <div className="opname-table-card">
                    <table className="opname-table">
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Section</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counts.map(session => (
                                <tr key={session.id}>
                                    <td className="font-medium">{session.count_number ?? ''}</td>
                                    <td>
                                        {session.section ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {session.section.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
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
                                            {session.status === 'draft' ? 'Continue' : 'View Details'}
                                            <ArrowRight size={14} className="ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {counts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        No inventory found. Start by creating one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Section Selection Dialog */}
            {showSectionDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Select Section</h2>
                            <button
                                onClick={() => setShowSectionDialog(false)}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Choose the section for which you want to perform the inventory count.
                            </p>
                            {sectionsLoading ? (
                                <div className="py-4 text-center text-gray-500">Loading sections...</div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {sections.map(section => (
                                        <label
                                            key={section.id}
                                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedSection === section.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="section"
                                                value={section.id}
                                                checked={selectedSection === section.id}
                                                onChange={() => setSelectedSection(section.id)}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className="font-medium">{section.name}</div>
                                                {section.description && (
                                                    <div className="text-sm text-gray-500">{section.description}</div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                    {sections.length === 0 && (
                                        <p className="py-4 text-center text-gray-500">
                                            No sections available. Please create sections first.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button
                                onClick={() => setShowSectionDialog(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createNewSession}
                                disabled={!selectedSection || creating}
                                className="btn btn-primary"
                            >
                                {creating ? 'Creating...' : 'Start Inventory'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'draft':
            return <span className="status-badge draft"><Clock size={12} /> Draft</span>
        case 'completed':
            return <span className="status-badge completed"><CheckCircle size={12} /> Validated</span>
        case 'cancelled':
            return <span className="status-badge cancelled"><XCircle size={12} /> Cancelled</span>
        default:
            return <span className="status-badge">{status}</span>
    }
}
