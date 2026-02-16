import { memo } from 'react'
import { Trash2, Tag, Plus, Minus, Lock, Percent } from 'lucide-react'
import { formatPrice } from '@/utils/helpers'
import { useCartStore, type CartItem } from '@/stores/cartStore'
import { cn } from '@/lib/utils'
import type { IItemPromotionDiscount } from '@/services/pos/promotionEngine'

interface CartItemRowProps {
    item: CartItem
    isLocked: boolean
    onItemClick?: (item: CartItem) => void
    onQuantityChange: (itemId: string, newQuantity: number) => void
    onDeleteClick: (itemId: string) => void
    onDiscountClick: (item: CartItem) => void
}

export const CartItemRow = memo(function CartItemRow({
    item,
    isLocked,
    onItemClick,
    onQuantityChange,
    onDeleteClick,
    onDiscountClick,
}: CartItemRowProps) {
    const itemPromotions = useCartStore(state => state.promotionDiscounts.filter(d => d.itemId === item.id))
    const totalPromoDiscount = itemPromotions.reduce((sum, d) => sum + d.discountAmount, 0)

    return (
        <div
            className={cn(
                'bg-transparent py-5 border-b border-white/5 transition-all duration-300 cursor-pointer',
                'hover:bg-white/[0.02]',
                'last:border-b-0',
                isLocked && 'bg-[rgba(245,158,11,0.03)] border-l-2 border-l-warning pl-3 cursor-default'
            )}
            onClick={() => !isLocked && onItemClick?.(item)}
        >
            <div className="mb-1.5 flex-1">
                <div className={cn(
                    'font-medium text-sm text-[#E5E7EB] flex items-center gap-1.5 leading-[1.4]',
                    isLocked && 'text-[#F59E0B]'
                )}>
                    {isLocked && <Lock size={12} />}
                    <span className="text-[#cab06d] font-bold mr-1">{item.quantity}x</span>
                    {item.type === 'combo' ? item.combo?.name : item.product?.name}
                </div>
                {/* Combo selections (Story 6.6) */}
                {item.type === 'combo' && item.comboSelections && item.comboSelections.length > 0 && (
                    <div className="mt-0.5 pl-3 border-l-2 border-zinc-600">
                        {item.comboSelections.map((sel) => (
                            <div key={sel.item_id} className="flex items-center gap-1 text-[11px] text-zinc-300 leading-[1.5]">
                                <span className="opacity-85">{sel.product_name}</span>
                                {sel.price_adjustment !== 0 && (
                                    <span className="text-[#cab06d] font-medium text-[10px]">
                                        {sel.price_adjustment > 0 ? '+' : ''}{formatPrice(sel.price_adjustment)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {item.modifiers.length > 0 && (
                    <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5 leading-[1.4]">
                        {item.modifiers.map(m => m.optionLabel).join(', ')}
                    </div>
                )}
                {item.notes && (
                    <div className="text-xs text-danger italic mt-0.5">{item.notes}</div>
                )}
                {/* Promotion badges (Story 6.5) */}
                {itemPromotions.length > 0 && (
                    <div className="cart-item__promos">
                        {itemPromotions.map((promo) => (
                            <PromotionBadge key={promo.promotionId} discount={promo} />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center bg-transparent border border-white/10 rounded-full text-xs text-[#8E8E93] cursor-pointer transition-all duration-300 hover:enabled:border-[#cab06d] hover:enabled:text-[#cab06d] hover:enabled:bg-[#cab06d]/5 disabled:opacity-30"
                        onClick={(e) => {
                            e.stopPropagation()
                            onQuantityChange(item.id, item.quantity - 1)
                        }}
                        disabled={isLocked}
                        title={isLocked ? 'PIN required' : 'Decrease quantity'}
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold min-w-[20px] text-center text-white">{item.quantity}</span>
                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center bg-transparent border border-white/10 rounded-full text-xs text-[#8E8E93] cursor-pointer transition-all duration-300 hover:enabled:border-[#cab06d] hover:enabled:text-[#cab06d] hover:enabled:bg-[#cab06d]/5 disabled:opacity-30"
                        onClick={(e) => {
                            e.stopPropagation()
                            onQuantityChange(item.id, item.quantity + 1)
                        }}
                        title="Increase quantity"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center bg-transparent border border-zinc-600 rounded-sm text-zinc-400 cursor-pointer transition-all duration-200 hover:bg-zinc-700 hover:border-gold hover:text-gold-light"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDiscountClick(item)
                        }}
                        title="Add discount"
                    >
                        <Tag size={14} />
                    </button>

                    <div className={cn(
                        'font-semibold text-sm text-white min-w-[70px] text-right',
                        isLocked && 'text-[#F59E0B]'
                    )}>
                        {totalPromoDiscount > 0 ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: '#8E8E93', fontSize: '11px' }}>
                                    {formatPrice(item.totalPrice)}
                                </span>
                                <span style={{ color: '#10B981', fontWeight: 600 }}>
                                    {formatPrice(item.totalPrice - totalPromoDiscount)}
                                </span>
                            </>
                        ) : (
                            formatPrice(item.totalPrice)
                        )}
                        {item.appliedPriceType && item.appliedPriceType !== 'retail' && (
                            <span
                                className="cart-item__price-type"
                                style={{
                                    display: 'block',
                                    fontSize: '9px',
                                    color: item.appliedPriceType === 'wholesale' ? '#059669' :
                                        item.appliedPriceType === 'discount' ? '#3b82f6' :
                                            item.appliedPriceType === 'custom' ? '#8b5cf6' : '#64748b',
                                    fontWeight: 500,
                                }}
                            >
                                {item.appliedPriceType === 'wholesale' && 'Wholesale'}
                                {item.appliedPriceType === 'discount' && 'VIP'}
                                {item.appliedPriceType === 'custom' && 'Custom'}
                            </span>
                        )}
                        {item.savingsAmount && item.savingsAmount > 0 && (
                            <span
                                className="cart-item__savings"
                                style={{
                                    display: 'block',
                                    fontSize: '9px',
                                    color: '#059669',
                                }}
                            >
                                Save {formatPrice(item.savingsAmount)}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="w-6 h-6 flex items-center justify-center border border-transparent bg-transparent text-[#8E8E93] cursor-pointer rounded-sm transition-all duration-200 hover:bg-[rgba(239,68,68,0.1)] hover:border-[#EF4444] hover:text-[#EF4444]"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteClick(item.id)
                        }}
                        title={isLocked ? 'PIN required to remove' : 'Remove'}
                    >
                        {isLocked ? <Lock size={16} /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>
        </div>
    )
})

const PromotionBadge = memo(function PromotionBadge({ discount }: { discount: IItemPromotionDiscount }) {
    return (
        <span
            className="cart-item__promo-badge"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '9px',
                fontWeight: 600,
                color: '#EA580C',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                borderRadius: '4px',
                padding: '1px 5px',
                marginRight: '4px',
            }}
            title={`${discount.promotionName}: -${formatPrice(discount.discountAmount)}`}
        >
            <Percent size={8} />
            {discount.description}
        </span>
    )
})
