import { useState, useEffect, lazy, Suspense } from 'react';
import { ChevronRight, ArrowLeft, Download } from 'lucide-react';
import { OfflineReportBanner } from '@/components/reports/OfflineReportBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getLastSyncTime } from '@/services/reports/offlineReportCache';
import { REPORT_CATEGORIES } from './ReportsConfig';
import { ReportPlaceholder } from '@/components/reports/ReportPlaceholder';
import { cn } from '@/lib/utils';

// Lazy-loaded report tab components
const OverviewTab = lazy(() => import('./components/OverviewTab').then(m => ({ default: m.OverviewTab })));
const SalesTab = lazy(() => import('./components/SalesTab').then(m => ({ default: m.SalesTab })));
const InventoryTab = lazy(() => import('./components/InventoryTab').then(m => ({ default: m.InventoryTab })));
const StockMovementTab = lazy(() => import('./components/StockMovementTab').then(m => ({ default: m.StockMovementTab })));
const SalesByCategoryTab = lazy(() => import('./components/SalesByCategoryTab').then(m => ({ default: m.SalesByCategoryTab })));
const PaymentMethodTab = lazy(() => import('./components/PaymentMethodTab').then(m => ({ default: m.PaymentMethodTab })));
const PurchaseDetailsTab = lazy(() => import('./components/PurchaseDetailsTab').then(m => ({ default: m.PurchaseDetailsTab })));
const PurchaseBySupplierTab = lazy(() => import('./components/PurchaseBySupplierTab').then(m => ({ default: m.PurchaseBySupplierTab })));
const AuditTab = lazy(() => import('./components/AuditTab').then(m => ({ default: m.AuditTab })));
const DailySalesTab = lazy(() => import('./components/DailySalesTab').then(m => ({ default: m.DailySalesTab })));
const ProductPerformanceTab = lazy(() => import('./components/ProductPerformanceTab').then(m => ({ default: m.ProductPerformanceTab })));
const ProfitLossTab = lazy(() => import('./components/ProfitLossTab').then(m => ({ default: m.ProfitLossTab })));
const SalesByCustomerTab = lazy(() => import('./components/SalesByCustomerTab').then(m => ({ default: m.SalesByCustomerTab })));
const SalesByHourTab = lazy(() => import('./components/SalesByHourTab').then(m => ({ default: m.SalesByHourTab })));
const SalesCancellationTab = lazy(() => import('./components/SalesCancellationTab').then(m => ({ default: m.SalesCancellationTab })));
const StockWarningTab = lazy(() => import('./components/StockWarningTab').then(m => ({ default: m.StockWarningTab })));
const ExpiredStockTab = lazy(() => import('./components/ExpiredStockTab').then(m => ({ default: m.ExpiredStockTab })));
const UnsoldProductsTab = lazy(() => import('./components/UnsoldProductsTab').then(m => ({ default: m.UnsoldProductsTab })));
const SessionCashBalanceTab = lazy(() => import('./components/SessionCashBalanceTab').then(m => ({ default: m.SessionCashBalanceTab })));
const B2BReceivablesTab = lazy(() => import('./components/B2BReceivablesTab').then(m => ({ default: m.B2BReceivablesTab })));
const ExpensesTab = lazy(() => import('./components/ExpensesTab').then(m => ({ default: m.ExpensesTab })));
const PriceChangesTab = lazy(() => import('./components/PriceChangesTab').then(m => ({ default: m.PriceChangesTab })));
const DeletedProductsTab = lazy(() => import('./components/DeletedProductsTab').then(m => ({ default: m.DeletedProductsTab })));
const PurchaseByDateTab = lazy(() => import('./components/PurchaseByDateTab').then(m => ({ default: m.PurchaseByDateTab })));
const OutstandingPurchasePaymentTab = lazy(() => import('./components/OutstandingPurchasePaymentTab').then(m => ({ default: m.OutstandingPurchasePaymentTab })));
const DiscountsVoidsTab = lazy(() => import('./components/DiscountsVoidsTab').then(m => ({ default: m.DiscountsVoidsTab })));
const AlertsDashboardTab = lazy(() => import('./components/AlertsDashboardTab').then(m => ({ default: m.AlertsDashboardTab })));
const ServiceSpeedTab = lazy(() => import('./components/ServiceSpeedTab').then(m => ({ default: m.ServiceSpeedTab })));

function ReportSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
                <div className="h-24 bg-white/5 rounded-xl" />
            </div>
            <div className="h-64 bg-white/5 rounded-xl mt-4" />
        </div>
    );
}

