import { useState } from 'react'
import { X, Clock, RotateCcw, Trash2 } from 'lucide-react'
import { useOrderStore } from '../../../stores/orderStore'
import { formatPrice } from '../../../utils/helpers'
import PinVerificationModal from './PinVerificationModal'

interface HeldOrdersModalProps {
    onClose: () => void
    onRestore: (heldOrderId: string) => void
}

export default function HeldOrdersModal({ onClose, onRestore }: HeldOrdersModalProps) {
    const { heldOrders, removeHeldOrder } = useOrderStore()
    const [showPinModal, setShowPinModal] = useState(false)
    const [pendingDeleteOrderId, setPendingDeleteOrderId] = useState<string | null>(null)

    const formatHeldTime = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
                        Held Orders ({heldOrders.length})
                    </h3>
                    <button className="modal__close" onClick={onClose} title="Close" aria-label="Close">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {heldOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
                            <Clock size={48} opacity={0.3} />
                            <p className="mt-4 text-sm">No orders on hold</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                            {heldOrders.map((order) => (
                                <div key={order.id} className="bg-[var(--color-gray-900)] border border-[var(--color-gray-600)] rounded-lg p-4 transition-all duration-fast hover:border-gold hover:shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-lg font-bold text-gold">{order.orderNumber}</span>
                                            <span className="text-xs text-[var(--color-gray-400)] uppercase">
                                                {order.orderType === 'dine_in' ? 'Dine In' :
                                                    order.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                                                {order.tableNumber && ` - Table ${order.tableNumber}`}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-sm text-[var(--color-gray-400)] bg-[rgba(251,191,36,0.1)] px-2 py-1 rounded">
                                            <Clock size={14} />
                                            {formatHeldTime(order.heldAt)}
                                        </span>
                                    </div>

                                    <div className="py-2 border-t border-b border-dashed border-[var(--color-gray-600)] my-2">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1 py-1 text-sm">
                                                <span className="text-[var(--color-gray-400)] min-w-[24px]">{item.quantity}x</span>
                                                <span className="text-white">
                                                    {item.type === 'combo' ? item.combo?.name : item.product?.name}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="flex items-center gap-1 py-1 text-xs text-[var(--color-gray-500)] italic">
                                                +{order.items.length - 3} more items
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gold">
                                            {formatPrice(order.total)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteClick(order.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => onRestore(order.id)}
                                            >
                                                <RotateCcw size={16} />
                                                Resume
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
                    title="Delete Order"
                    message="Admin PIN required to delete this order"
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
