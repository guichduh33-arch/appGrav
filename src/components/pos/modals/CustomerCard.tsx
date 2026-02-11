import { QrCode, Star, Check, Heart, History } from 'lucide-react'
import { TIER_COLORS, TIER_DISCOUNTS } from '@/constants/loyalty'
import { ICustomerSearchCustomer, getCategoryIcon } from './customerSearchTypes'

interface CustomerCardProps {
    customer: ICustomerSearchCustomer
    selectedCustomerId?: string | null
    isFavorite: boolean
    isOnline: boolean
    showFavoriteButton?: boolean
    onSelect: (customer: ICustomerSearchCustomer) => void
    onToggleFavorite: (customerId: string) => void
    onShowDetail: (customer: ICustomerSearchCustomer) => void
}

export default function CustomerCard({
    customer,
    selectedCustomerId,
    isFavorite,
    isOnline,
    showFavoriteButton = true,
    onSelect,
    onToggleFavorite,
    onShowDetail,
}: CustomerCardProps) {
    const CategoryIcon = getCategoryIcon(customer.category?.slug)

    return (
        <div
            className={`customer-item ${selectedCustomerId === customer.id ? 'selected' : ''}`}
        >
            <div
                className="customer-item__avatar"
                style={{
                    backgroundColor: customer.category?.color || TIER_COLORS[customer.loyalty_tier] || '#6366f1'
                }}
                onClick={() => onSelect(customer)}
            >
                {(customer.company_name || customer.name)[0].toUpperCase()}
            </div>

            <div className="customer-item__info" onClick={() => onSelect(customer)}>
                <div className="customer-item__name">
                    {customer.company_name || customer.name}
                    {selectedCustomerId === customer.id && (
                        <Check size={16} className="check-icon" />
                    )}
                </div>
                {customer.company_name && (
                    <span className="customer-item__contact">{customer.name}</span>
                )}
                <div className="customer-item__details">
                    {customer.phone && <span>{customer.phone}</span>}
                    {customer.membership_number && (
                        <span className="member-number">
                            <QrCode size={10} />
                            {customer.membership_number}
                        </span>
                    )}
                </div>
            </div>

            <div className="customer-item__meta">
                {customer.category && (
                    <span
                        className="category-tag"
                        style={{ backgroundColor: customer.category.color }}
                    >
                        <CategoryIcon size={12} />
                        {customer.category.name}
                    </span>
                )}
                <div className="loyalty-info">
                    <span
                        className="tier-badge"
                        style={{ backgroundColor: TIER_COLORS[customer.loyalty_tier] }}
                    >
                        <Star size={10} />
                        {customer.loyalty_tier}
                    </span>
                    <span className="points">
                        {customer.loyalty_points.toLocaleString()} pts
                    </span>
                </div>
                {(customer.category?.discount_percentage ?? TIER_DISCOUNTS[customer.loyalty_tier]) > 0 && (
                    <span className="discount-badge">
                        -{customer.category?.discount_percentage || TIER_DISCOUNTS[customer.loyalty_tier]}%
                    </span>
                )}
            </div>

            <div className="customer-item__actions-right">
                {showFavoriteButton && (
                    <button
                        type="button"
                        className={`btn-favorite ${isFavorite ? 'is-favorite' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(customer.id)
                        }}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                )}
                {isOnline && (
                    <button
                        type="button"
                        className="btn-history"
                        onClick={(e) => {
                            e.stopPropagation()
                            onShowDetail(customer)
                        }}
                        title="View history"
                    >
                        <History size={16} />
                    </button>
                )}
            </div>
        </div>
    )
}
