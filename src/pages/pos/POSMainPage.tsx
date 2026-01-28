import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Search, PauseCircle, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react'

import { useCartStore, CartItem } from '../../stores/cartStore'
import { useOrderStore } from '../../stores/orderStore'
import { useAuthStore } from '../../stores/authStore'
import { useProducts, useCategories } from '../../hooks/products'
import { useShift, ShiftUser } from '../../hooks/useShift'
import { useNetworkAlerts } from '../../hooks/useNetworkAlerts'
import { useSyncReport } from '../../hooks/useSyncReport'
import { PostOfflineSyncReport } from '../../components/sync/PostOfflineSyncReport'
import CategoryNav from '../../components/pos/CategoryNav'
import ProductGrid from '../../components/pos/ProductGrid'
import Cart from '../../components/pos/Cart'
import POSMenu from '../../components/pos/POSMenu'
// Modals
import {
    ModifierModal,
    PaymentModal,
    VariantModal,
    HeldOrdersModal,
    PinVerificationModal,
    TransactionHistoryModal,
    CashierAnalyticsModal,
} from '../../components/pos/modals'
// Shift modals
import {
    OpenShiftModal,
    CloseShiftModal,
    ShiftReconciliationModal,
    ShiftHistoryModal,
    ShiftStatsModal,
} from '../../components/pos/shift'
import type { Product } from '../../types/database'
import './POSMainPage.css'