const ReportsPage = () => {
    const [activeCategoryId, setActiveCategoryId] = useState<string>('sales');
    const [activeReportId, setActiveReportId] = useState<string | null>(null);
    const { isOnline } = useNetworkStatus();
    const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

    useEffect(() => {
        getLastSyncTime('daily_kpis').then(setLastSyncDate);
    }, []);

    const activeCategory = REPORT_CATEGORIES.find(c => c.id === activeCategoryId) || REPORT_CATEGORIES[0];
    const activeReport = activeCategory.reports.find(r => r.id === activeReportId);

    // Component Mapping
    const renderReportComponent = (reportId: string) => {
        let component: React.ReactNode;
        switch (reportId) {
            case 'dashboard':
                component = <OverviewTab />;
                break;
            case 'sales_dashboard':
                component = <SalesTab />;
                break;
            case 'daily_sales':
                component = <DailySalesTab />;
                break;
            case 'product_performance':
                component = <ProductPerformanceTab />;
                break;
            case 'sales_by_category':
                component = <SalesByCategoryTab />;
                break;
            case 'stock_movement':
                component = <StockMovementTab />;
                break;
            case 'payment_by_method':
                component = <PaymentMethodTab />;
                break;
            case 'purchase_details':
                component = <PurchaseDetailsTab />;
                break;
            case 'purchase_by_supplier':
                component = <PurchaseBySupplierTab />;
                break;
            case 'inventory_dashboard':
                component = <InventoryTab />;
                break;
            case 'audit_log':
                component = <AuditTab />;
                break;
            case 'profit_loss':
                component = <ProfitLossTab />;
                break;
            case 'sales_by_customer':
                component = <SalesByCustomerTab />;
                break;
            case 'sales_by_hour':
                component = <SalesByHourTab />;
                break;
            case 'sales_cancellation':
                component = <SalesCancellationTab />;
                break;
            case 'stock_warning':
                component = <StockWarningTab />;
                break;
            case 'expired_stock':
                component = <ExpiredStockTab />;
                break;
            case 'unsold_products':
                component = <UnsoldProductsTab />;
                break;
            case 'cash_balance':
                component = <SessionCashBalanceTab />;
                break;
            case 'receivables':
                component = <B2BReceivablesTab />;
                break;
            case 'expenses':
                component = <ExpensesTab />;
                break;
            case 'price_changes':
                component = <PriceChangesTab />;
                break;
            case 'deleted_products':
                component = <DeletedProductsTab />;
                break;
            case 'purchase_by_date':
                component = <PurchaseByDateTab />;
                break;
            case 'outstanding_purchase_payment':
                component = <OutstandingPurchasePaymentTab />;
                break;
            case 'discounts_voids':
                component = <DiscountsVoidsTab />;
                break;
            case 'alerts_dashboard':
                component = <AlertsDashboardTab />;
                break;
            case 'service_speed':
                component = <ServiceSpeedTab />;
                break;
            default: {
                const report = activeCategory.reports.find(r => r.id === reportId);
                return (
                    <ReportPlaceholder
                        title={report?.title || 'Report Under Construction'}
                        description={report?.placeholder || 'This report is planned for a future release.'}
                        suggestedReport={{ id: 'dashboard', title: 'General Dashboard' }}
                        onNavigateToReport={(id) => {
                            setActiveCategoryId('overview');
                            setActiveReportId(id);
                        }}
                    />
                );
            }
        }
        return <Suspense fallback={<ReportSkeleton />}>{component}</Suspense>;
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-[var(--theme-bg-primary)] text-white overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[280px] bg-[var(--onyx-surface)] border-r border-white/5 flex flex-col shrink-0">
                <div className="py-6 px-8 border-b border-white/5">
                    <h1 className="text-xl font-bold text-white tracking-tight mb-1">Reports & Analytics</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Analytics & Logs</p>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                    {REPORT_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => {
                                setActiveCategoryId(category.id);
                                setActiveReportId(null);
                            }}
                            className={cn(
                                'flex items-center w-full py-3 px-4 bg-transparent border-none rounded-lg cursor-pointer text-left transition-all duration-200 text-[var(--theme-text-muted)] text-sm font-medium hover:bg-white/[0.02] hover:text-white',
                                activeCategoryId === category.id && 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                            )}
                        >
                            <category.icon size={18} className="mr-3 opacity-80" />
                            <span className="flex-1">{category.title}</span>
                            {activeCategoryId === category.id && <ChevronRight size={14} className="opacity-40" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-[var(--onyx-surface)] border-b border-white/5 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        {activeReportId ? (
                            <>
                                <button
                                    onClick={() => setActiveReportId(null)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-transparent text-[var(--theme-text-muted)] cursor-pointer transition-all duration-200 hover:bg-white/[0.05] hover:text-white hover:border-white/20"
                                    aria-label="Back to categories"
                                    title="Back"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">{activeReport?.title}</h2>
                                    <p className="text-sm text-[var(--theme-text-muted)]">{activeReport?.description}</p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">{activeCategory.title}</h2>
                                <p className="text-sm text-[var(--theme-text-muted)]">Select a report to view details</p>
                            </div>
                        )}
                    </div>

                    <div>
                        {activeReportId && (
                            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-transparent border border-white/10 text-white hover:border-white/20 transition-colors">
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                        )}
                    </div>
                </header>

                <OfflineReportBanner
                    isOffline={!isOnline}
                    lastSyncDate={lastSyncDate}
                    className="mx-6 mt-4"
                />

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-[var(--theme-bg-primary)]">
                    {activeReportId ? (
                        <div className="max-w-[1200px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-400">
                            {renderReportComponent(activeReportId)}
                        </div>
                    ) : (
                        <div className="max-w-[1200px] mx-auto w-full">
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                                {activeCategory.reports
                                    .filter((report) => !report.hidden)
                                    .map((report) => (
                                        <button
                                            key={report.id}
                                            onClick={() => setActiveReportId(report.id)}
                                            className="group flex flex-col items-start p-8 bg-[var(--onyx-surface)] border border-white/5 rounded-xl cursor-pointer transition-all duration-300 text-left h-full relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--color-gold)]/30"
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl mb-4 transition-all duration-300 group-hover:bg-[var(--color-gold)] group-hover:text-black group-hover:scale-110">
                                                <report.icon size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 transition-colors duration-200 group-hover:text-[var(--color-gold)]">
                                                {report.title}
                                            </h3>
                                            <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                                                {report.description}
                                            </p>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
