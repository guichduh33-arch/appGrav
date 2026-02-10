import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  ReportSkeleton,
  KPICardSkeleton,
  KPIGridSkeleton,
  TableSkeleton,
  ChartSkeleton,
} from '../ReportSkeleton';

describe('ReportSkeleton', () => {
  describe('KPICardSkeleton', () => {
    it('renders with animate-pulse elements', () => {
      const { container } = render(<KPICardSkeleton />);
      const pulseElements = container.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('renders card container with border', () => {
      const { container } = render(<KPICardSkeleton />);
      expect(container.querySelector('.border')).toBeInTheDocument();
    });
  });

  describe('KPIGridSkeleton', () => {
    it('renders 4 KPI cards by default', () => {
      const { container } = render(<KPIGridSkeleton />);
      const cards = container.querySelectorAll('.border');
      expect(cards).toHaveLength(4);
    });

    it('renders custom count of KPI cards', () => {
      const { container } = render(<KPIGridSkeleton count={3} />);
      const cards = container.querySelectorAll('.border');
      expect(cards).toHaveLength(3);
    });

    it('uses responsive grid layout', () => {
      const { container } = render(<KPIGridSkeleton />);
      const grid = container.firstElementChild;
      expect(grid).toHaveClass('grid');
    });
  });

  describe('TableSkeleton', () => {
    it('renders header row with skeleton elements', () => {
      const { container } = render(<TableSkeleton />);
      const header = container.querySelector('.bg-gray-50\\/50');
      expect(header).toBeInTheDocument();
    });

    it('renders 10 rows by default', () => {
      const { container } = render(<TableSkeleton />);
      const rows = container.querySelectorAll('tr');
      expect(rows).toHaveLength(10);
    });

    it('renders custom rows count', () => {
      const { container } = render(<TableSkeleton rows={5} />);
      const rows = container.querySelectorAll('tr');
      expect(rows).toHaveLength(5);
    });

    it('renders correct number of columns per row', () => {
      const { container } = render(<TableSkeleton columns={3} />);
      const firstRow = container.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td');
      expect(cells).toHaveLength(3);
    });
  });

  describe('ChartSkeleton', () => {
    it('renders chart area with specified height', () => {
      const { container } = render(<ChartSkeleton height={400} />);
      const chartArea = container.querySelector('[style]');
      expect(chartArea).toHaveStyle({ height: '400px' });
    });

    it('renders legend by default', () => {
      const { container } = render(<ChartSkeleton />);
      const legendItems = container.querySelectorAll('.rounded-full');
      expect(legendItems.length).toBeGreaterThan(0);
    });

    it('hides legend when showLegend=false', () => {
      const { container } = render(<ChartSkeleton showLegend={false} />);
      const legendItems = container.querySelectorAll('.rounded-full');
      expect(legendItems).toHaveLength(0);
    });
  });

  describe('ReportSkeleton composite', () => {
    it('renders full variant with KPIs + Chart + Table', () => {
      const { container } = render(<ReportSkeleton variant="full" />);
      // Should have grid for KPIs, chart container, and table container
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelectorAll('table')).toHaveLength(1);
    });

    it('renders kpi variant only', () => {
      const { container } = render(<ReportSkeleton variant="kpi" />);
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelector('table')).not.toBeInTheDocument();
    });

    it('renders table variant only', () => {
      const { container } = render(<ReportSkeleton variant="table" />);
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders chart variant only', () => {
      const { container } = render(<ReportSkeleton variant="chart" />);
      const chartArea = container.querySelector('[style]');
      expect(chartArea).toBeInTheDocument();
      expect(container.querySelector('table')).not.toBeInTheDocument();
    });

    it('defaults to full variant', () => {
      const { container } = render(<ReportSkeleton />);
      expect(container.querySelector('.grid')).toBeInTheDocument();
      expect(container.querySelectorAll('table')).toHaveLength(1);
    });
  });
});
