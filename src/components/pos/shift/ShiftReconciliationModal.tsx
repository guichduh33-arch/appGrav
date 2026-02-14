import { X, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Banknote, QrCode, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '../../../utils/helpers'
import { ReconciliationData } from '../../../hooks/useShift'

interface ShiftReconciliationModalProps {
    reconciliation: ReconciliationData
    totalSales: number
    transactionCount: number
    onClose: () => void
}

export default function ShiftReconciliationModal({
    reconciliation,
    totalSales,
    transactionCount,
    onClose
}: ShiftReconciliationModalProps) {
    const getDifferenceIcon = (diff: number) => {
        if (diff > 0) return <TrendingUp size={16} />
        if (diff < 0) return <TrendingDown size={16} />
        return <Minus size={16} />
    }

    const diffColorClass = (diff: number) => {
        if (diff > 0) return 'text-[var(--color-success-text)]'
        if (diff < 0) return 'text-[var(--color-danger-text)]'
        return 'text-[var(--theme-text-muted)]'
    }

    const totalExpected = reconciliation.cash.expected + reconciliation.qris.expected + reconciliation.edc.expected
    const totalActual = reconciliation.cash.actual + reconciliation.qris.actual + reconciliation.edc.actual
    const totalDifference = totalActual - totalExpected

    const hasDiscrepancy = totalDifference !== 0

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="flex w-full max-w-[560px] max-h-[90vh] flex-col overflow-hidden rounded-xl bg-[var(--theme-bg-primary)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-white max-[480px]:max-h-screen max-[480px]:rounded-none">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display italic font-bold text-[var(--color-gold)]">B</span>
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">Reconciliation</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-[var(--theme-text-muted)]">
                        <div className="text-right">
                            <div className="font-bold text-white">{dateStr}</div>
                            <div>{timeStr}</div>
                        </div>
                    </div>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer transition-colors"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Status Banner */}
                    <div className={cn(
                        'flex items-center gap-3 mb-6 p-4 rounded-lg border',
                        hasDiscrepancy
                            ? 'bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning-text)]'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    )}>
                        {hasDiscrepancy ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                        <span className="text-sm font-semibold">
                            {hasDiscrepancy ? 'Discrepancies have been detected' : 'All amounts match'}
                        </span>
                    </div>

                    {/* Summary Stats */}
                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-lg border border-white/5 text-center">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-1">Total Sales</span>
                            <span className="text-xl font-bold">{formatPrice(totalSales)}</span>
                        </div>
                        <div className="bg-[var(--theme-bg-secondary)] p-6 rounded-lg border border-white/5 text-center">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase block mb-1">Transactions</span>
                            <span className="text-xl font-bold">{transactionCount}</span>
                        </div>
                    </div>

                    {/* Reconciliation Table */}
                    <div className="mb-6 overflow-hidden rounded-lg border border-white/5">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 bg-[var(--theme-bg-tertiary)] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)] max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <span>Type</span>
                            <span>Expected</span>
                            <span>Actual</span>
                            <span>Variance</span>
                        </div>

                        {/* Cash Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 border-b border-white/5 bg-[var(--theme-bg-secondary)] px-4 py-3 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 font-semibold text-white max-[480px]:col-span-2">
                                <Banknote size={18} className="text-[var(--color-gold)]" />
                                <span>Cash</span>
                            </div>
                            <span className="text-right text-sm text-[var(--theme-text-secondary)]">{formatPrice(reconciliation.cash.expected)}</span>
                            <span className="text-right text-sm text-[var(--theme-text-secondary)]">{formatPrice(reconciliation.cash.actual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-sm font-semibold', diffColorClass(reconciliation.cash.difference))}>
                                {getDifferenceIcon(reconciliation.cash.difference)}
                                {formatPrice(Math.abs(reconciliation.cash.difference))}
                            </span>
                        </div>

                        {/* QRIS Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 border-b border-white/5 bg-[var(--theme-bg-secondary)] px-4 py-3 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 font-semibold text-white max-[480px]:col-span-2">
                                <QrCode size={18} className="text-[var(--color-gold)]" />
                                <span>QRIS</span>
                            </div>
                            <span className="text-right text-sm text-[var(--theme-text-secondary)]">{formatPrice(reconciliation.qris.expected)}</span>
                            <span className="text-right text-sm text-[var(--theme-text-secondary)]">{formatPrice(reconciliation.qris.actual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-sm font-semibold', diffColorClass(reconciliation.qris.difference))}>
                                {getDifferenceIcon(reconciliation.qris.difference)}
                                {formatPrice(Math.abs(reconciliation.qris.difference))}
                            </span>
                        </div>

                        {/* EDC Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 border-b border-white/5 bg-[var(--theme-bg-secondary)] px-4 py-3 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 font-semibold text-white max-[480px]:col-span-2">
                                <CreditCard size={18} className="text-[var(--color-gold)]" />
                                <span>EDC/Card</span>
                            </div>
                            <span className="text-right text-sm text-[var(--theme-text-secondary)]">{formatPrice(reconciliation.edc.expected)}</span>
                            <span className="text-right text-sm text-[var(--theme-text-secondary)]">{formatPrice(reconciliation.edc.actual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-sm font-semibold', diffColorClass(reconciliation.edc.difference))}>
                                {getDifferenceIcon(reconciliation.edc.difference)}
                                {formatPrice(Math.abs(reconciliation.edc.difference))}
                            </span>
                        </div>

                        {/* Total Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 bg-[var(--theme-bg-tertiary)] px-4 py-3 font-bold max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 max-[480px]:col-span-2">
                                <span className="font-bold text-white">TOTAL</span>
                            </div>
                            <span className="text-right text-sm font-bold">{formatPrice(totalExpected)}</span>
                            <span className="text-right text-sm font-bold">{formatPrice(totalActual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-base font-bold', diffColorClass(totalDifference))}>
                                {getDifferenceIcon(totalDifference)}
                                {formatPrice(Math.abs(totalDifference))}
                            </span>
                        </div>
                    </div>

                    {/* Warning if discrepancy */}
                    {hasDiscrepancy && (
                        <div className={cn(
                            'mb-6 flex gap-3 rounded-lg p-4 border',
                            totalDifference > 0
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        )}>
                            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                            <div>
                                <strong className="mb-1 block">
                                    {totalDifference > 0
                                        ? 'Surplus detected'
                                        : 'Shortage detected'
                                    }
                                </strong>
                                <p className="m-0 text-sm opacity-80">
                                    {totalDifference > 0
                                        ? 'The actual amount is higher than expected.'
                                        : 'The actual amount is lower than expected.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
                        <button
                            type="button"
                            className="w-full bg-[var(--color-gold)] rounded-xl text-black py-6 text-[13px] font-bold tracking-[0.25em] uppercase shadow-xl shadow-[var(--color-gold)]/10 cursor-pointer transition-all hover:brightness-110 flex items-center justify-center gap-2"
                            onClick={onClose}
                        >
                            <CheckCircle size={16} />
                            Understood
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
