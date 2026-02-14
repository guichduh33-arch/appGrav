import { useNavigate } from 'react-router-dom'
import { Building2, Eye, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '../../utils/helpers'

interface Customer {
    id: string
    name: string
    company_name: string | null
    phone: string | null
    email: string | null
    customer_type: string
    total_spent: number
    total_visits: number
    is_active: boolean
}

interface B2BClientsListProps {
    customers: Customer[]
    loading: boolean
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function B2BClientsList({ customers, loading }: B2BClientsListProps) {
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16 text-[var(--theme-text-muted)]">
                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
            </div>
        )
    }

    if (customers.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center p-16 text-center bg-[var(--onyx-surface)] border border-white/5 rounded-xl">
                <Building2 size={48} className="text-[var(--theme-text-muted)] opacity-30 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No B2B clients</h3>
                <p className="text-[var(--theme-text-muted)] text-sm mb-6">Add wholesale clients in the Clients section</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {customers.map(customer => (
                <div key={customer.id} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 transition-all hover:border-white/10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center font-bold text-lg">
                            {getInitials(customer.company_name || customer.name)}
                        </div>
                        <span className={cn(
                            'inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase border',
                            customer.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                            {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{customer.company_name || customer.name}</h3>
                    <p className="text-sm text-[var(--theme-text-muted)] mb-4">
                        {customer.company_name ? customer.name : ''} {customer.phone ? `\u2022 ${customer.phone}` : ''}
                    </p>

                    <div className="flex gap-6 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold text-white">{customer.total_visits}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Orders</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[var(--color-gold)]">
                                {formatCurrency(customer.total_spent)}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Revenue</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-transparent border border-white/10 text-white rounded-xl text-sm font-medium transition-colors hover:border-white/20"
                            onClick={() => navigate(`/b2b/orders?customer=${customer.id}`)}
                        >
                            <Eye size={16} />
                            View
                        </button>
                        <button
                            type="button"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110"
                            onClick={() => navigate('/b2b/orders/new')}
                        >
                            <Plus size={16} />
                            Order
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
