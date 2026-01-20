import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { supabase } from './lib/supabase'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// Layouts
import BackOfficeLayout from './layouts/BackOfficeLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import POSMainPage from './pages/pos/POSMainPage'
import toast from 'react-hot-toast'
import KDSMainPage from './pages/kds/KDSMainPage'
import KDSStationSelector from './pages/kds/KDSStationSelector'
import CustomerDisplayPage from './pages/display/CustomerDisplayPage'
import InventoryLayout from './pages/inventory/InventoryLayout'
import StockPage from './pages/inventory/StockPage'
import IncomingStockPage from './pages/inventory/IncomingStockPage'
import WastedPage from './pages/inventory/WastedPage'
import StockProductionPage from './pages/inventory/StockProductionPage'
import StockOpnameList from './pages/inventory/StockOpnameList'
import StockOpnameForm from './pages/inventory/StockOpnameForm'
import ProductDetailPage from './pages/inventory/ProductDetailPage'
// SuppliersPage moved to purchasing module
import OrdersPage from './pages/orders/OrdersPage'
// ProductionPage moved to inventory module as StockProductionPage
import ReportsPage from './pages/reports/ReportsPage'
import SalesReportsPage from './pages/reports/SalesReportsPage'
import UsersPage from './pages/users/UsersPage'
import SettingsPage from './pages/settings/SettingsPage'
import SettingsLayout from './pages/settings/SettingsLayout'
import CategorySettingsPage from './pages/settings/CategorySettingsPage'
import TaxSettingsPage from './pages/settings/TaxSettingsPage'
import PaymentMethodsPage from './pages/settings/PaymentMethodsPage'
import BusinessHoursPage from './pages/settings/BusinessHoursPage'
import SettingsHistoryPage from './pages/settings/SettingsHistoryPage'
import RolesPage from './pages/settings/RolesPage'
import AuditPage from './pages/settings/AuditPage'
import ProfilePage from './pages/profile/ProfilePage'
import B2BPage from './pages/b2b/B2BPage'
import B2BOrdersPage from './pages/b2b/B2BOrdersPage'
import B2BOrderFormPage from './pages/b2b/B2BOrderFormPage'
import B2BOrderDetailPage from './pages/b2b/B2BOrderDetailPage'
import B2BPaymentsPage from './pages/b2b/B2BPaymentsPage'
// Removed duplicate Purchase_Order_Module and InterSection_Stock_Movements
import SuppliersPage from './pages/purchasing/SuppliersPage'
import PurchaseOrdersPage from './pages/purchasing/PurchaseOrdersPage'
import PurchaseOrderFormPage from './pages/purchasing/PurchaseOrderFormPage'
import PurchaseOrderDetailPage from './pages/purchasing/PurchaseOrderDetailPage'
import CustomersPage from './pages/customers/CustomersPage'
import CustomerFormPage from './pages/customers/CustomerFormPage'
import CustomerDetailPage from './pages/customers/CustomerDetailPage'
import CustomerCategoriesPage from './pages/customers/CustomerCategoriesPage'
import ProductsLayout from './pages/products/ProductsLayout'
import ProductsPage from './pages/products/ProductsPage'
import ProductCategoryPricingPage from './pages/products/ProductCategoryPricingPage'
import CombosPage from './pages/products/CombosPage'
import ComboFormPage from './pages/products/ComboFormPage'
import PromotionsPage from './pages/products/PromotionsPage'
import StockMovementsPage from './pages/inventory/StockMovementsPage'
import InternalTransfersPage from './pages/inventory/InternalTransfersPage'
import TransferFormPage from './pages/inventory/TransferFormPage'
import TransferDetailPage from './pages/inventory/TransferDetailPage'
import StockByLocationPage from './pages/inventory/StockByLocationPage'

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
                toast.success('Session mise à jour pour compatibilité base de données. Veuillez vous reconnecter.')
            }
        };
        checkAndRepairSession();
    }, [isAuthenticated, user, logout])

    return (
        <ErrorBoundary>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/display" element={<CustomerDisplayPage />} />

                {/* POS Routes (Fullscreen) */}
                <Route
                    path="/pos"
                    element={
                        isAuthenticated ? <POSMainPage /> : <Navigate to="/login" replace />
                    }
                />
                <Route
                    path="/kds"
                    element={
                        isAuthenticated ? <KDSStationSelector /> : <Navigate to="/login" replace />
                    }
                />
                <Route
                    path="/kds/:station"
                    element={
                        isAuthenticated ? (
                            <KDSMainPage />
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
                    <Route path="/inventory" element={<InventoryLayout />}>
                        <Route index element={<StockPage />} />
                        <Route path="incoming" element={<IncomingStockPage />} />
                        <Route path="wasted" element={<WastedPage />} />
                        <Route path="production" element={<StockProductionPage />} />
                        <Route path="opname" element={<StockOpnameList />} />
                        <Route path="movements" element={<StockMovementsPage />} />
                    </Route>
                    {/* Inventory sub-pages outside layout */}
                    <Route path="/inventory/product/:id" element={<ProductDetailPage />} />
                    <Route path="/inventory/stock-opname/:id" element={<StockOpnameForm />} />
                    <Route path="/inventory/transfers" element={<InternalTransfersPage />} />
                    <Route path="/inventory/transfers/new" element={<TransferFormPage />} />
                    <Route path="/inventory/transfers/:id" element={<TransferDetailPage />} />
                    <Route path="/inventory/transfers/:id/edit" element={<TransferFormPage />} />
                    <Route path="/inventory/stock-by-location" element={<StockByLocationPage />} />
                    {/* Suppliers redirected to purchasing module */}
                    <Route path="/inventory/suppliers" element={<Navigate to="/purchasing/suppliers" replace />} />

                    <Route path="/stock" element={<Navigate to="/inventory" replace />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/production" element={<Navigate to="/inventory/production" replace />} />

                    {/* B2B Module Routes */}
                    <Route path="/b2b" element={<B2BPage />} />
                    <Route path="/b2b/orders" element={<B2BOrdersPage />} />
                    <Route path="/b2b/orders/new" element={<B2BOrderFormPage />} />
                    <Route path="/b2b/orders/:id" element={<B2BOrderDetailPage />} />
                    <Route path="/b2b/orders/:id/edit" element={<B2BOrderFormPage />} />
                    <Route path="/b2b/payments" element={<B2BPaymentsPage />} />

                    {/* Legacy routes - redirect to new locations */}
                    <Route path="/purchases" element={<Navigate to="/purchasing/purchase-orders" replace />} />
                    <Route path="/internal-moves" element={<Navigate to="/inventory/transfers" replace />} />

                    {/* Purchase Order Module Routes */}
                    <Route path="/purchasing/suppliers" element={<SuppliersPage />} />
                    <Route path="/purchasing/purchase-orders" element={<PurchaseOrdersPage />} />
                    <Route path="/purchasing/purchase-orders/new" element={<PurchaseOrderFormPage />} />
                    <Route path="/purchasing/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                    <Route path="/purchasing/purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />

                    {/* Customers Module Routes */}
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/new" element={<CustomerFormPage />} />
                    <Route path="/customers/categories" element={<CustomerCategoriesPage />} />
                    <Route path="/customers/:id" element={<CustomerDetailPage />} />
                    <Route path="/customers/:id/edit" element={<CustomerFormPage />} />

                    {/* Products Module Routes with Layout */}
                    <Route path="/products" element={<ProductsLayout />}>
                        <Route index element={<ProductsPage />} />
                        <Route path="combos" element={<CombosPage />} />
                        <Route path="promotions" element={<PromotionsPage />} />
                    </Route>
                    {/* Combo Routes (outside layout for full page forms) */}
                    <Route path="/products/combos/new" element={<ComboFormPage />} />
                    <Route path="/products/combos/:id" element={<ComboFormPage />} />
                    <Route path="/products/combos/:id/edit" element={<ComboFormPage />} />
                    {/* Promotion Routes (outside layout for full page forms) */}
                    <Route path="/products/promotions/new" element={<PromotionsPage />} />
                    <Route path="/products/promotions/:id" element={<PromotionsPage />} />
                    <Route path="/products/promotions/:id/edit" element={<PromotionsPage />} />
                    {/* Product Detail Routes */}
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/products/:id/edit" element={<ProductDetailPage />} />
                    <Route path="/products/:id/pricing" element={<ProductCategoryPricingPage />} />

                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reports/sales" element={<SalesReportsPage />} />
                    <Route path="/users" element={<UsersPage />} />

                    {/* Settings Module Routes with Layout */}
                    <Route path="/settings" element={<SettingsLayout />}>
                        <Route index element={<CategorySettingsPage />} />
                        {/* Dynamic category pages */}
                        <Route path="company" element={<CategorySettingsPage />} />
                        <Route path="pos" element={<CategorySettingsPage />} />
                        <Route path="tax" element={<TaxSettingsPage />} />
                        <Route path="inventory" element={<CategorySettingsPage />} />
                        <Route path="printing" element={<CategorySettingsPage />} />
                        <Route path="notifications" element={<CategorySettingsPage />} />
                        <Route path="localization" element={<CategorySettingsPage />} />
                        <Route path="security" element={<CategorySettingsPage />} />
                        <Route path="integrations" element={<CategorySettingsPage />} />
                        <Route path="backup" element={<CategorySettingsPage />} />
                        <Route path="appearance" element={<CategorySettingsPage />} />
                        <Route path="advanced" element={<CategorySettingsPage />} />
                        {/* Specialized pages */}
                        <Route path="payments" element={<PaymentMethodsPage />} />
                        <Route path="hours" element={<BusinessHoursPage />} />
                        <Route path="history" element={<SettingsHistoryPage />} />
                        {/* Legacy pages from old settings (still accessible) */}
                        <Route path="sections" element={<SettingsPage />} />
                        <Route path="floorplan" element={<SettingsPage />} />
                        <Route path="kds" element={<SettingsPage />} />
                    </Route>
                    {/* Settings sub-pages outside layout */}
                    <Route path="/settings/roles" element={<RolesPage />} />
                    <Route path="/settings/audit" element={<AuditPage />} />

                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/pos" replace />} />
                <Route path="*" element={<Navigate to="/pos" replace />} />
            </Routes>
        </ErrorBoundary>
    )
}

export default App;