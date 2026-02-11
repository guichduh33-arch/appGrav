import { useEffect, Suspense, lazy, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useCartStore, initCartPersistence } from './stores/cartStore'
import { supabase } from './lib/supabase'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ModuleErrorBoundary } from './components/ui/ModuleErrorBoundary'
import { RouteGuard } from './components/auth/PermissionGuard'
import { initializeSyncEngine } from './services/sync/syncEngine'
import { initProductsCache, stopProductsCacheRefresh } from './services/offline/productsCacheInit'
import { loadCart, validateAndFilterCartItems } from './services/offline/cartPersistenceService'
import { toast } from 'sonner'

// Layouts - loaded immediately as they're shells
import BackOfficeLayout from './layouts/BackOfficeLayout'

// Critical paths loaded immediately
import LoginPage from './pages/auth/LoginPage'
import POSMainPage from './pages/pos/POSMainPage'

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center h-screen bg-[var(--color-blanc-creme)]">
        <div className="text-center">
            <div className="spinner mb-4" />
            <p className="text-[var(--color-gris-chaud)]">Loading...</p>
        </div>
    </div>
)

// Lazy loaded pages - grouped by module
// KDS Module
const KDSMainPage = lazy(() => import('./pages/kds/KDSMainPage'))
const KDSStationSelector = lazy(() => import('./pages/kds/KDSStationSelector'))

// Display
const CustomerDisplayPage = lazy(() => import('./pages/display/CustomerDisplayPage'))

// Mobile Module
const MobileLayout = lazy(() => import('./components/mobile/MobileLayout'))
const MobileLoginPage = lazy(() => import('./pages/mobile/MobileLoginPage'))
const MobileHomePage = lazy(() => import('./pages/mobile/MobileHomePage'))
const MobileCatalogPage = lazy(() => import('./pages/mobile/MobileCatalogPage'))
const MobileCartPage = lazy(() => import('./pages/mobile/MobileCartPage'))
const MobileOrdersPage = lazy(() => import('./pages/mobile/MobileOrdersPage'))

// Inventory Module
const InventoryLayout = lazy(() => import('./pages/inventory/InventoryLayout'))
const StockPage = lazy(() => import('./pages/inventory/StockPage'))
const IncomingStockPage = lazy(() => import('./pages/inventory/IncomingStockPage'))
const WastedPage = lazy(() => import('./pages/inventory/WastedPage'))
const StockProductionPage = lazy(() => import('./pages/inventory/StockProductionPage'))
const StockOpnameList = lazy(() => import('./pages/inventory/StockOpnameList'))
const StockOpnameForm = lazy(() => import('./pages/inventory/StockOpnameForm'))
const ProductDetailPage = lazy(() => import('./pages/inventory/ProductDetailPage'))
const StockMovementsPage = lazy(() => import('./pages/inventory/StockMovementsPage'))
const InternalTransfersPage = lazy(() => import('./pages/inventory/InternalTransfersPage'))
const TransferFormPage = lazy(() => import('./pages/inventory/TransferFormPage'))
const TransferDetailPage = lazy(() => import('./pages/inventory/TransferDetailPage'))
const StockByLocationPage = lazy(() => import('./pages/inventory/StockByLocationPage'))

// Orders
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'))

// Reports
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))

// Users
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const PermissionsPage = lazy(() => import('./pages/users/PermissionsPage'))

