import { useRef, useEffect } from 'react'
import {
    X, Banknote, CreditCard, Smartphone,
    TrendingUp, ShoppingBag, Timer, Wallet
} from 'lucide-react'
import { PosSession, ShiftTransaction } from '../../../hooks/useShift'
import { formatCurrency, formatTime } from '../../../utils/helpers'

interface SessionStats {
    totalSales: number
    transactionCount: number
    cashTotal: number
    qrisTotal: number
    edcTotal: number
    duration: number
}

interface ShiftStatsModalProps {
    session: PosSession
    transactions: ShiftTransaction[]
    stats: SessionStats
    onClose: () => void
}

export default function ShiftStatsModal({ session, transactions, stats, onClose }: ShiftStatsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on backdrop click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [onClose])

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const avgTransaction = stats.transactionCount > 0
        ? stats.totalSales / stats.transactionCount
        : 0

    const totalPayments = stats.cashTotal + stats.qrisTotal + stats.edcTotal
    const cashPercent = totalPayments > 0 ? (stats.cashTotal / totalPayments) * 100 : 0
    const qrisPercent = totalPayments > 0 ? (stats.qrisTotal / totalPayments) * 100 : 0
    const edcPercent = totalPayments > 0 ? (stats.edcTotal / totalPayments) * 100 : 0

    // Get recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5)

    // Hourly distribution
    const hourlyData = new Map<number, number>()
    transactions.forEach(t => {
        const hour = new Date(t.created_at).getHours()
        hourlyData.set(hour, (hourlyData.get(hour) || 0) + t.total)
    })

    const maxHourly = Math.max(...Array.from(hourlyData.values()), 1)

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-sh-fade-in">
            <div
                className="w-full max-w-[560px] max-h-[90vh] bg-[var(--theme-bg-primary)] rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] animate-sh-slide-up max-[480px]:max-h-screen max-[480px]:rounded-none text-white"
                ref={modalRef}
            >
                {/* Header */}
                <header className="flex items-center justify-between py-5 px-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display italic font-bold text-[var(--color-gold)]">B</span>
                        <div>
                            <span className="text-sm font-bold uppercase tracking-[0.2em] block">
                                Shift Statistics
                            </span>
                            <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 mb-0">
                                #{session.session_number} - Started {formatTime(session.opened_at)}
                            </p>
                        </div>
                    </div>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer transition-colors"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Hero Stats */}
                    <div className="mb-6">
                        {/* Primary hero card */}
                        <div className="flex items-center gap-4 p-6 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5 mb-3 relative overflow-hidden">
                            {/* Accent glow */}
                            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(202,176,109,0.12)_0%,transparent_70%)] pointer-events-none" />
                            <div className="w-14 h-14 flex items-center justify-center bg-[var(--color-gold)]/10 rounded-xl text-[var(--color-gold)]">
                                <Banknote size={24} />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-1">
                                    Total Sales
                                </span>
                                <span className="text-[2.5rem] font-bold text-[var(--color-gold)] tracking-tight max-[480px]:text-[2rem]">
                                    {formatCurrency(stats.totalSales)}
                                </span>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-2">
                            <div className="flex items-center gap-3 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5">
                                <ShoppingBag size={20} className="text-[var(--color-gold)] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="text-xl font-semibold text-white leading-none max-[480px]:text-[1.1rem]">
                                        {stats.transactionCount}
                                    </span>
                                    <span className="text-[0.7rem] text-[var(--theme-text-muted)]">Transactions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5">
                                <TrendingUp size={20} className="text-[var(--color-gold)] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="text-xl font-semibold text-white leading-none max-[480px]:text-[1.1rem]">
                                        {formatCurrency(avgTransaction)}
                                    </span>
                                    <span className="text-[0.7rem] text-[var(--theme-text-muted)]">Average Ticket</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5">
                                <Timer size={20} className="text-[var(--color-gold)] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="text-xl font-semibold text-white leading-none max-[480px]:text-[1.1rem]">
                                        {formatDuration(stats.duration)}
                                    </span>
                                    <span className="text-[0.7rem] text-[var(--theme-text-muted)]">Duration</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5">
                                <Wallet size={20} className="text-[var(--color-gold)] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="text-xl font-semibold text-white leading-none max-[480px]:text-[1.1rem]">
                                        {formatCurrency(session.opening_cash)}
                                    </span>
                                    <span className="text-[0.7rem] text-[var(--theme-text-muted)]">Opening cash</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <section className="mb-6">
                        <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-4">
                            Payment Breakdown
                        </h3>

                        <div className="flex flex-col gap-3">
                            {/* Cash */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5 relative overflow-hidden">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-500 text-white">
                                    <Banknote size={20} />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <span className="font-medium text-white">Cash</span>
                                    <span className="text-[1.1rem] font-semibold text-[var(--color-gold)]">
                                        {formatCurrency(stats.cashTotal)}
                                    </span>
                                </div>
                                <span className="text-[0.9rem] font-medium text-[var(--theme-text-secondary)] min-w-[40px] text-right">
                                    {cashPercent.toFixed(0)}%
                                </span>
                                <div
                                    className="absolute bottom-0 left-0 h-[3px] bg-emerald-500 transition-[width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{ width: `${cashPercent}%` }}
                                />
                            </div>

                            {/* QRIS */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5 relative overflow-hidden">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-500 text-white">
                                    <Smartphone size={20} />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <span className="font-medium text-white">QRIS</span>
                                    <span className="text-[1.1rem] font-semibold text-[var(--color-gold)]">
                                        {formatCurrency(stats.qrisTotal)}
                                    </span>
                                </div>
                                <span className="text-[0.9rem] font-medium text-[var(--theme-text-secondary)] min-w-[40px] text-right">
                                    {qrisPercent.toFixed(0)}%
                                </span>
                                <div
                                    className="absolute bottom-0 left-0 h-[3px] bg-amber-500 transition-[width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{ width: `${qrisPercent}%` }}
                                />
                            </div>

                            {/* EDC */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 px-5 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5 relative overflow-hidden">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-500 text-white">
                                    <CreditCard size={20} />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <span className="font-medium text-white">EDC/Card</span>
                                    <span className="text-[1.1rem] font-semibold text-[var(--color-gold)]">
                                        {formatCurrency(stats.edcTotal)}
                                    </span>
                                </div>
                                <span className="text-[0.9rem] font-medium text-[var(--theme-text-secondary)] min-w-[40px] text-right">
                                    {edcPercent.toFixed(0)}%
                                </span>
                                <div
                                    className="absolute bottom-0 left-0 h-[3px] bg-indigo-500 transition-[width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{ width: `${edcPercent}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Hourly Distribution */}
                    {hourlyData.size > 0 && (
                        <section className="mb-6">
                            <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-4">
                                Hourly Sales
                            </h3>
                            <div className="flex items-end gap-2 h-[120px] p-4 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5">
                                {Array.from(hourlyData.entries())
                                    .sort((a, b) => a[0] - b[0])
                                    .map(([hour, amount]) => (
                                        <div key={hour} className="flex-1 flex flex-col items-center h-full relative">
                                            <div
                                                className="w-full max-w-6 bg-gradient-to-b from-[var(--color-gold)] to-[var(--color-gold)]/60 rounded-t mt-auto min-h-1 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                                style={{ height: `${(amount / maxHourly) * 100}%` }}
                                            />
                                            <span className="absolute -bottom-5 text-[0.65rem] text-[var(--theme-text-muted)]">
                                                {hour}h
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    {/* Recent Transactions */}
                    {recentTransactions.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-xs font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase mb-4">
                                Recent Transactions
                            </h3>
                            <div className="flex flex-col gap-2">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-3.5 px-4 bg-[var(--theme-bg-secondary)] rounded-lg border border-white/5">
                                        <div className="flex flex-col gap-px">
                                            <span className="font-medium text-white text-[0.9rem]">
                                                {tx.order_number}
                                            </span>
                                            <span className="text-[0.75rem] text-[var(--theme-text-muted)]">
                                                {formatTime(tx.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-px">
                                            <span className="text-[0.75rem] text-[var(--theme-text-secondary)] capitalize">
                                                {tx.payment_method}
                                            </span>
                                            <span className="font-semibold text-[var(--color-gold)]">
                                                {formatCurrency(tx.total)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
