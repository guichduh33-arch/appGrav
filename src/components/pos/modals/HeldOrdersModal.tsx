import { useState } from 'react'
import { X, Clock, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOrderStore } from '../../../stores/orderStore'
import { formatPrice } from '../../../utils/helpers'
import PinVerificationModal from './PinVerificationModal'
import './HeldOrdersModal.css'

interface HeldOrdersModalProps {
    onClose: () => void
    onRestore: (heldOrderId: string) => void
}

export default function HeldOrdersModal({ onClose, onRestore }: HeldOrdersModalProps) {
    const { t, i18n } = useTranslation()
    const { heldOrders, removeHeldOrder } = useOrderStore()
    const [showPinModal, setShowPinModal] = useState(false)
    const [pendingDeleteOrderId, setPendingDeleteOrderId] = useState<string | null>(null)

    const formatHeldTime = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleTimeString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const handleDeleteClick = (orderId: string) => {
        setPendingDeleteOrderId(orderId)
        setShowPinModal(true)
    }

    const handlePinVerify = (verified: boolean) => {
        if (verified && pendingDeleteOrderId) {
            removeHeldOrder(pendingDeleteOrderId)
        }
        setShowPinModal(false)
        setPendingDeleteOrderId(null)
    }

    return (
        <div className="modal-backdrop is-active" onClick={onClose}>
            <div className="modal modal-lg is-active" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h3 className="modal__title">
                        <Clock size={20} />
                        {t('pos.held_orders.title', { count: heldOrders.length })}
                    </h3>
                    <button className="modal__close" onClick={onClose} title={t('common.close')} aria-label={t('common.close')}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {heldOrders.length === 0 ? (
                        <div className="held-orders-empty">
                            <Clock size={48} opacity={0.3} />
                            <p>{t('pos.held_orders.empty')}</p>
                        </div>
                    ) : (
                        <div className="held-orders-list">
                            {heldOrders.map((order) => (
                                <div key={order.id} className="held-order-card">
                                    <div className="held-order-card__header">
                                        <div className="held-order-card__info">
                                            <span className="held-order-card__number">{order.orderNumber}</span>
                                            <span className="held-order-card__type">
                                                {order.orderType === 'dine_in' ? t('pos.header.dine_in') :
                                                    order.orderType === 'takeaway' ? t('pos.header.takeaway') : t('pos.header.delivery')}
                                                {order.tableNumber && ` - ${t('cart.table')} ${order.tableNumber}`}
                                            </span>
                                        </div>
                                        <span className="held-order-card__time">
                                            <Clock size={14} />
                                            {formatHeldTime(order.heldAt)}
                                        </span>
                                    </div>

                                    <div className="held-order-card__items">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="held-order-item">
                                                <span className="held-order-item__qty">{item.quantity}×</span>
                                                <span className="held-order-item__name">
                                                    {item.product.name}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="held-order-item more">
                                                {t('pos.held_orders.more_items', { count: order.items.length - 3 })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="held-order-card__footer">
                                        <span className="held-order-card__total">
                                            {formatPrice(order.total)}
                                        </span>
                                        <div className="held-order-card__actions">
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteClick(order.id)}
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => onRestore(order.id)}
                                            >
                                                <RotateCcw size={16} />
                                                {t('pos.held_orders.resume')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showPinModal && (
                <PinVerificationModal
                    title="Suppression de commande"
                    message="Code PIN administrateur requis pour supprimer cette commande"
                    allowedRoles={['admin']}
                    onVerify={handlePinVerify}
                    onClose={() => {
                        setShowPinModal(false)
                        setPendingDeleteOrderId(null)
                    }}
                />
            )}
        </div>
    )
}
