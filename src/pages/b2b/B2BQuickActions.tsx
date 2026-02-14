import { useNavigate } from 'react-router-dom'
import { FileText, CreditCard, Plus, ArrowRight } from 'lucide-react'

export default function B2BQuickActions() {
    const navigate = useNavigate()

    const actions = [
        {
            icon: FileText,
            title: 'B2B Orders',
            description: 'Manage all wholesale orders',
            onClick: () => navigate('/b2b/orders'),
        },
        {
            icon: CreditCard,
            title: 'Payments',
            description: 'Track collections and outstanding balances',
            onClick: () => navigate('/b2b/payments'),
        },
        {
            icon: Plus,
            title: 'New Order',
            description: 'Create a B2B order',
            onClick: () => navigate('/b2b/orders/new'),
        },
    ]

    return (
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4 mb-10">
            {actions.map((action, i) => (
                <div
                    key={i}
                    className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all hover:border-[var(--color-gold)]/30"
                    onClick={action.onClick}
                >
                    <div className="w-12 h-12 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl flex items-center justify-center shrink-0">
                        <action.icon size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-0.5">{action.title}</h3>
                        <p className="text-sm text-[var(--theme-text-muted)]">{action.description}</p>
                    </div>
                    <ArrowRight size={20} className="text-[var(--theme-text-muted)]" />
                </div>
            ))}
        </div>
    )
}
