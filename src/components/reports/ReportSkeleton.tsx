import { Skeleton as SkeletonBox } from '@/components/ui/Skeleton';

export function KPICardSkeleton() {
  return (
    <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
      <div className="flex justify-between items-start mb-4">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonBox className="h-8 w-32 mb-2" />
      <SkeletonBox className="h-4 w-20" />
    </div>
  );
}

export function KPIGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <SkeletonBox className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({
  rows = 10,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="flex px-4 py-3 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <table className="w-full">
        <tbody className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton({
  height = 300,
  showLegend = true,
}: {
  height?: number;
  showLegend?: boolean;
}) {
  return (
    <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <SkeletonBox className="h-5 w-40 mb-2" />
          <SkeletonBox className="h-4 w-56" />
        </div>
        <SkeletonBox className="h-8 w-28 rounded-md" />
      </div>
      {/* Chart area */}
      <SkeletonBox className="w-full rounded-lg" style={{ height }} />
      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-3 w-3 rounded-full" />
            <SkeletonBox className="h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-3 w-3 rounded-full" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportSkeleton({
  variant = 'full',
}: {
  variant?: 'kpi' | 'table' | 'chart' | 'full';
}) {
  if (variant === 'kpi') {
    return <KPIGridSkeleton />;
  }

  if (variant === 'table') {
    return <TableSkeleton />;
  }

  if (variant === 'chart') {
    return <ChartSkeleton />;
  }

  // Full variant: KPIs + Chart + Table
  return (
    <div className="space-y-6">
      <KPIGridSkeleton />
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  );
}

export default ReportSkeleton;
