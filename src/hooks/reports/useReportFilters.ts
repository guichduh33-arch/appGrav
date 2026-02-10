import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category, Product, Customer } from '@/types/database';

export type FilterType = 'category' | 'product' | 'staff' | 'payment_method' | 'customer' | 'order_type';

export interface FilterOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface ActiveFilter {
  type: FilterType;
  value: string;
  label: string;
}

export interface ReportFiltersState {
  category?: string;
  product?: string;
  staff?: string;
  payment_method?: string;
  customer?: string;
  order_type?: string;
}

export interface UseReportFiltersOptions {
  enabledFilters?: FilterType[];
  syncWithUrl?: boolean;
}

export interface UseReportFiltersReturn {
  filters: ReportFiltersState;
  activeFilters: ActiveFilter[];
  setFilter: (type: FilterType, value: string | undefined) => void;
  clearFilter: (type: FilterType) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  // Filter options
  categoryOptions: FilterOption[];
  productOptions: FilterOption[];
  staffOptions: FilterOption[];
  paymentMethodOptions: FilterOption[];
  customerOptions: FilterOption[];
  orderTypeOptions: FilterOption[];
  // Loading states
  isLoadingOptions: boolean;
}

const FILTER_URL_PARAMS: Record<FilterType, string> = {
  category: 'category',
  product: 'product',
  staff: 'staff',
  payment_method: 'payment',
  customer: 'customer',
  order_type: 'order_type',
};

const ORDER_TYPE_OPTIONS: FilterOption[] = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'b2b', label: 'B2B' },
];

export function useReportFilters(options: UseReportFiltersOptions = {}): UseReportFiltersReturn {
  const {
    enabledFilters = ['category', 'product', 'staff', 'payment_method', 'customer'],
    syncWithUrl = true,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL
  const getInitialFilters = useCallback((): ReportFiltersState => {
    if (!syncWithUrl) return {};

    const filters: ReportFiltersState = {};
    for (const filterType of enabledFilters) {
      const paramName = FILTER_URL_PARAMS[filterType];
      const value = searchParams.get(paramName);
      if (value) {
        filters[filterType] = value;
      }
    }
    return filters;
  }, [searchParams, syncWithUrl, enabledFilters]);

  const [filters, setFilters] = useState<ReportFiltersState>(getInitialFilters);

  // Sync with URL changes
  useEffect(() => {
    if (syncWithUrl) {
      setFilters(getInitialFilters());
    }
  }, [searchParams, getInitialFilters, syncWithUrl]);

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['report-filter-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data as Pick<Category, 'id' | 'name'>[];
    },
    enabled: enabledFilters.includes('category'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['report-filter-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as Pick<Product, 'id' | 'name' | 'sku'>[];
    },
    enabled: enabledFilters.includes('product'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch staff (users with cashier/barista/kitchen roles)
  const { data: staff = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['report-filter-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, display_name, role')
        .in('role', ['admin', 'manager', 'cashier', 'barista', 'kitchen'])
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: enabledFilters.includes('staff'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: isLoadingPayment } = useQuery({
    queryKey: ['report-filter-payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('id, code, name_fr, is_active')
        .eq('is_active', true)
        .order('name_fr');
      if (error) throw error;
      return data;
    },
    enabled: enabledFilters.includes('payment_method'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['report-filter-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .order('name')
        .limit(500);
      if (error) throw error;
      return data as Pick<Customer, 'id' | 'name' | 'phone'>[];
    },
    enabled: enabledFilters.includes('customer'),
    staleTime: 5 * 60 * 1000,
  });

  // Transform to options
  const categoryOptions: FilterOption[] = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const productOptions: FilterOption[] = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name, sublabel: p.sku || undefined })),
    [products]
  );

  const staffOptions: FilterOption[] = useMemo(
    () => staff.map((s) => ({ value: s.id, label: s.display_name || s.name || 'Unnamed', sublabel: s.role || undefined })),
    [staff]
  );

  const paymentMethodOptions: FilterOption[] = useMemo(
    () => paymentMethods.map((pm) => ({ value: pm.id, label: pm.name_fr })),
    [paymentMethods]
  );

  const customerOptions: FilterOption[] = useMemo(
    () => customers.map((c) => ({ value: c.id, label: c.name || 'Anonymous customer', sublabel: c.phone || undefined })),
    [customers]
  );

  const orderTypeOptions = ORDER_TYPE_OPTIONS;

  // Get label for a filter value
  const getLabelForFilter = useCallback(
    (type: FilterType, value: string): string => {
      switch (type) {
        case 'category':
          return categoryOptions.find((o) => o.value === value)?.label || value;
        case 'product':
          return productOptions.find((o) => o.value === value)?.label || value;
        case 'staff':
          return staffOptions.find((o) => o.value === value)?.label || value;
        case 'payment_method':
          return paymentMethodOptions.find((o) => o.value === value)?.label || value;
        case 'customer':
          return customerOptions.find((o) => o.value === value)?.label || value;
        case 'order_type':
          return orderTypeOptions.find((o) => o.value === value)?.label || value;
        default:
          return value;
      }
    },
    [categoryOptions, productOptions, staffOptions, paymentMethodOptions, customerOptions, orderTypeOptions]
  );

  // Active filters array for display
  const activeFilters: ActiveFilter[] = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => value)
      .map(([type, value]) => ({
        type: type as FilterType,
        value: value!,
        label: getLabelForFilter(type as FilterType, value!),
      }));
  }, [filters, getLabelForFilter]);

  const updateUrlParams = useCallback(
    (newFilters: ReportFiltersState) => {
      if (!syncWithUrl) return;

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);

        for (const filterType of enabledFilters) {
          const paramName = FILTER_URL_PARAMS[filterType];
          const value = newFilters[filterType];

          if (value) {
            newParams.set(paramName, value);
          } else {
            newParams.delete(paramName);
          }
        }

        return newParams;
      }, { replace: true });
    },
    [syncWithUrl, setSearchParams, enabledFilters]
  );

  const setFilter = useCallback(
    (type: FilterType, value: string | undefined) => {
      const newFilters = { ...filters, [type]: value };
      setFilters(newFilters);
      updateUrlParams(newFilters);
    },
    [filters, updateUrlParams]
  );

  const clearFilter = useCallback(
    (type: FilterType) => {
      setFilter(type, undefined);
    },
    [setFilter]
  );

  const clearAllFilters = useCallback(() => {
    const clearedFilters: ReportFiltersState = {};
    setFilters(clearedFilters);
    updateUrlParams(clearedFilters);
  }, [updateUrlParams]);

  const isLoadingOptions =
    isLoadingCategories || isLoadingProducts || isLoadingStaff || isLoadingPayment || isLoadingCustomers;

  return {
    filters,
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters: activeFilters.length > 0,
    categoryOptions,
    productOptions,
    staffOptions,
    paymentMethodOptions,
    customerOptions,
    orderTypeOptions,
    isLoadingOptions,
  };
}
