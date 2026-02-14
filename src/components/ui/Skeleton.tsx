import { cn } from '@/lib/utils';

interface ISkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'gold' | 'subtle';
}

export function Skeleton({ className, style, variant = 'default' }: ISkeletonProps) {
  return (
    <div
      className={cn(
        'rounded',
        variant === 'gold' ? 'skeleton-shimmer' :
        variant === 'subtle' ? 'skeleton-shimmer-subtle' :
        'skeleton-shimmer-subtle',
        className
      )}
      style={style}
    />
  );
}
