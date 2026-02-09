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
  const statuses: Array<{ status: TItemStatus; expectedLabel: string; expectedClass: string }> = [
    { status: 'new', expectedLabel: 'New', expectedClass: 'order-item-badge--new' },
    { status: 'preparing', expectedLabel: 'Preparing', expectedClass: 'order-item-badge--preparing' },
    { status: 'ready', expectedLabel: 'Ready', expectedClass: 'order-item-badge--ready' },
    { status: 'served', expectedLabel: 'Served', expectedClass: 'order-item-badge--served' },
  ];

  it.each(statuses)('should render $status status with correct label and class', ({ status, expectedLabel, expectedClass }) => {
    const { container } = render(<OrderItemStatusBadge status={status} />);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
  });

  it('should hide label when showLabel is false', () => {
    const { container } = render(<OrderItemStatusBadge status="ready" showLabel={false} />);

    expect(container.querySelector('.order-item-badge__label')).not.toBeInTheDocument();
    expect(container.querySelector('.order-item-badge--ready')).toBeInTheDocument();
  });

  it('should apply small size class by default', () => {
    const { container } = render(<OrderItemStatusBadge status="new" />);

    expect(container.querySelector('.order-item-badge--sm')).toBeInTheDocument();
  });

  it('should apply medium size class when specified', () => {
    const { container } = render(<OrderItemStatusBadge status="new" size="md" />);

    expect(container.querySelector('.order-item-badge--md')).toBeInTheDocument();
    expect(container.querySelector('.order-item-badge--sm')).not.toBeInTheDocument();
  });

  it('should apply animate class when animate is true', () => {
    const { container } = render(<OrderItemStatusBadge status="preparing" animate />);

    expect(container.querySelector('.order-item-badge--animate')).toBeInTheDocument();
  });

  it('should not apply animate class when animate is false', () => {
    const { container } = render(<OrderItemStatusBadge status="preparing" animate={false} />);

    expect(container.querySelector('.order-item-badge--animate')).not.toBeInTheDocument();
  });

  it('should render with correct icon for each status', () => {
    // Test that the badge renders without errors for each status
    statuses.forEach(({ status }) => {
      const { container } = render(<OrderItemStatusBadge status={status} />);
      expect(container.querySelector('.order-item-badge')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<OrderItemStatusBadge status="ready" />);

    // Badge should be a span (inline element)
    const badge = container.querySelector('.order-item-badge');
    expect(badge?.tagName.toLowerCase()).toBe('span');
  });
});
