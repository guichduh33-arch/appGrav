import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportPlaceholder } from '../ReportPlaceholder';

describe('ReportPlaceholder', () => {
  it('renders title', () => {
    render(<ReportPlaceholder title="Sales By Date" />);
    expect(screen.getByText('Sales By Date')).toBeInTheDocument();
  });

  it('renders default description when none provided', () => {
    render(<ReportPlaceholder title="Test Report" />);
    expect(screen.getByText('This report is planned for a future release.')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(
      <ReportPlaceholder
        title="Expenses"
        description="Expenses tracking will be available when the Accounting module is implemented."
      />
    );
    expect(screen.getByText('Expenses tracking will be available when the Accounting module is implemented.')).toBeInTheDocument();
  });

  it('renders Construction icon', () => {
    const { container } = render(<ReportPlaceholder title="Test" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders suggested report button when provided', () => {
    const onNavigate = vi.fn();
    render(
      <ReportPlaceholder
        title="Test"
        suggestedReport={{ id: 'dashboard', title: 'General Dashboard' }}
        onNavigateToReport={onNavigate}
      />
    );
    const btn = screen.getByText(/View General Dashboard instead/i);
    expect(btn).toBeInTheDocument();
  });

  it('calls onNavigateToReport when suggested button clicked', () => {
    const onNavigate = vi.fn();
    render(
      <ReportPlaceholder
        title="Test"
        suggestedReport={{ id: 'dashboard', title: 'General Dashboard' }}
        onNavigateToReport={onNavigate}
      />
    );
    const btn = screen.getByText(/View General Dashboard instead/i);
    fireEvent.click(btn);
    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });

  it('does not render suggested button when no suggestedReport', () => {
    render(<ReportPlaceholder title="Test" />);
    expect(screen.queryByText(/instead/i)).not.toBeInTheDocument();
  });

  it('does not render suggested button when no onNavigateToReport', () => {
    render(
      <ReportPlaceholder
        title="Test"
        suggestedReport={{ id: 'dashboard', title: 'General Dashboard' }}
      />
    );
    expect(screen.queryByText(/instead/i)).not.toBeInTheDocument();
  });
});
