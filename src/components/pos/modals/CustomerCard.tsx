import { QrCode, Star, Check, Heart, History } from 'lucide-react'
import { TIER_COLORS, TIER_DISCOUNTS } from '@/constants/loyalty'
import { ICustomerSearchCustomer, getCategoryIcon } from './customerSearchTypes'
import { cn } from '@/lib/utils'

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
    const isSelected = selectedCustomerId === customer.id

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 bg-slate-50 border-2 border-transparent rounded-[10px] cursor-pointer transition-all duration-200',
                'hover:bg-slate-100 hover:border-slate-200',
                'max-[600px]:flex-wrap',
                isSelected && 'bg-indigo-50 border-indigo-500'
            )}
        >
            <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-white font-semibold text-base shrink-0"
                style={{
                    backgroundColor: customer.category?.color || TIER_COLORS[customer.loyalty_tier] || '#6366f1'
                }}
                onClick={() => onSelect(customer)}
            >
                {(customer.company_name || customer.name)[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0" onClick={() => onSelect(customer)}>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[0.9rem]">
                    {customer.company_name || customer.name}
                    {isSelected && (
                        <Check size={16} className="text-indigo-500" />
                    )}
                </div>
                {customer.company_name && (
                    <span className="block text-xs text-slate-500 mt-0.5">{customer.name}</span>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                    {customer.phone && <span className="text-[0.7rem] text-slate-400">{customer.phone}</span>}
                    {customer.membership_number && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[0.7rem] text-slate-400 font-mono">
                            <QrCode size={10} />
                            {customer.membership_number}
                        </span>
                    )}
                </div>
            </div>

            <div className={cn(
                'flex flex-col items-end gap-1.5',
                'max-[600px]:w-full max-[600px]:flex-row max-[600px]:flex-wrap max-[600px]:justify-start max-[600px]:mt-2 max-[600px]:pl-[3.25rem]'
            )}>
                {customer.category && (
                    <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-white text-[0.65rem] font-medium"
                        style={{ backgroundColor: customer.category.color }}
                    >
                        <CategoryIcon size={12} />
                        {customer.category.name}
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    <span
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-white text-[0.6rem] font-semibold capitalize"
                        style={{ backgroundColor: TIER_COLORS[customer.loyalty_tier] }}
                    >
                        <Star size={10} />
                        {customer.loyalty_tier}
                    </span>
                    <span className="text-[0.7rem] text-slate-500 font-medium">
                        {customer.loyalty_points.toLocaleString()} pts
                    </span>
                </div>
                {(customer.category?.discount_percentage ?? TIER_DISCOUNTS[customer.loyalty_tier]) > 0 && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[0.7rem] font-semibold">
                        -{customer.category?.discount_percentage || TIER_DISCOUNTS[customer.loyalty_tier]}%
                    </span>
                )}
            </div>

            <div className={cn(
                'flex flex-col gap-1.5 ml-2',
                'max-[600px]:flex-row max-[600px]:ml-auto'
            )}>
                {showFavoriteButton && (
                    <button
                        type="button"
                        className={cn(
                            'w-8 h-8 border-none bg-slate-100 rounded-md text-slate-400 cursor-pointer flex items-center justify-center transition-all duration-200',
                            'hover:bg-red-100 hover:text-red-400',
                            isFavorite && 'bg-red-100 text-red-500'
                        )}
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
                        className="w-8 h-8 border-none bg-slate-100 rounded-md text-slate-400 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-indigo-100 hover:text-indigo-500"
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
