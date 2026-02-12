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
        if (diff > 0) return 'text-emerald-700'
        if (diff < 0) return 'text-red-600'
        return 'text-slate-500'
    }

    const totalExpected = reconciliation.cash.expected + reconciliation.qris.expected + reconciliation.edc.expected
    const totalActual = reconciliation.cash.actual + reconciliation.qris.actual + reconciliation.edc.actual
    const totalDifference = totalActual - totalExpected

    const hasDiscrepancy = totalDifference !== 0

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-[560px] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-[480px]:max-h-screen max-[480px]:rounded-none">
                <div className="flex items-start gap-4 border-b border-slate-200 p-6">
                    <div className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        hasDiscrepancy ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-700'
                    )}>
                        {hasDiscrepancy ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                    </div>
                    <div>
                        <h2 className="m-0 text-xl font-bold text-slate-900">
                            Shift Reconciliation
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {hasDiscrepancy
                                ? 'Discrepancies have been detected'
                                : 'All amounts match'
                            }
                        </p>
                    </div>
                    <button
                        className="ml-auto cursor-pointer rounded-lg border-none bg-transparent p-2 text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-500"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary Stats */}
                    <div className="mb-5 flex gap-4">
                        <div className="flex-1 rounded-xl bg-slate-50 p-4 text-center">
                            <span className="mb-1 block text-xs text-slate-500">Total sales</span>
                            <span className="text-xl font-bold text-slate-900">{formatPrice(totalSales)}</span>
                        </div>
                        <div className="flex-1 rounded-xl bg-slate-50 p-4 text-center">
                            <span className="mb-1 block text-xs text-slate-500">Transactions</span>
                            <span className="text-xl font-bold text-slate-900">{transactionCount}</span>
                        </div>
                    </div>

                    {/* Reconciliation Table */}
                    <div className="mb-4 overflow-hidden rounded-xl bg-slate-50">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 bg-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <span>Type</span>
                            <span>Expected</span>
                            <span>Actual</span>
                            <span>Variance</span>
                        </div>

                        {/* Cash Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-200 px-4 py-3 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 font-semibold text-slate-700 max-[480px]:col-span-2">
                                <Banknote size={18} className="rounded-md bg-emerald-100 p-0.5 text-emerald-700" />
                                <span>Cash</span>
                            </div>
                            <span className="text-right text-sm text-slate-700">{formatPrice(reconciliation.cash.expected)}</span>
                            <span className="text-right text-sm text-slate-700">{formatPrice(reconciliation.cash.actual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-sm font-semibold', diffColorClass(reconciliation.cash.difference))}>
                                {getDifferenceIcon(reconciliation.cash.difference)}
                                {formatPrice(Math.abs(reconciliation.cash.difference))}
                            </span>
                        </div>

                        {/* QRIS Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-200 px-4 py-3 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 font-semibold text-slate-700 max-[480px]:col-span-2">
                                <QrCode size={18} className="rounded-md bg-blue-100 p-0.5 text-blue-600" />
                                <span>QRIS</span>
                            </div>
                            <span className="text-right text-sm text-slate-700">{formatPrice(reconciliation.qris.expected)}</span>
                            <span className="text-right text-sm text-slate-700">{formatPrice(reconciliation.qris.actual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-sm font-semibold', diffColorClass(reconciliation.qris.difference))}>
                                {getDifferenceIcon(reconciliation.qris.difference)}
                                {formatPrice(Math.abs(reconciliation.qris.difference))}
                            </span>
                        </div>

                        {/* EDC Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-200 px-4 py-3 max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 font-semibold text-slate-700 max-[480px]:col-span-2">
                                <CreditCard size={18} className="rounded-md bg-purple-100 p-0.5 text-violet-600" />
                                <span>EDC/Carte</span>
                            </div>
                            <span className="text-right text-sm text-slate-700">{formatPrice(reconciliation.edc.expected)}</span>
                            <span className="text-right text-sm text-slate-700">{formatPrice(reconciliation.edc.actual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-sm font-semibold', diffColorClass(reconciliation.edc.difference))}>
                                {getDifferenceIcon(reconciliation.edc.difference)}
                                {formatPrice(Math.abs(reconciliation.edc.difference))}
                            </span>
                        </div>

                        {/* Total Row */}
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-2 bg-slate-200 px-4 py-3 font-bold max-[480px]:grid-cols-[1fr_1fr] max-[480px]:gap-y-1">
                            <div className="flex items-center gap-2 max-[480px]:col-span-2">
                                <span className="font-bold text-slate-900">TOTAL</span>
                            </div>
                            <span className="text-right text-sm font-bold text-slate-900">{formatPrice(totalExpected)}</span>
                            <span className="text-right text-sm font-bold text-slate-900">{formatPrice(totalActual)}</span>
                            <span className={cn('flex items-center justify-end gap-1 text-base font-semibold', diffColorClass(totalDifference))}>
                                {getDifferenceIcon(totalDifference)}
                                {formatPrice(Math.abs(totalDifference))}
                            </span>
                        </div>
                    </div>

                    {/* Warning if discrepancy */}
                    {hasDiscrepancy && (
                        <div className={cn(
                            'mb-4 flex gap-3 rounded-xl p-4',
                            totalDifference > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-800'
                        )}>
                            <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                            <div>
                                <strong className="mb-1 block">
                                    {totalDifference > 0
                                        ? 'Surplus detected'
                                        : 'Shortage detected'
                                    }
                                </strong>
                                <p className="m-0 text-sm opacity-90">
                                    {totalDifference > 0
                                        ? 'The actual amount is higher than expected.'
                                        : 'The actual amount is lower than expected.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-2 flex gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            className="flex w-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-700"
                            onClick={onClose}
                        >
                            <CheckCircle size={18} />
                            Understood
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
