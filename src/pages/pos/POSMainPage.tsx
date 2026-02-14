import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, Clock, Users, CheckCircle } from 'lucide-react'

import { useCartStore, CartItem } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { useOrderStore } from '../../stores/orderStore'
import { useProducts, useCategories, usePOSCombos } from '../../hooks/products'
import { useNetworkAlerts } from '../../hooks/useNetworkAlerts'
import { useSyncReport } from '../../hooks/useSyncReport'
import { useLanHub } from '../../hooks/lan'
import { useCartPriceRecalculation } from '../../hooks/pricing'
import logger from '@/utils/logger'
import { usePOSModals, usePOSShift, usePOSOrders, useCartPromotions } from '../../hooks/pos'
import { PostOfflineSyncReport } from '../../components/sync/PostOfflineSyncReport'
import CategoryNav from '../../components/pos/CategoryNav'
import ProductGrid from '../../components/pos/ProductGrid'
import ComboGrid from '../../components/pos/ComboGrid'
import Cart from '../../components/pos/Cart'
import POSMenu from '../../components/pos/POSMenu'
import {
    ModifierModal,
    PaymentModal,
    VariantModal,
    HeldOrdersModal,
    PinVerificationModal,
    TransactionHistoryModal,
    CashierAnalyticsModal,
    ComboSelectorModal,
} from '../../components/pos/modals'
import {
    OpenShiftModal,
    CloseShiftModal,
    ShiftReconciliationModal,
    ShiftHistoryModal,
    ShiftStatsModal,
} from '../../components/pos/shift'
import type { Product, ProductCombo } from '../../types/database'
import './POSMainPage.css'

