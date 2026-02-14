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
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[var(--theme-bg-primary)] rounded-xl text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 m-0">
                        <Clock size={20} className="text-[var(--color-gold)]" />
                        Held Orders ({heldOrders.length})
                    </h3>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer" onClick={onClose} title="Close" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {heldOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-[var(--theme-text-muted)] text-center">
                            <Clock size={48} opacity={0.3} />
                            <p className="mt-4 text-sm">No orders on hold</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                            {heldOrders.map((order) => (
                                <div key={order.id} className="bg-[var(--theme-bg-secondary)] border border-white/5 rounded-lg p-4 transition-all duration-200 hover:border-[var(--color-gold)]/30 hover:shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-lg font-bold text-[var(--color-gold)]">{order.orderNumber}</span>
                                            <span className="text-xs text-[var(--theme-text-muted)] uppercase">
                                                {order.orderType === 'dine_in' ? 'Dine In' :
                                                    order.orderType === 'takeaway' ? 'Takeaway' : 'Delivery'}
                                                {order.tableNumber && ` - Table ${order.tableNumber}`}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-sm text-[var(--theme-text-secondary)] bg-[var(--color-gold)]/10 px-2 py-1 rounded">
                                            <Clock size={14} />
                                            {formatHeldTime(order.heldAt)}
                                        </span>
                                    </div>

                                    <div className="py-2 border-t border-b border-dashed border-white/10 my-2">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-1 py-1 text-sm">
                                                <span className="text-[var(--theme-text-muted)] min-w-[24px]">{item.quantity}x</span>
                                                <span className="text-white">
                                                    {item.type === 'combo' ? item.combo?.name : item.product?.name}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="flex items-center gap-1 py-1 text-xs text-[var(--theme-text-muted)] italic">
                                                +{order.items.length - 3} more items
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-[var(--color-gold)]">
                                            {formatPrice(order.total)}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 py-2 border border-red-500/30 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-1"
                                                onClick={() => handleDeleteClick(order.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-[var(--color-gold)] rounded-lg text-black text-sm font-bold cursor-pointer hover:brightness-110 transition-all flex items-center gap-1"
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
