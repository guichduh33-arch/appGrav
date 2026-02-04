/**
 * PendingSyncCounter Component Tests (Story 3.8)
 *
 * Tests for the badge counter component that displays
 * pending sync items in the header.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PendingSyncCounter } from '../PendingSyncCounter';

// Mock useSyncQueue hook
const mockUseSyncQueue = vi.fn();
vi.mock('@/hooks/useSyncQueue', () => ({
  useSyncQueue: () => mockUseSyncQueue(),
}));

// Mock PendingSyncPanel
vi.mock('../PendingSyncPanel', () => ({
  PendingSyncPanel: ({ open }: { open: boolean }) => (
    open ? <div data-testid="sync-panel">Panel Open</div> : null
  ),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('PendingSyncCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when pendingTotal is 0 and not syncing (AC6)', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 0,
      counts: { pending: 0, syncing: 0, failed: 0 },
      isSyncing: false,
    });

    const { container } = render(<PendingSyncCounter />);

    expect(container.firstChild).toBeNull();
  });

  it('should render badge when pendingTotal > 0', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 5,
      counts: { pending: 3, syncing: 1, failed: 1 },
      isSyncing: false,
    });

    render(<PendingSyncCounter />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should show syncing animation when isSyncing is true', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 3,
      counts: { pending: 3, syncing: 0, failed: 0 },
      isSyncing: true,
    });

    render(<PendingSyncCounter />);

    // Check for the animated loader icon
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should render when syncing even if pendingTotal is 0', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 0,
      counts: { pending: 0, syncing: 0, failed: 0 },
      isSyncing: true,
    });

    const { container } = render(<PendingSyncCounter />);

    expect(container.firstChild).not.toBeNull();
  });

  it('should show orange badge when there are failed items', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 3,
      counts: { pending: 1, syncing: 0, failed: 2 },
      isSyncing: false,
    });

    render(<PendingSyncCounter />);

    // Check for orange styling on badge
    const badge = screen.getByText('3');
    expect(badge).toHaveClass('bg-orange-500');
  });

  it('should show CloudOff icon when there are failed items', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 2,
      counts: { pending: 0, syncing: 0, failed: 2 },
      isSyncing: false,
    });

    render(<PendingSyncCounter />);

    // CloudOff icon should be shown (has text-orange-500 class)
    const icon = document.querySelector('.text-orange-500');
    expect(icon).toBeInTheDocument();
  });

  it('should open panel when clicked', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 5,
      counts: { pending: 5, syncing: 0, failed: 0 },
      isSyncing: false,
    });

    render(<PendingSyncCounter />);

    // Click the button
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Panel should be visible
    expect(screen.getByTestId('sync-panel')).toBeInTheDocument();
  });

  it('should have correct title attribute with pending count', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 7,
      counts: { pending: 5, syncing: 1, failed: 1 },
      isSyncing: false,
    });

    render(<PendingSyncCounter />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', '7 pending');
  });

  it('should apply custom className', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 3,
      counts: { pending: 3, syncing: 0, failed: 0 },
      isSyncing: false,
    });

    render(<PendingSyncCounter className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should show blue badge for pending-only items (no failures)', () => {
    mockUseSyncQueue.mockReturnValue({
      pendingTotal: 4,
      counts: { pending: 4, syncing: 0, failed: 0 },
      isSyncing: false,
    });

    render(<PendingSyncCounter />);

    const badge = screen.getByText('4');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).not.toHaveClass('bg-orange-500');
  });
});
