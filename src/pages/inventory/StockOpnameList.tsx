
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

    if (loading) return <div className="flex h-screen flex-col bg-gray-50"><div className="p-8 text-center text-gray-500">Loading...</div></div>

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900">Physical Inventory (Opname)</h1>
                    <p className="flex items-center gap-2 text-sm text-gray-500">Count history</p>
                </div>
                <button
                    onClick={openSectionDialog}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> New Inventory
                </button>
            </header>

            <main className="flex-1 overflow-auto px-8 py-6">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-600">Number</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-600">Section</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-600">Date</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-left text-sm font-semibold text-gray-600">Notes</th>
                                <th className="border-b border-gray-200 bg-gray-50 p-4 text-right text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counts.map(session => (
                                <tr key={session.id} className="hover:bg-gray-50">
                                    <td className="border-b border-gray-100 p-4 font-medium text-gray-700">{session.count_number ?? ''}</td>
                                    <td className="border-b border-gray-100 p-4 text-gray-700">
                                        {session.section ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {session.section.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="border-b border-gray-100 p-4 text-gray-700">
                                        {session.created_at ? new Date(session.created_at).toLocaleDateString() : ''}
                                    </td>
                                    <td className="border-b border-gray-100 p-4 text-gray-700">
                                        <StatusBadge status={session.status ?? 'draft'} />
                                    </td>
                                    <td className="border-b border-gray-100 p-4 italic text-muted-foreground">
                                        {session.notes || '-'}
                                    </td>
                                    <td className="border-b border-gray-100 p-4 text-right">
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
            return <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary"><Clock size={12} /> Draft</span>
        case 'completed':
            return <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-success"><CheckCircle size={12} /> Validated</span>
        case 'cancelled':
            return <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-destructive"><XCircle size={12} /> Cancelled</span>
        default:
            return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{status}</span>
    }
}
