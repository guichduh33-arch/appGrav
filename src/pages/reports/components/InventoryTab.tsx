import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportingService } from '../../../services/ReportingService';
import { InventoryValuation, StockWaste } from '../../../types/reporting';
import { formatCurrency } from '../../../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444'];

export const InventoryTab = () => {
    const { t } = useTranslation();
    const [valuation, setValuation] = useState<InventoryValuation | null>(null);
    const [waste, setWaste] = useState<StockWaste[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            ReportingService.getInventoryValuation(),
            ReportingService.getStockWasteReport()
        ]).then(([valData, wasteData]) => {
            setValuation(valData);
            setWaste(wasteData);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>{t('common.loading')}</div>;

    // Prepare Waste Data for Chart (Group by Reason)
    const wasteByReason = waste.reduce((acc, curr) => {
        const existing = acc.find(x => x.name === curr.reason);
        if (existing) {
            existing.value += curr.loss_value_at_cost;
        } else {
            acc.push({ name: curr.reason, value: curr.loss_value_at_cost });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    return (
        <div className="space-y-8">
            {/* Valuation Cards */}
            {valuation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">{t('reporting.inventory.stock_value_cost')}</h3>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {formatCurrency(valuation.total_valuation_cost)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{valuation.total_skus} {t('reporting.inventory.references')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">{t('reporting.inventory.stock_value_retail')}</h3>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {formatCurrency(valuation.total_valuation_retail)}
                        </div>
                        <p className="text-xs text-green-500 mt-1">
                            {t('reporting.inventory.potential')}: {formatCurrency(valuation.total_valuation_retail - valuation.total_valuation_cost)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">{t('reporting.inventory.items_in_stock')}</h3>
                        <div className="mt-2 text-3xl font-bold text-gray-900">
                            {valuation.total_items_in_stock.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Waste Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-6">{t('reporting.inventory.wastage_distribution')}</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={wasteByReason}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {wasteByReason.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number | undefined) => formatCurrency(val || 0)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">{t('reporting.inventory.wastage_detail')}</h3>
                    <div className="overflow-auto max-h-80">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 border-b">
                                <tr>
                                    <th className="pb-2">{t('table.product')}</th>
                                    <th className="pb-2">{t('table.reason')}</th>
                                    <th className="pb-2 text-right">{t('table.qty')}</th>
                                    <th className="pb-2 text-right">{t('table.cost')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waste.map((item, idx) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2">{item.product_name}</td>
                                        <td className="py-2 text-gray-500">{item.reason}</td>
                                        <td className="py-2 text-right font-medium">{item.waste_quantity}</td>
                                        <td className="py-2 text-right text-red-500">
                                            {formatCurrency(item.loss_value_at_cost)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
