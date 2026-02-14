import { Search, Calendar, Filter, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getStatusLabel,
    ORDER_STATUSES,
} from './ordersPageHelpers';
import type { OrderStatus, OrderType, PaymentStatus } from './ordersPageHelpers';

interface OrdersFiltersProps {
    searchQuery: string;
    dateFrom: string;
    dateTo: string;
    typeFilter: OrderType;
    paymentFilter: PaymentStatus;
    statusFilter: OrderStatus;
    onSearchChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onTypeChange: (value: OrderType) => void;
    onPaymentChange: (value: PaymentStatus) => void;
    onStatusChange: (value: OrderStatus) => void;
}

const inputClasses = 'h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-colors min-w-[150px] max-md:w-full';

const labelClasses = 'flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]';

const OrdersFilters = ({
    searchQuery,
    dateFrom,
    dateTo,
    typeFilter,
    paymentFilter,
    statusFilter,
    onSearchChange,
    onDateFromChange,
    onDateToChange,
    onTypeChange,
    onPaymentChange,
    onStatusChange,
}: OrdersFiltersProps) => {
    return (
        <>
            {/* Filter Controls */}
            <div className="flex gap-3 mb-4 flex-wrap max-md:flex-col">
                <div className="flex flex-col gap-1.5">
                    <label className={labelClasses}>Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            className={cn(inputClasses, 'pl-9')}
                            placeholder="Order #, customer..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--theme-text-muted)]" />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={labelClasses} htmlFor="date-from">
                        <Calendar size={10} /> Start Date
                    </label>
                    <input
                        id="date-from"
                        type="date"
                        className={inputClasses}
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={labelClasses} htmlFor="date-to">
                        <Calendar size={10} /> End Date
                    </label>
                    <input
                        id="date-to"
                        type="date"
                        className={inputClasses}
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={labelClasses} htmlFor="order-type">
                        <Filter size={10} /> Type
                    </label>
                    <select
                        id="order-type"
                        className={inputClasses}
                        value={typeFilter}
                        onChange={(e) => onTypeChange(e.target.value as OrderType)}
                    >
                        <option value="all">All</option>
                        <option value="dine_in">Dine In</option>
                        <option value="takeaway">Takeaway</option>
                        <option value="delivery">Delivery</option>
                        <option value="b2b">B2B</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className={labelClasses} htmlFor="payment-status">
                        <CreditCard size={10} /> Payment
                    </label>
                    <select
                        id="payment-status"
                        className={inputClasses}
                        value={paymentFilter}
                        onChange={(e) => onPaymentChange(e.target.value as PaymentStatus)}
                    >
                        <option value="all">All</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex gap-2 items-end flex-wrap mb-6">
                {ORDER_STATUSES.map(status => (
                    <button
                        key={status}
                        className={cn(
                            'py-1.5 px-4 rounded-full text-sm font-medium cursor-pointer transition-all duration-150 border',
                            statusFilter === status
                                ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)] font-bold'
                                : 'bg-transparent border-white/10 text-[var(--theme-text-muted)] hover:border-[var(--color-gold)]/40 hover:text-white'
                        )}
                        onClick={() => onStatusChange(status)}
                    >
                        {status === 'all' ? 'All' : getStatusLabel(status)}
                    </button>
                ))}
            </div>
        </>
    );
};

export default OrdersFilters;
