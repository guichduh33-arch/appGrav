/**
 * OrderItemStatusBadge Component
 * Story 4.7 - POS KDS Status Listener Integration
 *
 * Displays a colored badge indicating the preparation status of an order item
 * Colors: new (blue), preparing (amber), ready (emerald), served (gray)
 */

import { ChefHat, CheckCircle, Clock, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logWarn } from '@/utils/logger'

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
    colors: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  preparing: {
    label: 'Preparing',
    icon: <ChefHat size={12} />,
    colors: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    animateClass: 'animate-pulse-preparing',
  },
  ready: {
    label: 'Ready',
    icon: <CheckCircle size={12} />,
    colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    animateClass: 'animate-pulse-ready',
  },
  served: {
    label: 'Served',
    icon: <UtensilsCrossed size={12} />,
    colors: 'bg-white/5 text-[var(--muted-smoke)] border-white/10',
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
    logWarn(`[OrderItemStatusBadge] Invalid status "${status}", falling back to "new"`);
  }
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap transition-all duration-300 border',
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
