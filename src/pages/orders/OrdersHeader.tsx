import { RefreshCw, Download, ClipboardList } from 'lucide-react';
import type { Order } from './ordersPageHelpers';
import { exportOrdersCsv } from './ordersPageHelpers';

interface OrdersHeaderProps {
    isFetching: boolean;
    filteredOrders: Order[];
    dateFrom: string;
    dateTo: string;
    onRefetch: () => void;
}

const OrdersHeader = ({ isFetching, filteredOrders, dateFrom, dateTo, onRefetch }: OrdersHeaderProps) => {
    return (
        <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                    <ClipboardList size={20} className="text-[var(--color-gold)]" />
                </div>
                <h1 className="font-display text-3xl font-bold text-white">
                    Live Orders
                </h1>
            </div>
            <div className="flex gap-2">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl text-sm font-medium hover:border-white/20 transition-colors"
                    onClick={onRefetch}
                    disabled={isFetching}
                >
                    <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                    Refresh
                </button>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl text-sm font-medium hover:border-white/20 transition-colors"
                    onClick={() => exportOrdersCsv(filteredOrders, dateFrom, dateTo)}
                >
                    <Download size={16} />
                    Export
                </button>
            </div>
        </header>
    );
};

export default OrdersHeader;
