import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ReportingService } from '../../../services/ReportingService';
import { ProductPerformanceStat } from '../../../types/reporting';
import { formatCurrency } from '../../../utils/helpers';

export const ProductPerformanceTab = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ProductPerformanceStat[]>([]);
    const [dateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        end: new Date()
    });

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        try {
            const stats = await ReportingService.getProductPerformance(dateRange.start, dateRange.end);
            setData(stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>;

    const top5 = data.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    {t('reporting.reports.product_performance_title', 'Top Products by Revenue')}
                </h3>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={top5}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 40,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="product_name" width={150} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="total_revenue" name="Revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.product', 'Product')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.quantity', 'Qty Sold')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reporting.kpi.revenue', 'Revenue')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reporting.kpi.avg_price', 'Avg Price')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row) => (
                            <tr key={row.product_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Package size={16} className="text-gray-400" />
                                        {row.product_name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {row.quantity_sold}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {formatCurrency(row.total_revenue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {formatCurrency(row.avg_price)}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    {t('common.no_data')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
