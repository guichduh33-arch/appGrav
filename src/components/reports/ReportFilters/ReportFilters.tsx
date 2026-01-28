import { Filter, X, Layers, Package, User, CreditCard, Users } from 'lucide-react';
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
    label: 'Catégorie',
    icon: <Layers className="w-4 h-4" />,
    placeholder: 'Toutes les catégories',
  },
  product: {
    label: 'Produit',
    icon: <Package className="w-4 h-4" />,
    placeholder: 'Tous les produits',
  },
  staff: {
    label: 'Employé',
    icon: <User className="w-4 h-4" />,
    placeholder: 'Tous les employés',
  },
  payment_method: {
    label: 'Paiement',
    icon: <CreditCard className="w-4 h-4" />,
    placeholder: 'Tous les modes',
  },
  customer: {
    label: 'Client',
    icon: <Users className="w-4 h-4" />,
    placeholder: 'Tous les clients',
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
      default:
        return [];
    }
  };

  return (
    <div className={className}>
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-gray-500 pb-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtres</span>
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
              text-sm text-gray-600 hover:text-gray-800
              bg-gray-100 hover:bg-gray-200
              rounded-lg transition-colors
            "
          >
            <X className="w-4 h-4" />
            Effacer tout
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
                  bg-blue-50 text-blue-700 text-sm rounded-full
                "
              >
                <span className="text-blue-500">{config.icon}</span>
                <span className="font-medium">{config.label}:</span>
                <span>{filter.label}</span>
                <button
                  type="button"
                  onClick={() => clearFilter(filter.type)}
                  className="ml-0.5 p-0.5 hover:bg-blue-100 rounded-full"
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
