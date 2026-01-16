import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Settings, Search, PauseCircle, ClipboardList, Printer, BarChart2, Monitor, CheckCircle, AlertCircle, LayoutGrid } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useOrderStore } from '../../stores/orderStore'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { formatTime } from '../../utils/helpers'
import CategoryNav from '../../components/pos/CategoryNav'
import ProductGrid from '../../components/pos/ProductGrid'
import Cart from '../../components/pos/Cart'
import ModifierModal from '../../components/pos/ModifierModal'
import PaymentModal from '../../components/pos/PaymentModal'
import VariantModal from '../../components/pos/VariantModal'
import HeldOrdersModal from '../../components/pos/HeldOrdersModal'
import type { Product } from '../../types/database'
import './POSMainPage.css'

export default function POSMainPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const {
        items, orderType, setOrderType, tableNumber, customerId, customerName,
        subtotal, discountAmount, total, itemCount, clearCart,
        activeOrderId, activeOrderNumber, restoreCartState, lockedItemIds
    } = useCartStore()
    const { holdOrder, getHeldOrdersCount, restoreHeldOrder } = useOrderStore()

    const [currentTime, setCurrentTime] = useState(new Date())
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal states
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [productVariants, setProductVariants] = useState<Product[] | null>(null)
    const [showModifierModal, setShowModifierModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showVariantModal, setShowVariantModal] = useState(false)
    const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

    // Data fetching
    const { data: categories = [], isLoading: categoriesLoading } = useCategories()
    const { data: products = [], isLoading: productsLoading } = useProducts(selectedCategory)

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    // Filter products by search
    const filteredProducts = products.filter(product =>
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handle product click
    const handleProductClick = (product: Product, variants?: Product[]) => {
        setSelectedProduct(product)
        if (variants && variants.length > 1) {
            // Product has variants - show variant modal
            setProductVariants(variants)
            setShowVariantModal(true)
        } else {
            // No variants - show modifier modal directly
            setProductVariants(null)
            setShowModifierModal(true)
        }
    }

    // Handle variant selection complete
    const handleVariantClose = () => {
        setShowVariantModal(false)
        setSelectedProduct(null)
        setProductVariants(null)
    }

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Get kitchen helper functions
    const { sendToKitchenAsHeldOrder, updateKitchenHeldOrder } = useOrderStore()

    // Handle send to kitchen - creates or updates a held order and clears the cart
    const handleSendToKitchen = () => {
        if (itemCount === 0) {
            showToast(t('pos.toasts.no_items_send'), 'error')
            return
        }

        if (activeOrderId) {
            // Update existing kitchen order
            updateKitchenHeldOrder(
                activeOrderId,
                items,
                subtotal,
                discountAmount,
                total
            )
            showToast(t('pos.toasts.order_updated'), 'success')
        } else {
            // Create new kitchen order
            const heldOrder = sendToKitchenAsHeldOrder(
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total
            )
            showToast(t('pos.toasts.order_sent', { number: heldOrder.orderNumber }), 'success')
        }

        // Clear the cart after sending
        clearCart()
    }

    // Handle hold order
    const handleHoldOrder = () => {
        if (itemCount > 0) {
            const heldOrder = holdOrder(
                items,
                orderType,
                tableNumber,
                customerId,
                customerName,
                subtotal,
                discountAmount,
                total,
                '', // reason
                activeOrderNumber || undefined, // existingOrderNumber
                activeOrderId || undefined, // existingId (only if it was kitchen order)
                !!activeOrderId, // sentToKitchen (true if it has activeOrderId)
                lockedItemIds // lockedItemIds
            )
            clearCart()
            showToast(t('pos.toasts.order_held', { number: heldOrder.orderNumber }), 'info')
        }
    }

    // Handle restore held order
    const handleRestoreHeldOrder = (heldOrderId: string) => {
        const heldOrder = restoreHeldOrder(heldOrderId)
        if (heldOrder) {
            // Restore items to cart with full state (including locks and active order ID)
            restoreCartState(
                heldOrder.items,
                heldOrder.lockedItemIds || [], // Restore locked items
                heldOrder.sentToKitchen ? heldOrder.id : null, // Restore active order ID if sent to kitchen
                heldOrder.orderNumber
            )

            setShowHeldOrdersModal(false)
            showToast(t('pos.toasts.order_restored', { number: heldOrder.orderNumber }), 'success')
        }
    }

    // Handle checkout
    const handleCheckout = () => {
        if (itemCount > 0) {
            setShowPaymentModal(true)
        }
    }

    return (
        <div className="pos-app">
            {/* Header */}
            <header className="pos-header">
                <div className="pos-header__left">
                    <div className="pos-header__logo">
                        <span className="pos-header__logo-icon">🥐</span>
                        <span>The Breakery</span>
                    </div>
                    <div className="pos-header__user">
                        <div className="avatar avatar-sm">{user?.name?.[0] || 'U'}</div>
                        <span className="pos-header__user-name">{user?.name || t('pos.header.user_label')}</span>
                    </div>
                </div>

                <div className="pos-header__center">
                    <div className="order-type-selector">
                        <button
                            className={`order-type-selector__option ${orderType === 'dine_in' ? 'is-active' : ''}`}
                            onClick={() => setOrderType('dine_in')}
                        >
                            {t('pos.header.dine_in')}
                        </button>
                        <button
                            className={`order-type-selector__option ${orderType === 'takeaway' ? 'is-active' : ''}`}
                            onClick={() => setOrderType('takeaway')}
                        >
                            {t('pos.header.takeaway')}
                        </button>
                        <button
                            className={`order-type-selector__option ${orderType === 'delivery' ? 'is-active' : ''}`}
                            onClick={() => setOrderType('delivery')}
                        >
                            {t('pos.header.delivery')}
                        </button>
                    </div>
                    <div className="pos-header__time">{formatTime(currentTime)}</div>
                </div>

                <div className="pos-header__right">
                    <button className="btn-icon" title={t('nav.back_office')} onClick={() => navigate('/inventory')}>
                        <LayoutGrid size={20} />
                    </button>
                    <button className="btn-icon" title={t('nav.settings')} onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content (3 Zones) */}
            <main className="pos-main">
                {/* Zone 1: Categories Sidebar */}
                <CategoryNav
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    isLoading={categoriesLoading}
                />

                {/* Zone 2: Products Grid */}
                <section className="pos-products">
                    <div className="pos-products__header">
                        <h2 className="pos-products__title">
                            {selectedCategory
                                ? categories.find(c => c.id === selectedCategory)?.name || t('pos.products.title_all')
                                : t('pos.products.title_all')
                            }
                        </h2>
                        <div className="pos-products__search search-input">
                            <Search className="search-input__icon" size={20} />
                            <input
                                type="text"
                                placeholder={t('pos.products.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pos-products__grid">
                        <ProductGrid
                            products={filteredProducts}
                            onProductClick={handleProductClick}
                            isLoading={productsLoading}
                        />
                    </div>
                </section>

                {/* Zone 3: Cart Sidebar */}
                <Cart
                    onCheckout={handleCheckout}
                    onSendToKitchen={handleSendToKitchen}
                    onHoldOrder={handleHoldOrder}
                />
            </main>

            {/* Footer */}
            <footer className="pos-footer">
                <div className="pos-footer__left">
                    <button className="footer-btn" onClick={() => setShowHeldOrdersModal(true)}>
                        <PauseCircle size={18} />
                        {t('pos.footer.on_hold')}
                        {getHeldOrdersCount() > 0 && (
                            <span className="footer-btn__badge">{getHeldOrdersCount()}</span>
                        )}
                    </button>
                    <button className="footer-btn">
                        <ClipboardList size={18} />
                        {t('pos.footer.orders')}
                    </button>
                </div>
                <div className="pos-footer__right">
                    <button className="footer-btn">
                        <Printer size={18} />
                        {t('pos.footer.ticket')}
                    </button>
                    <button className="footer-btn">
                        <BarChart2 size={18} />
                        {t('pos.footer.session')}
                    </button>
                    <button className="footer-btn" onClick={() => window.open('/kds', '_blank')}>
                        <Monitor size={18} />
                        {t('pos.footer.kds')}
                    </button>
                </div>
            </footer>

            {/* Toast Notifications */}
            {toast && (
                <div className={`pos-toast pos-toast--${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle size={20} />}
                    {toast.type === 'error' && <AlertCircle size={20} />}
                    {toast.type === 'info' && <PauseCircle size={20} />}
                    {toast.message}
                </div>
            )}

            {/* Modals */}
            {showVariantModal && selectedProduct && productVariants && (
                <VariantModal
                    baseProduct={selectedProduct}
                    variants={productVariants}
                    onClose={handleVariantClose}
                />
            )}

            {showModifierModal && selectedProduct && (
                <ModifierModal
                    product={selectedProduct}
                    onClose={() => {
                        setShowModifierModal(false)
                        setSelectedProduct(null)
                    }}
                />
            )}

            {showPaymentModal && (
                <PaymentModal
                    onClose={() => setShowPaymentModal(false)}
                />
            )}

            {showHeldOrdersModal && (
                <HeldOrdersModal
                    onClose={() => setShowHeldOrdersModal(false)}
                    onRestore={handleRestoreHeldOrder}
                />
            )}
        </div>
    )
}

