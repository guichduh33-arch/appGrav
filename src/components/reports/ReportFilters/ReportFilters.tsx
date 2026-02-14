import { Filter, X, Layers, Package, User, CreditCard, Users, ShoppingBag } from 'lucide-react';
import {
  FilterType,
  UseReportFiltersReturn,
} from '@/hooks/reports/useReportFilters';
import { FilterDropdown } from './FilterDropdown';

export interface ReportFiltersProps {
  filtersState: UseReportFiltersReturn;
  enabledFilters?: FilterType[];
  showActiveFilters?: boolean;
  className?: string;
}

const FILTER_CONFIGS: Record<
  FilterType,
  {
    label: string;
    icon: React.ReactNode;
    placeholder: string;
  }
> = {
  category: {
    label: 'Category',
    icon: <Layers className="w-4 h-4" />,
    placeholder: 'All categories',
  },
  product: {
    label: 'Product',
    icon: <Package className="w-4 h-4" />,
    placeholder: 'All products',
  },
  staff: {
    label: 'Staff',
    icon: <User className="w-4 h-4" />,
    placeholder: 'All staff',
  },
  payment_method: {
    label: 'Payment',
    icon: <CreditCard className="w-4 h-4" />,
    placeholder: 'All methods',
  },
  customer: {
    label: 'Customer',
    icon: <Users className="w-4 h-4" />,
    placeholder: 'All customers',
  },
  order_type: {
    label: 'Order Type',
    icon: <ShoppingBag className="w-4 h-4" />,
    placeholder: 'All types',
  },
};

export function ReportFilters({
  filtersState,
  enabledFilters = ['category', 'product', 'staff', 'payment_method'],
  showActiveFilters = true,
  className = '',
}: ReportFiltersProps) {
  const {
    filters,
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    categoryOptions,
    productOptions,
    staffOptions,
    paymentMethodOptions,
    customerOptions,
    orderTypeOptions,
    isLoadingOptions,
  } = filtersState;

  const getOptionsForFilter = (type: FilterType) => {
    switch (type) {
      case 'category':
        return categoryOptions;
      case 'product':
        return productOptions;
      case 'staff':
        return staffOptions;
      case 'payment_method':
        return paymentMethodOptions;
      case 'customer':
        return customerOptions;
      case 'order_type':
        return orderTypeOptions;
      default:
        return [];
    }
  };

  return (
    <div className={className}>
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-[var(--theme-text-muted)] pb-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {enabledFilters.map((filterType) => {
          const config = FILTER_CONFIGS[filterType];
          return (
            <FilterDropdown
              key={filterType}
              label={config.label}
              icon={config.icon}
              options={getOptionsForFilter(filterType)}
              value={filters[filterType]}
              onChange={(value) => setFilter(filterType, value)}
              placeholder={config.placeholder}
              disabled={isLoadingOptions}
            />
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="
              flex items-center gap-1 px-3 py-2 mb-0.5
              text-sm text-[var(--theme-text-muted)] hover:text-white
              bg-white/5 hover:bg-white/10
              rounded-xl transition-colors
            "
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Active Filters Pills */}
      {showActiveFilters && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeFilters.map((filter) => {
            const config = FILTER_CONFIGS[filter.type];
            return (
              <span
                key={`${filter.type}-${filter.value}`}
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-1
                  bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm rounded-full
                "
              >
                <span className="text-[var(--color-gold)]/70">{config.icon}</span>
                <span className="font-medium">{config.label}:</span>
                <span>{filter.label}</span>
                <button
                  type="button"
                  onClick={() => clearFilter(filter.type)}
                  className="ml-0.5 p-0.5 hover:bg-[var(--color-gold)]/20 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
