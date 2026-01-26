import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Download } from 'lucide-react';
import { ReportingService } from '../../../services/ReportingService';
import { DailySalesStat } from '../../../types/reporting';
import { formatCurrency } from '../../../utils/helpers';

export const DailySalesTab = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DailySalesStat[]>([]);
    const [dateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        end: new Date()
    });

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const stats = await ReportingService.getDailySales(dateRange.start, dateRange.end);
            setData(stats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        // TODO: Implement CSV export
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t('common.loading', 'Loading data...')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    {t('reporting.reports.daily_sales_title', 'Daily Sales Performance')}
                </h3>
                <button onClick={handleDownload} className="btn btn-secondary flex items-center gap-2">
                    <Download size={16} />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                if (name === 'total_sales' || name === 'net_revenue' || name === 'avg_basket') return formatCurrency(value);
                                return value;
                            }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="total_sales" name={t('reporting.kpi.total_sales', 'Revenue')} fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="total_orders" name={t('reporting.kpi.total_orders', 'Orders')} fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.date', 'Date')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reporting.kpi.orders', 'Orders')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reporting.kpi.revenue', 'Revenue')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reporting.kpi.net_revenue', 'Net (ex. Tax)')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reporting.kpi.avg_basket', 'Avg Basket')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row) => (
                            <tr key={row.date} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(row.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {row.total_orders}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    {formatCurrency(row.total_sales)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {formatCurrency(row.net_revenue)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {formatCurrency(row.avg_basket)}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    {t('common.no_data', 'No data available for this period')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
