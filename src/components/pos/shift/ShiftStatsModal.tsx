import { useRef, useEffect } from 'react'
import {
    X, PieChart, Banknote, CreditCard, Smartphone,
    TrendingUp, ShoppingBag, Timer, Wallet
} from 'lucide-react'
import { PosSession, ShiftTransaction } from '../../../hooks/useShift'
import { formatCurrency, formatTime } from '../../../utils/helpers'
import './ShiftStatsModal.css'

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
        <div className="shift-stats-overlay">
            <div className="shift-stats-modal" ref={modalRef}>
                {/* Header */}
                <header className="shift-stats__header">
                    <div className="shift-stats__title-group">
                        <PieChart className="shift-stats__icon" />
                        <div>
                            <h2>Shift Statistics</h2>
                            <p className="shift-stats__session">
                                #{session.session_number} - Started {formatTime(session.opened_at)}
                            </p>
                        </div>
                    </div>
                    <button className="shift-stats__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                {/* Content */}
                <div className="shift-stats__content">
                    {/* Hero Stats */}
                    <div className="shift-stats__hero">
                        <div className="shift-stats__hero-card shift-stats__hero-card--primary">
                            <div className="shift-stats__hero-icon">
                                <Banknote size={24} />
                            </div>
                            <div className="shift-stats__hero-content">
                                <span className="shift-stats__hero-label">
                                    Total Sales
                                </span>
                                <span className="shift-stats__hero-value">
                                    {formatCurrency(stats.totalSales)}
                                </span>
                            </div>
                        </div>

                        <div className="shift-stats__hero-grid">
                            <div className="shift-stats__hero-card">
                                <ShoppingBag size={20} />
                                <div className="shift-stats__hero-content">
                                    <span className="shift-stats__hero-value">{stats.transactionCount}</span>
                                    <span className="shift-stats__hero-label">Transactions</span>
                                </div>
                            </div>

                            <div className="shift-stats__hero-card">
                                <TrendingUp size={20} />
                                <div className="shift-stats__hero-content">
                                    <span className="shift-stats__hero-value">{formatCurrency(avgTransaction)}</span>
                                    <span className="shift-stats__hero-label">Average Ticket</span>
                                </div>
                            </div>

                            <div className="shift-stats__hero-card">
                                <Timer size={20} />
                                <div className="shift-stats__hero-content">
                                    <span className="shift-stats__hero-value">{formatDuration(stats.duration)}</span>
                                    <span className="shift-stats__hero-label">Duration</span>
                                </div>
                            </div>

                            <div className="shift-stats__hero-card">
                                <Wallet size={20} />
                                <div className="shift-stats__hero-content">
                                    <span className="shift-stats__hero-value">{formatCurrency(session.opening_cash)}</span>
                                    <span className="shift-stats__hero-label">Opening cash</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <section className="shift-stats__section">
                        <h3 className="shift-stats__section-title">
                            Payment Breakdown
                        </h3>

                        <div className="shift-stats__payments">
                            <div className="shift-stats__payment">
                                <div className="shift-stats__payment-icon shift-stats__payment-icon--cash">
                                    <Banknote size={20} />
                                </div>
                                <div className="shift-stats__payment-info">
                                    <span className="shift-stats__payment-method">Cash</span>
                                    <span className="shift-stats__payment-amount">{formatCurrency(stats.cashTotal)}</span>
                                </div>
                                <span className="shift-stats__payment-percent">{cashPercent.toFixed(0)}%</span>
                                <div
                                    className="shift-stats__payment-bar shift-stats__payment-bar--cash"
                                    style={{ width: `${cashPercent}%` }}
                                />
                            </div>

                            <div className="shift-stats__payment">
                                <div className="shift-stats__payment-icon shift-stats__payment-icon--qris">
                                    <Smartphone size={20} />
                                </div>
                                <div className="shift-stats__payment-info">
                                    <span className="shift-stats__payment-method">QRIS</span>
                                    <span className="shift-stats__payment-amount">{formatCurrency(stats.qrisTotal)}</span>
                                </div>
                                <span className="shift-stats__payment-percent">{qrisPercent.toFixed(0)}%</span>
                                <div
                                    className="shift-stats__payment-bar shift-stats__payment-bar--qris"
                                    style={{ width: `${qrisPercent}%` }}
                                />
                            </div>

                            <div className="shift-stats__payment">
                                <div className="shift-stats__payment-icon shift-stats__payment-icon--edc">
                                    <CreditCard size={20} />
                                </div>
                                <div className="shift-stats__payment-info">
                                    <span className="shift-stats__payment-method">EDC/Carte</span>
                                    <span className="shift-stats__payment-amount">{formatCurrency(stats.edcTotal)}</span>
                                </div>
                                <span className="shift-stats__payment-percent">{edcPercent.toFixed(0)}%</span>
                                <div
                                    className="shift-stats__payment-bar shift-stats__payment-bar--edc"
                                    style={{ width: `${edcPercent}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Hourly Distribution */}
                    {hourlyData.size > 0 && (
                        <section className="shift-stats__section">
                            <h3 className="shift-stats__section-title">
                                Hourly Sales
                            </h3>
                            <div className="shift-stats__chart">
                                {Array.from(hourlyData.entries())
                                    .sort((a, b) => a[0] - b[0])
                                    .map(([hour, amount]) => (
                                        <div key={hour} className="shift-stats__bar">
                                            <div
                                                className="shift-stats__bar-fill"
                                                style={{ height: `${(amount / maxHourly) * 100}%` }}
                                            />
                                            <span className="shift-stats__bar-label">{hour}h</span>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    {/* Recent Transactions */}
                    {recentTransactions.length > 0 && (
                        <section className="shift-stats__section">
                            <h3 className="shift-stats__section-title">
                                Recent Transactions
                            </h3>
                            <div className="shift-stats__transactions">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="shift-stats__transaction">
                                        <div className="shift-stats__tx-main">
                                            <span className="shift-stats__tx-number">{tx.order_number}</span>
                                            <span className="shift-stats__tx-time">{formatTime(tx.created_at)}</span>
                                        </div>
                                        <div className="shift-stats__tx-details">
                                            <span className="shift-stats__tx-method">{tx.payment_method}</span>
                                            <span className="shift-stats__tx-amount">{formatCurrency(tx.total)}</span>
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
