import { useState } from 'react';
import { ChevronRight, ArrowLeft, Download } from 'lucide-react';
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
import { REPORT_CATEGORIES } from './ReportsConfig';
import './ReportsPage.css';

const ReportsPage = () => {
    const [activeCategoryId, setActiveCategoryId] = useState<string>('sales');
    const [activeReportId, setActiveReportId] = useState<string | null>(null);

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
                return (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <h3 className="text-lg font-medium text-gray-900">Coming soon</h3>
                    </div>
                );
            case 'alerts_dashboard':
                return (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <h3 className="text-lg font-medium text-gray-900">Coming soon</h3>
                    </div>
                );
            // Placeholders for remaining reports
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <div className="p-4 bg-gray-50 rounded-full mb-4">
                            {activeReport?.icon && <activeReport.icon size={48} className="text-gray-300" />}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Report Under Construction</h3>
                        <p className="mt-1">Use the existing dashboards for now.</p>
                    </div>
                );
        }
    };

    return (
        <div className="reports-layout">
            {/* Sidebar */}
            <aside className="reports-sidebar">
                <div className="reports-sidebar__header">
                    <h1 className="reports-sidebar__title">Reports & Analytics</h1>
                    <p className="reports-sidebar__subtitle">Analytics & Logs</p>
                </div>
                <nav className="reports-sidebar__nav">
                    {REPORT_CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => {
                                setActiveCategoryId(category.id);
                                setActiveReportId(null); // Reset report when changing category
                            }}
                            className={`reports-nav-item ${activeCategoryId === category.id ? 'active' : ''}`}
                        >
                            <category.icon size={18} className="reports-nav-item__icon" />
                            <span className="reports-nav-item__label">{category.title}</span>
                            {activeCategoryId === category.id && <ChevronRight size={14} className="reports-nav-item__arrow" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="reports-main">
                {/* Header */}
                <header className="reports-header">
                    <div className="reports-header__left">
                        {activeReportId ? (
                            <>
                                <button
                                    onClick={() => setActiveReportId(null)}
                                    className="reports-back-btn"
                                    aria-label="Back to categories"
                                    title="Back"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h2 className="reports-header__title">{activeReport?.title}</h2>
                                    <p className="reports-header__subtitle">{activeReport?.description}</p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <h2 className="reports-header__title">{activeCategory.title}</h2>
                                <p className="reports-header__subtitle">Select a report to view details</p>
                            </div>
                        )}
                    </div>

                    <div className="reports-header__actions">
                        {activeReportId && (
                            <button className="btn btn-secondary">
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Content Body */}
                <div className="reports-content">
                    {activeReportId ? (
                        <div className="reports-content__container animate-fade-in">
                            {renderReportComponent(activeReportId)}
                        </div>
                    ) : (
                        <div className="reports-content__container">
                            <div className="reports-grid">
                                {activeCategory.reports.map((report) => (
                                    <button
                                        key={report.id}
                                        onClick={() => setActiveReportId(report.id)}
                                        className="report-card-btn group"
                                    >
                                        <div className="report-card-btn__icon-wrapper">
                                            <report.icon size={24} />
                                        </div>
                                        <h3 className="report-card-btn__title">
                                            {report.title}
                                        </h3>
                                        <p className="report-card-btn__desc">
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
