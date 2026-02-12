/**
 * OrderItemStatusBadge Component
 * Story 4.7 - POS KDS Status Listener Integration
 *
 * Displays a colored badge indicating the preparation status of an order item
 * Colors: new (blue), preparing (yellow), ready (green), served (gray)
 */

import { ChefHat, CheckCircle, Clock, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TItemStatus = 'new' | 'preparing' | 'ready' | 'served';

interface OrderItemStatusBadgeProps {
  status: TItemStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  animate?: boolean;
}

const STATUS_CONFIG: Record<TItemStatus, { label: string; icon: React.ReactNode; colors: string; animateClass?: string }> = {
  new: {
    label: 'New',
    icon: <Clock size={12} />,
    colors: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  },
  preparing: {
    label: 'Preparing',
    icon: <ChefHat size={12} />,
    colors: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    animateClass: 'animate-pulse-preparing',
  },
  ready: {
    label: 'Ready',
    icon: <CheckCircle size={12} />,
    colors: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    animateClass: 'animate-pulse-ready',
  },
  served: {
    label: 'Served',
    icon: <UtensilsCrossed size={12} />,
    colors: 'bg-gray-500/15 text-gray-500 border-gray-500/30',
  },
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[0.65rem]',
  md: 'px-2.5 py-1 text-xs',
} as const;

export function OrderItemStatusBadge({
  status,
  showLabel = true,
  size = 'sm',
  animate = false,
}: OrderItemStatusBadgeProps) {
  if (!(status in STATUS_CONFIG)) {
    console.warn(`[OrderItemStatusBadge] Invalid status "${status}", falling back to "new"`);
  }
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[0.7rem] font-semibold whitespace-nowrap transition-all duration-300 border',
        config.colors,
        SIZE_CLASSES[size],
        animate && config.animateClass,
        'motion-reduce:!animate-none'
      )}
    >
      {config.icon}
      {showLabel && <span className="leading-none">{config.label}</span>}
    </span>
  );
}

export default OrderItemStatusBadge;
