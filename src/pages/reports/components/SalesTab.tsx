import { useEffect, useState } from 'react';
import { ReportingService } from '../../../services/ReportingService';
import { PaymentMethodStat, SalesComparison } from '../../../types/reporting';
import { formatCurrency } from '../../../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const SalesTab = () => {
    const [paymentStats, setPaymentStats] = useState<PaymentMethodStat[]>([]);
    const [comparison, setComparison] = useState<SalesComparison[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        const prevEnd = new Date(start);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - 7);

        Promise.all([
            ReportingService.getPaymentMethodStats(),
            ReportingService.getSalesComparison(start, end, prevStart, prevEnd)
        ]).then(([payData, compData]) => {
            setPaymentStats(payData);
            setComparison(compData);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    // Transform Payment Data for Chart
    const pieData = paymentStats.reduce((acc, curr) => {
        const existing = acc.find(x => x.name === curr.payment_method);
        if (existing) {
            existing.value += curr.total_revenue;
        } else {
            acc.push({ name: curr.payment_method, value: curr.total_revenue });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-6">Payment Methods (7d)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number | undefined) => formatCurrency(val || 0)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* N vs N-1 Chart (Simplified as Bar Chart of Totals) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-6">Period Comparison (Week)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparison}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="period_label" tickFormatter={(val) => val === 'current' ? 'This Week' : 'Previous'} />
                                <YAxis tickFormatter={(val) => (val / 1000) + 'k'} />
                                <Tooltip formatter={(val: number | undefined) => formatCurrency(val || 0)} />
                                <Bar dataKey="total_revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="net_revenue" fill="#10b981" name="Net" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 box-border">
                    <h3 className="font-semibold text-gray-800">Payment Method Detail</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 font-medium">Method</th>
                            <th className="px-6 py-3 font-medium text-right">Transactions</th>
                            <th className="px-6 py-3 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paymentStats.map((stat, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900 capitalize">{stat.payment_method}</td>
                                <td className="px-6 py-3 text-right text-gray-600">{stat.transaction_count}</td>
                                <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatCurrency(stat.total_revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
