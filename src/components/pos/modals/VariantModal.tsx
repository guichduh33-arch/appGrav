import { useState } from 'react'
import { X, Check } from 'lucide-react'
import type { Product } from '../../../types/database'
import { useCartStore } from '../../../stores/cartStore'
import { formatPrice } from '../../../utils/helpers'
import './VariantModal.css'

interface VariantModalProps {
    baseProduct: Product
    variants: Product[]
    onClose: () => void
}

interface VariantOption {
    id: string
    label: string
    products: Product[]
}

// Parse variant from product name like "Caramel Latte (Hot,Fresh milk)"
function parseVariants(products: Product[]): { temperature: VariantOption[], milk: VariantOption[] } {
    const tempMap = new Map<string, Product[]>()
    const milkMap = new Map<string, Product[]>()

    products.forEach(p => {
        const match = p.name.match(/\(([^)]+)\)/)
        if (match) {
            const parts = match[1].split(',').map(s => s.trim())
            const temp = parts[0] || 'Standard'
            const milk = parts[1] || 'Standard'

            if (!tempMap.has(temp)) tempMap.set(temp, [])
            tempMap.get(temp)!.push(p)

            if (!milkMap.has(milk)) milkMap.set(milk, [])
            milkMap.get(milk)!.push(p)
        }
    })

    const temperature: VariantOption[] = Array.from(tempMap.entries()).map(([label, prods]) => ({
        id: label.toLowerCase().replace(/\s+/g, '_'),
        label,
        products: prods
    }))

    const milk: VariantOption[] = Array.from(milkMap.entries()).map(([label, prods]) => ({
        id: label.toLowerCase().replace(/\s+/g, '_'),
        label,
        products: prods
    }))

    return { temperature, milk }
}

export default function VariantModal({ baseProduct, variants, onClose }: VariantModalProps) {
    const addItem = useCartStore(state => state.addItem)
    const { temperature, milk } = parseVariants(variants)

    const [selectedTemp, setSelectedTemp] = useState(temperature[0]?.label || '')
    const [selectedMilk, setSelectedMilk] = useState(milk[0]?.label || '')

    // Find the matching product based on selections
    const selectedProduct = variants.find(p => {
        const match = p.name.match(/\(([^)]+)\)/)
        if (match) {
            const parts = match[1].split(',').map(s => s.trim())
            return parts[0] === selectedTemp && parts[1] === selectedMilk
        }
        return false
    }) || variants[0]

    const handleAddToCart = () => {
        if (selectedProduct) {
            addItem(selectedProduct, 1, [], '')
            onClose()
        }
    }

    return (
        <div className="modal-backdrop is-active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md is-active variant-modal">
                <div className="modal__header">
                    <div className="variant-modal__product-info">
                        {baseProduct.image_url && (
                            <img
                                src={baseProduct.image_url}
                                alt={baseProduct.name}
                                className="variant-modal__image"
                            />
                        )}
                        <div>
                            <h3 className="modal__title">{getBaseName(baseProduct.name)}</h3>
                            <p className="modal__subtitle">Choisissez vos options</p>
                        </div>
                    </div>
                    <button className="modal__close" onClick={onClose} title="Fermer" aria-label="Fermer">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal__body">
                    {/* Temperature Selection */}
                    {temperature.length > 1 && (
                        <div className="variant-section">
                            <h4 className="variant-section__title">
                                🌡️ Température
                            </h4>
                            <div className="variant-options">
                                {temperature.map(opt => (
                                    <button
                                        key={opt.id}
                                        className={`variant-option ${selectedTemp === opt.label ? 'is-selected' : ''}`}
                                        onClick={() => setSelectedTemp(opt.label)}
                                    >
                                        <span className="variant-option__icon">
                                            {opt.label.toLowerCase().includes('hot') ? '🔥' : '🧊'}
                                        </span>
                                        <span className="variant-option__label">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Milk Selection */}
                    {milk.length > 1 && (
                        <div className="variant-section">
                            <h4 className="variant-section__title">
                                🥛 Type de lait
                            </h4>
                            <div className="variant-options">
                                {milk.map(opt => (
                                    <button
                                        key={opt.id}
                                        className={`variant-option ${selectedMilk === opt.label ? 'is-selected' : ''}`}
                                        onClick={() => setSelectedMilk(opt.label)}
                                    >
                                        <span className="variant-option__label">{opt.label}</span>
                                        {getPriceDiff(opt, milk[0], variants) > 0 && (
                                            <span className="variant-option__price">
                                                +{formatPrice(getPriceDiff(opt, milk[0], variants))}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Price Display */}
                    <div className="variant-price-display">
                        <span>Prix:</span>
                        <strong>{formatPrice(selectedProduct?.retail_price || 0)}</strong>
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn btn-primary btn-block" onClick={handleAddToCart}>
                        <Check size={18} />
                        Ajouter au panier • {formatPrice(selectedProduct?.retail_price || 0)}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Extract base name without variant info
function getBaseName(name: string): string {
    return name.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

// Calculate price difference between options
function getPriceDiff(opt: VariantOption, baseOpt: VariantOption, _variants: Product[]): number {
    const optProduct = opt.products[0]
    const baseProduct = baseOpt.products[0]
    if (!optProduct || !baseProduct) return 0
    return (optProduct.retail_price || 0) - (baseProduct.retail_price || 0)
}
