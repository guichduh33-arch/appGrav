import { UtensilsCrossed, Package, Bike, Building2, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'b2b';

interface OrderTypeIconProps extends Omit<LucideProps, 'ref'> {
  type: OrderType;
  showLabel?: boolean;
  labelClassName?: string;
}

const config: Record<OrderType, { icon: typeof UtensilsCrossed; label: string; color: string }> = {
  dine_in: { icon: UtensilsCrossed, label: 'Dine In', color: '#22C55E' },
  takeaway: { icon: Package, label: 'Takeaway', color: '#F59E0B' },
  delivery: { icon: Bike, label: 'Delivery', color: '#3B82F6' },
  b2b: { icon: Building2, label: 'B2B', color: '#8B5CF6' },
};

export function OrderTypeIcon({
  type,
  showLabel = false,
  labelClassName,
  className,
  size = 18,
  ...props
}: OrderTypeIconProps) {
  const { icon: Icon, label, color } = config[type] ?? config.dine_in;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon size={size} style={{ color }} strokeWidth={2} {...props} />
      {showLabel && (
        <span className={cn('text-sm', labelClassName)} style={{ color }}>
          {label}
        </span>
      )}
    </span>
  );
}

/** Get just the color for an order type */
export function getOrderTypeColor(type: OrderType): string {
  return config[type]?.color ?? config.dine_in.color;
}

/** Get just the label for an order type */
export function getOrderTypeLabel(type: OrderType): string {
  return config[type]?.label ?? config.dine_in.label;
}
