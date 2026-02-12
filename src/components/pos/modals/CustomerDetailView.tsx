import { ChevronLeft, Check, Phone, Mail, Crown, Package, ShoppingBag, RotateCcw } from 'lucide-react'
import { formatPrice } from '../../../utils/helpers'
import { TIER_COLORS, TIER_DISCOUNTS } from '@/constants/loyalty'
import { ICustomerSearchCustomer, IOrderHistoryItem, IFrequentProduct } from './customerSearchTypes'

interface CustomerDetailViewProps {
    customer: ICustomerSearchCustomer
    orderHistory: IOrderHistoryItem[]
    frequentProducts: IFrequentProduct[]
    loadingHistory: boolean
    onBack: () => void
    onSelectCustomer: (customer: ICustomerSearchCustomer) => void
    onReorder: (order: IOrderHistoryItem) => void
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function CustomerDetailView({
    customer,
    orderHistory,
    frequentProducts,
    loadingHistory,
    onBack,
    onSelectCustomer,
    onReorder,
}: CustomerDetailViewProps) {
    return (
        <div className="flex flex-col h-full p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 border-none rounded-lg text-slate-500 text-[0.85rem] cursor-pointer transition-all duration-200 hover:bg-slate-200 hover:text-slate-800"
                    onClick={onBack}
                >
                    <ChevronLeft size={20} />
                    Back
                </button>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[0.9rem] font-medium cursor-pointer border-none transition-all duration-200 bg-indigo-500 text-white hover:not-disabled:bg-indigo-600"
                    onClick={() => onSelectCustomer(customer)}
                >
                    <Check size={16} />
                    Select
                </button>
            </div>

            <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 rounded-xl mb-4 max-[600px]:flex-col max-[600px]:items-start">
                <div
                    className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
                    style={{
                        backgroundColor: customer.category?.color || TIER_COLORS[customer.loyalty_tier] || '#6366f1'
                    }}
                >
                    {(customer.company_name || customer.name)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-[150px]">
                    <h3 className="m-0 mb-1 text-lg text-slate-800">{customer.company_name || customer.name}</h3>
                    {customer.phone && <p className="flex items-center gap-1.5 my-1 text-[0.85rem] text-slate-500"><Phone size={14} /> {customer.phone}</p>}
                    {customer.email && <p className="flex items-center gap-1.5 my-1 text-[0.85rem] text-slate-500"><Mail size={14} /> {customer.email}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 max-[600px]:w-full max-[600px]:flex-row max-[600px]:flex-wrap max-[600px]:items-center max-[600px]:justify-start">
                    <span
                        className="flex items-center gap-0.5 px-2.5 py-1 rounded text-white text-xs font-semibold capitalize"
                        style={{ backgroundColor: TIER_COLORS[customer.loyalty_tier] }}
                    >
                        <Crown size={14} />
                        {customer.loyalty_tier}
                    </span>
                    <span className="text-base font-semibold text-slate-800">
                        {customer.loyalty_points.toLocaleString()} pts
                    </span>
                    {(customer.category?.discount_percentage ?? TIER_DISCOUNTS[customer.loyalty_tier]) > 0 && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-600 rounded text-[0.8rem] font-semibold">
                            -{customer.category?.discount_percentage || TIER_DISCOUNTS[customer.loyalty_tier]}% discount
                        </span>
                    )}
                </div>
            </div>

            {loadingHistory ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span>Loading history...</span>
                </div>
            ) : (
                <>
                    {/* Frequent products (Story 7.5) */}
                    {frequentProducts.length > 0 && (
                        <div className="mb-5">
                            <h4 className="flex items-center gap-2 m-0 mb-3 text-[0.9rem] text-slate-600 font-semibold [&>svg]:text-indigo-500"><Package size={16} /> Favorite Products</h4>
                            <div className="flex flex-wrap gap-2">
                                {frequentProducts.map(product => (
                                    <div key={product.product_id} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg">
                                        <span className="text-[0.85rem] text-slate-800">{product.product_name}</span>
                                        <span className="text-xs text-indigo-500 font-semibold">x{product.times_ordered}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order history (Story 7.4) */}
                    <div className="mb-5">
                        <h4 className="flex items-center gap-2 m-0 mb-3 text-[0.9rem] text-slate-600 font-semibold [&>svg]:text-indigo-500"><ShoppingBag size={16} /> Order History</h4>
                        {orderHistory.length === 0 ? (
                            <p className="text-center text-slate-400 text-[0.85rem] py-6">No previous orders</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {orderHistory.map(order => (
                                    <div key={order.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-slate-800 text-[0.85rem]">{order.order_number}</span>
                                            <span className="flex-1 text-xs text-slate-400">{formatDate(order.created_at)}</span>
                                            <span className="font-semibold text-green-600 text-[0.85rem]">{formatPrice(order.total)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {order.items.slice(0, 3).map(item => (
                                                <span key={item.id} className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                                    {item.quantity}x {item.product_name}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && (
                                                <span className="text-xs text-slate-400 italic">
                                                    +{order.items.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 border-none rounded-md text-white text-xs font-medium cursor-pointer transition-all duration-200 w-fit hover:bg-indigo-600"
                                            onClick={() => onReorder(order)}
                                        >
                                            <RotateCcw size={14} />
                                            Reorder
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
