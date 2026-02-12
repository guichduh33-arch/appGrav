import { cn } from '@/lib/utils';

interface ISkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: ISkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted rounded', className)}
      style={style}
    />
  );
}
