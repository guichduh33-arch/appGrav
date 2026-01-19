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
import InventoryPage from './pages/inventory/InventoryPage'
import ProductDetailPage from './pages/inventory/ProductDetailPage'
import StockOpnameList from './pages/inventory/StockOpnameList'
import StockOpnameForm from './pages/inventory/StockOpnameForm'
import SuppliersPage from './pages/inventory/SuppliersPage'
import OrdersPage from './pages/orders/OrdersPage'
import ProductionPage from './pages/production/ProductionPage'
import ReportsPage from './pages/reports/ReportsPage'
import SalesReportsPage from './pages/reports/SalesReportsPage'
import UsersPage from './pages/users/UsersPage'
import SettingsPage from './pages/settings/SettingsPage'
import B2BPage from './pages/b2b/B2BPage'
import B2BOrdersPage from './pages/b2b/B2BOrdersPage'
import B2BOrderFormPage from './pages/b2b/B2BOrderFormPage'
import B2BOrderDetailPage from './pages/b2b/B2BOrderDetailPage'
import B2BPaymentsPage from './pages/b2b/B2BPaymentsPage'
import Purchase_Order_Module from './pages/Purchase_Order_Module'
import InterSection_Stock_Movements from './pages/InterSection_Stock_Movements'
import PurchasingSuppliersPage from './pages/purchasing/SuppliersPage'
import PurchaseOrdersPage from './pages/purchasing/PurchaseOrdersPage'
import PurchaseOrderFormPage from './pages/purchasing/PurchaseOrderFormPage'
import PurchaseOrderDetailPage from './pages/purchasing/PurchaseOrderDetailPage'
import CustomersPage from './pages/customers/CustomersPage'
import CustomerFormPage from './pages/customers/CustomerFormPage'
import CustomerDetailPage from './pages/customers/CustomerDetailPage'
import CustomerCategoriesPage from './pages/customers/CustomerCategoriesPage'
import ProductsPage from './pages/products/ProductsPage'
import ProductCategoryPricingPage from './pages/products/ProductCategoryPricingPage'

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
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/inventory/product/:id" element={<ProductDetailPage />} />
                    <Route path="/inventory/suppliers" element={<SuppliersPage />} />
                    <Route path="/inventory/stock-opname" element={<StockOpnameList />} />
                    <Route path="/inventory/stock-opname/:id" element={<StockOpnameForm />} />
                    <Route path="/stock" element={<Navigate to="/inventory" replace />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/production" element={<ProductionPage />} />

                    {/* B2B Module Routes */}
                    <Route path="/b2b" element={<B2BPage />} />
                    <Route path="/b2b/orders" element={<B2BOrdersPage />} />
                    <Route path="/b2b/orders/new" element={<B2BOrderFormPage />} />
                    <Route path="/b2b/orders/:id" element={<B2BOrderDetailPage />} />
                    <Route path="/b2b/orders/:id/edit" element={<B2BOrderFormPage />} />
                    <Route path="/b2b/payments" element={<B2BPaymentsPage />} />

                    <Route path="/purchases" element={<Purchase_Order_Module />} />
                    <Route path="/internal-moves" element={<InterSection_Stock_Movements />} />

                    {/* Purchase Order Module Routes */}
                    <Route path="/purchasing/suppliers" element={<PurchasingSuppliersPage />} />
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

                    {/* Products Module Routes */}
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/products/:id/edit" element={<ProductDetailPage />} />
                    <Route path="/products/:id/pricing" element={<ProductCategoryPricingPage />} />

                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reports/sales" element={<SalesReportsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/pos" replace />} />
                <Route path="*" element={<Navigate to="/pos" replace />} />
            </Routes>
        </ErrorBoundary>
    )
}

export default App;