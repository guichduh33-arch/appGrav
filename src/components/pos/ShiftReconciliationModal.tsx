import { useTranslation } from 'react-i18next'
import { X, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Banknote, QrCode, CreditCard } from 'lucide-react'
import { formatPrice } from '../../utils/helpers'
import { ReconciliationData } from '../../hooks/useShift'
import './ShiftModals.css'

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
    const { t } = useTranslation()

    const getDifferenceClass = (diff: number) => {
        if (diff > 0) return 'positive'
        if (diff < 0) return 'negative'
        return 'zero'
    }

    const getDifferenceIcon = (diff: number) => {
        if (diff > 0) return <TrendingUp size={16} />
        if (diff < 0) return <TrendingDown size={16} />
        return <Minus size={16} />
    }

    const totalExpected = reconciliation.cash.expected + reconciliation.qris.expected + reconciliation.edc.expected
    const totalActual = reconciliation.cash.actual + reconciliation.qris.actual + reconciliation.edc.actual
    const totalDifference = totalActual - totalExpected

    const hasDiscrepancy = totalDifference !== 0

    return (
        <div className="shift-modal-overlay">
            <div className="shift-modal shift-modal--reconciliation">
                <div className="shift-modal__header">
                    <div className={`shift-modal__header-icon ${hasDiscrepancy ? 'shift-modal__header-icon--warning' : 'shift-modal__header-icon--success'}`}>
                        {hasDiscrepancy ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                    </div>
                    <div>
                        <h2 className="shift-modal__title">
                            {t('shift.reconciliation_title', 'Réconciliation du Shift')}
                        </h2>
                        <p className="shift-modal__subtitle">
                            {hasDiscrepancy
                                ? t('shift.reconciliation_discrepancy', 'Des écarts ont été détectés')
                                : t('shift.reconciliation_success', 'Tous les montants correspondent')
                            }
                        </p>
                    </div>
                    <button className="shift-modal__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="shift-modal__content">
                    {/* Summary Stats */}
                    <div className="reconciliation-stats">
                        <div className="reconciliation-stats__item">
                            <span className="reconciliation-stats__label">{t('shift.total_sales', 'Ventes totales')}</span>
                            <span className="reconciliation-stats__value">{formatPrice(totalSales)}</span>
                        </div>
                        <div className="reconciliation-stats__item">
                            <span className="reconciliation-stats__label">{t('shift.transactions', 'Transactions')}</span>
                            <span className="reconciliation-stats__value">{transactionCount}</span>
                        </div>
                    </div>

                    {/* Reconciliation Table */}
                    <div className="reconciliation-table">
                        <div className="reconciliation-table__header">
                            <span>{t('shift.payment_type', 'Type')}</span>
                            <span>{t('shift.expected', 'Attendu')}</span>
                            <span>{t('shift.actual', 'Réel')}</span>
                            <span>{t('shift.difference', 'Écart')}</span>
                        </div>

                        {/* Cash Row */}
                        <div className="reconciliation-table__row">
                            <div className="reconciliation-table__type">
                                <Banknote size={18} className="reconciliation-table__icon reconciliation-table__icon--cash" />
                                <span>Cash</span>
                            </div>
                            <span className="reconciliation-table__amount">{formatPrice(reconciliation.cash.expected)}</span>
                            <span className="reconciliation-table__amount">{formatPrice(reconciliation.cash.actual)}</span>
                            <span className={`reconciliation-table__diff reconciliation-table__diff--${getDifferenceClass(reconciliation.cash.difference)}`}>
                                {getDifferenceIcon(reconciliation.cash.difference)}
                                {formatPrice(Math.abs(reconciliation.cash.difference))}
                            </span>
                        </div>

                        {/* QRIS Row */}
                        <div className="reconciliation-table__row">
                            <div className="reconciliation-table__type">
                                <QrCode size={18} className="reconciliation-table__icon reconciliation-table__icon--qris" />
                                <span>QRIS</span>
                            </div>
                            <span className="reconciliation-table__amount">{formatPrice(reconciliation.qris.expected)}</span>
                            <span className="reconciliation-table__amount">{formatPrice(reconciliation.qris.actual)}</span>
                            <span className={`reconciliation-table__diff reconciliation-table__diff--${getDifferenceClass(reconciliation.qris.difference)}`}>
                                {getDifferenceIcon(reconciliation.qris.difference)}
                                {formatPrice(Math.abs(reconciliation.qris.difference))}
                            </span>
                        </div>

                        {/* EDC Row */}
                        <div className="reconciliation-table__row">
                            <div className="reconciliation-table__type">
                                <CreditCard size={18} className="reconciliation-table__icon reconciliation-table__icon--edc" />
                                <span>EDC/Carte</span>
                            </div>
                            <span className="reconciliation-table__amount">{formatPrice(reconciliation.edc.expected)}</span>
                            <span className="reconciliation-table__amount">{formatPrice(reconciliation.edc.actual)}</span>
                            <span className={`reconciliation-table__diff reconciliation-table__diff--${getDifferenceClass(reconciliation.edc.difference)}`}>
                                {getDifferenceIcon(reconciliation.edc.difference)}
                                {formatPrice(Math.abs(reconciliation.edc.difference))}
                            </span>
                        </div>

                        {/* Total Row */}
                        <div className="reconciliation-table__row reconciliation-table__row--total">
                            <div className="reconciliation-table__type">
                                <span className="reconciliation-table__total-label">{t('shift.total', 'TOTAL')}</span>
                            </div>
                            <span className="reconciliation-table__amount reconciliation-table__amount--total">{formatPrice(totalExpected)}</span>
                            <span className="reconciliation-table__amount reconciliation-table__amount--total">{formatPrice(totalActual)}</span>
                            <span className={`reconciliation-table__diff reconciliation-table__diff--total reconciliation-table__diff--${getDifferenceClass(totalDifference)}`}>
                                {getDifferenceIcon(totalDifference)}
                                {formatPrice(Math.abs(totalDifference))}
                            </span>
                        </div>
                    </div>

                    {/* Warning if discrepancy */}
                    {hasDiscrepancy && (
                        <div className={`reconciliation-alert reconciliation-alert--${totalDifference > 0 ? 'positive' : 'negative'}`}>
                            <AlertTriangle size={20} />
                            <div>
                                <strong>
                                    {totalDifference > 0
                                        ? t('shift.surplus_detected', 'Surplus détecté')
                                        : t('shift.shortage_detected', 'Manque détecté')
                                    }
                                </strong>
                                <p>
                                    {totalDifference > 0
                                        ? t('shift.surplus_message', 'Le montant réel est supérieur au montant attendu.')
                                        : t('shift.shortage_message', 'Le montant réel est inférieur au montant attendu.')
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="shift-modal__actions">
                        <button
                            type="button"
                            className="shift-btn shift-btn--primary shift-btn--full"
                            onClick={onClose}
                        >
                            <CheckCircle size={18} />
                            {t('shift.understood', 'Compris')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