export default function POSMainPage() {
    const { t } = useTranslation()

    // Enable network status alerts (Story 3.2)
    useNetworkAlerts()

    // Enable post-offline sync report modal (Story 3.3)
    const { showReport: showSyncReport, period: syncPeriod, dismissReport: dismissSyncReport, retryFailed: retrySyncFailed } = useSyncReport()

    const {
        items, itemCount, clearCart,
        activeOrderId, activeOrderNumber, restoreCartState, lockedItemIds,
        subtotal, discountAmount, total, orderType, tableNumber, customerId, customerName
    } = useCartStore()
    const { holdOrder, restoreHeldOrder } = useOrderStore()
    const { user } = useAuthStore()

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Shift management
    const {
        hasOpenShift,
        currentSession,
        terminalSessions,
        sessionStats: shiftStats,
        sessionTransactions,
        openShift,
        closeShift,
        switchToShift,
        recoverShift,
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
    const [showTransactionHistory, setShowTransactionHistory] = useState(false)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showShiftHistory, setShowShiftHistory] = useState(false)
    const [showShiftStats, setShowShiftStats] = useState(false)
    const [showNoShiftModal, setShowNoShiftModal] = useState(false)
    const [isRecoveringShift, setIsRecoveringShift] = useState(false)

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

    // Data fetching
    const { data: categories = [], isLoading: categoriesLoading } = useCategories()
    const { data: products = [], isLoading: productsLoading } = useProducts(selectedCategory)

    // Filter products by search - memoized to prevent unnecessary recalculations
    const filteredProducts = useMemo(() =>
        products.filter(product =>
            searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [products, searchQuery]
    )

    // Handle product click - allow even without shift (block at checkout/send)
    const handleProductClick = useCallback((product: Product) => {
        setEditItem(undefined) // Reset edit item when adding new
        setSelectedProduct(product)
        // Always show variant modal first - it will load variants from database
        // If no variants exist, it will add directly to cart
        setShowVariantModal(true)
    }, [])

    const handleCartItemClick = useCallback((item: CartItem) => {
        setEditItem(item)
        setSelectedProduct(item.product || null)
        setShowModifierModal(true)
    }, [])

    // Handle variant selection complete
    const handleVariantClose = useCallback(() => {
        setShowVariantModal(false)
        setSelectedProduct(null)
    }, [])

    // Show toast notification
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }, [])

    // Get kitchen helper functions
    const { sendToKitchenAsHeldOrder, updateKitchenHeldOrder } = useOrderStore()

    // Handle send to kitchen - creates or updates a held order and clears the cart
    const handleSendToKitchen = () => {
        if (!hasOpenShift) {
            setShowNoShiftModal(true)
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

    // Handle hold order - prefixed with underscore as it's kept for future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _handleHoldOrder = () => {
        if (!hasOpenShift) {
            setShowNoShiftModal(true)
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
    void _handleHoldOrder

    // Handle restore held order
    const handleRestoreHeldOrder = useCallback((heldOrderId: string) => {
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
    }, [restoreHeldOrder, restoreCartState, showToast, t])

    // Handle checkout - block if no shift open
    const handleCheckout = useCallback(() => {
        if (!hasOpenShift) {
            setShowNoShiftModal(true)
            return
        }
        if (itemCount > 0) {
            setShowPaymentModal(true)
        }
    }, [hasOpenShift, itemCount])

    // Handle open shift request - show PIN verification first
    const handleOpenShiftRequest = useCallback(() => {
        setPinModalAction('open')
        setShowPinModal(true)
    }, [])

    // Handle close shift request - show PIN verification first
    const handleCloseShiftRequest = useCallback(() => {
        setPinModalAction('close')
        setShowPinModal(true)
    }, [])

    // Handle PIN verification result
    const handlePinVerified = (verified: boolean, user?: { id: string; name: string; role: string }) => {
        if (verified && user) {
            setShowPinModal(false) // Close PIN modal first
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

                {/* Zone 3: Cart Sidebar with integrated Menu Button */}
                <Cart
                    onCheckout={handleCheckout}
                    onSendToKitchen={handleSendToKitchen}
                    onShowPendingOrders={() => setShowHeldOrdersModal(true)}
                    onItemClick={handleCartItemClick}
                />
            </main>

            {/* Global Menu */}
            <POSMenu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                onShowHeldOrders={() => setShowHeldOrdersModal(true)}
                onShowTransactionHistory={() => setShowTransactionHistory(true)}
                onShowAnalytics={() => setShowAnalytics(true)}
                onShowShiftHistory={() => setShowShiftHistory(true)}
                onShowShiftStats={() => setShowShiftStats(true)}
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
            {showVariantModal && selectedProduct && (
                <VariantModal
                    baseProduct={selectedProduct}
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

            {/* Transaction History Modal */}
            {showTransactionHistory && currentSession && (
                <TransactionHistoryModal
                    sessionId={currentSession.id}
                    sessionOpenedAt={currentSession.opened_at}
                    onClose={() => setShowTransactionHistory(false)}
                />
            )}

            {/* Cashier Analytics Modal */}
            {showAnalytics && (
                <CashierAnalyticsModal
                    onClose={() => setShowAnalytics(false)}
                    sessionId={currentSession?.id}
                />
            )}

            {/* Shift History Modal */}
            {showShiftHistory && (
                <ShiftHistoryModal
                    onClose={() => setShowShiftHistory(false)}
                />
            )}

            {/* Shift Stats Modal */}
            {showShiftStats && currentSession && (
                <ShiftStatsModal
                    session={currentSession}
                    transactions={sessionTransactions}
                    stats={shiftStats}
                    onClose={() => setShowShiftStats(false)}
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

            {/* No Shift Modal - shown when trying to checkout/send without shift */}
            {showNoShiftModal && (
                <div className="pos-no-shift-modal-overlay">
                    <div className="pos-no-shift-modal">
                        <div className="pos-no-shift-modal__icon">
                            <Clock size={48} />
                        </div>
                        <h3 className="pos-no-shift-modal__title">
                            {t('shift.no_shift_open', 'Aucun shift ouvert')}
                        </h3>
                        <p className="pos-no-shift-modal__message">
                            {t('shift.must_open_shift_message', 'Vous devez ouvrir un shift pour effectuer cette action.')}
                        </p>
                        <div className="pos-no-shift-modal__actions">
                            <button
                                type="button"
                                className="pos-no-shift-modal__btn pos-no-shift-modal__btn--secondary"
                                onClick={() => setShowNoShiftModal(false)}
                            >
                                {t('common.cancel', 'Annuler')}
                            </button>
                            {user?.id && (
                                <button
                                    type="button"
                                    className="pos-no-shift-modal__btn pos-no-shift-modal__btn--secondary"
                                    disabled={isRecoveringShift}
                                    onClick={async () => {
                                        setIsRecoveringShift(true)
                                        const recovered = await recoverShift(user.id)
                                        setIsRecoveringShift(false)
                                        if (recovered) {
                                            setShowNoShiftModal(false)
                                        }
                                    }}
                                >
                                    {isRecoveringShift ? 'Recherche...' : 'Récupérer mon shift'}
                                </button>
                            )}
                            <button
                                type="button"
                                className="pos-no-shift-modal__btn pos-no-shift-modal__btn--primary"
                                onClick={() => {
                                    setShowNoShiftModal(false)
                                    handleOpenShiftRequest()
                                }}
                            >
                                {t('shift.open_title', 'Ouvrir un Shift')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post-Offline Sync Report Modal (Story 3.3) */}
            {showSyncReport && syncPeriod && (
                <PostOfflineSyncReport
                    period={syncPeriod}
                    onClose={dismissSyncReport}
                    onRetryFailed={retrySyncFailed}
                />
            )}
        </div>
    )
}
