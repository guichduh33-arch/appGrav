import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, LayoutGrid, DollarSign, Package, ShieldAlert } from 'lucide-react';
import { OverviewTab } from './components/OverviewTab';
import { SalesTab } from './components/SalesTab';
import { InventoryTab } from './components/InventoryTab';
import { AuditTab } from './components/AuditTab';
import './ReportsPage.css';

const ReportsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'audit'>('overview');

    return (
        <div className="reports-page p-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('reporting.title')}</h1>
                    <p className="text-gray-500 text-sm mt-1">{t('reporting.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
                        <Download size={18} />
                        {t('common.export_pdf')}
                    </button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto gap-4 mb-8 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutGrid size={18} />
                    {t('reporting.tabs.overview')}
                </button>
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'sales'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <DollarSign size={18} />
                    {t('reporting.tabs.sales')}
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'inventory'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Package size={18} />
                    {t('reporting.tabs.inventory')}
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'audit'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ShieldAlert size={18} />
                    {t('reporting.tabs.audit')}
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'sales' && <SalesTab />}
                {activeTab === 'inventory' && <InventoryTab />}
                {activeTab === 'audit' && <AuditTab />}
            </div>
        </div>
    );
};

export default ReportsPage;
