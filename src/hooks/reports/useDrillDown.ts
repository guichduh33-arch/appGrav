import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface DrillLevel {
  level: string;
  params: Record<string, string>;
}

interface UseDrillDownOptions {
  /** Base level name (e.g., "Daily Sales") */
  baseLevelName: string;
  /** Whether to sync with URL search params */
  syncWithUrl?: boolean;
}

interface UseDrillDownResult {
  /** Current drill stack */
  drillStack: DrillLevel[];
  /** Current drill depth (0 = base level) */
  depth: number;
  /** Whether currently in a drill-down view */
  isDrilledIn: boolean;
  /** Current level params (or null if at base) */
  currentParams: Record<string, string> | null;
  /** Drill into a new level */
  drillInto: (level: string, params: Record<string, string>) => void;
  /** Go back one level */
  drillBack: () => void;
  /** Reset to base level */
  drillReset: () => void;
  /** Breadcrumb levels for ReportBreadcrumb component */
  breadcrumbLevels: { label: string; onClick?: () => void }[];
}

/**
 * Hook for managing drill-down state in reports
 * Supports multi-level drill-down with URL sync
 */
export function useDrillDown({
  baseLevelName,
  syncWithUrl = true,
}: UseDrillDownOptions): UseDrillDownResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [drillStack, setDrillStack] = useState<DrillLevel[]>([]);

  // Parse URL params on mount
  useEffect(() => {
    if (!syncWithUrl) return;

    const drillParam = searchParams.get('drill');
    if (drillParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(drillParam));
        if (Array.isArray(parsed)) {
          setDrillStack(parsed);
        }
      } catch {
        // Invalid param, ignore
      }
    }
  }, []);

  // Sync state to URL
  const syncToUrl = useCallback(
    (stack: DrillLevel[]) => {
      if (!syncWithUrl) return;

      if (stack.length === 0) {
        searchParams.delete('drill');
      } else {
        searchParams.set('drill', encodeURIComponent(JSON.stringify(stack)));
      }
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams, syncWithUrl]
  );

  const drillInto = useCallback(
    (level: string, params: Record<string, string>) => {
      const newStack = [...drillStack, { level, params }];
      setDrillStack(newStack);
      syncToUrl(newStack);
    },
    [drillStack, syncToUrl]
  );

  const drillBack = useCallback(() => {
    if (drillStack.length === 0) return;
    const newStack = drillStack.slice(0, -1);
    setDrillStack(newStack);
    syncToUrl(newStack);
  }, [drillStack, syncToUrl]);

  const drillReset = useCallback(() => {
    setDrillStack([]);
    syncToUrl([]);
  }, [syncToUrl]);

  const depth = drillStack.length;
  const isDrilledIn = depth > 0;
  const currentParams = isDrilledIn ? drillStack[depth - 1].params : null;

  // Build breadcrumb levels
  const breadcrumbLevels = useMemo(() => {
    const levels: { label: string; onClick?: () => void }[] = [
      {
        label: baseLevelName,
        onClick: isDrilledIn ? drillReset : undefined,
      },
    ];

    drillStack.forEach((item, index) => {
      const isLast = index === drillStack.length - 1;
      levels.push({
        label: item.level,
        onClick: isLast
          ? undefined
          : () => {
              const newStack = drillStack.slice(0, index + 1);
              setDrillStack(newStack);
              syncToUrl(newStack);
            },
      });
    });

    return levels;
  }, [baseLevelName, drillStack, isDrilledIn, drillReset, syncToUrl]);

  return {
    drillStack,
    depth,
    isDrilledIn,
    currentParams,
    drillInto,
    drillBack,
    drillReset,
    breadcrumbLevels,
  };
}
