/**
 * OrderItemStatusBadge Component
 * Story 4.7 - POS KDS Status Listener Integration
 *
 * Displays a colored badge indicating the preparation status of an order item
 * Colors: new (blue), preparing (yellow), ready (green), served (gray)
 */

import { ChefHat, CheckCircle, Clock, UtensilsCrossed } from 'lucide-react';
import './OrderItemStatusBadge.css';

export type TItemStatus = 'new' | 'preparing' | 'ready' | 'served';

interface OrderItemStatusBadgeProps {
  status: TItemStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  animate?: boolean;
}

const STATUS_CONFIG: Record<TItemStatus, { label: string; icon: React.ReactNode; className: string }> = {
  new: {
    label: 'Nouveau',
    icon: <Clock size={12} />,
    className: 'order-item-badge--new',
  },
  preparing: {
    label: 'En prépa.',
    icon: <ChefHat size={12} />,
    className: 'order-item-badge--preparing',
  },
  ready: {
    label: 'Prêt',
    icon: <CheckCircle size={12} />,
    className: 'order-item-badge--ready',
  },
  served: {
    label: 'Servi',
    icon: <UtensilsCrossed size={12} />,
    className: 'order-item-badge--served',
  },
};

export function OrderItemStatusBadge({
  status,
  showLabel = true,
  size = 'sm',
  animate = false,
}: OrderItemStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;

  const classNames = [
    'order-item-badge',
    config.className,
    `order-item-badge--${size}`,
    animate && 'order-item-badge--animate',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {config.icon}
      {showLabel && <span className="order-item-badge__label">{config.label}</span>}
    </span>
  );
}

export default OrderItemStatusBadge;
