import { Edit2, Trash2, Mail, Phone, MapPin, CheckCircle, XCircle, Building2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Supplier {
    id: string
    name: string
    is_active: boolean
    contact_person: string | null
    email: string | null
    phone: string | null
    city: string | null
    country: string | null
    payment_terms: string | null
    category: string | null
}

interface ISupplierCardProps {
    supplier: Supplier
    onEdit: () => void
    onDelete: () => void
    onToggleActive: () => void
}

const formatPaymentTerms = (term: string | null): string => {
    if (!term) return ''
    const termMap: Record<string, string> = {
        'cod': 'Cash on Delivery (COD)',
        'net15': 'Net 15 days',
        'net30': 'Net 30 days',
        'net60': 'Net 60 days'
    }
    return termMap[term] || term
}

export function SupplierCard({ supplier, onEdit, onDelete, onToggleActive }: ISupplierCardProps) {
    return (
        <div
            className={cn(
                "bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 transition-all duration-200 hover:border-[var(--color-gold)]/30 group",
                !supplier.is_active && "opacity-50 hover:opacity-70"
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center text-[var(--color-gold)]">
                        <Building2 size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{supplier.name}</h3>
                            {supplier.category && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[10px] font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                                    <Tag size={10} />
                                    {supplier.category}
                                </span>
                            )}
                        </div>
                        {supplier.contact_person && (
                            <p className="text-xs text-[var(--muted-smoke)]">{supplier.contact_person}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)]"
                        onClick={onToggleActive}
                        title={supplier.is_active ? 'Deactivate' : 'Activate'}
                        aria-label={supplier.is_active ? 'Deactivate' : 'Activate'}
                    >
                        {supplier.is_active ? <CheckCircle size={15} /> : <XCircle size={15} />}
                    </button>
                    <button
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-white/5 hover:text-[var(--color-gold)]"
                        onClick={onEdit}
                        aria-label="Edit"
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-[var(--muted-smoke)] transition-all hover:bg-red-500/10 hover:text-red-400"
                        onClick={onDelete}
                        aria-label="Delete"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2.5">
                {supplier.email && (
                    <div className="flex items-center gap-2.5 text-xs text-[var(--stone-text)]">
                        <Mail size={13} className="text-[var(--color-gold)] shrink-0" />
                        {supplier.email}
                    </div>
                )}
                {supplier.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-[var(--stone-text)]">
                        <Phone size={13} className="text-[var(--color-gold)] shrink-0" />
                        {supplier.phone}
                    </div>
                )}
                {supplier.city && (
                    <div className="flex items-center gap-2.5 text-xs text-[var(--stone-text)]">
                        <MapPin size={13} className="text-[var(--color-gold)] shrink-0" />
                        {supplier.city}, {supplier.country}
                    </div>
                )}
                {supplier.payment_terms && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-smoke)]">
                            Payment Terms
                        </span>
                        <p className="text-xs text-[var(--stone-text)] mt-0.5">
                            {formatPaymentTerms(supplier.payment_terms)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
