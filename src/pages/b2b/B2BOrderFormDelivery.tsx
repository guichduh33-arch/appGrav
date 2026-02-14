import { Calendar } from 'lucide-react'

interface FormData {
    requested_delivery_date: string
    delivery_address: string
    delivery_notes: string
    payment_terms: '' | 'cod' | 'net15' | 'net30' | 'net60'
}

interface B2BOrderFormDeliveryProps {
    formData: FormData
    onFormChange: (data: FormData) => void
}

const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none'
const labelClass = 'text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]'

export default function B2BOrderFormDelivery({ formData, onFormChange }: B2BOrderFormDeliveryProps) {
    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
                <Calendar size={20} className="text-[var(--color-gold)]" />
                Delivery
            </h2>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                <div className="space-y-1.5">
                    <label className={labelClass}>Requested delivery date</label>
                    <input
                        type="date"
                        value={formData.requested_delivery_date}
                        onChange={(e) => onFormChange({ ...formData, requested_delivery_date: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className={labelClass}>Payment terms</label>
                    <select
                        value={formData.payment_terms}
                        onChange={(e) => onFormChange({ ...formData, payment_terms: e.target.value as '' | 'cod' | 'net15' | 'net30' | 'net60' })}
                        className={inputClass}
                    >
                        <option value="">Select...</option>
                        <option value="cod">Cash on delivery</option>
                        <option value="net15">Net 15 days</option>
                        <option value="net30">Net 30 days</option>
                        <option value="net60">Net 60 days</option>
                    </select>
                </div>
                <div className="col-span-full space-y-1.5">
                    <label className={labelClass}>Delivery address</label>
                    <textarea
                        rows={2}
                        value={formData.delivery_address}
                        onChange={(e) => onFormChange({ ...formData, delivery_address: e.target.value })}
                        placeholder="Full delivery address..."
                        className={inputClass + ' resize-none'}
                    />
                </div>
                <div className="col-span-full space-y-1.5">
                    <label className={labelClass}>Delivery instructions</label>
                    <textarea
                        rows={2}
                        value={formData.delivery_notes}
                        onChange={(e) => onFormChange({ ...formData, delivery_notes: e.target.value })}
                        placeholder="Special delivery instructions..."
                        className={inputClass + ' resize-none'}
                    />
                </div>
            </div>
        </div>
    )
}
