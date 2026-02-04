import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';
import { ReportingService } from '../../../services/ReportingService';
import { SalesComparison } from '../../../types/reporting';
import { formatCurrency } from '../../../utils/helpers';

export const OverviewTab = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ current: SalesComparison | null; previous: SalesComparison | null }>({
        current: null,
        previous: null,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7); // Last 7 days

            const prevEnd = new Date(start);
            const prevStart = new Date(prevEnd);
            prevStart.setDate(prevStart.getDate() - 7);

            const comparison = await ReportingService.getSalesComparison(start, end, prevStart, prevEnd);

            setData({
                current: comparison.find(c => c.period_label === 'current') || null,
                previous: comparison.find(c => c.period_label === 'previous') || null,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTrend = (curr: number, prev: number) => {
        if (!prev) return 100;
        return ((curr - prev) / prev) * 100;
    };

    if (loading) return <div>Loading...</div>;
    if (!data.current) return <div>No data available.</div>;

    const revenueTrend = calculateTrend(data.current.total_revenue, data.previous?.total_revenue || 0);
    const ordersTrend = calculateTrend(data.current.transaction_count, data.previous?.transaction_count || 0);
    const bucketTrend = calculateTrend(data.current.avg_basket, data.previous?.avg_basket || 0);

    return (
        <div className="space-y-6">
            <div className="kpi-grid">
                {/* Revenue */}
                <div className="kpi-card">
                    <div className="kpi-card__header">
                        <div className="kpi-card__icon sales"><DollarSign size={20} /></div>
                        <div className={`kpi-card__trend ${revenueTrend >= 0 ? 'up' : 'down'}`}>
                            {revenueTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(revenueTrend).toFixed(1)}%
                        </div>
                    </div>
                    <div className="kpi-card__value">{formatCurrency(data.current.total_revenue)}</div>
                    <div className="kpi-card__label">Revenue (7d)</div>
                </div>

                {/* Orders */}
                <div className="kpi-card">
                    <div className="kpi-card__header">
                        <div className="kpi-card__icon orders"><ShoppingBag size={20} /></div>
                        <div className={`kpi-card__trend ${ordersTrend >= 0 ? 'up' : 'down'}`}>
                            {ordersTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(ordersTrend).toFixed(1)}%
                        </div>
                    </div>
                    <div className="kpi-card__value">{data.current.transaction_count}</div>
                    <div className="kpi-card__label">Orders</div>
                </div>

                {/* Avg Basket */}
                <div className="kpi-card">
                    <div className="kpi-card__header">
                        <div className="kpi-card__icon avg"><BarChart3 size={20} /></div>
                        <div className={`kpi-card__trend ${bucketTrend >= 0 ? 'up' : 'down'}`}>
                            {bucketTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(bucketTrend).toFixed(1)}%
                        </div>
                    </div>
                    <div className="kpi-card__value">{formatCurrency(data.current.avg_basket)}</div>
                    <div className="kpi-card__label">Average Transaction Value (ATV)</div>
                </div>
            </div>
        </div>
    );
};
