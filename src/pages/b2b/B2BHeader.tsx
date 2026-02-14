import { useNavigate } from 'react-router-dom'
import { CreditCard, Plus } from 'lucide-react'

export default function B2BHeader() {
    const navigate = useNavigate()

    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="font-display text-4xl font-bold text-white">B2B / Wholesale</h1>
                <p className="text-[var(--theme-text-muted)] text-sm mt-1">Manage your wholesale customers and B2B orders</p>
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-white font-medium rounded-xl text-sm transition-colors hover:border-white/20"
                    onClick={() => navigate('/b2b/payments')}
                >
                    <CreditCard size={18} />
                    Payments
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gold)] text-black font-bold rounded-xl text-sm transition-colors hover:brightness-110"
                    onClick={() => navigate('/b2b/orders/new')}
                >
                    <Plus size={18} />
                    New Order
                </button>
            </div>
        </header>
    )
}
