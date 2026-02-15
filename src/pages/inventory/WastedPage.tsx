import { useState } from 'react'
import {
    Trash2,
    Plus,
    Search,
    Package,
    AlertTriangle,
    TrendingDown,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { logError } from '@/utils/logger'
import { formatCurrency } from '../../utils/helpers'
import { toast } from 'sonner'
import {
    useWasteRecords,
    useWasteProducts,
    useCreateWasteRecord,
    type IWasteProduct as Product,
    type TWasteDateFilter,
} from '@/hooks/inventory/useWasteRecords'
import WastageForm from './components/WastageForm'
import WastageTable from './components/WastageTable'
import './WastedPage.css'

const WASTE_REASONS = [
    { value: 'expired', label: 'Expired' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'spoiled', label: 'Spoiled' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'overproduction', label: 'Overproduction' },
    { value: 'spillage', label: 'Spillage' },
    { value: 'theft', label: 'Theft' },
    { value: 'other', label: 'Other' }
]

export default function WastedPage() {
    const { user } = useAuthStore()
    const [showModal, setShowModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState<TWasteDateFilter>('week')

    // Form state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('expired')
    const [notes, setNotes] = useState('')
    const [photoUrl, setPhotoUrl] = useState('')
    const [productSearch, setProductSearch] = useState('')

    // React Query hooks
    const { data: wasteRecords = [], isLoading } = useWasteRecords(dateFilter)
    const { data: products = [] } = useWasteProducts()
    const createWasteMutation = useCreateWasteRecord()
    const isSaving = createWasteMutation.isPending

    // Calculate stats
    const stats = {
        totalRecords: wasteRecords.length,
        totalQuantity: wasteRecords.reduce((sum, r) => sum + Math.abs(r.quantity), 0),
        totalCost: wasteRecords.reduce((sum, r) => sum + (Math.abs(r.quantity) * (r.unit_cost || 0)), 0),
        byReason: WASTE_REASONS.map(r => ({
            reason: r.value,
            count: wasteRecords.filter(wr => wr.reason?.toLowerCase().startsWith(r.label.toLowerCase())).length
        }))
    }

    // Filter records
    const filteredRecords = wasteRecords.filter(record => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase()
            return (
                record.product?.name.toLowerCase().includes(search) ||
                record.product?.sku.toLowerCase().includes(search) ||
                (record.reason?.toLowerCase().includes(search) ?? false)
            )
        }
        return true
    })

    // Filter products for dropdown
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )

    const handleSave = async () => {
        if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
            toast.error('Please select a product and enter a quantity')
            return
        }

        const qty = parseFloat(quantity)
        const currentStock = selectedProduct.current_stock ?? 0
        if (qty > currentStock) {
            toast.error('Quantity exceeds current stock')
            return
        }

        try {
            const combinedReason = `${getReasonLabel(reason)}${notes ? ': ' + notes : ''}`

            await createWasteMutation.mutateAsync({
                productId: selectedProduct.id,
                quantity: qty,
                reason: combinedReason,
                unit: selectedProduct.unit || 'pcs',
                currentStock,
                costPrice: selectedProduct.cost_price || 0,
                staffId: user?.id,
                ...(photoUrl ? { photoUrl } : {}),
            })

            toast.success('Waste recorded successfully')
            setShowModal(false)
            resetForm()
        } catch (err) {
            logError('Error saving waste:', err)
            toast.error('Error saving waste record')
        }
    }

    const resetForm = () => {
        setSelectedProduct(null)
        setQuantity('')
        setReason('expired')
        setNotes('')
        setPhotoUrl('')
        setProductSearch('')
    }

    const getReasonLabel = (reasonValue: string) => {
        const found = WASTE_REASONS.find(r => r.value === reasonValue)
        return found ? found.label : reasonValue
    }

    const dateFilterOptions: { value: TWasteDateFilter; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: '7 Days' },
        { value: 'month', label: '30 Days' },
        { value: 'all', label: 'All' },
    ]

    return (
        <div className="flex flex-col gap-6">
            {/* KPI Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--onyx-surface)] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trash2 size={64} className="text-[var(--color-gold)]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--stone-text)]/50 mb-2">
                        Total Records
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[var(--color-gold)] tabular-nums">
                            {stats.totalRecords}
                        </span>
                        <span className="text-xs text-[var(--stone-text)]/40">Entries</span>
                    </div>
                </div>
                <div className="bg-[var(--onyx-surface)] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={64} className="text-[var(--color-gold)]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--stone-text)]/50 mb-2">
                        Total Units Lost
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[var(--color-gold)] tabular-nums">
                            {stats.totalQuantity.toFixed(0)}
                        </span>
                        <span className="text-xs text-[var(--stone-text)]/40">Units</span>
                    </div>
                </div>
                <div className="bg-[var(--onyx-surface)] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={64} className="text-[var(--color-gold)]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--stone-text)]/50 mb-2">
                        Est. Financial Loss
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-[var(--color-gold)] tabular-nums">
                            {formatCurrency(stats.totalCost)}
                        </span>
                    </div>
                </div>
                <div className="bg-[var(--onyx-surface)] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={64} className="text-[var(--color-gold)]" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--stone-text)]/50 mb-2">
                        Top Waste Reason
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-[var(--color-gold)]">
                            {(() => {
                                const topReason = stats.byReason
                                    .filter(r => r.count > 0)
                                    .sort((a, b) => b.count - a.count)[0]
                                return topReason
                                    ? `${topReason.reason.charAt(0).toUpperCase() + topReason.reason.slice(1)}`
                                    : 'None'
                            })()}
                        </span>
                        {(() => {
                            const topReason = stats.byReason
                                .filter(r => r.count > 0)
                                .sort((a, b) => b.count - a.count)[0]
                            return topReason ? (
                                <span className="text-xs text-[var(--stone-text)]/40">
                                    {topReason.count} entries ({stats.totalRecords > 0 ? Math.round((topReason.count / stats.totalRecords) * 100) : 0}%)
                                </span>
                            ) : null
                        })()}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Search */}
                <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--stone-text)]/40" />
                    <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--onyx-surface)] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--stone-text)]/40"
                    />
                </div>

                {/* Date Filters */}
                <div className="flex gap-2">
                    {dateFilterOptions.map(opt => (
                        <button
                            key={opt.value}
                            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                                dateFilter === opt.value
                                    ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-black font-bold'
                                    : 'bg-transparent border-white/10 text-[var(--stone-text)]/70 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
                            }`}
                            onClick={() => setDateFilter(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Report Waste Button */}
                <button
                    className="bg-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 text-black font-bold text-[11px] px-6 py-2.5 rounded-lg shadow-lg shadow-[var(--color-gold)]/10 transition-all uppercase tracking-[0.15em] flex items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={16} />
                    Report Waste
                </button>
            </div>

            {/* Table */}
            <WastageTable
                records={filteredRecords}
                isLoading={isLoading}
            />

            {/* Add Waste Modal */}
            {showModal && (
                <WastageForm
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    reason={reason}
                    notes={notes}
                    photoUrl={photoUrl}
                    productSearch={productSearch}
                    filteredProducts={filteredProducts}
                    isSaving={isSaving}
                    onProductSearchChange={setProductSearch}
                    onSelectProduct={(product) => {
                        setSelectedProduct(product)
                        setProductSearch(product.name)
                    }}
                    onClearProduct={() => { setSelectedProduct(null); setProductSearch('') }}
                    onQuantityChange={setQuantity}
                    onReasonChange={setReason}
                    onNotesChange={setNotes}
                    onPhotoUrlChange={setPhotoUrl}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); resetForm() }}
                />
            )}
        </div>
    )
}