// Settings Module
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const SettingsLayout = lazy(() => import('./pages/settings/SettingsLayout'))
const CategorySettingsPage = lazy(() => import('./pages/settings/CategorySettingsPage'))
const CompanySettingsPage = lazy(() => import('./pages/settings/CompanySettingsPage'))
const TaxSettingsPage = lazy(() => import('./pages/settings/TaxSettingsPage'))
const PaymentMethodsPage = lazy(() => import('./pages/settings/PaymentMethodsPage'))
const BusinessHoursPage = lazy(() => import('./pages/settings/BusinessHoursPage'))
const SettingsHistoryPage = lazy(() => import('./pages/settings/SettingsHistoryPage'))
const RolesPage = lazy(() => import('./pages/settings/RolesPage'))
const AuditPage = lazy(() => import('./pages/settings/AuditPage'))
const SyncStatusPage = lazy(() => import('./pages/settings/SyncStatusPage'))
const PrintingSettingsPage = lazy(() => import('./pages/settings/PrintingSettingsPage'))
const NotificationSettingsPage = lazy(() => import('./pages/settings/NotificationSettingsPage'))
const LanMonitoringPage = lazy(() => import('./pages/settings/LanMonitoringPage'))
const CategoriesPage = lazy(() => import('./pages/settings/CategoriesPage'))

// Epic 10 Phase 2: Custom settings pages
const POSConfigSettingsPage = lazy(() => import('./pages/settings/POSConfigSettingsPage'))
const FinancialSettingsPage = lazy(() => import('./pages/settings/FinancialSettingsPage'))
const InventoryConfigSettingsPage = lazy(() => import('./pages/settings/InventoryConfigSettingsPage'))
const LoyaltySettingsPage = lazy(() => import('./pages/settings/LoyaltySettingsPage'))
const B2BSettingsPage = lazy(() => import('./pages/settings/B2BSettingsPage'))
const KDSConfigSettingsPage = lazy(() => import('./pages/settings/KDSConfigSettingsPage'))
const DisplaySettingsPage = lazy(() => import('./pages/settings/DisplaySettingsPage'))
const SyncAdvancedSettingsPage = lazy(() => import('./pages/settings/SyncAdvancedSettingsPage'))
const SecurityPinSettingsPage = lazy(() => import('./pages/settings/SecurityPinSettingsPage'))

// Profile
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))

// B2B Module
const B2BPage = lazy(() => import('./pages/b2b/B2BPage'))
const B2BOrdersPage = lazy(() => import('./pages/b2b/B2BOrdersPage'))
const B2BOrderFormPage = lazy(() => import('./pages/b2b/B2BOrderFormPage'))
const B2BOrderDetailPage = lazy(() => import('./pages/b2b/B2BOrderDetailPage'))
const B2BPaymentsPage = lazy(() => import('./pages/b2b/B2BPaymentsPage'))

// Purchasing Module
const SuppliersPage = lazy(() => import('./pages/purchasing/SuppliersPage'))
const PurchaseOrdersPage = lazy(() => import('./pages/purchasing/PurchaseOrdersPage'))
const PurchaseOrderFormPage = lazy(() => import('./pages/purchasing/PurchaseOrderFormPage'))
const PurchaseOrderDetailPage = lazy(() => import('./pages/purchasing/PurchaseOrderDetailPage'))

// Customers Module
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage'))
const CustomerFormPage = lazy(() => import('./pages/customers/CustomerFormPage'))
const CustomerDetailPage = lazy(() => import('./pages/customers/CustomerDetailPage'))
const CustomerCategoriesPage = lazy(() => import('./pages/customers/CustomerCategoriesPage'))

// Accounting Module
const AccountingLayout = lazy(() => import('./pages/accounting/AccountingLayout'))
const ChartOfAccountsPage = lazy(() => import('./pages/accounting/ChartOfAccountsPage'))
const JournalEntriesPage = lazy(() => import('./pages/accounting/JournalEntriesPage'))
const GeneralLedgerPage = lazy(() => import('./pages/accounting/GeneralLedgerPage'))
const TrialBalancePage = lazy(() => import('./pages/accounting/TrialBalancePage'))
const BalanceSheetPage = lazy(() => import('./pages/accounting/BalanceSheetPage'))
const IncomeStatementPage = lazy(() => import('./pages/accounting/IncomeStatementPage'))
const VATManagementPage = lazy(() => import('./pages/accounting/VATManagementPage'))

