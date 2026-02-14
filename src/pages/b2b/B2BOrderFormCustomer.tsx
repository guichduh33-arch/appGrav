import { User } from 'lucide-react'

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    address: string | null
    payment_terms: 'cod' | 'net15' | 'net30' | 'net60' | null
    customer_type: 'retail' | 'wholesale'
}

interface B2BOrderFormCustomerProps {
    customers: Customer[]
    selectedCustomer: Customer | null
    customerId: string
    onCustomerChange: (id: string) => void
}

export default function B2BOrderFormCustomer({
    customers,
    selectedCustomer,
    customerId,
    onCustomerChange,
}: B2BOrderFormCustomerProps) {
    return (
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
                <User size={20} className="text-[var(--color-gold)]" />
                Customer
            </h2>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                <div className="col-span-full space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">B2B Customer *</label>
                    <select
                        value={customerId}
                        onChange={(e) => onCustomerChange(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                    >
                        <option value="">Select a customer...</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.company_name || customer.name}
                                {customer.company_name && ` (${customer.name})`}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedCustomer && (
                    <div className="col-span-full flex flex-wrap gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl mt-2">
                        <div className="flex gap-2 text-sm">
                            <span className="text-[var(--theme-text-muted)]">Contact:</span>
                            <span className="text-white">{selectedCustomer.name}</span>
                        </div>
                        {selectedCustomer.phone && (
                            <div className="flex gap-2 text-sm">
                                <span className="text-[var(--theme-text-muted)]">Phone:</span>
                                <span className="text-white">{selectedCustomer.phone}</span>
                            </div>
                        )}
                        {selectedCustomer.email && (
                            <div className="flex gap-2 text-sm">
                                <span className="text-[var(--theme-text-muted)]">Email:</span>
                                <span className="text-white">{selectedCustomer.email}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
