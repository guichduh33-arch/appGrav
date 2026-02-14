interface Supplier {
    name: string
    contact_person: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    postal_code: string | null
    country: string | null
    tax_id: string | null
    payment_terms: string | null
    notes: string | null
    is_active: boolean
}

interface ISupplierFormModalProps {
    isEditing: boolean
    formData: Partial<Supplier>
    onFormChange: (data: Partial<Supplier>) => void
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
}

export function SupplierFormModal({
    isEditing,
    formData,
    onFormChange,
    onSubmit,
    onClose,
}: ISupplierFormModalProps) {
    const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all"
    const labelClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[var(--onyx-surface)] border border-white/10 rounded-xl w-[700px] max-w-[90vw] max-h-[85vh] shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/5 shrink-0">
                    <h2 className="text-lg font-bold text-white">
                        {isEditing ? 'Edit Supplier' : 'New Supplier'}
                    </h2>
                </div>

                <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]/60 mb-4">
                                    Contact Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                    <div className="flex flex-col gap-1.5 col-span-full">
                                        <label className={labelClass}>Supplier Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => onFormChange({ ...formData, name: e.target.value })}
                                            aria-label="Supplier name"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Contact Person</label>
                                        <input
                                            type="text"
                                            value={formData.contact_person || ''}
                                            onChange={e => onFormChange({ ...formData, contact_person: e.target.value })}
                                            aria-label="Contact person"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={e => onFormChange({ ...formData, email: e.target.value })}
                                            aria-label="Email"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={e => onFormChange({ ...formData, phone: e.target.value })}
                                            aria-label="Phone"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]/60 mb-4">
                                    Address
                                </h3>
                                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                    <div className="flex flex-col gap-1.5 col-span-full">
                                        <label className={labelClass}>Address</label>
                                        <input
                                            type="text"
                                            value={formData.address || ''}
                                            onChange={e => onFormChange({ ...formData, address: e.target.value })}
                                            aria-label="Address"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>City</label>
                                        <input
                                            type="text"
                                            value={formData.city || ''}
                                            onChange={e => onFormChange({ ...formData, city: e.target.value })}
                                            aria-label="City"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Postal Code</label>
                                        <input
                                            type="text"
                                            value={formData.postal_code || ''}
                                            onChange={e => onFormChange({ ...formData, postal_code: e.target.value })}
                                            aria-label="Postal Code"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Country</label>
                                        <input
                                            type="text"
                                            value={formData.country || ''}
                                            onChange={e => onFormChange({ ...formData, country: e.target.value })}
                                            aria-label="Country"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]/60 mb-4">
                                    Business Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Tax ID</label>
                                        <input
                                            type="text"
                                            value={formData.tax_id || ''}
                                            onChange={e => onFormChange({ ...formData, tax_id: e.target.value })}
                                            aria-label="Tax ID"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Payment Terms</label>
                                        <select
                                            value={formData.payment_terms || ''}
                                            onChange={e => onFormChange({ ...formData, payment_terms: e.target.value })}
                                            aria-label="Payment terms"
                                            className={inputClass}
                                        >
                                            <option value="cod" className="bg-[var(--onyx-surface)]">Cash on Delivery (COD)</option>
                                            <option value="net15" className="bg-[var(--onyx-surface)]">Net 15 days</option>
                                            <option value="net30" className="bg-[var(--onyx-surface)]">Net 30 days</option>
                                            <option value="net60" className="bg-[var(--onyx-surface)]">Net 60 days</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5 col-span-full">
                                        <label className={labelClass}>Notes</label>
                                        <textarea
                                            rows={3}
                                            value={formData.notes || ''}
                                            onChange={e => onFormChange({ ...formData, notes: e.target.value })}
                                            aria-label="Notes"
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-white font-medium">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={e => onFormChange({ ...formData, is_active: e.target.checked })}
                                                className="w-4 h-4 rounded border-white/20 bg-black/40 text-[var(--color-gold)] focus:ring-[var(--color-gold)]/20 cursor-pointer"
                                            />
                                            Supplier active
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            className="py-2.5 px-5 bg-transparent border border-white/10 rounded-xl text-white text-sm font-medium transition-all hover:border-white/20"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="py-2.5 px-5 bg-[var(--color-gold)] text-black font-bold text-sm rounded-xl transition-all hover:bg-[var(--color-gold)]/90"
                        >
                            {isEditing ? 'Save Changes' : 'Create Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