// Products Module
const ProductsLayout = lazy(() => import('./pages/products/ProductsLayout'))
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'))
const ProductCategoryPricingPage = lazy(() => import('./pages/products/ProductCategoryPricingPage'))
const CombosPage = lazy(() => import('./pages/products/CombosPage'))
const ComboFormPage = lazy(() => import('./pages/products/ComboFormPage'))
const PromotionsPage = lazy(() => import('./pages/products/PromotionsPage'))
const PromotionFormPage = lazy(() => import('./pages/products/PromotionFormPage'))
const ProductFormPage = lazy(() => import('./pages/products/ProductFormPage'))

function App() {
    const { isAuthenticated, user, logout } = useAuthStore()

    // Safety check: if user ID is in the old 'demo-*' format, force logout
    // so they re-login with a valid UUID. This fixes persistence errors.
    useEffect(() => {
        const checkAndRepairSession = async () => {
            if (isAuthenticated && user?.id.startsWith('demo-')) {
                console.warn('Invalid demo-ID detected, forcing session clear')
                await supabase.auth.signOut()
                logout()
                toast.success('Session updated for database compatibility. Please log in again.')
            }
        };
        checkAndRepairSession();
    }, [isAuthenticated, user, logout])

    // Initialize sync engine for automatic background sync (Story 3.5)
    useEffect(() => {
        initializeSyncEngine();
    }, [])

    // Initialize products cache when authenticated (Story 2.1)
    useEffect(() => {
        if (isAuthenticated && navigator.onLine) {
            initProductsCache();
        }

        // Cleanup: stop refresh interval on logout
        return () => {
            if (!isAuthenticated) {
                stopProductsCacheRefresh();
            }
        };
    }, [isAuthenticated])

    // Initialize cart persistence and restore cart on startup (Story 3.2)
    const cartPersistenceInitialized = useRef(false)

    useEffect(() => {
        // Only initialize once
        if (cartPersistenceInitialized.current) return
        cartPersistenceInitialized.current = true

        // Setup persistence subscription (debounced save on every change)
        initCartPersistence()

        // Restore persisted cart if it exists
        const restorePersistedCart = async () => {
            const persisted = loadCart()
            if (!persisted || persisted.items.length === 0) return

            // Validate items against current product catalog
            const { validItems, removedNames } = await validateAndFilterCartItems(persisted.items)

            // Filter locked items to only include valid item IDs
            const validItemIds = new Set(validItems.map(item => item.id))
            const validLockedIds = persisted.lockedItemIds.filter(id => validItemIds.has(id))

            // Restore cart state using existing restoreCartState function
            useCartStore.getState().restoreCartState(
                validItems,
                validLockedIds,
                persisted.activeOrderId,
                persisted.activeOrderNumber
            )

            // Restore other state fields
            if (persisted.orderType) {
                useCartStore.getState().setOrderType(persisted.orderType)
            }
            if (persisted.tableNumber) {
                useCartStore.getState().setTableNumber(persisted.tableNumber)
            }
            if (persisted.customerId || persisted.customerName) {
                useCartStore.getState().setCustomer(persisted.customerId, persisted.customerName)
            }
            if (persisted.discountType) {
                useCartStore.getState().setDiscount(
                    persisted.discountType,
                    persisted.discountValue,
                    persisted.discountReason
                )
            }

            // Notify user about cart restoration
            if (validItems.length > 0) {
                toast.success('Cart restored')
            }

            // Notify if items were removed due to unavailable products
            if (removedNames.length > 0) {
                toast(`${removedNames.length} items removed (unavailable)`, { icon: 'ℹ️' })
            }
        }

        restorePersistedCart()
    }, [])

    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/display" element={<CustomerDisplayPage />} />
                    <Route path="/mobile/login" element={<MobileLoginPage />} />

                    {/* Mobile App Routes (Fullscreen, mobile-optimized) */}
                    <Route
                        path="/mobile"
                        element={
                            isAuthenticated ? <MobileLayout /> : <Navigate to="/mobile/login" replace />
                        }
                    >
                        <Route index element={<MobileHomePage />} />
                        <Route path="catalog" element={<MobileCatalogPage />} />
                        <Route path="cart" element={<MobileCartPage />} />
                        <Route path="orders" element={<MobileOrdersPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>

                    {/* POS Routes (Fullscreen) - Critical path, loaded immediately */}
                    <Route
                        path="/pos"
                        element={
                            isAuthenticated ? (
                                <ModuleErrorBoundary moduleName="POS">
                                    <POSMainPage />
                                </ModuleErrorBoundary>
                            ) : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/kds"
                        element={
                            isAuthenticated ? (
                                <ModuleErrorBoundary moduleName="KDS">
                                    <KDSStationSelector />
                                </ModuleErrorBoundary>
                            ) : <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/kds/:station"
                        element={
                            isAuthenticated ? (
                                <ModuleErrorBoundary moduleName="KDS">
                                    <KDSMainPage />
                                </ModuleErrorBoundary>
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Back Office Routes (With Sidebar) */}
                    <Route
                        element={
                            isAuthenticated ? <BackOfficeLayout /> : <Navigate to="/login" replace />
                        }
                    >
                        {/* Inventory Module with Tabs */}
                        <Route path="/inventory" element={<RouteGuard permission="inventory.view"><InventoryLayout /></RouteGuard>}>
                            <Route index element={<StockPage />} />
                            <Route path="incoming" element={<IncomingStockPage />} />
                            <Route path="wasted" element={<WastedPage />} />
                            <Route path="production" element={<StockProductionPage />} />
                            <Route path="opname" element={<StockOpnameList />} />
                            <Route path="movements" element={<StockMovementsPage />} />
                        </Route>
                        {/* Inventory sub-pages outside layout */}
                        <Route path="/inventory/product/:id" element={<RouteGuard permission="inventory.view"><ProductDetailPage /></RouteGuard>} />
                        <Route path="/inventory/stock-opname/:id" element={<RouteGuard permission="inventory.view"><StockOpnameForm /></RouteGuard>} />
                        <Route path="/inventory/transfers" element={<RouteGuard permission="inventory.view"><InternalTransfersPage /></RouteGuard>} />
                        <Route path="/inventory/transfers/new" element={<RouteGuard permission="inventory.create"><TransferFormPage /></RouteGuard>} />
                        <Route path="/inventory/transfers/:id" element={<RouteGuard permission="inventory.view"><TransferDetailPage /></RouteGuard>} />
                        <Route path="/inventory/transfers/:id/edit" element={<RouteGuard permission="inventory.update"><TransferFormPage /></RouteGuard>} />
                        <Route path="/inventory/stock-by-location" element={<RouteGuard permission="inventory.view"><StockByLocationPage /></RouteGuard>} />
                        {/* Suppliers redirected to purchasing module */}
                        <Route path="/inventory/suppliers" element={<Navigate to="/purchasing/suppliers" replace />} />

                        <Route path="/stock" element={<Navigate to="/inventory" replace />} />
                        <Route path="/orders" element={<RouteGuard permission="sales.view"><OrdersPage /></RouteGuard>} />
                        <Route path="/production" element={<Navigate to="/inventory/production" replace />} />

                        {/* B2B Module Routes */}
                        <Route path="/b2b" element={<RouteGuard permission="sales.view"><B2BPage /></RouteGuard>} />
                        <Route path="/b2b/orders" element={<RouteGuard permission="sales.view"><B2BOrdersPage /></RouteGuard>} />
                        <Route path="/b2b/orders/new" element={<RouteGuard permission="sales.create"><B2BOrderFormPage /></RouteGuard>} />
                        <Route path="/b2b/orders/:id" element={<RouteGuard permission="sales.view"><B2BOrderDetailPage /></RouteGuard>} />
                        <Route path="/b2b/orders/:id/edit" element={<RouteGuard permission="sales.create"><B2BOrderFormPage /></RouteGuard>} />
                        <Route path="/b2b/payments" element={<RouteGuard permission="sales.view"><B2BPaymentsPage /></RouteGuard>} />

                        {/* Legacy routes - redirect to new locations */}
                        <Route path="/purchases" element={<Navigate to="/purchasing/purchase-orders" replace />} />
                        <Route path="/internal-moves" element={<Navigate to="/inventory/transfers" replace />} />

                        {/* Purchase Order Module Routes */}
                        <Route path="/purchasing/suppliers" element={<RouteGuard permission="inventory.view"><SuppliersPage /></RouteGuard>} />
                        <Route path="/purchasing/purchase-orders" element={<RouteGuard permission="inventory.view"><PurchaseOrdersPage /></RouteGuard>} />
                        <Route path="/purchasing/purchase-orders/new" element={<RouteGuard permission="inventory.create"><PurchaseOrderFormPage /></RouteGuard>} />
                        <Route path="/purchasing/purchase-orders/:id" element={<RouteGuard permission="inventory.view"><PurchaseOrderDetailPage /></RouteGuard>} />
                        <Route path="/purchasing/purchase-orders/:id/edit" element={<RouteGuard permission="inventory.update"><PurchaseOrderFormPage /></RouteGuard>} />

                        {/* Customers Module Routes */}
                        <Route path="/customers" element={<RouteGuard permission="customers.view"><CustomersPage /></RouteGuard>} />
                        <Route path="/customers/new" element={<RouteGuard permission="customers.create"><CustomerFormPage /></RouteGuard>} />
                        <Route path="/customers/categories" element={<RouteGuard permission="customers.view"><CustomerCategoriesPage /></RouteGuard>} />
                        <Route path="/customers/:id" element={<RouteGuard permission="customers.view"><CustomerDetailPage /></RouteGuard>} />
                        <Route path="/customers/:id/edit" element={<RouteGuard permission="customers.update"><CustomerFormPage /></RouteGuard>} />

                        {/* Products Module Routes with Layout */}
                        <Route path="/products" element={<RouteGuard permission="products.view"><ProductsLayout /></RouteGuard>}>
                            <Route index element={<ProductsPage />} />
                            <Route path="combos" element={<CombosPage />} />
                            <Route path="promotions" element={<PromotionsPage />} />
                        </Route>
                        {/* Product Form Route (outside layout for full page form) */}
                        <Route path="/products/new" element={<RouteGuard permission="products.create"><ProductFormPage /></RouteGuard>} />
                        {/* Combo Routes (outside layout for full page forms) */}
                        <Route path="/products/combos/new" element={<RouteGuard permission="products.create"><ComboFormPage /></RouteGuard>} />
                        <Route path="/products/combos/:id" element={<RouteGuard permission="products.view"><ComboFormPage /></RouteGuard>} />
                        <Route path="/products/combos/:id/edit" element={<RouteGuard permission="products.update"><ComboFormPage /></RouteGuard>} />
                        {/* Promotion Routes (outside layout for full page forms) */}
                        <Route path="/products/promotions/new" element={<RouteGuard permission="products.create"><PromotionFormPage /></RouteGuard>} />
                        <Route path="/products/promotions/:id" element={<RouteGuard permission="products.view"><PromotionFormPage /></RouteGuard>} />
                        <Route path="/products/promotions/:id/edit" element={<RouteGuard permission="products.update"><PromotionFormPage /></RouteGuard>} />
                        {/* Product Detail Routes */}
                        <Route path="/products/:id" element={<RouteGuard permission="products.view"><ProductDetailPage /></RouteGuard>} />
                        <Route path="/products/:id/edit" element={<RouteGuard permission="products.update"><ProductFormPage /></RouteGuard>} />
                        <Route path="/products/:id/pricing" element={<RouteGuard permission="products.pricing"><ProductCategoryPricingPage /></RouteGuard>} />

                        {/* Accounting Module Routes with Layout */}
                        <Route path="/accounting" element={<RouteGuard permission="accounting.view"><AccountingLayout /></RouteGuard>}>
                            <Route index element={<ChartOfAccountsPage />} />
                            <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
                            <Route path="journal-entries" element={<JournalEntriesPage />} />
                            <Route path="general-ledger" element={<GeneralLedgerPage />} />
                            <Route path="trial-balance" element={<TrialBalancePage />} />
                            <Route path="balance-sheet" element={<BalanceSheetPage />} />
                            <Route path="income-statement" element={<IncomeStatementPage />} />
                            <Route path="vat" element={<VATManagementPage />} />
                        </Route>

                        <Route path="/reports" element={<RouteGuard permission="reports.sales"><ModuleErrorBoundary moduleName="Reports"><ReportsPage /></ModuleErrorBoundary></RouteGuard>} />
                        <Route path="/users" element={<RouteGuard permission="users.view"><UsersPage /></RouteGuard>} />
                        <Route path="/users/permissions" element={<RouteGuard permission="users.roles"><PermissionsPage /></RouteGuard>} />

                        {/* Settings Module Routes with Layout */}
                        <Route path="/settings" element={<RouteGuard permission="settings.view"><ModuleErrorBoundary moduleName="Settings"><SettingsLayout /></ModuleErrorBoundary></RouteGuard>}>
                            <Route index element={<CompanySettingsPage />} />
                            {/* Dynamic category pages */}
                            <Route path="company" element={<CompanySettingsPage />} />
                            <Route path="pos" element={<CategorySettingsPage />} />
                            <Route path="tax" element={<TaxSettingsPage />} />
                            <Route path="inventory" element={<CategorySettingsPage />} />
                            <Route path="printing" element={<PrintingSettingsPage />} />
                            <Route path="notifications" element={<NotificationSettingsPage />} />
                            <Route path="localization" element={<CategorySettingsPage />} />
                            <Route path="integrations" element={<CategorySettingsPage />} />
                            <Route path="backup" element={<CategorySettingsPage />} />
                            <Route path="appearance" element={<CategorySettingsPage />} />
                            <Route path="advanced" element={<CategorySettingsPage />} />
                            {/* Epic 10 Phase 2: Custom settings pages */}
                            <Route path="pos_config" element={<POSConfigSettingsPage />} />
                            <Route path="financial" element={<FinancialSettingsPage />} />
                            <Route path="inventory_config" element={<InventoryConfigSettingsPage />} />
                            <Route path="loyalty" element={<LoyaltySettingsPage />} />
                            <Route path="b2b" element={<B2BSettingsPage />} />
                            <Route path="kds_config" element={<KDSConfigSettingsPage />} />
                            <Route path="display" element={<DisplaySettingsPage />} />
                            <Route path="sync_advanced" element={<SyncAdvancedSettingsPage />} />
                            <Route path="security" element={<SecurityPinSettingsPage />} />
                            {/* Specialized pages */}
                            <Route path="payments" element={<PaymentMethodsPage />} />
                            <Route path="hours" element={<BusinessHoursPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="history" element={<SettingsHistoryPage />} />
                            {/* Legacy pages from old settings (still accessible) */}
                            <Route path="sections" element={<SettingsPage />} />
                            <Route path="floorplan" element={<SettingsPage />} />
                            <Route path="kds" element={<SettingsPage />} />
                            <Route path="lan" element={<LanMonitoringPage />} />
                        </Route>
                        {/* Settings sub-pages outside layout */}
                        <Route path="/settings/roles" element={<RouteGuard permission="users.roles"><RolesPage /></RouteGuard>} />
                        <Route path="/settings/audit" element={<RouteGuard permission="settings.view"><AuditPage /></RouteGuard>} />
                        <Route path="/settings/sync" element={<RouteGuard permission="settings.view"><SyncStatusPage /></RouteGuard>} />

                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/pos" replace />} />
                    <Route path="*" element={<Navigate to="/pos" replace />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    )
}

export default App;
