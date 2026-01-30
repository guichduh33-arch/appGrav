import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, ArrowUpRight, DollarSign, ShoppingBag, CreditCard, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// Mock Data for the chart
const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
];

// Mock Data for transactions
const recentTransactions = [
    { id: '#ORD-7829', time: '10:24 AM', customer: 'Walk-in Customer', items: '2x Croissant, 1x Latte', total: '€12.50', status: 'completed' },
    { id: '#ORD-7828', time: '10:15 AM', customer: 'John Doe', items: '1x Sourdough Loaf', total: '€6.00', status: 'completed' },
    { id: '#ORD-7827', time: '09:45 AM', customer: 'Alice Smith', items: 'Birthday Cake (Custom)', total: '€45.00', status: 'pending' },
    { id: '#ORD-7826', time: '09:30 AM', customer: 'Walk-in Customer', items: '3x Cookies, 2x Coffee', total: '€18.20', status: 'completed' },
    { id: '#ORD-7825', time: '09:12 AM', customer: 'Bob & Co', items: 'Catering Order (Small)', total: '€120.00', status: 'completed' },
];

export default function SalesReportsPage() {
    const [dateRange] = useState('Oct 1, 2023 - Oct 31, 2023');

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Report</h1>
                    <p className="text-gray-500 mt-1">Overview of your bakery's performance.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            {dateRange}
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1"></div>

                    <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                        Export PDF
                    </Button>
                    <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                        Export CSV
                    </Button>
                </div>
            </header>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value="€124,500"
                    trend="+12.5%"
                    isPositive={true}
                    icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                    title="Total Orders"
                    value="1,542"
                    trend="+8.2%"
                    isPositive={true}
                    icon={<ShoppingBag className="w-5 h-5 text-purple-600" />}
                />
                <MetricCard
                    title="Avg. Order Value"
                    value="€80.74"
                    trend="-2.1%"
                    isPositive={false}
                    icon={<CreditCard className="w-5 h-5 text-orange-600" />}
                />
                <MetricCard
                    title="Top Product"
                    value="Sourdough"
                    subValue="405 units sold"
                    icon={<Award className="w-5 h-5 text-yellow-600" />}
                />
            </div>

            {/* Main Chart Section */}
            <Card className="p-1">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
                        <p className="text-sm text-gray-500">Gross revenue generated from all sales channels.</p>
                    </div>
                    <select
                        title="Select Time Period"
                        aria-label="Select Time Period"
                        className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-md py-1.5 pl-3 pr-8 focus:ring-1 focus:ring-blue-500"
                    >
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
                <div className="h-[400px] w-full p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1E293B', fontWeight: 600 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Recent Transactions Table */}
            <Card title="Recent Transactions">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{tx.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-500">{tx.time}</td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{tx.customer}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{tx.items}</td>
                                    <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">{tx.total}</td>
                                    <td className="py-3 px-4 text-center">
                                        <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                                            {tx.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="border-t border-gray-100 p-4 flex justify-center">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
                        View All Transactions
                    </Button>
                </div>
            </Card>
        </div>
    );
}

// Sub-component for KPI Cards to keep main clean
function MetricCard({ title, value, trend, isPositive, subValue, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-[140px] relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500">{title}</span>
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    {icon}
                </div>
            </div>

            <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {subValue && <div className="text-sm text-gray-500 mt-1">{subValue}</div>}
            </div>

            {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium mt-auto ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {trend}
                    <span className="text-gray-400 font-normal ml-1">vs last month</span>
                </div>
            )}
        </div>
    );
}
