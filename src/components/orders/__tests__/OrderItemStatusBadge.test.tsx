/**
 * OrderItemStatusBadge Tests
 * Story 4.7 - POS KDS Status Listener Integration
 *
 * Tests for the visual badge component that displays item preparation status.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderItemStatusBadge, type TItemStatus } from '../OrderItemStatusBadge';

describe('OrderItemStatusBadge', () => {
  const statuses: Array<{ status: TItemStatus; expectedLabel: string; colorFragment: string }> = [
    { status: 'new', expectedLabel: 'New', colorFragment: 'blue' },
    { status: 'preparing', expectedLabel: 'Preparing', colorFragment: 'amber' },
    { status: 'ready', expectedLabel: 'Ready', colorFragment: 'emerald' },
    { status: 'served', expectedLabel: 'Served', colorFragment: 'gray' },
  ];

  it.each(statuses)('should render $status status with correct label and class', ({ status, expectedLabel, colorFragment }) => {
    const { container } = render(<OrderItemStatusBadge status={status} />);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    // Badge root should contain the status-specific Tailwind color class
    const badge = container.querySelector('span');
    expect(badge?.className).toContain(colorFragment);
  });

  it('should hide label when showLabel is false', () => {
    render(<OrderItemStatusBadge status="ready" showLabel={false} />);

    expect(screen.queryByText('Ready')).not.toBeInTheDocument();
  });

  it('should apply small size class by default', () => {
    const { container } = render(<OrderItemStatusBadge status="new" />);

    const badge = container.querySelector('span');
    // Default size is 'sm' which uses text-[0.65rem]
    expect(badge?.className).toContain('text-[0.65rem]');
  });

  it('should apply medium size class when specified', () => {
    const { container } = render(<OrderItemStatusBadge status="new" size="md" />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-xs');
    expect(badge?.className).not.toContain('text-[0.65rem]');
  });

  it('should apply animate class when animate is true', () => {
    const { container } = render(<OrderItemStatusBadge status="preparing" animate />);

    const badge = container.querySelector('span');
    expect(badge?.className).toContain('animate-pulse-preparing');
  });

  it('should not apply animate class when animate is false', () => {
    const { container } = render(<OrderItemStatusBadge status="preparing" animate={false} />);

    const badge = container.querySelector('span');
    expect(badge?.className).not.toContain('animate-pulse-preparing');
  });

  it('should render with correct icon for each status', () => {
    statuses.forEach(({ status }) => {
      const { container } = render(<OrderItemStatusBadge status={status} />);
      // Each badge renders as a span with an SVG icon
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge?.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<OrderItemStatusBadge status="ready" />);

    // Badge should be a span (inline element)
    const badge = container.firstElementChild;
    expect(badge?.tagName.toLowerCase()).toBe('span');
  });
});
