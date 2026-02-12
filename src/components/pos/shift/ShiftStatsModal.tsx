import { useRef, useEffect } from 'react'
import {
    X, PieChart, Banknote, CreditCard, Smartphone,
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-sh-fade-in">
            <div
                className="w-full max-w-[560px] max-h-[90vh] bg-[#1a1714] rounded-3xl border border-white/[0.08] overflow-hidden flex flex-col shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_100px_rgba(212,165,116,0.15)] animate-sh-slide-up max-[480px]:max-h-screen max-[480px]:rounded-none"
                ref={modalRef}
            >
                {/* Header */}
                <header className="flex items-center justify-between py-5 px-6 border-b border-white/[0.08] bg-[#252220]">
                    <div className="flex items-center gap-4">
                        <PieChart className="w-11 h-11 p-2.5 bg-gradient-to-br from-[#d4a574] to-[#b8864c] rounded-xl text-[#1a1714] shadow-[0_4px_12px_rgba(212,165,116,0.15)]" />
                        <div>
                            <h2 className="font-fraunces text-[1.35rem] font-semibold text-[#faf8f5] m-0">
                                Shift Statistics
                            </h2>
                            <p className="text-[0.8rem] text-[#a8a29e] mt-0.5 mb-0">
                                #{session.session_number} - Started {formatTime(session.opened_at)}
                            </p>
                        </div>
                    </div>
                    <button
                        className="w-11 h-11 flex items-center justify-center bg-[#2d2a27] border border-white/[0.08] rounded-xl text-[#a8a29e] cursor-pointer transition-all duration-200 hover:bg-[#1a1714] hover:text-[#faf8f5] hover:scale-105"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#2d2a27] scrollbar-track-transparent">
                    {/* Hero Stats */}
                    <div className="mb-6">
                        {/* Primary hero card */}
                        <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#252220] to-[#2d2a27] rounded-2xl border border-white/[0.08] mb-3 relative overflow-hidden">
                            {/* Accent glow */}
                            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[radial-gradient(circle,rgba(212,165,116,0.15)_0%,transparent_70%)] pointer-events-none" />
                            <div className="w-14 h-14 flex items-center justify-center bg-[rgba(212,165,116,0.15)] rounded-[14px] text-[#d4a574]">
                                <Banknote size={24} />
                            </div>
                            <div className="flex-1">
                                <span className="block text-[0.85rem] text-[#a8a29e] uppercase tracking-[0.08em] mb-1">
                                    Total Sales
                                </span>
                                <span className="font-fraunces text-[2.5rem] font-bold text-[#faf8f5] tracking-tight max-[480px]:text-[2rem]">
                                    {formatCurrency(stats.totalSales)}
                                </span>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-2">
                            <div className="flex items-center gap-3 p-4 px-5 bg-[#252220] rounded-2xl border border-white/[0.08]">
                                <ShoppingBag size={20} className="text-[#d4a574] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="font-fraunces text-xl font-semibold text-[#faf8f5] leading-none max-[480px]:text-[1.1rem]">
                                        {stats.transactionCount}
                                    </span>
                                    <span className="text-[0.7rem] text-[#a8a29e]">Transactions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 px-5 bg-[#252220] rounded-2xl border border-white/[0.08]">
                                <TrendingUp size={20} className="text-[#d4a574] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="font-fraunces text-xl font-semibold text-[#faf8f5] leading-none max-[480px]:text-[1.1rem]">
                                        {formatCurrency(avgTransaction)}
                                    </span>
                                    <span className="text-[0.7rem] text-[#a8a29e]">Average Ticket</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 px-5 bg-[#252220] rounded-2xl border border-white/[0.08]">
                                <Timer size={20} className="text-[#d4a574] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="font-fraunces text-xl font-semibold text-[#faf8f5] leading-none max-[480px]:text-[1.1rem]">
                                        {formatDuration(stats.duration)}
                                    </span>
                                    <span className="text-[0.7rem] text-[#a8a29e]">Duration</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 px-5 bg-[#252220] rounded-2xl border border-white/[0.08]">
                                <Wallet size={20} className="text-[#d4a574] shrink-0" />
                                <div className="flex flex-col gap-px">
                                    <span className="font-fraunces text-xl font-semibold text-[#faf8f5] leading-none max-[480px]:text-[1.1rem]">
                                        {formatCurrency(session.opening_cash)}
                                    </span>
                                    <span className="text-[0.7rem] text-[#a8a29e]">Opening cash</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <section className="mb-6">
                        <h3 className="text-[0.8rem] font-medium text-[#a8a29e] uppercase tracking-[0.08em] mb-4">
                            Payment Breakdown
                        </h3>

                        <div className="flex flex-col gap-3">
                            {/* Cash */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 px-5 bg-[#252220] rounded-[14px] border border-white/[0.08] relative overflow-hidden">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-500 text-white">
                                    <Banknote size={20} />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <span className="font-medium text-[#faf8f5]">Cash</span>
                                    <span className="font-fraunces text-[1.1rem] font-semibold text-[#e8c49a]">
                                        {formatCurrency(stats.cashTotal)}
                                    </span>
                                </div>
                                <span className="text-[0.9rem] font-medium text-[#a8a29e] min-w-[40px] text-right">
                                    {cashPercent.toFixed(0)}%
                                </span>
                                <div
                                    className="absolute bottom-0 left-0 h-[3px] bg-emerald-500 transition-[width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{ width: `${cashPercent}%` }}
                                />
                            </div>

                            {/* QRIS */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 px-5 bg-[#252220] rounded-[14px] border border-white/[0.08] relative overflow-hidden">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-500 text-white">
                                    <Smartphone size={20} />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <span className="font-medium text-[#faf8f5]">QRIS</span>
                                    <span className="font-fraunces text-[1.1rem] font-semibold text-[#e8c49a]">
                                        {formatCurrency(stats.qrisTotal)}
                                    </span>
                                </div>
                                <span className="text-[0.9rem] font-medium text-[#a8a29e] min-w-[40px] text-right">
                                    {qrisPercent.toFixed(0)}%
                                </span>
                                <div
                                    className="absolute bottom-0 left-0 h-[3px] bg-amber-500 transition-[width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{ width: `${qrisPercent}%` }}
                                />
                            </div>

                            {/* EDC */}
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 px-5 bg-[#252220] rounded-[14px] border border-white/[0.08] relative overflow-hidden">
                                <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-500 text-white">
                                    <CreditCard size={20} />
                                </div>
                                <div className="flex flex-col gap-px">
                                    <span className="font-medium text-[#faf8f5]">EDC/Carte</span>
                                    <span className="font-fraunces text-[1.1rem] font-semibold text-[#e8c49a]">
                                        {formatCurrency(stats.edcTotal)}
                                    </span>
                                </div>
                                <span className="text-[0.9rem] font-medium text-[#a8a29e] min-w-[40px] text-right">
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
                            <h3 className="text-[0.8rem] font-medium text-[#a8a29e] uppercase tracking-[0.08em] mb-4">
                                Hourly Sales
                            </h3>
                            <div className="flex items-end gap-2 h-[120px] p-4 bg-[#252220] rounded-[14px] border border-white/[0.08]">
                                {Array.from(hourlyData.entries())
                                    .sort((a, b) => a[0] - b[0])
                                    .map(([hour, amount]) => (
                                        <div key={hour} className="flex-1 flex flex-col items-center h-full relative">
                                            <div
                                                className="w-full max-w-6 bg-gradient-to-b from-[#d4a574] to-[#b8864c] rounded-t mt-auto min-h-1 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                                style={{ height: `${(amount / maxHourly) * 100}%` }}
                                            />
                                            <span className="absolute -bottom-5 text-[0.65rem] text-[#78716c]">
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
                            <h3 className="text-[0.8rem] font-medium text-[#a8a29e] uppercase tracking-[0.08em] mb-4">
                                Recent Transactions
                            </h3>
                            <div className="flex flex-col gap-2">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-3.5 px-4 bg-[#252220] rounded-xl border border-white/[0.08]">
                                        <div className="flex flex-col gap-px">
                                            <span className="font-medium text-[#faf8f5] text-[0.9rem]">
                                                {tx.order_number}
                                            </span>
                                            <span className="text-[0.75rem] text-[#78716c]">
                                                {formatTime(tx.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-px">
                                            <span className="text-[0.75rem] text-[#a8a29e] capitalize">
                                                {tx.payment_method}
                                            </span>
                                            <span className="font-fraunces font-semibold text-[#e8c49a]">
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
