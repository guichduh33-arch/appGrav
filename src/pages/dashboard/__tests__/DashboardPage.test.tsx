import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

const mockKpis = {
  data: {
    today: {
      date: '2026-02-12',
      total_revenue: 4200000,
      total_orders: 198,
      completed_orders: 190,
      cancelled_orders: 8,
      total_discounts: 50000,
      total_tax: 381818,
      avg_order_value: 21200,
      unique_customers: 45,
    },
    yesterday: {
      date: '2026-02-11',
      total_revenue: 3700000,
      total_orders: 180,
      completed_orders: 175,
      cancelled_orders: 5,
      total_discounts: 40000,
      total_tax: 336364,
      avg_order_value: 20600,
      unique_customers: 42,
    },
  },
  isLoading: false,
  dataUpdatedAt: Date.now(),
};

const mockRevenueTrend = {
  data: [
    { date: '2026-02-10', total_sales: 3500000 },
    { date: '2026-02-11', total_sales: 3700000 },
    { date: '2026-02-12', total_sales: 4200000 },
  ],
  isLoading: false,
};

const mockTopProducts = {
  data: [
    { product_id: '1', product_name: 'Croissant', quantity_sold: 45, total_revenue: 900000 },
    { product_id: '2', product_name: 'Baguette', quantity_sold: 38, total_revenue: 760000 },
    { product_id: '3', product_name: 'Pain au Chocolat', quantity_sold: 25, total_revenue: 625000 },
  ],
  isLoading: false,
};

const mockPaymentMethods = {
  data: [
    { method: 'cash', total: 2600000, count: 120 },
    { method: 'card', total: 1050000, count: 50 },
    { method: 'qris', total: 550000, count: 28 },
  ],
  isLoading: false,
};

const mockLowStock = {
  data: [
    { id: '1', name: 'Butter', current_stock: 2, min_stock_level: 5, unit_name: 'kg', severity: 'critical' },
    { id: '2', name: 'Flour', current_stock: 8, min_stock_level: 10, unit_name: 'kg', severity: 'warning' },
  ],
  isLoading: false,
};

const mockDashboardData = {
  kpis: mockKpis,
  revenueTrend: mockRevenueTrend,
  topProducts: mockTopProducts,
  paymentMethods: mockPaymentMethods,
  lowStock: mockLowStock,
  isLoading: false,
};

vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: () => mockDashboardData,
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { name: 'Admin', display_name: 'Admin User', role: 'admin' } }),
}));

vi.mock('@/utils/helpers', () => ({
  formatCurrency: (v: number) => `Rp${(v / 1000).toFixed(0)}K`,
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Executive Summary header', () => {
    renderDashboard();
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  it('renders greeting with user name', () => {
    renderDashboard();
    expect(screen.getByText(/Admin User/)).toBeInTheDocument();
  });

  it('renders Stitch-style KPI cards', () => {
    renderDashboard();
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('Active Orders')).toBeInTheDocument();
    expect(screen.getByText('Stock Alerts')).toBeInTheDocument();
    expect(screen.getByText('Avg Order')).toBeInTheDocument();
  });

  it('renders KPI values from data', () => {
    renderDashboard();
    // formatCurrency mock returns RpXK
    expect(screen.getByText('Rp4200K')).toBeInTheDocument(); // total_revenue
    expect(screen.getByText('198')).toBeInTheDocument(); // total_orders
    expect(screen.getByText('Rp21K')).toBeInTheDocument(); // avg_order_value
  });

  it('renders Sales Performance chart', () => {
    renderDashboard();
    expect(screen.getByText('Sales Performance')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders top products section', () => {
    renderDashboard();
    expect(screen.getByText('Top Products Today')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
    expect(screen.getByText('Baguette')).toBeInTheDocument();
    expect(screen.getByText('Pain au Chocolat')).toBeInTheDocument();
  });

  it('renders payment methods donut', () => {
    renderDashboard();
    expect(screen.getByText('Payment Methods (30 Days)')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('cash')).toBeInTheDocument();
    expect(screen.getByText('card')).toBeInTheDocument();
    expect(screen.getByText('qris')).toBeInTheDocument();
  });

  it('renders Inventory Monitor with items', () => {
    renderDashboard();
    expect(screen.getByText('Inventory Monitor')).toBeInTheDocument();
    expect(screen.getByText('Butter')).toBeInTheDocument();
    expect(screen.getByText('Flour')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
  });

  it('renders inventory view all link', () => {
    renderDashboard();
    const link = screen.getByText('View all');
    expect(link.closest('a')).toHaveAttribute('href', '/inventory');
  });

  it('renders sync footer', () => {
    renderDashboard();
    expect(screen.getByText(/Sync Complete/)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard data refreshed/)).toBeInTheDocument();
  });

  describe('loading state', () => {
    it('shows skeletons when loading', () => {
      mockDashboardData.isLoading = true;
      mockDashboardData.kpis = { ...mockKpis, isLoading: true } as typeof mockKpis;
      const { container } = renderDashboard();
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
      // Reset
      mockDashboardData.isLoading = false;
      mockDashboardData.kpis = mockKpis;
    });
  });

  describe('empty state', () => {
    it('shows no data message when trend data is empty', () => {
      mockDashboardData.revenueTrend = { data: [], isLoading: false } as typeof mockRevenueTrend;
      renderDashboard();
      expect(screen.getByText('No data available')).toBeInTheDocument();
      mockDashboardData.revenueTrend = mockRevenueTrend;
    });

    it('shows no sales message when top products is empty', () => {
      mockDashboardData.topProducts = { data: [], isLoading: false } as typeof mockTopProducts;
      renderDashboard();
      expect(screen.getByText('No sales today yet')).toBeInTheDocument();
      mockDashboardData.topProducts = mockTopProducts;
    });

    it('shows healthy stock message when no alerts', () => {
      mockDashboardData.lowStock = { data: [], isLoading: false } as typeof mockLowStock;
      renderDashboard();
      expect(screen.getByText('All stock levels are healthy')).toBeInTheDocument();
      mockDashboardData.lowStock = mockLowStock;
    });
  });
});
