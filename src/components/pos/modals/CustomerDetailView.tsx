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
        <div className="customer-detail">
            <div className="customer-detail__header">
                <button
                    type="button"
                    className="btn-back"
                    onClick={onBack}
                >
                    <ChevronLeft size={20} />
                    Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-select-customer"
                    onClick={() => onSelectCustomer(customer)}
                >
                    <Check size={16} />
                    Select
                </button>
            </div>

            <div className="customer-detail__profile">
                <div
                    className="customer-detail__avatar"
                    style={{
                        backgroundColor: customer.category?.color || TIER_COLORS[customer.loyalty_tier] || '#6366f1'
                    }}
                >
                    {(customer.company_name || customer.name)[0].toUpperCase()}
                </div>
                <div className="customer-detail__info">
                    <h3>{customer.company_name || customer.name}</h3>
                    {customer.phone && <p><Phone size={14} /> {customer.phone}</p>}
                    {customer.email && <p><Mail size={14} /> {customer.email}</p>}
                </div>
                <div className="customer-detail__loyalty">
                    <span
                        className="tier-badge tier-badge--large"
                        style={{ backgroundColor: TIER_COLORS[customer.loyalty_tier] }}
                    >
                        <Crown size={14} />
                        {customer.loyalty_tier}
                    </span>
                    <span className="points-large">
                        {customer.loyalty_points.toLocaleString()} pts
                    </span>
                    {(customer.category?.discount_percentage ?? TIER_DISCOUNTS[customer.loyalty_tier]) > 0 && (
                        <span className="discount-badge discount-badge--large">
                            -{customer.category?.discount_percentage || TIER_DISCOUNTS[customer.loyalty_tier]}% discount
                        </span>
                    )}
                </div>
            </div>

            {loadingHistory ? (
                <div className="customer-detail__loading">
                    <div className="spinner"></div>
                    <span>Loading history...</span>
                </div>
            ) : (
                <>
                    {/* Frequent products (Story 7.5) */}
                    {frequentProducts.length > 0 && (
                        <div className="customer-detail__section">
                            <h4><Package size={16} /> Favorite Products</h4>
                            <div className="frequent-products">
                                {frequentProducts.map(product => (
                                    <div key={product.product_id} className="frequent-product">
                                        <span className="frequent-product__name">{product.product_name}</span>
                                        <span className="frequent-product__count">x{product.times_ordered}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order history (Story 7.4) */}
                    <div className="customer-detail__section">
                        <h4><ShoppingBag size={16} /> Order History</h4>
                        {orderHistory.length === 0 ? (
                            <p className="no-history">No previous orders</p>
                        ) : (
                            <div className="order-history">
                                {orderHistory.map(order => (
                                    <div key={order.id} className="order-history__item">
                                        <div className="order-history__header">
                                            <span className="order-history__number">{order.order_number}</span>
                                            <span className="order-history__date">{formatDate(order.created_at)}</span>
                                            <span className="order-history__total">{formatPrice(order.total)}</span>
                                        </div>
                                        <div className="order-history__items">
                                            {order.items.slice(0, 3).map(item => (
                                                <span key={item.id} className="order-history__product">
                                                    {item.quantity}x {item.product_name}
                                                </span>
                                            ))}
                                            {order.items.length > 3 && (
                                                <span className="order-history__more">
                                                    +{order.items.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-reorder"
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
