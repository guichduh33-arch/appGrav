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
import Purchase_Order_Module from './pages/Purchase_Order_Module'
import InterSection_Stock_Movements from './pages/InterSection_Stock_Movements'
import PurchasingSuppliersPage from './pages/purchasing/SuppliersPage'
import PurchaseOrdersPage from './pages/purchasing/PurchaseOrdersPage'
import PurchaseOrderFormPage from './pages/purchasing/PurchaseOrderFormPage'
import PurchaseOrderDetailPage from './pages/purchasing/PurchaseOrderDetailPage'

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
                    <Route path="/b2b" element={<B2BPage />} />
                    <Route path="/purchases" element={<Purchase_Order_Module />} />
                    <Route path="/internal-moves" element={<InterSection_Stock_Movements />} />

                    {/* Purchase Order Module Routes */}
                    <Route path="/purchasing/suppliers" element={<PurchasingSuppliersPage />} />
                    <Route path="/purchasing/purchase-orders" element={<PurchaseOrdersPage />} />
                    <Route path="/purchasing/purchase-orders/new" element={<PurchaseOrderFormPage />} />
                    <Route path="/purchasing/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                    <Route path="/purchasing/purchase-orders/:id/edit" element={<PurchaseOrderFormPage />} />

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