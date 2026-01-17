import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Search, PauseCircle, CheckCircle, AlertCircle, Clock, Users, Lock } from 'lucide-react'

import { useCartStore, CartItem } from '../../stores/cartStore'
import { useOrderStore } from '../../stores/orderStore'
import { useProducts, useCategories } from '../../hooks/useProducts'
import { useShift, ShiftUser } from '../../hooks/useShift'
import CategoryNav from '../../components/pos/CategoryNav'
import ProductGrid from '../../components/pos/ProductGrid'
import Cart from '../../components/pos/Cart'
import POSMenu from '../../components/pos/POSMenu'
import ModifierModal from '../../components/pos/ModifierModal'
import PaymentModal from '../../components/pos/PaymentModal'
import VariantModal from '../../components/pos/VariantModal'
import HeldOrdersModal from '../../components/pos/HeldOrdersModal'
import OpenShiftModal from '../../components/pos/OpenShiftModal'
import CloseShiftModal from '../../components/pos/CloseShiftModal'
import ShiftReconciliationModal from '../../components/pos/ShiftReconciliationModal'
import PinVerificationModal from '../../components/pos/PinVerificationModal'
import type { Product } from '../../types/database'
import './POSMainPage.css'

export default function POSMainPage() {
    const { t } = useTranslation()

    const {
        items, itemCount, clearCart,
        activeOrderId, activeOrderNumber, restoreCartState, lockedItemIds,
        subtotal, discountAmount, total, orderType, tableNumber, customerId, customerName
    } = useCartStore()
    const { holdOrder, restoreHeldOrder } = useOrderStore()

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Shift management
    const {
        hasOpenShift,
        currentSession,
        terminalSessions,
        sessionStats: shiftStats,
        openShift,
        closeShift,
        switchToShift,
        reconciliationData,
        clearReconciliation,
        isOpeningShift,
        isClosingShift,
        activeShiftUserId
    } = useShift()

    // Verified user for shift operations
    const [verifiedUser, setVerifiedUser] = useState<ShiftUser | null>(null)

    // Modal states
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editItem, setEditItem] = useState<CartItem | undefined>(undefined)
    const [productVariants, setProductVariants] = useState<Product[] | null>(null)
    const [showModifierModal, setShowModifierModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showVariantModal, setShowVariantModal] = useState(false)
    const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showOpenShiftModal, setShowOpenShiftModal] = useState(false)
    const [showCloseShiftModal, setShowCloseShiftModal] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [pinModalAction, setPinModalAction] = useState<'open' | 'close'>('open')
    const [showShiftSelector, setShowShiftSelector] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

    // Data fetching
    const { data: categories = [], isLoading: categoriesLoading } = useCategories()
    const { data: products = [], isLoading: productsLoading } = useProducts(selectedCategory)

    // Filter products by search
    const filteredProducts = products.filter(product =>
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handle product click - block if no shift open
    const handleProductClick = (product: Product, variants?: Product[]) => {
        if (!hasOpenShift) {
            showToast(t('shift.must_open_shift', 'Vous devez ouvrir un shift pour ajouter des produits'), 'error')
            return
        }
        setEditItem(undefined) // Reset edit item when adding new
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

    const handleCartItemClick = (item: CartItem) => {
        setEditItem(item)
        setSelectedProduct(item.product)
        setShowModifierModal(true)
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
        if (!hasOpenShift) {
            showToast(t('shift.must_open_shift', 'Vous devez ouvrir un shift'), 'error')
            return
        }
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
        if (!hasOpenShift) {
            showToast(t('shift.must_open_shift', 'Vous devez ouvrir un shift'), 'error')
            return
        }
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

    // Handle checkout - block if no shift open
    const handleCheckout = () => {
        if (!hasOpenShift) {
            showToast(t('shift.must_open_shift', 'Vous devez ouvrir un shift pour effectuer une transaction'), 'error')
            return
        }
        if (itemCount > 0) {
            setShowPaymentModal(true)
        }
    }

    // Handle open shift request - show PIN verification first
    const handleOpenShiftRequest = () => {
        setPinModalAction('open')
        setShowPinModal(true)
    }

    // Handle close shift request - show PIN verification first
    const handleCloseShiftRequest = () => {
        setPinModalAction('close')
        setShowPinModal(true)
    }

    // Handle PIN verification result
    const handlePinVerified = (verified: boolean, user?: { id: string; name: string; role: string }) => {
        if (verified && user) {
            setVerifiedUser(user)
            if (pinModalAction === 'open') {
                setShowOpenShiftModal(true)
            } else {
                setShowCloseShiftModal(true)
            }
        }
    }

    // Handle open shift with verified user
    const handleOpenShift = async (openingCash: number, _terminalId?: string, notes?: string) => {
        if (!verifiedUser) return
        try {
            await openShift(openingCash, verifiedUser.id, verifiedUser.name, notes)
            setShowOpenShiftModal(false)
            setVerifiedUser(null)
        } catch (error) {
            console.error('Error opening shift:', error)
        }
    }

    // Handle close shift with verified user
    const handleCloseShift = async (actualCash: number, actualQris: number, actualEdc: number, notes?: string) => {
        if (!verifiedUser) return
        try {
            await closeShift(actualCash, actualQris, actualEdc, verifiedUser.id, notes)
            setShowCloseShiftModal(false)
            setVerifiedUser(null)
        } catch (error) {
            console.error('Error closing shift:', error)
        }
    }

    // Handle shift switch
    const handleSwitchShift = (userId: string) => {
        switchToShift(userId)
        setShowShiftSelector(false)
    }

    return (
        <div className="pos-app">
            {/* Multi-Shift Indicator */}
            {terminalSessions.length > 1 && (
                <div className="pos-multi-shift-bar">
                    <Users size={16} />
                    <span>{terminalSessions.length} shifts actifs sur ce terminal</span>
                    <button
                        className="pos-multi-shift-bar__btn"
                        onClick={() => setShowShiftSelector(true)}
                    >
                        Changer de caisse
                    </button>
                </div>
            )}

            {/* Main Content (3 Zones) */}
            <main className="pos-main">
                {/* Zone 1: Categories Sidebar */}
                <CategoryNav
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    isLoading={categoriesLoading}
                    onOpenMenu={() => setShowMenu(true)}
                />

                {/* Zone 2: Products Grid */}
                <section className={`pos-products ${!hasOpenShift ? 'pos-products--disabled' : ''}`}>
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
                                disabled={!hasOpenShift}
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

                    {/* Overlay when no shift */}
                    {!hasOpenShift && (
                        <div className="pos-products__overlay">
                            <Lock size={48} />
                            <p>{t('shift.products_locked', 'Ouvrez un shift pour accéder aux produits')}</p>
                        </div>
                    )}
                </section>

                {/* Zone 3: Cart Sidebar with integrated Menu Button */}
                <Cart
                    onCheckout={handleCheckout}
                    onSendToKitchen={handleSendToKitchen}
                    onHoldOrder={handleHoldOrder}
                    onItemClick={handleCartItemClick}
                />
            </main>

            {/* Global Menu */}
            <POSMenu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                onShowHeldOrders={() => setShowHeldOrdersModal(true)}
                hasOpenShift={hasOpenShift}
                onOpenShift={handleOpenShiftRequest}
                onCloseShift={handleCloseShiftRequest}
            />

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
                    editItem={editItem}
                    onClose={() => {
                        setShowModifierModal(false)
                        setSelectedProduct(null)
                        setEditItem(undefined)
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

            {/* PIN Verification Modal */}
            {showPinModal && (
                <PinVerificationModal
                    title={pinModalAction === 'open'
                        ? t('shift.pin_open_title', 'Ouvrir un Shift')
                        : t('shift.pin_close_title', 'Fermer le Shift')
                    }
                    message={pinModalAction === 'open'
                        ? t('shift.pin_open_message', 'Entrez votre code PIN pour ouvrir votre shift')
                        : t('shift.pin_close_message', 'Entrez votre code PIN pour fermer le shift')
                    }
                    allowedRoles={['cashier', 'manager', 'admin', 'barista']}
                    onVerify={handlePinVerified}
                    onClose={() => {
                        setShowPinModal(false)
                        setVerifiedUser(null)
                    }}
                />
            )}

            {/* Shift Modals */}
            {showOpenShiftModal && verifiedUser && (
                <OpenShiftModal
                    onOpen={handleOpenShift}
                    onClose={() => {
                        setShowOpenShiftModal(false)
                        setVerifiedUser(null)
                    }}
                    isLoading={isOpeningShift}
                />
            )}

            {showCloseShiftModal && currentSession && verifiedUser && (
                <CloseShiftModal
                    sessionStats={shiftStats}
                    openingCash={currentSession.opening_cash}
                    onClose={() => {
                        setShowCloseShiftModal(false)
                        setVerifiedUser(null)
                    }}
                    onConfirm={handleCloseShift}
                    isLoading={isClosingShift}
                />
            )}

            {reconciliationData && (
                <ShiftReconciliationModal
                    reconciliation={reconciliationData}
                    totalSales={shiftStats.totalSales}
                    transactionCount={shiftStats.transactionCount}
                    onClose={clearReconciliation}
                />
            )}

            {/* Shift Selector Modal */}
            {showShiftSelector && (
                <div className="shift-selector-overlay" onClick={() => setShowShiftSelector(false)}>
                    <div className="shift-selector" onClick={e => e.stopPropagation()}>
                        <h3 className="shift-selector__title">
                            <Users size={20} />
                            Sélectionner une caisse
                        </h3>
                        <div className="shift-selector__list">
                            {terminalSessions.map(session => (
                                <button
                                    key={session.id}
                                    className={`shift-selector__item ${session.user_id === activeShiftUserId ? 'is-active' : ''}`}
                                    onClick={() => handleSwitchShift(session.user_id)}
                                >
                                    <div className="shift-selector__user">
                                        <span className="shift-selector__name">
                                            {session.user_name || `Caissier ${session.session_number}`}
                                        </span>
                                        <span className="shift-selector__session">
                                            #{session.session_number}
                                        </span>
                                    </div>
                                    {session.user_id === activeShiftUserId && (
                                        <CheckCircle size={18} className="shift-selector__check" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            className="shift-selector__add"
                            onClick={() => {
                                setShowShiftSelector(false)
                                handleOpenShiftRequest()
                            }}
                        >
                            <Clock size={18} />
                            Ouvrir un nouveau shift
                        </button>
                    </div>
                </div>
            )}

            {/* Shift Required Banner */}
            {!hasOpenShift && (
                <div className="pos-shift-banner">
                    <Clock size={20} />
                    <span>{t('shift.no_shift_open', 'Aucun shift ouvert. Identifiez-vous pour commencer.')}</span>
                    <button
                        className="pos-shift-banner__btn"
                        onClick={handleOpenShiftRequest}
                    >
                        {t('shift.open_title', 'Ouvrir un Shift')}
                    </button>
                </div>
            )}
        </div>
    )
}
