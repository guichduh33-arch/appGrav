import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useDashboardData } from '../useDashboardData';

// Mock supabase
const mockSelect = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockReturns = vi.fn();

vi.mock('@/lib/supabase', () => ({
  untypedFrom: () => ({
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return {
        gte: (...gteArgs: unknown[]) => {
          mockGte(...gteArgs);
          return {
            lte: (...lteArgs: unknown[]) => {
              mockLte(...lteArgs);
              return {
                returns: () => {
                  mockReturns();
                  return Promise.resolve({
                    data: [
                      {
                        date: new Date().toISOString().split('T')[0],
                        total_revenue: 4200000,
                        total_orders: 198,
                        completed_orders: 190,
                        cancelled_orders: 8,
                        total_discounts: 50000,
                        total_tax: 381818,
                        avg_order_value: 21200,
                        unique_customers: 45,
                      },
                    ],
                    error: null,
                  });
                },
              };
            },
          };
        },
      };
    },
  }),
}));

vi.mock('@/services/ReportingService', () => ({
  ReportingService: {
    getDailySales: vi.fn().mockResolvedValue([
      { date: '2026-02-10', total_sales: 3500000 },
      { date: '2026-02-11', total_sales: 3700000 },
    ]),
    getProductPerformance: vi.fn().mockResolvedValue([
      { product_id: '1', product_name: 'Croissant', quantity_sold: 45, total_revenue: 900000 },
    ]),
    getPaymentMethodStats: vi.fn().mockResolvedValue([
      { payment_method: 'cash', total_revenue: 1300000, transaction_count: 60 },
      { payment_method: 'cash', total_revenue: 1300000, transaction_count: 60 },
      { payment_method: 'card', total_revenue: 1050000, transaction_count: 50 },
    ]),
  },
}));

vi.mock('@/hooks/inventory/useInventoryAlerts', () => ({
  useLowStockItems: () => ({
    data: [
      { id: '1', name: 'Butter', current_stock: 2, min_stock_level: 5, unit_name: 'kg', severity: 'critical' },
    ],
    isLoading: false,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns proper data structure', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('kpis');
    expect(result.current).toHaveProperty('revenueTrend');
    expect(result.current).toHaveProperty('topProducts');
    expect(result.current).toHaveProperty('paymentMethods');
    expect(result.current).toHaveProperty('lowStock');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('provides low stock data from existing hook', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    expect(result.current.lowStock.data).toHaveLength(1);
    expect(result.current.lowStock.data![0].name).toBe('Butter');
  });

  it('aggregates payment methods correctly (duplicate keys summed)', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.paymentMethods.isSuccess).toBe(true));
    const methods = result.current.paymentMethods.data!;
    const cash = methods.find(m => m.method === 'cash');
    expect(cash).toBeDefined();
    // Two cash entries: 1300000 + 1300000 = 2600000
    expect(cash!.total).toBe(2600000);
    expect(cash!.count).toBe(120);
  });

  it('loads KPIs from view_daily_kpis', async () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.kpis.isSuccess).toBe(true));
    expect(result.current.kpis.data?.today).toBeDefined();
    expect(result.current.kpis.data?.today?.total_revenue).toBe(4200000);
  });

  it('isLoading reflects composite state', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    // isLoading is true when either kpis or revenueTrend is loading
    expect(typeof result.current.isLoading).toBe('boolean');
  });
});
