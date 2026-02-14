
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

    if (loading) return (
        <div className="flex flex-col min-h-full bg-[var(--theme-bg-primary)]">
            <div className="p-8 text-center text-[var(--theme-text-muted)]">Loading...</div>
        </div>
    )

    return (
        <div className="flex flex-col min-h-full bg-[var(--theme-bg-primary)]">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[var(--theme-bg-primary)]">
                <div className="flex flex-col">
                    <h1 className="font-display text-3xl text-white mb-1">Physical Inventory (Opname)</h1>
                    <p className="text-sm text-[var(--theme-text-muted)]">Review and manage recent stock counts</p>
                </div>
                <button
                    onClick={openSectionDialog}
                    className="flex items-center gap-2 bg-[var(--color-gold)] hover:brightness-110 text-black font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all uppercase text-xs tracking-widest"
                >
                    <Plus size={18} /> New Inventory
                </button>
            </header>

            {/* Table */}
            <main className="flex-1 overflow-auto p-8">
                <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Number</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Section</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)]">Notes</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted-smoke)] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {counts.map(session => (
                                <tr
                                    key={session.id}
                                    className="transition-colors hover:bg-white/[0.02] cursor-pointer"
                                >
                                    <td className="px-6 py-5 font-mono text-xs text-white/80">{session.count_number ?? ''}</td>
                                    <td className="px-6 py-5">
                                        {session.section ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                                                {session.section.name}
                                            </span>
                                        ) : (
                                            <span className="text-[var(--theme-text-muted)]">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[var(--theme-text-secondary)]">
                                        {session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={session.status ?? 'draft'} />
                                    </td>
                                    <td className="px-6 py-5 text-sm italic text-[var(--theme-text-muted)]">
                                        {session.notes || '-'}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => navigate(`/inventory/stock-opname/${session.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white/70 border border-white/10 rounded-md hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                                        >
                                            {session.status === 'draft' ? 'Continue' : 'View Details'}
                                            <ArrowRight size={14} className="text-[var(--color-gold)]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {counts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-[var(--theme-text-muted)]">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 rounded-xl bg-[var(--onyx-surface)] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]">
                        {/* Dialog Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <h2 className="font-display text-lg text-white">Select Section</h2>
                            <button
                                onClick={() => setShowSectionDialog(false)}
                                className="p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Dialog Body */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-[var(--theme-text-secondary)] mb-4">
                                Choose the section for which you want to perform the inventory count.
                            </p>
                            {sectionsLoading ? (
                                <div className="py-4 text-center text-[var(--theme-text-muted)]">Loading sections...</div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {sections.map(section => (
                                        <label
                                            key={section.id}
                                            className="flex items-center p-3 rounded-xl cursor-pointer transition-all"
                                            style={{
                                                border: selectedSection === section.id
                                                    ? '2px solid var(--color-gold)'
                                                    : '1px solid rgba(255,255,255,0.05)',
                                                background: selectedSection === section.id
                                                    ? 'rgba(201, 165, 92, 0.08)'
                                                    : 'rgba(255,255,255,0.02)',
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
                                                <div className="font-medium text-white">{section.name}</div>
                                                {section.description && (
                                                    <div className="text-sm text-[var(--theme-text-muted)]">{section.description}</div>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                    {sections.length === 0 && (
                                        <p className="py-4 text-center text-[var(--theme-text-muted)]">
                                            No sections available. Please create sections first.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dialog Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
                            <button
                                onClick={() => setShowSectionDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-white/10 rounded-lg hover:border-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createNewSession}
                                disabled={!selectedSection || creating}
                                className="px-5 py-2 text-sm font-bold text-black bg-[var(--color-gold)] rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[var(--theme-text-secondary)] border border-white/10">
                    <Clock size={12} /> Draft
                </span>
            )
        case 'completed':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)', border: '1px solid var(--color-success-border)' }}>
                    <CheckCircle size={12} /> Validated
                </span>
            )
        case 'cancelled':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', border: '1px solid var(--color-danger-border)' }}>
                    <XCircle size={12} /> Cancelled
                </span>
            )
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)]">
                    {status}
                </span>
            )
    }
}
