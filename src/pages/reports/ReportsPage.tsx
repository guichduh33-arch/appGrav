import { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Download } from 'lucide-react';
import { OfflineReportBanner } from '@/components/reports/OfflineReportBanner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getLastSyncTime } from '@/services/reports/offlineReportCache';
import { OverviewTab } from './components/OverviewTab';
import { SalesTab } from './components/SalesTab';
import { InventoryTab } from './components/InventoryTab';
import { StockMovementTab } from './components/StockMovementTab';
import { SalesByCategoryTab } from './components/SalesByCategoryTab';
import { PaymentMethodTab } from './components/PaymentMethodTab';
import { PurchaseDetailsTab } from './components/PurchaseDetailsTab';
import { PurchaseBySupplierTab } from './components/PurchaseBySupplierTab';
import { AuditTab } from './components/AuditTab';
import { DailySalesTab } from './components/DailySalesTab';
import { ProductPerformanceTab } from './components/ProductPerformanceTab';
// Epic 4: Sales Reports
import { ProfitLossTab } from './components/ProfitLossTab';
import { SalesByCustomerTab } from './components/SalesByCustomerTab';
import { SalesByHourTab } from './components/SalesByHourTab';
import { SalesCancellationTab } from './components/SalesCancellationTab';
// Epic 5: Inventory Reports
import { StockWarningTab } from './components/StockWarningTab';
import { ExpiredStockTab } from './components/ExpiredStockTab';
import { UnsoldProductsTab } from './components/UnsoldProductsTab';
// Epic 6: Finance Reports
import { SessionCashBalanceTab } from './components/SessionCashBalanceTab';
import { B2BReceivablesTab } from './components/B2BReceivablesTab';
import { ExpensesTab } from './components/ExpensesTab';
// Epic 7: Audit & Purchases
import { PriceChangesTab } from './components/PriceChangesTab';
import { DeletedProductsTab } from './components/DeletedProductsTab';
import { PurchaseByDateTab } from './components/PurchaseByDateTab';
import { OutstandingPurchasePaymentTab } from './components/OutstandingPurchasePaymentTab';
// Epic 8: Financial Reports
import { DiscountsVoidsTab } from './components/DiscountsVoidsTab';
import { AlertsDashboardTab } from './components/AlertsDashboardTab';
import { REPORT_CATEGORIES } from './ReportsConfig';
import { ReportPlaceholder } from '@/components/reports/ReportPlaceholder';
import { cn } from '@/lib/utils';

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
        switch (reportId) {
            case 'dashboard':
                return <OverviewTab />;
            case 'sales_dashboard':
                return <SalesTab />;
            case 'daily_sales':
                return <DailySalesTab />;
            case 'product_performance':
                return <ProductPerformanceTab />;
            case 'sales_by_category':
                return <SalesByCategoryTab />;
            case 'stock_movement':
                return <StockMovementTab />;
            case 'payment_by_method':
                return <PaymentMethodTab />;
            case 'purchase_details':
                return <PurchaseDetailsTab />;
            case 'purchase_by_supplier':
                return <PurchaseBySupplierTab />;
            case 'inventory_dashboard':
                return <InventoryTab />;
            case 'audit_log':
                return <AuditTab />;
            // Epic 4: Sales Reports
            case 'profit_loss':
                return <ProfitLossTab />;
            case 'sales_by_customer':
                return <SalesByCustomerTab />;
            case 'sales_by_hour':
                return <SalesByHourTab />;
            case 'sales_cancellation':
                return <SalesCancellationTab />;
            // Epic 5: Inventory Reports
            case 'stock_warning':
                return <StockWarningTab />;
            case 'expired_stock':
                return <ExpiredStockTab />;
            case 'unsold_products':
                return <UnsoldProductsTab />;
            // Epic 6: Finance Reports
            case 'cash_balance':
                return <SessionCashBalanceTab />;
            case 'receivables':
                return <B2BReceivablesTab />;
            case 'expenses':
                return <ExpensesTab />;
            // Epic 7: Audit & Purchases
            case 'price_changes':
                return <PriceChangesTab />;
            case 'deleted_products':
                return <DeletedProductsTab />;
            case 'purchase_by_date':
                return <PurchaseByDateTab />;
            case 'outstanding_purchase_payment':
                return <OutstandingPurchasePaymentTab />;
            // Epic 8: Discounts & Alerts
            case 'discounts_voids':
                return <DiscountsVoidsTab />;
            case 'alerts_dashboard':
                return <AlertsDashboardTab />;
            // Placeholders for remaining reports
            default: {
                // Check if report has a custom placeholder message
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
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="py-6 px-8 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Reports & Analytics</h1>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Analytics & Logs</p>
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
                                'flex items-center w-full py-3 px-4 bg-transparent border-none rounded-lg cursor-pointer text-left transition-all duration-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-gray-900',
                                activeCategoryId === category.id && 'bg-primary/10 text-primary-deep'
                            )}
                        >
                            <category.icon size={18} className="mr-3 opacity-80" />
                            <span className="flex-1">{category.title}</span>
                            {activeCategoryId === category.id && <ChevronRight size={14} className="opacity-40 transition-transform duration-200 group-hover:opacity-80 group-hover:translate-x-0.5" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        {activeReportId ? (
                            <>
                                <button
                                    onClick={() => setActiveReportId(null)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-600 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
                                    aria-label="Back to categories"
                                    title="Back"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{activeReport?.title}</h2>
                                    <p className="text-sm text-gray-500">{activeReport?.description}</p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{activeCategory.title}</h2>
                                <p className="text-sm text-gray-500">Select a report to view details</p>
                            </div>
                        )}
                    </div>

                    <div>
                        {activeReportId && (
                            <button className="btn btn-secondary">
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
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
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
                                            className="group flex flex-col items-start p-8 bg-white border border-gray-200 rounded-2xl cursor-pointer transition-all duration-300 text-left h-full relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-light"
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                                                <report.icon size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors duration-200 group-hover:text-primary-deep">
                                                {report.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">
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
