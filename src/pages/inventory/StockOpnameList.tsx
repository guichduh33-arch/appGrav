
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, Clock, XCircle, ArrowRight, X } from 'lucide-react'
import { useSections } from '@/hooks/inventory/useSections'
import { useInventoryCounts, useCreateInventoryCount } from '@/hooks/inventory/useStockOpname'
import { toast } from 'sonner'

export default function StockOpnameList() {
    const navigate = useNavigate()
    const [showSectionDialog, setShowSectionDialog] = useState(false)
    const [selectedSection, setSelectedSection] = useState<string | null>(null)

    const { data: counts = [], isLoading: loading } = useInventoryCounts()
    const { data: sections = [], isLoading: sectionsLoading } = useSections({ isActive: true })
    const createCountMutation = useCreateInventoryCount()
    const creating = createCountMutation.isPending

    function openSectionDialog() {
        setSelectedSection(null)
        setShowSectionDialog(true)
    }

    async function createNewSession() {
        if (!selectedSection) {
            toast.error('Please select a section')
            return
        }

        try {
            const data = await createCountMutation.mutateAsync(selectedSection)
            if (data) {
                setShowSectionDialog(false)
                navigate(`/inventory/stock-opname/${data.id}`)
            }
        } catch (error: unknown) {
            toast.error('Error: ' + (error instanceof Error ? error.message : String(error)))
        }
    }

    if (loading) return <div className="flex flex-col" style={{ background: 'var(--theme-bg-primary)' }}><div className="p-8 text-center" style={{ color: 'var(--theme-text-muted)' }}>Loading...</div></div>

    return (
        <div className="flex flex-col" style={{ background: 'var(--theme-bg-primary)', minHeight: '100%' }}>
            <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-secondary)' }}>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--font-display)' }}>Physical Inventory (Opname)</h1>
                    <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>Count history</p>
                </div>
                <button
                    onClick={openSectionDialog}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> New Inventory
                </button>
            </header>

            <main className="flex-1 overflow-auto px-8 py-6">
                <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--theme-border)', background: 'var(--theme-bg-secondary)' }}>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }}>Number</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }}>Section</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }}>Date</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }}>Status</th>
                                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }}>Notes</th>
                                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--theme-border)', background: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counts.map(session => (
                                <tr key={session.id} className="transition-colors" style={{ cursor: 'pointer' }} onMouseOver={e => (e.currentTarget.style.background = 'var(--theme-bg-tertiary)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td className="p-4 font-medium" style={{ borderBottom: '1px solid var(--theme-border)', color: 'var(--theme-text-primary)' }}>{session.count_number ?? ''}</td>
                                    <td className="p-4" style={{ borderBottom: '1px solid var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                                        {session.section ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(201, 165, 92, 0.1)', color: 'var(--color-gold)', border: '1px solid rgba(201, 165, 92, 0.2)' }}>
                                                {session.section.name}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--theme-text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td className="p-4" style={{ borderBottom: '1px solid var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                                        {session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}
                                    </td>
                                    <td className="p-4" style={{ borderBottom: '1px solid var(--theme-border)' }}>
                                        <StatusBadge status={session.status ?? 'draft'} />
                                    </td>
                                    <td className="p-4 italic" style={{ borderBottom: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                                        {session.notes || '-'}
                                    </td>
                                    <td className="p-4 text-right" style={{ borderBottom: '1px solid var(--theme-border)' }}>
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
                                    <td colSpan={6} className="p-8 text-center" style={{ color: 'var(--theme-text-muted)' }}>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-full max-w-md mx-4 rounded-lg" style={{ background: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
                        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--theme-border)' }}>
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--font-display)' }}>Select Section</h2>
                            <button
                                onClick={() => setShowSectionDialog(false)}
                                className="p-1 rounded-full transition-colors"
                                style={{ color: 'var(--theme-text-muted)' }}
                                onMouseOver={e => (e.currentTarget.style.background = 'var(--theme-bg-tertiary)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm mb-4" style={{ color: 'var(--theme-text-secondary)' }}>
                                Choose the section for which you want to perform the inventory count.
                            </p>
                            {sectionsLoading ? (
                                <div className="py-4 text-center" style={{ color: 'var(--theme-text-muted)' }}>Loading sections...</div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {sections.map(section => (
                                        <label
                                            key={section.id}
                                            className="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                                            style={{
                                                border: selectedSection === section.id
                                                    ? '2px solid var(--color-gold)'
                                                    : '1px solid var(--theme-border)',
                                                background: selectedSection === section.id
                                                    ? 'rgba(201, 165, 92, 0.1)'
                                                    : 'var(--theme-bg-tertiary)',
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="section"
                                                value={section.id}
                                                checked={selectedSection === section.id}
                                                onChange={() => setSelectedSection(section.id)}
                                                className="mr-3"
                                                style={{ accentColor: 'var(--color-gold)' }}
                                            />
                                            <div>
                                                <div className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{section.name}</div>
                                                {section.description && (
                                                    <div className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{section.description}</div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                    {sections.length === 0 && (
                                        <p className="py-4 text-center" style={{ color: 'var(--theme-text-muted)' }}>
                                            No sections available. Please create sections first.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 p-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
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
            return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(201, 165, 92, 0.1)', color: 'var(--color-gold)', border: '1px solid rgba(201, 165, 92, 0.2)' }}><Clock size={12} /> Draft</span>
        case 'completed':
            return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)' }}><CheckCircle size={12} /> Validated</span>
        case 'cancelled':
            return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', border: '1px solid var(--color-danger-border)' }}><XCircle size={12} /> Cancelled</span>
        default:
            return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
}