export default function POSMainPage() {
    // Enable network status alerts (Story 3.2)
    useNetworkAlerts()

    // Enable post-offline sync report modal (Story 3.3)
    const { showReport: showSyncReport, period: syncPeriod, dismissReport: dismissSyncReport, retryFailed: retrySyncFailed } = useSyncReport()

    // Enable automatic cart price recalculation on customer change (Story 6.2)
    useCartPriceRecalculation()

    // Enable automatic promotion evaluation on cart changes (Story 6.5)
    useCartPromotions()

    // Enable LAN Hub for KDS communication (Story 4.1)
    const { isRunning: lanHubRunning, error: lanHubError } = useLanHub({
        deviceName: 'Main Terminal',
        autoStart: true,
    })

    useEffect(() => {
        if (lanHubError) logger.error('[POS] LAN Hub error:', lanHubError)
    }, [lanHubError])

    useEffect(() => {
        logger.debug('[POS] LAN Hub running:', lanHubRunning)
    }, [lanHubRunning])

    // Cart state
    const { itemCount } = useCartStore()
    const { user } = useAuthStore()

    // UI state
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [selectedComboId, setSelectedComboId] = useState<string | null>(null)
    const [editItem, setEditItem] = useState<CartItem | undefined>(undefined)

    // Consolidated modal management
    const { modals, openModal, closeModal } = usePOSModals()

    // Shift management
    const {
        hasOpenShift,
        currentSession,
        terminalSessions,
        shiftStats,
        sessionTransactions,
        reconciliationData,
        clearReconciliation,
        isOpeningShift,
        isClosingShift,
        activeShiftUserId,
        verifiedUser,
        setVerifiedUser,
        pinModalAction,
        setPinModalAction,
        isRecoveringShift,
        handlePinVerified,
        handleOpenShift,
        handleCloseShift,
        handleSwitchShift,
        handleRecoverShift,
    } = usePOSShift()

    // Order management
    const { handleSendToKitchen, handleRestoreHeldOrder } = usePOSOrders()
    const heldOrdersCount = useOrderStore(s => s.heldOrders.length)

    // Data fetching
    const { data: categories = [], isLoading: categoriesLoading } = useCategories()
    const { data: products = [], isLoading: productsLoading } = useProducts(selectedCategory)
    const { data: combos = [], isLoading: combosLoading } = usePOSCombos()

    // Filter products by search
    const filteredProducts = useMemo(() =>
        products.filter(product =>
            searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [products, searchQuery]
    )

    // Handle product click
    const handleProductClick = useCallback((product: Product) => {
        setEditItem(undefined)
        setSelectedProduct(product)
        openModal('variant')
    }, [openModal])

    const handleCartItemClick = useCallback((item: CartItem) => {
        setEditItem(item)
        setSelectedProduct(item.product || null)
        openModal('modifier')
    }, [openModal])

    const handleVariantClose = useCallback(() => {
        closeModal('variant')
        setSelectedProduct(null)
    }, [closeModal])

    // Combo handlers (Story 6.6)
    const handleComboClick = useCallback((combo: ProductCombo) => {
        setSelectedComboId(combo.id)
        openModal('combo')
    }, [openModal])

    const handleComboConfirm = useCallback((_combo: any, selectedItems: any[], totalPrice: number) => {
        const combo = combos.find(c => c.id === selectedComboId)
        if (combo) {
            const { addCombo } = useCartStore.getState()
            addCombo(combo, 1, selectedItems, totalPrice, '')
        }
        closeModal('combo')
        setSelectedComboId(null)
    }, [selectedComboId, combos, closeModal])

    // Shift request handlers
    const handleOpenShiftRequest = useCallback(() => {
        setPinModalAction('open')
        openModal('pin')
    }, [setPinModalAction, openModal])

    const handleCloseShiftRequest = useCallback(() => {
        setPinModalAction('close')
        openModal('pin')
    }, [setPinModalAction, openModal])

    // Handle checkout
    const handleCheckout = useCallback(() => {
        if (!hasOpenShift) {
            openModal('noShift')
            return
        }
        if (itemCount > 0) {
            openModal('payment')
        }
    }, [hasOpenShift, itemCount, openModal])

    return (
        <div className="pos-app">
            <main className="pos-main bg-[var(--theme-bg-primary)]">
                {/* Category Navigation */}
                <CategoryNav
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    isLoading={categoriesLoading}
                    onOpenMenu={() => openModal('menu')}
                />

                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="px-10 pt-10 pb-4 flex flex-col gap-6 border-b border-[var(--color-gold)]/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-[var(--muted-smoke)]">Catalogue</span>
                                {selectedCategory && (
                                    <>
                                        <span className="text-[var(--muted-smoke)]/40">/</span>
                                        <span className="text-white font-medium">{categories.find(c => c.id === selectedCategory)?.name ?? ''}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {heldOrdersCount > 0 && (
                                    <button
                                        type="button"
                                        className="h-11 px-6 flex items-center gap-3 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 rounded-full text-[var(--color-gold)] text-[10px] uppercase tracking-widest font-black cursor-pointer transition-all hover:bg-[var(--color-gold)]/20 group"
                                        onClick={() => openModal('heldOrders')}
                                    >
                                        <Clock size={16} className="group-hover:rotate-12 transition-transform" />
                                        <span>{heldOrdersCount} Pending {heldOrdersCount === 1 ? 'Order' : 'Orders'}</span>
                                    </button>
                                )}
                                <div className="pos-products__search w-80 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-smoke)]" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search excellence..."
                                        className="w-full bg-[var(--onyx-surface)] border-none rounded-lg py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all placeholder:text-[var(--muted-smoke)]/50"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                        {/* Combo deals (Story 6.6) */}
                        {!selectedCategory && combos.length > 0 && (
                            <ComboGrid
                                combos={combos}
                                onComboClick={handleComboClick}
                                isLoading={combosLoading}
                            />
                        )}

                        <ProductGrid
                            products={filteredProducts}
                            onProductClick={handleProductClick}
                            isLoading={productsLoading}
                        />
                    </div>
                </div>

                {/* Active Order Sidebar */}
                <Cart
                    onCheckout={handleCheckout}
                    onSendToKitchen={() => handleSendToKitchen(hasOpenShift, () => openModal('noShift'))}
                    onItemClick={handleCartItemClick}
                />
            </main>

            <POSMenu
                isOpen={modals.menu}
                onClose={() => closeModal('menu')}
                onShowHeldOrders={() => openModal('heldOrders')}
                onShowTransactionHistory={() => openModal('transactionHistory')}
                onShowAnalytics={() => openModal('analytics')}
                onShowShiftHistory={() => openModal('shiftHistory')}
                onShowShiftStats={() => openModal('shiftStats')}
                hasOpenShift={hasOpenShift}
                onOpenShift={handleOpenShiftRequest}
                onCloseShift={handleCloseShiftRequest}
            />

            {modals.variant && selectedProduct && (
                <VariantModal baseProduct={selectedProduct} onClose={handleVariantClose} />
            )}

            {modals.modifier && selectedProduct && (
                <ModifierModal
                    product={selectedProduct}
                    editItem={editItem}
                    onClose={() => {
                        closeModal('modifier')
                        setSelectedProduct(null)
                        setEditItem(undefined)
                    }}
                />
            )}

            {modals.combo && selectedComboId && (
                <ComboSelectorModal
                    comboId={selectedComboId}
                    onClose={() => { closeModal('combo'); setSelectedComboId(null) }}
                    onConfirm={handleComboConfirm}
                />
            )}

            {modals.payment && <PaymentModal onClose={() => closeModal('payment')} />}

            {modals.heldOrders && (
                <HeldOrdersModal
                    onClose={() => closeModal('heldOrders')}
                    onRestore={(id) => handleRestoreHeldOrder(id, () => closeModal('heldOrders'))}
                />
            )}

            {modals.pin && (
                <PinVerificationModal
                    title={pinModalAction === 'open' ? 'Open a Shift' : 'Close Shift'}
                    message={pinModalAction === 'open' ? 'Enter your PIN to open your shift' : 'Enter your PIN to close the shift'}
                    allowedRoles={['cashier', 'manager', 'admin', 'barista']}
                    onVerify={(verified, user) => handlePinVerified(verified, user, () => closeModal('pin'), () => openModal('openShift'), () => openModal('closeShift'))}
                    onClose={() => { closeModal('pin'); setVerifiedUser(null) }}
                />
            )}

            {modals.openShift && verifiedUser && (
                <OpenShiftModal
                    onOpen={async (cash, terminal, notes) => { await handleOpenShift(cash, terminal, notes); closeModal('openShift') }}
                    onClose={() => { closeModal('openShift'); setVerifiedUser(null) }}
                    isLoading={isOpeningShift}
                />
            )}

            {modals.closeShift && currentSession && verifiedUser && (
                <CloseShiftModal
                    sessionStats={shiftStats}
                    openingCash={currentSession.opening_cash}
                    onClose={() => { closeModal('closeShift'); setVerifiedUser(null) }}
                    onConfirm={async (cash, qris, edc, notes) => { await handleCloseShift(cash, qris, edc, notes); closeModal('closeShift') }}
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

            {modals.transactionHistory && currentSession && (
                <TransactionHistoryModal
                    sessionId={currentSession.id}
                    sessionOpenedAt={currentSession.opened_at}
                    onClose={() => closeModal('transactionHistory')}
                />
            )}

            {modals.analytics && (
                <CashierAnalyticsModal onClose={() => closeModal('analytics')} sessionId={currentSession?.id} />
            )}

            {modals.shiftHistory && <ShiftHistoryModal onClose={() => closeModal('shiftHistory')} />}

            {modals.shiftStats && currentSession && (
                <ShiftStatsModal session={currentSession} transactions={sessionTransactions} stats={shiftStats} onClose={() => closeModal('shiftStats')} />
            )}

            {modals.shiftSelector && (
                <div className="shift-selector-overlay" onClick={() => closeModal('shiftSelector')}>
                    <div className="shift-selector" onClick={e => e.stopPropagation()}>
                        <h3 className="shift-selector__title"><Users size={20} />Select a terminal</h3>
                        <div className="shift-selector__list">
                            {terminalSessions.map(session => (
                                <button
                                    key={session.id}
                                    className={`shift-selector__item ${session.user_id === activeShiftUserId ? 'is-active' : ''}`}
                                    onClick={() => handleSwitchShift(session.user_id, () => closeModal('shiftSelector'))}
                                >
                                    <div className="shift-selector__user">
                                        <span className="shift-selector__name">{session.user_name || `Cashier ${session.session_number}`}</span>
                                        <span className="shift-selector__session">#{session.session_number}</span>
                                    </div>
                                    {session.user_id === activeShiftUserId && <CheckCircle size={18} className="shift-selector__check" />}
                                </button>
                            ))}
                        </div>
                        <button className="shift-selector__add" onClick={() => { closeModal('shiftSelector'); handleOpenShiftRequest() }}>
                            <Clock size={18} />Open a new shift
                        </button>
                    </div>
                </div>
            )}

            {modals.noShift && (
                <div className="pos-no-shift-modal-overlay" onClick={() => closeModal('noShift')}>
                    <div className="pos-no-shift-modal" onClick={e => e.stopPropagation()}>
                        <div className="pos-no-shift-modal__icon"><Clock size={48} /></div>
                        <h3 className="pos-no-shift-modal__title">No shift open</h3>
                        <p className="pos-no-shift-modal__message">You must open a shift to perform this action.</p>
                        <div className="pos-no-shift-modal__actions">
                            <button type="button" className="pos-no-shift-modal__btn pos-no-shift-modal__btn--secondary" onClick={() => closeModal('noShift')}>Cancel</button>
                            {user?.id && (
                                <button type="button" className="pos-no-shift-modal__btn pos-no-shift-modal__btn--secondary" disabled={isRecoveringShift} onClick={() => handleRecoverShift(user.id, () => closeModal('noShift'))}>
                                    {isRecoveringShift ? 'Searching...' : 'Recover my shift'}
                                </button>
                            )}
                            <button type="button" className="pos-no-shift-modal__btn pos-no-shift-modal__btn--primary" onClick={() => { closeModal('noShift'); handleOpenShiftRequest() }}>Open a Shift</button>
                        </div>
                    </div>
                </div>
            )}

            {showSyncReport && syncPeriod && (
                <PostOfflineSyncReport period={syncPeriod} onClose={dismissSyncReport} onRetryFailed={retrySyncFailed} />
            )}
        </div>
    )
}