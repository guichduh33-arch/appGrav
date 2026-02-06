import type { ProductCombo } from '../../types/database'
import { formatPrice } from '../../utils/helpers'
import './ProductGrid.css'

interface ComboGridProps {
    combos: ProductCombo[]
    onComboClick: (combo: ProductCombo) => void
    isLoading?: boolean
}

export default function ComboGrid({ combos, onComboClick, isLoading }: ComboGridProps) {
    if (isLoading) {
        return (
            <div className="products-grid">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="pos-product-card-skeleton" />
                ))}
            </div>
        )
    }

    if (combos.length === 0) return null

    return (
        <div className="products-grid">
            {combos.map((combo) => (
                <button
                    key={combo.id}
                    className="pos-product-card pos-product-card--combo"
                    onClick={() => onComboClick(combo)}
                >
                    <div className="pos-product-card__combo-badge">Combo</div>
                    <div className="pos-product-card__image">
                        <span className="pos-product-card__emoji" style={{ display: 'block' }}>
                            🎁
                        </span>
                    </div>
                    <div className="pos-product-card__name">
                        {combo.name}
                    </div>
                    <div className="pos-product-card__price">
                        {formatPrice(combo.combo_price)}
                    </div>
                </button>
            ))}
        </div>
    )
}
